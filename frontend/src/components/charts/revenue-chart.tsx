'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/lib/theme-context';

interface RevenueData {
  month: string;
  revenue: number;
  salesCount: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  forecast?: { month: string; projectedRevenue: number }[];
}

export function RevenueChart({ data, forecast }: RevenueChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Combine historical and forecast data
  const combinedData = [
    ...data.map((d) => ({
      month: d.month,
      revenue: d.revenue,
      forecast: null as number | null,
    })),
    ...(forecast || []).map((f) => ({
      month: f.month,
      revenue: null as number | null,
      forecast: f.projectedRevenue,
    })),
  ];

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(m, 10) - 1]} ${year.slice(2)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2952d9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2952d9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          axisLine={false}
          tickLine={false}
          tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
        />
        <YAxis
          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
          axisLine={false}
          tickLine={false}
          tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === 'revenue' ? 'Ingresos' : 'Proyección',
          ]}
          labelFormatter={formatMonth}
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : 'white',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            color: isDark ? '#f3f4f6' : '#111827',
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#2952d9"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          connectNulls={false}
        />
        {forecast && (
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#34d399"
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#colorForecast)"
            connectNulls={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
