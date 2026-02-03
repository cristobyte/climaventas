'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage } from '@/components/ui';
import { customersApi, usersApi } from '@/lib/api';
import { stageLabels, sourceLabels } from '@/lib/utils';
import { ArrowLeft, Save, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const stages = ['PROSPECTING', 'PRE_SALES', 'SALES', 'POST_PURCHASE', 'SERVICE', 'FIDELITY'];
const sources = ['REFERRAL', 'WEBSITE', 'PARTNERSHIP', 'DIRECT', 'OTHER'];

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { hasRole, user: currentUser } = useAuth();
  const canDelete = hasRole(['MANAGEMENT']);
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

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', params.id],
    queryFn: () => customersApi.getById(params.id as string),
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => usersApi.getActiveAgents(),
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        region: customer.region || '',
        stage: customer.stage || 'PROSPECTING',
        source: customer.source || 'DIRECT',
        assignedAgentId: customer.assignedAgentId || '',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => customersApi.update(params.id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', params.id] });
      router.push(`/customers/${params.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar el cliente');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => customersApi.delete(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push('/customers');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al eliminar el cliente');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const data = {
      ...formData,
      assignedAgentId: formData.assignedAgentId || null,
    };

    updateMutation.mutate(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Editar Cliente" subtitle="Cargando..." />
        <LoadingPage />
      </div>
    );
  }

  if (!customer) {
    return (
      <div>
        <Header title="Cliente no encontrado" subtitle="" />
        <div className="p-6">
          <Link href="/customers" className="text-primary hover:underline">
            Volver a clientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Editar Cliente" subtitle={customer.name} />

      <div className="p-6">
        <Link
          href={`/customers/${params.id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al cliente
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
                  <div className="flex gap-2">
                    <select
                      id="assignedAgentId"
                      name="assignedAgentId"
                      value={formData.assignedAgentId}
                      onChange={handleChange}
                      className="input flex-1"
                    >
                      <option value="">Sin asignar</option>
                      {agents?.map((agent: any) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.role})
                        </option>
                      ))}
                    </select>
                    {currentUser && formData.assignedAgentId !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, assignedAgentId: currentUser.id })}
                        className="btn-outline whitespace-nowrap"
                        title="Asignarme a mí"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Asignarme
                      </button>
                    )}
                  </div>
                  {formData.assignedAgentId === currentUser?.id && (
                    <p className="text-xs text-green-600 mt-1">
                      Te has asignado como agente de este cliente
                    </p>
                  )}
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

              <div className="flex justify-between pt-4 border-t border-gray-200">
                {canDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="btn-danger"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <Link href={`/customers/${params.id}`} className="btn-outline">
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="btn-primary"
                  >
                    {updateMutation.isPending ? (
                      'Guardando...'
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
