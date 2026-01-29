'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { referralsApi, customersApi, partnershipsApi } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function NewReferralPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPartnershipId = searchParams.get('partnershipId');
  const { hasRole } = useAuth();
  const [error, setError] = useState('');
  const [referralSource, setReferralSource] = useState<'customer' | 'partnership'>(
    preselectedPartnershipId ? 'partnership' : 'customer'
  );

  const [formData, setFormData] = useState({
    referrerCustomerId: '',
    referredCustomerId: '',
    partnershipId: preselectedPartnershipId || '',
    bonusAmount: '',
  });

  // Update form if partnershipId changes in URL
  useEffect(() => {
    if (preselectedPartnershipId) {
      setReferralSource('partnership');
      setFormData(prev => ({ ...prev, partnershipId: preselectedPartnershipId }));
    }
  }, [preselectedPartnershipId]);

  // Fetch customers for dropdowns
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll({}),
  });

  // Fetch partnerships for dropdown
  const { data: partnerships } = useQuery({
    queryKey: ['partnerships', { isActive: true }],
    queryFn: () => partnershipsApi.getAll({ isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: referralsApi.create,
    onSuccess: () => {
      router.push('/referrals');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al crear el referido');
    },
  });

  if (!hasRole(['MANAGEMENT'])) {
    return (
      <div>
        <Header title="Acceso Denegado" />
        <div className="p-6">
          <p>No tienes permisos para crear referidos.</p>
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
      bonusAmount: formData.bonusAmount ? parseFloat(formData.bonusAmount) : undefined,
    };

    if (referralSource === 'customer' && formData.referrerCustomerId) {
      data.referrerCustomerId = formData.referrerCustomerId;
    } else if (referralSource === 'partnership' && formData.partnershipId) {
      data.partnershipId = formData.partnershipId;
    }

    createMutation.mutate(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Filter out the referrer from the referred options
  const availableReferredCustomers = customers?.filter(
    (c: any) => c.id !== formData.referrerCustomerId
  );

  return (
    <div>
      <Header title="Nuevo Referido" subtitle="Registrar un nuevo referido" />

      <div className="p-4 md:p-6">
        <Link
          href="/referrals"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a referidos
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
                        setReferralSource('customer');
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
                        setReferralSource('partnership');
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
                    <p className="text-xs text-gray-500 mt-1">
                      El cliente que está recomendando a otro
                    </p>
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
                    <p className="text-xs text-gray-500 mt-1">
                      La alianza comercial que envía el referido
                    </p>
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
                  <p className="text-xs text-gray-500 mt-1">
                    El nuevo cliente que fue referido. Debe existir previamente en el sistema.
                  </p>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Bono a pagar cuando el referido se convierta en venta
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Nota:</h4>
                <p className="text-sm text-blue-700">
                  El referido se creará con estado "Pendiente". Cuando el cliente referido
                  realice una compra, puede marcarlo como "Convertido" para activar el pago del bono.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href="/referrals" className="btn-outline">
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
                      Guardar Referido
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
