import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ExperimentScenario } from '@/entities/scenario';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useGlobalStore } from '@/shared/store';
import { AppLayer } from '@/shared/types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeLayer: AppLayer;
  setActiveLayer: (layer: AppLayer) => void;
  onLogClick: (scenario: ExperimentScenario) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeLayer,
  setActiveLayer,
  onLogClick,
}) => {
  // ★ 修正: removeToast も取得する
  const { toasts, removeToast } = useGlobalStore();

  return (
    // レイアウト変更: flex-row -> flex-col (ヘッダーを上にするため)
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Header: 最上部に配置 */}
      <Header onLogClick={onLogClick} />

      {/* 下部エリア: サイドバーとメインコンテンツを横並びにする */}
      <div className="flex flex-1 overflow-hidden relative z-0">
        {/* Sidebar */}
        <Sidebar activeLayer={activeLayer} setActiveLayer={setActiveLayer} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative shadow-2xl z-0 overflow-hidden">
          <div className="flex-1 overflow-hidden relative z-0">{children}</div>

          {/* Toast Container */}
          <div className="absolute bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
              <div
                key={toast.id}
                // ★ 追加: クリック時にトーストを削除するハンドラ
                onClick={() => removeToast(toast.id)}
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
        </main>
      </div>
    </div>
  );
};
