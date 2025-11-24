// entities/account - アカウント関連のZodスキーマ定義

import { z } from 'zod';

// Faucet API Request Schema
export const FaucetRequestSchema = z.object({
  targetId: z.string().min(1, 'Target ID is required'),
  amount: z.number().min(1, 'Amount must be positive').optional().default(100),
});

// Scale Deployment Schema (Deploymentですが、便宜上ここに配置するか、本来はentities/deploymentを作るべきですが、
// 今回の計画範囲外のため、handlers.ts内で直接定義するか、汎用的な場所が望ましいです。
// ただし、今回はhandlers.tsで直接使用するため、ここではEconomy関連のみ定義します)
