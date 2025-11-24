// entities/deployment - デプロイメント関連のZodスキーマ定義

import { z } from 'zod';

// Scale API Request Schema
export const ScaleRequestSchema = z.object({
  replicaCount: z
    .number()
    .int('Replica count must be an integer')
    .min(0, 'Replica count cannot be negative')
    .max(20, 'Max replica count is 20'), // システム上の上限設定
});
