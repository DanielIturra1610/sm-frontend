# Implementación de Número Correlativo para Sucesos

## Resumen Ejecutivo

Este documento describe la implementación de un sistema de número correlativo para sucesos (incidentes) que permite identificar y buscar todos los reportes asociados a un suceso mediante un identificador único secuencial.

**Formato del correlativo:** `0001`, `0002`, `0003`, ...

**Ejemplo de visualización:** `0042 - Electrocución de técnico en subestación eléctrica`

---

## Estado Actual del Sistema

### Backend (Go) - YA IMPLEMENTADO PARCIALMENTE

#### 1. Campo `incident_number` en el modelo

**Archivo:** `internal/core/incident/domain/incident.go`

```go
type Incident struct {
    ID             string           `json:"id"`
    TenantID       string           `json:"tenant_id"`
    IncidentNumber string           `json:"incident_number"`  // ← CORRELATIVO
    Title          string           `json:"title"`
    // ... otros campos
}
```

#### 2. Generación automática secuencial

**Archivo:** `internal/adapters/postgresql/incident_repository.go`

```go
func (r *PostgreSQLIncidentRepository) GenerateIncidentNumber(ctx context.Context, tenantID string, incidentType domain.IncidentType) (string, error) {
    var number int

    err := r.WithTenantTransaction(ctx, tenantID, func(tx pgx.Tx) error {
        // Secuencia por tenant para aislamiento
        sequenceName := fmt.Sprintf("tenant_%s_incident_number_seq", strings.ReplaceAll(tenantID, "-", "_"))

        // Crear secuencia si no existe
        createSeqQuery := fmt.Sprintf("CREATE SEQUENCE IF NOT EXISTS %s START 1", sequenceName)
        if _, err := tx.Exec(ctx, createSeqQuery); err != nil {
            return fmt.Errorf("failed to create sequence: %w", err)
        }

        query := fmt.Sprintf("SELECT nextval('%s')", sequenceName)
        return tx.QueryRow(ctx, query).Scan(&number)
    })

    if err != nil {
        return "", fmt.Errorf("failed to generate incident number: %w", err)
    }

    return fmt.Sprintf("%05d", number), nil  // Formato: "00042"
}
```

#### 3. Uso en servicio de creación

**Archivo:** `internal/core/incident/services/incident.go`

```go
func (s *incidentService) CreateIncident(ctx context.Context, tenantID, userID string, dto domain.CreateIncidentDTO) (*domain.Incident, error) {
    // ... validaciones ...

    incidentNumber, err := s.repo.GenerateIncidentNumber(ctx, tenantID, incidentType)
    if err != nil {
        return nil, err
    }

    incident := &domain.Incident{
        ID:             uuid.NewString(),
        IncidentNumber: incidentNumber,  // ← Auto-generado
        // ...
    }
    // ...
}
```

#### 4. Migración de base de datos

**Archivo:** `db/migrations_tenant/0014_extend_incidents.sql`

```sql
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_number VARCHAR(100) UNIQUE;
```

### Frontend (React/Next.js) - PARCIALMENTE IMPLEMENTADO

#### Tipo definido pero no completamente utilizado

**Archivo:** `src/shared/types/api.ts`

```typescript
export interface Incident extends BaseEntity {
    // ... otros campos
    correlativo?: string  // ← Campo existe pero opcional
}

export interface IncidentListParams extends PaginationParams {
    correlativo?: string  // ← Soporte para búsqueda
}
```

---

## Gaps Identificados

### 1. Frontend no muestra el correlativo consistentemente
- La lista de sucesos no muestra el número correlativo de forma prominente
- El detalle de suceso no destaca el correlativo

### 2. Reportes no exponen el correlativo del suceso asociado
- Flash Report, Acciones Inmediatas, etc. solo tienen `incident_id`
- No hay forma fácil de ver "0042 - Título del suceso" en las listas de reportes

### 3. No existe página "Todos los Reportes"
- No hay vista unificada de todos los reportes
- No hay búsqueda cross-report por correlativo

### 4. Mapeo de campo incorrecto
- Backend envía `incident_number`
- Frontend espera `correlativo`
- Falta transformación en el service

---

## Plan de Implementación

### FASE 1: Correcciones Backend (Opcional - ya funciona)

El backend ya genera el `incident_number` correctamente. Solo necesitamos asegurar que:

1. **Los reportes incluyan información del suceso al listarlos**

**Archivo a modificar:** Cada servicio de reporte debe incluir datos del incident asociado.

```go
// En flash_report_service.go, al retornar reportes:
type FlashReportWithIncident struct {
    FlashReport
    IncidentNumber string `json:"incident_number"`
    IncidentTitle  string `json:"incident_title"`
}
```

**Alternativa más simple:** Crear un endpoint que devuelva todos los reportes con info del suceso.

