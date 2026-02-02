'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { salesApi, customersApi, productsApi, leadsApi } from '@/lib/api';
import { formatCurrency, categoryLabels } from '@/lib/utils';
import { ArrowLeft, Save, Search, ChevronDown, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NewSalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');
  const preselectedLeadId = searchParams.get('leadId');
  const [error, setError] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    customerId: preselectedCustomerId || '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    paymentMethod: 'TRANSFERENCIA',
    notes: '',
    leadId: preselectedLeadId || '',
    quotationUrl: '',
  });

  // If we have a preselected lead, fetch its details
  const { data: preselectedLead } = useQuery({
    queryKey: ['leads', preselectedLeadId],
    queryFn: () => leadsApi.getById(preselectedLeadId as string),
    enabled: !!preselectedLeadId,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  // Filter customers based on search
  const filteredCustomers = customers?.filter((customer: any) => {
    if (!customerSearch) return true;
    const searchLower = customerSearch.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(customerSearch)
    );
  });

  // Get selected customer name
  const selectedCustomer = customers?.find((c: any) => c.id === formData.customerId);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                  <div className="relative" ref={customerDropdownRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={selectedCustomer ? selectedCustomer.name : "Buscar cliente..."}
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        className={`input pl-10 pr-10 ${selectedCustomer && !customerSearch ? 'text-gray-900' : ''}`}
                      />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {showCustomerDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredCustomers?.length > 0 ? (
                          filteredCustomers.map((customer: any) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, customerId: customer.id });
                                setCustomerSearch('');
                                setShowCustomerDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                                formData.customerId === customer.id ? 'bg-primary-50 text-primary' : ''
                              }`}
                            >
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-500">
                                {customer.email || customer.phone || 'Sin contacto'}
                              </p>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No se encontraron clientes
                          </div>
                        )}
                      </div>
                    )}
                    {selectedCustomer && !showCustomerDropdown && (
                      <p className="text-sm text-gray-500 mt-1">
                        Seleccionado: {selectedCustomer.name}
                        {selectedCustomer.email && ` - ${selectedCustomer.email}`}
                      </p>
                    )}
                  </div>
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
                  <label htmlFor="quotationUrl" className="label">
                    <FileText className="h-4 w-4 inline mr-1" />
                    URL de Cotización
                  </label>
                  <input
                    id="quotationUrl"
                    name="quotationUrl"
                    type="url"
                    value={formData.quotationUrl}
                    onChange={handleChange}
                    className="input"
                    placeholder="https://drive.google.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enlace al documento de cotización (Google Drive, Dropbox, etc.)
                  </p>
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

              {/* Lead association info */}
              {preselectedLead && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Lead asociado:</strong> {preselectedLead.title}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Esta venta se vinculará automáticamente con el lead seleccionado.
                  </p>
                </div>
              )}

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
