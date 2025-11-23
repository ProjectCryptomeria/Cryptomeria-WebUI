import React from 'react';
import { ExperimentScenario, UserAccount } from '../../../types';
import {
  List,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
  PlayCircle,
  Settings2,
  CheckCircle2,
  Clock,
  Coins,
} from 'lucide-react';
import { BottomPanel } from '../../../components/ui/BottomPanel';

interface ResultsBottomPanelProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  height: number;
  panelRef: React.RefObject<HTMLDivElement | null>;
  resizerRef: React.RefObject<HTMLDivElement | null>;

  scenarios: ExperimentScenario[];
  totalCost: string;
  successCount: number;
  failCount: number;
  isExecutionRunning: boolean;
  pendingCount: number;

  // 一括再試算には最新のユーザー情報(残高)が必要なため引数を変更しても良いが、
  // ここでは親から関数を受け取る形にする
  onRecalculateAll: () => void;
  onExecute: () => void;
  onErrorClick: (id: string, reason: string) => void;
  onLogClick: (scenario: ExperimentScenario) => void;

  // 廃止: onReprocess (個別再実行)
  onReprocess?: (id: number) => void;
}

export const ResultsBottomPanel: React.FC<ResultsBottomPanelProps> = ({
  isOpen,
  setIsOpen,
  height,
  panelRef,
  resizerRef,
  scenarios,
  totalCost,
  successCount,
  failCount,
  isExecutionRunning,
  pendingCount,
  onRecalculateAll,
  onExecute,
  onErrorClick,
  onLogClick,
}) => {
  // 試算中かどうか判定
  const isCalculating = scenarios.some(s => s.status === 'CALCULATING');
  // 実行可能なシナリオがあるか
  const hasReadyScenarios = scenarios.some(s => s.status === 'READY');
  // 失敗があるか
  const hasFailed = failCount > 0;

  return (
    <BottomPanel
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      height={height}
      panelRef={panelRef}
      resizerRef={resizerRef}
      title={
        <>
          生成結果
          <span className="ml-3 bg-primary-indigo text-white text-sm font-bold px-2.5 py-0.5 rounded-full shadow-sm shadow-indigo-200">
            {scenarios.length}
          </span>
        </>
      }
      icon={List}
      headerRight={
        <div className="text-base text-gray-600 font-medium hidden sm:flex items-center gap-2">
          <span>総コスト試算:</span>
          <span className="font-mono font-bold text-gray-900 text-lg">{totalCost}</span>
          <span className="text-xs text-gray-400">TKN</span>
        </div>
      }
    >
      {/* Status Bar & Execute */}
      <div className="px-8 py-3 bg-indigo-50/50 border-b border-indigo-50 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-6 text-sm">
          {/* 1. 実行待機中数 */}
          <div className="flex items-center text-status-ready bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-bold text-lg">{pendingCount}</span>
            <span className="text-xs text-status-ready font-bold ml-1.5 uppercase">待機中</span>
          </div>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* 2. 成功数 */}
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-bold text-lg">{successCount}</span>
            <span className="text-xs text-green-700 font-bold ml-1.5 uppercase">完了</span>
          </div>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* 3. 失敗数 */}
          <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-bold text-lg">{failCount}</span>
            <span className="text-xs text-red-700 font-bold ml-1.5 uppercase">失敗</span>
          </div>
        </div>

        <div className="flex gap-3">
          {/* 一括再試算ボタン: 失敗がある、かつ実行中でない場合に表示 */}
          {hasFailed && !isExecutionRunning && (
            <button
              onClick={onRecalculateAll}
              className="bg-white border border-status-fail text-status-fail px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center hover:bg-red-50 transition-all"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              一括再試算
            </button>
          )}

          {/* 実行ボタン */}
          <button
            onClick={onExecute}
            // 試算中 または 実行中 または 実行可能シナリオがない場合は押せない
            disabled={isCalculating || isExecutionRunning || !hasReadyScenarios}
            className={`
              px-6 py-2.5 rounded-xl font-bold shadow-sm flex items-center transition-all transform active:scale-95
              ${
                isCalculating || isExecutionRunning || !hasReadyScenarios
                  ? 'bg-gray-300 text-white opacity-70 cursor-not-allowed'
                  : 'bg-primary-indigo text-white hover:bg-indigo-700 hover:shadow-md'
              }
            `}
          >
            {isExecutionRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                実行中...
              </>
            ) : isCalculating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                試算中...
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 mr-2" />
                一括実行
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scenario List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
        {scenarios.map(c => {
          let border = 'border-l-4 border-gray-200';
          let statusContent = null;
          let bgClass = 'bg-white';
          let opacity = 'opacity-100';

          if (c.status === 'PENDING') {
            // 試算待機: グレー
            border = 'border-l-4 border-slate-300';
            bgClass = 'bg-slate-50';
            statusContent = (
              <div className="text-slate-400 font-bold flex items-center text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 mr-1.5" /> 試算待機
              </div>
            );
          } else if (c.status === 'CALCULATING') {
            // 試算中: 黄色
            border = 'border-l-4 border-status-process'; // Yellow
            statusContent = (
              <div className="text-status-process font-bold flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> 試算中...
              </div>
            );
          } else if (c.status === 'READY') {
            // 実行待機 (試算完了): 青
            border = 'border-l-4 border-status-ready';
            statusContent = (
              <div className="text-status-ready font-bold flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                <Coins className="w-4 h-4 mr-1.5" /> 試算: {c.cost.toFixed(2)}
              </div>
            );
          } else if (c.status === 'RUNNING') {
            // 実行中
            border = 'border-l-4 border-status-process';
            bgClass = 'bg-yellow-50/30';
            statusContent = (
              <div className="text-status-process font-bold flex items-center">
                <Settings2 className="w-4 h-4 animate-spin mr-1.5" /> 実行中
              </div>
            );
          } else if (c.status === 'COMPLETE') {
            // 完了
            border = 'border-l-4 border-status-success';
            statusContent = (
              <div className="text-status-success font-bold flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-1.5" /> 完了
              </div>
            );
          } else if (c.status === 'FAIL') {
            // 失敗
            border = 'border-l-4 border-status-fail';
            bgClass = 'bg-red-50/50';
            statusContent = (
              <div className="flex items-center">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onErrorClick(c.uniqueId, c.failReason || '');
                  }}
                  className="text-status-fail font-bold hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center text-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-1.5" /> エラー詳細
                </button>
              </div>
            );
          }

          return (
            <div
              key={c.uniqueId}
              onClick={() => onLogClick(c)}
              className={`p-4 rounded-2xl shadow-sm ${border} ${bgClass} ${opacity} flex justify-between items-center hover:shadow-md transition-all cursor-pointer mb-1`}
            >
              <div className="flex items-center space-x-5 flex-1">
                <div className="text-center w-10 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    No.
                  </span>
                  <span className="font-black text-gray-700 text-lg">{c.id}</span>
                </div>
                <div className="text-sm overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-mono text-xs font-bold text-gray-400 truncate opacity-70">
                      {c.uniqueId}
                    </div>
                    {/* ユーザーIDバッジ */}
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[100px]">
                      user: {c.userId}
                    </span>
                  </div>

                  <div className="font-bold text-gray-800 text-base">
                    サイズ: {c.dataSize}MB / チャンク: {c.chunkSize}KB
                  </div>
                  <div className="text-gray-500 text-xs mt-1 font-medium flex gap-2 flex-wrap items-center">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {c.allocator}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {c.transmitter}
                    </span>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-1.5 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100 text-indigo-800">
                      <span className="font-bold">{c.chains} ノード</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 flex items-center pl-4">{statusContent}</div>
            </div>
          );
        })}
      </div>
    </BottomPanel>
  );
};
