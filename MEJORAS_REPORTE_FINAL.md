# Mejoras del Reporte Final - Analisis y Propuestas

## Resumen Ejecutivo

Este documento analiza el sistema actual de Reportes Finales e identifica oportunidades de automatizacion, mejoras de UX y optimizaciones para reducir el trabajo manual del usuario, manteniendo la coherencia visual de la aplicacion.

---

## 1. Estado Actual del Sistema

### 1.1 Estructura de Paginas

| Pagina | Ubicacion | Descripcion |
|--------|-----------|-------------|
| Lista | `/reports/final/page.tsx` | Lista todos los reportes finales con filtros |
| Crear | `/reports/final/create/page.tsx` | Formulario de 10 tabs para creacion |
| Detalle | `/reports/final/[id]/page.tsx` | Vista de solo lectura |
| Editar | `/reports/final/[id]/edit/page.tsx` | Formulario de edicion |

### 1.2 Campos del Formulario Actual (10 Tabs)

1. **Informacion Basica**: Datos de empresa, clasificacion de accidente, PLGF
2. **Analisis de Causas Raiz**: Array dinamico de causas con metodologia
3. **Personas Involucradas**: Array dinamico de personas afectadas
4. **Equipos Danados**: Array dinamico de equipos
5. **Terceros Identificados**: Array dinamico de terceros
6. **Descripcion y Conclusiones**: Textareas de narrativa
7. **Acciones**: Resumen de acciones inmediatas y plan
8. **Costos**: Array dinamico de costos
9. **Evidencias**: Array dinamico de imagenes
10. **Responsables**: Array dinamico de investigadores

### 1.3 Fuentes de Datos Disponibles

```
Incidente (padre)
├── Flash Report → Acciones inmediatas, clasificacion, PLGF, personas
├── Acciones Inmediatas → Items de accion con progreso
├── Analisis Causa Raiz → Tablas de analisis con "por ques"
├── Plan de Accion → Items detallados con cronograma
├── Analisis 5 Por Ques → Causa raiz y acciones correctivas
├── Analisis Ishikawa → Causa raiz por categorias
├── Arbol Causal → Nodos de causa raiz y medidas preventivas
├── Zero Tolerance → Severidad y acciones tomadas (opcional)
└── Reporte Final → Consolidacion de todo lo anterior
```

---

## 2. Oportunidades de Automatizacion

### 2.1 Automatizaciones de Alta Prioridad

#### A) Generacion Automatica Completa (Ya existe parcialmente)

**Estado actual**: Existe endpoint `POST /final-reports/incident/{incidentId}/generate`

**Mejora propuesta**: Wizard de generacion con preview

```
┌─────────────────────────────────────────────────────────────────┐
│  Generar Reporte Final Automaticamente                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Datos encontrados para consolidar:                             │
│                                                                 │
│  ✓ Flash Report (Aprobado)                                      │
│  ✓ Acciones Inmediatas (Aprobado)                               │
│  ✓ Analisis Causa Raiz (Aprobado)                               │
│  ✓ Plan de Accion (85% completado)                              │
│  ✓ Analisis 5 Por Ques (2 analisis)                             │
│  ✓ Arbol Causal (1 analisis)                                    │
│  ○ Zero Tolerance (No aplica)                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Preview de datos a generar:                             │    │
│  │                                                         │    │
│  │ • 3 causas raiz identificadas                           │    │
│  │ • 5 acciones del plan                                   │    │
│  │ • 2 personas involucradas                               │    │
│  │ • 1 equipo danado                                       │    │
│  │ • Conclusiones auto-generadas                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Cancelar]                    [Generar y Revisar]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### B) Auto-completado de Conclusiones con IA

**Propuesta**: Boton "Generar Conclusiones" que use los datos consolidados

```typescript
// Datos de entrada para generacion
interface ConclusionGeneratorInput {
  causas_raiz: CausaRaizSummary[]
  acciones_tomadas: string
  plan_accion_progreso: number
  personas_afectadas: number
  equipos_danados: number
  tipo_incidente: string
  severidad: string
}

// Plantilla de conclusion generada
const generatedConclusion = `
Tras la investigacion del ${tipo_incidente} ocurrido, se identificaron
${causas_raiz.length} causas raiz principales mediante ${metodologias_usadas}.

Las causas identificadas fueron:
${causas_raiz.map(c => `- ${c.causa_raiz}`).join('\n')}

Se implementaron acciones inmediatas y se establecio un plan de accion
con ${total_acciones} medidas correctivas, actualmente al ${progreso}%
de avance.

${recomendaciones_adicionales}
`
```

#### C) Extraccion Inteligente de Lecciones Aprendidas

**Propuesta**: Sugerir lecciones basadas en:
- Causas raiz identificadas
- Tipo de incidente
- Acciones correctivas definidas
- Patrones de incidentes similares

```
┌─────────────────────────────────────────────────────────────────┐
│  Sugerencias de Lecciones Aprendidas                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Basado en las causas raiz identificadas:                       │
│                                                                 │
│  □ "La falta de supervision directa en operaciones de alto      │
│     riesgo puede derivar en accidentes. Se requiere presencia   │
│     de supervisor certificado."                                 │
│                                                                 │
│  □ "Los EPP deben verificarse antes de cada turno. Implementar  │
│     checklist obligatorio de inspeccion."                       │
│                                                                 │
│  □ "La comunicacion entre turnos debe documentarse formalmente  │
│     para evitar perdida de informacion critica."                │
│                                                                 │
│  [Agregar seleccionadas]           [Escribir personalizada]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Automatizaciones de Media Prioridad

#### D) Calculo Automatico de Costos

**Propuesta**: Pre-calcular costos basados en:
- Dias de incapacidad (personas involucradas)
- Valor de equipos danados
- Costos de acciones correctivas del plan de accion

```typescript
interface CostoAutomatico {
  concepto: string
  monto: number
  moneda: string
  origen: 'equipo_danado' | 'dias_perdidos' | 'plan_accion' | 'manual'
  calculado: boolean
}

// Ejemplo de calculo
const costosAutomaticos = [
  {
    concepto: "Reparacion de equipo - Grua Overhead #123",
    monto: equipoDanado.costo_estimado,
    moneda: "CLP",
    origen: 'equipo_danado',
    calculado: true
  },
  {
    concepto: "Dias perdidos (2 trabajadores x 5 dias)",
    monto: 2 * 5 * costoPromedioJornada,
    moneda: "CLP",
    origen: 'dias_perdidos',
    calculado: true
  }
]
```

#### E) Timeline Visual de Investigacion

**Propuesta**: Mostrar automaticamente la linea de tiempo del incidente

```
┌─────────────────────────────────────────────────────────────────┐
│  Timeline de Investigacion                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ●───────●───────●───────●───────●───────○                      │
│  │       │       │       │       │       │                      │
│  15/12   16/12   18/12   20/12   22/12   Hoy                    │
│                                                                 │
│  ● Incidente reportado (15/12 08:30)                            │
│  ● Flash Report aprobado (16/12 14:00) - 29h                    │
│  ● Acciones Inmediatas completadas (18/12 10:00)                │
│  ● Analisis Causa Raiz finalizado (20/12 16:30)                 │
│  ● Plan de Accion al 85% (22/12)                                │
│  ○ Reporte Final (En progreso)                                  │
│                                                                 │
│  Tiempo total de investigacion: 8 dias                          │
│  SLA: Dentro del plazo (14 dias)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### F) Consolidacion de Evidencias

**Propuesta**: Recopilar automaticamente imagenes de:
- Flash Report
- Zero Tolerance Report
- Documentos adjuntos del incidente

```
┌─────────────────────────────────────────────────────────────────┐
│  Evidencias Disponibles (12 imagenes encontradas)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Flash Report (4):           Zero Tolerance (3):                │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐    ┌───┐ ┌───┐ ┌───┐                   │
│  │ ☑ │ │ ☑ │ │ ☐ │ │ ☑ │    │ ☑ │ │ ☑ │ │ ☐ │                   │
│  └───┘ └───┘ └───┘ └───┘    └───┘ └───┘ └───┘                   │
│                                                                 │
│  Documentos Incidente (5):                                      │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                                  │
│  │ ☑ │ │ ☐ │ │ ☑ │ │ ☐ │ │ ☑ │                                  │
│  └───┘ └───┘ └───┘ └───┘ └───┘                                  │
│                                                                 │
│  8 imagenes seleccionadas                                       │
│  [Importar Seleccionadas]                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Automatizaciones de Baja Prioridad

#### G) Sugerencia de Responsables

Basado en:
- Responsables de reportes anteriores
- Estructura organizacional del tenant
- Historial de investigaciones similares

#### H) Validacion de Completitud

Indicador visual de campos completos vs pendientes por seccion

---

## 3. Propuestas de Mejora de UX

### 3.1 Opcion A: Wizard de Pasos Guiados

**Concepto**: Reemplazar tabs por un wizard secuencial con progreso visual

