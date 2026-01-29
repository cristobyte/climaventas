'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { LoadingPage, Badge } from '@/components/ui';
import { salesApi } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  statusLabels,
  statusColors,
  categoryLabels,
} from '@/lib/utils';
import {
  ArrowLeft,
  User,
  Package,
  Calendar,
  CreditCard,
  FileText,
  Check,
  X,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const canApprove = hasRole(['MANAGEMENT']);

  const { data: sale, isLoading } = useQuery({
    queryKey: ['sale', params.id],
    queryFn: () => salesApi.getById(params.id as string),
  });

  const approveMutation = useMutation({
    mutationFn: () => salesApi.approve(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale', params.id] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => salesApi.complete(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale', params.id] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => salesApi.cancel(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale', params.id] });
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

  if (!sale) {
    return (
      <div>
        <Header title="Venta no encontrada" />
        <div className="p-6">
          <p>La venta no existe o no tienes acceso.</p>
          <Link href="/sales" className="btn-primary mt-4">
            Volver a ventas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={`Venta #${sale.id.slice(-8).toUpperCase()}`}
        subtitle={`${sale.customer?.name} - ${sale.product?.name}`}
      />

      <div className="p-6">
        <Link
          href="/sales"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a ventas
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sale Info Card */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-lg font-semibold">Detalle de la Venta</h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[sale.status]
                  }`}
                >
                  {statusLabels[sale.status]}
                </span>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Cliente</p>
                        <Link
                          href={`/customers/${sale.customer?.id}`}
                          className="text-gray-900 font-medium hover:text-primary"
                        >
                          {sale.customer?.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {sale.customer?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Producto</p>
                        <p className="text-gray-900 font-medium">
                          {sale.product?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {categoryLabels[sale.product?.category]} -{' '}
                          {sale.product?.brand} {sale.product?.model}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Agente</p>
                        <p className="text-gray-900 font-medium">
                          {sale.agent?.name}
                        </p>
                        <p className="text-sm text-gray-500">{sale.agent?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Venta</p>
                        <p className="text-gray-900">
                          {formatDateTime(sale.saleDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Método de Pago</p>
                        <p className="text-gray-900">
                          {sale.paymentMethod || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {sale.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Notas</p>
                        <p className="text-gray-900">{sale.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {canApprove && sale.status !== 'COMPLETED' && sale.status !== 'CANCELLED' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Acciones</h2>
                </div>
                <div className="card-body">
                  <div className="flex gap-3">
                    {sale.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => approveMutation.mutate()}
                          disabled={approveMutation.isPending}
                          className="btn-primary"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aprobar Venta
                        </button>
                        <button
                          onClick={() => cancelMutation.mutate()}
                          disabled={cancelMutation.isPending}
                          className="btn-danger"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar Venta
                        </button>
                      </>
                    )}
                    {sale.status === 'APPROVED' && (
                      <button
                        onClick={() => completeMutation.mutate()}
                        disabled={completeMutation.isPending}
                        className="btn-primary"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Completada
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Resumen Financiero</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio Unitario</span>
                  <span>{formatCurrency(sale.unitPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cantidad</span>
                  <span>{sale.quantity}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Comisión Agente</span>
                  <span>{formatCurrency(sale.commissionAmount)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold text-primary">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Historial</h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">Venta creada</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                  {sale.status !== 'PENDING' && (
                    <div className="flex gap-3">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${
                          sale.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {sale.status === 'CANCELLED'
                            ? 'Venta cancelada'
                            : 'Venta aprobada'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(sale.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {sale.status === 'COMPLETED' && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-medium">Venta completada</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(sale.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
