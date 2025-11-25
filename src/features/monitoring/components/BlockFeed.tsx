// src/features/monitoring/components/BlockFeed.tsx

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { BlockEvent } from '@/entities/node';
import { useWebSocket } from '@/shared/lib/hooks/useWebSocket';
import {
  Layers,
  Database,
  Cpu,
  Server,
  Hash,
  Filter,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Modal, ModalHeader } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';

// 1レーンあたりのブロック履歴保持数
const HISTORY_SIZE = 100;

// グラフ描画用の定数
const GRAPH_HEIGHT = 90; // バーの最大高さ (px)
const GRAPH_BOTTOM_OFFSET = 30; // グラフ下端のオフセット (px) - "0 MB" ラインの位置

// スケールの最小フロア値 (MB)
const MAX_BLOCK_SIZE_MB_FLOOR = 1.0;

// チェーンごとのブロック履歴 (Map<chainName, BlockEvent[]>)
type BlockHistoryMap = Map<string, BlockEvent[]>;

// --- Helper Components ---

/**
 * ブロック生成から経過した時間を表示するヘルパー
 */
const TimeAgo: React.FC<{ timestamp: string }> = React.memo(({ timestamp }) => {
  const calculateTime = useCallback(() => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    return {
      seconds,
      display: seconds < 60 ? `${seconds}s ago` : new Date(timestamp).toLocaleTimeString(),
      color: seconds > 6 ? 'text-red-600' : seconds > 3 ? 'text-orange-600' : 'text-emerald-600',
    };
  }, [timestamp]);

  const [timeState, setTimeState] = useState(calculateTime);

  React.useEffect(() => {
    setTimeState(calculateTime());
    const interval = setInterval(() => {
      setTimeState(calculateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [timestamp, calculateTime]);

  return (
    <span className={`font-mono font-bold text-sm ${timeState.color}`}>{timeState.display}</span>
  );
});

/**
 * ツールチップ用ポータルコンポーネント
 */
const HoverTooltip: React.FC<{
  block: BlockEvent;
  position: { x: number; y: number } | null;
}> = ({ block, position }) => {
  if (!position) return null;

  return (
    <div
      className="absolute z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: position.x,
        top: position.y - 10,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-600 whitespace-nowrap">
        <div className="font-bold mb-1 flex items-center gap-2">
          <span className="text-emerald-400">#{block.height}</span>
          <span className="text-slate-400">|</span>
          <span>{block.blockSizeMB.toFixed(3)} MB</span>
        </div>
        <div className="text-slate-300 font-mono text-[10px]">
          Txs: <span className="text-white font-bold">{block.txCount}</span>
          <span className="mx-2 opacity-50">/</span>
          Hash: {block.hash.substring(0, 6)}
        </div>
      </div>
      <div className="w-2 h-2 bg-slate-800 transform rotate-45 absolute left-1/2 -bottom-1 -translate-x-1/2 border-r border-b border-slate-600"></div>
    </div>
  );
};

/**
 * 1ブロックのスパークライン（棒）
 */
const BlockBar: React.FC<{
  block: BlockEvent;
  onClick: (block: BlockEvent) => void;
  maxScale: number;
  onHover: (block: BlockEvent | null, e: React.MouseEvent | null) => void;
}> = ({ block, onClick, maxScale, onHover }) => {
  const blockSize = block.blockSizeMB;
  // グラフの高さを計算 (最大高さに対する比率)
  const sizeRatio = Math.min(1, blockSize / maxScale);
  const height = Math.max(4, Math.floor(sizeRatio * GRAPH_HEIGHT));

  let colorClass = 'bg-slate-300';
  if (blockSize > maxScale * 0.8) {
    colorClass = 'bg-red-600 hover:bg-red-700';
  } else if (blockSize > maxScale * 0.4) {
    colorClass = 'bg-amber-600 hover:bg-amber-700';
  } else if (blockSize > 0.01) {
    colorClass = 'bg-indigo-600 hover:bg-indigo-700';
  } else {
    colorClass = 'bg-emerald-400/80 hover:bg-emerald-500/80';
  }

  const isInterval = block.height % 5 === 0;

  return (
    <div
      onClick={() => onClick(block)}
      onMouseEnter={e => onHover(block, e)}
      onMouseLeave={() => onHover(null, null)}
      className="w-8 flex-shrink-0 flex items-end justify-center cursor-pointer transition-all duration-100 group relative"
      // バーの下端位置をグリッド線(0MB)に合わせるためのスタイル
      // [MODIFIED] 当たり判定を最低20px確保 (パディング分+20px)
      style={{
        paddingBottom: `${GRAPH_BOTTOM_OFFSET}px`,
        minHeight: `${GRAPH_BOTTOM_OFFSET + 20}px`,
      }}
    >
      {/* Bar Body */}
      <div
        className={`w-6 rounded-t-sm ${colorClass} transition-all duration-200 shadow-sm group-hover:shadow-lg group-hover:brightness-110 origin-bottom`}
        style={{
          height: `${height}px`,
          // [MODIFIED] 下から伸びるアニメーション
          animation: 'grow-vertical 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      ></div>
      {/* HEIGHT Label */}
      <div
        className={`
          absolute bottom-2 mt-1 text-[10px] font-mono font-bold whitespace-nowrap px-1 rounded
          transition-all duration-1 z-10 pointer-events-none
          ${isInterval ? 'text-slate-400 opacity-100' : 'text-slate-600 opacity-0'}
        `}
      >
        {block.height}
      </div>
    </div>
  );
};

/**
 * 単一チェーンのレーン全体
 */
const ChainLane: React.FC<{
  chainName: string;
  type: 'control' | 'meta' | 'data';
  history: BlockEvent[];
  openTxModal: (block: BlockEvent) => void;
}> = React.memo(({ chainName, type, history, openTxModal }) => {
  const displayHistory = history.slice(-HISTORY_SIZE);
  const latestBlock = displayHistory[displayHistory.length - 1] || null;

  // --- Scroll Logic ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // データ更新時に自動スクロール
  useEffect(() => {
    if (isAutoScroll && scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        left: scrollWidth - clientWidth,
        behavior: 'smooth',
      });
    }
  }, [displayHistory, isAutoScroll]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const isAtRight = Math.abs(scrollWidth - clientWidth - scrollLeft) < 10;

    if (isAtRight) {
      setIsAutoScroll(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    } else {
      setIsAutoScroll(false);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsAutoScroll(true);
      }, 5000);
    }
  };

  // --- Tooltip Logic ---
  const [hoverInfo, setHoverInfo] = useState<{
    block: BlockEvent;
    pos: { x: number; y: number };
  } | null>(null);

  const handleBarHover = useCallback((block: BlockEvent | null, e: React.MouseEvent | null) => {
    if (block && e && scrollContainerRef.current) {
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const targetRect = e.currentTarget.getBoundingClientRect();

      setHoverInfo({
        block,
        pos: {
          x: targetRect.left - containerRect.left + targetRect.width / 2,
          y: targetRect.top - containerRect.top,
        },
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  // --- Scaling Logic ---
  const maxObservedMB = useMemo(() => {
    const currentDisplayHistory = history.slice(-HISTORY_SIZE);
    if (currentDisplayHistory.length === 0) return MAX_BLOCK_SIZE_MB_FLOOR;
    const max = Math.max(...currentDisplayHistory.map(b => b.blockSizeMB));
    return Math.max(MAX_BLOCK_SIZE_MB_FLOOR, max);
  }, [history]);

  const scaleMax = maxObservedMB;

  // グリッド線とラベルの位置定義（0%, 25%, 50%, 100%）
  const gridLevels = [0, 0.25, 0.5, 1.0];

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'control':
        return <Server className="w-5 h-5 text-blue-600" />;
      case 'meta':
        return <Cpu className="w-5 h-5 text-indigo-600" />;
      case 'data':
        return <Database className="w-5 h-5 text-emerald-600" />;
      default:
        return <Layers className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeColor = (t: string) => {
    switch (t) {
      case 'control':
        return 'border-blue-400/60 bg-blue-50/30';
      case 'meta':
        return 'border-indigo-400/60 bg-indigo-50/30';
      case 'data':
        return 'border-emerald-400/60 bg-emerald-50/30';
      default:
        return 'border-slate-400/60 bg-slate-50/30';
    }
  };

  if (!latestBlock) {
    return (
      <div
        className={`flex h-40 border-b border-dashed border-slate-300 items-center bg-slate-50 ${getTypeColor(type)}`}
      >
        <div className="w-80 flex-shrink-0 p-4 font-bold text-slate-500">
          {chainName} (Loading...)
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-40 border-b border-dashed border-slate-300 items-center transition-colors duration-300 group ${getTypeColor(type)}`}
    >
      {/* --- ステータスエリア（左側・固定幅） --- */}
      <div className="w-80 flex-shrink-0 p-4 border-r border-slate-300 flex flex-col justify-between h-full bg-white/80 backdrop-blur-sm z-20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 shadow-sm border border-slate-200">
            {getTypeIcon(type)}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
              {chainName}
              <Badge color="slate" className="text-[10px] px-2 py-0.5 border-slate-300">
                {type}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs mt-1">
              <span className="font-mono text-slate-600">
                <Hash className="w-3 h-3 inline mr-1 text-slate-400" />
                {latestBlock.hash.substring(0, 8)}
              </span>
              <span className="font-mono text-slate-600">
                <TimeAgo timestamp={latestBlock.timestamp} />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between mt-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              HEIGHT
            </span>
            <span className="font-black text-3xl text-indigo-800 font-mono">
              {latestBlock.height}
            </span>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${latestBlock.blockSizeMB > 0.5 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'} transition-all duration-300 shadow-sm`}
            >
              {latestBlock.blockSizeMB.toFixed(3)} MB
            </span>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              <span className="font-bold text-slate-700">PROPOSER:</span>{' '}
              {latestBlock.proposer.label}
            </div>
          </div>
        </div>
      </div>

      {/* --- グラフエリア (Sticky Axis Pattern) --- */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 h-full bg-slate-100/50 group/lane overflow-x-auto overflow-y-hidden custom-scrollbar relative min-w-0"
      >
        <div className="min-w-full h-full flex relative w-max">
          {/* 1. グリッド線レイヤー (絶対配置で全幅確保) */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {gridLevels.map(level => {
              const bottomPos = GRAPH_BOTTOM_OFFSET + GRAPH_HEIGHT * level;
              const isZero = level === 0;

              return (
                <div
                  key={level}
                  className={`absolute left-0 w-full border-t ${isZero ? 'border-slate-300' : 'border-dashed border-slate-300/60'}`}
                  style={{ bottom: `${bottomPos}px` }}
                />
              );
            })}
          </div>

          {/* 2. 左側の目盛りエリア (Sticky配置) */}
          <div className="sticky left-0 top-0 bottom-0 w-16 flex-shrink-0 z-20 h-full pointer-events-none">
            {/* 背景: 透過なしの不透明背景 */}
            <div className="absolute inset-0 bg-slate-100 border-r border-slate-200/50"></div>

            {/* 目盛りラベル (計算位置に配置) */}
            {gridLevels.map(level => {
              const bottomPos = GRAPH_BOTTOM_OFFSET + GRAPH_HEIGHT * level;
              const value = scaleMax * level;

              return (
                <span
                  key={level}
                  className="absolute left-2 text-[10px] font-bold font-mono text-slate-500 bg-white px-1.5 rounded border border-slate-200 shadow-sm"
                  style={{
                    bottom: `${bottomPos}px`,
                    transform: 'translateY(50%)',
                  }}
                >
                  {value.toFixed(level === 0 ? 0 : 1)} MB
                </span>
              );
            })}
          </div>

          {/* 3. バー描画エリア (Flexアイテム) */}
          <div className="flex items-end h-full z-10 flex-grow flex-shrink-0 pb-0">
            {displayHistory.map(block => (
              <BlockBar
                key={block.height}
                block={block}
                onClick={openTxModal}
                maxScale={scaleMax}
                onHover={handleBarHover}
              />
            ))}

            {/* Current Head Line */}
            <div className="h-full w-px bg-indigo-400/60 ml-1 mr-12 flex-shrink-0 border-r border-dashed border-indigo-400 relative">
              <div className="absolute bottom-[130px] -left-0 text-[10px] text-indigo-600 font-extrabold rotate-90 origin-bottom-left whitespace-nowrap tracking-wider">
                CURRENT HEAD
              </div>
            </div>
            {/* 余白 */}
            <div className="w-4 h-full bg-transparent flex-shrink-0"></div>
          </div>
        </div>

        {/* Tooltip Overlay */}
        {hoverInfo && <HoverTooltip block={hoverInfo.block} position={hoverInfo.pos} />}
      </div>
    </div>
  );
});

/**
 * メインコンポーネント: BlockFeed
 */
export const BlockFeed: React.FC = () => {
  const [blockHistory, setBlockHistory] = useState<BlockHistoryMap>(new Map());
  const [filter, setFilter] = useState<'all' | 'control' | 'meta' | 'data'>('all');
  const [txModal, setTxModal] = useState<BlockEvent | null>(null);

  // WebSocket受信と履歴更新
  useWebSocket<BlockEvent[]>('/ws/monitoring/blocks', newBlocks => {
    if (newBlocks && newBlocks.length > 0) {
      setBlockHistory(prev => {
        const next = new Map(prev);

        newBlocks.forEach(block => {
          const chainName = block.chainName;
          const currentHistory = next.get(chainName) || [];
          if (currentHistory.some(b => b.height === block.height)) return;
          const updatedHistory = [...currentHistory, block];
          next.set(chainName, updatedHistory);
        });

        return next;
      });
    }
  });

  const orderedChains = useMemo(() => {
    const allChains = Array.from(blockHistory.keys())
      .map(name => {
        const latestBlock = blockHistory.get(name)?.[blockHistory.get(name)!.length - 1];
        return {
          name,
          type: latestBlock?.type || 'data',
          latestHeight: latestBlock?.height || 0,
        };
      })
      .filter(c => filter === 'all' || c.type === filter)
      .sort((a, b) => {
        if (a.type === 'control' && b.type !== 'control') return -1;
        if (a.type === 'meta' && b.type === 'data') return -1;
        if (a.type === 'data' && b.type === 'meta') return 1;
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      });
    return allChains;
  }, [blockHistory, filter]);

  const openTxModal = useCallback((block: BlockEvent) => {
    setTxModal(block);
  }, []);

  const closeTxModal = () => setTxModal(null);

  return (
    <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-300 flex flex-col overflow-hidden relative">
      {/* Animation Keyframes Definition */}
      <style>{`
        @keyframes grow-vertical {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      `}</style>

      {/* Header & Filter */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-none">Block Feed</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Realtime Chain Activity</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['all', 'control', 'meta', 'data'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                ${
                  filter === f
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List (Multi-Lane) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-100">
        {orderedChains.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
            <Filter className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-bold text-sm">Waiting for chains to start...</p>
          </div>
        ) : (
          orderedChains.map(({ name, type }) => (
            <ChainLane
              key={name}
              chainName={name}
              type={type}
              history={blockHistory.get(name) || []}
              openTxModal={openTxModal}
            />
          ))
        )}
      </div>

      {/* --- Tx Detail Modal --- */}
      <Modal isOpen={!!txModal} onClose={closeTxModal} className="max-w-xl w-full p-0">
        <ModalHeader
          title={`Block Detail: ${txModal?.chainName} #${txModal?.height}`}
          subTitle={`Proposer: ${txModal?.proposer.label}`}
          icon={txModal && txModal.blockSizeMB > 0.5 ? AlertTriangle : CheckCircle}
          iconColor={txModal && txModal.blockSizeMB > 0.5 ? 'text-amber-600' : 'text-emerald-600'}
          onClose={closeTxModal}
        />
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Block Hash
              </span>
              <span className="font-mono text-xs text-slate-800 break-all">{txModal?.hash}</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Block Size
              </span>
              <span className="font-mono text-xl font-bold text-indigo-800">
                {txModal?.blockSizeMB.toFixed(3)} MB
              </span>
            </div>
          </div>

          <div className="text-sm font-bold text-slate-700 pt-2 border-t border-slate-200">
            Transactions in Block ({txModal?.txCount}):
          </div>

          <div className="bg-slate-900 rounded-xl p-4 max-h-60 overflow-y-auto custom-scrollbar border border-slate-700">
            {Array.from({ length: txModal?.txCount || 0 }).map((_, i) => (
              <p
                key={i}
                className="font-mono text-[10px] text-slate-300 break-all leading-normal py-0.5"
              >
                <span className="text-emerald-400 mr-2">{i + 1}.</span>
                <span className="text-slate-500 mr-1">TX_ID:</span>
                BASE64_BYTES_TRUNCATED...{i.toString().padStart(4, '0')}
              </p>
            ))}
            {txModal?.txCount === 0 && (
              <p className="font-mono text-slate-500 text-sm">No transactions found.</p>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <Button variant="secondary" onClick={closeTxModal}>
            閉じる
          </Button>
        </div>
      </Modal>
    </div>
  );
};
