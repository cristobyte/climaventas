import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export const stageLabels: Record<string, string> = {
  PROSPECTING: 'Prospección',
  PRE_SALES: 'Pre-venta',
  SALES: 'Venta',
  POST_PURCHASE: 'Post-venta',
  SERVICE: 'Servicio',
  FIDELITY: 'Fidelización',
};

export const stageColors: Record<string, string> = {
  PROSPECTING: 'bg-gray-100 text-gray-700',
  PRE_SALES: 'bg-blue-100 text-blue-700',
  SALES: 'bg-yellow-100 text-yellow-700',
  POST_PURCHASE: 'bg-green-100 text-green-700',
  SERVICE: 'bg-purple-100 text-purple-700',
  FIDELITY: 'bg-primary-100 text-primary-700',
};

export const sourceLabels: Record<string, string> = {
  REFERRAL: 'Referido',
  WEBSITE: 'Sitio web',
  PARTNERSHIP: 'Alianza',
  DIRECT: 'Directo',
  OTHER: 'Otro',
};

export const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

export const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export const roleLabels: Record<string, string> = {
  AGENT: 'Agente',
  ANALYTICS: 'Analista',
  MANAGEMENT: 'Gerencia',
};

export const categoryLabels: Record<string, string> = {
  SPLIT: 'Split',
  INSTALLATION: 'Instalación',
  MAINTENANCE: 'Mantención',
  ACCESSORY: 'Accesorio',
};

export const interactionTypeLabels: Record<string, string> = {
  CALL: 'Llamada',
  EMAIL: 'Email',
  VISIT: 'Visita',
  WHATSAPP: 'WhatsApp',
  NOTE: 'Nota',
};

export const interactionTypeIcons: Record<string, string> = {
  CALL: 'Phone',
  EMAIL: 'Mail',
  VISIT: 'MapPin',
  WHATSAPP: 'MessageCircle',
  NOTE: 'FileText',
};

export const referralStatusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  CONVERTED: 'Convertido',
  EXPIRED: 'Expirado',
};

export const referralStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONVERTED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-gray-100 text-gray-700',
};
