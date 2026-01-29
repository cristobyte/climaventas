'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { salesApi, customersApi, productsApi } from '@/lib/api';
import { formatCurrency, categoryLabels } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewSalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerId: preselectedCustomerId || '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    paymentMethod: 'TRANSFERENCIA',
    notes: '',
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const { data: products } = useQuery({
    queryKey: ['products', { isActive: true }],
    queryFn: () => productsApi.getAll({ isActive: true }),
  });

  const selectedProduct = products?.find((p: any) => p.id === formData.productId);

  useEffect(() => {
    if (selectedProduct && formData.unitPrice === 0) {
      setFormData((prev) => ({ ...prev, unitPrice: selectedProduct.price }));
    }
  }, [selectedProduct]);

  const createMutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: (data) => {
      router.push(`/sales/${data.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al crear la venta');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.customerId || !formData.productId) {
      setError('Debe seleccionar un cliente y un producto');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    const product = products?.find((p: any) => p.id === productId);
    setFormData({
      ...formData,
      productId,
      unitPrice: product?.price || 0,
    });
  };

  const totalAmount = formData.quantity * formData.unitPrice;
  const commissionRate = selectedProduct?.commissionPercentage || 0.05;
  const commissionAmount = totalAmount * commissionRate;

  return (
    <div>
      <Header title="Nueva Venta" subtitle="Registrar una nueva venta" />

      <div className="p-6">
        <Link
          href="/sales"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a ventas
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
                  <label htmlFor="customerId" className="label">
                    Cliente *
                  </label>
                  <select
                    id="customerId"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {customers?.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.email ? `- ${customer.email}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="productId" className="label">
                    Producto *
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    onChange={handleProductChange}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {products?.map((product: any) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {categoryLabels[product.category]} -{' '}
                        {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="label">
                    Cantidad
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="unitPrice" className="label">
                    Precio Unitario
                  </label>
                  <input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    min="0"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="paymentMethod" className="label">
                    Método de Pago
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="CRÉDITO">Crédito</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="notes" className="label">
                    Notas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input min-h-[80px]"
                    rows={2}
                  />
                </div>
              </div>

              {/* Summary */}
              {formData.productId && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-medium text-gray-900 mb-3">Resumen</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Comisión ({(commissionRate * 100).toFixed(0)}%)
                    </span>
                    <span>{formatCurrency(commissionAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href="/sales" className="btn-outline">
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
                      Registrar Venta
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
