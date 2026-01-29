'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, Badge, EmptyState } from '@/components/ui';
import { customersApi } from '@/lib/api';
import {
  formatDate,
  stageLabels,
  stageColors,
  sourceLabels,
} from '@/lib/utils';
import { Search, Plus, Filter, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const stages = ['', 'PROSPECTING', 'PRE_SALES', 'SALES', 'POST_PURCHASE', 'SERVICE', 'FIDELITY'];
const sources = ['', 'REFERRAL', 'WEBSITE', 'PARTNERSHIP', 'DIRECT', 'OTHER'];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', { search, stage: stageFilter, source: sourceFilter }],
    queryFn: () =>
      customersApi.getAll({
        search: search || undefined,
        stage: stageFilter || undefined,
        source: sourceFilter || undefined,
      }),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Clientes" subtitle="Gestión de clientes" />
        <LoadingPage />
      </div>
    );
  }

  return (
    <div>
      <Header title="Clientes" subtitle="Gestión de clientes" />

      <div className="p-4 md:p-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search and main actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="flex gap-2">
              {/* Filter toggle for mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline md:hidden flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>

              <Link href="/customers/new" className="btn-primary whitespace-nowrap flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nuevo Cliente</span>
                <span className="sm:hidden">Nuevo</span>
              </Link>
            </div>
          </div>

          {/* Filters - always visible on desktop, collapsible on mobile */}
          <div className={`flex flex-col sm:flex-row gap-3 ${showFilters ? 'block' : 'hidden md:flex'}`}>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="input w-full sm:w-48"
            >
              <option value="">Todas las etapas</option>
              {stages.slice(1).map((stage) => (
                <option key={stage} value={stage}>
                  {stageLabels[stage]}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="input w-full sm:w-48"
            >
              <option value="">Todas las fuentes</option>
              {sources.slice(1).map((source) => (
                <option key={source} value={source}>
                  {sourceLabels[source]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customers List */}
        {customers && customers.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {customers.map((customer: any) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {customer.name}
                      </p>
                      {customer.city && (
                        <p className="text-sm text-gray-500">
                          {customer.city}, {customer.region}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                        stageColors[customer.stage]
                      }`}
                    >
                      {stageLabels[customer.stage]}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      {customer.email || customer.phone || '-'}
                    </div>
                    <div className="flex items-center text-gray-400">
                      <span className="mr-1">{customer._count?.sales || 0} ventas</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{sourceLabels[customer.source]}</span>
                    <span>{formatDate(customer.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th>Etapa</th>
                      <th>Fuente</th>
                      <th>Agente</th>
                      <th>Ventas</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map((customer: any) => (
                      <tr key={customer.id}>
                        <td>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.name}
                            </p>
                            {customer.city && (
                              <p className="text-sm text-gray-500">
                                {customer.city}, {customer.region}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <p>{customer.email || '-'}</p>
                            <p className="text-gray-500">{customer.phone || '-'}</p>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              stageColors[customer.stage]
                            }`}
                          >
                            {stageLabels[customer.stage]}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-gray-600">
                            {sourceLabels[customer.source]}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-gray-600">
                            {customer.assignedAgent?.name || '-'}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-gray-900">
                            {customer._count?.sales || 0}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-gray-500">
                            {formatDate(customer.createdAt)}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/customers/${customer.id}`}
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
          </>
        ) : (
          <EmptyState
            title="No hay clientes"
            description="Comienza agregando tu primer cliente al sistema."
            icon={Users}
            action={{
              label: 'Agregar Cliente',
              onClick: () => (window.location.href = '/customers/new'),
            }}
          />
        )}
      </div>
    </div>
  );
}
