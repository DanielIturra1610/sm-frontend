# Implementación Automática de Reporte Tolerancia Cero

## Resumen Ejecutivo

Este documento describe la implementación para crear automáticamente un **Reporte de Tolerancia Cero** cuando el usuario selecciona la categoría `tolerancia_0` al crear un suceso, **en lugar de** crear un Flash Report.

### Comportamiento Objetivo

| Categoría Seleccionada | Reporte Auto-creado |
|------------------------|---------------------|
| `accidente` | Flash Report |
| `incidente` | Flash Report |
| `tolerancia_0` | **Reporte Tolerancia Cero** |

---

## Análisis del Estado Actual

### Flujo Actual de Creación de Suceso

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO ACTUAL                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Usuario completa formulario de suceso                          │
│  (cualquier categoría: accidente, incidente, tolerancia_0)      │
│                              ↓                                   │
│                     Crear Incident                               │
│                              ↓                                   │
│                    Subir fotos (si hay)                          │
│                              ↓                                   │
│              Crear Flash Report (SIEMPRE)  ← PROBLEMA            │
│                              ↓                                   │
│                    Redirigir a detalle                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Código Actual del Frontend

**Archivo:** `src/app/(app)/incidents/create/page.tsx`

```typescript
const onSubmit = async (data: IncidentWithFlashFormValues) => {
  try {
    // 1. Crear suceso
    const newIncident = await createIncident(incidentData)

    // 2. Subir fotos
    if (pendingFiles.length > 0) {
      await uploadMultiple(newIncident.id, pendingFiles)
    }

    // 3. SIEMPRE crea Flash Report (sin importar categoría)
    await createFlashReport(flashReportData)  // ← AQUÍ ESTÁ EL PROBLEMA

    toast.success('Suceso y Flash Report creados exitosamente')
    router.push(`/incidents/${newIncident.id}`)
  } catch (error) {
    // ...
  }
}
```

---

## Flujo Propuesto

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO PROPUESTO                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Usuario completa formulario de suceso                          │
│                              ↓                                   │
│                     Crear Incident                               │
│                              ↓                                   │
│                    Subir fotos (si hay)                          │
│                              ↓                                   │
│            ┌─────── Evaluar Categoría ───────┐                  │
│            │                                  │                  │
│            ▼                                  ▼                  │
│  ┌─────────────────────┐          ┌─────────────────────┐       │
│  │ accidente/incidente │          │   tolerancia_0      │       │
│  │         ↓           │          │         ↓           │       │
│  │  Crear Flash Report │          │ Crear Reporte T0    │       │
│  └─────────────────────┘          └─────────────────────┘       │
│                              ↓                                   │
│                    Redirigir a detalle                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mapeo Simplificado de Campos

### Datos que se envían al crear Reporte Tolerancia Cero

```typescript
// Al crear suceso con categoria === 'tolerancia_0'

const zeroToleranceData = {
  incident_id: newIncident.id,

  // Campos que vienen del formulario de suceso
  suceso: data.title,
  tipo: data.tipoSuceso,  // 't0_accion_insegura' | 't0_condicion_insegura' | 't0_stop_work'
  lugar: data.location,
  fecha_hora: new Date(data.date_time).toISOString(),
  area_zona: data.area_zona,
  empresa: data.empresa,
  supervisor_cge: data.supervisor,
  descripcion: data.description,
  numero_prodity: data.numero_prodity,
  acciones_tomadas: data.acciones_inmediatas,
  personas_involucradas: data.personas_involucradas,

  // Severidad: mapear desde el campo severity del suceso
  severidad: data.severity,  // 'low' | 'medium' | 'high'

  // NO enviamos:
  // - numero_documento (auto-generado por backend)
  // - fotografias (se asocian al incident, no al reporte)
}
```

### Flujo Visual de Campos

