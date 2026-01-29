# ClimaVentas - CRM HVAC

Sistema CRM completo para la gestión de clientes y ventas de ClimaTecnología.

**"Encuentra la comodidad que mereces"**

## Descripción

ClimaVentas es una aplicación web full-stack diseñada para gestionar el ciclo de vida completo de clientes en el negocio de climatización (HVAC). Incluye:

- Gestión de clientes con etapas del ciclo de vida
- Pipeline de ventas con aprobaciones
- Catálogo de productos HVAC
- Sistema de comisiones configurable
- Gestión de alianzas y referidos
- Dashboard analítico completo
- Control de acceso basado en roles

## Tecnologías

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **Swagger** - Documentación API

### Frontend
- **Next.js 14** - React Framework
- **Tailwind CSS** - Estilos
- **React Query** - Estado del servidor
- **Recharts** - Gráficos
- **Lucide Icons** - Iconografía

## Estructura del Proyecto

```
climaventas/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── auth/              # Autenticación
│   │   ├── users/             # Usuarios
│   │   ├── customers/         # Clientes
│   │   ├── sales/             # Ventas
│   │   ├── products/          # Productos
│   │   ├── interactions/      # Interacciones
│   │   ├── partnerships/      # Alianzas
│   │   ├── referrals/         # Referidos
│   │   └── analytics/         # Analíticas
│   └── prisma/                # Esquema BD
├── frontend/                   # App Next.js
│   ├── src/
│   │   ├── app/               # Páginas
│   │   ├── components/        # Componentes
│   │   └── lib/               # Utilidades
└── render.yaml                # Deployment
```

## Instalación

### Requisitos
- Node.js 18+
- npm o yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

El API estará disponible en `http://localhost:3001`
Documentación Swagger: `http://localhost:3001/api/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Usuarios de Demostración

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@climatecnologia.cl | Demo2024! | MANAGEMENT |
| analista@climatecnologia.cl | Demo2024! | ANALYTICS |
| vendedor@climatecnologia.cl | Demo2024! | AGENT |

## Roles y Permisos

### MANAGEMENT (Gerencia)
- Acceso completo al sistema
- Gestión de usuarios y roles
- Aprobación de ventas
- Configuración de productos
- Todas las analíticas

### ANALYTICS (Analista)
- Vista de todos los clientes (solo lectura)
- Acceso a dashboards y reportes
- Exportación de datos
- Métricas de rendimiento

### AGENT (Agente de Ventas)
- Ver clientes asignados
- Crear/actualizar interacciones
- Registrar ventas (pendientes de aprobación)
- Ver comisiones propias

## Endpoints API Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario actual

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Crear cliente
- `GET /api/customers/:id/timeline` - Línea de tiempo

### Ventas
- `GET /api/sales` - Listar ventas
- `POST /api/sales` - Crear venta
- `PATCH /api/sales/:id/approve` - Aprobar venta

### Analíticas
- `GET /api/analytics/dashboard` - Dashboard principal
- `GET /api/analytics/sales-funnel` - Embudo de ventas
- `GET /api/analytics/commissions` - Reporte comisiones

## Deployment

### Render.com

1. Crea una cuenta en [Render.com](https://render.com)
2. Conecta tu repositorio
3. Usa el archivo `render.yaml` para el blueprint
4. Los servicios se desplegarán automáticamente

### Variables de Entorno Producción

Backend:
- `DATABASE_URL` - URL de la base de datos
- `JWT_SECRET` - Secreto JWT (generado)
- `JWT_REFRESH_SECRET` - Secreto refresh (generado)
- `FRONTEND_URL` - URL del frontend

Frontend:
- `NEXT_PUBLIC_API_URL` - URL del API

## Características Principales

### Gestión de Clientes
- Ciclo de vida: Prospección → Pre-venta → Venta → Post-venta → Servicio → Fidelización
- Fuentes de adquisición: Referido, Web, Alianza, Directo
- Historial de interacciones
- Asignación de agentes

### Pipeline de Ventas
- Estados: Pendiente → Aprobada → Completada / Cancelada
- Cálculo automático de comisiones
- Múltiples métodos de pago

### Sistema de Comisiones
- Comisiones por producto
- Tasa base por agente
- Reglas configurables
- Bonos por volumen

### Analíticas
- Dashboard en tiempo real
- Embudo de conversión
- Rendimiento de agentes
- Proyección de ingresos
- Métricas de retención

## Licencia

Todos los derechos reservados © ClimaTecnología 2024
