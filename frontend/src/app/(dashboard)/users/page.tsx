'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { LoadingPage, Badge, EmptyState } from '@/components/ui';
import { usersApi } from '@/lib/api';
import { formatDate, roleLabels } from '@/lib/utils';
import { Search, Plus, UserCircle, Edit2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const roles = ['', 'AGENT', 'ANALYTICS', 'MANAGEMENT'];

const roleColors: Record<string, string> = {
  AGENT: 'primary',
  ANALYTICS: 'warning',
  MANAGEMENT: 'success',
};

export default function UsersPage() {
  const { hasRole } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', { role: roleFilter }],
    queryFn: () => usersApi.getAll({ role: roleFilter || undefined }),
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
        <Header title="Usuarios" subtitle="Gestión de usuarios del sistema" />
        <LoadingPage />
      </div>
    );
  }

  const filteredUsers = users?.filter(
    (user: any) =>
      !search ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header title="Usuarios" subtitle="Gestión de usuarios del sistema" />

      <div className="p-4 md:p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Todos los roles</option>
            {roles.slice(1).map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>

          <Link href="/users/new" className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nuevo Usuario</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        </div>

        {/* Users List */}
        {filteredUsers && filteredUsers.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((user: any) => (
                <Link
                  key={user.id}
                  href={`/users/${user.id}/edit`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge
                          variant={
                            (roleColors[user.role] as any) || 'default'
                          }
                        >
                          {roleLabels[user.role]}
                        </Badge>
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{user._count?.assignedCustomers || 0} clientes</span>
                        <span>{user._count?.sales || 0} ventas</span>
                        <span>{(user.commissionRate * 100).toFixed(0)}% com.</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Comisión</th>
                      <th>Clientes</th>
                      <th>Ventas</th>
                      <th>Estado</th>
                      <th>Registro</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user: any) => (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge
                            variant={
                              (roleColors[user.role] as any) || 'default'
                            }
                          >
                            {roleLabels[user.role]}
                          </Badge>
                        </td>
                        <td className="text-sm">
                          {(user.commissionRate * 100).toFixed(0)}%
                        </td>
                        <td className="text-sm">
                          {user._count?.assignedCustomers || 0}
                        </td>
                        <td className="text-sm">{user._count?.sales || 0}</td>
                        <td>
                          <Badge variant={user.isActive ? 'success' : 'danger'}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td>
                          <Link
                            href={`/users/${user.id}/edit`}
                            className="text-primary hover:underline text-sm"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No hay usuarios"
            description="Comienza agregando usuarios al sistema."
            icon={UserCircle}
            action={{
              label: 'Agregar Usuario',
              onClick: () => (window.location.href = '/users/new'),
            }}
          />
        )}
      </div>
    </div>
  );
}
