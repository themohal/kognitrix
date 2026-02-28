'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  requests: number;
  credits: number;
}

interface UsageChartProps {
  data: ChartDataPoint[];
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(10, 17, 32, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
      }}
    >
      <p style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name === 'requests' ? 'Requests' : 'Credits'}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function UsageChart({ data }: UsageChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Activity className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">No data yet. Start making requests to see your history here.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCredits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 41, 59, 0.8)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#94a3b8', fontSize: 12 }}>
              {value === 'requests' ? 'Requests' : 'Credits Used'}
            </span>
          )}
        />
        <Area
          type="monotone"
          dataKey="requests"
          stroke="#06b6d4"
          strokeWidth={2}
          fill="url(#gradRequests)"
          dot={false}
          activeDot={{ r: 4, fill: '#06b6d4' }}
        />
        <Area
          type="monotone"
          dataKey="credits"
          stroke="#a855f7"
          strokeWidth={2}
          fill="url(#gradCredits)"
          dot={false}
          activeDot={{ r: 4, fill: '#a855f7' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
