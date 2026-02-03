'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { LoadingPage, Badge } from '@/components/ui';
import { customersApi, interactionsApi, leadsApi } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  stageLabels,
  stageColors,
  sourceLabels,
  statusLabels,
  statusColors,
  interactionTypeLabels,
  leadStatusLabels,
  leadStatusColors,
} from '@/lib/utils';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Edit2,
  ShoppingCart,
  MessageSquare,
  FileText,
  PhoneCall,
  MessageCircle,
  Trash2,
  Target,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const stages = ['PROSPECTING', 'PRE_SALES', 'SALES', 'POST_PURCHASE', 'SERVICE', 'FIDELITY'];

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['MANAGEMENT', 'AGENT']);
  const canDelete = hasRole(['MANAGEMENT']);

  const [newStage, setNewStage] = useState('');
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', params.id],
    queryFn: () => customersApi.getById(params.id as string),
  });

  const { data: leads } = useQuery({
    queryKey: ['leads', { customerId: params.id }],
    queryFn: () => leadsApi.getAll({ customerId: params.id as string }),
    enabled: !!params.id,
  });

  const updateStageMutation = useMutation({
    mutationFn: (stage: string) =>
      customersApi.updateStage(params.id as string, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', params.id] });
      setNewStage('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => customersApi.delete(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push('/customers');
    },
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Cargando..." />
        <LoadingPage />
      </div>
    );
  }

  if (!customer) {
    return (
      <div>
        <Header title="Cliente no encontrado" />
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300">El cliente no existe o no tienes acceso.</p>
          <Link href="/customers" className="btn-primary mt-4">
            Volver a clientes
          </Link>
        </div>
      </div>
    );
  }

  const interactionIcons: Record<string, React.ElementType> = {
    CALL: PhoneCall,
    EMAIL: Mail,
    VISIT: MapPin,
    WHATSAPP: MessageCircle,
    NOTE: FileText,
  };

  return (
    <div>
      <Header
        title={customer.name}
        subtitle={`${stageLabels[customer.stage]} - ${sourceLabels[customer.source]}`}
      />

      <div className="p-6">
        {/* Back Button */}
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a clientes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info Card */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Información del Cliente</h2>
                <div className="flex gap-2">
                  {canEdit && (
                    <Link
                      href={`/customers/${customer.id}/edit`}
                      className="btn-outline text-sm"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-danger text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-white">{customer.email || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                        <p className="text-gray-900 dark:text-white">{customer.phone || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                        <p className="text-gray-900 dark:text-white">
                          {customer.address || '-'}
                          {customer.city && `, ${customer.city}`}
                          {customer.region && `, ${customer.region}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Agente Asignado</p>
                        <p className="text-gray-900 dark:text-white">
                          {customer.assignedAgent?.name || 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Registro</p>
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(customer.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {customer.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notas</p>
                    <p className="text-gray-900 dark:text-white">{customer.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Leads */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Leads ({leads?.length || 0})
                </h2>
                {canEdit && (
                  <Link
                    href={`/leads/new?customerId=${customer.id}`}
                    className="btn-primary text-sm"
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Nuevo Lead
                  </Link>
                )}
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {leads?.length > 0 ? (
                  leads.map((lead: any) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(lead.createdAt)} - {lead.closureChance}% prob.
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              leadStatusColors[lead.status]
                            }`}
                          >
                            {leadStatusLabels[lead.status]}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay leads registrados
                  </div>
                )}
              </div>
            </div>

            {/* Sales History */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Historial de Ventas ({customer.sales?.length || 0})
                </h2>
                {canEdit && (
                  <Link
                    href={`/sales/new?customerId=${customer.id}`}
                    className="btn-primary text-sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Nueva Venta
                  </Link>
                )}
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {customer.sales?.length > 0 ? (
                  customer.sales.map((sale: any) => (
                    <Link
                      key={sale.id}
                      href={`/sales/${sale.id}`}
                      className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {sale.product?.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(sale.saleDate)} - Cantidad: {sale.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(sale.totalAmount)}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[sale.status]
                              }`}
                            >
                              {statusLabels[sale.status]}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay ventas registradas
                  </div>
                )}
              </div>
            </div>

            {/* Interactions History */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Interacciones ({customer.interactions?.length || 0})
                </h2>
                {canEdit && (
                  <button
                    onClick={() => setShowInteractionForm(true)}
                    className="btn-outline text-sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Nueva Interacción
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {customer.interactions?.length > 0 ? (
                  customer.interactions.map((interaction: any) => {
                    const Icon = interactionIcons[interaction.type] || MessageSquare;
                    return (
                      <div key={interaction.id} className="px-6 py-4">
                        <div className="flex gap-4">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg h-fit">
                            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {interaction.subject}
                              </span>
                              <Badge variant="gray">
                                {interactionTypeLabels[interaction.type]}
                              </Badge>
                            </div>
                            {interaction.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {interaction.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {interaction.user?.name} -{' '}
                              {formatDateTime(interaction.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay interacciones registradas
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stage Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Etapa del Cliente</h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {stages.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => {
                        if (canEdit && stage !== customer.stage) {
                          updateStageMutation.mutate(stage);
                        }
                      }}
                      disabled={!canEdit || updateStageMutation.isPending}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        stage === customer.stage
                          ? 'border-primary bg-primary-50 dark:bg-primary-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      } ${!canEdit ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          stage === customer.stage
                            ? 'text-primary dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {stageLabels[stage]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Ventas totales</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer._count?.sales || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Interacciones</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {customer._count?.interactions || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Referidos</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {customer._count?.referralsGiven || 0}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Valor total</span>
                    <span className="font-semibold text-lg text-gray-900 dark:text-white">
                      {formatCurrency(
                        customer.sales?.reduce(
                          (sum: number, s: any) =>
                            s.status === 'COMPLETED' ? sum + s.totalAmount : sum,
                          0
                        ) || 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Confirmar eliminación
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                ¿Estás seguro de que deseas eliminar al cliente "{customer.name}"?
                Esta acción no se puede deshacer.
              </p>
              {(customer._count?.sales > 0) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-sm mb-4">
                  <strong>Advertencia:</strong> Este cliente tiene {customer._count.sales} ventas asociadas.
                  No se puede eliminar un cliente con ventas.
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending || customer._count?.sales > 0}
                  className="btn-danger"
                >
                  {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
              {deleteMutation.isError && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-3">
                  {(deleteMutation.error as any)?.response?.data?.message || 'Error al eliminar el cliente'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
