'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { partnershipsApi } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
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

export default function NewPartnershipPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    partnershipType: '',
    commissionRate: '3',
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: partnershipsApi.create,
    onSuccess: () => {
      router.push('/partnerships');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al crear la alianza');
    },
  });

  if (!hasRole(['MANAGEMENT', 'AGENT'])) {
    return (
      <div>
        <Header title="Acceso Denegado" />
        <div className="p-6">
          <p>No tienes permisos para crear alianzas.</p>
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

    createMutation.mutate(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div>
      <Header title="Nueva Alianza" subtitle="Crear una alianza comercial" />

      <div className="p-4 md:p-6">
        <Link
          href="/partnerships"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a alianzas
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
                    Nombre de la Alianza *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ej: Constructora ABC"
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
                    placeholder="Ej: Juan Pérez"
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
                    placeholder="contacto@empresa.cl"
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
                  <p className="text-xs text-gray-500 mt-1">
                    Comisión que se paga a la alianza por cada referido convertido
                  </p>
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

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href="/partnerships" className="btn-outline">
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
                      Guardar Alianza
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
