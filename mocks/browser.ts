import { setupWorker } from 'msw/browser'; // 変更
import { handlers } from './handlers';

// const { setupWorker } = window.MockServiceWorker; // 削除

export const worker = setupWorker(...handlers);