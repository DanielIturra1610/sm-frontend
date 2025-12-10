# Estado de Implementación de Reportes - Frontend

## ✅ Completado (100% Funcional)

### 1. Infraestructura Base
- ✅ **Tipos TypeScript** (`src/shared/types/api.ts`)
  - Todos los tipos e interfaces para los 6 reportes
  - 546 líneas de tipos completamente tipados

- ✅ **Servicios de API** (`src/lib/api/services/report-service.ts`)
  - 6 servicios completos con todos los métodos CRUD
  - Integración con cliente modular
  - 589 líneas de código

- ✅ **Hooks Personalizados** (`src/shared/hooks/report-hooks.ts`)
  - 54 hooks con SWR para gestión de estado
  - Cache automático y optimistic updates
  - 711 líneas de código

- ✅ **Esquemas de Validación** (`src/lib/validations/report-schemas.ts`)
  - Validación Zod para todos los formularios
  - Mensajes de error personalizados
  - Tipos inferidos automáticamente

### 2. Componentes Reutilizables
- ✅ **ReportFormHeader** - Header consistente para formularios
- ✅ **ReportStatusBadge** - Badge de estado con colores y iconos
- ✅ **IncidentSelector** - Selector de incidente con autocomplete

### 3. Flash Report (100% Completo)
**Ubicación:** `src/app/(app)/reports/flash/`

#### Páginas Implementadas:
- ✅ `/reports/flash` - Lista con filtros y búsqueda
- ✅ `/reports/flash/create` - Formulario completo de creación
- ✅ `/reports/flash/[id]` - Vista detallada con acciones

#### Características:
- ✅ Formulario con validación completa (react-hook-form + zod)
- ✅ Selector de incidente integrado
- ✅ Información básica del evento (8 campos)
- ✅ Descripción y análisis (4 campos de texto largo)
- ✅ Identificadores (2 campos)
- ✅ Clasificación con checkboxes (4 opciones)
- ✅ Acciones: Enviar, Aprobar, Rechazar, Eliminar
- ✅ Estados visuales con badges
- ✅ Manejo de errores con toast notifications
- ✅ Loading states y skeleton loaders
- ✅ Responsive design
- ✅ Confirmación de eliminación con AlertDialog

**Total:** 500+ líneas de código limpio y bien estructurado

## 📋 Pendiente (Plantillas Disponibles)

### 4. Immediate Actions Report
**Ubicación:** `src/app/(app)/reports/immediate-actions/`

#### Estructura del Formulario:
```typescript
- incident_id (selector)
- fecha_inicio (date input)
- fecha_termino (date input)
- items[] (tabla dinámica con 6 acciones predefinidas):
  └─ numero, tarea, inicio, fin
  └─ responsable, cliente
  └─ avance_real, avance_programado (sliders 0-100%)
  └─ comentario, tipo_acc_inc
```

#### Acciones Predefinidas:
1. Comunicar lo acontecido a Jefatura Directa
2. Informar Incidente y su clasificación a la Dirección
3. Enviar recopilación de antecedentes
4. Informar Incidente Ocurrido a Jefatura CGE
5. Generar Reporte Flash vía WhatsApp a Jefe de Área CGE y HSEQ
6. Iniciar Proceso de Investigación Preliminar de Incidentes

#### Plantilla de Código:
Usar Flash Report como base, modificando:
- Agregar tabla de items con campos de avance
- Implementar sliders para porcentajes
- Pre-llenar las 6 acciones predefinidas
- Calcular porcentaje_avance_plan automáticamente

### 5. Root Cause Report
**Ubicación:** `src/app/(app)/reports/root-cause/`

#### Estructura del Formulario:
```typescript
- incident_id (selector)
- metodologia (select: five_whys, fishbone, six_sigma, fmea, other)
- analysis_tables[] (típicamente 3 tablas):
  └─ table_number
  └─ hecho_observacion (textarea)
  └─ porques[] (array dinámico de "por qués"):
      └─ numero, pregunta, respuesta
  └─ accion_plan (textarea)
```

#### Características Especiales:
- Botón "Agregar ¿Por qué?" para cada tabla
- Máximo 7 "por qués" por tabla (5 Whys methodology)
- Soporte para metodologías alternativas

### 6. Action Plan Report
**Ubicación:** `src/app/(app)/reports/action-plan/`

