'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage } from '@/components/ui';
import { leadsApi, customersApi } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  leadStatusLabels,
  leadStatusColors,
} from '@/lib/utils';
import { ArrowLeft, Pencil, Check, X, Trash2, ShoppingCart, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const leadStatuses = [
  { value: 'NEW', label: 'Nuevo' },
  { value: 'CONTACTED', label: 'Contactado' },
  { value: 'QUALIFIED', label: 'Calificado' },
  { value: 'PROPOSAL', label: 'Propuesta' },
  { value: 'NEGOTIATION', label: 'Negociación' },
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['MANAGEMENT', 'AGENT']);
  const canDelete = hasRole(['MANAGEMENT']);

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const { data: lead, isLoading } = useQuery({
    queryKey: ['leads', params.id],
    queryFn: () => leadsApi.getById(params.id as string),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
    enabled: isEditing,
  });

  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    description: '',
    closureChance: 50,
    estimatedValue: '',
    status: 'NEW',
    notes: '',
  });

  const filteredCustomers = customers?.filter((customer: any) => {
    if (!customerSearch) return true;
    const searchLower = customerSearch.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(customerSearch)
    );
  }) || [];

  const selectedCustomer = customers?.find((c: any) => c.id === formData.customerId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data: any) => leadsApi.update(params.id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsEditing(false);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar el lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => leadsApi.delete(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      router.push('/leads');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al eliminar el lead');
    },
  });

  const wonMutation = useMutation({
    mutationFn: () => leadsApi.markAsWon(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', params.id] });
    },
  });

  const lostMutation = useMutation({
    mutationFn: () => leadsApi.markAsLost(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', params.id] });
    },
  });

  const startEditing = () => {
    if (lead) {
      setFormData({
        customerId: lead.customerId,
        title: lead.title,
        description: lead.description || '',
        closureChance: lead.closureChance,
        estimatedValue: lead.estimatedValue?.toString() || '',
        status: lead.status,
        notes: lead.notes || '',
      });
      setIsEditing(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    updateMutation.mutate({
      ...formData,
      estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
      closureChance: Number(formData.closureChance),
    });
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este lead?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Detalle de Lead" subtitle="Cargando..." />
        <LoadingPage />
      </div>
    );
  }

  if (!lead) {
    return (
      <div>
        <Header title="Lead no encontrado" subtitle="" />
        <div className="p-6">
          <Link href="/leads" className="text-primary hover:underline">
            Volver a leads
          </Link>
        </div>
      </div>
    );
  }

  const isFinalized = ['WON', 'LOST'].includes(lead.status);

  return (
    <div>
      <Header title={lead.title} subtitle={`Lead de ${lead.customer?.name}`} />

      <div className="p-4 md:p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/leads"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a leads
          </Link>

          {canEdit && !isEditing && !isFinalized && (
            <div className="flex gap-2">
              <button
                onClick={startEditing}
                className="btn-secondary"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => wonMutation.mutate()}
                disabled={wonMutation.isPending}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Ganado
              </button>
              <button
                onClick={() => lostMutation.mutate()}
                disabled={lostMutation.isPending}
                className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Perdido
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="card p-6 space-y-6">
            {/* Customer Selection - Same as sales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <div className="relative" ref={customerDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={selectedCustomer ? selectedCustomer.name : "Buscar cliente..."}
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className={`input pl-10 pr-10 w-full ${selectedCustomer && !customerSearch ? 'text-gray-900' : ''}`}
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredCustomers?.length > 0 ? (
                      filteredCustomers.map((customer: any) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, customerId: customer.id });
                            setCustomerSearch('');
                            setShowCustomerDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                            formData.customerId === customer.id ? 'bg-primary-50 text-primary' : ''
                          }`}
                        >
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">
                            {customer.email || customer.phone || 'Sin contacto'}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No se encontraron clientes
                      </div>
                    )}
                  </div>
                )}
                {selectedCustomer && !showCustomerDropdown && (
                  <p className="text-sm text-gray-500 mt-1">
                    Seleccionado: {selectedCustomer.name}
                    {selectedCustomer.email && ` - ${selectedCustomer.email}`}
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input w-full"
                rows={3}
              />
            </div>

            {/* Closure Chance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probabilidad de Cierre: {formData.closureChance}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.closureChance}
                onChange={(e) => setFormData({ ...formData, closureChance: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Estimated Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Estimado (CLP)
              </label>
              <input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                className="input w-full"
                min="0"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input w-full"
              >
                {leadStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input w-full"
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-4">
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn-primary"
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            {/* Lead Details View */}
            <div className="card p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{lead.title}</h2>
                  <p className="text-gray-500">{lead.description || 'Sin descripción'}</p>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    leadStatusColors[lead.status]
                  }`}
                >
                  {leadStatusLabels[lead.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Cliente</h3>
                  <Link
                    href={`/customers/${lead.customer?.id}`}
                    className="text-primary hover:underline"
                  >
                    {lead.customer?.name}
                  </Link>
                  <p className="text-sm text-gray-600">{lead.customer?.email}</p>
                  <p className="text-sm text-gray-600">{lead.customer?.phone}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Agente Asignado</h3>
                  <p className="text-gray-900">{lead.agent?.name}</p>
                  <p className="text-sm text-gray-600">{lead.agent?.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Probabilidad de Cierre</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          lead.closureChance >= 70
                            ? 'bg-green-500'
                            : lead.closureChance >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${lead.closureChance}%` }}
                      />
                    </div>
                    <span className="text-lg font-semibold">{lead.closureChance}%</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Valor Estimado</h3>
                  <p className="text-xl font-semibold text-gray-900">
                    {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : 'No especificado'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Fecha de Creación</h3>
                  <p className="text-gray-900">{formatDate(lead.createdAt)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Última Actualización</h3>
                  <p className="text-gray-900">{formatDate(lead.updatedAt)}</p>
                </div>
              </div>

              {lead.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notas</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>

            {/* Sales from this Lead */}
            {lead.sales && lead.sales.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Ventas Generadas
                </h3>
                <div className="space-y-3">
                  {lead.sales.map((sale: any) => (
                    <Link
                      key={sale.id}
                      href={`/sales/${sale.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">
                            {sale.product?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(sale.saleDate)}
                          </p>
                        </div>
                        <p className="font-semibold text-primary">
                          {formatCurrency(sale.totalAmount)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action: Create Sale from Lead */}
            {canEdit && lead.status === 'WON' && (
              <div className="mt-6">
                <Link
                  href={`/sales/new?leadId=${lead.id}&customerId=${lead.customerId}`}
                  className="btn-primary inline-flex items-center"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Crear Venta desde este Lead
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
