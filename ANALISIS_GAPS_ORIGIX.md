# 📋 ANÁLISIS EXHAUSTIVO DE GAPS - Plataforma Origix

**Fecha:** 18 de Diciembre de 2025  
**Proyecto:** Origix - Plataforma de Gestión de Indicadores Predictivos  
**Versión:** 1.0

---

## 📊 Resumen Ejecutivo

Análisis completo de funcionalidades pendientes tras reunión de revisión. **21 GAPs identificados** en 4 niveles de prioridad.

### Estadísticas

| Categoría | Total | Backend | Frontend | Ambos |
|-----------|-------|---------|----------|-------|
| 🔴 Crítico | 5 | 2 | 2 | 1 |
| 🟡 Alta | 7 | 2 | 4 | 1 |
| 🟢 Media | 6 | 0 | 6 | 0 |
| 🔵 Baja | 3 | 1 | 1 | 1 |
| **TOTAL** | **21** | **5** | **13** | **3** |

### Decisiones Estratégicas

- **Cambio de enfoque:** De "seguridad industrial" a "gestión de indicadores predictivos"
- **Nuevo nombre:** Origix
- **Mercado objetivo:** Empresas grandes y medianas con certificaciones ISO
- **Valor diferencial:** Capacidad predictiva y detección de pérdidas económicas

---

## 🔴 PRIORIDAD CRÍTICA

### 1. Nomenclatura y Rebranding a "Origix"

**Esfuerzo:** 2-4h | **Componentes:** Frontend

**Archivos:**
- `src/app/(auth)/_components/login-form.tsx:85-96, 68-80, 94-96`
- `src/app/(auth)/_components/auth-layout.tsx:98`
- `src/app/(app)/dashboard/page.tsx`

**Cambios:**
- "Industrial Safety Management Platform" → "Gestión de Indicadores Predictivos"
- "Sign in to your safety management workspace" → "Accede a tu panel de gestión"
- "© 2024 Stegmaier Management" → "© 2024 Origix"
- "Progreso de seguridad" → "Progreso"
- "Acciones pendientes" → "Tareas pendientes"
- "Inspección" → "Personalizados de gestión"
- "Capacitación de riesgo" → "Formación y entrenamiento"

---

### 2. Sistema de Correlativo Automático

**Esfuerzo:** 8-12h | **Componentes:** Backend + Frontend | **Estado:** ❌ No implementado

**Backend:**
- Migración: columna `correlativo` VARCHAR(10) UNIQUE
- Función: `generate_correlativo(tenant_id)` que comienza en 00001
- Endpoint: `GET /api/v1/incidents/search?correlativo=00123`

**Frontend:**
- Mostrar correlativo en título del suceso
- Campo de búsqueda con ícono lupa
- Display en listados y detalles

**Archivos:**
- Backend: `internal/core/incident/domain/incident.go`
- Frontend: `src/app/(app)/incidents/create/page.tsx`
- Frontend: `src/app/(app)/incidents/page.tsx`
- Frontend: `src/app/(app)/incidents/[id]/page.tsx`

---

### 3. Eliminar Severidad "Crítica"

**Esfuerzo:** 1-2h | **Componentes:** Backend + Frontend

**Cambios:**
- Schema: `severity: z.enum(['low', 'medium', 'high'])` (eliminar 'critical')
- UI: Eliminar `<SelectItem value="critical">Crítica</SelectItem>`
- Backend: Actualizar enum en `incident.go`

**Archivo:** `src/app/(app)/incidents/create/page.tsx:39, 196`

---

### 4. Páginas de Edición de Reportes (Error 404)

**Esfuerzo:** 20-30h | **Componentes:** Frontend | **Estado:** ❌ No existen

**Rutas faltantes:**
1. `/reports/flash/[id]/edit`
2. `/reports/immediate-actions/[id]/edit`
3. `/reports/action-plan/[id]/edit`
4. `/reports/root-cause/[id]/edit`
5. `/reports/final/[id]/edit`
6. `/reports/zero-tolerance/[id]/edit`

**Solución recomendada:** Implementar edición inline en páginas de detalle

---

### 5. Nomenclatura de Archivos Descargados

**Esfuerzo:** 4-6h | **Componentes:** Backend + Frontend | **Estado:** ❌ TODO

**Requerido:**
- Backend: Endpoint `POST /api/v1/reports/{type}/{id}/export?format=pdf`
- Generadores de PDF/DOCX
- Nombre automático: `"Reporte Flash - {incident.title}.pdf"`
- Headers: `Content-Disposition: attachment; filename="..."`

**Archivo:** `src/app/(app)/reports/flash/page.tsx:42-51`

---

## 🟡 PRIORIDAD ALTA

### 6. Campos Faltantes en Formulario de Creación

**Esfuerzo:** 6-8h | **Componentes:** Backend + Frontend

**Campos a agregar:**
- ❌ área
- ❌ zona
- ❌ empresa
- ❌ supervisor

**Migración:**
```sql
ALTER TABLE incidents ADD COLUMN area VARCHAR(100);
ALTER TABLE incidents ADD COLUMN zona VARCHAR(100);
ALTER TABLE incidents ADD COLUMN empresa VARCHAR(200);
ALTER TABLE incidents ADD COLUMN supervisor VARCHAR(200);
```

**Archivo:** `src/app/(app)/incidents/create/page.tsx`

---

### 7. Auto-llenado de Fechas en Acciones Inmediatas

**Esfuerzo:** 1-2h | **Componentes:** Frontend

