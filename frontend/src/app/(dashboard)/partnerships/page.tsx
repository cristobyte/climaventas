'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, Badge, EmptyState, StatCard } from '@/components/ui';
import { partnershipsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Building2, Users, TrendingUp, Percent } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function PartnershipsPage() {
  const { hasRole } = useAuth();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: partnerships, isLoading } = useQuery({
    queryKey: ['partnerships', { isActive: !showInactive ? true : undefined, search }],
    queryFn: () =>
      partnershipsApi.getAll({
        isActive: !showInactive ? true : undefined,
        search: search || undefined,
      }),
    enabled: hasRole(['MANAGEMENT', 'ANALYTICS']),
  });

  const { data: stats } = useQuery({
    queryKey: ['partnershipsStats'],
    queryFn: () => partnershipsApi.getStats(),
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
        <Header title="Alianzas" subtitle="Gestión de alianzas comerciales" />
        <LoadingPage />
      </div>
    );
  }

  return (
    <div>
      <Header title="Alianzas" subtitle="Gestión de alianzas comerciales" />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Alianzas"
            value={stats?.total || 0}
            icon={Building2}
          />
          <StatCard
            title="Alianzas Activas"
            value={stats?.active || 0}
            icon={Users}
          />
          <StatCard
            title="Referidos Totales"
            value={stats?.totalReferrals || 0}
            icon={TrendingUp}
          />
          <StatCard
            title="Tasa Conversión"
            value={`${(stats?.conversionRate || 0).toFixed(1)}%`}
            icon={Percent}
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar alianzas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Mostrar inactivas
          </label>

          {hasRole(['MANAGEMENT']) && (
            <Link href="/partnerships/new" className="btn-primary whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Alianza
            </Link>
          )}
        </div>

        {/* Partnerships Table */}
        {partnerships && partnerships.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Alianza</th>
                    <th>Contacto</th>
                    <th>Tipo</th>
                    <th>Comisión</th>
                    <th>Referidos</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {partnerships.map((partnership: any) => (
                    <tr key={partnership.id}>
                      <td>
                        <p className="font-medium text-gray-900">
                          {partnership.name}
                        </p>
                      </td>
                      <td>
                        <div className="text-sm">
                          <p>{partnership.contactName || '-'}</p>
                          <p className="text-gray-500">{partnership.email || '-'}</p>
                        </div>
                      </td>
                      <td className="text-sm">
                        {partnership.partnershipType || '-'}
                      </td>
                      <td className="text-sm">
                        {(partnership.commissionRate * 100).toFixed(1)}%
                      </td>
                      <td>{partnership._count?.referrals || 0}</td>
                      <td>
                        <Badge variant={partnership.isActive ? 'success' : 'danger'}>
                          {partnership.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="text-sm text-gray-500">
                        {formatDate(partnership.createdAt)}
                      </td>
                      <td>
                        <Link
                          href={`/partnerships/${partnership.id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No hay alianzas"
            description="Comienza creando tu primera alianza comercial."
            icon={Building2}
            action={
              hasRole(['MANAGEMENT'])
                ? {
                    label: 'Nueva Alianza',
                    onClick: () => (window.location.href = '/partnerships/new'),
                  }
                : undefined
            }
          />
        )}

        {/* Top Partners */}
        {stats?.topPartners && stats.topPartners.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Top Alianzas por Referidos</h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {stats.topPartners.map((partner: any, index: number) => (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{partner.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{partner.referrals} referidos</p>
                      <p className="text-sm text-green-600">
                        {partner.converted} convertidos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
