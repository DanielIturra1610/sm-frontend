# Frontend Agent - Next.js 15 + Scope Rule Architecture

**🎯 BACKEND STATUS: 100% OPERATIONAL - ALL TESTS PASSING**
- ✅ **Controllers**: 42/42 tests PASS (Auth, Company, Incident, User)
- ✅ **Services**: 42/42 tests PASS (Five Whys, Fishbone, Company, Document, Incident, User, Workflow)
- ✅ **API Endpoints**: Fully functional and validated
- ✅ **Multi-tenant System**: Complete company/tenant management
- ✅ **Document Generation**: Async system with S3/MinIO storage
- ✅ **Workflow Engine**: Advanced incident management workflows

## Project Overview
Stegmaier Management frontend built with **Next.js 15**, **Scope Rule Architecture**, **shadcn/ui**, **pnpm**, and **TypeScript**. Industrial safety document management with multi-tenant support connecting to a fully tested backend API.

---

## 🏗️ Architecture Foundation

### Scope Rule Pattern (Non-negotiable)
**"Scope determines structure"**

- **1 feature usage** → Local placement within feature
- **2+ feature usage** → Global/shared directory
- **NO EXCEPTIONS** - This rule is absolute

### Next.js 15 App Router Structure
```
src/
  app/
    (auth)/                        # Auth route group
      login/page.tsx              # /login
      register/page.tsx           # /register
      _components/                # Auth-specific components
      _hooks/                     # Auth hooks
      _actions/                   # Auth server actions
      layout.tsx                  # Auth layout
    (dashboard)/                   # Dashboard route group
      dashboard/page.tsx          # /dashboard
      incidents/
        page.tsx                  # /incidents
        [id]/page.tsx            # /incidents/[id]
        create/page.tsx          # /incidents/create
        _components/             # Incident-specific components
      companies/
        page.tsx                 # /companies
        [id]/page.tsx           # /companies/[id]
        _components/            # Company-specific components
      documents/
        page.tsx                # /documents
        [id]/page.tsx          # /documents/[id]
        _components/           # Document-specific components
      analysis/
        five-whys/
          page.tsx             # /analysis/five-whys
          [id]/page.tsx       # /analysis/five-whys/[id]
          _components/        # Five Whys components
        fishbone/
          page.tsx            # /analysis/fishbone
          [id]/page.tsx      # /analysis/fishbone/[id]
          _components/       # Fishbone components
      _hooks/                   # Dashboard hooks
      _actions/                 # Dashboard server actions
      layout.tsx               # Dashboard layout
    api/                        # API routes (proxy to Go backend)
      auth/route.ts
      incidents/route.ts
      companies/route.ts
    page.tsx                    # Landing page
    layout.tsx                  # Root layout
    globals.css                 # Global styles
  shared/                       # ONLY for 2+ feature usage
    components/
      ui/                       # shadcn/ui components
      data-table.tsx            # Used across multiple features
      chart-wrapper.tsx         # Used in dashboards and reports
    hooks/                      # Global hooks
      use-api.ts
      use-tenant.ts
    actions/                    # Shared server actions
    types/                      # Global TypeScript types
  lib/                          # Utilities and configurations
    api.ts                      # Backend API client
    auth.ts                     # Authentication utilities
    utils.ts                    # General utilities
```

---

## 🛠️ Core Technologies

### Package Manager & Dependencies
```json
{
  "packageManager": "pnpm@8.15.0",
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "swr": "^2.2.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "jest": "^29.7.0",
    "cypress": "^13.6.0"
  }
}
```

