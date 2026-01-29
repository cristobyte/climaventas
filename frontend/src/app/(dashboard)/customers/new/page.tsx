'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { customersApi, usersApi } from '@/lib/api';
import { stageLabels, sourceLabels } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const stages = ['PROSPECTING', 'PRE_SALES', 'SALES', 'POST_PURCHASE', 'SERVICE', 'FIDELITY'];
const sources = ['REFERRAL', 'WEBSITE', 'PARTNERSHIP', 'DIRECT', 'OTHER'];

export default function NewCustomerPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    stage: 'PROSPECTING',
    source: 'DIRECT',
    assignedAgentId: '',
    notes: '',
  });

  const { data: users } = useQuery({
    queryKey: ['users', { role: 'AGENT' }],
    queryFn: () => usersApi.getAll({ role: 'AGENT' }),
  });

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: (data) => {
      router.push(`/customers/${data.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al crear el cliente');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const data = {
      ...formData,
      assignedAgentId: formData.assignedAgentId || undefined,
    };

    createMutation.mutate(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <Header title="Nuevo Cliente" subtitle="Crear un nuevo cliente" />

      <div className="p-6">
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a clientes
        </Link>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="card">
            <div className="card-body space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="label">
                    Nombre *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="label">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                    placeholder="+56912345678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="label">
                    Dirección
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="label">
                    Ciudad
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="region" className="label">
                    Región
                  </label>
                  <input
                    id="region"
                    name="region"
                    type="text"
                    value={formData.region}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="stage" className="label">
                    Etapa
                  </label>
                  <select
                    id="stage"
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="input"
                  >
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stageLabels[stage]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="source" className="label">
                    Fuente
                  </label>
                  <select
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="input"
                  >
                    {sources.map((source) => (
                      <option key={source} value={source}>
                        {sourceLabels[source]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="assignedAgentId" className="label">
                    Agente Asignado
                  </label>
                  <select
                    id="assignedAgentId"
                    name="assignedAgentId"
                    value={formData.assignedAgentId}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Sin asignar</option>
                    {users?.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="notes" className="label">
                    Notas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input min-h-[100px]"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href="/customers" className="btn-outline">
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cliente
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
