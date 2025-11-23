import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Bell,
  CheckCircle,
  AlertTriangle,
  List,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Play,
  Coins,
  Trash2,
} from 'lucide-react';
import { ExperimentScenario } from '../../entities/scenario';
import { useGlobalStore } from '../../shared/store';

interface HeaderProps {
  onLogClick: (scenario: ExperimentScenario) => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogClick }) => {
  const {
    deployedNodeCount,
    notifications,
    isNotificationOpen,
    setIsNotificationOpen,
    clearNotifications,
    execution,
    users,
  } = useGlobalStore();

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsNotificationOpen]);

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const queueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (queueRef.current && !queueRef.current.contains(event.target as Node)) {
        setIsQueueOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scenarios = execution.scenarios;
  const pendingCount = scenarios.filter(c =>
    ['PENDING', 'CALCULATING', 'READY', 'RUNNING'].includes(c.status)
  ).length;
  const runningCount = scenarios.filter(c => c.status === 'RUNNING').length;
  const hasScenarios = scenarios.length > 0;

  // 試算中(PENDING含む)かどうか
  const isEstimating = scenarios.some(s => ['PENDING', 'CALCULATING'].includes(s.status));

  // 一括実行可否: 実行中でない かつ 試算中でない かつ READYがある
  const canExecuteAll =
    !execution.isExecutionRunning && !isEstimating && scenarios.some(s => s.status === 'READY');
  // 一括再試算可否: 実行中でない かつ FAILがある
  const canRecalculate = !execution.isExecutionRunning && scenarios.some(s => s.status === 'FAIL');
  // 削除可否: 実行中でない かつ 試算中でない かつ シナリオがある
  const canRemoveAll = !execution.isExecutionRunning && !isEstimating && hasScenarios;

  return (
    <header className="h-20 bg-white px-8 flex items-center justify-between z-40 shrink-0 border-b border-slate-100">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
          <LayoutDashboard className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-2xl tracking-tight text-slate-800 leading-none">
            RaidChain <span className="text-slate-400 font-light">WebUI</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          <div
            className={`w-2.5 h-2.5 rounded-full shadow-sm ${
              deployedNodeCount > 0
                ? 'bg-emerald-500 shadow-emerald-200 animate-pulse'
                : 'bg-red-500 shadow-red-200'
            }`}
          ></div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            {deployedNodeCount > 0 ? 'System Online' : 'System Offline'}
          </span>
        </div>

        {/* --- Scenario Queue Icon & Popup --- */}
        <div className="relative" ref={queueRef}>
          <button
            className={`relative p-3 transition-all rounded-2xl hover:shadow-sm active:scale-95 ${
              isQueueOpen
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setIsQueueOpen(!isQueueOpen)}
          >
            {execution.isExecutionRunning ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary-indigo" />
            ) : (
              <List className="w-6 h-6" />
            )}

            {pendingCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                {pendingCount}
              </span>
            )}
          </button>

          {isQueueOpen && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* Header with Bulk Actions */}
              <div className="px-5 py-4 border-b border-slate-50 bg-indigo-50/30 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <List className="w-4 h-4 text-indigo-500" />
                  シナリオキュー
                </h3>

                <div className="flex items-center gap-2">
                  {/* 全削除ボタン */}
                  {canRemoveAll && (
                    <button
                      onClick={() => execution.clearAllScenarios()}
                      className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                      title="全て削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {canRecalculate && (
                    <button
                      onClick={() => execution.recalculateAll(users)}
                      className="p-1.5 bg-white border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                      title="一括再試算"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {canExecuteAll && (
                    <button
                      onClick={() => execution.executeScenarios('batch')}
                      className="p-1.5 bg-primary-indigo text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                      title="一括実行"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  )}

                  <div className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-indigo-100 text-indigo-600">
                    {scenarios.length}
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {scenarios.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm font-medium">
                    キューは空です
                  </div>
                ) : (
                  scenarios.map(s => {
                    let icon = <Clock className="w-4 h-4 text-slate-400" />;
                    let bgClass = 'bg-white border-slate-100';
                    let textClass = 'text-slate-600';

                    // このシナリオが試算中かどうか
                    const isThisEstimating = ['PENDING', 'CALCULATING'].includes(s.status);

                    if (s.status === 'PENDING') {
                      icon = <Clock className="w-4 h-4 text-slate-300" />;
                      bgClass = 'bg-slate-50 border-slate-100 opacity-70';
                    } else if (s.status === 'CALCULATING') {
                      icon = <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
                      bgClass = 'bg-yellow-50 border-yellow-100';
                    } else if (s.status === 'READY') {
                      icon = <Coins className="w-4 h-4 text-indigo-500" />;
                      bgClass = 'bg-indigo-50/30 border-indigo-100';
                      textClass = 'text-indigo-700';
                    } else if (s.status === 'RUNNING') {
                      icon = <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />;
                      bgClass = 'bg-yellow-100 border-yellow-200';
                      textClass = 'text-yellow-800';
                    } else if (s.status === 'COMPLETE') {
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                      bgClass = 'bg-white border-emerald-100';
                      textClass = 'text-slate-600';
                    } else if (s.status === 'FAIL') {
                      icon = <AlertCircle className="w-4 h-4 text-red-500" />;
                      bgClass = 'bg-red-50 border-red-100';
                      textClass = 'text-red-700';
                    }

                    return (
                      <div
                        key={s.uniqueId}
                        onClick={() => {
                          onLogClick(s);
                          setIsQueueOpen(false);
                        }}
                        className={`px-3 py-2.5 rounded-xl border ${bgClass} flex items-center justify-between gap-3 transition-colors cursor-pointer hover:shadow-sm group`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                          <div className="shrink-0 mt-0.5">{icon}</div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-bold truncate ${textClass}`}>
                              {s.uniqueId}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium flex gap-2 mt-0.5">
                              <span>#{s.id}</span>
                              <span>{s.dataSize}MB</span>
                              {s.status === 'READY' && (
                                <span className="text-indigo-400">{s.cost} TKN</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 個別削除 (ホバー時のみ表示 + 実行中/試算中は非表示) */}
                        {!execution.isExecutionRunning && !isThisEstimating && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              execution.removeScenario(s.id);
                            }}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                <span className="text-[10px] text-slate-400 font-medium">
                  {/* {runningCount > 0 ? `${runningCount} 件実行中...` : '待機中'} */}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notification Icon & Popup */}
        <div className="relative" ref={notificationRef}>
          <button
            className="relative p-3 text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-100 rounded-2xl hover:shadow-sm active:scale-95"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <Bell className="w-6 h-6" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">通知一覧</h3>
                <button
                  onClick={clearNotifications}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  すべてクリア
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-sm font-medium">
                    新しい通知はありません
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="px-4 py-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-default group"
                    >
                      <div className="flex gap-4 items-start">
                        <div
                          className={`mt-1 p-1.5 rounded-full ${
                            n.type === 'success'
                              ? 'bg-emerald-100 text-emerald-600'
                              : n.type === 'error'
                                ? 'bg-red-100 text-red-600'
                                : n.type === 'warning'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {n.type === 'success' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : n.type === 'error' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : n.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-800">{n.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {n.message}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-2 font-medium text-right group-hover:text-slate-500">
                            {new Date(n.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
