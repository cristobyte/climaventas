'use client';

import { useAuth } from '@/lib/auth-context';
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from './sidebar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

function ProtectedLayoutContent({ children, requiredRoles }: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const { isCollapsed, isMobile } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check role access
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso denegado</h1>
          <p className="text-gray-500 mb-4">No tienes permisos para ver esta página.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main
        className={cn(
          'min-h-screen transition-all duration-300 ease-in-out',
          // Mobile: no margin (sidebar overlays)
          // Desktop collapsed: ml-16 (64px)
          // Desktop expanded: ml-64 (256px)
          isMobile ? 'ml-0' : isCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {children}
      </main>
    </div>
  );
}

export function ProtectedLayout({ children, requiredRoles }: ProtectedLayoutProps) {
  return (
    <SidebarProvider>
      <ProtectedLayoutContent requiredRoles={requiredRoles}>
        {children}
      </ProtectedLayoutContent>
    </SidebarProvider>
  );
}
