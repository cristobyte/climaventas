'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, Badge } from '@/components/ui';
import { referralsApi, customersApi } from '@/lib/api';
import { formatDate, formatCurrency, referralStatusLabels, referralStatusColors } from '@/lib/utils';
import { ArrowLeft, Check, X, Trash2, Edit2, Save } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function ReferralDetailPage() {
  const router = useRouter();
  const params = useParams();
  const referralId = params.id as string;
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const canManage = hasRole(['MANAGEMENT']);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [bonusAmount, setBonusAmount] = useState('');

  const { data: referral, isLoading } = useQuery({
    queryKey: ['referral', referralId],
    queryFn: () => referralsApi.getById(referralId),
    enabled: !!referralId,
  });

  const convertMutation = useMutation({
    mutationFn: () => referralsApi.convert(referralId, bonusAmount ? parseFloat(bonusAmount) : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral', referralId] });
      setShowConvertModal(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al convertir el referido');
    },
  });

  const expireMutation = useMutation({
    mutationFn: () => referralsApi.expire(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral', referralId] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al expirar el referido');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => referralsApi.delete(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      router.push('/referrals');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al eliminar el referido');
    },
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
        <Header title="Referido" />
        <LoadingPage />
      </div>
    );
  }

  if (!referral) {
    return (
      <div>
        <Header title="Referido no encontrado" />
        <div className="p-6">
          <p>El referido solicitado no existe.</p>
          <Link href="/referrals" className="text-primary hover:underline mt-4 inline-block">
            Volver a referidos
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleConvert = () => {
    convertMutation.mutate();
  };

  const handleExpire = () => {
    if (confirm('¿Estás seguro de que deseas marcar este referido como expirado?')) {
      expireMutation.mutate();
    }
  };

  return (
    <div>
      <Header
        title={`Referido: ${referral.referredCustomer?.name}`}
        subtitle="Detalle del referido"
      />

      <div className="p-4 md:p-6">
        <Link
          href="/referrals"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a referidos
        </Link>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <div className="max-w-3xl space-y-6">
          {/* Status Card */}
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estado actual</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      referralStatusColors[referral.status]
                    }`}
                  >
                    {referralStatusLabels[referral.status]}
                  </span>
                </div>

                {canManage && referral.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setBonusAmount(referral.bonusAmount?.toString() || '');
                        setShowConvertModal(true);
                      }}
                      disabled={convertMutation.isPending}
                      className="btn-primary"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Convertir
                    </button>
                    <button
                      onClick={handleExpire}
                      disabled={expireMutation.isPending}
                      className="btn-outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Expirar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Referral Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Información del Referido</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referred Customer */}
                <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Cliente Referido</p>
                  <p className="font-semibold text-lg">{referral.referredCustomer?.name}</p>
                  <p className="text-sm text-gray-600">{referral.referredCustomer?.email}</p>
                  <p className="text-sm text-gray-600">{referral.referredCustomer?.phone}</p>
                  <Link
                    href={`/customers/${referral.referredCustomer?.id}`}
                    className="text-primary hover:underline text-sm mt-2 inline-block"
                  >
                    Ver perfil del cliente →
                  </Link>
                </div>

                {/* Source */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fuente del Referido</p>
                  {referral.partnership ? (
                    <div>
                      <p className="font-medium">Alianza: {referral.partnership.name}</p>
                      <Link
                        href={`/partnerships/${referral.partnership.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        Ver alianza →
                      </Link>
                    </div>
                  ) : referral.referrerCustomer ? (
                    <div>
                      <p className="font-medium">Cliente: {referral.referrerCustomer.name}</p>
                      <Link
                        href={`/customers/${referral.referrerCustomer.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        Ver cliente →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500">-</p>
                  )}
                </div>

                {/* Bonus */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Monto del Bono</p>
                  <p className="font-medium text-xl">
                    {referral.bonusAmount ? formatCurrency(referral.bonusAmount) : '-'}
                  </p>
                  {referral.status === 'CONVERTED' && referral.bonusAmount && (
                    <span className="text-sm text-green-600">Pagado al convertir</span>
                  )}
                </div>

                {/* Created Date */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fecha de Registro</p>
                  <p className="font-medium">{formatDate(referral.createdAt)}</p>
                </div>

                {/* Updated Date */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Última Actualización</p>
                  <p className="font-medium">{formatDate(referral.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Estado del Proceso</h2>
            </div>
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  referral.status !== 'EXPIRED' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Check className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Registrado</p>
                  <p className="text-sm text-gray-500">{formatDate(referral.createdAt)}</p>
                </div>
              </div>

              <div className="ml-5 border-l-2 border-gray-200 h-8" />

              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  referral.status === 'CONVERTED'
                    ? 'bg-green-100 text-green-600'
                    : referral.status === 'EXPIRED'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {referral.status === 'CONVERTED' ? (
                    <Check className="h-5 w-5" />
                  ) : referral.status === 'EXPIRED' ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">2</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {referral.status === 'CONVERTED'
                      ? 'Convertido'
                      : referral.status === 'EXPIRED'
                      ? 'Expirado'
                      : 'Pendiente de conversión'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {referral.status === 'PENDING'
                      ? 'Esperando que el cliente realice una compra'
                      : formatDate(referral.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canManage && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Referido
              </button>
            </div>
          )}
        </div>

        {/* Convert Modal */}
        {showConvertModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Convertir Referido
              </h3>
              <p className="text-gray-600 mb-4">
                Marcar este referido como convertido indicará que el cliente realizó una compra.
              </p>

              <div className="mb-4">
                <label htmlFor="bonusAmount" className="label">
                  Monto del Bono (CLP)
                </label>
                <input
                  id="bonusAmount"
                  type="number"
                  min="0"
                  step="1000"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  className="input"
                  placeholder="Ej: 50000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opcional. Monto a pagar al referente o alianza.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConvert}
                  disabled={convertMutation.isPending}
                  className="btn-primary"
                >
                  {convertMutation.isPending ? 'Procesando...' : 'Confirmar Conversión'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmar eliminación
              </h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que deseas eliminar este referido?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="btn-danger"
                >
                  {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