```
┌─────────────────────────────────────────────────────────────────┐
│              FORMULARIO CREAR SUCESO                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Categoría: [Tolerancia 0 ▼]                                    │
│                                                                  │
│  Tipo: [● Acción insegura]                                      │
│        [○ Condición insegura]          ──→  tipo                │
│        [○ Paralización de faena]                                │
│                                                                  │
│  Severidad: [○ Baja  ● Media  ○ Alta]  ──→  severidad           │
│                                                                  │
│  Título: ___________________           ──→  suceso              │
│  Descripción: ______________           ──→  descripcion         │
│  Ubicación: ________________           ──→  lugar               │
│  Fecha/Hora: _______________           ──→  fecha_hora          │
│  Área/Zona: ________________           ──→  area_zona           │
│  Empresa: __________________           ──→  empresa             │
│  Supervisor: _______________           ──→  supervisor_cge      │
│  Acciones Inmediatas: ______           ──→  acciones_tomadas    │
│  Personas Involucradas: ____           ──→  personas_involucradas│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  numero_documento: NO SE MUESTRA                           │ │
│  │  (Se genera automáticamente en el backend: ZT-2024-0001)   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Severidad - Valores

| Valor | Label en UI | Descripción |
|-------|-------------|-------------|
| `low` | Baja | Infracción menor |
| `medium` | Media | Infracción moderada |
| `high` | Alta | Infracción grave |

---

## Comparación: Flash Report vs Tolerancia Cero

### Campos en Común

| Campo | Flash Report | Tolerancia Cero | Mapeo |
|-------|-------------|-----------------|-------|
| `incident_id` | Requerido | Opcional | Directo |
| `suceso` | ✓ | ✓ | `title` → `suceso` |
| `tipo` | ✓ | ✓ | `tipoSuceso` → `tipo` |
| `lugar` | ✓ | ✓ | `location` → `lugar` |
| `fecha` / `fecha_hora` | Separados | Combinado | Combinar |
| `area_zona` | ✓ | ✓ | Directo |
| `empresa` | ✓ | ✓ | Directo |
| `supervisor` / `supervisor_cge` | ✓ | ✓ | Renombrar |
| `descripcion` | ✓ | ✓ | Directo |
| `numero_prodity` | ✓ | ✓ | Directo |
| `personas_involucradas` | ✓ | ✓ | Adaptar tipo |

### Campos Exclusivos de Flash Report

| Campo | Descripción | Acción para T0 |
|-------|-------------|----------------|
| `hora` | Hora separada | No aplica |
| `zonal` | Zona/región | No aplica |
| `acciones_inmediatas` | Acciones tomadas | Mapear a `acciones_tomadas` |
| `controles_inmediatos` | Controles aplicados | No aplica directamente |
| `factores_riesgo` | Factores identificados | No aplica |
| `con_baja_il` | Con baja industrial | No aplica |
| `sin_baja_il` | Sin baja industrial | No aplica |
| `incidente_industrial` | Tipo industrial | No aplica |
| `incidente_laboral` | Tipo laboral | No aplica |
| `es_plgf` | Es PLGF | No aplica |
| `nivel_plgf` | Nivel PLGF | No aplica |
| `justificacion_plgf` | Justificación PLGF | No aplica |

### Campos Exclusivos de Tolerancia Cero

| Campo | Descripción | Origen de Datos | Visible en UI |
|-------|-------------|-----------------|---------------|
| `numero_documento` | ID secuencial | **Auto-generado backend** | NO - Solo lectura en detalle |
| `severidad` | Nivel de severidad | Campo `severity` del formulario | SÍ |
| `acciones_tomadas` | Acciones ejecutadas | `acciones_inmediatas` | SÍ (campo existente) |

> **Nota:** El `numero_documento` se genera automáticamente en el backend al crear el reporte. El usuario NO lo ve ni lo ingresa en el formulario de creación.

---

## Implementación Detallada

### FASE 1: Frontend - Modificar Creación de Suceso

#### 1.1 Actualizar Schema de Validación

**Archivo:** `src/app/(app)/incidents/create/page.tsx`

```typescript
// Agregar campos específicos de Tolerancia Cero al schema
const incidentWithReportSchema = z.object({
  // === CAMPOS BASE DEL SUCESO ===
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  severity: z.enum(['low', 'medium', 'high']),  // Solo 3 niveles: Baja, Media, Alta
  categoria: z.enum(['accidente', 'incidente', 'tolerancia_0']),
  tipoSuceso: z.string().min(1),
  location: z.string().min(3),
  date_time: z.string().min(1),
  area_zona: z.string().optional(),
  empresa: z.string().optional(),
  supervisor: z.string().optional(),

  // === PERSONAS INVOLUCRADAS ===
  personas_involucradas: z.array(personaInvolucradaSchema).optional().default([]),

  // === CAMPOS FLASH REPORT ===
  zonal: z.string().optional(),
  numero_prodity: z.string().optional(),
  acciones_inmediatas: z.string().optional(),
  controles_inmediatos: z.string().optional(),
  factores_riesgo: z.string().optional(),
  con_baja_il: z.boolean().optional(),
  sin_baja_il: z.boolean().optional(),
  incidente_industrial: z.boolean().optional(),
  incidente_laboral: z.boolean().optional(),
  es_plgf: z.boolean().optional(),
  nivel_plgf: z.enum(['potencial', 'real', 'fatal']).optional(),
  justificacion_plgf: z.string().optional(),

  // === CAMPOS TOLERANCIA CERO (nuevos) ===
  // severidad ya existe arriba, se reutiliza
  // acciones_tomadas se mapea desde acciones_inmediatas
})
```

#### 1.2 Importar Hook de Tolerancia Cero

```typescript
import {
  useCreateFlashReport,
  useCreateZeroToleranceReport,  // AGREGAR
} from '@/shared/hooks/report-hooks'