### FASE 2: Frontend - Mapeo y Tipos

#### 2.1 Actualizar tipos

**Archivo:** `src/shared/types/api.ts`

```typescript
// Interfaz base para reportes con info de suceso
export interface ReportWithIncident {
  incident_id: string
  incident_number?: string  // Correlativo del suceso
  incident_title?: string   // Título del suceso
}

// Actualizar Incident para usar incident_number del backend
export interface Incident extends BaseEntity {
  incident_number?: string  // Campo del backend
  title: string
  // ... otros campos
}

// Tipo unificado para "Todos los Reportes"
export interface UnifiedReport {
  id: string
  type: 'flash' | 'immediate_actions' | 'action_plan' | 'root_cause' | 'final' | 'zero_tolerance'
  incident_id: string
  incident_number: string
  incident_title: string
  status: string
  created_at: string
  updated_at: string
}
```

#### 2.2 Actualizar transformación de Incident

**Archivo:** `src/lib/api/services/incident-service.ts`

```typescript
function transformIncident(apiIncident: ApiIncident): Incident {
  return {
    // ... campos existentes
    incident_number: apiIncident.incident_number,  // Mapear correctamente
  }
}
```

### FASE 3: Página "Todos los Reportes"

#### 3.1 Crear nuevo endpoint en backend (opcional pero recomendado)

**Nuevo archivo:** `internal/controllers/unified_reports.go`

```go
// GET /api/v1/reports/all?correlativo=0042&search=electrocucion
func (c *ReportsController) GetAllReports(ctx *gin.Context) {
    correlativo := ctx.Query("correlativo")
    search := ctx.Query("search")

    // Obtener todos los reportes de todas las tablas
    // JOIN con incidents para obtener incident_number y title
}
```

**Alternativa sin nuevo endpoint:** Hacer múltiples llamadas desde frontend y combinar.

#### 3.2 Modificar página en frontend

**Nuevo archivo:** `src/app/(app)/reports/all/page.tsx`

```typescript
'use client'

import { useState, useMemo } from 'react'
import { useFlashReports, useImmediateActionsReports, useActionPlanReports,
         useFinalReports, useRootCauseReports, useZeroToleranceReports } from '@/shared/hooks/report-hooks'
import { useIncidents } from '@/shared/hooks/incident-hooks'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Search, FileText, Zap, ClipboardList, Target, FileCheck, AlertTriangle } from 'lucide-react'

const REPORT_TYPES = {
  flash: { label: 'Flash Report', icon: Zap, color: 'bg-yellow-100 text-yellow-800' },
  immediate_actions: { label: 'Acciones Inmediatas', icon: ClipboardList, color: 'bg-blue-100 text-blue-800' },
  action_plan: { label: 'Plan de Acción', icon: Target, color: 'bg-purple-100 text-purple-800' },
  root_cause: { label: 'Análisis Causa Raíz', icon: Search, color: 'bg-orange-100 text-orange-800' },
  final: { label: 'Reporte Final', icon: FileCheck, color: 'bg-green-100 text-green-800' },
  zero_tolerance: { label: 'Tolerancia Cero', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
}

export default function AllReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Cargar datos
  const { data: incidents } = useIncidents()
  const { data: flashReports } = useFlashReports()
  const { data: immediateActions } = useImmediateActionsReports()
  const { data: actionPlans } = useActionPlanReports()
  const { data: finalReports } = useFinalReports()
  const { data: rootCause } = useRootCauseReports()
  const { data: zeroTolerance } = useZeroToleranceReports()

  // Crear mapa de incidents para lookup rápido
  const incidentMap = useMemo(() => {
    const map = new Map()
    incidents?.forEach(inc => map.set(inc.id, inc))
    return map
  }, [incidents])

  // Combinar todos los reportes
  const allReports = useMemo(() => {
    const reports = []

    flashReports?.forEach(r => reports.push({
      ...r, type: 'flash',
      incident: incidentMap.get(r.incident_id)
    }))

    immediateActions?.forEach(r => reports.push({
      ...r, type: 'immediate_actions',
      incident: incidentMap.get(r.incident_id)
    }))

    // ... repetir para otros tipos

    return reports.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [flashReports, immediateActions, actionPlans, finalReports, rootCause, zeroTolerance, incidentMap])

  // Filtrar por búsqueda
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return allReports

    const query = searchQuery.toLowerCase()
    return allReports.filter(report => {
      const incident = report.incident
      if (!incident) return false

      const correlativo = incident.incident_number || ''
      const titulo = incident.title || ''

      return correlativo.includes(query) || titulo.toLowerCase().includes(query)
    })
  }, [allReports, searchQuery])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Todos los Reportes</h1>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por correlativo (ej: 0042) o título del suceso..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de reportes */}
      <div className="space-y-3">
        {filteredReports.map(report => {
          const config = REPORT_TYPES[report.type]
          const Icon = config.icon
          const incident = report.incident

          return (
            <Card key={`${report.type}-${report.id}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono">
                        {incident?.incident_number || '----'}
                      </Badge>
                      <span className="text-sm text-gray-500">{config.label}</span>
                    </div>
                    <p className="font-medium truncate">
                      {incident?.title || 'Suceso sin título'}
                    </p>
                  </div>

                  <Badge>{report.report_status || report.status}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
