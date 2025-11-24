// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/backend_mock/MockServer.ts

import { MempoolInfo, MonitoringUpdate, NodeStatus, PacketEvent } from '@/entities/node';
import {
  generateMockNodes,
  generateMockUsers,
  generateSystemAccounts,
  generateMockResults,
  generateMockPresets,
  getFeeConstants,
} from './mockData';
import { SystemAccount, UserAccount } from '@/entities/account';
import { ExperimentPreset } from '@/entities/preset';
import { ExperimentResult } from '@/entities/result';
import { ExperimentScenario, ExecutionResultDetails } from '@/entities/scenario';

/**
 * Mock Backend Service
 * * ブラウザ内でバックエンドサーバーの挙動を完全にシミュレートします。
 * 状態（DB）を保持し、VirtualSocketを通じてリアルタイムイベントを発火させます。
 */

// --- Virtual Socket Implementation ---
type MessageHandler = (event: { data: string }) => void;

export class VirtualSocket {
  url: string;
  onmessage: MessageHandler | null = null;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  private cleanup: (() => void) | null = null;
  private isClosed = false;

  constructor(url: string) {
    this.url = url;
    console.log(`[MockWS] Connecting to ${url}...`);

    // Simulate connection delay
    setTimeout(() => {
      if (this.isClosed) {
        console.log(`[MockWS] Connection aborted for ${url}(closed before open)`);
        return;
      }

      if (this.onopen) this.onopen();
      this.cleanup = MockServer.subscribe(url, data => {
        if (this.onmessage && !this.isClosed) {
          this.onmessage({ data: JSON.stringify(data) });
        }
      });
    }, 200);
  }

  send(data: string) {
    if (this.isClosed) return;
    console.log(`[MockWS] Sent: ${data} `);
    // If needed, handle client-to-server messages here
  }

  close() {
    this.isClosed = true;
    if (this.cleanup) this.cleanup();
    if (this.onclose) this.onclose();
    console.log(`[MockWS] Closed ${this.url} `);
  }
}

// --- Mock Server Implementation (Singleton) ---
class MockServerInstance {
  // Database State
  private deployedNodeCount = 5;
  private nodes: NodeStatus[] = [];
  private mempool: MempoolInfo[] = [];
  private users: UserAccount[] = [];
  private systemAccounts: SystemAccount[] = [];
  private results: ExperimentResult[] = [];
  private presets: ExperimentPreset[] = [];

  // Feeの状態を保持 (静的値)
  private minGasPrice: number = getFeeConstants().minGasPrice;

  private intervals: NodeJS.Timeout[] = [];
  private subscribers: { [url: string]: ((data: unknown) => void)[] } = {};

  constructor() {
    this.init();
    this.startEventLoop();
  }

  private init() {
    this.nodes = generateMockNodes(this.deployedNodeCount);
    this.users = generateMockUsers();
    this.systemAccounts = generateSystemAccounts(this.deployedNodeCount);
    this.results = generateMockResults();
    this.presets = generateMockPresets();
    this.mempool = Array.from({ length: this.deployedNodeCount }, (_, i) => ({
      name: `data-${i}`,
      txs: Math.floor(Math.random() * 50),
    }));
  }

  // --- Event Loop (Heartbeat) ---
  private startEventLoop() {
    // 1. Monitoring Heartbeat (1s)
    this.intervals.push(
      setInterval(() => {
        this.updateNodes();
        // Fee 情報をブロードキャストに追加 (静的)
        this.broadcast('/ws/monitoring', {
          nodes: this.nodes,
          mempool: this.mempool,
          deployedCount: this.deployedNodeCount,
          minGasPrice: this.minGasPrice,
        } as MonitoringUpdate);
      }, 1000)
    );

    // 2. Packet Generator (Random)
    this.intervals.push(
      setInterval(() => {
        if (this.deployedNodeCount > 0 && Math.random() > 0.6) {
          const targetIdx = Math.floor(Math.random() * this.deployedNodeCount);
          const packet: PacketEvent = {
            id: `pkt-${Date.now()}`,
            from: 'control-chain',
            to: `datachain-${targetIdx}`,
            type: 'ibc_transfer',
            timestamp: Date.now(),
          };
          this.broadcast('/ws/monitoring/packets', packet);
        }
      }, 1500)
    );
  }

