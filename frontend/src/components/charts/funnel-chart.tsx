'use client';

import { stageLabels } from '@/lib/utils';

interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

interface FunnelChartProps {
  data: FunnelData[];
}

const stageColors: Record<string, string> = {
  PROSPECTING: '#94a3b8',
  PRE_SALES: '#60a5fa',
  SALES: '#fbbf24',
  POST_PURCHASE: '#34d399',
  SERVICE: '#a78bfa',
  FIDELITY: '#2952d9',
};

export function FunnelChart({ data }: FunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        const color = stageColors[item.stage] || '#94a3b8';

        return (
          <div key={item.stage} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {stageLabels[item.stage] || item.stage}
              </span>
              <span className="text-sm text-gray-500">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded transition-all duration-500"
                style={{
                  width: `${Math.max(width, 2)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            {index < data.length - 1 && (
              <div className="flex justify-center my-1">
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
