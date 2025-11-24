// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/backend_mock/handlers.ts

import { http, HttpResponse, delay } from 'msw';
import { MockServer } from './MockServer';
import { getFeeConstants } from './mockData';
import { z } from 'zod';

// Schemas
import {
  EstimateRequestSchema,
  RunExperimentRequestSchema,
  ExperimentScenario,
} from '@/entities/scenario';
import { FaucetRequestSchema } from '@/entities/account/models/schemas';
import { ScaleRequestSchema } from '@/entities/deployment';
import { ExperimentPreset } from '@/entities/preset';

// --- MSW Handler Context Minimal Types (anyを解消) ---
type RequestOnlyContext = {
  request: Request;
};
type ParamsOnlyContext = {
  params: { [key: string]: string | undefined };
};
// ---------------------------------------------------

/**
 * MSW Handlers
 */
export const handlers = [
  // --- Deployment Layer ---
  http.post('/api/deployment/build', async () => {
    await delay(500);
    const result = await MockServer.buildImage();
    return HttpResponse.json(result, { status: 202 });
  }),

  http.post('/api/deployment/scale', async ({ request }: RequestOnlyContext) => {
    await delay(500);

    try {
      const body = await request.json();
      const { replicaCount } = ScaleRequestSchema.parse(body);

      await MockServer.scaleCluster(replicaCount);
      return HttpResponse.json({ status: 'accepted' }, { status: 202 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return HttpResponse.json(
          { error: 'Validation Error', details: error.issues },
          { status: 400 }
        );
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

  http.delete('/api/economy/user/:id', async ({ params }: ParamsOnlyContext) => {
    await delay(300);
    const { id } = params;

    if (!id) {
      return HttpResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await MockServer.deleteUser(id as string);
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/economy/faucet', async ({ request }: RequestOnlyContext) => {
    await delay(300);

    try {
      const body = await request.json();
      const { targetId, amount } = FaucetRequestSchema.parse(body);

      const result = await MockServer.faucet(targetId, amount);
      return HttpResponse.json(result);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return HttpResponse.json({ error: 'Validation Error', details: e.issues }, { status: 400 });
      }
      if (e instanceof Error) {
        return HttpResponse.json({ error: e.message }, { status: 400 });
      }
      return HttpResponse.json({ error: 'Unknown Error' }, { status: 500 });
    }
  }),

  // --- Experiment Layer ---
  http.post('/api/experiment/estimate', async ({ request }: RequestOnlyContext) => {
    await delay(200);

    try {
      const body = await request.json();
      const config = EstimateRequestSchema.parse(body);

      // 定数を取得 (Cosmos Model: Min Gas Price, Fee Multiplier)
      const { minGasPrice, feeMultiplier, gasUsedPerMB } = getFeeConstants();

      let sizeMB = 0;
      if ('dataSize' in config) {
        sizeMB = config.dataSize;
      } else if ('virtualConfig' in config && config.virtualConfig) {
        sizeMB = config.virtualConfig.sizeMB;
      } else if ('realConfig' in config && config.realConfig) {
        sizeMB = config.realConfig.totalSizeMB;
      }

      // 見積もり計算: Gas * MinGasPrice * Multiplier
      const gasUsed = sizeMB * gasUsedPerMB;
      const requiredFee = gasUsed * minGasPrice;
      const estimatedCost = parseFloat((requiredFee * feeMultiplier).toFixed(2));

      // 最低1.0 TKN (表示のため)
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

  http.post('/api/experiment/run', async ({ request }: RequestOnlyContext) => {
    await delay(200);

    try {
      const body = await request.json();
      const { scenarios } = RunExperimentRequestSchema.parse(body);

      const result = await MockServer.runExperiment(scenarios as unknown as ExperimentScenario[]);
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

  http.delete('/api/library/results/:id', async ({ params }: ParamsOnlyContext) => {
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

  http.post('/api/presets', async ({ request }: RequestOnlyContext) => {
    await delay(300);
    const preset = (await request.json()) as ExperimentPreset;
    const saved = await MockServer.savePreset(preset);
    return HttpResponse.json(saved);
  }),

  http.delete('/api/presets/:id', async ({ params }: ParamsOnlyContext) => {
    await delay(300);
    const { id } = params;
    if (!id) return HttpResponse.json({ error: 'ID required' }, { status: 400 });
    await MockServer.deletePreset(id as string);
    return HttpResponse.json({ success: true });
  }),
];