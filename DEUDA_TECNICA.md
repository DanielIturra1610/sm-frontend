# Deuda Tecnica - SM Frontend

Este documento registra las inconsistencias tecnicas y deuda tecnica identificada en el proyecto.

---

## DT-001: Inconsistencia en Librerias de Data Fetching

**Fecha identificada**: 23/12/2024
**Prioridad**: Media
**Estado**: Pendiente

### Descripcion

El proyecto utiliza DOS librerias diferentes para data fetching:
- **SWR** (v2.3.6) - Usado en el 90% de los hooks
- **React Query** (@tanstack/react-query v5.90.2) - Usado solo en 1 archivo

### Archivos Afectados

```
SWR (patron predominante - 9 archivos):
├── src/shared/hooks/incident-hooks.ts
├── src/shared/hooks/workflow-hooks.ts
├── src/shared/hooks/attachment-hooks.ts
├── src/shared/hooks/metrics-hooks.ts
├── src/shared/hooks/document-hooks.ts
├── src/shared/hooks/analysis-hooks.ts
├── src/shared/hooks/suggestion-hooks.ts
├── src/shared/hooks/use-api.ts
├── src/shared/hooks/report-hooks.ts
└── src/shared/hooks/sla-hooks.ts

React Query (excepcion - 1 archivo):
└── src/shared/hooks/causal-tree-hooks.ts  ← INCONSISTENTE
```

### Impacto

1. **Bundle size**: Ambas librerias se incluyen en el bundle final
2. **Confusion de desarrolladores**: Patrones diferentes para la misma funcionalidad
3. **Mantenibilidad**: Hay que conocer ambas APIs
4. **Cache**: Dos sistemas de cache separados que no se comunican

### Causa Probable

El archivo `causal-tree-hooks.ts` fue agregado posteriormente por un desarrollador diferente que preferia React Query, sin seguir el patron establecido del proyecto.

### Solucion Recomendada

**Opcion A (Recomendada)**: Migrar `causal-tree-hooks.ts` a SWR
- Menor esfuerzo (1 archivo)
- Mantiene consistencia con el 90% del proyecto
- Permite remover React Query del bundle

**Opcion B**: Migrar todo a React Query
- Mayor esfuerzo (9 archivos)
- React Query es mas moderno y tiene mas features
- Requiere mas tiempo de desarrollo

### Estimacion de Esfuerzo

| Opcion | Archivos | Tiempo Estimado |
|--------|----------|-----------------|
| A - Migrar a SWR | 1 | 2-4 horas |
| B - Migrar a React Query | 9 | 2-3 dias |

### Notas Adicionales

Por ahora, los nuevos hooks para el Reporte Final usaran SWR para mantener consistencia con el patron predominante. La migracion de `causal-tree-hooks.ts` queda pendiente como tarea de refactorizacion.

---

## DT-002: Rutas Legacy de Analisis

**Fecha identificada**: 23/12/2024
**Prioridad**: Baja
**Estado**: Pendiente

### Descripcion

Existen carpetas de rutas duplicadas/legacy para los analisis de causa raiz:

```
ACTIVA (Sidebar):
└── /root-cause-analysis/     ← Vista unificada de analisis

LEGACY (sin uso desde Sidebar):
├── /analysis/five-whys/      ← Enlazada desde detalle de incidente
├── /analysis/fishbone/       ← Enlazada desde detalle de incidente
└── /causal-tree/             ← Sin enlaces visibles
```

### Archivos con Enlaces Legacy

- `src/app/(app)/incidents/[id]/page.tsx` (lineas 266-275)
  - Enlaza a `/analysis/five-whys?incidentId=...`
  - Enlaza a `/analysis/fishbone?incidentId=...`

### Solucion Recomendada

1. Actualizar enlaces en `incidents/[id]/page.tsx` para apuntar a `/root-cause-analysis/create?incidentId=...`
2. Eliminar carpetas legacy despues de verificar que no hay otros enlaces
3. Configurar redirects en Next.js para URLs antiguas

---

*Ultima actualizacion: 23/12/2024*