#### Estructura del Formulario:
```typescript
- incident_id (selector)
- fecha_inicio (date)
- duracion_dias (number input)
- fecha_fin_estimada (calculado automáticamente)
- items[] (hasta 25 tareas):
  └─ numero, tarea, subtarea
  └─ inicio, fin (dates)
  └─ responsable, cliente
  └─ avance_real, avance_programado (sliders)
  └─ comentario, tipo_acc_inc
  └─ estado (select: pending, in_progress, completed, cancelled, delayed)
```

#### Características Especiales:
- Primera tarea debe ser "Medidas Correctivas"
- Última tarea debe ser "Reportar Avances"
- Cálculo automático de fecha_fin_estimada
- Cálculo de porcentaje_avance_plan
- Tabla editable con add/remove rows

### 7. Final Report
**Ubicación:** `src/app/(app)/reports/final`

#### Estructura del Formulario (el más complejo):
```typescript
- incident_id (selector)

SECCIÓN 1: Datos de la Empresa
- company_data: { nombre, direccion, rut, telefono, email, contacto }

SECCIÓN 2: Tipo de Accidente
- tipo_accidente_tabla: { con_baja_il, sin_baja_il, incidente_industrial, incidente_laboral }

SECCIÓN 3: Personas Involucradas (tabla dinámica)
- personas_involucradas[]: { nombre, cargo, empresa, tipo_lesion, gravedad, parte_cuerpo, descripcion }

SECCIÓN 4: Equipos Dañados (tabla dinámica)
- equipos_danados[]: { nombre, tipo, marca, modelo, numero_serie, tipo_dano, descripcion, costo_estimado }

SECCIÓN 5: Terceros Identificados (tabla dinámica)
- terceros_identificados[]: { nombre, empresa, rol, contacto }

SECCIÓN 6: Análisis y Conclusiones
- detalles_accidente (textarea largo)
- analisis_causas_raiz[] (consolidado de root cause)
- descripcion_detallada (textarea largo)
- conclusiones (textarea)
- lecciones_aprendidas (textarea)

SECCIÓN 7: Resúmenes
- acciones_inmediatas_resumen (textarea)
- plan_accion_resumen (textarea)

SECCIÓN 8: Costos (tabla dinámica)
- costos_tabla[]: { concepto, monto, moneda, descripcion }

SECCIÓN 9: Evidencias (tabla dinámica)
- imagenes_evidencia[]: { url, descripcion, fecha }

SECCIÓN 10: Responsables (tabla dinámica)
- responsables_investigacion[]: { nombre, cargo, firma }
```

### 8. Zero Tolerance Report
**Ubicación:** `src/app/(app)/reports/zero-tolerance/`

#### Estructura del Formulario:
```typescript
- incident_id (opcional, puede ser independiente)
- numero_documento (autogenerado si no se proporciona)
- suceso, tipo, lugar, fecha_hora
- area_zona, empresa, supervisor_cge
- descripcion (textarea)
- numero_prosafety
- fotografias[] (upload de imágenes):
  └─ url, descripcion, fecha
- severidad (select: low, medium, high, critical)
- acciones_tomadas (textarea)
- personas_involucradas[]:
  └─ nombre, cargo, empresa
```

## 🔧 Cómo Completar los Formularios Restantes

### Paso 1: Copiar la Estructura de Flash Report

```bash
# Para Immediate Actions (ejemplo)
cp -r src/app/\(app\)/reports/flash src/app/\(app\)/reports/immediate-actions
```

### Paso 2: Modificar el Formulario

1. **Actualizar imports y nombres:**
```typescript
// Cambiar
import { useCreateFlashReport } from '@/shared/hooks/report-hooks'
import { flashReportSchema } from '@/lib/validations/report-schemas'

// Por
import { useCreateImmediateActionsReport } from '@/shared/hooks/report-hooks'
import { immediateActionsReportSchema } from '@/lib/validations/report-schemas'
```

2. **Actualizar campos del formulario:**
   - Reemplazar los campos de Flash Report con los campos correspondientes
   - Usar componentes shadcn apropiados (Input, Textarea, Select, Checkbox)
   - Mantener la estructura de validación con react-hook-form

3. **Para tablas dinámicas (items, personas, equipos):**
```typescript
import { useFieldArray } from 'react-hook-form'

const { fields, append, remove } = useFieldArray({
  control,
  name: "items"
})

// En el JSX:
{fields.map((field, index) => (
  <div key={field.id} className="border p-4 rounded-lg">
    {/* Campos del item */}
    <Button onClick={() => remove(index)}>Eliminar</Button>
  </div>
))}

<Button onClick={() => append({ /* valores por defecto */ })}>
  Agregar Item
</Button>
```

