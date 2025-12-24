# Análisis: Campo "Personas Involucradas" en Creación de Sucesos

## Resumen Ejecutivo

Este documento analiza los cambios necesarios en **frontend** y **backend** para agregar el campo "Personas Involucradas" en la creación de sucesos, con propagación automática hacia:
1. Flash Report (creación automática)
2. Final Report - Modo Express (extracción automática)

---

## 1. Estado Actual del Sistema

### 1.1 Tipos Existentes

#### PersonaInvolucrada (YA EXISTE)
```typescript
// src/shared/types/api.ts - Líneas 1053-1061
export interface PersonaInvolucrada {
  nombre: string
  cargo?: string
  empresa?: string
  tipo_lesion?: string
  gravedad?: string
  parte_cuerpo?: string
  descripcion?: string
}
```

#### Incident (FALTA el campo)
```typescript
// src/shared/types/api.ts - Líneas 203-230
export interface Incident {
  id: string
  tenant_id: string
  title: string
  description?: string
  severity: IncidentSeverity
  status: IncidentStatus
  type: IncidentType
  location?: string
  // ... otros campos
  // ❌ NO TIENE: personas_involucradas
}
```

#### CreateIncidentData (FALTA el campo)
```typescript
// src/shared/types/api.ts - Líneas 262-277
export interface CreateIncidentData {
  title: string
  description?: string
  severity: IncidentSeverity
  type: IncidentType
  location?: string
  // ... otros campos
  // ❌ NO TIENE: personas_involucradas
}
```

#### FlashReport (FALTA el campo)
```typescript
// src/shared/types/api.ts - Líneas 685-750
export interface FlashReport {
  id: string
  incident_id: string
  suceso: string
  tipo?: string
  // ... otros campos
  // ❌ NO TIENE: personas_involucradas
}
```

#### PrefillData (YA TIENE el campo)
```typescript
// src/shared/types/api.ts - Líneas 1293-1401
export interface PrefillData {
  // ... otros campos
  personas_involucradas?: PersonaInvolucrada[]  // ✅ YA EXISTE
}
```

---

## 2. Flujo de Datos Propuesto

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CREACIÓN DE SUCESO                               │
│  src/app/(app)/incidents/create/page.tsx                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Formulario con nuevo campo:                                 │   │
│  │  - personas_involucradas: [                                  │   │
│  │      { nombre, cargo, empresa, tipo_lesion, gravedad, ... } │   │
│  │    ]                                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API: POST /incidents                             │
│  Backend recibe y guarda personas_involucradas                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 CREACIÓN AUTOMÁTICA FLASH REPORT                    │
│  Se ejecuta inmediatamente después de crear el suceso              │
│                                                                     │
│  flashReportData = {                                               │
│    incident_id: newIncident.id,                                    │
│    suceso: data.title,                                             │
│    personas_involucradas: data.personas_involucradas  ← NUEVO      │
│    // ... otros campos                                              │
│  }                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API: POST /flash-reports                         │
│  Backend guarda Flash Report con personas_involucradas             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              FINAL REPORT - MODO EXPRESS                            │
│  src/app/(app)/reports/final/create/page.tsx                       │
│                                                                     │
│  useExpressMode(incident_id)                                       │
│       ↓                                                             │
│  GET /incidents/{id}/prefill?type=final-report                     │
│       ↓                                                             │
│  prefillData.personas_involucradas ← Del Flash Report              │
│       ↓                                                             │
│  consolidarPersonas() combina de múltiples fuentes                 │
│       ↓                                                             │
│  Muestra personas en DataPreviewCard                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cambios Requeridos - FRONTEND

### 3.1 Tipos TypeScript

**Archivo:** `src/shared/types/api.ts`

