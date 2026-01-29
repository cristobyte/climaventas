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
import { Search, Plus, Filter, Users } from 'lucide-react';
import Link from 'next/link';

const stages = ['', 'PROSPECTING', 'PRE_SALES', 'SALES', 'POST_PURCHASE', 'SERVICE', 'FIDELITY'];
const sources = ['', 'REFERRAL', 'WEBSITE', 'PARTNERSHIP', 'DIRECT', 'OTHER'];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

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

      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

          <Link href="/customers/new" className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Link>
        </div>

        {/* Customers Table */}
        {customers && customers.length > 0 ? (
          <div className="card overflow-hidden">
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
