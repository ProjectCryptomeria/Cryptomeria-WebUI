// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/features/monitoring/components/MempoolChart.tsx

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MempoolInfo } from '@/entities/node';

interface MempoolChartProps {
  data: MempoolInfo[];
  isResizing?: boolean;
}

/**
 * Mempoolの状態を表示する棒グラフコンポーネント
 * @param isResizing trueの場合、リサイズ計算を遅延させてパフォーマンスを維持します
 */
export const MempoolChart: React.FC<MempoolChartProps> = React.memo(
  ({ data, isResizing = false }) => {
    return (
      <div className="w-full h-full min-h-0 flex-1">
        {/* 修正: debounceを 10000 -> 250 に変更
                Rechartsの仕様で、debounceタイマーがprop変更後も生き残る場合があるため、
                「忘れた頃(10秒後)に実行される」のを防ぎ、適度な間引き(0.25秒)に留める。
            */}
        <ResponsiveContainer width="100%" height="100%" debounce={isResizing ? 250 : 0}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px',
              }}
            />
            <Bar dataKey="txs" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.txs > 150 ? '#ef4444' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
