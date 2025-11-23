import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AppLayer, NotificationItem, Toast } from '../../types';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

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
}) => {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header
        deployedNodeCount={deployedNodeCount}
        notifications={notifications}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        clearNotifications={clearNotifications}
        notificationRef={notificationRef}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
        <main className="flex-1 bg-slate-50/50 relative overflow-hidden">
          {children}
          <div className="fixed bottom-8 left-8 z-[100] flex flex-col gap-4 pointer-events-none w-80">
            {toasts.map(toast => (
              <div
                key={toast.id}
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-full animate-in slide-in-from-left-10 fade-in duration-500 pointer-events-auto flex items-start gap-4 ring-1 ring-black/5"
              >
                <div
                  className={`mt-0.5 p-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}
                >
                  {toast.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
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
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
