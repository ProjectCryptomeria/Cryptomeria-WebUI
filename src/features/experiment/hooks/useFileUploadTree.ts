import { useState, useRef } from 'react';

// --- File Upload Tree 内部で使用する型定義 ---

/**
 * processFilesで作成される、パス情報を持つファイル/エントリの型
 */
interface ProcessedFile {
  path: string; // webkitRelativePath または zip内のパス
  name: string;
  size: number; // バイト単位
}

/**
 * buildTreeFromProcessedFilesで構築される中間的なツリーノードの型
 * childrenがオブジェクト形式である点が特徴
 */
interface IntermediateFileNode {
  name: string;
  type: 'folder' | 'file';
  size: number; // バイト単位
  children?: { [key: string]: IntermediateFileNode };
}

/**
 * Hookのステート型
 */
interface UploadStats {
  count: number;
  sizeMB: number;
  tree: IntermediateFileNode | null; // anyをIntermediateFileNodeに変更
  treeOpen: boolean;
}

/**
 * Fileオブジェクトの非標準プロパティである webkitRelativePath を扱うための拡張型
 */
type FileWithRelativePath = File & { webkitRelativePath?: string };

// ---------------------------------------

/**
 * ファイルアップロードとツリー表示のためのHook
 * ZIPファイルとディレクトリアップロードをサポートし、ファイルツリーを構築します
 */
export const useFileUploadTree = (
  notify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void
) => {
  const [uploadStats, setUploadStats] = useState<UploadStats>({ // anyをUploadStatsに変更
    count: 0,
    sizeMB: 0,
    tree: null,
    treeOpen: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // files: any[] -> ProcessedFile[] に変更
  const buildTreeFromProcessedFiles = (
    files: ProcessedFile[],
    fileCount: number,
    totalSize: number
  ) => {
    // root: any -> IntermediateFileNode に変更
    const root: IntermediateFileNode = { name: 'root', children: {}, type: 'folder', size: 0 };

    // fileの型を ProcessedFile に変更
    files.forEach((file: ProcessedFile) => {
      // p: string は推論されるため削除
      const parts = file.path.split('/').filter(p => p.length > 0);
      let current: IntermediateFileNode = root; // currentの型をIntermediateFileNodeに指定

      // partの型を string に指定 (推論も可能だが明示)
      parts.forEach((part: string, index: number) => {
        // current.children が存在することを保証
        if (!current.children) {
          current.children = {};
        }

        // 既に同名のノードがあるか確認
        if (!current.children[part]) {
          // なければ作成（最後ならファイル、それ以外はフォルダ）
          if (index === parts.length - 1) {
            current.children[part] = { name: part, type: 'file', size: file.size };
          } else {
            current.children[part] = { name: part, children: {}, type: 'folder', size: 0 };
          }
        }
        // 参照を更新
        current = current.children[part];
      });
    });
    const sizeMB = parseFloat((totalSize / (1024 * 1024)).toFixed(2));
    setUploadStats({ count: fileCount, sizeMB, tree: root, treeOpen: true });
    notify(
      'success',
      'ファイル解析完了',
      `${fileCount} 個のファイルをローカルで処理しました (${sizeMB}MB)。`
    );
    return sizeMB;
  };

  const processFiles = async (fileList: File[]) => {
    // processedFiles: any[] -> ProcessedFile[] に変更
    const processedFiles: ProcessedFile[] = [];
    let totalSize = 0;
    let fileCount = 0;

    // JSZipは外部ライブラリであり、windowからアクセスするため as any を使用（外部型の管理に依存）
    const JSZip = (window as any).JSZip;

    for (const file of fileList as FileWithRelativePath[]) { // FileWithRelativePathにキャスト
      if (
        file.name.endsWith('.zip') ||
        file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed'
      ) {
        try {
          // zip: any の型は JSZip のインスタンス
          const zip = await JSZip.loadAsync(file);

          // 【修正】Zipファイル名（拡張子なし）を取得してルートフォルダ名とする
          const zipRootName = file.name.replace(/\.[^/.]+$/, '');

          // Zip内のファイルを列挙 (entries: any[])
          const entries = Object.keys(zip.files).map(name => zip.files[name]);

          for (const zipEntry of entries) { // zipEntry: any の型は JSZipObject
            if (!zipEntry.dir) {
              // ... (パスと名前の処理ロジック)
              const originalPath = zipEntry.name;
              const path = `${zipRootName}/${originalPath}`;
              const name = path.split('/').pop() || path;

              let size = 0;
              try {
                // ... (サイズ計算ロジック)
                const blob = await zipEntry.async('blob');
                size = blob.size;
              } catch (e) {
                console.warn('Failed to read zip entry size', e);
              }

              // ProcessedFile 型を push
              processedFiles.push({
                path: path,
                name: name,
                size: size,
              });
              fileCount++;
              totalSize += size;
            }
          }
        } catch (e) {
          console.error('Zip error:', e);
          notify('error', 'Zip解凍エラー', `${file.name} を解凍できませんでした`);
        }
      } else {
        // 通常ファイルの場合
        // ProcessedFile 型を push
        processedFiles.push({
          path: file.webkitRelativePath || file.name, // FileWithRelativePathからアクセス
          name: file.name,
          size: file.size,
        });
        totalSize += file.size;
        fileCount++;
      }
    }
    return buildTreeFromProcessedFiles(processedFiles, fileCount, totalSize);
  };

  return { uploadStats, setUploadStats, fileInputRef, processFiles };
};