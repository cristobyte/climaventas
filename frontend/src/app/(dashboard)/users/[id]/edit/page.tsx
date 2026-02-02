'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage } from '@/components/ui';
import { usersApi } from '@/lib/api';
import { roleLabels } from '@/lib/utils';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const roles = ['AGENT', 'ANALYTICS', 'MANAGEMENT'];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const queryClient = useQueryClient();
  const { hasRole, user: currentUser } = useAuth();
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'AGENT',
    commissionRate: '',
    isActive: true,
    password: '',
    confirmPassword: '',
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        role: user.role || 'AGENT',
        commissionRate: ((user.commissionRate || 0) * 100).toString(),
        isActive: user.isActive ?? true,
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      router.push('/users');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar el usuario');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/users');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al desactivar el usuario');
    },
  });

  if (!hasRole(['MANAGEMENT'])) {
    return (
      <div>
        <Header title="Acceso Denegado" />
        <div className="p-6">
          <p>No tienes permisos para editar usuarios.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Header title="Editar Usuario" />
        <LoadingPage />
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Header title="Usuario no encontrado" />
        <div className="p-6">
          <p>El usuario solicitado no existe.</p>
          <Link href="/users" className="text-primary hover:underline mt-4 inline-block">
            Volver a usuarios
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
      setError('El nombre es requerido');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const data: any = {
      name: formData.name,
      phone: formData.phone || undefined,
      role: formData.role,
      commissionRate: parseFloat(formData.commissionRate) / 100,
      isActive: formData.isActive,
    };

    if (formData.password) {
      data.password = formData.password;
    }

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

  const isCurrentUser = currentUser?.id === userId;
  const hasRelatedData = (user._count?.assignedCustomers || 0) > 0 || (user._count?.sales || 0) > 0;

  return (
    <div>
      <Header title="Editar Usuario" subtitle={user.name} />

      <div className="p-4 md:p-6">
        <Link
          href="/users"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a usuarios
        </Link>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="card">
            <div className="card-body space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email (read-only) */}
              <div>
                <label className="label">Correo Electrónico</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El correo electrónico no puede ser modificado
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="label">
                    Nombre Completo *
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

                {/* Phone */}
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

                {/* Role */}
                <div>
                  <label htmlFor="role" className="label">
                    Rol *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="input"
                    disabled={isCurrentUser}
                    required
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                  {isCurrentUser && (
                    <p className="text-xs text-yellow-600 mt-1">
                      No puedes cambiar tu propio rol
                    </p>
                  )}
                </div>

                {/* Commission Rate */}
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

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    disabled={isCurrentUser}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Usuario activo
                  </label>
                  {isCurrentUser && (
                    <span className="text-xs text-yellow-600">
                      (No puedes desactivarte a ti mismo)
                    </span>
                  )}
                </div>
              </div>

              {/* Password Change Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Cambiar Contraseña (opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="password" className="label">
                      Nueva Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input"
                      placeholder="Dejar en blanco para mantener"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="label">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input"
                      placeholder="Repetir contraseña"
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Estadísticas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <span className="font-medium">{user._count?.assignedCustomers || 0}</span> clientes asignados
                  </div>
                  <div>
                    <span className="font-medium">{user._count?.sales || 0}</span> ventas realizadas
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-danger order-last sm:order-first"
                  disabled={isCurrentUser}
                  title={
                    isCurrentUser
                      ? 'No puedes desactivarte a ti mismo'
                      : 'Desactivar usuario'
                  }
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Desactivar
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/users" className="btn-outline">
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
                  Confirmar desactivación
                </h3>
                <p className="text-gray-600 mb-4">
                  ¿Estás seguro de que deseas desactivar al usuario "{user.name}"?
                  El usuario no podrá iniciar sesión, pero sus datos se conservarán.
                </p>
                {hasRelatedData && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm mb-4">
                    <strong>Advertencia:</strong> Este usuario tiene {user._count?.assignedCustomers || 0} clientes
                    y {user._count?.sales || 0} ventas asignadas. Los datos permanecerán en el sistema.
                  </div>
                )}
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
                    {deleteMutation.isPending ? 'Desactivando...' : 'Desactivar'}
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
