// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/components/layout/MainLayout.tsx

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AppLayer, NotificationItem, Toast, ExperimentScenario } from '../../types';
import { CheckCircle, AlertTriangle, X, Loader2, Info } from 'lucide-react';
import { useScenarioExecution } from '../../features/experiment/hooks/useScenarioExecution';

interface MainLayoutProps {
  activeLayer: AppLayer;
  setActiveLayer: (layer: AppLayer) => void;
  deployedNodeCount: number;
  notifications: NotificationItem[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  clearNotifications: () => void;
  notificationRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  toasts: Toast[];
  isExecutionRunning?: boolean;
  execution: ReturnType<typeof useScenarioExecution>;
  onLogClick: (scenario: ExperimentScenario) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeLayer,
  setActiveLayer,
  deployedNodeCount,
  notifications,
  isNotificationOpen,
  setIsNotificationOpen,
  clearNotifications,
  notificationRef,
  children,
  toasts,
  isExecutionRunning,
  execution,
  onLogClick,
}) => {
  // トーストのスタイル決定ロジック
  const getToastStyles = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-emerald-100 text-emerald-600',
          icon: <CheckCircle className="w-5 h-5" />,
        };
      case 'error':
        return {
          container: 'bg-red-100 text-red-600',
          icon: <AlertTriangle className="w-5 h-5" />,
        };
      case 'warning':
        return {
          container: 'bg-yellow-100 text-yellow-600',
          icon: <AlertTriangle className="w-5 h-5" />,
        };
      case 'info':
        return {
          container: 'bg-blue-100 text-blue-600',
          icon: <Info className="w-5 h-5" />,
        };
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header
        deployedNodeCount={deployedNodeCount}
        notifications={notifications}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        clearNotifications={clearNotifications}
        notificationRef={notificationRef}
        execution={execution}
        onLogClick={onLogClick}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
          isExecutionRunning={isExecutionRunning}
        />
        <main className="flex-1 bg-slate-50/50 relative overflow-hidden">
          {children}
          <div className="fixed bottom-8 left-8 z-[100] flex flex-col gap-4 pointer-events-none w-80">
            {toasts.map(toast => {
              const styles = getToastStyles(toast.type);
              return (
                <div
                  key={toast.id}
                  className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-full animate-in slide-in-from-left-10 fade-in duration-500 pointer-events-auto flex items-start gap-4 ring-1 ring-black/5"
                >
                  <div className={`mt-0.5 p-2 rounded-full ${styles.container}`}>{styles.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">{toast.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                      {toast.message}
                    </p>
                  </div>
                  <button
                    onClick={() => {}}
                    className="text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};