// En el componente
const { trigger: createFlashReport } = useCreateFlashReport()
const { trigger: createZeroToleranceReport } = useCreateZeroToleranceReport()  // AGREGAR
```

#### 1.3 Modificar Función onSubmit

```typescript
const onSubmit = async (data: IncidentWithReportFormValues) => {
  try {
    setIsSubmitting(true)

    // 1. Preparar datos del suceso
    const typeMap: Record<string, 'accident' | 'incident' | 'zero_tolerance'> = {
      accidente: 'accident',
      incidente: 'incident',
      tolerancia_0: 'zero_tolerance',
    }

    const incidentData = {
      title: data.title,
      description: data.description,
      severity: data.severity,
      type: typeMap[data.categoria] || 'incident',
      location: data.location,
      date_time: new Date(data.date_time).toISOString(),
      categoria: data.categoria,
      tipoSuceso: data.tipoSuceso,
      area_zona: data.area_zona,
      empresa: data.empresa,
      supervisor: data.supervisor,
      personas_involucradas: data.personas_involucradas,
    }

    // 2. Crear suceso
    const newIncident = await createIncident(incidentData)

    // 3. Subir fotos si hay
    let uploadedPhotos: string[] = []
    if (pendingFiles.length > 0) {
      try {
        const results = await uploadMultiple(newIncident.id, pendingFiles)
        uploadedPhotos = results.map(r => r.url)
      } catch {
        console.error('Error al subir fotos')
      }
    }

    // 4. DECISIÓN: Crear reporte según categoría
    const isToleranciaZero = data.categoria === 'tolerancia_0'

    if (isToleranciaZero) {
      // ══════════════════════════════════════════════════════════════
      // CREAR REPORTE DE TOLERANCIA CERO
      // ══════════════════════════════════════════════════════════════
      const zeroToleranceData: CreateZeroToleranceReportData = {
        incident_id: newIncident.id,
        suceso: data.title,
        tipo: getSucesoTypeLabel(data.tipoSuceso),
        lugar: data.location,
        fecha_hora: new Date(data.date_time).toISOString(),
        area_zona: data.area_zona,
        empresa: data.empresa,
        supervisor_cge: data.supervisor,
        descripcion: data.description,
        numero_prodity: data.numero_prodity,
        acciones_tomadas: data.acciones_inmediatas,  // Mapear campo
        severidad: mapSeverityToZT(data.severity),   // Mapear severidad
        personas_involucradas: data.personas_involucradas?.map(p => ({
          nombre: p.nombre,
          cargo: p.cargo,
          empresa: p.empresa,
        })),
        // Las fotos se asocian al incident, no al reporte directamente
      }

      await createZeroToleranceReport(zeroToleranceData)

      toast.success(
        `Suceso y Reporte Tolerancia Cero creados exitosamente${
          pendingFiles.length > 0 ? ` con ${pendingFiles.length} foto(s)` : ''
        }`
      )
    } else {
      // ══════════════════════════════════════════════════════════════
      // CREAR FLASH REPORT (comportamiento existente)
      // ══════════════════════════════════════════════════════════════
      const dateTime = new Date(data.date_time)
      const fecha = dateTime.toISOString().split('T')[0]
      const hora = dateTime.toTimeString().slice(0, 5)

      const flashReportData: CreateFlashReportData = {
        incident_id: newIncident.id,
        suceso: data.title,
        tipo: getSucesoTypeLabel(data.tipoSuceso),
        fecha,
        hora,
        lugar: data.location,
        area_zona: data.area_zona,
        empresa: data.empresa,
        supervisor: data.supervisor,
        descripcion: data.description,
        zonal: data.zonal,
        numero_prodity: data.numero_prodity,
        acciones_inmediatas: data.acciones_inmediatas,
        controles_inmediatos: data.controles_inmediatos,
        factores_riesgo: data.factores_riesgo,
        con_baja_il: data.con_baja_il,
        sin_baja_il: data.sin_baja_il,
        incidente_industrial: data.incidente_industrial,
        incidente_laboral: data.incidente_laboral,
        es_plgf: data.es_plgf,
        nivel_plgf: data.nivel_plgf,
        justificacion_plgf: data.justificacion_plgf,
        personas_involucradas: data.personas_involucradas,
      }

      await createFlashReport(flashReportData)

      toast.success(
        `Suceso y Flash Report creados exitosamente${
          pendingFiles.length > 0 ? ` con ${pendingFiles.length} foto(s)` : ''
        }`
      )
    }

    router.push(`/incidents/${newIncident.id}`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    toast.error(`Error al crear: ${errorMessage}`)
    setIsSubmitting(false)
  }
}

// Función auxiliar para mapear severidad (solo 3 niveles)
function mapSeverityToZT(severity: string): 'low' | 'medium' | 'high' {
  const map: Record<string, 'low' | 'medium' | 'high'> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
  }
  return map[severity] || 'medium'
}
```

#### 1.4 Ocultar/Mostrar Campos según Categoría

```typescript
// En el componente, observar la categoría seleccionada
const selectedCategoria = watch('categoria')
const isToleranciaZero = selectedCategoria === 'tolerancia_0'

