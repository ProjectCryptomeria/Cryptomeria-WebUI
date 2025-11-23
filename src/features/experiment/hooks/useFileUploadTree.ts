// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/features/experiment/hooks/useFileUploadTree.ts

import { useState, useRef } from 'react';

/**
 * ファイルアップロードとツリー表示のためのHook
 * ZIPファイルとディレクトリアップロードをサポートし、ファイルツリーを構築します
 */
export const useFileUploadTree = (notify: (type: 'success' | 'error', title: string, message: string) => void) => {
  const [uploadStats, setUploadStats] = useState<{ count: number, sizeMB: number, tree: any, treeOpen: boolean }>({ count: 0, sizeMB: 0, tree: null, treeOpen: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildTreeFromProcessedFiles = (files: any[], fileCount: number, totalSize: number) => {
    const root: any = { name: 'root', children: {}, type: 'folder', size: 0 };
    files.forEach(file => {
      const parts = file.path.split('/').filter((p: string) => p.length > 0);
      let current = root;
      parts.forEach((part: string, index: number) => {
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
    notify('success', 'ファイル解析完了', `${fileCount} 個のファイルをローカルで処理しました (${sizeMB}MB)。`);
    return sizeMB;
  };

  const processFiles = async (fileList: File[]) => {
    const processedFiles: any[] = [];
    let totalSize = 0;
    let fileCount = 0;
    const JSZip = (window as any).JSZip;

    for (const file of fileList) {
      if (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
        try {
          const zip = await JSZip.loadAsync(file);

          // 【修正】Zipファイル名（拡張子なし）を取得してルートフォルダ名とする
          const zipRootName = file.name.replace(/\.[^/.]+$/, "");

          // Zip内のファイルを列挙
          const entries = Object.keys(zip.files).map(name => zip.files[name]);

          for (const zipEntry of entries) {
            if (!zipEntry.dir) {
              // 【修正】パスの先頭にZipファイル名を付与する
              // これにより "64bit/..." ではなく "AssetsBundleExtractor.../64bit/..." となる
              const originalPath = zipEntry.name;
              const path = `${zipRootName}/${originalPath}`;

              // ファイル名はパスの末尾
              const name = path.split('/').pop() || path;

              // Calculate actual uncompressed size
              let size = 0;
              try {
                // Note: JSZipのasync('blob')は遅延評価されるため、
                // 大量ファイルの場合はここで待機すると時間がかかる可能性がありますが、
                // 正確なサイズ取得のために必要です。
                // パフォーマンスが問題になる場合は zipEntry._data.uncompressedSize などを参照する方法もあります（内部API依存）
                const blob = await zipEntry.async("blob");
                size = blob.size;
              } catch (e) {
                console.warn("Failed to read zip entry size", e);
              }

              processedFiles.push({
                path: path,
                name: name,
                size: size
              });
              fileCount++;
              totalSize += size;
            }
          }
        } catch (e) {
          console.error("Zip error:", e);
          notify('error', 'Zip解凍エラー', `${file.name} を解凍できませんでした`);
        }
      } else {
        // 通常ファイルの場合は webkitRelativePath (フォルダドロップ時) またはファイル名を使用
        // フォルダドロップ時はブラウザが自動的にルートフォルダ名を含めてくれるのでそのままでOK
        processedFiles.push({ path: file.webkitRelativePath || file.name, name: file.name, size: file.size });
        totalSize += file.size;
        fileCount++;
      }
    }
    return buildTreeFromProcessedFiles(processedFiles, fileCount, totalSize);
  };

  return { uploadStats, setUploadStats, fileInputRef, processFiles };
};