// src/shared/lib/test-utils/renderWithProviders.tsx
// FSD Layer: Shared/Lib - コンポーネントテスト用のユーティリティ

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// テスト用のカスタムレンダリングオプションの型定義
interface CustomRenderOptions extends RenderOptions {
  // 必要に応じてinitialStateなどを定義
}

// プロバイダをラップするコンポーネント
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 必要に応じてReact Router, Theme Providerなどをここで追加します。
  // useGlobalStoreはContextではないため、ここでは不要です。
  return <>{children}</>;
};

/**
 * カスタムレンダリング関数
 * RTLのrenderをラップし、共通のプロバイダでコンポーネントを囲み、userEventを返します。
 */
const customRender = (ui: ReactElement, options?: CustomRenderOptions) => ({
  user: userEvent.setup(),
  ...render(ui, { wrapper: AllTheProviders, ...options }),
});

// RTLから必要なエクスポートを再エクスポート
export * from '@testing-library/react';
export { customRender as render };
