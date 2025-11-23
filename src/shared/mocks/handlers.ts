// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/backend_mock/handlers.ts

import { http, HttpResponse, delay } from 'msw';
import { MockServer } from './MockServer';
import { getFeeConstants } from './mockData';
import { z } from 'zod';

// Schemas
import { EstimateRequestSchema, RunExperimentRequestSchema } from '@/entities/scenario';
import { FaucetRequestSchema } from '@/entities/account/model/schemas';
import { ScaleRequestSchema } from '@/entities/deployment';
import { ExperimentPreset } from '@/entities/preset';

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

    try {
      const body = await request.json();
      // Zodバリデーション
      const { replicaCount } = ScaleRequestSchema.parse(body);

      await MockServer.scaleCluster(replicaCount);
      return HttpResponse.json({ status: 'accepted' }, { status: 202 });
    } catch (error) {
      // ZodErrorの場合は詳細を返す
      if (error instanceof z.ZodError) {
        return HttpResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
      }
      return HttpResponse.json({ error: 'Invalid request', details: error }, { status: 400 });
    }
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

    try {
      const body = await request.json();
      // Zodバリデーション
      const { targetId, amount } = FaucetRequestSchema.parse(body);

      const result = await MockServer.faucet(targetId, amount);
      return HttpResponse.json(result);
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        // 修正: e.errors -> e.issues
        return HttpResponse.json({ error: 'Validation Error', details: e.issues }, { status: 400 });
      }
      return HttpResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }),

  // --- Experiment Layer ---
  http.post('/api/experiment/estimate', async ({ request }: any) => {
    await delay(200);

    try {
      const body = await request.json();
      // Zodバリデーション
      const config = EstimateRequestSchema.parse(body);

      const { baseGasPrice, priorityFee, gasUsedPerMB } = getFeeConstants();

      let sizeMB = 0;
      // Union型の処理
      if ('dataSize' in config) {
        sizeMB = config.dataSize;
      } else if ('virtualConfig' in config && config.virtualConfig) {
        sizeMB = config.virtualConfig.sizeMB;
      } else if ('realConfig' in config && config.realConfig) {
        sizeMB = config.realConfig.totalSizeMB;
      }

      const gasUsed = sizeMB * gasUsedPerMB;
      const fluctuation = 1 + (Math.random() * 0.25 - 0.125);
      const currentBaseFee = baseGasPrice * fluctuation;
      const totalFee = gasUsed * (currentBaseFee + priorityFee);
      const estimatedCost = parseFloat((totalFee * 1.5).toFixed(2));
      const finalEstimatedCost = Math.max(1.0, estimatedCost);

      return HttpResponse.json({ cost: finalEstimatedCost, isBudgetSufficient: true });

    } catch (e) {
      if (e instanceof z.ZodError) {
        return HttpResponse.json({ error: 'Validation Error', details: e.issues }, { status: 400 });
      }
      console.error(e);
      return HttpResponse.json({ error: 'Invalid configuration for estimate' }, { status: 400 });
    }
  }),

  http.post('/api/experiment/run', async ({ request }: any) => {
    await delay(200);

    try {
      const body = await request.json();
      // Zodバリデーション
      const { scenarios } = RunExperimentRequestSchema.parse(body);

      const result = await MockServer.runExperiment(scenarios as any);
      return HttpResponse.json(result, { status: 202 });
    } catch (e) {
      if (e instanceof z.ZodError) {
        return HttpResponse.json({ error: 'Validation Error', details: e.issues }, { status: 400 });
      }
      return HttpResponse.json({ error: 'Invalid scenarios data', details: e }, { status: 400 });
    }
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
    // Presetのバリデーションは構造が複雑なため今回はスキップ
    const preset = await request.json() as ExperimentPreset;
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