```
┌─────────────────────────────────────────────────────────────────┐
│  Crear Reporte Final                                            │
│                                                                 │
│  ○───────○───────●───────○───────○───────○                      │
│  Info   Causas  Personas Equipos Acciones Revisar               │
│  ✓      ✓       ●        ○       ○        ○                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Paso 3 de 6: Personas Involucradas                             │
│                                                                 │
│  Se encontraron 2 personas en reportes anteriores               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ☑ Juan Perez - Operador                                 │    │
│  │   Lesion: Contusion | Gravedad: Leve | Parte: Brazo     │    │
│  │   [Editar detalles]                                     │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ ☑ Maria Garcia - Supervisor                             │    │
│  │   Sin lesiones reportadas                               │    │
│  │   [Editar detalles]                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [+ Agregar otra persona]                                       │
│                                                                 │
│                                                                 │
│  [← Anterior]                              [Siguiente →]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ventajas**:
- Guia al usuario paso a paso
- Reduce la sobrecarga cognitiva
- Permite validacion por paso
- Progress bar visible

**Desventajas**:
- No permite saltar entre secciones facilmente
- Mas clicks para usuarios experimentados

### 3.2 Opcion B: Formulario Colapsable con Seciones

**Concepto**: Un formulario vertical con secciones colapsables tipo acordeon

```
┌─────────────────────────────────────────────────────────────────┐
│  Crear Reporte Final                         Progreso: 65% ████░│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ▼ Informacion del Incidente                            ✓ 100% │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Incidente: INC-2024-0156                                │    │
│  │ Fecha: 15/12/2024 | Tipo: Accidente con baja           │    │
│  │ Empresa: Minera XYZ | Area: Planta Concentradora       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ► Clasificacion del Accidente                          ✓ 100% │
│                                                                 │
│  ▼ Analisis de Causas Raiz                              ● 80%  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 3 causas identificadas          [Auto-completar ✨]     │    │
│  │                                                         │    │
│  │ ┌───────────────────────────────────────────────────┐   │    │
│  │ │ Causa 1: Falta de supervision                     │   │    │
│  │ │ Metodologia: 5 Por Ques                           │   │    │
│  │ │ Accion: Implementar supervision continua          │   │    │
│  │ └───────────────────────────────────────────────────┘   │    │
│  │ [+ Agregar causa]                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ► Personas Involucradas (2)                            ✓ 100% │
│                                                                 │
│  ► Equipos Danados (1)                                  ✓ 100% │
│                                                                 │
│  ▼ Conclusiones y Lecciones                             ○ 0%   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Conclusiones:                    [Generar con IA ✨]     │    │
│  │ ┌───────────────────────────────────────────────────┐   │    │
│  │ │                                                   │   │    │
│  │ │ (Campo vacio)                                     │   │    │
│  │ │                                                   │   │    │
│  │ └───────────────────────────────────────────────────┘   │    │
│  │                                                         │    │
│  │ Lecciones Aprendidas:            [Sugerencias ✨]        │    │
│  │ ┌───────────────────────────────────────────────────┐   │    │
│  │ │                                                   │   │    │
│  │ │ (Campo vacio)                                     │   │    │
│  │ │                                                   │   │    │
│  │ └───────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ► Costos (pendiente)                                   ○ 0%   │
│                                                                 │
│  ► Evidencias (8 disponibles)                           ○ 0%   │
│                                                                 │
│                                                                 │
│  [Guardar Borrador]                    [Enviar para Revision]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ventajas**:
- Vista general de todo el formulario
- Facil navegacion entre secciones
- Indicadores de progreso por seccion
- Permite completar en cualquier orden

**Desventajas**:
- Puede ser abrumador con muchas secciones
- Scroll extenso en pantallas pequenas

### 3.3 Opcion C: Vista Split con Preview (Recomendada)

**Concepto**: Formulario a la izquierda, preview del documento a la derecha

```
┌───────────────────────────────────┬─────────────────────────────┐
│  Editar Reporte Final             │  Preview del Documento      │
│                                   │                             │
│  Tabs: [Info][Causas][Personas]...│  ┌───────────────────────┐  │
│                                   │  │    LOGO    LOGO       │  │
│  ┌─────────────────────────────┐  │  │                       │  │
│  │ Conclusiones:               │  │  │ REPORTE FINAL DE      │  │
│  │ ┌───────────────────────┐   │  │  │ INVESTIGACION         │  │
│  │ │ Tras la investigacion │   │  │  │                       │  │
│  │ │ del accidente...      │◄──┼──┼──│ Incidente: INC-0156   │  │
│  │ │                       │   │  │  │ Fecha: 15/12/2024     │  │
│  │ └───────────────────────┘   │  │  │                       │  │
│  │                             │  │  │ CONCLUSIONES          │  │
│  │ [Generar con IA ✨]          │  │  │ ─────────────────     │  │
│  │                             │  │  │ Tras la investigacion │  │
│  │ Lecciones Aprendidas:       │  │  │ del accidente...      │  │
│  │ ┌───────────────────────┐   │  │  │                       │  │
│  │ │ 1. La supervision...  │   │  │  │ LECCIONES APRENDIDAS  │  │
│  │ │ 2. Los EPP deben...   │   │  │  │ ─────────────────     │  │
│  │ │                       │   │  │  │ 1. La supervision...  │  │
│  │ └───────────────────────┘   │  │  │ 2. Los EPP deben...   │  │
│  │                             │  │  │                       │  │
│  │ [Sugerencias ✨]             │  │  │                       │  │
│  │                             │  │  └───────────────────────┘  │
│  └─────────────────────────────┘  │                             │
│                                   │  [Zoom: 75%] [Pagina 1/3]   │
│  [Guardar]    [Enviar]            │                             │
└───────────────────────────────────┴─────────────────────────────┘
```

**Ventajas**:
- Feedback visual inmediato de como quedara el documento
- Reduce errores al ver el resultado en tiempo real
- Experiencia similar a editores de documentos modernos
- Mantiene tabs para organizacion

**Desventajas**:
- Requiere pantalla amplia (minimo 1280px)
- Mayor complejidad de implementacion
- Rendimiento puede afectarse con documentos grandes

### 3.4 Opcion D: Modo Express vs Modo Completo

**Concepto**: Dos modos de creacion segun necesidad del usuario

```
┌─────────────────────────────────────────────────────────────────┐
│  Crear Reporte Final                                            │
│                                                                 │
│  Selecciona el modo de creacion:                                │
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐   │
│  │                             │  │                         │   │
│  │     ⚡ MODO EXPRESS         │  │     📝 MODO COMPLETO    │   │
│  │                             │  │                         │   │
│  │  • Genera automaticamente   │  │  • Control total        │   │
│  │    desde reportes previos   │  │  • Edita cada campo     │   │
│  │  • Solo revisa y ajusta     │  │  • Sin auto-generacion  │   │
│  │  • Ideal para casos         │  │  • Para casos complejos │   │
│  │    estandar                 │  │    o especiales         │   │
│  │                             │  │                         │   │
│  │  Tiempo estimado: 5 min     │  │  Tiempo estimado: 30min │   │
│  │                             │  │                         │   │
│  │      [Seleccionar]          │  │      [Seleccionar]      │   │
│  │                             │  │                         │   │
│  └─────────────────────────────┘  └─────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Modo Express**:
1. Seleccionar incidente
2. Sistema genera reporte completo automaticamente
3. Usuario revisa datos pre-llenados
4. Ajusta/corrige lo necesario
5. Envia

**Modo Completo**:
- Formulario tradicional con todas las opciones
- Control granular sobre cada campo
- Para casos que requieren personalizacion

---

## 4. Componentes de UI Propuestos

### 4.1 SmartPrefillCard

Muestra datos pre-llenados con opcion de editar

```tsx
interface SmartPrefillCardProps {
  title: string
  source: string          // "Flash Report", "Plan de Accion", etc
  data: Record<string, any>
  onEdit: () => void
  onClear: () => void
}

// Visual
┌─────────────────────────────────────────────────────────────────┐
│  Datos de Empresa                    Fuente: Flash Report       │
│  ─────────────────────────────────────────────────────────────  │
│  Nombre: Minera XYZ S.A.                                        │
│  RUT: 76.xxx.xxx-x                                              │
│  Direccion: Av. Industrial 1234                                 │
│                                                [Editar] [Limpiar]│
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 AnalysisExtractor

Extrae y muestra causas de analisis con checkbox para seleccionar

