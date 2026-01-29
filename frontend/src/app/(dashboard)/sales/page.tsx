'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, Badge, EmptyState } from '@/components/ui';
import { salesApi } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  statusLabels,
  statusColors,
} from '@/lib/utils';
import { Search, Plus, ShoppingCart, Check, X, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const statuses = ['', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'];

export default function SalesPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const canApprove = hasRole(['MANAGEMENT']);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales', { status: statusFilter }],
    queryFn: () => salesApi.getAll({ status: statusFilter || undefined }),
  });

  const approveMutation = useMutation({
    mutationFn: salesApi.approve,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });

  const completeMutation = useMutation({
    mutationFn: salesApi.complete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: salesApi.cancel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Ventas" subtitle="Pipeline de ventas" />
        <LoadingPage />
      </div>
    );
  }

  const totalRevenue =
    sales
      ?.filter((s: any) => s.status === 'COMPLETED')
      .reduce((sum: number, s: any) => sum + s.totalAmount, 0) || 0;

  const pendingCount = sales?.filter((s: any) => s.status === 'PENDING').length || 0;

  return (
    <div>
      <Header title="Ventas" subtitle="Pipeline de ventas" />

      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="card p-4">
            <p className="text-sm text-gray-500">Total Ventas</p>
            <p className="text-xl md:text-2xl font-semibold">{sales?.length || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Ingresos Completados</p>
            <p className="text-xl md:text-2xl font-semibold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Pendientes de Aprobar</p>
            <p className="text-xl md:text-2xl font-semibold">{pendingCount}</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Todos los estados</option>
            {statuses.slice(1).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <div className="flex-1" />

          <Link href="/sales/new" className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nueva Venta</span>
            <span className="sm:hidden">Nueva</span>
          </Link>
        </div>

        {/* Sales List */}
        {sales && sales.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {sales.map((sale: any) => (
                <div
                  key={sale.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/customers/${sale.customer?.id}`}
                        className="font-medium text-gray-900 hover:text-primary block truncate"
                      >
                        {sale.customer?.name}
                      </Link>
                      <p className="text-sm text-gray-500 truncate">
                        {sale.product?.name}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                        statusColors[sale.status]
                      }`}
                    >
                      {statusLabels[sale.status]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-500">{sale.agent?.name}</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {formatDate(sale.saleDate)}
                    </span>

                    <div className="flex items-center gap-3">
                      {canApprove && sale.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => approveMutation.mutate(sale.id)}
                            disabled={approveMutation.isPending}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Aprobar"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => cancelMutation.mutate(sale.id)}
                            disabled={cancelMutation.isPending}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {canApprove && sale.status === 'APPROVED' && (
                        <button
                          onClick={() => completeMutation.mutate(sale.id)}
                          disabled={completeMutation.isPending}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Completar"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      <Link
                        href={`/sales/${sale.id}`}
                        className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Producto</th>
                      <th>Agente</th>
                      <th>Cantidad</th>
                      <th>Total</th>
                      <th>Comisión</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sales.map((sale: any) => (
                      <tr key={sale.id}>
                        <td>
                          <Link
                            href={`/customers/${sale.customer?.id}`}
                            className="font-medium text-gray-900 hover:text-primary"
                          >
                            {sale.customer?.name}
                          </Link>
                        </td>
                        <td>
                          <p className="text-sm">{sale.product?.name}</p>
                          <p className="text-xs text-gray-500">
                            {sale.product?.category}
                          </p>
                        </td>
                        <td className="text-sm text-gray-600">
                          {sale.agent?.name}
                        </td>
                        <td className="text-sm">{sale.quantity}</td>
                        <td className="font-medium">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="text-sm text-gray-600">
                          {formatCurrency(sale.commissionAmount)}
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[sale.status]
                            }`}
                          >
                            {statusLabels[sale.status]}
                          </span>
                        </td>
                        <td className="text-sm text-gray-500">
                          {formatDate(sale.saleDate)}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/sales/${sale.id}`}
                              className="text-primary hover:underline text-sm"
                            >
                              Ver
                            </Link>
                            {canApprove && sale.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => approveMutation.mutate(sale.id)}
                                  disabled={approveMutation.isPending}
                                  className="text-green-600 hover:text-green-700"
                                  title="Aprobar"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => cancelMutation.mutate(sale.id)}
                                  disabled={cancelMutation.isPending}
                                  className="text-red-600 hover:text-red-700"
                                  title="Cancelar"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {canApprove && sale.status === 'APPROVED' && (
                              <button
                                onClick={() => completeMutation.mutate(sale.id)}
                                disabled={completeMutation.isPending}
                                className="text-green-600 hover:text-green-700"
                                title="Completar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No hay ventas"
            description="Comienza registrando tu primera venta."
            icon={ShoppingCart}
            action={{
              label: 'Nueva Venta',
              onClick: () => (window.location.href = '/sales/new'),
            }}
          />
        )}
      </div>
    </div>
  );
}