```typescript
// AGREGAR a Incident (línea ~230)
export interface Incident {
  // ... campos existentes ...
  personas_involucradas?: PersonaInvolucrada[]  // NUEVO
}

// AGREGAR a CreateIncidentData (línea ~277)
export interface CreateIncidentData {
  // ... campos existentes ...
  personas_involucradas?: PersonaInvolucrada[]  // NUEVO
}

// AGREGAR a FlashReport (línea ~750)
export interface FlashReport {
  // ... campos existentes ...
  personas_involucradas?: PersonaInvolucrada[]  // NUEVO
}

// AGREGAR a CreateFlashReportData (línea ~780)
export interface CreateFlashReportData {
  // ... campos existentes ...
  personas_involucradas?: PersonaInvolucrada[]  // NUEVO
}
```

### 3.2 Schema de Validación

**Archivo:** `src/lib/validations/incident-schemas.ts` (CREAR o modificar existente)

```typescript
import { z } from 'zod'

export const personaInvolucradaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  cargo: z.string().optional(),
  empresa: z.string().optional(),
  tipo_lesion: z.string().optional(),
  gravedad: z.string().optional(),
  parte_cuerpo: z.string().optional(),
  descripcion: z.string().optional(),
})

export const incidentWithPersonasSchema = z.object({
  // ... campos existentes del incidente ...
  personas_involucradas: z.array(personaInvolucradaSchema).optional().default([]),
})
```

### 3.3 Página de Creación de Suceso

**Archivo:** `src/app/(app)/incidents/create/page.tsx`

**Cambios necesarios:**

1. **Importar useFieldArray:**
```typescript
import { useForm, useFieldArray } from 'react-hook-form'
```

2. **Agregar al schema del formulario:**
```typescript
const formSchema = z.object({
  // ... campos existentes ...
  personas_involucradas: z.array(
    z.object({
      nombre: z.string().min(1, 'Nombre requerido'),
      cargo: z.string().optional(),
      empresa: z.string().optional(),
      tipo_lesion: z.string().optional(),
    })
  ).optional().default([]),
})
```

3. **Configurar useFieldArray:**
```typescript
const { fields: personas, append: appendPersona, remove: removePersona } =
  useFieldArray({ control, name: 'personas_involucradas' })
```

