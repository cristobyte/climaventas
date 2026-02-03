'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage } from '@/components/ui';
import { referralsApi, customersApi, partnershipsApi } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function EditReferralPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    referrerCustomerId: '',
    referredCustomerId: '',
    partnershipId: '',
    bonusAmount: '',
  });

  const { data: referral, isLoading } = useQuery({
    queryKey: ['referral', params.id],
    queryFn: () => referralsApi.getById(params.id as string),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll({}),
  });

  const { data: partnerships } = useQuery({
    queryKey: ['partnerships'],
    queryFn: () => partnershipsApi.getAll({}),
  });

  useEffect(() => {
    if (referral) {
      setFormData({
        referrerCustomerId: referral.referrerCustomerId || '',
        referredCustomerId: referral.referredCustomerId || '',
        partnershipId: referral.partnershipId || '',
        bonusAmount: referral.bonusAmount?.toString() || '',
      });
    }
  }, [referral]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => referralsApi.update(params.id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral', params.id] });
      router.push(`/referrals/${params.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar el referido');
    },
  });

  if (!hasRole(['MANAGEMENT', 'AGENT'])) {
    return (
      <div>
        <Header title="Acceso Denegado" />
        <div className="p-6">
          <p>No tienes permisos para editar referidos.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Header title="Editar Referido" subtitle="Cargando..." />
        <LoadingPage />
      </div>
    );
  }

  if (!referral) {
    return (
      <div>
        <Header title="Referido no encontrado" subtitle="" />
        <div className="p-6">
          <Link href="/referrals" className="text-primary hover:underline">
            Volver a referidos
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.referredCustomerId) {
      setError('Debe seleccionar un cliente referido');
      return;
    }

    const data: any = {
      referredCustomerId: formData.referredCustomerId,
      bonusAmount: formData.bonusAmount ? parseFloat(formData.bonusAmount) : null,
    };

    if (formData.referrerCustomerId) {
      data.referrerCustomerId = formData.referrerCustomerId;
      data.partnershipId = null;
    } else if (formData.partnershipId) {
      data.partnershipId = formData.partnershipId;
      data.referrerCustomerId = null;
    }

    updateMutation.mutate(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const availableReferredCustomers = customers?.filter(
    (c: any) => c.id !== formData.referrerCustomerId
  );

  const referralSource = formData.partnershipId ? 'partnership' : 'customer';

  return (
    <div>
      <Header title="Editar Referido" subtitle={referral.referredCustomer?.name} />

      <div className="p-4 md:p-6">
        <Link
          href={`/referrals/${params.id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al referido
        </Link>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="card">
            <div className="card-body space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Referral Source Selection */}
              <div>
                <label className="label">Fuente del Referido</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="referralSource"
                      value="customer"
                      checked={referralSource === 'customer'}
                      onChange={() => {
                        setFormData({ ...formData, partnershipId: '' });
                      }}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Cliente existente</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="referralSource"
                      value="partnership"
                      checked={referralSource === 'partnership'}
                      onChange={() => {
                        setFormData({ ...formData, referrerCustomerId: '' });
                      }}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Alianza comercial</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Referrer Section */}
                {referralSource === 'customer' ? (
                  <div>
                    <label htmlFor="referrerCustomerId" className="label">
                      Cliente que Refiere
                    </label>
                    <select
                      id="referrerCustomerId"
                      name="referrerCustomerId"
                      value={formData.referrerCustomerId}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Seleccionar cliente...</option>
                      {customers?.map((customer: any) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.email ? `(${customer.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="partnershipId" className="label">
                      Alianza *
                    </label>
                    <select
                      id="partnershipId"
                      name="partnershipId"
                      value={formData.partnershipId}
                      onChange={handleChange}
                      className="input"
                      required={referralSource === 'partnership'}
                    >
                      <option value="">Seleccionar alianza...</option>
                      {partnerships?.map((partnership: any) => (
                        <option key={partnership.id} value={partnership.id}>
                          {partnership.name} ({partnership.partnershipType || 'Sin tipo'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Referred Customer */}
                <div>
                  <label htmlFor="referredCustomerId" className="label">
                    Cliente Referido *
                  </label>
                  <select
                    id="referredCustomerId"
                    name="referredCustomerId"
                    value={formData.referredCustomerId}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar cliente...</option>
                    {availableReferredCustomers?.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.email ? `(${customer.email})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bonus Amount */}
                <div>
                  <label htmlFor="bonusAmount" className="label">
                    Monto del Bono (CLP)
                  </label>
                  <input
                    id="bonusAmount"
                    name="bonusAmount"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.bonusAmount}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ej: 50000"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href={`/referrals/${params.id}`} className="btn-outline">
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
          </form>
        </div>
      </div>
    </div>
  );
}
