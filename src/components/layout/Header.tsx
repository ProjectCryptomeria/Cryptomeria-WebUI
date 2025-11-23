import React from 'react';
import { LayoutDashboard, Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { NotificationItem } from '../../types';

interface HeaderProps {
  deployedNodeCount: number;
  notifications: NotificationItem[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  clearNotifications: () => void;
  notificationRef: React.RefObject<HTMLDivElement>;
}

export const Header: React.FC<HeaderProps> = ({
  deployedNodeCount,
  notifications,
  isNotificationOpen,
  setIsNotificationOpen,
  clearNotifications,
  notificationRef,
}) => {
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
            className={`w-2.5 h-2.5 rounded-full shadow-sm ${deployedNodeCount > 0 ? 'bg-emerald-500 shadow-emerald-200 animate-pulse' : 'bg-red-500 shadow-red-200'}`}
          ></div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            {deployedNodeCount > 0 ? 'System Online' : 'System Offline'}
          </span>
        </div>

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
                          className={`mt-1 p-1.5 rounded-full ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}
                        >
                          {n.type === 'success' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
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