```tsx
interface AnalysisExtractorProps {
  fiveWhysData?: FiveWhysAnalysis[]
  fishboneData?: FishboneAnalysis[]
  causalTreeData?: CausalTreeAnalysis[]
  onExtract: (causes: CausaRaizSummary[]) => void
}

// Visual
┌─────────────────────────────────────────────────────────────────┐
│  Extraer Causas de Analisis                                     │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  5 Por Ques (2 causas encontradas):                             │
│  ☑ Falta de capacitacion en procedimientos de seguridad        │
│  ☑ Supervision inadecuada durante operaciones nocturnas        │
│                                                                 │
│  Arbol Causal (1 causa encontrada):                             │
│  ☑ Falla en sistema de bloqueo de energia                      │
│                                                                 │
│  Ishikawa (0 causas):                                           │
│  No hay analisis Ishikawa para este incidente                   │
│                                                                 │
│                              [Extraer 3 causas seleccionadas]   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 ProgressIndicator

Indicador de progreso del formulario

```tsx
interface ProgressIndicatorProps {
  sections: {
    name: string
    required: number
    completed: number
    status: 'complete' | 'partial' | 'empty'
  }[]
}

// Visual (barra horizontal)
┌─────────────────────────────────────────────────────────────────┐
│  Progreso del Reporte: 72%                                      │
│  ████████████████████████████████████░░░░░░░░░░░░░░░            │
│                                                                 │
│  ✓ Info Basica  ✓ Causas  ● Personas  ○ Costos  ○ Evidencias   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 AIAssistButton

Boton con indicador de asistencia IA

```tsx
// Visual
┌───────────────────────────┐
│  ✨ Generar con IA        │
└───────────────────────────┘

// Estados
- Default: Azul con icono sparkles
- Loading: Spinner + "Generando..."
- Success: Check verde + "Generado"
- Error: Rojo + "Error, reintentar"
```

### 4.5 SourceDataPanel

Panel lateral que muestra datos fuente disponibles

```tsx
// Visual (panel colapsable a la derecha)
┌─────────────────────────────┐
│  Datos Fuente               │
│  ─────────────────────────  │
│                             │
│  ▼ Flash Report             │
│    Estado: Aprobado ✓       │
│    Fecha: 16/12/2024        │
│    [Ver reporte →]          │
│                             │
│  ▼ Plan de Accion           │
│    Estado: En progreso      │
│    Avance: 85%              │
│    5 acciones definidas     │
│    [Ver reporte →]          │
│                             │
│  ► Analisis 5 Por Ques (2)  │
│  ► Arbol Causal (1)         │
│  ► Zero Tolerance           │
│                             │
└─────────────────────────────┘
```

---

## 5. Flujos de Usuario Optimizados

### 5.1 Flujo de Creacion Express

```
Usuario selecciona "Crear Reporte Final"
         │
         ▼
┌─────────────────────────────────┐
│ Seleccionar Incidente           │
│ [Dropdown con incidentes]       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Validar Prerrequisitos          │
│ ✓ Flash Report aprobado         │
│ ✓ Analisis causa raiz completo  │
│ ✓ Plan de accion definido       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Seleccionar Modo                │
│ [Express] [Completo]            │
└─────────────────────────────────┘
         │
         ▼ (Express)
┌─────────────────────────────────┐
│ Generacion Automatica           │
│ • Consolidando datos...         │
│ • Extrayendo causas...          │
│ • Generando conclusiones...     │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Revision de Reporte Generado    │
│ [Ver secciones colapsables]     │
│ [Editar donde sea necesario]    │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Completar Campos Opcionales     │
│ • Lecciones aprendidas          │
│ • Costos adicionales            │
│ • Evidencias extra              │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Enviar para Revision            │
└─────────────────────────────────┘
```

### 5.2 Flujo de Edicion Simplificado

```
Usuario abre reporte existente
         │
         ▼
┌─────────────────────────────────┐
│ Vista Detalle con               │
│ indicadores de completitud      │
│                                 │
│ ⚠ 2 secciones incompletas      │
│ [Completar →]                   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Modo Edicion Enfocada           │
│ Solo muestra secciones          │
│ incompletas o con alertas       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Guardar y Continuar             │
│ o                               │
│ Ver Reporte Completo            │
└─────────────────────────────────┘
```

---

## 6. Comparativa de Opciones

| Criterio | Opcion A (Wizard) | Opcion B (Acordeon) | Opcion C (Split) | Opcion D (Express) |
|----------|-------------------|---------------------|------------------|---------------------|
| Facilidad de uso | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★★ |
| Velocidad de completado | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★★★ |
| Flexibilidad | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Vista general | ★★☆☆☆ | ★★★★★ | ★★★★★ | ★★★☆☆ |
| Feedback visual | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★★★★☆ |
| Complejidad tecnica | ★★☆☆☆ | ★★★☆☆ | ★★★★★ | ★★★★☆ |
| Responsive | ★★★★★ | ★★★★☆ | ★★☆☆☆ | ★★★★☆ |

### Recomendacion

**Implementar Opcion D (Modo Express) combinado con Opcion B (Acordeon)**

Justificacion:
1. **Express** para casos estandar: Maximiza la automatizacion
2. **Acordeon** para modo completo: Mantiene flexibilidad
3. Mejor relacion costo/beneficio de implementacion
4. Compatible con el sistema actual de tabs (migracion gradual)

---

## 7. Mejoras Especificas por Seccion

### 7.1 Informacion Basica

| Campo | Automatizacion Propuesta |
|-------|-------------------------|
| Datos empresa | Pre-llenar desde configuracion de tenant |
| Clasificacion accidente | Copiar de Flash Report |
| PLGF | Copiar de Flash Report con lock |
| Fecha incidente | Auto desde incidente |
| Correlativo | Auto generado |

### 7.2 Analisis de Causas

| Mejora | Descripcion |
|--------|-------------|
| Extraccion automatica | Boton para extraer de 5PQ/Ishikawa/Arbol |
| Deduplicacion | Detectar causas similares y sugerir merge |
| Vinculacion con acciones | Auto-vincular con plan de accion |

### 7.3 Personas Involucradas

| Mejora | Descripcion |
|--------|-------------|
| Pre-llenado | Desde Flash Report y Zero Tolerance |
| Datos de contacto | Autocompletar desde directorio si existe |
| Historial medico | Vincular con sistema de salud ocupacional |

### 7.4 Conclusiones y Lecciones

| Mejora | Descripcion |
|--------|-------------|
| Generacion IA | Template basado en causas y acciones |
| Biblioteca de lecciones | Sugerir de casos anteriores similares |
| Revision de redaccion | Sugerencias de mejora de texto |

### 7.5 Costos

| Mejora | Descripcion |
|--------|-------------|
| Calculo automatico | Dias perdidos, equipos, acciones |
| Categorias predefinidas | Dropdown con tipos comunes |
| Conversion de moneda | Soporte multi-moneda |

### 7.6 Evidencias

| Mejora | Descripcion |
|--------|-------------|
| Importacion masiva | Desde otros reportes con checkbox |
| Galeria visual | Preview de imagenes antes de agregar |
| OCR | Extraer texto de documentos escaneados |

---

## 8. Metricas de Exito

### KPIs para medir mejoras:

| Metrica | Valor Actual | Objetivo |
|---------|--------------|----------|
| Tiempo promedio de creacion | ~45 min | 15 min |
| Campos completados manualmente | 80% | 30% |
| Tasa de error en datos | 15% | 5% |
| Reportes rechazados por incompletos | 25% | 10% |
| Satisfaccion del usuario (NPS) | N/A | >70 |

---

## 9. Plan de Implementacion Sugerido

### Fase 1: Quick Wins (1-2 semanas)
- [ ] Mejorar pre-llenado de datos basicos
- [ ] Agregar extraccion automatica de causas raiz
- [ ] Implementar generacion de conclusiones con template

### Fase 2: Modo Express (2-3 semanas)
- [ ] Crear wizard de generacion automatica
- [ ] Validacion de prerrequisitos con feedback visual
- [ ] Preview de datos antes de generar

### Fase 3: UI/UX Improvements (2-3 semanas)
- [ ] Implementar acordeon colapsable
- [ ] Agregar indicadores de progreso por seccion
- [ ] Panel lateral de datos fuente

### Fase 4: Inteligencia Avanzada (3-4 semanas)
- [ ] Sugerencias de lecciones aprendidas
- [ ] Calculo automatico de costos
- [ ] Consolidacion de evidencias

---

## 10. Consideraciones Tecnicas

### 10.1 Cambios en Backend Necesarios

```typescript
// Nuevos endpoints sugeridos

// Generar conclusiones con IA
POST /final-reports/generate-conclusions
Body: { incident_id, causas_raiz[], acciones[] }
Response: { conclusion: string, lecciones_sugeridas: string[] }

// Calcular costos automaticos
GET /final-reports/incident/{id}/calculate-costs
Response: { costos_calculados: CostoItem[] }

// Consolidar evidencias
GET /final-reports/incident/{id}/available-evidence
Response: { evidencias: ImagenEvidencia[], sources: string[] }
```

### 10.2 Cambios en Frontend

```typescript
// Nuevos hooks necesarios

useGenerateConclusions(incidentId: string)
useCalculateCosts(incidentId: string)
useAvailableEvidence(incidentId: string)
useLessonsSuggestions(causasRaiz: CausaRaizSummary[])
```

### 10.3 Componentes a Crear

