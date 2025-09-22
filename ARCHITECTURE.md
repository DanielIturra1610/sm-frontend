# Stegmaier Management - Screaming Architecture

## 🏗️ Architectural Overview

Esta aplicación utiliza **Screaming Architecture** personalizada para el dominio de **gestión de seguridad industrial**, donde la estructura del código "grita" inmediatamente su propósito empresarial.

## 📁 Structure Philosophy

### Core Principles
1. **Domain-Driven Structure**: La organización refleja conceptos de seguridad industrial
2. **Scope Rule**: 1 feature = local, 2+ features = shared
3. **Screaming Intent**: Cada directorio comunica su propósito de negocio

### Safety Management Domain Structure

```
src/
├── safety-management/           # 🛡️ CORE SAFETY DOMAIN
│   ├── incidents/              # Gestión de incidentes
│   │   ├── reporting/          # Reporte de incidentes
│   │   ├── tracking/           # Seguimiento y states
│   │   └── investigation/      # Investigación
│   ├── analysis/               # Análisis de causa raíz
│   │   ├── five-whys/         # Metodología 5 Porqués
│   │   ├── fishbone/          # Diagrama Ishikawa
│   │   └── root-cause/        # Análisis general
│   ├── documents/             # Gestión documental
│   │   ├── generation/        # Generación automática
│   │   ├── templates/         # Plantillas safety
│   │   └── compliance/        # Cumplimiento normativo
│   └── workflows/             # Flujos de trabajo
│       ├── approval/          # Procesos de aprobación
│       ├── notification/      # Sistema de notificaciones
│       └── audit/             # Auditoría y trazabilidad
├── multi-tenant/              # 🏢 MULTI-TENANCY
│   ├── companies/             # Gestión de empresas
│   ├── tenants/               # Manejo de tenants
│   └── permissions/           # Control de acceso
├── authentication/            # 🔐 AUTENTICACIÓN
│   ├── login/                 # Inicio de sesión
│   ├── register/              # Registro de usuarios
│   └── security/              # Seguridad y tokens
├── shared/                    # 🔄 COMPONENTES COMPARTIDOS
│   ├── components/            # UI reutilizable
│   │   ├── ui/               # shadcn/ui components
│   │   ├── forms/            # Formularios comunes
│   │   ├── charts/           # Gráficos y analytics
│   │   └── tables/           # Tablas de datos
│   ├── hooks/                # Custom hooks
│   ├── types/                # TypeScript definitions
│   └── utils/                # Utilidades generales
└── lib/                      # 🛠️ INFRAESTRUCTURA
    ├── api/                  # Cliente API
    ├── auth/                 # Utilities de auth
    ├── validations/          # Esquemas Zod
    └── utils/                # Helpers técnicos
```

## 🎯 Business Intent Visibility

### Immediate Understanding
Al ver esta estructura, cualquier desarrollador entiende inmediatamente:

- ✅ **Es un sistema de gestión de seguridad industrial**
- ✅ **Maneja incidentes, análisis de causa raíz y documentos**
- ✅ **Tiene capacidades multi-tenant**
- ✅ **Incluye workflows de aprobación y auditoría**
- ✅ **Enfoque en compliance y templates de seguridad**

### Domain Concepts Mapping

| Directorio | Concepto de Negocio | Responsabilidad |
|-----------|-------------------|-----------------|
| `incidents/` | Gestión de Incidentes | Reporte, seguimiento, investigación |
| `analysis/` | Análisis Causa Raíz | Five Whys, Fishbone, metodologías |
| `documents/` | Gestión Documental | Templates, generación, compliance |
| `workflows/` | Procesos de Negocio | Aprobaciones, notificaciones, audit |
| `multi-tenant/` | Arquitectura Empresarial | Companies, tenants, permissions |

## 🔧 Implementation Benefits

### Development Experience
- **Navegación Intuitiva**: Desarrolladores encuentran código por concepto de negocio
- **Onboarding Rápido**: Nuevos devs entienden el dominio inmediatamente
- **Feature Discovery**: Fácil identificar dónde implementar nuevas funcionalidades

### Business Alignment
- **Comunicación**: Stakeholders reconocen conceptos familiares
- **Requirements**: Maps directamente a procesos de seguridad industrial
- **Maintenance**: Changes se ubican por área de negocio, no por tecnología

### Scalability
- **Module Growth**: Nuevos conceptos de safety se integran naturalmente
- **Team Organization**: Teams pueden organizarse por dominios de seguridad
- **Feature Isolation**: Cambios en incidents no afectan analysis o documents

## 📋 Next.js Integration

Esta estructura se complementa con Next.js App Router:

```
app/
├── (auth)/                    # Route group para autenticación
├── (dashboard)/               # Route group para dashboard
│   ├── incidents/            # Pages de gestión de incidentes
│   ├── analysis/             # Pages de análisis
│   ├── documents/            # Pages de documentos
│   └── companies/            # Pages multi-tenant
└── api/                      # API routes (proxy a Go backend)
```

## 🎨 Component Organization

Los componentes siguen la misma filosofía:

- **Local Components**: Específicos a un dominio (`incidents/_components/`)
- **Shared Components**: Usados por 2+ dominios (`shared/components/`)
- **UI Components**: shadcn/ui base (`shared/components/ui/`)

Esta arquitectura garantiza que el código comunique claramente que es un **sistema de gestión de seguridad industrial** con capacidades empresariales robustas.