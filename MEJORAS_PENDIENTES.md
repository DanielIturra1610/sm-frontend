# Mejoras Pendientes - Stegmaier Safety Management

**Fecha de análisis:** 16 de Diciembre 2025
**Versión:** 1.0

---

## Tabla de Contenidos

1. [Problemas de Duplicidad de Registros](#1-problemas-de-duplicidad-de-registros)
2. [Validación de RUT](#2-validación-de-rut)
3. [Indicadores y Métricas](#3-indicadores-y-métricas)
4. [Botones Sin Funcionalidad](#4-botones-sin-funcionalidad)
5. [Reestructuración de Sucesos](#5-reestructuración-de-sucesos)
6. [Funcionalidad de Etiquetas](#6-funcionalidad-de-etiquetas)
7. [Página de Edición de Incidentes](#7-página-de-edición-de-incidentes)
8. [Diferencia entre Suceso y Flash Report](#8-diferencia-entre-suceso-y-flash-report)
9. [Auto-relleno de Campos](#9-auto-relleno-de-campos)
10. [Descarga Directa de Reportes](#10-descarga-directa-de-reportes)
11. [Nomenclatura de Archivos Exportados](#11-nomenclatura-de-archivos-exportados)
12. [Botón Copy-Paste en Acciones Inmediatas](#12-botón-copy-paste-en-acciones-inmediatas)
13. [Error al Crear Reporte de Acciones Inmediatas](#13-error-al-crear-reporte-de-acciones-inmediatas)

---

## 1. Problemas de Duplicidad de Registros

### Problema
No existe validación para evitar empresas duplicadas por diferencias de mayúsculas/minúsculas o espacios.

### Ubicación del Código
- **Backend:** `internal/core/company/services/company_service.go`
- **Backend:** `internal/adapters/postgresql/company_repository.go`
- **Frontend:** `src/app/(auth)/create-tenant/page.tsx`

### Estado Actual
```go
// No hay validación de duplicados por nombre normalizado
func (s *companyService) CreateCompany(ctx context.Context, dto domain.CreateCompanyDTO) (*domain.Company, error) {
    // Solo valida campos requeridos, no busca duplicados
}
```

### Solución Propuesta

#### Backend
```go
// Agregar en company_repository.go
func (r *companyRepository) FindByNormalizedName(ctx context.Context, name string) (*domain.Company, error) {
    normalizedName := strings.ToLower(strings.TrimSpace(name))
    query := `SELECT * FROM companies WHERE LOWER(TRIM(name)) = $1`
    // ...
}

// Agregar en company_service.go
func (s *companyService) CreateCompany(ctx context.Context, dto domain.CreateCompanyDTO) (*domain.Company, error) {
    // Verificar duplicados por nombre normalizado
    existing, err := s.repo.FindByNormalizedName(ctx, dto.Name)
    if err == nil && existing != nil {
        return nil, errors.NewBadRequestError("Ya existe una empresa con este nombre")
    }

    // Verificar duplicados por RUT
    existingByRUT, err := s.repo.FindByRUT(ctx, normalizeRUT(dto.RUT))
    if err == nil && existingByRUT != nil {
        return nil, errors.NewBadRequestError("Ya existe una empresa con este RUT")
    }
    // ...
}
```

#### Frontend
- Agregar validación en tiempo real mientras el usuario escribe
- Mostrar advertencia si existe empresa similar

### Prioridad: **ALTA**

---

## 2. Validación de RUT

### Problema
No hay indicación de formato de RUT (con/sin puntos, con/sin guión).

### Ubicación del Código
- **Frontend:** `src/app/(auth)/create-tenant/page.tsx`
- **Frontend:** `src/lib/validations/company-schema.ts` (si existe)
- **Backend:** `internal/core/company/domain/company.go`

### Estado Actual
```typescript
// Solo valida longitud, no formato
rut: z.string()
  .min(8, 'RUT debe tener al menos 8 caracteres')
  .max(12, 'RUT debe tener como máximo 12 caracteres')
```

### Solución Propuesta

#### Frontend - Validación y Formato
```typescript
// Crear utilidad de RUT en src/lib/utils/rut.ts
export function formatRUT(rut: string): string {
  // Eliminar puntos y guiones existentes
  let clean = rut.replace(/[.-]/g, '');

  // Separar cuerpo y dígito verificador
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);

  // Formatear con puntos y guión
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
  return formatted;
}

export function validateRUT(rut: string): boolean {
  const clean = rut.replace(/[.-]/g, '');
  if (clean.length < 8 || clean.length > 9) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();

  // Algoritmo módulo 11
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();

  return dv === calculatedDV;
}

// Schema actualizado
rut: z.string()
  .min(8, 'RUT debe tener al menos 8 caracteres')
  .max(12, 'RUT debe tener como máximo 12 caracteres')
  .refine(validateRUT, 'RUT inválido')
```

#### UI - Indicaciones Claras
```tsx
<div className="space-y-2">
  <Label htmlFor="rut">RUT *</Label>
  <Input
    id="rut"
    placeholder="12.345.678-9"
    {...register('rut', {
      onChange: (e) => {
        e.target.value = formatRUT(e.target.value);
      }
    })}
  />
  <p className="text-xs text-muted-foreground">
    Ingrese RUT con formato: 12.345.678-9 (se formateará automáticamente)
  </p>
</div>
```

### Prioridad: **MEDIA**

---

## 3. Indicadores y Métricas

### Problema
Faltan varios indicadores solicitados en el dashboard.

### Indicadores Requeridos

| Indicador | Estado | Ubicación |
|-----------|--------|-----------|
| Índice de frecuencia | ❌ No existe | Dashboard |
| Sucesos por actividad | ❌ No existe | Dashboard |
| Sucesos por factor de riesgo | ❌ No existe | Dashboard |
| Sucesos por zona | ❌ No existe | Dashboard |
| Sucesos abiertos en plazo vencido | ❌ No existe | Dashboard |
| Sucesos abiertos en plazo | ❌ No existe | Dashboard |
| Separar accidentes/PLGF de incidentes/T0 | ❌ No existe | Dashboard |
| Pirámide por zona | ❌ No existe | Dashboard |
| Pirámide por área | ❌ No existe | Dashboard |
| Accidentes con baja/sin baja | ⚠️ Parcial | Solo en clasificación |

### Solución Propuesta

#### Backend - Nuevos Endpoints
```go
// internal/controllers/metrics.go

// GET /metrics/frequency-index
func (c *MetricsController) GetFrequencyIndex(ctx *fiber.Ctx) error {
    // Índice de Frecuencia = (N° Accidentes * 1,000,000) / Horas Hombre Trabajadas
}

// GET /metrics/incidents-by-activity
func (c *MetricsController) GetIncidentsByActivity(ctx *fiber.Ctx) error {}

// GET /metrics/incidents-by-risk-factor
func (c *MetricsController) GetIncidentsByRiskFactor(ctx *fiber.Ctx) error {}

// GET /metrics/incidents-by-zone
func (c *MetricsController) GetIncidentsByZone(ctx *fiber.Ctx) error {}

// GET /metrics/overdue-incidents
func (c *MetricsController) GetOverdueIncidents(ctx *fiber.Ctx) error {}

// GET /metrics/on-time-incidents
func (c *MetricsController) GetOnTimeIncidents(ctx *fiber.Ctx) error {}

// GET /metrics/pyramid-by-zone
func (c *MetricsController) GetPyramidByZone(ctx *fiber.Ctx) error {}

// GET /metrics/pyramid-by-area
func (c *MetricsController) GetPyramidByArea(ctx *fiber.Ctx) error {}

// GET /metrics/accidents-by-leave-type
func (c *MetricsController) GetAccidentsByLeaveType(ctx *fiber.Ctx) error {
    // Separar: con baja (tiempo perdido) vs sin baja (tiempo de licencia)
}
```

#### Frontend - Nuevos Componentes
```
src/app/(app)/dashboard/
├── components/
│   ├── frequency-index-card.tsx
│   ├── incidents-by-activity-chart.tsx
│   ├── incidents-by-zone-chart.tsx
│   ├── incidents-by-risk-factor-chart.tsx
│   ├── overdue-incidents-list.tsx
│   ├── on-time-incidents-list.tsx
│   ├── safety-pyramid.tsx
│   ├── pyramid-by-zone.tsx
│   ├── pyramid-by-area.tsx
│   └── accidents-leave-breakdown.tsx
```

#### Modelo de Datos - Campos Adicionales
```go
// Agregar a Incident domain
type Incident struct {
    // ... campos existentes

    // Nuevos campos para métricas
    Actividad      string  `json:"actividad"`       // Tipo de actividad
    FactorRiesgo   string  `json:"factorRiesgo"`    // Factor de riesgo
    Zona           string  `json:"zona"`            // Zona geográfica
    Area           string  `json:"area"`            // Área de trabajo

    // Para accidentes
    TipoBaja       string  `json:"tipoBaja"`        // con_baja, sin_baja
    DiasLicencia   int     `json:"diasLicencia"`    // Días de licencia médica
    TiempoPerdido  int     `json:"tiempoPerdido"`   // Horas de tiempo perdido
}
```

### Prioridad: **ALTA**

---

## 4. Botones Sin Funcionalidad

### Problema
Los botones de búsqueda, notificaciones y configuración en el header no tienen funcionalidad.

### Ubicación del Código
- **Frontend:** `src/app/(app)/layout.tsx` (líneas ~45-70)

### Estado Actual
```tsx
{/* Botones sin funcionalidad */}
<Button variant="ghost" size="icon" className="hidden sm:flex">
  <Search className="h-5 w-5" />
</Button>
<Button variant="ghost" size="icon" className="relative">
  <Bell className="h-5 w-5" />
  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
</Button>
<Button variant="ghost" size="icon" className="hidden sm:flex">
  <Settings className="h-5 w-5" />
</Button>
```

### Solución Propuesta

#### Opción A: Eliminar Botones (Recomendado para MVP)
```tsx
{/* Eliminar completamente los botones sin funcionalidad */}
<div className="flex items-center gap-2">
  {/* Solo mantener info de usuario y logout */}
  <div className="hidden sm:flex items-center gap-2 text-sm">
    <span className="font-medium">{user?.fullName}</span>
    <span className="text-muted-foreground">{user?.email}</span>
  </div>
  <Button variant="outline" size="sm" onClick={handleLogout}>
    <LogOut className="h-4 w-4 mr-2" />
    Cerrar Sesión
  </Button>
</div>
```

#### Opción B: Implementar Funcionalidad (Futuro)
- **Búsqueda:** Command palette (Cmd+K) para buscar incidentes/reportes
- **Notificaciones:** Sistema de notificaciones con SLA vencidos, reportes pendientes
- **Configuración:** Enlace a página de configuración de usuario/empresa

### Prioridad: **ALTA** (eliminar para MVP)

---

## 5. Reestructuración de Sucesos

### Problema
La estructura actual de "Incidentes" debe cambiarse a "Sucesos" con nueva taxonomía.

### Nueva Taxonomía Requerida

```
SUCESO (Nivel 1)
├── Accidente
│   ├── Del trabajo con baja
│   ├── Del trabajo sin baja
│   ├── De trayecto con baja
│   ├── De trayecto sin baja
│   └── Ambiental
├── Incidente
│   ├── Laboral
│   ├── Industrial
│   ├── Ambiental
│   └── PLGF
└── Tolerancia 0
    ├── Acción insegura
    ├── Condición insegura
    └── Paralización de faena (Stop Work)
```

### Cambios Requeridos

#### Backend - Actualizar Domain
```go
// internal/core/incident/domain/incident.go

// Renombrar tipos
type SucesoCategory string

const (
    CategoryAccidente   SucesoCategory = "accidente"
    CategoryIncidente   SucesoCategory = "incidente"
    CategoryTolerancia0 SucesoCategory = "tolerancia_0"
)

type SucesoType string

// Tipos de Accidente
const (
    TypeAccTrabajoConBaja  SucesoType = "acc_trabajo_con_baja"
    TypeAccTrabajoSinBaja  SucesoType = "acc_trabajo_sin_baja"
    TypeAccTrayectoConBaja SucesoType = "acc_trayecto_con_baja"
    TypeAccTrayectoSinBaja SucesoType = "acc_trayecto_sin_baja"
    TypeAccAmbiental       SucesoType = "acc_ambiental"
)

// Tipos de Incidente
const (
    TypeIncLaboral    SucesoType = "inc_laboral"
    TypeIncIndustrial SucesoType = "inc_industrial"
    TypeIncAmbiental  SucesoType = "inc_ambiental"
    TypeIncPLGF       SucesoType = "inc_plgf"
)

// Tipos de Tolerancia 0
const (
    TypeT0AccionInsegura    SucesoType = "t0_accion_insegura"
    TypeT0CondicionInsegura SucesoType = "t0_condicion_insegura"
    TypeT0StopWork          SucesoType = "t0_stop_work"
)

type Suceso struct {
    ID          string         `json:"id"`
    TenantID    string         `json:"tenantId"`
    Categoria   SucesoCategory `json:"categoria"`   // accidente, incidente, tolerancia_0
    Tipo        SucesoType     `json:"tipo"`        // Subtipo específico
    // ... resto de campos
}
```

#### Frontend - Actualizar Formulario de Creación
```tsx
// src/app/(app)/incidents/create/page.tsx -> src/app/(app)/sucesos/create/page.tsx

const SUCESO_OPTIONS = {
  accidente: {
    label: 'Accidente',
    tipos: [
      { value: 'acc_trabajo_con_baja', label: 'Del trabajo con baja' },
      { value: 'acc_trabajo_sin_baja', label: 'Del trabajo sin baja' },
      { value: 'acc_trayecto_con_baja', label: 'De trayecto con baja' },
      { value: 'acc_trayecto_sin_baja', label: 'De trayecto sin baja' },
      { value: 'acc_ambiental', label: 'Ambiental' },
    ]
  },
  incidente: {
    label: 'Incidente',
    tipos: [
      { value: 'inc_laboral', label: 'Laboral' },
      { value: 'inc_industrial', label: 'Industrial' },
      { value: 'inc_ambiental', label: 'Ambiental' },
      { value: 'inc_plgf', label: 'PLGF' },
    ]
  },
  tolerancia_0: {
    label: 'Tolerancia 0',
    tipos: [
      { value: 't0_accion_insegura', label: 'Acción insegura' },
      { value: 't0_condicion_insegura', label: 'Condición insegura' },
      { value: 't0_stop_work', label: 'Paralización de faena (Stop Work)' },
    ]
  }
};
```

#### Actualizar Rutas y Navegación
```
/incidents -> /sucesos
/incidents/create -> /sucesos/create
/incidents/[id] -> /sucesos/[id]
/incidents/[id]/edit -> /sucesos/[id]/edit
```

#### Actualizar Textos UI
- "Incidente" → "Suceso"
- "Crear Nuevo Incidente" → "Crear Nuevo Suceso"
- "Reportar Incidente" → "Reportar Suceso"
- Sidebar: "Incidentes" → "Sucesos"

### Prioridad: **ALTA**

---

## 6. Funcionalidad de Etiquetas

### Problema
Se solicita eliminar la funcionalidad de etiquetas.

### Ubicación del Código

**Frontend:**
- `src/app/(app)/incidents/create/page.tsx` (campo de etiquetas)
- `src/app/(app)/incidents/page.tsx` (display de etiquetas en lista)
- `src/app/(app)/incidents/[id]/page.tsx` (display de etiquetas en detalle)

**Backend:**
- `internal/core/incident/domain/incident.go` (campo Tags)
- `internal/adapters/postgresql/incident_repository.go`

### Solución Propuesta

#### Frontend - Eliminar Campo de Etiquetas
```tsx
// En create/page.tsx - ELIMINAR este bloque:
{/*
<div className="space-y-2">
  <Label htmlFor="tags">Etiquetas</Label>
  <Input
    id="tags"
    placeholder="etiqueta1, etiqueta2, etiqueta3"
    {...register('tags')}
  />
  <p className="text-xs text-muted-foreground">
    Etiquetas separadas por comas para categorizar este incidente
  </p>
</div>
*/}

// En page.tsx (lista) - ELIMINAR display de tags
// En [id]/page.tsx (detalle) - ELIMINAR sección de tags
```

#### Backend - Deprecar Campo
```go
// Mantener campo en DB para datos históricos pero marcar como deprecated
type Incident struct {
    // ...
    Tags []string `json:"tags,omitempty"` // Deprecated: No usar
}
```

### Prioridad: **MEDIA**

---

## 7. Página de Edición de Incidentes

### Problema
La página `/incidents/[id]/edit` no existe, muestra error 404.

### Estado Actual
- No existe el archivo `src/app/(app)/incidents/[id]/edit/page.tsx`
- El botón "Editar" en la página de detalle apunta a una ruta inexistente

### Solución Propuesta

#### Crear Página de Edición
```tsx
// src/app/(app)/incidents/[id]/edit/page.tsx

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useIncident, useUpdateIncident } from '@/shared/hooks/incident-hooks'
import { incidentSchema } from '@/lib/validations/incident-schema'
// ... imports

export default function EditIncidentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: incident, isLoading } = useIncident(id)
  const { trigger: updateIncident, isMutating } = useUpdateIncident(id)

  const form = useForm({
    resolver: zodResolver(incidentSchema),
    defaultValues: incident // Pre-llenar con datos existentes
  })

  // Actualizar form cuando lleguen datos
  useEffect(() => {
    if (incident) {
      form.reset({
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        type: incident.type,
        location: incident.location,
        // ... otros campos
      })
    }
  }, [incident])

  const onSubmit = async (data) => {
    try {
      await updateIncident(data)
      toast.success('Suceso actualizado exitosamente')
      router.push(`/incidents/${id}`)
    } catch (error) {
      toast.error('Error al actualizar el suceso')
    }
  }

  if (isLoading) return <Skeleton />

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1>Editar Suceso</h1>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campos del formulario - similares a create */}
      </form>
    </div>
  )
}
```

### Prioridad: **ALTA**

---

## 8. Diferencia entre Suceso y Flash Report

### Problema
No está clara la diferencia entre "Reportar Incidente" y "Generar Reporte" en el dashboard.

### Aclaración de Flujo

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. SUCESO      │ --> │  2. FLASH       │ --> │  3. ACCIONES    │
│  (Registro      │     │     REPORT      │     │     INMEDIATAS  │
│   inicial)      │     │  (24 horas)     │     │  (24-48 horas)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        v
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  6. REPORTE     │ <-- │  5. PLAN DE     │ <-- │  4. ANÁLISIS    │
│     FINAL       │     │     ACCIÓN      │     │     CAUSA RAÍZ  │
│  (30 días)      │     │  (7-14 días)    │     │  (2-7 días)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Solución UI - Clarificar en Dashboard

```tsx
// Actualizar cards del dashboard
const QUICK_ACTIONS = [
  {
    title: 'Reportar Suceso',
    description: 'Registrar un nuevo suceso de seguridad',
    icon: AlertTriangle,
    href: '/sucesos/create',
    color: 'red'
  },
  {
    title: 'Generar Flash Report',
    description: 'Crear reporte inicial de un suceso existente (24h)',
    icon: FileText,
    href: '/reports/flash/create',
    color: 'blue'
  }
]
```

### Unificar Creación (Opción Recomendada)
Si el cliente lo prefiere, se puede unificar la creación de suceso + flash report en un solo formulario.

```tsx
// Crear suceso Y flash report en un solo paso
async function createSucesoWithFlashReport(data) {
  // 1. Crear suceso
  const suceso = await createSuceso(data.suceso)

  // 2. Crear flash report automáticamente
  const flashReport = await createFlashReport({
    incident_id: suceso.id,
    ...data.flashReport
  })

  return { suceso, flashReport }
}
```

### Prioridad: **ALTA**

---

## 9. Auto-relleno de Campos

### Problema
Al crear un suceso, los campos deberían ser los mismos que el Flash Report para auto-rellenado.

### Campos a Sincronizar

| Campo Suceso | Campo Flash Report | Auto-relleno |
|--------------|-------------------|--------------|
| titulo | suceso | ✅ |
| descripcion | descripcion | ✅ |
| tipo | tipo | ✅ |
| severidad | - | Manual |
| ubicacion | lugar | ✅ |
| fecha_hora | fecha + hora | ✅ |
| area | area_zona | ✅ |
| empresa | empresa | ✅ |
| supervisor | supervisor | ✅ |

### Solución - Formulario Unificado

```tsx
// Campos comunes entre Suceso y Flash Report
const COMMON_FIELDS = [
  { name: 'suceso', label: 'Suceso', type: 'text' },
  { name: 'tipo', label: 'Tipo', type: 'select' },
  { name: 'fecha', label: 'Fecha', type: 'date' },
  { name: 'hora', label: 'Hora', type: 'time' },
  { name: 'lugar', label: 'Lugar', type: 'text' },
  { name: 'area_zona', label: 'Área/Zona', type: 'text' },
  { name: 'empresa', label: 'Empresa', type: 'text' },
  { name: 'supervisor', label: 'Supervisor', type: 'text' },
  { name: 'descripcion', label: 'Descripción', type: 'textarea' },
  { name: 'acciones_inmediatas', label: 'Acciones Inmediatas', type: 'textarea' },
  { name: 'controles_inmediatos', label: 'Controles Inmediatos', type: 'textarea' },
  { name: 'factores_riesgo', label: 'Factores de Riesgo', type: 'textarea' },
];
```

### Prioridad: **ALTA**

---

## 10. Descarga Directa de Reportes

### Problema
Falta botón de descarga directa (PDF/DOC) junto al icono de ver en la lista de reportes.

### Ubicación del Código
- `src/app/(app)/reports/flash/page.tsx`
- `src/app/(app)/reports/immediate-actions/page.tsx`
- Otras páginas de lista de reportes

### Estado Actual
```tsx
// Solo hay botón de ver (ojo)
<Button variant="ghost" size="icon" onClick={() => router.push(`/reports/flash/${report.id}`)}>
  <Eye className="h-4 w-4" />
</Button>
```

### Solución Propuesta

```tsx
import { Download, Eye, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

// Agregar botón de descarga junto al ojo
<div className="flex items-center gap-1">
  <Button variant="ghost" size="icon" onClick={() => router.push(`/reports/flash/${report.id}`)}>
    <Eye className="h-4 w-4" />
  </Button>

  {/* Nuevo: Botón de descarga directa */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <Download className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => handleExport(report.id, 'pdf')}>
        Descargar PDF
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleExport(report.id, 'docx')}>
        Descargar Word
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <Button variant="ghost" size="icon" onClick={() => router.push(`/reports/flash/${report.id}/edit`)}>
    <Edit className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)}>
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
```

### Prioridad: **MEDIA**

---

## 11. Nomenclatura de Archivos Exportados

### Problema
Los archivos descargados no tienen nombres descriptivos.

### Estado Actual
```
flash-report-abc123.pdf
```

### Formato Deseado
```
Reporte Flash Incidente Laboral 17-11-2025 SAE QM.pdf
```

### Solución Backend

```go
// internal/controllers/export_controller.go

func (c *ExportController) generateFilename(report interface{}, format string) string {
    switch r := report.(type) {
    case *domain.FlashReport:
        // Formato: "Reporte Flash {Tipo} {Fecha} {Empresa} {Zona}.{ext}"
        fecha := r.Fecha.Format("02-01-2006")
        tipo := getTipoLabel(r.Tipo)
        empresa := sanitizeFilename(r.Empresa)
        zona := sanitizeFilename(r.Zonal)

        return fmt.Sprintf("Reporte Flash %s %s %s %s.%s",
            tipo, fecha, empresa, zona, format)

    case *domain.ImmediateActionsReport:
        return fmt.Sprintf("Acciones Inmediatas %s.%s", ...)

    // ... otros tipos
    }
}

func sanitizeFilename(s string) string {
    // Eliminar caracteres inválidos para nombres de archivo
    reg := regexp.MustCompile(`[<>:"/\\|?*]`)
    return reg.ReplaceAllString(s, "")
}
```

### Headers de Respuesta
```go
filename := c.generateFilename(report, "pdf")
ctx.Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
```

### Prioridad: **MEDIA**

---

## 12. Botón Copy-Paste en Acciones Inmediatas

### Problema
Se necesita un botón para copiar información del período del reporte hacia las tareas de acciones.

### Ubicación del Código
- `src/app/(app)/reports/immediate-actions/create/page.tsx`

### Solución Propuesta

```tsx
// Agregar botón "Copiar fechas a todas las tareas"
<Card>
  <CardHeader>
    <div className="flex justify-between items-center">
      <div>
        <CardTitle>Período del Reporte</CardTitle>
        <CardDescription>Fechas de inicio y término del seguimiento</CardDescription>
      </div>

      {/* Nuevo botón de copy-paste */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copyDatesToAllTasks}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copiar fechas a todas las tareas
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Fecha de Inicio</Label>
        <Input type="date" {...register('fecha_inicio')} />
      </div>
      <div>
        <Label>Fecha de Término</Label>
        <Input type="date" {...register('fecha_termino')} />
      </div>
    </div>
  </CardContent>
</Card>

// Función para copiar
const copyDatesToAllTasks = () => {
  const fechaInicio = watch('fecha_inicio')
  const fechaTermino = watch('fecha_termino')
  const responsable = watch('responsable') // Si existe campo global

  const currentItems = items || []
  const updatedItems = currentItems.map(item => ({
    ...item,
    inicio: fechaInicio || item.inicio,
    fin: fechaTermino || item.fin,
    responsable: responsable || item.responsable,
  }))

  setValue('items', updatedItems)
  toast.success('Fechas copiadas a todas las tareas')
}
```

### Prioridad: **MEDIA**

---

## 13. Error al Crear Reporte de Acciones Inmediatas

### Problema
Al hacer clic en "Crear Reporte" en acciones inmediatas, no sucede nada.

### Posibles Causas

1. **Error de validación silencioso**
2. **Error de API no manejado**
3. **Estado de loading no actualizado**

### Diagnóstico

```tsx
// Agregar logging para debug
const onSubmit = async (data: ImmediateActionsFormData) => {
  console.log('Form data:', data) // Debug
  console.log('Form errors:', errors) // Debug

  try {
    setIsSubmitting(true)

    // Validar items
    if (!data.items || data.items.length === 0) {
      toast.error('Debe haber al menos una acción')
      return
    }

    console.log('Sending to API...') // Debug
    const result = await createReport(data)
    console.log('API result:', result) // Debug

    toast.success('Reporte creado exitosamente')
    router.push('/reports/immediate-actions')
  } catch (error: any) {
    console.error('Error creating report:', error) // Debug
    toast.error(error.message || 'Error al crear el reporte')
  } finally {
    setIsSubmitting(false)
  }
}
```

### Solución - Verificar Hook de Mutación

```tsx
// Verificar que el hook está correctamente configurado
const { trigger: createReport, isMutating, error } = useCreateImmediateActionsReport()

// Agregar efecto para mostrar errores
useEffect(() => {
  if (error) {
    console.error('Mutation error:', error)
    toast.error('Error en la mutación: ' + error.message)
  }
}, [error])
```

### Prioridad: **CRÍTICA**

---

## Resumen de Prioridades

| # | Mejora | Prioridad | Esfuerzo |
|---|--------|-----------|----------|
| 5 | Reestructuración de Sucesos | CRÍTICA | Alto |
| 13 | Error al Crear Acciones Inmediatas | CRÍTICA | Bajo |
| 7 | Página de Edición de Incidentes | ALTA | Medio |
| 4 | Eliminar Botones Sin Funcionalidad | ALTA | Bajo |
| 8 | Clarificar Suceso vs Flash Report | ALTA | Medio |
| 9 | Auto-relleno de Campos | ALTA | Medio |
| 3 | Indicadores y Métricas | ALTA | Alto |
| 1 | Duplicidad de Registros | ALTA | Medio |
| 2 | Validación de RUT | MEDIA | Bajo |
| 6 | Eliminar Etiquetas | MEDIA | Bajo |
| 10 | Descarga Directa | MEDIA | Bajo |
| 11 | Nomenclatura de Archivos | MEDIA | Bajo |
| 12 | Botón Copy-Paste | MEDIA | Bajo |

---

## Orden de Implementación Sugerido

### Fase 1 - Correcciones Críticas (1-2 días)
1. Corregir error al crear acciones inmediatas
2. Eliminar botones sin funcionalidad del header
3. Crear página de edición de incidentes

### Fase 2 - Reestructuración Core (3-5 días)
4. Implementar nueva taxonomía de Sucesos
5. Unificar/clarificar creación de Suceso y Flash Report
6. Implementar auto-relleno de campos

### Fase 3 - Mejoras de UX (2-3 días)
7. Agregar descarga directa en listas
8. Mejorar nomenclatura de archivos
9. Agregar botón copy-paste
10. Eliminar funcionalidad de etiquetas

### Fase 4 - Indicadores y Métricas (5-7 días)
11. Implementar nuevos endpoints de métricas
12. Crear componentes de dashboard
13. Implementar validación de duplicados y RUT

---

**Documento generado automáticamente**
**Próxima revisión sugerida:** Después de Fase 1