```
src/shared/components/reports/
├── SmartPrefillCard.tsx
├── AnalysisExtractor.tsx
├── ProgressIndicator.tsx
├── AIAssistButton.tsx
├── SourceDataPanel.tsx
├── ExpressWizard.tsx
├── AccordionForm.tsx
└── CostCalculator.tsx
```

---

## 11. Mockups de Referencia

### Pagina de Creacion (Modo Express)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Reportes    Crear Reporte Final                          [?] Ayuda   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Paso 1: Selecciona el incidente                                  │  │
│  │  ─────────────────────────────────────────────────────────────    │  │
│  │                                                                   │  │
│  │  Incidente: [INC-2024-0156 - Caida de altura en...    ▼]          │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ Reportes disponibles para consolidar:                       │  │  │
│  │  │                                                             │  │  │
│  │  │ ✅ Flash Report          Aprobado el 16/12/2024             │  │  │
│  │  │ ✅ Acciones Inmediatas   Completado el 18/12/2024           │  │  │
│  │  │ ✅ Analisis Causa Raiz   Aprobado el 20/12/2024             │  │  │
│  │  │ ⏳ Plan de Accion        85% completado                     │  │  │
│  │  │ ✅ 5 Por Ques (2)        Disponibles                        │  │  │
│  │  │ ✅ Arbol Causal (1)      Disponible                         │  │  │
│  │  │ ⬜ Zero Tolerance        No aplica                          │  │  │
│  │  │                                                             │  │  │
│  │  │ ✓ Todos los requisitos cumplidos para generacion express    │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────┐  ┌────────────────────────────────────┐   │
│  │                          │  │                                    │   │
│  │   ⚡ MODO EXPRESS        │  │   📝 MODO COMPLETO                 │   │
│  │                          │  │                                    │   │
│  │   Genera automaticamente │  │   Completa cada campo              │   │
│  │   Solo revisa y ajusta   │  │   manualmente                      │   │
│  │                          │  │                                    │   │
│  │   ~5 minutos             │  │   ~30 minutos                      │   │
│  │                          │  │                                    │   │
│  │   [Generar Reporte →]    │  │   [Iniciar Formulario →]           │   │
│  │                          │  │                                    │   │
│  └──────────────────────────┘  └────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pagina de Edicion (Modo Acordeon)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Reportes    Editar Reporte Final               Progreso: 85% ████████│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  INC-2024-0156 | Caida de altura en area de mantenimiento               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ ▼ Informacion del Incidente                              ✅ 100%  │  │
│  │   ┌─────────────────────────────────────────────────────────────┐ │  │
│  │   │ Empresa: Minera XYZ S.A.                                    │ │  │
│  │   │ Fecha: 15/12/2024 08:30                                     │ │  │
│  │   │ Tipo: Accidente con baja laboral                            │ │  │
│  │   │ PLGF: Si - Potencial de lesion grave                        │ │  │
│  │   │                                          [Editar seccion →] │ │  │
│  │   └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │ ► Analisis de Causas Raiz (3 causas)                     ✅ 100%  │  │
│  │                                                                   │  │
│  │ ► Personas Involucradas (2)                              ✅ 100%  │  │
│  │                                                                   │  │
│  │ ▼ Conclusiones y Lecciones                               ⚠️ 50%   │  │
│  │   ┌─────────────────────────────────────────────────────────────┐ │  │
│  │   │ Conclusiones:                                               │ │  │
│  │   │ ┌───────────────────────────────────────────────────────┐   │ │  │
│  │   │ │ Tras la investigacion del accidente ocurrido el       │   │ │  │
│  │   │ │ 15/12/2024, se identificaron 3 causas raiz...         │   │ │  │
│  │   │ └───────────────────────────────────────────────────────┘   │ │  │
│  │   │                                                             │ │  │
│  │   │ Lecciones Aprendidas:              [✨ Sugerencias]          │ │  │
│  │   │ ┌───────────────────────────────────────────────────────┐   │ │  │
│  │   │ │ (Pendiente de completar)                              │   │ │  │
│  │   │ │                                                       │   │ │  │
│  │   │ └───────────────────────────────────────────────────────┘   │ │  │
│  │   └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │ ► Costos (3 items - $2,500,000 CLP)                      ✅ 100%  │  │
│  │                                                                   │  │
│  │ ► Evidencias (8 imagenes)                                ✅ 100%  │  │
│  │                                                                   │  │
│  │ ► Responsables (3 investigadores)                        ✅ 100%  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  [Guardar Borrador]                          [Enviar para Revision →]   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Conclusion

El sistema actual de Reportes Finales tiene una base solida pero ofrece multiples oportunidades de mejora en automatizacion y experiencia de usuario. Las mejoras propuestas se enfocan en:

1. **Reducir el trabajo manual** mediante pre-llenado inteligente y extraccion automatica de datos
2. **Acelerar la creacion** con el Modo Express para casos estandar
3. **Mejorar la experiencia** con indicadores de progreso y feedback visual
4. **Mantener la flexibilidad** con el Modo Completo para casos especiales
5. **Asegurar la calidad** con validaciones y sugerencias automaticas

La implementacion gradual permitira obtener beneficios rapidos mientras se construyen las funcionalidades mas avanzadas.

---

## NOTA IMPORTANTE: Estructura de Rutas de la Aplicacion

### Mapa de Rutas Activas

```
NAVEGACION PRINCIPAL (Sidebar - src/shared/components/layout/Sidebar.tsx)
─────────────────────────────────────────────────────────────────────────
/dashboard                    → Panel de Control
/incidents                    → Lista de Sucesos
/incidents/create             → Crear Suceso
/reports                      → Todos los Reportes
/reports/flash                → Flash Report
/reports/immediate-actions    → Acciones Inmediatas
/root-cause-analysis          → Analisis Causa Raiz (PRINCIPAL) ★
/reports/action-plan          → Plan de Accion
/reports/zero-tolerance       → Tolerancia Cero
/reports/final                → Reporte Final
```

### Diferencia Critica: Carpetas de Analisis

| Carpeta | Estado | Descripcion |
|---------|--------|-------------|
| `/root-cause-analysis/` | **PRINCIPAL** | Vista unificada de todos los analisis (5 Por Ques, Fishbone, Arbol Causal). Enlazada desde Sidebar. |
| `/analysis/five-whys/` | **LEGACY** | Pagina legacy de 5 Por Ques. Todavia enlazada desde detalle de incidente. |
| `/analysis/fishbone/` | **LEGACY** | Pagina legacy de Fishbone. Todavia enlazada desde detalle de incidente. |
| `/causal-tree/` | **LEGACY** | Pagina legacy de Arbol Causal. Sin enlaces visibles. |
| `/reports/root-cause/` | **REPORTE** | Es el "Reporte de Causa Raiz" (diferente a los analisis). |

### Estructura de Carpetas Real

```
src/app/(app)/
├── root-cause-analysis/                ★ CARPETA PRINCIPAL DE ANALISIS
│   ├── page.tsx                        → Lista unificada de todos los analisis
│   ├── create/page.tsx                 → Crear nuevo analisis
│   ├── five-whys/[id]/page.tsx         → Ver analisis 5 Por Ques
│   ├── five-whys/[id]/edit/page.tsx    → Editar analisis 5 Por Ques
│   ├── fishbone/[id]/page.tsx          → Ver diagrama Ishikawa
│   ├── fishbone/[id]/edit/page.tsx     → Editar diagrama Ishikawa
│   ├── causal-tree/[id]/page.tsx       → Ver arbol causal
│   └── causal-tree/[id]/edit/page.tsx  → Editar arbol causal
│
├── analysis/                           ⚠️ CARPETA LEGACY
│   ├── five-whys/
│   │   ├── page.tsx                    → Lista legacy 5 Por Ques
│   │   ├── create/page.tsx             → Crear legacy
│   │   └── [id]/page.tsx               → Ver legacy
│   └── fishbone/
│       ├── page.tsx                    → Lista legacy Fishbone
│       ├── create/page.tsx             → Crear legacy
│       └── [id]/page.tsx               → Ver legacy
│
├── causal-tree/                        ⚠️ CARPETA LEGACY (sin enlaces)
│   ├── page.tsx                        → Lista legacy
│   ├── create/page.tsx                 → Crear legacy
│   └── [id]/page.tsx                   → Ver legacy
│
└── reports/
    ├── root-cause/                     → REPORTE de Causa Raiz (no confundir con analisis)
    ├── flash/                          → Flash Report
    ├── immediate-actions/              → Acciones Inmediatas
    ├── action-plan/                    → Plan de Accion
    ├── zero-tolerance/                 → Tolerancia Cero
    └── final/                          → Reporte Final
```

### Enlaces Legacy en Detalle de Incidente

En `src/app/(app)/incidents/[id]/page.tsx` (lineas 266-275) existen enlaces que apuntan a las rutas legacy:

