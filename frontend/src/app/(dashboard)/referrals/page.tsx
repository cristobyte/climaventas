'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, Badge, EmptyState, StatCard } from '@/components/ui';
import { referralsApi } from '@/lib/api';
import { formatCurrency, formatDate, referralStatusLabels, referralStatusColors } from '@/lib/utils';
import { Search, Plus, UserPlus, Users, TrendingUp, DollarSign, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const statuses = ['', 'PENDING', 'CONVERTED', 'EXPIRED'];

export default function ReferralsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const canManage = hasRole(['MANAGEMENT']);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['referrals', { status: statusFilter }],
    queryFn: () => referralsApi.getAll({ status: statusFilter || undefined }),
    enabled: hasRole(['MANAGEMENT', 'ANALYTICS']),
  });

  const { data: stats } = useQuery({
    queryKey: ['referralsStats'],
    queryFn: () => referralsApi.getStats(),
    enabled: hasRole(['MANAGEMENT', 'ANALYTICS']),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => referralsApi.convert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });

  const expireMutation = useMutation({
    mutationFn: (id: string) => referralsApi.expire(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
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
        <Header title="Referidos" subtitle="Seguimiento de referidos" />
        <LoadingPage />
      </div>
    );
  }

  return (
    <div>
      <Header title="Referidos" subtitle="Seguimiento de referidos" />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard
            title="Total Referidos"
            value={stats?.total || 0}
            icon={UserPlus}
          />
          <StatCard
            title="Pendientes"
            value={stats?.pending || 0}
            icon={Users}
          />
          <StatCard
            title="Convertidos"
            value={stats?.converted || 0}
            icon={TrendingUp}
          />
          <StatCard
            title="Tasa Conversión"
            value={`${(stats?.conversionRate || 0).toFixed(1)}%`}
            icon={TrendingUp}
          />
          <StatCard
            title="Bonos Pagados"
            value={formatCurrency(stats?.totalBonus || 0)}
            icon={DollarSign}
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Todos los estados</option>
            {statuses.slice(1).map((status) => (
              <option key={status} value={status}>
                {referralStatusLabels[status]}
              </option>
            ))}
          </select>

          <div className="flex-1" />

          {canManage && (
            <Link href="/referrals/new" className="btn-primary whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Referido
            </Link>
          )}
        </div>

        {/* Referrals Table */}
        {referrals && referrals.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente Referido</th>
                    <th>Referente</th>
                    <th>Alianza</th>
                    <th>Bono</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    {canManage && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {referrals.map((referral: any) => (
                    <tr key={referral.id}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">
                            {referral.referredCustomer?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {referral.referredCustomer?.email}
                          </p>
                        </div>
                      </td>
                      <td className="text-sm">
                        {referral.referrerCustomer?.name || '-'}
                      </td>
                      <td className="text-sm">
                        {referral.partnership?.name || '-'}
                      </td>
                      <td className="font-medium">
                        {referral.bonusAmount
                          ? formatCurrency(referral.bonusAmount)
                          : '-'}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            referralStatusColors[referral.status]
                          }`}
                        >
                          {referralStatusLabels[referral.status]}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">
                        {formatDate(referral.createdAt)}
                      </td>
                      {canManage && (
                        <td>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/referrals/${referral.id}`}
                              className="text-primary hover:underline text-sm"
                            >
                              Ver
                            </Link>
                            {referral.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => convertMutation.mutate(referral.id)}
                                  disabled={convertMutation.isPending}
                                  className="text-green-600 hover:text-green-700"
                                  title="Convertir"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => expireMutation.mutate(referral.id)}
                                  disabled={expireMutation.isPending}
                                  className="text-gray-600 hover:text-gray-700"
                                  title="Expirar"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No hay referidos"
            description="Los referidos aparecerán aquí cuando se registren."
            icon={UserPlus}
          />
        )}

        {/* Source Breakdown */}
        {stats?.bySource && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Referidos por Fuente</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">
                    {stats.bySource.partnerships || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Desde Alianzas</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {stats.bySource.customers || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Desde Clientes</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