// En el JSX, ocultar campos no aplicables para Tolerancia Cero
{!isToleranciaZero && (
  <>
    {/* Campos exclusivos de Flash Report */}
    <FormField
      control={control}
      name="zonal"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Zonal</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
        </FormItem>
      )}
    />

    {/* PLGF Section */}
    <div className="space-y-4">
      <FormField
        control={control}
        name="es_plgf"
        render={({ field }) => (
          // ... checkbox PLGF
        )}
      />
    </div>

    {/* Checkboxes de tipo */}
    <div className="grid grid-cols-2 gap-4">
      {/* con_baja_il, sin_baja_il, etc. */}
    </div>
  </>
)}

{isToleranciaZero && (
  <>
    {/* Campos específicos de Tolerancia Cero */}
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-sm text-red-800 font-medium flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Este suceso generará un Reporte de Tolerancia Cero automáticamente
      </p>
    </div>

    {/* Selector de severidad - Solo 3 niveles */}
    <FormField
      control={control}
      name="severity"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-red-700">Severidad de la Infracción *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="border-red-200">
              <SelectValue placeholder="Seleccionar severidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  </>
)}
```

---

### FASE 2: Backend - Generación de Número de Documento

#### 2.1 Implementar Generador Secuencial

**Archivo:** `internal/adapters/postgresql/zero_tolerance_repository.go`

```go
// GenerateNumeroDocumento genera un número de documento secuencial por tenant
func (r *PostgreSQLZeroToleranceRepository) GenerateNumeroDocumento(
    ctx context.Context,
    tenantID string,
) (string, error) {
    var number int

    err := r.WithTenantTransaction(ctx, tenantID, func(tx pgx.Tx) error {
        // Secuencia específica para documentos de Tolerancia Cero
        sequenceName := fmt.Sprintf(
            "tenant_%s_zero_tolerance_doc_seq",
            strings.ReplaceAll(tenantID, "-", "_"),
        )

        // Crear secuencia si no existe
        createSeqQuery := fmt.Sprintf(
            "CREATE SEQUENCE IF NOT EXISTS %s START 1",
            sequenceName,
        )
        if _, err := tx.Exec(ctx, createSeqQuery); err != nil {
            return fmt.Errorf("failed to create sequence: %w", err)
        }

        // Obtener siguiente valor
        query := fmt.Sprintf("SELECT nextval('%s')", sequenceName)
        return tx.QueryRow(ctx, query).Scan(&number)
    })

    if err != nil {
        return "", fmt.Errorf("failed to generate numero_documento: %w", err)
    }

    // Formato: ZT-2024-0001
    year := time.Now().Year()
    return fmt.Sprintf("ZT-%d-%04d", year, number), nil
}
```

#### 2.2 Actualizar Servicio de Creación

**Archivo:** `internal/core/incident/services/zero_tolerance_service.go`

```go
func (s *zeroToleranceService) Create(
    ctx context.Context,
    tenantID string,
    dto domain.CreateZeroToleranceReportDTO,
) (*domain.ZeroToleranceReport, error) {

    // Generar número de documento si no se proporciona
    numeroDocumento := dto.NumeroDocumento
    if numeroDocumento == "" {
        var err error
        numeroDocumento, err = s.repo.GenerateNumeroDocumento(ctx, tenantID)
        if err != nil {
            return nil, fmt.Errorf("failed to generate numero_documento: %w", err)
        }
    }

    report := &domain.ZeroToleranceReport{
        ID:               uuid.NewString(),
        TenantID:         tenantID,
        IncidentID:       dto.IncidentID,
        NumeroDocumento:  numeroDocumento,
        Suceso:           dto.Suceso,
        Tipo:             dto.Tipo,
        Lugar:            dto.Lugar,
        FechaHora:        dto.FechaHora,
        AreaZona:         dto.AreaZona,
        Empresa:          dto.Empresa,
        SupervisorCGE:    dto.SupervisorCGE,
        Descripcion:      dto.Descripcion,
        NumeroProdity:    dto.NumeroProdity,
        Severidad:        dto.Severidad,
        AccionesTomadas:  dto.AccionesTomadas,
        PersonasInvolucradas: dto.PersonasInvolucradas,
        ReportStatus:     domain.ReportStatusDraft,
        CreatedAt:        time.Now(),
        UpdatedAt:        time.Now(),
    }

    if err := s.repo.Create(ctx, tenantID, report); err != nil {
        return nil, err
    }

    return report, nil
}
```

---

### FASE 3: Actualizar Vista de Detalle del Suceso

#### 3.1 Mostrar Reporte Asociado Correcto

**Archivo:** `src/app/(app)/incidents/[id]/page.tsx`

```typescript
// Obtener ambos tipos de reportes
const { data: flashReports } = useFlashReportsByIncident(incidentId)
const { data: zeroToleranceReports } = useZeroToleranceReportsByIncident(incidentId)

