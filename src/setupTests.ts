// src/setupTests.ts

// React Testing LibraryでDOM関連のより良いアサーション（toBeInTheDocumentなど）
// を使用可能にする
import '@testing-library/jest-dom';

// Note: 
// MSW (Mock Service Worker) を使用した統合テストを行う際は、
// ここにMSWのセットアップ/ティアダウンロジックを記述することを推奨します。
// 例:
/*
import { server } from './shared/mocks/server'; 
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
*/
