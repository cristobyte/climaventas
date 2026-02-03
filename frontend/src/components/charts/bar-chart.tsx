'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';

interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  formatValue?: 'currency' | 'number' | 'percent';
  color?: string;
}

const COLORS = ['#2952d9', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export function BarChart({
  data,
  formatValue = 'number',
  color = '#2952d9',
}: BarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatTooltip = (value: number) => {
    switch (formatValue) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('es-CL');
    }
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsBarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
          tickFormatter={(value) =>
            formatValue === 'currency' ? `$${(value / 1000).toFixed(0)}K` : value.toString()
          }
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: isDark ? '#d1d5db' : '#374151', fontSize: 12 }}
          width={100}
        />
        <Tooltip
          formatter={(value: number) => [formatTooltip(value), 'Valor']}
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : 'white',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            color: isDark ? '#f3f4f6' : '#111827',
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
