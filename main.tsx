// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * アプリケーションのエントリーポイント
 * index.htmlのroot要素に対してReactアプリケーションをマウントします。
 */

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// --- MSWのセットアップ: レンダリングをブロックしないように修正 ---
// 開発モードでのみMSWのワーカーを起動します。
if (process.env.NODE_ENV === 'development') {
  // workerモジュールを動的インポートします。
  // このPromiseの結果を待たずに、すぐにアプリケーションの描画に進みます。
  import('./mocks/browser').then(({ worker }) => {
    // worker.start()を実行し、サービスワーカーの登録と起動をバックグラウンドで行います。
    // onUnhandledRequest: 'bypass'により、モックされていないリクエストはそのままバックエンド（またはVite dev server）に流れます。
    worker.start({
      onUnhandledRequest: 'bypass',
    }).then(() => {
      console.log("MSW worker started successfully.");
    }).catch(error => {
      console.error("MSW worker failed to start:", error);
    });
  }).catch(error => {
    console.error("Failed to import MSW worker:", error);
  });
}
// -----------------------------

// MSWの起動完了を待たずに、すぐにレンダリングを開始します。
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);