  private updateNodes() {
    if (this.nodes.length !== 2 + this.deployedNodeCount) {
      this.nodes = generateMockNodes(this.deployedNodeCount);
      this.mempool = Array.from({ length: this.deployedNodeCount }, (_, i) => ({
        name: `data-${i}`,
        txs: 0,
      }));
    }

    this.nodes = this.nodes.map(n => ({
      ...n,
      height: n.height + (n.status === 'active' && Math.random() > 0.7 ? 1 : 0),
      txCount:
        n.txCount +
        (n.status === 'active' && Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0),
      latency: Math.max(5, n.latency + Math.floor(Math.random() * 10) - 5),
    }));

    this.mempool = this.mempool.map(m => ({
      ...m,
      txs: Math.max(0, m.txs + (Math.random() > 0.5 ? 5 : -10) + Math.floor(Math.random() * 5)),
    }));

    // EIP-1559の動的変動ロジックは削除済み (Cosmosモデル準拠)
  }

  // --- Pub/Sub System ---
  public subscribe(url: string, callback: (data: unknown) => void) {
    const baseUrl = url.split('?')[0];
    if (!this.subscribers[baseUrl]) this.subscribers[baseUrl] = [];
    this.subscribers[baseUrl].push(callback);

    if (baseUrl === '/ws/monitoring') {
      // 初期ロード時にもFee情報を含める
      callback({
        nodes: this.nodes,
        mempool: this.mempool,
        deployedCount: this.deployedNodeCount,
        minGasPrice: this.minGasPrice,
      });
    }

    return () => {
      this.subscribers[baseUrl] = this.subscribers[baseUrl].filter(cb => cb !== callback);
    };
  }

  private broadcast(url: string, data: unknown) {
    if (this.subscribers[url]) {
      this.subscribers[url].forEach(cb => cb(data));
    }
  }

  // --- API Handlers ---

  // Deployment
  async buildImage() {
    return new Promise<{ jobId: string }>(resolve => {
      setTimeout(() => {
        const jobId = `build-${Date.now()}`;
        this.startBuildJob(jobId);
        resolve({ jobId });
      }, 500);
    });
  }

  private startBuildJob(jobId: string) {
    const logs = [
      'Building context: 124.5MB transferred.',
      'Step 1/5 : FROM golang:1.22-alpine as builder',
      'Step 2/5 : WORKDIR /app',
      'Step 3/5 : COPY . .',
      'Step 4/5 : RUN go build -o datachain ./cmd/datachain',
      "Successfully built image 'raidchain/node:latest'",
    ];
    let step = 0;
    const interval = setInterval(() => {
      if (step >= logs.length) {
        this.broadcast('/ws/deployment/logs', { jobId, type: 'complete' });
        clearInterval(interval);
      } else {
        this.broadcast('/ws/deployment/logs', { jobId, type: 'log', message: logs[step] });
        step++;
      }
    }, 800);
  }