```

### FASE 4: Actualizar Listas de Reportes Existentes

Modificar cada página de lista de reportes para mostrar el correlativo del suceso asociado.

**Ejemplo para Flash Reports:**

**Archivo:** `src/app/(app)/reports/flash/page.tsx`

```typescript
// En la tabla, agregar columna de correlativo
<TableHead>Correlativo</TableHead>

// En cada fila
<TableCell className="font-mono">
  {getIncidentNumber(report.incident_id)}
</TableCell>
```

### FASE 5: Actualizar Vista de Sucesos

#### 5.1 Lista de sucesos

**Archivo:** `src/app/(app)/incidents/page.tsx`

Mostrar el correlativo de forma prominente:

```typescript
<TableCell className="font-mono font-bold text-primary">
  {incident.incident_number || '----'}
</TableCell>
```

#### 5.2 Detalle de suceso

Agregar badge con correlativo en el header.

---

## Estructura de Archivos Propuesta

```
src/app/(app)/reports/
├── all/
│   └── page.tsx          # NUEVO: Todos los reportes
├── flash/
│   └── page.tsx          # MODIFICAR: agregar columna correlativo
├── immediate-actions/
│   └── page.tsx          # MODIFICAR: agregar columna correlativo
├── action-plan/
│   └── page.tsx          # MODIFICAR: agregar columna correlativo
├── final/
│   └── page.tsx          # MODIFICAR: agregar columna correlativo
├── root-cause/
│   └── page.tsx          # MODIFICAR: agregar columna correlativo
└── zero-tolerance/
    └── page.tsx          # MODIFICAR: agregar columna correlativo
```

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                         CREACIÓN                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Usuario crea suceso → Backend genera incident_number (0042)    │
│                              ↓                                   │
│                     Se guarda en incidents table                 │
│                              ↓                                   │
│            Frontend recibe y muestra: "0042 - Título"           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CREACIÓN DE REPORTES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Usuario crea Flash Report → Se asocia via incident_id          │
│  Usuario crea Acciones Inmediatas → Se asocia via incident_id   │
│  Usuario crea Plan de Acción → Se asocia via incident_id        │
│  ...etc                                                          │
│                                                                  │
│  Todos los reportes quedan vinculados al suceso 0042            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         BÚSQUEDA                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Usuario busca "0042" en "Todos los Reportes"                   │
│                              ↓                                   │
│  Sistema filtra todos los reportes donde:                       │
│    incident.incident_number LIKE '%0042%'                       │
│                              ↓                                   │
│  Resultado:                                                      │
│    - Flash Report (0042 - Electrocución...)                     │
│    - Acciones Inmediatas (0042 - Electrocución...)              │
│    - Plan de Acción (0042 - Electrocución...)                   │
│    - Reporte Final (0042 - Electrocución...)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prioridad de Implementación

| Prioridad | Tarea | Esfuerzo | Impacto |
|-----------|-------|----------|---------|
| 1 | Crear página "Todos los Reportes" | Alto | Alto |
| 2 | Mostrar correlativo en lista de sucesos | Bajo | Alto |
| 3 | Agregar columna correlativo en listas de reportes | Medio | Medio |
| 4 | Agregar enlace "Todos los Reportes" en navegación | Bajo | Alto |
| 5 | Optimizar con endpoint unificado en backend | Alto | Medio |

---

## Consideraciones Técnicas

### Performance
- La página "Todos los Reportes" carga múltiples endpoints
- Considerar paginación y lazy loading
- Cachear la lista de incidents para lookups

### Multi-tenant
- El correlativo ya es único por tenant
- La secuencia es `tenant_{tenant_id}_incident_number_seq`
- No hay colisiones entre tenants

### Formato del correlativo
- Actual: 5 dígitos zero-padded (`00042`)
- Fácil de cambiar en `GenerateIncidentNumber()`
- Considerar prefijo por año: `2024-0042`

---

## Conclusión

El sistema ya tiene la infraestructura base para el número correlativo. Las principales tareas pendientes son:

1. **Modificar la página "Todos los Reportes"** con buscador
2. **Exponer el correlativo** en todas las vistas de reportes
3. **Mejorar la UX** mostrando siempre el formato `0042 - Título del suceso`

La implementación es mayormente de frontend, ya que el backend ya genera y almacena correctamente el `incident_number`.