### Project Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage",
    "test:e2e": "cypress open",
    "test:e2e:headless": "cypress run"
  }
}
```

---

## 🏢 Backend Integration

### Validated API Endpoints
The Go backend provides these **fully tested** endpoints:

#### Authentication (100% tested)
```typescript
POST /api/v1/auth/login      # User login
POST /api/v1/auth/register   # User registration
POST /api/v1/auth/refresh    # Token refresh
GET  /api/v1/auth/profile    # User profile
```

#### Multi-tenant Management (100% tested)
```typescript
GET    /api/v1/companies           # List user companies
POST   /api/v1/companies           # Create company
GET    /api/v1/companies/:id       # Get company details
PUT    /api/v1/companies/:id       # Update company
DELETE /api/v1/companies/:id       # Delete company
POST   /api/v1/companies/:id/select # Select tenant
```

#### Incident Management (100% tested)
```typescript
GET    /api/v1/incidents           # List incidents
POST   /api/v1/incidents           # Create incident
GET    /api/v1/incidents/:id       # Get incident
PUT    /api/v1/incidents/:id       # Update incident
DELETE /api/v1/incidents/:id       # Delete incident
POST   /api/v1/incidents/:id/submit # Submit incident
```

#### Root Cause Analysis (100% tested)
```typescript
# Five Whys Analysis
POST /api/v1/analysis/five-whys    # Create analysis
GET  /api/v1/analysis/five-whys/:id # Get analysis
PUT  /api/v1/analysis/five-whys/:id # Update analysis