  async scaleCluster(count: number) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.deployedNodeCount = count;
        resolve({ success: true });
      }, 500);
    });
  }

  // Economy
  async getUsers() {
    return { users: [...this.users], system: [...this.systemAccounts] };
  }

  async createUser() {
    const newUser: UserAccount = {
      id: `u${Date.now()}`,
      address: `raid1${Math.random().toString(36).substring(7)}${Math.random().toString(36).substring(7)}`,
      balance: 0,
      role: 'client',
      name: `Client ${this.users.length}`,
    };
    this.users.push(newUser);
    return newUser;
  }

  async deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    return true;
  }

  async faucet(targetId: string, amount: number) {
    const millionaire = this.systemAccounts.find(a => a.type === 'faucet_source');
    if (!millionaire || millionaire.balance < amount) throw new Error('Pool Empty');

    let targetName = '';
    millionaire.balance -= amount;

    const user = this.users.find(u => u.id === targetId);
    if (user) {
      user.balance += amount;
      targetName = user.address;
    } else {
      const sys = this.systemAccounts.find(s => s.id === targetId);
      if (sys) {
        sys.balance += amount;
        targetName = sys.name;
      }
    }
    return { success: true, targetName };
  }

  // Experiment
  async runExperiment(scenarios: ExperimentScenario[]) {
    const executionId = `exec-${Date.now()}`;
    this.startExperimentSimulation(executionId, scenarios);
    return { executionId };
  }

  /**
   * 実験シミュレーション（バッチ実行）
   * 順番に実行し、資金の引き落としと返金を行う
   */
  private async startExperimentSimulation(executionId: string, scenarios: ExperimentScenario[]) {
    const { minGasPrice, gasUsedPerMB } = getFeeConstants();

    for (const scenario of scenarios) {
      // 準備完了以外のステータスはスキップ
      if (scenario.status !== 'READY') continue;

      const user = this.users.find(u => u.id === scenario.userId);

      // 1. 実行開始前: 資金引き落とし (Estimate Cost分)
      if (user) {
        user.balance -= scenario.cost;
      }

      // ステータス: RUNNINGへ遷移
      this.broadcast('/ws/experiment/progress', {
        executionId,
        scenarioId: scenario.id,
        status: 'RUNNING',
        log: `[SYSTEM] Execution started. Deducted ${scenario.cost} TKN from account.`,
      });

      // シミュレーション遅延 (実行中)
      await new Promise(r => setTimeout(r, 800));

      this.broadcast('/ws/experiment/progress', {
        executionId,
        scenarioId: scenario.id,
        log: `[INFO] Uploading ${scenario.dataSize}MB data...`,
      });
      await new Promise(r => setTimeout(r, 800));

      // 2. 実行完了後: 実コスト計算と返金 (Refund)

      // 実際のGas Usedを計算 (データサイズベース)
      const actualGasUsed = scenario.dataSize * gasUsedPerMB;

      // 実際の Fee: Gas Used × Min Gas Price (Cosmos Model - 静的)
      const actualFeeRaw = actualGasUsed * minGasPrice;

      // 成功/失敗のランダム判定
      const success = Math.random() > 0.15;
      const status = success ? 'COMPLETE' : 'FAIL';
      let log = '';

      // 失敗時は、Gasの一部だけ消費されたとする
      let finalFee = actualFeeRaw;
      if (!success) {
        finalFee = actualFeeRaw * (0.08 + Math.random() * 0.04); // 8-12%
      }

      // 最低コスト1.0 TKNを保証 (表示上の都合)
      const actualCost = parseFloat(Math.max(1.0, finalFee).toFixed(2));

      const refund = parseFloat((scenario.cost - actualCost).toFixed(2));

      if (user) {
        user.balance += refund;
      }

      // 結果オブジェクトの作成
      let resultData: ExperimentResult | undefined = undefined;

      if (success) {
        // 結果データの作成
        resultData = {
          id: `res-${scenario.uniqueId}`,
          scenarioName: `Batch Execution #${scenario.id}`,
          executedAt: new Date().toISOString(),
          status: 'SUCCESS',
          dataSizeMB: scenario.dataSize,
          chunkSizeKB: scenario.chunkSize,
          totalTxCount: Math.floor((scenario.dataSize * 1024) / scenario.chunkSize),
          allocator: scenario.allocator,
          transmitter: scenario.transmitter,
          targetChainCount: scenario.chains,
          usedChains: scenario.targetChains,
          uploadTimeMs: 1234 + Math.random() * 5000,
          downloadTimeMs: 567 + Math.random() * 2000,
          throughputBps: Math.floor(10000000 + Math.random() * 5000000),
          // Economic Metrics
          gasUsed: actualGasUsed,
          baseFee: minGasPrice, // Min Gas Price
          actualFee: actualCost,
          logs: scenario.logs,
        };

        // サーバー内の保存リストに追加
        this.results.unshift(resultData);

        log = `[SUCCESS] Data commited. Actual Cost: ${actualCost} TKN (Refunded: ${refund} TKN)`;
      } else {
        log = `[ERROR] Execution Failed. Gas Used: ${actualCost} TKN (Refunded: ${refund} TKN)`;
      }

      // 通知用の詳細データを作成
      const resultDetails: ExecutionResultDetails & { result?: ExperimentResult } = {
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown User',
        actualCost,
        refund,
        currentBalance: user?.balance || 0,
        result: resultData, // ここで渡す
      };

      // 完了イベント送信 (詳細データを含める)
      this.broadcast('/ws/experiment/progress', {
        executionId,
        scenarioId: scenario.id,
        status,
        log,
        resultDetails,
      });
    }
    this.broadcast('/ws/experiment/progress', { executionId, type: 'ALL_COMPLETE' });
  }

  async getResults() {
    return this.results;
  }
  async deleteResult(id: string) {
    this.results = this.results.filter(r => r.id !== id);
    return true;
  }

  // Preset
  async getPresets() {
    return this.presets;
  }
  async savePreset(preset: ExperimentPreset) {
    const index = this.presets.findIndex(p => p.id === preset.id);
    if (index >= 0) {
      this.presets[index] = preset;
    } else {
      this.presets.push(preset);
    }
    return preset;
  }
  async deletePreset(id: string) {
    this.presets = this.presets.filter(p => p.id !== id);
    return true;
  }
}

export const MockServer = new MockServerInstance();