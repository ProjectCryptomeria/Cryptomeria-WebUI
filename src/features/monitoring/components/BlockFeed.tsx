import React, { useState, useMemo, useCallback } from 'react';
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
const HISTORY_SIZE = 20;

// バーの最大高さ (px) - グリッド線の位置計算に使用
const MAX_BAR_HEIGHT = 90;

// チェーンごとのブロック履歴 (Map<chainName, BlockEvent[]>)
type BlockHistoryMap = Map<string, BlockEvent[]>;

// --- Helper Components ---

/**
 * ブロック生成から経過した時間を表示するヘルパー
 * 【FIXED: Contrast increased】
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
 * 1ブロックのスパークライン（棒）
 * 【FIXED: Colors darkened for better visibility】
 */
const BlockBar: React.FC<{ block: BlockEvent; onClick: (block: BlockEvent) => void }> = React.memo(
  ({ block, onClick }) => {
    // Tx Countに基づき、高さと色を決定
    const txCount = block.txCount;
    const isHighTx = txCount > 5;
    const txRatio = Math.min(1, txCount / 10); // 最大10Txで高さを100%とする

    const height = Math.max(4, Math.floor(txRatio * MAX_BAR_HEIGHT)); // 最小4px, 最大90px

    let colorClass = 'bg-slate-300';
    if (txCount > 0) {
      colorClass = isHighTx ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700';
    } else if (txCount === 0) {
      colorClass = 'bg-emerald-400/60 hover:bg-emerald-500/60';
    }

    return (
      <div
        onClick={() => onClick(block)}
        className={`w-6 flex-shrink-0 flex items-end justify-center cursor-pointer transition-all duration-100 group h-full pb-0`}
        title={`Height: ${block.height}, Txs: ${txCount}`}
      >
        <div
          className={`w-4 rounded-t-sm ${colorClass} transition-all duration-200 shadow-sm group-hover:shadow-lg`}
          style={{ height: `${height}px` }}
        ></div>
      </div>
    );
  }
);

/**
 * 単一チェーンのレーン全体
 * 【FIXED: Overall contrast increased (text, borders, backgrounds)】
 */
const ChainLane: React.FC<{
  chainName: string;
  type: 'control' | 'meta' | 'data';
  history: BlockEvent[];
  openTxModal: (block: BlockEvent) => void;
}> = React.memo(({ chainName, type, history, openTxModal }) => {
  const displayHistory = history.slice(-HISTORY_SIZE);
  const latestBlock = displayHistory[displayHistory.length - 1] || null;

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
      {/* --- 左側固定エリア --- */}
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
              className={`text-xs font-bold px-2 py-1 rounded-full ${latestBlock.txCount > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'} transition-all duration-300 shadow-sm`}
            >
              {latestBlock.txCount} TXS
            </span>
            <div className="text-[10px] font-mono text-slate-500 mt-2">
              <span className="font-bold text-slate-700">PROPOSER:</span>{' '}
              {latestBlock.proposer.label}
            </div>
          </div>
        </div>
      </div>

      {/* --- 右側流動エリア (スパークライン) --- */}
      <div className="flex-1 relative h-full bg-slate-100/50">
        {/* 1. 背景グリッド線と補助数値 (固定表示) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Max Line (10 MB) */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-slate-400/60"
            style={{ bottom: '106px' }}
          ></div>
          <span
            className="absolute left-2 text-[10px] font-bold font-mono text-slate-600 bg-white px-1.5 rounded border border-slate-200"
            style={{ bottom: '106px', transform: 'translateY(50%)' }}
          >
            10 MB
          </span>

          {/* Half Line (5 MB) */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-slate-300/70"
            style={{ bottom: '61px' }}
          ></div>
          <span
            className="absolute left-2 text-[10px] font-bold font-mono text-slate-500 bg-white px-1.5 rounded border border-slate-200"
            style={{ bottom: '61px', transform: 'translateY(50%)' }}
          >
            5 MB
          </span>

          {/* Zero Line (0 MB) */}
          <div className="absolute left-0 right-0 border-t border-slate-300 bottom-3"></div>
          <span className="absolute bottom-1 left-2 text-[10px] font-bold font-mono text-slate-500 bg-white px-1.5 rounded border border-slate-200">
            0 MB
          </span>
        </div>

        {/* 2. スクロール可能なバーエリア */}
        {/* [MODIFIED] pl-12を追加し、開始位置を右にずらして補助数値との重なりを防ぐ */}
        <div className="absolute inset-0 overflow-x-auto overflow-y-hidden flex items-end pb-4 custom-scrollbar z-10">
          <div className="flex items-end h-full justify-start pl-12 pr-8">
            {displayHistory.map(block => (
              <BlockBar key={block.height} block={block} onClick={openTxModal} />
            ))}

            {/* [MODIFIED] CURRENT HEADラインをコンテナ内に移動し、最新バーの右に追随させる */}
            <div className="h-full w-px bg-indigo-400/60 ml-1 mr-4 flex-shrink-0 border-r border-dashed border-indigo-400 relative">
              <div className="absolute bottom-0 -left-1 text-[9px] text-indigo-600 font-extrabold rotate-90 origin-bottom-left whitespace-nowrap tracking-wider">
                CURRENT HEAD
              </div>
            </div>
          </div>
        </div>
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

          // 同じ高さのブロックは追加しない (重複防止)
          if (currentHistory.some(b => b.height === block.height)) return;

          // 新しいブロックを履歴に追加
          const updatedHistory = [...currentHistory, block];
          next.set(chainName, updatedHistory);
        });

        return next;
      });
    }
  });

  // レーン表示順序の決定とフィルタリング
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
    if (block.txCount > 0) {
      setTxModal(block);
    }
  }, []);

  const closeTxModal = () => setTxModal(null);

  return (
    <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-300 flex flex-col overflow-hidden relative">
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
          title={`Tx Detail: ${txModal?.chainName} #${txModal?.height}`}
          subTitle={`Proposer: ${txModal?.proposer.label}`}
          icon={txModal && txModal.txCount > 0 ? AlertTriangle : CheckCircle}
          iconColor={txModal && txModal.txCount > 0 ? 'text-amber-600' : 'text-emerald-600'}
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
                Tx Count
              </span>
              <span className="font-mono text-xl font-bold text-indigo-800">
                {txModal?.txCount}
              </span>
            </div>
          </div>

          <div className="text-sm font-bold text-slate-700 pt-2 border-t border-slate-200">
            {txModal?.txCount} Transactions in Block:
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
