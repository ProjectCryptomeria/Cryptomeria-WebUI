export {};

// MSWの複雑なRequest/Response/Contextの型をモックするための最小限の型
type MSWResolver = (req: unknown) => unknown;
type MSWRestFn = (path: string, resolver: MSWResolver) => unknown;

declare global {
  interface Window {
    MockServiceWorker: {
      // handlersは様々な型の配列なので、ここでは unknown[] を使用
      setupWorker: (...handlers: unknown[]) => {
        start: (options?: { onUnhandledRequest: 'bypass' | 'warn' | 'error' }) => Promise<void>;
      };
      http: {
        get: MSWRestFn;
        post: MSWRestFn;
        delete: MSWRestFn;
        put: MSWRestFn;
      };
      HttpResponse: {
        // jsonの戻り値は通常 ResponseLikeオブジェクト
        json: (body: unknown, options?: { status?: number }) => unknown;
      };
      delay: (ms?: number) => Promise<void>;
    };
  }
}
