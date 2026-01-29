'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  ShoppingCart,
  Package,
  Building2,
  UserPlus,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Clientes',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Ventas',
    href: '/sales',
    icon: ShoppingCart,
  },
  {
    label: 'Productos',
    href: '/products',
    icon: Package,
    roles: ['MANAGEMENT'],
  },
  {
    label: 'Analíticas',
    href: '/analytics',
    icon: BarChart3,
    roles: ['ANALYTICS', 'MANAGEMENT'],
    children: [
      { label: 'General', href: '/analytics' },
      { label: 'Comisiones', href: '/analytics/commissions' },
      { label: 'Embudo', href: '/analytics/funnel' },
    ],
  },
  {
    label: 'Alianzas',
    href: '/partnerships',
    icon: Building2,
    roles: ['ANALYTICS', 'MANAGEMENT'],
  },
  {
    label: 'Referidos',
    href: '/referrals',
    icon: UserPlus,
    roles: ['ANALYTICS', 'MANAGEMENT'],
  },
  {
    label: 'Usuarios',
    href: '/users',
    icon: UserCircle,
    roles: ['MANAGEMENT'],
  },
  {
    label: 'Configuración',
    href: '/settings',
    icon: Settings,
    roles: ['MANAGEMENT'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const { isOpen, isCollapsed, isMobile, close, toggleCollapse } = useSidebar();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || hasRole(item.roles)
  );

  // On desktop when collapsed, expand on hover
  const showExpanded = !isCollapsed || isHovering || isMobile;

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (isMobile) {
      close();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out',
          // Width
          showExpanded ? 'w-64' : 'w-16',
          // Mobile positioning
          isMobile && !isOpen && '-translate-x-full',
          isMobile && isOpen && 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {showExpanded ? (
            <Image
              src="https://climatecnologia.cl/wp-content/uploads/2025/11/cropped-logo-clima-horizontal.png"
              alt="ClimaTecnología"
              width={150}
              height={38}
              className="object-contain"
              priority
            />
          ) : (
            <div className="w-full flex justify-center">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
            </div>
          )}

          {/* Mobile close button */}
          {isMobile && isOpen && (
            <button
              onClick={close}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.children && item.children.some((child) => pathname === child.href));
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItem === item.label;

              return (
                <li key={item.href}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => {
                          if (showExpanded) {
                            setExpandedItem(isExpanded ? null : item.label);
                          }
                        }}
                        className={cn(
                          'flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          showExpanded ? 'justify-between' : 'justify-center',
                          isActive
                            ? 'bg-primary-50 text-primary'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                        title={!showExpanded ? item.label : undefined}
                      >
                        <span className={cn('flex items-center', showExpanded && 'gap-3')}>
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          {showExpanded && item.label}
                        </span>
                        {showExpanded && (
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        )}
                      </button>
                      {showExpanded && isExpanded && (
                        <ul className="mt-1 ml-8 space-y-1">
                          {item.children?.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={handleNavClick}
                                className={cn(
                                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                                  pathname === child.href
                                    ? 'bg-primary-50 text-primary font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                )}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        showExpanded ? 'gap-3' : 'justify-center',
                        isActive
                          ? 'bg-primary-50 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                      title={!showExpanded ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {showExpanded && item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-3">
          {showExpanded ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop collapse toggle */}
        {!isMobile && (
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={toggleCollapse}
              className="flex items-center justify-center w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