### Paso 3: Componentes Adicionales Recomendados

#### Para Sliders de Porcentaje:
```tsx
// src/shared/components/reports/PercentageSlider.tsx
import { Slider } from '@/shared/components/ui/slider'
import { Label } from '@/shared/components/ui/label'

export function PercentageSlider({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}: {value}%</Label>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} max={100} step={1} />
    </div>
  )
}
```

#### Para Tablas Dinámicas:
```tsx
// src/shared/components/reports/DynamicTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

export function DynamicTable({ fields, append, remove, renderRow, addLabel }) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Headers */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => renderRow(field, index))}
        </TableBody>
      </Table>
      <Button type="button" onClick={() => append({})}>
        <Plus className="h-4 w-4 mr-2" />
        {addLabel}
      </Button>
    </div>
  )
}
```

## 📦 Dependencias Instaladas

```json
{
  "dependencies": {
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "date-fns": "^3.x",
    "sonner": "^1.x" // Para toast notifications
  }
}
```

## 🎨 Componentes Shadcn Disponibles

- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Label
- ✅ Textarea
- ✅ Select
- ✅ Checkbox
- ✅ Dialog/AlertDialog
- ✅ Badge
- ✅ Skeleton
- ✅ Separator
- ✅ Table
- ✅ Tabs
- ✅ Toast/Sonner

## 🚀 Testing Checklist

Para cada formulario completado, verificar:

- [ ] Validación de campos requeridos funciona
- [ ] Mensajes de error se muestran correctamente
- [ ] Loading states durante submit
- [ ] Toast notifications de éxito/error
- [ ] Navegación de regreso funciona
- [ ] Datos se persisten correctamente
- [ ] Vista detallada muestra todos los campos
- [ ] Acciones de workflow funcionan (submit, approve, reject)
- [ ] Eliminación con confirmación funciona
- [ ] Responsive en mobile

## 📚 Recursos

- **Ejemplo completo:** `src/app/(app)/reports/flash/`
- **Esquemas de validación:** `src/lib/validations/report-schemas.ts`
- **Hooks disponibles:** `src/shared/hooks/report-hooks.ts`
- **Servicios API:** `src/lib/api/services/report-service.ts`
- **Tipos:** `src/shared/types/api.ts`

## 🎯 Orden de Implementación Recomendado

1. ✅ **Flash Report** (Completado)
2. **Immediate Actions** (siguiente, estructura simple con tabla)
3. **Root Cause** (metodología 5 Whys)
4. **Action Plan** (similar a Immediate Actions pero más complejo)
5. **Zero Tolerance** (formulario independiente, más simple)
6. **Final Report** (el más complejo, debe ser último)

## 💡 Tips de Desarrollo

1. **Usa React Hook Form con Zod** - Ya está configurado, solo conectar
2. **Componentes reutilizables** - DRY, crear componentes para patrones repetidos
3. **Loading states** - Usar Skeleton de shadcn durante carga
4. **Toast notifications** - Usar sonner para feedback al usuario
5. **Confirmaciones** - AlertDialog para acciones destructivas
6. **Responsive** - Grid con breakpoints md: y lg:
7. **Accesibilidad** - Labels siempre con htmlFor
8. **Validación** - Mostrar errores debajo de cada campo
9. **Optimistic updates** - Los hooks de SWR lo manejan automáticamente
10. **TypeScript strict** - Aprovechar los tipos generados

## 🐛 Debugging

Si encuentras errores:

1. **Error de validación:** Revisa el schema en `report-schemas.ts`
2. **Error de API:** Verifica el endpoint en `report-service.ts`
3. **Error de hook:** Confirma que el cliente modular está actualizado
4. **Error de tipo:** Asegúrate que los tipos en `api.ts` coincidan con el backend

## 📞 Siguiente Paso

Para completar el siguiente reporte (Immediate Actions), sigue estos pasos:

1. Copiar estructura de Flash Report
2. Actualizar nombres e imports
3. Modificar campos según estructura arriba
4. Implementar tabla dinámica de items con useFieldArray
5. Agregar sliders para porcentajes
6. Pre-llenar las 6 acciones predefinidas
7. Testear y validar

¡Todo está listo para continuar con los formularios restantes!
