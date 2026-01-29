'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, StatCard, Badge } from '@/components/ui';
import { RevenueChart, BarChart } from '@/components/charts';
import { analyticsApi } from '@/lib/api';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AnalyticsPage() {
  const { hasRole } = useAuth();

  const { data: agentPerformance, isLoading: isAgentLoading } = useQuery({
    queryKey: ['agentPerformance'],
    queryFn: () => analyticsApi.getAgentPerformance(),
    enabled: hasRole(['MANAGEMENT', 'ANALYTICS']),
  });

  const { data: forecast, isLoading: isForecastLoading } = useQuery({
    queryKey: ['revenueForecast'],
    queryFn: () => analyticsApi.getRevenueForecast(),
    enabled: hasRole(['MANAGEMENT', 'ANALYTICS']),
  });

  const { data: retention, isLoading: isRetentionLoading } = useQuery({
    queryKey: ['customerRetention'],
    queryFn: () => analyticsApi.getCustomerRetention(),
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

  if (isAgentLoading || isForecastLoading || isRetentionLoading) {
    return (
      <div>
        <Header title="Analíticas" subtitle="Métricas detalladas de rendimiento" />
        <LoadingPage />
      </div>
    );
  }

  const agentChartData =
    agentPerformance?.agents?.slice(0, 5).map((a: any) => ({
      name: a.agent?.name || 'N/A',
      value: a.metrics?.totalRevenue || 0,
    })) || [];

  return (
    <div>
      <Header title="Analíticas" subtitle="Métricas detalladas de rendimiento" />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(agentPerformance?.summary?.totalRevenue || 0)}
            icon={DollarSign}
          />
          <StatCard
            title="Comisiones Totales"
            value={formatCurrency(agentPerformance?.summary?.totalCommissions || 0)}
            icon={TrendingUp}
          />
          <StatCard
            title="Agentes Activos"
            value={agentPerformance?.summary?.totalAgents || 0}
            icon={Users}
          />
          <StatCard
            title="Tasa Conversión Promedio"
            value={`${(agentPerformance?.summary?.averageConversionRate || 0).toFixed(1)}%`}
            icon={Target}
          />
        </div>

        {/* Revenue Forecast & Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Proyección de Ingresos</h2>
              {forecast?.growthRate !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {forecast.growthRate >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      forecast.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {forecast.growthRate.toFixed(1)}% tasa de crecimiento mensual
                  </span>
                </div>
              )}
            </div>
            <div className="card-body">
              <RevenueChart
                data={forecast?.historical || []}
                forecast={forecast?.forecast}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Retención de Clientes</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">
                    {retention?.newCustomers?.last30Days || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Nuevos clientes (30 días)
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {retention?.retention?.repeatBuyers || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Compradores recurrentes</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {retention?.retention?.fidelityCustomers || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">En etapa fidelización</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {(retention?.retention?.retentionRate || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Tasa de retención</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Rendimiento de Agentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Agente</th>
                  <th>Ventas Totales</th>
                  <th>Completadas</th>
                  <th>Ingresos</th>
                  <th>Comisiones</th>
                  <th>Ticket Promedio</th>
                  <th>Conversión</th>
                  <th>Clientes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agentPerformance?.agents?.map((item: any) => (
                  <tr key={item.agent?.id}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.agent?.name}
                        </p>
                        <p className="text-sm text-gray-500">{item.agent?.email}</p>
                      </div>
                    </td>
                    <td>{item.metrics?.totalSales || 0}</td>
                    <td>{item.metrics?.completedSales || 0}</td>
                    <td className="font-medium">
                      {formatCurrency(item.metrics?.totalRevenue || 0)}
                    </td>
                    <td className="text-green-600">
                      {formatCurrency(item.metrics?.totalCommission || 0)}
                    </td>
                    <td>
                      {formatCurrency(item.metrics?.averageTicket || 0)}
                    </td>
                    <td>
                      <Badge
                        variant={
                          item.metrics?.conversionRate >= 50
                            ? 'success'
                            : item.metrics?.conversionRate >= 25
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {(item.metrics?.conversionRate || 0).toFixed(1)}%
                      </Badge>
                    </td>
                    <td>{item.metrics?.assignedCustomers || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Agents Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Top 5 Agentes por Ingresos</h2>
          </div>
          <div className="card-body">
            <BarChart data={agentChartData} formatValue="currency" />
          </div>
        </div>
      </div>
    </div>
  );
}
