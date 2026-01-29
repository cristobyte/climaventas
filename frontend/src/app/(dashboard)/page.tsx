'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { StatCard, LoadingPage, Badge } from '@/components/ui';
import { FunnelChart, RevenueChart, BarChart } from '@/components/charts';
import { analyticsApi } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  stageLabels,
  stageColors,
  statusLabels,
  statusColors,
} from '@/lib/utils';
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { hasRole } = useAuth();
  const canViewAnalytics = hasRole(['MANAGEMENT', 'ANALYTICS']);

  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsApi.getDashboard(),
    enabled: canViewAnalytics,
  });

  const { data: funnel, isLoading: isFunnelLoading } = useQuery({
    queryKey: ['salesFunnel'],
    queryFn: () => analyticsApi.getSalesFunnel(),
    enabled: canViewAnalytics,
  });

  const { data: forecast, isLoading: isForecastLoading } = useQuery({
    queryKey: ['revenueForecast'],
    queryFn: () => analyticsApi.getRevenueForecast(),
    enabled: canViewAnalytics,
  });

  if (!canViewAnalytics) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Bienvenido a ClimaVentas" />
        <div className="p-6">
          <div className="card p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bienvenido a ClimaVentas
            </h2>
            <p className="text-gray-500 mb-4">
              Usa la navegación lateral para acceder a tus clientes y ventas.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/customers" className="btn-primary">
                Ver Clientes
              </Link>
              <Link href="/sales" className="btn-outline">
                Ver Ventas
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isDashboardLoading || isFunnelLoading || isForecastLoading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Resumen de métricas" />
        <LoadingPage />
      </div>
    );
  }

  const topProductsData =
    dashboard?.topProducts?.map((p: any) => ({
      name: p.product?.name || 'N/A',
      value: p.revenue || 0,
    })) || [];

  const topAgentsData =
    dashboard?.topAgents?.map((a: any) => ({
      name: a.agent?.name || 'N/A',
      value: a.revenue || 0,
    })) || [];

  return (
    <div>
      <Header title="Dashboard" subtitle="Resumen de métricas" />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(dashboard?.summary?.totalRevenue || 0)}
            subtitle={`${dashboard?.summary?.salesCount || 0} ventas completadas`}
            icon={DollarSign}
          />
          <StatCard
            title="Clientes Totales"
            value={dashboard?.summary?.customersTotal || 0}
            icon={Users}
          />
          <StatCard
            title="Comisiones"
            value={formatCurrency(dashboard?.summary?.totalCommissions || 0)}
            icon={TrendingUp}
          />
          <StatCard
            title="Ticket Promedio"
            value={formatCurrency(dashboard?.summary?.averageTicket || 0)}
            icon={ShoppingCart}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Ingresos Mensuales
              </h2>
              {forecast?.growthRate && (
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
                    {forecast.growthRate.toFixed(1)}% crecimiento
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

          {/* Sales Funnel */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Embudo de Ventas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {funnel?.total || 0} clientes totales
              </p>
            </div>
            <div className="card-body">
              <FunnelChart data={funnel?.funnel || []} />
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Productos
              </h2>
            </div>
            <div className="card-body">
              <BarChart data={topProductsData} formatValue="currency" />
            </div>
          </div>

          {/* Top Agents */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Agentes
              </h2>
            </div>
            <div className="card-body">
              <BarChart data={topAgentsData} formatValue="currency" />
            </div>
          </div>

          {/* Recent Sales */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Ventas Recientes
              </h2>
              <Link
                href="/sales"
                className="text-sm text-primary hover:underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboard?.recentSales?.slice(0, 5).map((sale: any) => (
                <div key={sale.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sale.customer?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.product?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                      <Badge
                        variant={
                          sale.status === 'COMPLETED'
                            ? 'success'
                            : sale.status === 'PENDING'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {statusLabels[sale.status]}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {(!dashboard?.recentSales || dashboard.recentSales.length === 0) && (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  No hay ventas recientes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customers by Stage */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Clientes por Etapa
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(dashboard?.customersByStage || {}).map(
                ([stage, count]) => (
                  <div
                    key={stage}
                    className="p-4 rounded-lg bg-gray-50 text-center"
                  >
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                        stageColors[stage] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {stageLabels[stage] || stage}
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {count as number}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
