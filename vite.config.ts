import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // 既存のresolve設定を再利用
  const aliasPath = path.resolve(__dirname, './src');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': aliasPath,
      },
    },
    // ★ ADDED: Vitest Configuration
    test: {
      environment: 'jsdom', // DOM環境をシミュレート（Reactコンポーネントテストに必須）
      globals: true, // `describe`, `it`, `expect`などをグローバルに利用可能にする
      setupFiles: './src/setupTests.ts', // テスト前のセットアップファイル
      // alias設定をViteのものと同期させる
      alias: {
        '@': aliasPath,
      },
      // coverage: { // 必要に応じてコメントアウトを解除
      //   enabled: true,
      //   provider: 'v8',
      //   include: ['src/**/*.{ts,tsx}'],
      //   exclude: [
      //     'src/main.tsx',
      //     'src/shared/mocks',
      //     'src/**/types.ts',
      //     'src/**/index.ts',
      //   ],
      // },
    },
  };
});