# Fishbone Analysis
POST /api/v1/analysis/fishbone     # Create analysis
GET  /api/v1/analysis/fishbone/:id # Get analysis
PUT  /api/v1/analysis/fishbone/:id # Update analysis
```

#### Document Generation (100% tested)
```typescript
POST /api/v1/documents/generate    # Generate document
GET  /api/v1/documents/:id         # Get document
GET  /api/v1/documents/:id/download # Download document
```

### API Client Implementation
```typescript
// lib/api.ts
class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL!;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      await this.redirectToLogin();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.message || 'Request failed');
    }

    return response.json();
  }

  // Authentication
  auth = {
    login: (credentials: LoginCredentials) =>
      this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: RegisterData) =>
      this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // Companies (Multi-tenant)
  companies = {
    list: () => this.request<Company[]>('/companies'),
    create: (data: CreateCompanyData) =>
      this.request<Company>('/companies', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    selectTenant: (companyId: string) =>
      this.request<void>(`/companies/${companyId}/select`, {
        method: 'POST',
      }),
  };

  // Incidents
  incidents = {
    list: (params?: IncidentListParams) =>
      this.request<IncidentListResponse>(`/incidents${this.toQueryString(params)}`),
    create: (data: CreateIncidentData) =>
      this.request<Incident>('/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getById: (id: string) => this.request<Incident>(`/incidents/${id}`),
    update: (id: string, data: UpdateIncidentData) =>
      this.request<Incident>(`/incidents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };
}

export const api = new ApiClient();
```

---

## 🔐 Authentication & Route Protection

### Server Component Auth Check
```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('auth-token')?.value;

  if (!token || !(await verifyToken(token))) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

### Server Actions for Auth
```typescript
// app/(auth)/_actions/auth-actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const response = await api.auth.login({ email, password });

    cookies().set('auth-token', response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    redirect('/dashboard');
  } catch (error) {
    return { error: 'Invalid credentials' };
  }
}
```

---

## 🏢 Multi-Tenant Architecture

### Tenant Context (Client Component)
```typescript
// shared/contexts/tenant-context.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface TenantContextType {
  currentTenant: Company | null;
  tenants: Company[];
  switchTenant: (tenantId: string) => Promise<void>;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Company | null>(null);
  const [tenants, setTenants] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const companies = await api.companies.list();
      setTenants(companies);
      // Set first as current if none selected
      if (companies.length > 0 && !currentTenant) {
        setCurrentTenant(companies[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    await api.companies.selectTenant(tenantId);
    const tenant = tenants.find(t => t.id === tenantId);
    setCurrentTenant(tenant || null);
  };

  return (
    <TenantContext.Provider value={{
      currentTenant,
      tenants,
      switchTenant,
      isLoading
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
```

---

## 🎨 Component Architecture (Scope Rule Applied)

### Landing Page (Page Component)
```typescript
// app/page.tsx - Server Component
import { Suspense } from 'react';
import { HeroSection } from './_components/hero-section';
import { FeaturesSection } from './_components/features-section';
import { StatsSection } from './_components/stats-section';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Suspense fallback={<div>Loading features...</div>}>
        <FeaturesSection />
      </Suspense>
      <StatsSection />
    </div>
  );
}
```

### Feature-Specific Components (Local Scope)
```typescript
// app/(dashboard)/incidents/_components/incident-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { incidentSchema } from '../_types';

export function IncidentForm() {
  const form = useForm({
    resolver: zodResolver(incidentSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Incident-specific form fields */}
    </form>
  );
}
```

### Shared Components (Global Scope - 2+ features)
```typescript
// shared/components/data-table.tsx - Used by incidents, companies, documents
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {/* Table header implementation */}
        </TableHeader>
        <TableBody>
          {/* Table body implementation */}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## 📊 Data Fetching Patterns

### Server Component Data Fetching
```typescript
// app/(dashboard)/incidents/page.tsx
import { api } from '@/lib/api';
import { IncidentsList } from './_components/incidents-list';

export default async function IncidentsPage() {
  const incidents = await api.incidents.list();

  return (
    <div>
      <h1>Incident Management</h1>
      <IncidentsList initialData={incidents} />
    </div>
  );
}
```

### Client Component with SWR
```typescript
// app/(dashboard)/incidents/_components/incidents-list.tsx
'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

interface IncidentsListProps {
  initialData: Incident[];
}

export function IncidentsList({ initialData }: IncidentsListProps) {
  const { data: incidents, isLoading, mutate } = useSWR(
    '/incidents',
    () => api.incidents.list(),
    { fallbackData: initialData }
  );

  if (isLoading) return <IncidentsSkeleton />;

  return (
    <div>
      {incidents?.map(incident => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
```

---

## 🎯 Landing Page Requirements

### Hero Section
```typescript
// app/_components/hero-section.tsx
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Stegmaier Safety Management
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Comprehensive industrial safety document management system with
          advanced incident reporting, root cause analysis, and workflow automation.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

### Features Section
```typescript
// app/_components/features-section.tsx
import { Shield, FileText, BarChart3, Workflow } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Incident Management',
    description: 'Complete incident reporting and tracking system'
  },
  {
    icon: BarChart3,
    title: 'Root Cause Analysis',
    description: 'Five Whys and Fishbone analysis tools'
  },
  {
    icon: FileText,
    title: 'Document Generation',
    description: 'Automated safety document creation'
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description: 'Streamlined approval and notification processes'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need for Safety Management
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <feature.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 🔧 Development Setup Commands

### Initial Setup
```bash
# Navigate to frontend directory
cd C:\Users\Asus\Documents\sm-frontend

# Initialize Next.js 15 project with pnpm
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional dependencies
pnpm add @radix-ui/react-* class-variance-authority clsx tailwind-merge
pnpm add react-hook-form @hookform/resolvers zod swr lucide-react
pnpm add -D @testing-library/react @testing-library/jest-dom jest cypress

# Install shadcn/ui
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button card input form table
```

### Environment Setup
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=Stegmaier Safety Management
```

---

## 🚨 Reglas Críticas para Prevenir Errores Client-Side

### 1. **Hidratación y SSR Safety**
- **SIEMPRE** usar el patrón de "mounted state" en componentes client-side:
```tsx
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return <LoadingComponent />
}
```

### 2. **Validación de Props y Estados**
- **NUNCA** asumir que las props existen sin validar:
```tsx
// ❌ INCORRECTO
{company.name}
{company.subscription.plan}

// ✅ CORRECTO
{company?.name || 'Nombre no disponible'}
{company?.subscription?.plan || 'plan básico'}
```

### 3. **Arrays y Mapeo Seguro**
- **SIEMPRE** validar arrays antes de mapear:
```tsx
// ❌ INCORRECTO
{companies.map((company) => ...)}

// ✅ CORRECTO
{Array.isArray(companies) && companies.length > 0 && companies.map((company) => {
  if (!company || !company.id) {
    console.warn('Invalid company data:', company)
    return null
  }
  return <Component key={company.id} />
}).filter(Boolean)}
```

### 4. **Manejo de Funciones del Contexto**
- **SIEMPRE** validar que las funciones del contexto existan antes de usarlas:
```tsx
// ❌ INCORRECTO
await loadCompanies()

// ✅ CORRECTO
if (!loadCompanies) {
  setError('Función no disponible')
  return
}
await loadCompanies()
```

### 5. **useEffect Dependencies**
- **SIEMPRE** incluir todas las dependencias necesarias y validar el estado:
```tsx
// ❌ INCORRECTO
useEffect(() => {
  loadCompanies()
}, [])

// ✅ CORRECTO
useEffect(() => {
  if (!mounted || isLoading || !user || !loadCompanies) {
    return
  }
  loadCompanies().catch((err) => {
    console.error('Error:', err)
    setError('Error al cargar')
  })
}, [mounted, isLoading, user, loadCompanies])
```

### 6. **Error Boundaries y Logging**
- **SIEMPRE** envolver operaciones async en try-catch con logging:
```tsx
// ✅ CORRECTO
const handleAction = async () => {
  try {
    await operation()
  } catch (error) {
    console.error('Error en operación:', error)
    setError('Mensaje descriptivo para el usuario')
  }
}
```

### 7. **Link y Button Components**
- **NUNCA** anidar Link dentro de Button o viceversa sin usar `asChild` correctamente:
```tsx
// ❌ INCORRECTO (causa React.Children.only error)
<Button asChild>
  <Link href="/path">
    <Icon />
    Texto
  </Link>
</Button>

// ✅ CORRECTO - Estructura simple
<Link href="/path">
  <Button className="w-full">
    <Icon />
    Texto
  </Button>
</Link>
```

### 8. **Validation Guards en Funciones**
- **SIEMPRE** validar parámetros al inicio de funciones:
```tsx
const handleSelectTenant = async (companyId: string) => {
  // Validation guards
  if (!companyId || !selectTenant) {
    setError('Datos inválidos')
    return
  }
  // ... resto de la función
}
```

### 9. **String Safety**
- **SIEMPRE** validar strings antes de usar métodos:
```tsx
const capitalizeFirst = (str: string) => {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
```

### 10. **Loading States**
- **SIEMPRE** manejar estados de carga múltiples:
```tsx
// Para inicialización
if (!mounted) return <InitialLoading />

// Para operaciones específicas
if (isLoadingCompanies) return <CompaniesLoading />

// Para auth
if (isLoading) return <AuthLoading />
```

## 📋 Checklist Pre-Commit

Antes de hacer commit, verificar:

- [ ] ¿Todos los arrays están validados con `Array.isArray()`?
- [ ] ¿Todas las props opcionales usan optional chaining (`?.`)?
- [ ] ¿Todas las funciones async tienen try-catch?
- [ ] ¿Los componentes client-side usan el patrón mounted?
- [ ] ¿Los useEffect tienen las dependencias correctas?
- [ ] ¿Los Links y Buttons están estructurados correctamente?
- [ ] ¿Las funciones validan sus parámetros?
- [ ] ¿Los strings se validan antes de usar métodos?

## 🔧 Build Testing

Antes de cada deployment:

```bash
# Ejecutar build para detectar errores de SSR
pnpm build

# Verificar que no hay errores de prerendering
# Revisar logs por "Error occurred prerendering page"
```

## 🐛 Debug Client-Side Errors

Cuando aparezca "Application error: a client-side exception has occurred":

1. **Abrir DevTools Console** y buscar el error específico
2. **Verificar el stack trace** para identificar el componente problemático
3. **Revisar cada uso de:**
   - Optional chaining (`?.`)
   - Array mapping con validación
   - useEffect dependencies
   - Funciones del contexto

## 💡 Notas Adicionales

- **Desarrollo local:** Usar `pnpm dev` en modo estricto para detectar problemas temprano
- **Logs:** Mantener `console.error()` para errores importantes, `console.warn()` para advertencias
- **Fallbacks:** Siempre proporcionar valores por defecto razonables
- **Performance:** Los validation guards son más importantes que la optimización micro

**Recuerda:** Es mejor tener código defensivo y verboso que errores en producción. Estas reglas deben seguirse religiosamente para mantener la estabilidad del frontend.

---

## 🎯 Next Steps

1. **Move agent file** to frontend directory
2. **Set up Next.js 15 project** with pnpm
3. **Create landing page** explaining the application
4. **Implement authentication** flow
5. **Build dashboard** with multi-tenant support
6. **Add incident management** features
7. **Implement analysis tools** (Five Whys, Fishbone)
8. **Add document generation** interface

The backend is **100% ready and tested** - we can immediately start building the frontend with confidence that all API endpoints are fully functional and validated.