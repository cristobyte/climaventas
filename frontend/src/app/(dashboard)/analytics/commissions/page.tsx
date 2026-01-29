'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, StatCard, Badge } from '@/components/ui';
import { analyticsApi, usersApi } from '@/lib/api';
import { formatCurrency, formatDate, categoryLabels } from '@/lib/utils';
import { DollarSign, TrendingUp, ShoppingCart, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function CommissionsPage() {
  const { hasRole } = useAuth();
  const [agentFilter, setAgentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: users } = useQuery({
    queryKey: ['users', { role: 'AGENT' }],
    queryFn: () => usersApi.getAll({ role: 'AGENT' }),
    enabled: hasRole(['MANAGEMENT', 'ANALYTICS']),
  });

  const { data: commissions, isLoading } = useQuery({
    queryKey: ['commissions', { agentId: agentFilter, dateFrom, dateTo }],
    queryFn: () =>
      analyticsApi.getCommissions({
        agentId: agentFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
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
        <Header title="Comisiones" subtitle="Reporte detallado de comisiones" />
        <LoadingPage />
      </div>
    );
  }

  return (
    <div>
      <Header title="Comisiones" subtitle="Reporte detallado de comisiones" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="label">Agente</label>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="input w-48"
              >
                <option value="">Todos los agentes</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Ventas Completadas"
            value={commissions?.summary?.totalSales || 0}
            icon={ShoppingCart}
          />
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(commissions?.summary?.totalRevenue || 0)}
            icon={DollarSign}
          />
          <StatCard
            title="Comisiones Totales"
            value={formatCurrency(commissions?.summary?.totalCommission || 0)}
            icon={TrendingUp}
          />
          <StatCard
            title="Tasa Promedio"
            value={`${(commissions?.summary?.averageCommissionRate || 0).toFixed(1)}%`}
            icon={Users}
          />
        </div>

        {/* By Agent */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Comisiones por Agente</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Agente</th>
                  <th>Ventas</th>
                  <th>Ingresos</th>
                  <th>Comisión Total</th>
                  <th>Promedio por Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commissions?.byAgent?.map((item: any) => (
                  <tr key={item.agent?.id}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.agent?.name}
                        </p>
                        <p className="text-sm text-gray-500">{item.agent?.email}</p>
                      </div>
                    </td>
                    <td>{item.sales?.length || 0}</td>
                    <td className="font-medium">
                      {formatCurrency(item.totalRevenue || 0)}
                    </td>
                    <td className="font-medium text-green-600">
                      {formatCurrency(item.totalCommission || 0)}
                    </td>
                    <td>
                      {formatCurrency(
                        item.sales?.length > 0
                          ? item.totalCommission / item.sales.length
                          : 0
                      )}
                    </td>
                  </tr>
                ))}
                {(!commissions?.byAgent || commissions.byAgent.length === 0) && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-8">
                      No hay datos de comisiones para los filtros seleccionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Category */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Comisiones por Categoría</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Ventas</th>
                  <th>Ingresos</th>
                  <th>Comisión Total</th>
                  <th>Tasa Promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commissions?.byCategory?.map((item: any) => (
                  <tr key={item.category}>
                    <td>
                      <Badge variant="primary">
                        {categoryLabels[item.category] || item.category}
                      </Badge>
                    </td>
                    <td>{item.salesCount || 0}</td>
                    <td className="font-medium">
                      {formatCurrency(item.totalRevenue || 0)}
                    </td>
                    <td className="font-medium text-green-600">
                      {formatCurrency(item.totalCommission || 0)}
                    </td>
                    <td>
                      {item.totalRevenue > 0
                        ? ((item.totalCommission / item.totalRevenue) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Detalle de Ventas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Agente</th>
                  <th>Total Venta</th>
                  <th>Comisión</th>
                  <th>Tasa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commissions?.details?.slice(0, 20).map((sale: any) => (
                  <tr key={sale.id}>
                    <td className="text-sm text-gray-500">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="text-sm">{sale.customer?.name}</td>
                    <td>
                      <div>
                        <p className="text-sm">{sale.product?.name}</p>
                        <p className="text-xs text-gray-500">
                          {categoryLabels[sale.product?.category]}
                        </p>
                      </div>
                    </td>
                    <td className="text-sm">{sale.agent?.name}</td>
                    <td className="font-medium">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="font-medium text-green-600">
                      {formatCurrency(sale.commissionAmount)}
                    </td>
                    <td className="text-sm">
                      {sale.totalAmount > 0
                        ? ((sale.commissionAmount / sale.totalAmount) * 100).toFixed(1)
                        : 0}
                      %
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
