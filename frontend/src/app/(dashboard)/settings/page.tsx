'use client';

import { Header } from '@/components/layout';
import { useAuth } from '@/lib/auth-context';
import { Settings, Bell, Shield, Database, Palette } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  const { hasRole, user } = useAuth();

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

  return (
    <div>
      <Header title="Configuración" subtitle="Ajustes del sistema" />

      <div className="p-6 space-y-6">
        {/* Brand Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Marca
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Logo de la Empresa</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Image
                    src="https://climatecnologia.cl/wp-content/uploads/2025/11/cropped-logo-clima-horizontal.png"
                    alt="ClimaTecnología"
                    width={200}
                    height={50}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Nombre de la Empresa</label>
                  <input
                    type="text"
                    defaultValue="ClimaTecnología"
                    className="input"
                    disabled
                  />
                </div>
                <div>
                  <label className="label">Eslogan</label>
                  <input
                    type="text"
                    defaultValue="Encuentra la comodidad que mereces"
                    className="input"
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="label">Color Primario</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary" />
                  <span className="text-sm text-gray-600">#2952d9</span>
                </div>
              </div>
              <div>
                <label className="label">Color Hover</label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-600" />
                  <span className="text-sm text-gray-600">#2c00ff</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sistema
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Versión</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Base de Datos</p>
                <p className="font-medium">SQLite (Prisma)</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Backend</p>
                <p className="font-medium">NestJS</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Frontend</p>
                <p className="font-medium">Next.js 14</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Roles Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles y Permisos
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                    MANAGEMENT
                  </span>
                  <span className="text-sm text-gray-500">Gerencia</span>
                </div>
                <p className="text-sm text-gray-600">
                  Acceso completo: gestión de usuarios, productos, aprobación de ventas,
                  configuración del sistema, analíticas completas.
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">
                    ANALYTICS
                  </span>
                  <span className="text-sm text-gray-500">Analista</span>
                </div>
                <p className="text-sm text-gray-600">
                  Acceso de lectura: ver todos los clientes, dashboards, reportes,
                  métricas de rendimiento, exportar datos.
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm font-medium">
                    AGENT
                  </span>
                  <span className="text-sm text-gray-500">Agente de Ventas</span>
                </div>
                <p className="text-sm text-gray-600">
                  Acceso operativo: ver clientes asignados, crear interacciones,
                  crear ventas (pendientes de aprobación), ver comisiones propias.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings Placeholder */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </h2>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-500">
              Las configuraciones de notificaciones estarán disponibles próximamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