// Determinar qué tipo de reporte mostrar
const isToleranciaZero = incident?.type === 'zero_tolerance'
const associatedReport = isToleranciaZero
  ? zeroToleranceReports?.[0]
  : flashReports?.[0]

// En el JSX
{isToleranciaZero ? (
  <Card className="border-red-200 bg-red-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-800">
        <AlertTriangle className="h-5 w-5" />
        Reporte Tolerancia Cero
      </CardTitle>
    </CardHeader>
    <CardContent>
      {zeroToleranceReports?.[0] ? (
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">N° Documento:</span>{' '}
            {zeroToleranceReports[0].numero_documento}
          </p>
          <p className="text-sm">
            <span className="font-medium">Severidad:</span>{' '}
            <Badge variant={getSeverityVariant(zeroToleranceReports[0].severidad)}>
              {zeroToleranceReports[0].severidad}
            </Badge>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/reports/zero-tolerance/${zeroToleranceReports[0].id}`)}
          >
            Ver Reporte Completo
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Reporte pendiente de creación</p>
      )}
    </CardContent>
  </Card>
) : (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-yellow-500" />
        Flash Report
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* Contenido existente del Flash Report */}
    </CardContent>
  </Card>
)}
```

---

### FASE 4: Hook para Reportes por Incident

#### 4.1 Agregar Hook de Tolerancia Cero por Incident

**Archivo:** `src/shared/hooks/report-hooks.ts`

```typescript
// Hook para obtener reportes de Tolerancia Cero por incident_id
export function useZeroToleranceReportsByIncident(
  incidentId: string | null,
  config?: SWRConfiguration
) {
  return useSWR<ZeroToleranceReport[]>(
    incidentId ? `/zero-tolerance?incident_id=${incidentId}` : null,
    incidentId
      ? () => api.zeroTolerance.listByIncident(incidentId)
      : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}
```

#### 4.2 Agregar Método en Servicio API

**Archivo:** `src/lib/api/services/report-service.ts`

```typescript
export class ZeroToleranceService extends BaseService {
  // ... métodos existentes ...

  async listByIncident(incidentId: string): Promise<ZeroToleranceReport[]> {
    const response = await this.request<ZeroToleranceReport[]>(
      `/zero-tolerance?incident_id=${incidentId}`
    )
    return response
  }
}
```

---

## Diagrama de Flujo Final

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    FORMULARIO CREAR SUCESO                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Campos Comunes:                                                     │ │
│  │  • Título, Descripción, Ubicación, Fecha/Hora                       │ │
│  │  • Área/Zona, Empresa, Supervisor                                   │ │
│  │  • Personas Involucradas                                            │ │
│  │  • Fotos                                                            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Selector de Categoría:                                             │ │
│  │  ○ Accidente  ○ Incidente  ● Tolerancia 0                          │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│         ┌─────────────────┬─────────────────────────────┐                │
│         │                 │                             │                │
│         ▼                 ▼                             ▼                │
│  ┌─────────────┐   ┌─────────────┐              ┌─────────────┐         │
│  │  Accidente  │   │  Incidente  │              │Tolerancia 0 │         │
│  ├─────────────┤   ├─────────────┤              ├─────────────┤         │
│  │ Mostrar:    │   │ Mostrar:    │              │ Mostrar:    │         │
│  │ • PLGF      │   │ • PLGF      │              │ • Severidad │         │
│  │ • Tipo IL   │   │ • Tipo IL   │              │ • Alerta T0 │         │
│  │ • Zonal     │   │ • Zonal     │              │             │         │
│  └─────────────┘   └─────────────┘              └─────────────┘         │
│         │                 │                             │                │
│         └────────┬────────┴─────────────────────────────┘                │
│                  ▼                                                        │
│         ┌───────────────┐                                                │
│         │    SUBMIT     │                                                │
│         └───────────────┘                                                │
│                  │                                                        │
└──────────────────┼───────────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         BACKEND                                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. Crear Incident                                                        │
│     └─→ Generar incident_number (correlativo)                            │
│                                                                           │
│  2. Subir fotos al incident                                               │
│                                                                           │
│  3. Evaluar categoría:                                                    │
│                                                                           │
│     categoria === 'tolerancia_0'                                         │
│         │                                                                 │
│         ├── SÍ ──→ Crear ZeroToleranceReport                             │
│         │          └─→ Generar numero_documento (ZT-2024-0001)           │
│         │                                                                 │
│         └── NO ──→ Crear FlashReport                                     │
│                                                                           │
│  4. Retornar respuesta exitosa                                            │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    RESULTADO                                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Para Tolerancia 0:                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ ✓ Suceso #00042 creado                                           │    │
│  │ ✓ Reporte Tolerancia Cero ZT-2024-0015 creado                    │    │
│  │ ✓ 3 fotos subidas                                                │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  Para Accidente/Incidente:                                                │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ ✓ Suceso #00042 creado                                           │    │
│  │ ✓ Flash Report creado                                            │    │
│  │ ✓ 3 fotos subidas                                                │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Archivos a Modificar

### Frontend

| Archivo | Cambios |
|---------|---------|
| `src/app/(app)/incidents/create/page.tsx` | Lógica condicional, ocultar/mostrar campos |
| `src/app/(app)/incidents/[id]/page.tsx` | Mostrar reporte asociado correcto |
| `src/shared/hooks/report-hooks.ts` | Agregar `useZeroToleranceReportsByIncident` |
| `src/lib/api/services/report-service.ts` | Agregar `listByIncident` a ZeroToleranceService |
| `src/shared/types/api.ts` | Verificar tipos existentes |

### Backend

| Archivo | Cambios |
|---------|---------|
| `internal/adapters/postgresql/zero_tolerance_repository.go` | Agregar `GenerateNumeroDocumento` |
| `internal/core/incident/services/zero_tolerance_service.go` | Llamar generador en `Create` |
| `internal/core/incident/ports/repositories.go` | Agregar interfaz del método |

---

## Consideraciones de Diseño

### 1. Transaccionalidad
- El suceso y el reporte deben crearse en una transacción lógica
- Si falla la creación del reporte, mostrar error pero mantener el suceso
- El usuario puede crear el reporte manualmente después

### 2. Validaciones
- Tolerancia Cero requiere al menos una persona involucrada (recomendado)
- La severidad debe ser obligatoria para T0

### 3. UX/UI
- Mostrar indicador visual cuando se selecciona Tolerancia 0
- Cambiar color del formulario a rojo suave
- Ocultar campos irrelevantes (PLGF, checkboxes IL)

### 4. Formato del Número de Documento
- Propuesta: `ZT-YYYY-NNNN` (ej: `ZT-2024-0001`)
- Alternativa: `T0-NNNN` (más simple)
- Secuencial por tenant y por año

### 5. Migraciones
- Crear secuencia para `numero_documento`
- Verificar constraint UNIQUE en `numero_documento`

---

## Prioridad de Implementación

| Orden | Tarea | Esfuerzo | Riesgo |
|-------|-------|----------|--------|
| 1 | Modificar `onSubmit` con condicional | Bajo | Bajo |
| 2 | Agregar hook `useCreateZeroToleranceReport` | Bajo | Bajo |
| 3 | Ocultar/mostrar campos en formulario | Medio | Bajo |
| 4 | Implementar `GenerateNumeroDocumento` en backend | Medio | Bajo |
| 5 | Actualizar vista de detalle del suceso | Medio | Medio |
| 6 | Agregar hook `useZeroToleranceReportsByIncident` | Bajo | Bajo |
| 7 | Testing end-to-end | Alto | N/A |

---

## Testing Requerido

### Casos de Prueba

1. **Crear suceso con categoría `accidente`**
   - Verificar que se crea Flash Report
   - Verificar que NO se crea Tolerancia Cero

2. **Crear suceso con categoría `incidente`**
   - Verificar que se crea Flash Report
   - Verificar que NO se crea Tolerancia Cero

3. **Crear suceso con categoría `tolerancia_0`**
   - Verificar que se crea Tolerancia Cero
   - Verificar que NO se crea Flash Report
   - Verificar que `numero_documento` se genera automáticamente

4. **Crear múltiples sucesos T0**
   - Verificar que los números de documento son secuenciales

5. **Vista de detalle**
   - Suceso accidente/incidente muestra Flash Report
   - Suceso tolerancia_0 muestra Reporte T0

---

## Conclusión

La implementación sigue el patrón existente del Flash Report, con las siguientes diferencias clave:

1. **Detección por categoría:** `data.categoria === 'tolerancia_0'`
2. **Creación condicional:** Flash Report OR Tolerancia Cero, nunca ambos
3. **Campos adaptados:**
   - `supervisor` → `supervisor_cge`
   - `acciones_inmediatas` → `acciones_tomadas`
   - `tipoSuceso` → `tipo` (t0_accion_insegura, t0_condicion_insegura, t0_stop_work)
4. **Número de documento:** Generación automática en backend (NO visible en formulario)
5. **Severidad:** Solo 3 niveles (Baja, Media, Alta)

### Resumen del Flujo

```
Usuario selecciona "Tolerancia 0"
        ↓
Formulario oculta campos de Flash (PLGF, checkboxes IL)
        ↓
Usuario completa campos comunes + severidad
        ↓
Submit → Crear Incident + Crear ZeroToleranceReport
        ↓
Backend genera numero_documento automáticamente
        ↓
Usuario ve el reporte con numero_documento asignado
```

La arquitectura actual facilita esta implementación ya que ambos servicios (Flash Report y Zero Tolerance) siguen la misma estructura y patrones.