```tsx
<Link href={`/analysis/five-whys?incidentId=${incident.id}`}>
  <Button variant="outline">Iniciar Analisis de 5 Porques</Button>
</Link>
<Link href={`/analysis/fishbone?incidentId=${incident.id}`}>
  <Button variant="outline">Iniciar Analisis de Espina de Pescado</Button>
</Link>
```

**Recomendacion**: Actualizar estos enlaces para apuntar a `/root-cause-analysis/create?incidentId=...`

### Hooks y Servicios (Independientes de Rutas)

Los hooks de analisis son independientes de las rutas de la app:

```
src/shared/hooks/
├── analysis-hooks.ts        → useFiveWhysAnalysis, useFishboneAnalysis
├── causal-tree-hooks.ts     → useCausalTreeAnalysis, useCausalTreeNodes
└── report-hooks.ts          → usePrefillData, useExtractedAnalysisData
```

Estos hooks llaman a la API del backend, no dependen de las rutas del frontend.

---

## 13. ESPECIFICACION TECNICA: Extraccion de Datos Precisa

### 13.1 Diagnostico del Sistema Actual de Extraccion

#### Arquitectura Actual

```
┌─────────────────────────────────────────────────────────────┐
│  Final Report Create Page                                   │
│  (src/app/(app)/reports/final/create/page.tsx)             │
└───────────┬─────────────────────────────────────────────────┘
            │
            ├──→ usePrefillData(incident_id, 'final-report')
            │    └──→ GET /incidents/{id}/prefill?type=final-report
            │
            ├──→ useExtractedAnalysisData(sourceReports, incidentId)
            │    ├──→ useFiveWhysAnalysis (SOLO el primero)
            │    ├──→ useFishboneAnalysis (SOLO el primero)
            │    ├──→ useCausalTreeAnalysis + nodes + measures (SOLO el primero)
            │    └──→ useActionPlanReportByIncident
            │
            └──→ LinkedReportsData (solo visualizacion)
```

#### Brechas Identificadas en la Extraccion

| # | Brecha Critica | Impacto | Ubicacion del Problema |
|---|----------------|---------|------------------------|
| 1 | Solo se procesa el PRIMER analisis de cada tipo | Si hay 2+ analisis 5PQ, solo se usa uno | `useExtractedAnalysisData.ts:181-183` |
| 2 | Fishbone NO extrae acciones | Las acciones del Ishikawa se pierden | `useExtractedAnalysisData.ts:95` |
| 3 | Root Cause Report `analysis_tables[].accion_plan` no se usa | Planes de accion del reporte se ignoran | No implementado |
| 4 | Zero Tolerance no se procesa | Severidad y acciones no disponibles | No implementado |
| 5 | Equipos danados del Flash no se extraen claramente | Datos de equipos incompletos | Prefill parcial |
| 6 | Evidencias no se consolidan | Imagenes de otros reportes no se importan | No implementado |
| 7 | Costos no se calculan | Sin estimacion automatica | No implementado |
| 8 | Personas de Immediate Actions no se consolidan | Lista incompleta de involucrados | Solo Flash Report |
| 9 | Causas duplicadas en 5 Por Ques | `rootCause` y `whys[].isRootCause` duplican | `useExtractedAnalysisData.ts:41-66` |
| 10 | Lecciones aprendidas sin fuente | Campo siempre vacio | No hay fuente de datos |

### 13.2 Matriz de Extraccion Actual vs Propuesta

#### Leyenda: ✅ Extrae | ⚠️ Parcial | ❌ No extrae | 🆕 Nueva extraccion

| Campo Reporte Final | Flash | Immed. Actions | Root Cause | Action Plan | 5 Por Ques | Ishikawa | Arbol Causal | Zero Tolerance |
|---------------------|-------|----------------|------------|-------------|------------|----------|--------------|----------------|
| **company_data** | ⚠️→✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **tipo_accidente_tabla** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **personas_involucradas** | ✅ | ❌→🆕 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌→🆕 |
| **equipos_danados** | ⚠️→✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **terceros_identificados** | ⚠️→✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **detalles_accidente** | ✅ | ❌ | ❌ | ❌ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| **analisis_causas_raiz** | ❌ | ❌ | ❌→🆕 | ❌ | ⚠️→✅ | ⚠️→✅ | ✅ | ❌ |
| **descripcion_detallada** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **conclusiones** | ✅ (auto) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **lecciones_aprendidas** | ❌→🆕 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **acciones_inmediatas_resumen** | ✅ | ⚠️→✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **plan_accion_resumen** | ❌ | ⚠️ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **costos_tabla** | ❌→🆕 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **imagenes_evidencia** | ❌→🆕 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌→🆕 |
| **responsables_investigacion** | ❌→🆕 | ❌→🆕 | ❌→🆕 | ❌→🆕 | ❌ | ❌ | ❌ | ❌ |

### 13.3 Especificacion de Extraccion Mejorada

#### A) Extraccion de TODOS los Analisis (No solo el primero)

**Archivo**: `src/shared/hooks/useExtractedAnalysisData.ts`

**Cambio requerido**:

```typescript
// ANTES (lineas 181-183) - Solo procesa el primero
const fiveWhysId = sourceReports?.five_whys_ids?.[0]
const fishboneId = sourceReports?.fishbone_ids?.[0]
const causalTreeId = sourceReports?.causal_tree_ids?.[0]

// DESPUES - Procesar TODOS
const fiveWhysIds = sourceReports?.five_whys_ids || []
const fishboneIds = sourceReports?.fishbone_ids || []
const causalTreeIds = sourceReports?.causal_tree_ids || []

// Nuevo hook para multiples analisis
function useMultipleFiveWhysAnalyses(ids: string[]) {
  const results = ids.map(id => useFiveWhysAnalysis(id))
  return {
    analyses: results.map(r => r.data).filter(Boolean),
    isLoading: results.some(r => r.isLoading)
  }
}
```

#### B) Extraccion de Acciones desde Fishbone

**Archivo**: `src/shared/hooks/useExtractedAnalysisData.ts`

**Cambio en `useExtractFishboneCauses`**:

```typescript
// ANTES (linea 95)
accion_plan: '' // NO extrae acciones

// DESPUES
accion_plan: fishboneData?.actionItems?.find(
  item => item.priority === 'high' || item.actionType === 'corrective'
)?.description || ''
```

#### C) Extraccion desde Root Cause Report

**Nuevo extractor**:

```typescript
interface RootCauseReportExtraction {
  causas: CausaRaizSummary[]
  metodologia: string
}

function extractFromRootCauseReport(report: RootCauseReport): RootCauseReportExtraction {
  const causas: CausaRaizSummary[] = []

  report.analysis_tables?.forEach(table => {
    // Extraer el ultimo "por que" como causa raiz
    const lastPorque = table.porques?.[table.porques.length - 1]

    if (lastPorque?.respuesta) {
      causas.push({
        problema: table.hecho_observacion || '',
        causa_raiz: lastPorque.respuesta,
        accion_plan: table.accion_plan || '',
        metodologia: report.metodologia || 'Analisis Causa Raiz'
      })
    }
  })

  return { causas, metodologia: report.metodologia }
}
```

#### D) Extraccion desde Zero Tolerance

**Nuevo extractor**:

```typescript
interface ZeroToleranceExtraction {
  severidad: string
  acciones_tomadas: string
  personas: PersonaInvolucrada[]
  fotografias: ImagenEvidencia[]
}

function extractFromZeroTolerance(report: ZeroToleranceReport): ZeroToleranceExtraction {
  return {
    severidad: report.severidad,
    acciones_tomadas: report.acciones_tomadas,
    personas: report.personas_involucradas?.map(p => ({
      nombre: p.nombre,
      cargo: p.cargo || '',
      empresa: p.empresa || '',
      tipo_lesion: '',
      gravedad: report.severidad,
      parte_cuerpo: '',
      descripcion: ''
    })) || [],
    fotografias: report.fotografias?.map(f => ({
      url: f.url,
      descripcion: f.descripcion || 'Foto Zero Tolerance',
      fecha: report.fecha_hora
    })) || []
  }
}
```

#### E) Consolidacion de Personas Involucradas

**Logica de merge inteligente**:

```typescript
interface PersonaConsolidada extends PersonaInvolucrada {
  fuentes: string[]  // ["Flash Report", "Zero Tolerance", etc]
}

function consolidarPersonas(
  flashPersonas: PersonaInvolucrada[],
  zeroTolerancePersonas: PersonaInvolucrada[],
  immediateActionsResponsables: string[]
): PersonaConsolidada[] {
  const personas = new Map<string, PersonaConsolidada>()

  // Agregar desde Flash Report
  flashPersonas.forEach(p => {
    const key = p.nombre.toLowerCase().trim()
    personas.set(key, { ...p, fuentes: ['Flash Report'] })
  })

  // Merge desde Zero Tolerance
  zeroTolerancePersonas.forEach(p => {
    const key = p.nombre.toLowerCase().trim()
    if (personas.has(key)) {
      const existing = personas.get(key)!
      // Merge campos vacios
      personas.set(key, {
        ...existing,
        gravedad: existing.gravedad || p.gravedad,
        fuentes: [...existing.fuentes, 'Zero Tolerance']
      })
    } else {
      personas.set(key, { ...p, fuentes: ['Zero Tolerance'] })
    }
  })

  // Agregar responsables de Immediate Actions como testigos/involucrados
  immediateActionsResponsables.forEach(nombre => {
    const key = nombre.toLowerCase().trim()
    if (!personas.has(key)) {
      personas.set(key, {
        nombre,
        cargo: 'Responsable de Accion',
        empresa: '',
        tipo_lesion: '',
        gravedad: '',
        parte_cuerpo: '',
        descripcion: 'Participante en acciones inmediatas',
        fuentes: ['Acciones Inmediatas']
      })
    }
  })

  return Array.from(personas.values())
}
```

