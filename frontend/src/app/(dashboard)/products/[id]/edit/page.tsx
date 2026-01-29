'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage } from '@/components/ui';
import { productsApi } from '@/lib/api';
import { formatCurrency, categoryLabels } from '@/lib/utils';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const categories = ['SPLIT', 'INSTALLATION', 'MAINTENANCE', 'ACCESSORY'];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    model: '',
    price: '',
    commissionPercentage: '',
    category: 'SPLIT',
    isActive: true,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(productId),
    enabled: !!productId,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        brand: product.brand || '',
        model: product.model || '',
        price: product.price?.toString() || '',
        commissionPercentage: ((product.commissionPercentage || 0) * 100).toString(),
        category: product.category || 'SPLIT',
        isActive: product.isActive ?? true,
      });
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => productsApi.update(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      router.push('/products');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar el producto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/products');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al eliminar el producto');
    },
  });

  if (!hasRole(['MANAGEMENT'])) {
    return (
      <div>
        <Header title="Acceso Denegado" />
        <div className="p-6">
          <p>No tienes permisos para editar productos.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Header title="Editar Producto" />
        <LoadingPage />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header title="Producto no encontrado" />
        <div className="p-6">
          <p>El producto solicitado no existe.</p>
          <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
            Volver a productos
          </Link>
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

    updateMutation.mutate(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const previewPrice = formData.price ? parseFloat(formData.price) : 0;
  const previewCommission = previewPrice * (parseFloat(formData.commissionPercentage) / 100);

  return (
    <div>
      <Header title="Editar Producto" subtitle={product.name} />

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
                    required
                  />
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
                    Producto activo
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
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.price && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Vista Previa</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{formData.name}</p>
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

              {/* Stats */}
              {product._count && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Estadísticas</h4>
                  <p className="text-sm text-blue-700">
                    Este producto tiene {product._count.sales || 0} ventas registradas.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-danger order-last sm:order-first"
                  disabled={product._count?.sales > 0}
                  title={product._count?.sales > 0 ? 'No se puede eliminar un producto con ventas' : 'Eliminar producto'}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/products" className="btn-outline">
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

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirmar eliminación
                </h3>
                <p className="text-gray-600 mb-4">
                  ¿Estás seguro de que deseas eliminar el producto "{product.name}"?
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
    </div>
  );
}
