'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, Badge, StatCard } from '@/components/ui';
import { partnershipsApi, referralsApi } from '@/lib/api';
import { formatDate, formatCurrency, referralStatusLabels, referralStatusColors } from '@/lib/utils';
import { ArrowLeft, Save, Trash2, Building2, Users, TrendingUp, Percent } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const partnershipTypes = [
  'Constructora',
  'Inmobiliaria',
  'Arquitectura',
  'Retail',
  'Distribuidor',
  'Otro',
];

export default function PartnershipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partnershipId = params.id as string;
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const canManage = hasRole(['MANAGEMENT']);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    partnershipType: '',
    commissionRate: '',
    isActive: true,
  });

  const { data: partnership, isLoading } = useQuery({
    queryKey: ['partnership', partnershipId],
    queryFn: () => partnershipsApi.getById(partnershipId),
    enabled: !!partnershipId,
  });

  const { data: referrals } = useQuery({
    queryKey: ['referrals', { partnershipId }],
    queryFn: () => referralsApi.getAll({ partnershipId }),
    enabled: !!partnershipId,
  });

  useEffect(() => {
    if (partnership) {
      setFormData({
        name: partnership.name || '',
        contactName: partnership.contactName || '',
        email: partnership.email || '',
        phone: partnership.phone || '',
        partnershipType: partnership.partnershipType || '',
        commissionRate: ((partnership.commissionRate || 0) * 100).toString(),
        isActive: partnership.isActive ?? true,
      });
    }
  }, [partnership]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => partnershipsApi.update(partnershipId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
      queryClient.invalidateQueries({ queryKey: ['partnership', partnershipId] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar la alianza');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => partnershipsApi.delete(partnershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerships'] });
      router.push('/partnerships');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al eliminar la alianza');
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
        <Header title="Alianza" />
        <LoadingPage />
      </div>
    );
  }

  if (!partnership) {
    return (
      <div>
        <Header title="Alianza no encontrada" />
        <div className="p-6">
          <p>La alianza solicitada no existe.</p>
          <Link href="/partnerships" className="text-primary hover:underline mt-4 inline-block">
            Volver a alianzas
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const data = {
      name: formData.name,
      contactName: formData.contactName || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      partnershipType: formData.partnershipType || undefined,
      commissionRate: parseFloat(formData.commissionRate) / 100,
      isActive: formData.isActive,
    };

    updateMutation.mutate(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Stats
  const totalReferrals = referrals?.length || 0;
  const convertedReferrals = referrals?.filter((r: any) => r.status === 'CONVERTED').length || 0;
  const pendingReferrals = referrals?.filter((r: any) => r.status === 'PENDING').length || 0;
  const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0;

  return (
    <div>
      <Header title={partnership.name} subtitle="Detalle de alianza" />

      <div className="p-4 md:p-6">
        <Link
          href="/partnerships"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a alianzas
        </Link>

        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Referidos"
              value={totalReferrals}
              icon={Users}
            />
            <StatCard
              title="Pendientes"
              value={pendingReferrals}
              icon={Building2}
            />
            <StatCard
              title="Convertidos"
              value={convertedReferrals}
              icon={TrendingUp}
            />
            <StatCard
              title="Tasa Conversión"
              value={`${conversionRate.toFixed(1)}%`}
              icon={Percent}
            />
          </div>

          {/* Partnership Details */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold">Información de la Alianza</h2>
              <div className="flex items-center gap-2">
                <Badge variant={partnership.isActive ? 'success' : 'danger'}>
                  {partnership.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
                {canManage && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline text-sm"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>

            <div className="card-body">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="label">
                        Nombre de la Alianza *
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
                      <label htmlFor="contactName" className="label">
                        Nombre del Contacto
                      </label>
                      <input
                        id="contactName"
                        name="contactName"
                        type="text"
                        value={formData.contactName}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="partnershipType" className="label">
                        Tipo de Alianza
                      </label>
                      <select
                        id="partnershipType"
                        name="partnershipType"
                        value={formData.partnershipType}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="">Seleccionar tipo</option>
                        {partnershipTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
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
                      />
                    </div>

                    <div>
                      <label htmlFor="commissionRate" className="label">
                        Tasa de Comisión (%)
                      </label>
                      <input
                        id="commissionRate"
                        name="commissionRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.commissionRate}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Alianza activa
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-danger order-last sm:order-first"
                      disabled={totalReferrals > 0}
                      title={totalReferrals > 0 ? 'No se puede eliminar una alianza con referidos' : 'Eliminar alianza'}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn-outline"
                      >
                        Cancelar
                      </button>
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
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Nombre del Contacto</p>
                    <p className="font-medium">{partnership.contactName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Alianza</p>
                    <p className="font-medium">{partnership.partnershipType || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{partnership.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{partnership.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tasa de Comisión</p>
                    <p className="font-medium">{(partnership.commissionRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Registro</p>
                    <p className="font-medium">{formatDate(partnership.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Referrals List */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold">Referidos de esta Alianza</h2>
              {canManage && (
                <Link
                  href={`/referrals/new?partnershipId=${partnershipId}`}
                  className="btn-primary text-sm"
                >
                  Nuevo Referido
                </Link>
              )}
            </div>

            {referrals && referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cliente Referido</th>
                      <th>Bono</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {referrals.map((referral: any) => (
                      <tr key={referral.id}>
                        <td>
                          <p className="font-medium text-gray-900">
                            {referral.referredCustomer?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {referral.referredCustomer?.email}
                          </p>
                        </td>
                        <td className="font-medium">
                          {referral.bonusAmount
                            ? formatCurrency(referral.bonusAmount)
                            : '-'}
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              referralStatusColors[referral.status]
                            }`}
                          >
                            {referralStatusLabels[referral.status]}
                          </span>
                        </td>
                        <td className="text-sm text-gray-500">
                          {formatDate(referral.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card-body text-center text-gray-500">
                No hay referidos registrados para esta alianza.
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmar eliminación
              </h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que deseas eliminar la alianza "{partnership.name}"?
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