#### F) Consolidacion de Evidencias

**Nuevo hook**:

```typescript
interface EvidenciaConsolidada extends ImagenEvidencia {
  fuente: string
  seleccionada: boolean
}

function useConsolidatedEvidence(incidentId: string) {
  const { data: flashReport } = useFlashReportByIncident(incidentId)
  const { data: zeroTolerance } = useZeroToleranceByIncident(incidentId)
  const { data: incident } = useIncident(incidentId)

  const evidencias: EvidenciaConsolidada[] = useMemo(() => {
    const all: EvidenciaConsolidada[] = []

    // Desde Flash Report
    flashReport?.imagenes?.forEach(img => {
      all.push({
        url: img.url,
        descripcion: img.descripcion || 'Evidencia Flash Report',
        fecha: flashReport.fecha,
        fuente: 'Flash Report',
        seleccionada: true  // Pre-seleccionada por defecto
      })
    })

    // Desde Zero Tolerance
    zeroTolerance?.fotografias?.forEach(foto => {
      all.push({
        url: foto.url,
        descripcion: foto.descripcion || 'Foto Zero Tolerance',
        fecha: zeroTolerance.fecha_hora,
        fuente: 'Zero Tolerance',
        seleccionada: true
      })
    })

    // Desde Incidente (attachments)
    incident?.attachments?.forEach(att => {
      if (att.type?.startsWith('image/')) {
        all.push({
          url: att.url,
          descripcion: att.name || 'Adjunto del incidente',
          fecha: incident.reportedAt,
          fuente: 'Incidente',
          seleccionada: false  // No pre-seleccionada
        })
      }
    })

    return all
  }, [flashReport, zeroTolerance, incident])

  return evidencias
}
```

#### G) Calculo Automatico de Costos

**Nuevo hook**:

```typescript
interface CostoCalculado extends CostoItem {
  origen: 'equipo_danado' | 'dias_perdidos' | 'plan_accion' | 'calculado'
  editable: boolean
}

function useCalculatedCosts(incidentId: string) {
  const { data: flashReport } = useFlashReportByIncident(incidentId)
  const { data: prefillData } = usePrefillData(incidentId, 'final-report')

  const costos: CostoCalculado[] = useMemo(() => {
    const calculated: CostoCalculado[] = []

    // Costos de equipos danados
    prefillData?.final_report_data?.equipos_danados?.forEach(equipo => {
      if (equipo.costo_estimado && equipo.costo_estimado > 0) {
        calculated.push({
          concepto: `Reparacion/Reposicion: ${equipo.nombre}`,
          monto: equipo.costo_estimado,
          moneda: 'CLP',
          descripcion: `${equipo.tipo_dano} - ${equipo.marca || ''} ${equipo.modelo || ''}`,
          origen: 'equipo_danado',
          editable: true
        })
      }
    })

    // Costos por dias perdidos (si hay personas con baja)
    const personasConBaja = prefillData?.final_report_data?.personas_involucradas?.filter(
      p => p.gravedad && ['grave', 'muy_grave'].includes(p.gravedad.toLowerCase())
    ) || []

    if (personasConBaja.length > 0) {
      // Estimacion: $50,000 CLP por dia por persona (configurable)
      const COSTO_DIA_PERSONA = 50000
      const diasEstimados = personasConBaja.length * 5 // 5 dias promedio inicial

      calculated.push({
        concepto: `Dias perdidos estimados (${personasConBaja.length} persona(s))`,
        monto: diasEstimados * COSTO_DIA_PERSONA,
        moneda: 'CLP',
        descripcion: 'Estimacion inicial - ajustar segun dias reales de licencia',
        origen: 'dias_perdidos',
        editable: true
      })
    }

    return calculated
  }, [prefillData])

  return { costos, isLoading: false }
}
```

#### H) Extraccion de Responsables de Investigacion

**Consolidar desde multiples fuentes**:

```typescript
function extractResponsables(
  flashReport?: FlashReport,
  immediateActions?: ImmediateActionsReport,
  rootCauseReport?: RootCauseReport,
  actionPlan?: ActionPlanReport
): ResponsableInvestigacion[] {
  const responsables = new Map<string, ResponsableInvestigacion>()

  // Supervisor del Flash Report
  if (flashReport?.supervisor) {
    responsables.set(flashReport.supervisor.toLowerCase(), {
      nombre: flashReport.supervisor,
      cargo: 'Supervisor',
      firma: ''
    })
  }

  // Responsables unicos de Immediate Actions
  immediateActions?.items?.forEach(item => {
    if (item.responsable) {
      const key = item.responsable.toLowerCase()
      if (!responsables.has(key)) {
        responsables.set(key, {
          nombre: item.responsable,
          cargo: 'Responsable de Accion Inmediata',
          firma: ''
        })
      }
    }
  })

  // Responsables del Plan de Accion
  actionPlan?.items?.forEach(item => {
    if (item.responsable) {
      const key = item.responsable.toLowerCase()
      if (!responsables.has(key)) {
        responsables.set(key, {
          nombre: item.responsable,
          cargo: 'Responsable de Plan de Accion',
          firma: ''
        })
      }
    }
  })

  return Array.from(responsables.values())
}
```

### 13.4 Deduplicacion Inteligente de Causas

**Problema**: Cuando se extrae de multiples fuentes, pueden haber causas duplicadas o muy similares.

**Solucion**:

```typescript
interface CausaConScore extends CausaRaizSummary {
  score: number  // Para ordenar por relevancia
  fuentes: string[]
}

function deduplicateCausas(causas: CausaRaizSummary[]): CausaRaizSummary[] {
  const unique = new Map<string, CausaConScore>()

  causas.forEach(causa => {
    // Normalizar texto para comparacion
    const normalizedCausa = causa.causa_raiz
      .toLowerCase()
      .trim()
      .replace(/[.,;:]/g, '')
      .replace(/\s+/g, ' ')

    // Crear key basado en palabras clave (primeras 5 palabras)
    const keyWords = normalizedCausa.split(' ').slice(0, 5).join(' ')

    if (unique.has(keyWords)) {
      // Merge: mantener la version mas completa
      const existing = unique.get(keyWords)!
      unique.set(keyWords, {
        ...existing,
        // Usar la descripcion mas larga
        causa_raiz: causa.causa_raiz.length > existing.causa_raiz.length
          ? causa.causa_raiz
          : existing.causa_raiz,
        // Combinar acciones si diferentes
        accion_plan: existing.accion_plan || causa.accion_plan,
        // Combinar fuentes
        fuentes: [...existing.fuentes, causa.metodologia],
        score: existing.score + 1
      })
    } else {
      unique.set(keyWords, {
        ...causa,
        score: 1,
        fuentes: [causa.metodologia]
      })
    }
  })

  // Ordenar por score (mas fuentes = mas relevante)
  return Array.from(unique.values())
    .sort((a, b) => b.score - a.score)
    .map(({ score, fuentes, ...causa }) => ({
      ...causa,
      metodologia: fuentes.length > 1
        ? fuentes.join(', ')
        : causa.metodologia
    }))
}
```

---

## 14. IMPLEMENTACION: Opcion D - Modo Express vs Completo

### 14.1 Arquitectura del Modo Express

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO MODO EXPRESS                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 1: Seleccion de Incidente                                 │
│  ─────────────────────────────────────────────────────────────  │
│  • Dropdown de incidentes disponibles                           │
│  • Mostrar solo incidentes SIN reporte final                    │
│  • Preview: tipo, fecha, correlativo                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 2: Validacion de Prerrequisitos                           │
│  ─────────────────────────────────────────────────────────────  │
│  • Verificar Flash Report (requerido, aprobado)                 │
│  • Verificar al menos 1 analisis de causa raiz                  │
│  • Verificar Plan de Accion (recomendado)                       │
│  • Mostrar checklist con estados                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌───────────────────┐  ┌───────────────────┐
        │   MODO EXPRESS    │  │  MODO COMPLETO    │
        │   (Automatico)    │  │   (Manual)        │
        └─────────┬─────────┘  └─────────┬─────────┘
                  │                      │
                  ▼                      ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  PASO 3E: Generacion        │  │  PASO 3C: Formulario Tabs   │
