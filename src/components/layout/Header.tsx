// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/components/layout/Header.tsx

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
} from 'lucide-react';
import { NotificationItem, ExperimentScenario } from '../../types';
import { useScenarioExecution } from '../../features/experiment/hooks/useScenarioExecution';

interface HeaderProps {
  deployedNodeCount: number;
  notifications: NotificationItem[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  clearNotifications: () => void;
  notificationRef: React.RefObject<HTMLDivElement>;
  execution: ReturnType<typeof useScenarioExecution>;
  onLogClick: (scenario: ExperimentScenario) => void;
}

export const Header: React.FC<HeaderProps> = ({
  deployedNodeCount,
  notifications,
  isNotificationOpen,
  setIsNotificationOpen,
  clearNotifications,
  notificationRef,
  execution,
  onLogClick,
}) => {
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
              <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <List className="w-4 h-4 text-indigo-500" />
                  シナリオキュー
                </h3>
                <div className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-indigo-100 text-indigo-600">
                  {scenarios.length} 件
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

                    if (s.status === 'RUNNING') {
                      icon = <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
                      bgClass = 'bg-yellow-50 border-yellow-100';
                      textClass = 'text-yellow-700';
                    } else if (s.status === 'COMPLETE') {
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                      bgClass = 'bg-emerald-50/30 border-emerald-100';
                      textClass = 'text-slate-600';
                    } else if (s.status === 'FAIL') {
                      icon = <AlertCircle className="w-4 h-4 text-red-500" />;
                      bgClass = 'bg-red-50 border-red-100';
                      textClass = 'text-red-700';
                    } else if (s.status === 'READY') {
                      icon = <CheckCircle className="w-4 h-4 text-indigo-400" />;
                      bgClass = 'bg-white border-slate-100';
                      textClass = 'text-slate-700';
                    }

                    return (
                      <div
                        key={s.uniqueId}
                        onClick={() => {
                          onLogClick(s);
                          setIsQueueOpen(false);
                        }}
                        className={`px-3 py-2.5 rounded-xl border ${bgClass} flex items-center justify-between gap-3 transition-colors cursor-pointer hover:shadow-sm hover:opacity-90`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                          <div className="shrink-0 mt-0.5">{icon}</div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-bold truncate ${textClass}`}>
                              {s.uniqueId}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium flex gap-2 mt-0.5">
                              <span>#{s.id}</span>
                              <span>
                                {s.dataSize}MB / {s.chunkSize}KB
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {s.status === 'FAIL' && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                execution.reprocessCondition(s.id);
                              }}
                              className="p-1.5 bg-white border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                              title="再実行"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {s.status === 'RUNNING' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                <span className="text-[10px] text-slate-400 font-medium">
                  {runningCount > 0 ? `${runningCount} 件実行中...` : '待機中'}
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
