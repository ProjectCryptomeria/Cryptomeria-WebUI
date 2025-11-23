// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/mocks/handlers.ts

import { http, HttpResponse, delay } from 'msw';
import { MockServer } from '../src/backend_mock/MockServer';

/**
 * MSW Handlers
 * * すべてのHTTPリクエストをインターセプトし、MockServerにルーティングします。
 * 遅延の制御、エラーハンドリング、レスポンス形式の統一を行います。
 */
export const handlers = [
  // --- Deployment Layer ---
  http.post('/api/deployment/build', async () => {
    await delay(500);
    const result = await MockServer.buildImage();
    return HttpResponse.json(result, { status: 202 });
  }),

  http.post('/api/deployment/scale', async ({ request }: any) => {
    await delay(500);
    const { replicaCount } = await request.json();

    if (!replicaCount || replicaCount < 0) {
      return HttpResponse.json({ error: 'Invalid replicaCount' }, { status: 400 });
    }

    await MockServer.scaleCluster(replicaCount);
    return HttpResponse.json({ status: 'accepted' }, { status: 202 });
  }),

  http.delete('/api/deployment/reset', async () => {
    await delay(300);
    await MockServer.scaleCluster(0);
    return HttpResponse.json({ success: true });
  }),

  // --- Economy Layer ---
  http.get('/api/economy/users', async () => {
    await delay(200);
    const data = await MockServer.getUsers();
    return HttpResponse.json(data);
  }),

  http.post('/api/economy/user', async () => {
    await delay(300);
    const newUser = await MockServer.createUser();
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.delete('/api/economy/user/:id', async ({ params }: any) => {
    await delay(300);
    const { id } = params;

    if (!id) {
      return HttpResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await MockServer.deleteUser(id as string);
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/economy/faucet', async ({ request }: any) => {
    await delay(300);
    const { targetId, amount } = await request.json();

    if (!targetId) {
      return HttpResponse.json({ error: 'targetId is required' }, { status: 400 });
    }

    try {
      const result = await MockServer.faucet(targetId, amount || 100);
      return HttpResponse.json(result);
    } catch (e) {
      return HttpResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }),

  // --- Experiment Layer ---
  http.post('/api/experiment/estimate', async ({ request }: any) => {
    await delay(200);
    const config = await request.json();

    // 簡易試算ロジック
    const sizeMB = config.virtualConfig?.sizeMB || config.realConfig?.totalSizeMB || 0;
    const chainCount = config.targetChains?.length || 1;
    const cost = sizeMB * 0.5 + chainCount * 10;

    return HttpResponse.json({ cost, isBudgetSufficient: true });
  }),

  http.post('/api/experiment/run', async ({ request }: any) => {
    await delay(200);
    const { scenarios } = await request.json();

    if (!scenarios || !Array.isArray(scenarios)) {
      return HttpResponse.json({ error: 'Invalid scenarios' }, { status: 400 });
    }

    const result = await MockServer.runExperiment(scenarios);
    return HttpResponse.json(result, { status: 202 });
  }),

  // --- Library Layer ---
  http.get('/api/library/results', async () => {
    await delay(200);
    const results = await MockServer.getResults();
    return HttpResponse.json(results);
  }),

  http.delete('/api/library/results/:id', async ({ params }: any) => {
    await delay(200);
    const { id } = params;

    if (!id) {
      return HttpResponse.json({ error: 'Result ID is required' }, { status: 400 });
    }

    await MockServer.deleteResult(id as string);
    return HttpResponse.json({ success: true });
  }),

  // --- Preset Layer ---
  http.get('/api/presets', async () => {
    await delay(200);
    const presets = await MockServer.getPresets();
    return HttpResponse.json(presets);
  }),

  http.post('/api/presets', async ({ request }: any) => {
    await delay(300);
    const preset = await request.json();
    const saved = await MockServer.savePreset(preset);
    return HttpResponse.json(saved);
  }),

  http.delete('/api/presets/:id', async ({ params }: any) => {
    await delay(300);
    const { id } = params;
    if (!id) return HttpResponse.json({ error: 'ID required' }, { status: 400 });
    await MockServer.deletePreset(id as string);
    return HttpResponse.json({ success: true });
  }),
];