│  ─────────────────────────  │  │  ─────────────────────────  │
│  • Consolidar datos         │  │  • 10 tabs tradicionales    │
│  • Extraer causas de todos  │  │  • Pre-llenado basico       │
│    los analisis             │  │  • Control total del        │
│  • Generar conclusiones     │  │    usuario                  │
│  • Calcular costos          │  │                             │
│  • Importar evidencias      │  │                             │
└─────────────┬───────────────┘  └─────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 4E: Revision en Acordeon                                  │
│  ─────────────────────────────────────────────────────────────  │
│  • Secciones colapsables con indicador de completitud           │
│  • Edicion inline de cualquier campo                            │
│  • Indicadores de datos auto-generados vs manuales              │
│  • Boton "Re-generar" por seccion                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 5: Enviar para Revision                                   │
│  ─────────────────────────────────────────────────────────────  │
│  • Validacion final de campos requeridos                        │
│  • Confirmacion antes de enviar                                 │
│  • Guardar como borrador si incompleto                          │
└─────────────────────────────────────────────────────────────────┘
```

### 14.2 Componentes Nuevos a Crear

```
src/app/(app)/reports/final/
├── create/
│   ├── page.tsx                    # Pagina principal (modificar)
│   └── _components/
│       ├── IncidentSelector.tsx    # Paso 1
│       ├── PrerequisiteChecker.tsx # Paso 2
│       ├── ModeSelector.tsx        # Selector Express/Completo
│       ├── ExpressWizard.tsx       # Contenedor Modo Express
│       ├── GenerationProgress.tsx  # Indicador de generacion
│       └── ReviewAccordion.tsx     # Revision con acordeon

src/shared/components/reports/
├── ExpressGeneration/
│   ├── DataExtractionService.ts    # Servicio de extraccion
│   ├── ConsolidationEngine.ts      # Motor de consolidacion
│   └── GeneratedPreview.tsx        # Preview de datos generados
├── SmartForm/
│   ├── SmartSection.tsx            # Seccion con auto-fill
│   ├── DataSourceBadge.tsx         # Badge "Auto" / "Manual"
│   └── RegenerateButton.tsx        # Boton re-generar seccion

src/shared/hooks/
├── useExpressGeneration.ts         # Hook principal modo express
├── useConsolidatedEvidence.ts      # Hook evidencias
├── useCalculatedCosts.ts           # Hook costos
├── useMultipleAnalyses.ts          # Hook multiples analisis
└── useDeduplicatedCauses.ts        # Hook deduplicacion
```

### 14.3 Estructura del Componente Principal

```tsx
// src/app/(app)/reports/final/create/page.tsx

'use client'

import { useState } from 'react'
import { IncidentSelector } from './_components/IncidentSelector'
import { PrerequisiteChecker } from './_components/PrerequisiteChecker'
import { ModeSelector } from './_components/ModeSelector'
import { ExpressWizard } from './_components/ExpressWizard'
import { CompleteForm } from './_components/CompleteForm'

type CreationMode = 'selecting' | 'express' | 'complete'
type Step = 'incident' | 'prerequisites' | 'mode' | 'form'

export default function CreateFinalReportPage() {
  const [step, setStep] = useState<Step>('incident')
  const [mode, setMode] = useState<CreationMode>('selecting')
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const [prerequisites, setPrerequisites] = useState<PrerequisiteStatus | null>(null)

  // Paso 1: Seleccion de incidente
  if (step === 'incident') {
    return (
      <IncidentSelector
        onSelect={(incidentId) => {
          setSelectedIncidentId(incidentId)
          setStep('prerequisites')
        }}
      />
    )
  }

  // Paso 2: Verificacion de prerrequisitos
  if (step === 'prerequisites') {
    return (
      <PrerequisiteChecker
        incidentId={selectedIncidentId!}
        onComplete={(prereqs) => {
          setPrerequisites(prereqs)
          setStep('mode')
        }}
        onBack={() => setStep('incident')}
      />
    )
  }

  // Paso 3: Seleccion de modo
  if (step === 'mode') {
    return (
      <ModeSelector
        prerequisites={prerequisites!}
        canUseExpress={prerequisites?.allRequired}
        onSelectExpress={() => {
          setMode('express')
          setStep('form')
        }}
        onSelectComplete={() => {
          setMode('complete')
          setStep('form')
        }}
        onBack={() => setStep('prerequisites')}
      />
    )
  }

  // Paso 4: Formulario segun modo
  if (mode === 'express') {
    return (
      <ExpressWizard
        incidentId={selectedIncidentId!}
        prerequisites={prerequisites!}
        onBack={() => setStep('mode')}
      />
    )
  }

  return (
    <CompleteForm
      incidentId={selectedIncidentId!}
      onBack={() => setStep('mode')}
    />
  )
}
```

### 14.4 Hook de Generacion Express

```typescript
// src/shared/hooks/useExpressGeneration.ts

interface ExpressGenerationResult {
  // Datos generados
  data: CreateFinalReportData | null

  // Estado
  isGenerating: boolean
  progress: number  // 0-100
  currentStep: string

  // Metadatos
  sources: {
    field: string
    source: string
    wasAutoGenerated: boolean
  }[]

  // Errores/Advertencias
  warnings: string[]
  errors: string[]

  // Acciones
  regenerateSection: (section: string) => Promise<void>
  confirmAndCreate: () => Promise<FinalReport>
}

export function useExpressGeneration(incidentId: string): ExpressGenerationResult {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [data, setData] = useState<CreateFinalReportData | null>(null)
  const [sources, setSources] = useState<SourceInfo[]>([])

  // Hooks de datos
  const { data: prefillData } = usePrefillData(incidentId, 'final-report')
  const { data: flashReport } = useFlashReportByIncident(incidentId)
  const { data: immediateActions } = useImmediateActionsReportByIncident(incidentId)
  const { data: rootCauseReport } = useRootCauseReportByIncident(incidentId)
  const { data: actionPlan } = useActionPlanReportByIncident(incidentId)
  const { data: zeroTolerance } = useZeroToleranceByIncident(incidentId)

  // Hooks de analisis (TODOS, no solo el primero)
  const fiveWhysAnalyses = useMultipleFiveWhysAnalyses(
    prefillData?.source_reports?.five_whys_ids || []
  )
  const fishboneAnalyses = useMultipleFishboneAnalyses(
    prefillData?.source_reports?.fishbone_ids || []
  )
  const causalTreeAnalyses = useMultipleCausalTreeAnalyses(
    prefillData?.source_reports?.causal_tree_ids || []
  )

  // Consolidacion de evidencias
  const consolidatedEvidence = useConsolidatedEvidence(incidentId)

  // Calculo de costos
  const calculatedCosts = useCalculatedCosts(incidentId)

  // Efecto de generacion
  useEffect(() => {
    if (!prefillData) return

    async function generate() {
      setProgress(0)

      // Paso 1: Datos basicos (10%)
      setCurrentStep('Extrayendo datos del incidente...')
      const basicData = extractBasicData(prefillData, flashReport)
      setProgress(10)

      // Paso 2: Clasificacion (20%)
      setCurrentStep('Procesando clasificacion...')
      const classification = extractClassification(flashReport)
      setProgress(20)

      // Paso 3: Personas (30%)
      setCurrentStep('Consolidando personas involucradas...')
      const personas = consolidarPersonas(
        flashReport?.personas_involucradas,
        zeroTolerance?.personas_involucradas,
        immediateActions?.items?.map(i => i.responsable)
      )
      setProgress(30)

      // Paso 4: Causas raiz - DE TODOS LOS ANALISIS (50%)
      setCurrentStep('Extrayendo causas raiz de todos los analisis...')
      const causasFromFiveWhys = extractAllFiveWhysCauses(fiveWhysAnalyses)
      const causasFromFishbone = extractAllFishboneCauses(fishboneAnalyses)
      const causasFromCausalTree = extractAllCausalTreeCauses(causalTreeAnalyses)
      const causasFromRootCause = extractFromRootCauseReport(rootCauseReport)

      const allCausas = [
        ...causasFromFiveWhys,
        ...causasFromFishbone,
        ...causasFromCausalTree,
        ...causasFromRootCause
      ]

      const deduplicatedCausas = deduplicateCausas(allCausas)
      setProgress(50)

      // Paso 5: Conclusiones (60%)
      setCurrentStep('Generando conclusiones...')
      const conclusiones = generateConclusions(deduplicatedCausas, actionPlan)
      setProgress(60)

      // Paso 6: Acciones (70%)
      setCurrentStep('Resumiendo acciones...')
      const accionesResumen = generateActionsResume(flashReport, immediateActions)
      const planResumen = generatePlanResume(actionPlan)
      setProgress(70)

      // Paso 7: Costos (80%)
      setCurrentStep('Calculando costos...')
      const costos = calculatedCosts.costos
      setProgress(80)

      // Paso 8: Evidencias (90%)
      setCurrentStep('Importando evidencias...')
      const evidencias = consolidatedEvidence.filter(e => e.seleccionada)
      setProgress(90)

      // Paso 9: Responsables (95%)
      setCurrentStep('Identificando responsables...')
      const responsables = extractResponsables(
        flashReport,
        immediateActions,
        rootCauseReport,
        actionPlan
      )
      setProgress(95)

      // Paso 10: Compilar resultado final (100%)
      setCurrentStep('Finalizando...')
      const finalData: CreateFinalReportData = {
        incident_id: incidentId,
        company_data: basicData.company_data,
        tipo_accidente_tabla: classification,
        personas_involucradas: personas,
        equipos_danados: prefillData.final_report_data?.equipos_danados || [],
        terceros_identificados: prefillData.final_report_data?.terceros_identificados || [],
        detalles_accidente: basicData.detalles,
        analisis_causas_raiz: deduplicatedCausas,
        descripcion_detallada: basicData.descripcion,
        conclusiones: conclusiones,
        lecciones_aprendidas: '', // Requiere input manual o IA
        acciones_inmediatas_resumen: accionesResumen,
        plan_accion_resumen: planResumen,
        costos_tabla: costos,
        imagenes_evidencia: evidencias,
        responsables_investigacion: responsables
      }

      setData(finalData)
      setProgress(100)
      setCurrentStep('Generacion completada')
    }

    generate()
  }, [prefillData, /* otras dependencias */])

  return {
    data,
    isGenerating: progress < 100,
    progress,
    currentStep,
    sources,
    warnings: [],
    errors: [],
    regenerateSection,
    confirmAndCreate
  }
}
```

### 14.5 Componente de Revision en Acordeon

```tsx
// src/app/(app)/reports/final/create/_components/ReviewAccordion.tsx

