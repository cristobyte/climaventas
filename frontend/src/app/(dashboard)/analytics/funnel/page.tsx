'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, StatCard } from '@/components/ui';
import { FunnelChart } from '@/components/charts';
import { analyticsApi } from '@/lib/api';
import { stageLabels } from '@/lib/utils';
import { Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function FunnelPage() {
  const { hasRole } = useAuth();

  const { data: funnel, isLoading } = useQuery({
    queryKey: ['salesFunnel'],
    queryFn: () => analyticsApi.getSalesFunnel(),
    enabled: hasRole(['MANAGEMENT', 'ANALYTICS']),
  });

  if (!hasRole(['MANAGEMENT', 'ANALYTICS'])) {
    return (
      <div>
        <Header title="Acceso Denegado" />
        <div className="p-6">
          <p>No tienes permisos para ver esta página.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Header title="Embudo de Ventas" subtitle="Análisis del ciclo de vida del cliente" />
        <LoadingPage />
      </div>
    );
  }

  return (
    <div>
      <Header title="Embudo de Ventas" subtitle="Análisis del ciclo de vida del cliente" />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Clientes"
            value={funnel?.total || 0}
            icon={Users}
          />
          <StatCard
            title="En Prospección"
            value={funnel?.funnel?.find((f: any) => f.stage === 'PROSPECTING')?.count || 0}
            icon={TrendingUp}
          />
          <StatCard
            title="Fidelizados"
            value={funnel?.funnel?.find((f: any) => f.stage === 'FIDELITY')?.count || 0}
            icon={Users}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Visualization */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Distribución por Etapa</h2>
            </div>
            <div className="card-body">
              <FunnelChart data={funnel?.funnel || []} />
            </div>
          </div>

          {/* Conversion Rates */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Tasas de Conversión</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {funnel?.conversions?.map((conv: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {stageLabels[conv.from]}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {stageLabels[conv.to]}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${
                          conv.rate >= 50
                            ? 'text-green-600'
                            : conv.rate >= 25
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {conv.rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stage Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Detalle por Etapa</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Clientes</th>
                  <th>% del Total</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {funnel?.funnel?.map((stage: any) => (
                  <tr key={stage.stage}>
                    <td className="font-medium">{stageLabels[stage.stage]}</td>
                    <td>{stage.count}</td>
                    <td>{stage.percentage.toFixed(1)}%</td>
                    <td className="text-sm text-gray-500">
                      {stage.stage === 'PROSPECTING' && 'Clientes en proceso de captación inicial'}
                      {stage.stage === 'PRE_SALES' && 'Clientes con interés demostrado, en evaluación'}
                      {stage.stage === 'SALES' && 'Clientes en proceso de compra activo'}
                      {stage.stage === 'POST_PURCHASE' && 'Clientes con compra reciente'}
                      {stage.stage === 'SERVICE' && 'Clientes en proceso de instalación o servicio'}
                      {stage.stage === 'FIDELITY' && 'Clientes recurrentes y satisfechos'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
