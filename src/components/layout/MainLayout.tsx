// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/components/layout/MainLayout.tsx

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../../types';
import {
  AppLayer,
  NotificationItem,
  ExperimentScenario,
  UserAccount, // 追加
} from '../../types';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useScenarioExecution } from '../../features/experiment/hooks/useScenarioExecution';

interface MainLayoutProps {
  children: React.ReactNode;
  activeLayer: AppLayer;
  setActiveLayer: (layer: AppLayer) => void;
  deployedNodeCount: number;
  notifications: NotificationItem[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  clearNotifications: () => void;
  notificationRef: React.RefObject<HTMLDivElement>;
  toasts: Toast[];
  isExecutionRunning: boolean;
  execution: ReturnType<typeof useScenarioExecution>;
  onLogClick: (scenario: ExperimentScenario) => void;
  users: UserAccount[]; // 追加: Appから受け取る
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeLayer,
  setActiveLayer,
  deployedNodeCount,
  notifications,
  isNotificationOpen,
  setIsNotificationOpen,
  clearNotifications,
  notificationRef,
  toasts,
  isExecutionRunning,
  execution,
  onLogClick,
  users, // 受け取る
}) => {
  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        isExecutionRunning={isExecutionRunning}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative shadow-2xl z-0">
        <Header
          deployedNodeCount={deployedNodeCount}
          notifications={notifications}
          isNotificationOpen={isNotificationOpen}
          setIsNotificationOpen={setIsNotificationOpen}
          clearNotifications={clearNotifications}
          notificationRef={notificationRef}
          execution={execution}
          onLogClick={onLogClick}
          users={users} // Headerに渡す
        />

        <main className="flex-1 overflow-hidden relative z-0">{children}</main>

        {/* Toast Container */}
        <div className="absolute bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-5 fade-in duration-300
                ${
                  toast.type === 'success'
                    ? 'bg-white border-emerald-100 text-emerald-800'
                    : toast.type === 'error'
                      ? 'bg-white border-red-100 text-red-800'
                      : toast.type === 'warning'
                        ? 'bg-white border-yellow-100 text-yellow-800'
                        : 'bg-white border-blue-100 text-blue-800'
                }
              `}
            >
              <div
                className={`p-1 rounded-full ${
                  toast.type === 'success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : toast.type === 'error'
                      ? 'bg-red-100 text-red-600'
                      : toast.type === 'warning'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                }`}
              >
                {toast.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : toast.type === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : toast.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-[200px]">
                <p className="font-bold text-sm">{toast.title}</p>
                <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