interface ReviewAccordionProps {
  data: CreateFinalReportData
  sources: SourceInfo[]
  onEdit: (section: string, data: Partial<CreateFinalReportData>) => void
  onRegenerate: (section: string) => void
}

export function ReviewAccordion({ data, sources, onEdit, onRegenerate }: ReviewAccordionProps) {
  const sections: AccordionSection[] = [
    {
      id: 'basic',
      title: 'Informacion del Incidente',
      icon: <FileText />,
      completeness: calculateCompleteness(data, 'basic'),
      content: <BasicInfoSection data={data} onEdit={onEdit} />,
      isAutoGenerated: sources.some(s => s.field === 'basic' && s.wasAutoGenerated)
    },
    {
      id: 'classification',
      title: 'Clasificacion del Accidente',
      icon: <AlertTriangle />,
      completeness: calculateCompleteness(data, 'classification'),
      content: <ClassificationSection data={data} onEdit={onEdit} />,
      isAutoGenerated: true
    },
    {
      id: 'causes',
      title: `Analisis de Causas Raiz (${data.analisis_causas_raiz?.length || 0})`,
      icon: <Search />,
      completeness: calculateCompleteness(data, 'causes'),
      content: <CausesSection data={data} onEdit={onEdit} onRegenerate={() => onRegenerate('causes')} />,
      isAutoGenerated: true
    },
    {
      id: 'persons',
      title: `Personas Involucradas (${data.personas_involucradas?.length || 0})`,
      icon: <Users />,
      completeness: calculateCompleteness(data, 'persons'),
      content: <PersonsSection data={data} onEdit={onEdit} />,
      isAutoGenerated: true
    },
    // ... mas secciones
  ]

  return (
    <div className="space-y-2">
      {/* Barra de progreso general */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Progreso del reporte</span>
          <span className="font-medium">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Acordeon de secciones */}
      <Accordion type="multiple" defaultValue={['basic']}>
        {sections.map(section => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <span>{section.title}</span>
                  {section.isAutoGenerated && (
                    <Badge variant="secondary" className="ml-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Auto
                    </Badge>
                  )}
                </div>
                <CompletenessIndicator value={section.completeness} />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 pb-2">
                {section.content}
                {section.isAutoGenerated && (
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRegenerate(section.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-generar seccion
                    </Button>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
```

### 14.6 Indicador de Completitud

```tsx
// src/shared/components/reports/SmartForm/CompletenessIndicator.tsx

interface CompletenessIndicatorProps {
  value: number  // 0-100
}

export function CompletenessIndicator({ value }: CompletenessIndicatorProps) {
  const status = value === 100 ? 'complete' : value > 0 ? 'partial' : 'empty'

  const colors = {
    complete: 'text-green-600 bg-green-100',
    partial: 'text-amber-600 bg-amber-100',
    empty: 'text-gray-400 bg-gray-100'
  }

  const icons = {
    complete: <CheckCircle2 className="h-4 w-4" />,
    partial: <Circle className="h-4 w-4" />,
    empty: <Circle className="h-4 w-4" />
  }

  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
      colors[status]
    )}>
      {icons[status]}
      <span>{value}%</span>
    </div>
  )
}
```

---

## 15. Plan de Implementacion Detallado

### Fase 1: Mejoras en Extraccion de Datos (Semana 1-2)

#### Sprint 1.1: Extraccion Multiple de Analisis
- [ ] Crear `useMultipleFiveWhysAnalyses` hook
- [ ] Crear `useMultipleFishboneAnalyses` hook
- [ ] Crear `useMultipleCausalTreeAnalyses` hook
- [ ] Modificar `useExtractedAnalysisData` para usar hooks multiples
- [ ] Tests unitarios

#### Sprint 1.2: Nuevos Extractores
- [ ] Agregar extraccion de acciones en Fishbone
- [ ] Crear extractor de Root Cause Report
- [ ] Crear extractor de Zero Tolerance
- [ ] Implementar `consolidarPersonas`
- [ ] Implementar `deduplicateCausas`
- [ ] Tests unitarios

### Fase 2: Componentes Modo Express (Semana 3-4)

#### Sprint 2.1: Componentes Base
- [ ] Crear `IncidentSelector` component
- [ ] Crear `PrerequisiteChecker` component
- [ ] Crear `ModeSelector` component
- [ ] Crear `GenerationProgress` component

#### Sprint 2.2: Wizard Express
- [ ] Crear `ExpressWizard` contenedor
- [ ] Implementar `useExpressGeneration` hook
- [ ] Crear `ReviewAccordion` component
- [ ] Integrar con pagina de creacion

### Fase 3: Hooks de Apoyo (Semana 5)

- [ ] Crear `useConsolidatedEvidence` hook
- [ ] Crear `useCalculatedCosts` hook
- [ ] Crear `extractResponsables` utility
- [ ] Crear `generateConclusions` utility
- [ ] Crear `generateActionsResume` utility

### Fase 4: Polish y Testing (Semana 6)

- [ ] Tests de integracion
- [ ] Ajustes de UX basados en feedback
- [ ] Documentacion de uso
- [ ] Migracion gradual (feature flag)

---

## 16. Resumen de Archivos a Modificar/Crear

### Archivos a MODIFICAR:

| Archivo | Cambios |
|---------|---------|
| `src/shared/hooks/useExtractedAnalysisData.ts` | Soportar multiples analisis, extraer acciones de Fishbone |
| `src/app/(app)/reports/final/create/page.tsx` | Agregar flujo Modo Express |
| `src/shared/hooks/report-hooks.ts` | Agregar hooks para multiples analisis |

### Archivos a CREAR:

| Archivo | Proposito |
|---------|-----------|
| `src/shared/hooks/useMultipleAnalyses.ts` | Hooks para cargar multiples analisis |
| `src/shared/hooks/useExpressGeneration.ts` | Hook principal de generacion express |
| `src/shared/hooks/useConsolidatedEvidence.ts` | Consolidar evidencias de multiples fuentes |
| `src/shared/hooks/useCalculatedCosts.ts` | Calcular costos automaticamente |
| `src/shared/utils/causeDeduplication.ts` | Logica de deduplicacion de causas |
| `src/shared/utils/personConsolidation.ts` | Logica de consolidacion de personas |
| `src/shared/utils/reportExtractors.ts` | Extractores de datos por tipo de reporte |
| `src/app/(app)/reports/final/create/_components/IncidentSelector.tsx` | Selector de incidente |
| `src/app/(app)/reports/final/create/_components/PrerequisiteChecker.tsx` | Verificador de prerrequisitos |
| `src/app/(app)/reports/final/create/_components/ModeSelector.tsx` | Selector de modo |
| `src/app/(app)/reports/final/create/_components/ExpressWizard.tsx` | Wizard modo express |
| `src/app/(app)/reports/final/create/_components/ReviewAccordion.tsx` | Acordeon de revision |
| `src/shared/components/reports/SmartForm/CompletenessIndicator.tsx` | Indicador de completitud |
| `src/shared/components/reports/SmartForm/DataSourceBadge.tsx` | Badge de fuente de datos |

---

*Documento actualizado el: 23/12/2024*
*Version: 2.1 - Con clarificacion de estructura de rutas y carpetas reales de la aplicacion*
