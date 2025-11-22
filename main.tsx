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

// --- MSWのセットアップ関数: workerを起動するロジックを追加 ---
async function enableMocking() {
  // NOTE: 開発モードで実行されることを前提とし、モックを有効化します。
  // 本番ビルド時などは除外するロジックをここに入れるのが一般的です。

  try {
    // 同階層のmocks/browser.tsからworkerをインポート
    const { worker } = await import('./mocks/browser');

    // MSWを起動。未処理のリクエストはそのままバイパスする設定。
    // タイムアウト処理を追加して、SWの不具合でアプリが起動しないのを防ぐ
    await Promise.race([
      worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          // index.htmlで読み込まれるサービスワーカーのパスを指定
          url: '/mockServiceWorker.js'
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("MSW start timed out (missing mockServiceWorker.js?)")), 5000)
      )
    ]);

    console.log("MSW worker started successfully.");
  } catch (error) {
    console.error("Failed to start MSW worker:", error);
    console.warn("Application will continue without mocking. API requests may fail.");
    // エラーが発生してもアプリケーションは続行できるようにします。
  }
}
// -----------------------------

// MSWの起動を待機してからレンダリングを実行
// catchブロックでエラーを捕捉し、必ずrenderが呼ばれるように保証する
enableMocking().finally(() => {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});