4. **Agregar Card de Personas Involucradas:**
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Personas Involucradas
      </CardTitle>
      <CardDescription>
        Registre las personas afectadas o involucradas en el suceso
      </CardDescription>
    </div>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => appendPersona({ nombre: '', cargo: '', empresa: '', tipo_lesion: '' })}
    >
      <Plus className="h-4 w-4 mr-2" />
      Agregar Persona
    </Button>
  </CardHeader>
  <CardContent className="space-y-4">
    {personas.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay personas registradas. Haga clic en "Agregar Persona" para comenzar.
      </p>
    ) : (
      personas.map((field, index) => (
        <Card key={field.id} className="p-4">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium">Persona {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePersona(index)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                {...register(`personas_involucradas.${index}.nombre`)}
                placeholder="Nombre completo"
              />
              {errors.personas_involucradas?.[index]?.nombre && (
                <p className="text-sm text-red-500">
                  {errors.personas_involucradas[index].nombre.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                {...register(`personas_involucradas.${index}.cargo`)}
                placeholder="Cargo o posición"
              />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input
                {...register(`personas_involucradas.${index}.empresa`)}
                placeholder="Empresa o contratista"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Lesión</Label>
              <Input
                {...register(`personas_involucradas.${index}.tipo_lesion`)}
                placeholder="Ej: Contusión, fractura, etc."
              />
            </div>
          </div>
        </Card>
      ))
    )}
  </CardContent>
</Card>
```

5. **Modificar la creación del Flash Report:**
```typescript
// Después de crear el incidente, pasar personas al Flash Report
const flashReportData: CreateFlashReportData = {
  incident_id: newIncident.id,
  suceso: data.title,
  // ... otros campos existentes ...
  personas_involucradas: data.personas_involucradas,  // NUEVO
}
await createFlashReport(flashReportData)
```

### 3.4 Página de Creación de Flash Report

**Archivo:** `src/app/(app)/reports/flash/create/page.tsx`

Agregar sección similar para personas_involucradas (si no existe ya).

### 3.5 Hook useExpressMode

**Archivo:** `src/shared/hooks/useExpressMode.ts`

**Estado actual:** Ya extrae `personas_involucradas` de `prefillData` y las consolida.

**Verificar que:**
- La consolidación incluye personas del Flash Report
- El mapping es correcto

```typescript
// Líneas ~172-199 (verificar que incluye Flash Report personas)
const flashPersonas = prefillData.personas_involucradas || []
// ... resto de consolidación
```

---

## 4. Cambios Requeridos - BACKEND

> **IMPORTANTE:** Usar nombres de campos en inglés para el backend: `involved_persons`

### 4.1 Modelo de Datos

**Base de datos - Tabla `incidents`:**
```sql
-- Add JSONB column for involved_persons
ALTER TABLE incidents
ADD COLUMN involved_persons JSONB DEFAULT '[]';
```

**Base de datos - Tabla `flash_reports`:**
```sql
-- Add JSONB column for involved_persons
ALTER TABLE flash_reports
ADD COLUMN involved_persons JSONB DEFAULT '[]';
```

### 4.2 DTOs / Schemas

**InvolvedPersonDTO:**
```python
class InvolvedPersonDTO(BaseModel):
    name: str  # nombre
    position: Optional[str] = None  # cargo
    company: Optional[str] = None  # empresa
    injury_type: Optional[str] = None  # tipo_lesion
    severity: Optional[str] = None  # gravedad
    body_part: Optional[str] = None  # parte_cuerpo
    description: Optional[str] = None  # descripcion
```

**CreateIncidentDTO:**
```python
class CreateIncidentDTO(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str
    type: str
    location: Optional[str] = None
    # ... other fields ...
    involved_persons: Optional[List[InvolvedPersonDTO]] = []
```

**CreateFlashReportDTO:**
```python
class CreateFlashReportDTO(BaseModel):
    incident_id: str
    suceso: str
    # ... other fields ...
    involved_persons: Optional[List[InvolvedPersonDTO]] = []
```

### 4.3 API Endpoints

**POST /incidents**
- Accept `involved_persons` in request body
- Store in database as JSONB

**POST /flash-reports**
- Accept `involved_persons` in request body
- Store in database as JSONB

**GET /incidents/{id}/prefill?type=final-report**
- Include `personas_involucradas` (Spanish key for frontend) in response
- Map from `involved_persons` in database
- Extract from Flash Report associated with incident
- Frontend already consolidates from multiple sources

### 4.4 Field Mapping (Backend ↔ Frontend)

| Backend (English) | Frontend (Spanish) | Description |
|-------------------|-------------------|-------------|
| `involved_persons` | `personas_involucradas` | Array of involved persons |
| `name` | `nombre` | Person's name |
| `position` | `cargo` | Job position |
| `company` | `empresa` | Company name |
| `injury_type` | `tipo_lesion` | Type of injury |
| `severity` | `gravedad` | Injury severity |
| `body_part` | `parte_cuerpo` | Affected body part |
| `description` | `descripcion` | Additional description |

### 4.5 Prefill Service

```python
def get_prefill_data(incident_id: str, report_type: str) -> PrefillData:
    incident = get_incident(incident_id)
    flash_report = get_flash_report_by_incident(incident_id)

    # Map backend field to frontend field name
    personas = []
    if flash_report and flash_report.involved_persons:
        personas = [
            {
                "nombre": p.get("name", ""),
                "cargo": p.get("position"),
                "empresa": p.get("company"),
                "tipo_lesion": p.get("injury_type"),
            }
            for p in flash_report.involved_persons
        ]

    prefill_data = PrefillData(
        # ... other fields ...
        personas_involucradas=personas,
    )

    return prefill_data
```

---

## 5. Resumen de Archivos a Modificar

### Frontend

| Archivo | Cambio |
|---------|--------|
| `src/shared/types/api.ts` | Agregar `personas_involucradas` a interfaces Incident, CreateIncidentData, FlashReport, CreateFlashReportData |
| `src/app/(app)/incidents/create/page.tsx` | Agregar sección de personas con useFieldArray, pasar datos al Flash Report |
| `src/lib/validations/report-schemas.ts` | Agregar schema de validación para personas (si no existe) |
| `src/app/(app)/reports/flash/create/page.tsx` | Agregar sección de personas (opcional, para edición manual) |

### Backend

| Archivo/Componente | Cambio |
|-------------------|--------|
| Modelo Incident | Agregar campo `personas_involucradas` JSONB |
| Modelo FlashReport | Agregar campo `personas_involucradas` JSONB |
| DTO CreateIncident | Agregar campo `personas_involucradas` |
| DTO CreateFlashReport | Agregar campo `personas_involucradas` |
| Endpoint POST /incidents | Aceptar y guardar personas |
| Endpoint POST /flash-reports | Aceptar y guardar personas |
| Endpoint GET /prefill | Retornar personas del Flash Report |

---

## 6. Consideraciones Adicionales

### 6.1 Validación

- **Nombre obligatorio:** Al menos el nombre debe ser requerido
- **Validación condicional:** Para incidentes con lesiones, podría requerirse al menos una persona

### 6.2 UX/UI

- Mostrar sección colapsable si no hay personas
- Permitir agregar múltiples personas dinámicamente
- Botón de "Agregar Persona" prominente
- Confirmación antes de eliminar persona

### 6.3 Migración de Datos

- Los sucesos existentes tendrán `personas_involucradas: []`
- No requiere migración de datos históricos (campo opcional)

### 6.4 Componente Reutilizable

Considerar crear un componente `<PersonasInvolucradasField />` reutilizable:
- Usado en: Creación de Suceso, Flash Report, Final Report
- Props: control, name, errors
- Maneja useFieldArray internamente

---

## 7. Estado de Implementación

### Frontend (COMPLETADO)

| Tarea | Estado |
|-------|--------|
| Actualizar tipos en `api.ts` | ✅ Completado |
| Agregar schema de validación Zod | ✅ Completado |
| Implementar UI en creación de suceso | ✅ Completado |
| Conectar con creación automática de Flash Report | ✅ Completado |
| Auto-populate en Final Report Express Mode | ✅ Ya existía |

### Backend (COMPLETADO)

| Tarea | Estado |
|-------|--------|
| Crear migración `026_add_involved_persons_to_flash_reports` | ✅ Completado |
| Actualizar modelo FlashReport | ✅ Completado |
| Actualizar DTOs (Create, Update) | ✅ Completado |
| Actualizar repository (Create, GetByID, GetByIncidentID, Update, List) | ✅ Completado |
| Actualizar servicio FlashReport | ✅ Completado |
| Actualizar servicio Prefill | ✅ Completado |

---

## 8. Archivos Modificados

### Frontend
- `src/shared/types/api.ts` - Tipos actualizados
- `src/app/(app)/incidents/create/page.tsx` - UI de personas involucradas
- `src/app/(app)/reports/final/create/page.tsx` - Ya tenía lógica de auto-fill

### Backend
- `migrations/026_add_involved_persons_to_flash_reports.up.sql` - Nueva migración
- `migrations/026_add_involved_persons_to_flash_reports.down.sql` - Rollback
- `internal/core/incident/domain/flash_report.go` - Modelo y DTOs
- `internal/adapters/postgresql/flash_report_repository.go` - Queries SQL
- `internal/core/incident/services/flash_report_service.go` - Lógica de negocio
- `internal/core/incident/services/prefill_service.go` - Prefill para Final Report

---

## 9. Para Ejecutar la Migración

```bash
# Ejecutar migración
go run cmd/migrate/main.go up

# O manualmente en PostgreSQL
psql -U usuario -d sm_database -f migrations/026_add_involved_persons_to_flash_reports.up.sql
```

---

## 10. Notas Importantes

1. **La infraestructura de Express Mode YA ESTÁ LISTA** - Solo necesita recibir los datos
2. **PrefillData YA TIENE el campo** - El backend ahora lo popula correctamente
3. **useExpressMode YA CONSOLIDA personas** - La lógica de combinación existe
4. **El patrón useFieldArray ya se usa** - En Final Report para personas_involucradas
5. **Backend usa JSONB** - Almacenamiento flexible para el array de personas

---

*Documento generado el: 24 de Diciembre, 2024*
*Versión: 2.0 - Implementación Completada*
