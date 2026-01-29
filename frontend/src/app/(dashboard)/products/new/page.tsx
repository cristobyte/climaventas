'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { productsApi } from '@/lib/api';
import { formatCurrency, categoryLabels } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const categories = ['SPLIT', 'INSTALLATION', 'MAINTENANCE', 'ACCESSORY'];

export default function NewProductPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    model: '',
    price: '',
    commissionPercentage: '5',
    category: 'SPLIT',
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      router.push('/products');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al crear el producto');
    },
  });

  if (!hasRole(['MANAGEMENT'])) {
    return (
      <div>
        <Header title="Acceso Denegado" />
        <div className="p-6">
          <p>No tienes permisos para crear productos.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price) {
      setError('El nombre y precio son requeridos');
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      brand: formData.brand || undefined,
      model: formData.model || undefined,
      price: parseFloat(formData.price),
      commissionPercentage: parseFloat(formData.commissionPercentage) / 100,
      category: formData.category,
      isActive: formData.isActive,
    };

    createMutation.mutate(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const previewPrice = formData.price ? parseFloat(formData.price) : 0;
  const previewCommission = previewPrice * (parseFloat(formData.commissionPercentage) / 100);

  return (
    <div>
      <Header title="Nuevo Producto" subtitle="Agregar producto al catálogo" />

      <div className="p-4 md:p-6">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a productos
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
                {/* Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="label">
                    Nombre del Producto *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ej: Split 12000 BTU Inverter"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="label">
                    Categoría *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label htmlFor="brand" className="label">
                    Marca
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={formData.brand}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ej: Samsung, LG, Midea"
                  />
                </div>

                {/* Model */}
                <div>
                  <label htmlFor="model" className="label">
                    Modelo
                  </label>
                  <input
                    id="model"
                    name="model"
                    type="text"
                    value={formData.model}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ej: AR12TXHQASINPE"
                  />
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="label">
                    Precio (CLP) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={handleChange}
                    className="input"
                    placeholder="449990"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Precio base. Se puede personalizar al crear una venta.
                  </p>
                </div>

                {/* Commission */}
                <div>
                  <label htmlFor="commissionPercentage" className="label">
                    Comisión (%)
                  </label>
                  <input
                    id="commissionPercentage"
                    name="commissionPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commissionPercentage}
                    onChange={handleChange}
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Porcentaje de comisión para el agente de ventas
                  </p>
                </div>

                {/* Active Status */}
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
                    Producto activo (disponible para venta)
                  </label>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="label">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input min-h-[100px]"
                    rows={3}
                    placeholder="Descripción detallada del producto, características, especificaciones..."
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.price && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Vista Previa</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{formData.name || 'Nombre del producto'}</p>
                      <p className="text-sm text-gray-500">
                        {formData.brand} {formData.model}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {categoryLabels[formData.category]}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(previewPrice)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Comisión: {formatCurrency(previewCommission)} ({formData.commissionPercentage}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Nota:</h4>
                <p className="text-sm text-blue-700">
                  El precio del producto es un valor base. Al crear una venta o cotización,
                  el vendedor puede ajustar el precio según negociación con el cliente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href="/products" className="btn-outline">
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
                      Guardar Producto
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
