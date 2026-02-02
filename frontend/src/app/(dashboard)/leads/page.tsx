'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, EmptyState } from '@/components/ui';
import { leadsApi } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  leadStatusLabels,
  leadStatusColors,
} from '@/lib/utils';
import { Plus, Target, Check, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const statuses = ['', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

export default function LeadsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const canEdit = hasRole(['MANAGEMENT', 'AGENT']);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', { status: statusFilter }],
    queryFn: () => leadsApi.getAll({ status: statusFilter || undefined }),
  });

  const { data: stats } = useQuery({
    queryKey: ['leads', 'stats'],
    queryFn: leadsApi.getStats,
  });

  const wonMutation = useMutation({
    mutationFn: leadsApi.markAsWon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const lostMutation = useMutation({
    mutationFn: leadsApi.markAsLost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Leads" subtitle="Pipeline de oportunidades" />
        <LoadingPage />
      </div>
    );
  }

  const avgClosureChance = stats?.avgClosureChance || 0;
  const totalEstimatedValue = stats?.totalEstimatedValue || 0;

  return (
    <div>
      <Header title="Leads" subtitle="Pipeline de oportunidades" />

      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="card p-4">
            <p className="text-sm text-gray-500">Total Leads</p>
            <p className="text-xl md:text-2xl font-semibold">{stats?.total || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Activos</p>
            <p className="text-xl md:text-2xl font-semibold">
              {(stats?.total || 0) - (stats?.byStatus?.WON || 0) - (stats?.byStatus?.LOST || 0)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Prob. Cierre Prom.</p>
            <p className="text-xl md:text-2xl font-semibold">{avgClosureChance.toFixed(0)}%</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Valor Estimado</p>
            <p className="text-xl md:text-2xl font-semibold">{formatCurrency(totalEstimatedValue)}</p>
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
                {leadStatusLabels[status]}
              </option>
            ))}
          </select>

          <div className="flex-1" />

          {canEdit && (
            <Link href="/leads/new" className="btn-primary whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nuevo Lead</span>
              <span className="sm:hidden">Nuevo</span>
            </Link>
          )}
        </div>

        {/* Leads List */}
        {leads && leads.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {leads.map((lead: any) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium text-gray-900 hover:text-primary block truncate"
                      >
                        {lead.title}
                      </Link>
                      <p className="text-sm text-gray-500 truncate">
                        {lead.customer?.name}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                        leadStatusColors[lead.status]
                      }`}
                    >
                      {leadStatusLabels[lead.status]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-500">{lead.closureChance}% prob.</span>
                    <span className="font-semibold text-gray-900">
                      {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {formatDate(lead.createdAt)}
                    </span>

                    <div className="flex items-center gap-3">
                      {canEdit && !['WON', 'LOST'].includes(lead.status) && (
                        <>
                          <button
                            onClick={() => wonMutation.mutate(lead.id)}
                            disabled={wonMutation.isPending}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marcar como ganado"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => lostMutation.mutate(lead.id)}
                            disabled={lostMutation.isPending}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Marcar como perdido"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <Link
                        href={`/leads/${lead.id}`}
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
                      <th>Título</th>
                      <th>Cliente</th>
                      <th>Agente</th>
                      <th>Prob. Cierre</th>
                      <th>Valor Est.</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leads.map((lead: any) => (
                      <tr key={lead.id}>
                        <td>
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-medium text-gray-900 hover:text-primary"
                          >
                            {lead.title}
                          </Link>
                        </td>
                        <td>
                          <Link
                            href={`/customers/${lead.customer?.id}`}
                            className="text-sm text-gray-600 hover:text-primary"
                          >
                            {lead.customer?.name}
                          </Link>
                        </td>
                        <td className="text-sm text-gray-600">
                          {lead.agent?.name}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  lead.closureChance >= 70
                                    ? 'bg-green-500'
                                    : lead.closureChance >= 40
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${lead.closureChance}%` }}
                              />
                            </div>
                            <span className="text-sm">{lead.closureChance}%</span>
                          </div>
                        </td>
                        <td className="font-medium">
                          {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : '-'}
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              leadStatusColors[lead.status]
                            }`}
                          >
                            {leadStatusLabels[lead.status]}
                          </span>
                        </td>
                        <td className="text-sm text-gray-500">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="text-primary hover:underline text-sm"
                            >
                              Ver
                            </Link>
                            {canEdit && !['WON', 'LOST'].includes(lead.status) && (
                              <>
                                <button
                                  onClick={() => wonMutation.mutate(lead.id)}
                                  disabled={wonMutation.isPending}
                                  className="text-green-600 hover:text-green-700"
                                  title="Ganado"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => lostMutation.mutate(lead.id)}
                                  disabled={lostMutation.isPending}
                                  className="text-red-600 hover:text-red-700"
                                  title="Perdido"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
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
            title="No hay leads"
            description="Comienza registrando tu primer lead."
            icon={Target}
            action={
              canEdit
                ? {
                    label: 'Nuevo Lead',
                    onClick: () => (window.location.href = '/leads/new'),
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