**Cambio:**
```tsx
const today = new Date().toISOString().split('T')[0]

defaultValues: {
  items: PREDEFINED_ACTIONS.map(action => ({
    inicio: today,  // ✅ Auto-llenado
    fin: today,     // ✅ Mismo día
    // ...
  }))
}
```

**Archivo:** `src/app/(app)/reports/immediate-actions/create/page.tsx:87-98`

---

### 8. Funcionalidad Copy-Paste Responsables y Porcentajes

**Esfuerzo:** 3-4h | **Componentes:** Frontend | **Estado:** ❌ No implementado

**Botones a agregar:**
- "Copiar Responsable a Todas"
- "Copiar Cliente a Todas"
- "Llenar 100% en Todos"
- "Llenar Fechas de Hoy"

**Archivo:** `src/app/(app)/reports/immediate-actions/create/page.tsx`

---

### 9. Indicadores con Comparativas Anuales

**Esfuerzo:** 10-15h | **Componentes:** Backend + Frontend

**Requerido:**
- Selector de años múltiples (2024, 2025, 2026)
- Separar: Accidentes vs Incidentes Alto Potencial vs Tolerancia 0
- Endpoint: `GET /api/v1/metrics/trends/comparative?years[]=2024&years[]=2025`
- Gráfico con colores diferenciados por tipo

**Archivo:** `src/shared/components/dashboard/incident-trends-chart.tsx`

**Nota:** Requisito legal para evaluación Mutual de Seguridad cada 3 años

---

### 10. Prevención Duplicación Empresas - Mejoras

**Esfuerzo:** 4-6h | **Componentes:** Backend + Frontend

**Mejoras:**
- Normalización: lowercase, trim, remover espacios extras
- Fuzzy matching con pg_trgm
- Mostrar empresas similares sugeridas
- Migración: `CREATE EXTENSION pg_trgm`

**Archivo:** `src/app/create-tenant/page.tsx:138-150`

---

### 11. Indicaciones de Formato para RUT

**Esfuerzo:** 1h | **Componentes:** Frontend

**Mejoras:**
- FormDescription: "Ingresa sin puntos, con guión (ej: 12345678-9)"
- Placeholder mejorado
- Máscara de input opcional

**Archivo:** `src/app/create-tenant/page.tsx:42-44`

---

### 12. Eliminación de Tags (Completado ✅)

Ya implementado en commits anteriores

---

### 13. Copia Automática Suceso → Flash Report

**Estado:** ✅ Implementado

Funcionando correctamente en líneas 58-77 del archivo Flash Report create

---

## 🟢 PRIORIDAD MEDIA

### 14. Eliminar Apartado Clasificación en Flash Report

**Esfuerzo:** 2h | **Componentes:** Frontend

Revisar formulario y eliminar sección redundante con suceso+tipo

**Archivo:** `src/app/(app)/reports/flash/create/page.tsx:42-45`

---

### 15. Historial de Opciones para Responsable/Cliente

**Esfuerzo:** 4-5h | **Componentes:** Frontend

- Select con autocompletado
- LocalStorage o Backend para persistencia
- Historial de responsables y clientes usados

---

### 16-20. Otros cambios de nomenclatura en Dashboard

**Esfuerzo:** 2-3h | **Componentes:** Frontend

Cambios de textos en componentes de monitoreo y métricas

---

## 🔵 PRIORIDAD BAJA (Futuro)

### 21. Sistema de Roles y Aprobación

**Estado:** ❌ Feature futura

- Flujo multi-nivel
- Firma virtual automática
- Notificaciones

---

### 22. Sistema de Notificaciones

**Estado:** ❌ Feature futura

- Alertas de vencimiento
- Notificaciones tiempo real
- Actualización contraseña c/3 meses

---

### 23. Integración con Prodity

**Estado:** ❌ Feature futura (requiere API)

---

## 📅 PLAN DE IMPLEMENTACIÓN

### Sprint 1 (Crítico - 1 semana)
1. ✅ Nomenclatura Origix
2. ✅ Eliminar severidad "Crítica"
3. Sistema correlativo automático
4. Páginas edición reportes
5. Nomenclatura archivos descargados

### Sprint 2 (Alta - 1-2 semanas)
6. Campos faltantes formulario
7. Auto-llenado fechas
8. Copy-paste responsables
9. Comparativas anuales
10. Mejoras duplicación empresas

### Sprint 3 (Media - 1 semana)
11-16. Mejoras UX y textos

### Backlog (Futuro)
17-23. Features avanzadas

---

## 📈 MÉTRICAS DE PROGRESO

### Tiempo Estimado Total
- **Crítico:** 35-50 horas
- **Alta:** 28-40 horas
- **Media:** 10-15 horas
- **Baja:** 20-30 horas (backlog)

**Total Sprint 1-3:** 73-105 horas (~2-3 semanas)

---

## 📝 NOTAS IMPORTANTES

1. **Sistema de correlativo** es crítico para operaciones legales
2. **Comparativas anuales** requeridas por Mutual de Seguridad
3. **Páginas de edición** bloqueantes para workflow completo
4. Mantener **todos los campos editables** después de auto-llenado
5. **Copy-paste** debe aplicarse a filas específicas o todas

---

## ✅ CRITERIOS DE ACEPTACIÓN

Cada GAP implementado debe cumplir:
- [ ] Funcionalidad completa según especificación
- [ ] Tests unitarios (backend)
- [ ] Validaciones frontend y backend
- [ ] Documentación actualizada
- [ ] Sin errores de TypeScript/Go
- [ ] Responsive design
- [ ] Mensajes de error claros
- [ ] Loading states apropiados

---

**Documento generado automáticamente por análisis exhaustivo del código**
**Última actualización:** 18 de Diciembre de 2025
