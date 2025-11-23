// entities/scenario - シナリオ関連のZodスキーマ定義

import { z } from 'zod';
import { AllocatorStrategy, TransmitterStrategy } from './types';

// Enums
export const AllocatorStrategySchema = z.nativeEnum(AllocatorStrategy);
export const TransmitterStrategySchema = z.nativeEnum(TransmitterStrategy);

// Sub Configs
export const VirtualConfigSchema = z.object({
	sizeMB: z.number().min(1, 'Size must be at least 1MB'),
	chunkSizeKB: z.number().min(1, 'Chunk size must be at least 1KB'),
	files: z.number().min(1).optional().default(1),
});

export const RealFileConfigSchema = z.object({
	fileCount: z.number(),
	totalSizeMB: z.number(),
	structure: z.any(), // Tree構造は複雑なため一旦anyとするが、厳密にするなら再帰的スキーマが必要
});

// Main Config Schema
export const ExperimentConfigSchema = z.object({
	allocator: AllocatorStrategySchema,
	transmitter: TransmitterStrategySchema,
	targetChains: z.array(z.string()).min(1, 'At least one chain must be selected'),
	uploadType: z.enum(['Virtual', 'Real']),
	projectName: z.string().min(1, 'Project name is required'),
	virtualConfig: VirtualConfigSchema.optional(),
	realConfig: RealFileConfigSchema.optional(),
	userId: z.string().optional(),
	shouldFail: z.boolean().optional(),
});

// Estimate Endpoint Schema
// StoreからScenarioオブジェクトそのものが渡される場合と、Configが渡される場合の両方を考慮
export const EstimateRequestSchema = z.union([
	ExperimentConfigSchema,
	z.object({
		dataSize: z.number(),
		// 他のフィールドは計算に使わないため、最小限の定義で許容する
	}).passthrough()
]);

// Run Endpoint Schema
// シナリオ配列を受け取る
// ExperimentScenario型全体を厳密にバリデーションするのは難しいため（動的なプロパティが多い）、
// 実行に必要な主要フィールドをチェックする
export const RunScenarioSchema = z.object({
	id: z.number(),
	uniqueId: z.string(),
	userId: z.string(),
	dataSize: z.number(),
	chunkSize: z.number(),
	allocator: AllocatorStrategySchema,
	transmitter: TransmitterStrategySchema,
	chains: z.number(),
	targetChains: z.array(z.string()),
	cost: z.number(),
	status: z.enum(['PENDING', 'CALCULATING', 'READY', 'RUNNING', 'COMPLETE', 'FAIL']),
}).passthrough(); // 他のプロパティ(logs, failReason等)はパススルー

export const RunExperimentRequestSchema = z.object({
	scenarios: z.array(RunScenarioSchema).min(1, 'No scenarios provided'),
});