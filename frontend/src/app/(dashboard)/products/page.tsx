'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, Badge, EmptyState } from '@/components/ui';
import { productsApi } from '@/lib/api';
import { formatCurrency, categoryLabels } from '@/lib/utils';
import { Search, Plus, Package, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const categories = ['', 'SPLIT', 'INSTALLATION', 'MAINTENANCE', 'ACCESSORY'];

export default function ProductsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const canEdit = hasRole(['MANAGEMENT']);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', { search, category: categoryFilter, isActive: !showInactive ? true : undefined }],
    queryFn: () =>
      productsApi.getAll({
        search: search || undefined,
        category: categoryFilter || undefined,
        isActive: !showInactive ? true : undefined,
      }),
  });

  if (!hasRole(['MANAGEMENT'])) {
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
        <Header title="Productos" subtitle="Catálogo de productos HVAC" />
        <LoadingPage />
      </div>
    );
  }

  return (
    <div>
      <Header title="Productos" subtitle="Catálogo de productos HVAC" />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Todas las categorías</option>
            {categories.slice(1).map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabels[cat]}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Mostrar inactivos
          </label>

          <Link href="/products/new" className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Link>
        </div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div
                key={product.id}
                className={`card overflow-hidden ${
                  !product.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={product.isActive ? 'primary' : 'gray'}>
                      {categoryLabels[product.category]}
                    </Badge>
                    {!product.isActive && (
                      <Badge variant="danger">Inactivo</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  {product.brand && (
                    <p className="text-sm text-gray-500 mb-2">
                      {product.brand} {product.model}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-primary mb-3">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Comisión: {(product.commissionPercentage * 100).toFixed(0)}%</span>
                    <span>{product._count?.sales || 0} ventas</span>
                  </div>
                </div>
                {canEdit && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="btn-outline text-sm py-1.5"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay productos"
            description="Comienza agregando productos al catálogo."
            icon={Package}
            action={{
              label: 'Agregar Producto',
              onClick: () => (window.location.href = '/products/new'),
            }}
          />
        )}
      </div>
    </div>
  );
}
