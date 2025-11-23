// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/features/experiment/components/FileTreeViewer.tsx

import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  FileCode,
  ChevronRight,
  ChevronDown,
  Folder,
  ChevronsDown,
  ChevronsUp,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

// 一括操作のシグナル管理用
type GlobalToggle = {
  expanded: boolean;
  timestamp: number;
};

const TreeNode = ({
  node,
  level = 0,
  globalToggle,
}: {
  node: any;
  level?: number;
  globalToggle: GlobalToggle;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && Object.keys(node.children).length > 0;
  const isTopLevel = level === 0;

  // 親からの開閉シグナルを検知
  useEffect(() => {
    if (globalToggle.timestamp > 0) {
      setIsOpen(globalToggle.expanded);
    }
  }, [globalToggle]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    // トップレベル(level 0)の場合は左側のボーダー線を消して、ネストを一段上げる（ルートとして扱う）
    <div className={`${!isTopLevel ? 'pl-4 ml-2.5 border-l-2 border-slate-100' : ''}`}>
      {/* --- フォルダ --- */}
      {node.type === 'folder' && (
        <div
          className="flex items-center p-2 rounded-xl hover:bg-yellow-50 transition-colors cursor-pointer group mb-1 select-none"
          onClick={handleToggle}
        >
          {/* 開閉インジケータ */}
          <div className="mr-1 text-slate-400 group-hover:text-slate-600 transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>

          {/* アイコン (サイズを w-10 -> w-8 に微調整) */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 transition-colors ${isOpen ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-400 group-hover:bg-yellow-50 group-hover:text-yellow-500'}`}
          >
            {isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
          </div>

          {/* テキスト (text-base -> text-sm に微調整) */}
          <span className="text-sm font-bold text-slate-700 group-hover:text-yellow-800 transition-colors truncate">
            {node.name}
          </span>

          {/* 子要素数バッジ */}
          <span className="ml-2 text-[10px] text-slate-400 font-medium bg-white px-1.5 rounded border border-slate-100 group-hover:border-yellow-200">
            {Object.keys(node.children || {}).length}
          </span>
        </div>
      )}

      {/* --- ファイル --- */}
      {node.type === 'file' && (
        <div className="group flex items-center justify-between p-2 mb-1 rounded-xl hover:bg-indigo-50 transition-colors cursor-default">
          <div className="flex items-center overflow-hidden min-w-0">
            {/* インデント調整用スペーサー (Chevron + Margin分) */}
            <div className="w-5 mr-1"></div>

            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mr-3 shrink-0 group-hover:bg-blue-100 transition-colors">
              <FileCode className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-600 truncate group-hover:text-primary-indigo transition-colors">
              {node.name}
            </span>
          </div>
          <Badge className="shrink-0">{(node.size / 1024).toFixed(1)} KB</Badge>
        </div>
      )}

      {/* --- 子要素 (再帰) --- */}
      {hasChildren && isOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          {Object.values(node.children).map((child: any, i: number) => (
            <TreeNode key={i} node={child} level={level + 1} globalToggle={globalToggle} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ディレクトリ構造を表示するツリービューコンポーネント
 */
export const FileTreeViewer = ({ tree }: { tree: any }) => {
  // 全開閉のステート管理
  const [globalToggle, setGlobalToggle] = useState<GlobalToggle>({ expanded: true, timestamp: 0 });

  if (!tree) return null;

  return (
    <div className="flex flex-col h-full font-sans">
      {/* コントロールヘッダー */}
      <div className="flex justify-end mb-2 py-2 border-b border-slate-50 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="flex gap-2">
          <button
            onClick={() => setGlobalToggle({ expanded: true, timestamp: Date.now() })}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
          >
            <ChevronsDown className="w-3 h-3" /> すべて開く
          </button>
          <button
            onClick={() => setGlobalToggle({ expanded: false, timestamp: Date.now() })}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
          >
            <ChevronsUp className="w-3 h-3" /> すべて閉じる
          </button>
        </div>
      </div>

      {/* ツリー本体 */}
      <div className="flex-1">
        {Object.values(tree.children || {}).map((child: any, i: number) => (
          // トップレベルなので level={0} を渡す
          <TreeNode key={i} node={child} level={0} globalToggle={globalToggle} />
        ))}
      </div>
    </div>
  );
};
