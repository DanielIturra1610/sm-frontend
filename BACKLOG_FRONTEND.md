# BACKLOG FRONTEND - Sistema de Gestión de Seguridad Industrial
## Stegmaier Safety Management - Roadmap UI/UX para Competir en el Mercado Chileno

**Fecha de Creación:** 21 de Octubre, 2025
**Última Actualización:** 21 de Octubre, 2025
**Estado Actual del Proyecto:** 70% - Funcionalidades base implementadas

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Criterios de Priorización](#criterios-de-priorizacion)
3. [Épicas Principales](#epicas-principales)
4. [Backlog Detallado](#backlog-detallado)
   - [CRÍTICO - Lanzamiento MVP](#critico---lanzamiento-mvp)
   - [ALTA - Competitividad en Chile](#alta---competitividad-en-chile)
   - [MEDIA - Mejoras UX y Optimizaciones](#media---mejoras-ux-y-optimizaciones)
   - [BAJA - Futuro y Escalabilidad](#baja---futuro-y-escalabilidad)
5. [Roadmap Temporal](#roadmap-temporal)
6. [Métricas de Éxito](#metricas-de-exito)

---

## RESUMEN EJECUTIVO

### Estado Actual
- ✅ **Landing Page completa**: Hero, features, pricing (740 líneas)
- ✅ **Autenticación multi-tenant**: Login, registro, verificación
- ✅ **Dashboard base**: Métricas, gráficos, filtros
- ✅ **CRUD de incidentes**: Listado, creación, detalle
- ✅ **Análisis básicos**: Five Whys, Fishbone (estructura)
- ✅ **Árbol causal**: Visualización con ReactFlow
- ✅ **Sistema de diseño**: Tailwind + shadcn/ui
- ⚠️ **Testing**: Solo 7 archivos de test (cobertura baja)
- ⚠️ **Componentes específicos**: Muchos _components vacíos
- ❌ **Funcionalidades Chile**: No implementadas
- ❌ **PWA/Mobile**: No implementado
- ❌ **i18n**: Hardcoded en español

### Objetivo
**Crear la mejor experiencia de usuario en software de seguridad industrial en Chile** mediante:
1. Interfaces intuitivas para cumplimiento regulatorio
2. Formularios optimizados para DIAT, DIEP, IPER
3. Dashboards ejecutivos con KPIs legales
4. Mobile-first y offline support
5. Accesibilidad WCAG AA

### Competidores a Superar (UX)
- **ISL Safety**: UX anticuada, poco intuitiva
- **AURUS**: Complejo, curva de aprendizaje alta
- **SafetyCulture**: Excelente UX mobile, benchmark
- **Safetymint**: UX simple pero limitada

---

## CRITERIOS DE PRIORIZACIÓN

### Matriz de Priorización (Impacto UX vs Esfuerzo)

```
CRÍTICO = Alto Impacto UX + Bajo/Medio Esfuerzo + Bloqueante para backend
ALTA    = Alto Impacto UX + Medio Esfuerzo + Cumplimiento regulatorio
MEDIA   = Medio Impacto + Bajo/Medio Esfuerzo + Mejora de usabilidad
BAJA    = Bajo Impacto + Alto Esfuerzo + Nice to have
```

### Factores de Priorización
1. **Usabilidad y experiencia de usuario** (peso: 30%)
2. **Cumplimiento regulatorio chileno** (peso: 25%)
3. **Diferenciación competitiva** (peso: 20%)
4. **Impacto en conversión** (peso: 15%)
5. **Esfuerzo de desarrollo** (peso: 10%)

---

## ÉPICAS PRINCIPALES

### FE1: Cumplimiento Regulatorio Chileno - UI 🇨🇱
**Objetivo:** Interfaces para todas las funcionalidades legales chilenas.

**Componentes:**
- Formularios DIAT/DIEP
- Dashboard de cumplimiento legal
- Reportes regulatorios

---

### FE2: Gestión de EPP - UI
**Objetivo:** Interfaces intuitivas para gestión de EPP.

**Componentes:**
- Inventario visual
- Entrega con firma digital
- Alertas de vencimiento

---

### FE3: Matriz IPER - UI Interactiva
**Objetivo:** Herramienta visual para evaluación de riesgos.

**Componentes:**
- Canvas interactivo
- Matriz de riesgo visual
- Jerarquía de controles

---

### FE4: Capacitaciones - UI
**Objetivo:** Gestión completa de capacitaciones.

**Componentes:**
- Calendario de capacitaciones
- Registro de asistencia
- Certificados digitales

---

### FE5: Mobile & Offline
**Objetivo:** PWA con soporte offline.

**Componentes:**
- Service Workers
- Cache strategies
- Sync en background

---

### FE6: Dashboard Ejecutivo
**Objetivo:** KPIs y analytics para toma de decisiones.

**Componentes:**
- KPIs regulatorios
- Gráficos avanzados
- Exportación de reportes

---

### FE7: Inspecciones Digitales
**Objetivo:** Checklists móviles con captura de evidencia.

**Componentes:**
- Checklists interactivos
- Captura de fotos
- Firma digital

---

### FE8: UX/UI Optimizations
**Objetivo:** Mejorar usabilidad y accesibilidad.

**Componentes:**
- Loading states
- Error boundaries
- Skeleton screens
- Accesibilidad WCAG AA

---

## BACKLOG DETALLADO

---

## CRÍTICO - Lanzamiento MVP (0-3 meses)

### Historia de Usuario FE-1: Integración con Refresh Token
**Como** usuario autenticado
**Quiero** que mi sesión se renueve automáticamente
**Para** no tener que volver a iniciar sesión cada 15 minutos

**Prioridad:** CRÍTICO
**Esfuerzo:** 3 puntos (1 semana)
**Impacto:** Alto - UX esencial
**Épica:** Autenticación

**Criterios de Aceptación:**
- [ ] Interceptor de Axios que detecta token expirado (401)
- [ ] Llamada automática a `POST /auth/refresh`
- [ ] Renovación transparente del token
- [ ] Reintento de request original
- [ ] Logout automático si refresh falla
- [ ] Tests unitarios

**Tareas Técnicas:**
- Actualizar `auth-service.ts` con endpoint refresh
- Interceptor en `modular-client.ts`
- Update `auth-context.tsx` con lógica de refresh
- Tests con mocks

**Archivos a modificar:**
- `lib/api/services/auth-service.ts`
- `lib/api/modular-client.ts`
- `shared/contexts/auth-context.tsx`

**Dependencias:** Backend HU1 (Refresh Token)

---

### Historia de Usuario FE-2: Formulario DIAT Completo
**Como** prevencionista
**Quiero** llenar el formulario DIAT digitalmente
**Para** generar reporte regulatorio rápidamente

**Prioridad:** CRÍTICO
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Muy Alto - Cumplimiento legal
**Épica:** FE1 - Cumplimiento Regulatorio

**Criterios de Aceptación:**
- [ ] Formulario multi-step (wizard) con 5 pasos:
  1. Datos del trabajador
  2. Datos del empleador
  3. Datos del accidente
  4. Atención médica
  5. Revisión y envío
- [ ] Validación en tiempo real con Zod
- [ ] Autocompletado de datos desde incidente
- [ ] Validación de RUT (formato chileno)
- [ ] Guardar como borrador
- [ ] Previsualización antes de enviar
- [ ] Generación de PDF
- [ ] Descarga de PDF
- [ ] Loading states y feedback visual
- [ ] Tests unitarios y E2E

**Diseño UI:**
- Wizard con steps indicator
- Campos agrupados lógicamente
- Tooltips con ayuda contextual
- Botones: Guardar borrador, Anterior, Siguiente, Generar DIAT
- Modal de confirmación antes de generar

**Schema Zod:**
```typescript
const diatSchema = z.object({
  // Trabajador
  workerRUT: z.string().regex(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/),
  workerName: z.string().min(3),
  workerBirthDate: z.date(),
  workerGender: z.enum(['male', 'female', 'other']),
  workerAddress: z.string(),
  workerPhone: z.string(),
  workerEmail: z.string().email(),
  workerPosition: z.string(),
  workerHireDate: z.date(),

  // Empleador
  employerRUT: z.string().regex(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/),
  employerName: z.string(),
  employerAddress: z.string(),
  employerMutual: z.enum(['ACHS', 'Mutual de Seguridad', 'IST']),

  // Accidente
  accidentDate: z.date(),
  accidentTime: z.string(),
  accidentPlace: z.string(),
  accidentDescription: z.string().min(50),
  accidentType: z.enum(['trabajo', 'trayecto']),
  injuryType: z.string(),
  injuredBodyPart: z.string(),
  witnesses: z.array(z.string()),

  // Atención médica
  medicalAttention: z.boolean(),
  medicalCenter: z.string().optional(),
  medicalDiagnosis: z.string().optional(),
  estimatedLeaveDays: z.number().optional(),
})
```

**Componentes a crear:**
```
app/(app)/incidents/[id]/diat/
  page.tsx                    # Página principal
  _components/
    DIATWizard.tsx            # Wizard principal
    WorkerDataStep.tsx        # Paso 1
    EmployerDataStep.tsx      # Paso 2
    AccidentDataStep.tsx      # Paso 3
    MedicalDataStep.tsx       # Paso 4
    ReviewStep.tsx            # Paso 5
    StepIndicator.tsx         # Indicador de pasos
```

**Hooks a crear:**
```typescript
// shared/hooks/diat-hooks.ts
export function useCreateDIAT() {
  // POST /incidents/:id/diat
}

export function useDIAT(incidentId: string) {
  // GET /incidents/:id/diat
}

export function useDownloadDIAT(diatId: string) {
  // GET /incidents/:id/diat/download
}
```

**Tareas Técnicas:**
1. Schema Zod de validación
2. Service `diat-service.ts` en API client
3. Hook `useCreateDIAT()`
4. Componente Wizard con react-hook-form
5. 5 componentes de pasos
6. Lógica de navegación entre pasos
7. Preview modal
8. Download PDF
9. Tests con React Testing Library
10. Tests E2E con Cypress

**Archivos a crear:**
- `lib/validations/diat-schema.ts`
- `lib/api/services/diat-service.ts`
- `shared/hooks/diat-hooks.ts`
- `app/(app)/incidents/[id]/diat/page.tsx`
- `app/(app)/incidents/[id]/diat/_components/*.tsx`

**Dependencias:** Backend HU4 (DIAT)

---

### Historia de Usuario FE-3: Dashboard de Cumplimiento Legal
**Como** gerente de operaciones
**Quiero** ver dashboard de cumplimiento normativo
**Para** saber qué obligaciones están pendientes

**Prioridad:** CRÍTICO
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Muy Alto - Visibilidad ejecutiva
**Épica:** FE6 - Dashboard Ejecutivo

**Criterios de Aceptación:**
- [ ] KPI Cards: % cumplimiento global, obligaciones pendientes, vencimientos próximos, riesgo legal
- [ ] Tabla de obligaciones pendientes (capacitaciones, inspecciones, certificaciones)
- [ ] Timeline de vencimientos (próximos 30 días)
- [ ] Gráfico de tendencias de cumplimiento
- [ ] Filtros por tipo de obligación
- [ ] Exportación a PDF
- [ ] Actualización en tiempo real (WebSockets)
- [ ] Responsive design
- [ ] Tests

**Diseño UI:**
- Grid 2x2 de KPI cards en desktop, stack en mobile
- Tabla con badges de prioridad (crítico, alto, medio)
- Timeline horizontal con puntos de color según urgencia
- Botón de exportación prominente

**Componentes a crear:**
```
app/(app)/compliance/
  page.tsx
  _components/
    ComplianceDashboard.tsx
    ComplianceKPIs.tsx
    PendingObligations.tsx
    ComplianceTimeline.tsx
    ComplianceTrends.tsx
    ExportButton.tsx
```

**Hook:**
```typescript
export function useComplianceDashboard() {
  // GET /compliance/dashboard
  // Devuelve: kpis, pending, timeline, trends
}
```

**Tareas Técnicas:**
1. Service `compliance-service.ts`
2. Hook `useComplianceDashboard()`
3. Componentes de dashboard
4. Integración WebSockets para updates
5. Exportación PDF con jsPDF
6. Tests

**Archivos:**
- `lib/api/services/compliance-service.ts`
- `shared/hooks/compliance-hooks.ts`
- `app/(app)/compliance/*`

**Dependencias:** Backend HU19 (Dashboard Cumplimiento)

---

### Historia de Usuario FE-4: Gestión de EPP - Inventario Visual
**Como** encargado de bodega
**Quiero** ver inventario de EPP visualmente
**Para** gestionar stock fácilmente

**Prioridad:** CRÍTICO
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Alto - Gestión visual
**Épica:** FE2 - Gestión de EPP

**Criterios de Aceptación:**
- [ ] Grid de cards con EPP (imagen, nombre, stock, estado)
- [ ] Filtros: tipo, estado, stock bajo
- [ ] Búsqueda por nombre o código
- [ ] Badge visual de stock bajo (rojo)
- [ ] Badge de próximo a vencer (amarillo)
- [ ] Modal de detalle de EPP
- [ ] CRUD completo (crear, editar, eliminar)
- [ ] Upload de imagen
- [ ] Paginación
- [ ] Responsive
- [ ] Tests

**Diseño UI:**
- Cards con imagen grande, nombre, stock prominente
- Color coding: verde (ok), amarillo (bajo), rojo (crítico)
- FilterPanel colapsible en sidebar
- FAB para agregar EPP

**Componentes:**
```
app/(app)/epp/
  page.tsx
  create/page.tsx
  [id]/page.tsx
  _components/
    EPPGrid.tsx
    EPPCard.tsx
    EPPFilters.tsx
    EPPForm.tsx
    EPPDetailModal.tsx
    StockBadge.tsx
```

**Hooks:**
```typescript
export function useEPP(params) {
  // GET /epp con filtros
}

export function useCreateEPP() {
  // POST /epp
}

export function useUpdateEPP(id) {
  // PUT /epp/:id
}
```

**Schema:**
```typescript
const eppSchema = z.object({
  name: z.string().min(3),
  code: z.string(),
  type: z.enum(['helmet', 'gloves', 'boots', 'glasses', 'vest', 'other']),
  brand: z.string(),
  model: z.string(),
  size: z.string().optional(),
  certification: z.string(),
  lifespanMonths: z.number().min(1),
  supplier: z.string(),
  unitCost: z.number().min(0),
  currentStock: z.number().min(0),
  minStock: z.number().min(0),
  location: z.string(),
  image: z.string().url().optional(),
})
```

**Dependencias:** Backend HU7 (EPP CRUD)

---

### Historia de Usuario FE-5: Entrega de EPP con Firma Digital
**Como** prevencionista
**Quiero** registrar entrega de EPP con firma digital
**Para** tener trazabilidad legal

**Prioridad:** CRÍTICO
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Muy Alto - Cumplimiento legal
**Épica:** FE2 - Gestión EPP

**Criterios de Aceptación:**
- [ ] Formulario de entrega: trabajador, EPP, cantidad, fecha
- [ ] Búsqueda de trabajador por RUT o nombre
- [ ] Búsqueda de EPP disponible
- [ ] Canvas de firma digital (con touch support)
- [ ] Previsualización de acta de entrega
- [ ] Generación y descarga de PDF
- [ ] Actualización de stock automática
- [ ] Historial de entregas por trabajador
- [ ] Responsive (mobile-first)
- [ ] Tests

**Diseño UI:**
- Wizard de 3 pasos: Selección, Firma, Confirmación
- Canvas de firma con botones: Limpiar, Guardar
- PDF preview en modal antes de confirmar

**Componentes:**
```
app/(app)/epp/deliveries/
  page.tsx                    # Listado de entregas
  create/page.tsx             # Nueva entrega
  [id]/page.tsx               # Detalle de entrega
  _components/
    DeliveryForm.tsx
    WorkerSelector.tsx
    EPPSelector.tsx
    SignatureCanvas.tsx       # Canvas de firma
    DeliveryPreview.tsx
    DeliveryHistory.tsx
```

**Librería de firma:**
```bash
pnpm add react-signature-canvas
```

**Hook:**
```typescript
export function useCreateEPPDelivery() {
  // POST /epp/deliveries
  // Incluye base64 de firma
}
```

**Schema:**
```typescript
const eppDeliverySchema = z.object({
  workerId: z.string().uuid(),
  eppId: z.string().uuid(),
  quantity: z.number().min(1),
  deliveryDate: z.date(),
  expectedReturnDate: z.date().optional(),
  notes: z.string().optional(),
  signature: z.string(), // base64
})
```

**Dependencias:**
- Backend HU8 (Entrega EPP)
- FE-4 (Inventario EPP)

---

### Historia de Usuario FE-6: Matriz IPER Interactiva
**Como** prevencionista
**Quiero** crear matriz IPER visualmente
**Para** evaluar riesgos de forma intuitiva

**Prioridad:** CRÍTICO
**Esfuerzo:** 21 puntos (5 semanas)
**Impacto:** Muy Alto - Core de seguridad
**Épica:** FE3 - Matriz IPER

**Criterios de Aceptación:**
- [ ] CRUD de matrices IPER
- [ ] Tabla interactiva de peligros
- [ ] Modal para agregar/editar peligro
- [ ] Calculadora visual de riesgo (Probabilidad x Consecuencia)
- [ ] Matriz de riesgo 5x5 con color coding
- [ ] Gestión de medidas de control con jerarquía visual
- [ ] Filtros por nivel de riesgo
- [ ] Exportación a PDF (formato regulatorio)
- [ ] Generación de plan de acción desde controles
- [ ] Responsive
- [ ] Tests

**Diseño UI:**
- Lista de peligros con expandible para ver controles
- Matriz 5x5 visual (eje X: Probabilidad, eje Y: Consecuencia)
- Color coding: Verde (bajo), Amarillo (medio), Naranja (alto), Rojo (crítico)
- Drag & drop para jerarquía de controles

**Componentes:**
```
app/(app)/iper/
  page.tsx                    # Listado de IPERs
  create/page.tsx             # Crear IPER
  [id]/page.tsx               # Editar/Ver IPER
  _components/
    IPERForm.tsx
    HazardTable.tsx           # Tabla de peligros
    HazardModal.tsx           # Modal agregar/editar peligro
    RiskCalculator.tsx        # Calculadora visual
    RiskMatrix.tsx            # Matriz 5x5 visual
    ControlMeasures.tsx       # Gestión de controles
    ControlHierarchy.tsx      # Jerarquía de controles
    IPERReport.tsx            # Vista previa de reporte
```

**Hook:**
```typescript
export function useIPER(params) {
  // GET /iper
}

export function useCreateIPER() {
  // POST /iper
}

export function useAddHazard(iperId: string) {
  // POST /iper/:id/hazards
}
```

**Schema:**
```typescript
const hazardSchema = z.object({
  description: z.string().min(10),
  type: z.enum(['mechanical', 'chemical', 'physical', 'biological', 'ergonomic', 'psychosocial']),
  activityDescription: z.string(),
  workers: z.array(z.string()),
  frequency: z.enum(['rare', 'unlikely', 'moderate', 'likely', 'certain']),
  probabilityBefore: z.number().min(1).max(5),
  consequenceBefore: z.number().min(1).max(5),
  controlMeasures: z.array(controlMeasureSchema),
  probabilityAfter: z.number().min(1).max(5),
  consequenceAfter: z.number().min(1).max(5),
})

const controlMeasureSchema = z.object({
  type: z.enum(['elimination', 'substitution', 'engineering', 'administrative', 'epp']),
  description: z.string(),
  responsiblePerson: z.string(),
  deadline: z.date(),
  status: z.enum(['pending', 'in_progress', 'completed']),
})
```

**Cálculo de Riesgo:**
```typescript
function calculateRiskLevel(probability: number, consequence: number): 'low' | 'medium' | 'high' | 'critical' {
  const risk = probability * consequence
  if (risk <= 4) return 'low'
  if (risk <= 9) return 'medium'
  if (risk <= 16) return 'high'
  return 'critical'
}
```

**Dependencias:** Backend HU9 (Matriz IPER)

---

### Historia de Usuario FE-7: Gestión de Capacitaciones - Calendario
**Como** jefe de RRHH
**Quiero** ver calendario de capacitaciones
**Para** programar y gestionar sesiones

**Prioridad:** CRÍTICO
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Alto - Cumplimiento legal
**Épica:** FE4 - Capacitaciones

**Criterios de Aceptación:**
- [ ] Calendario mensual con capacitaciones programadas
- [ ] Vista de lista y vista de calendario
- [ ] Crear nueva sesión de capacitación
- [ ] Registro de asistencia con firma digital
- [ ] Registro de evaluaciones
- [ ] Generación de certificados en PDF
- [ ] Alertas de capacitaciones obligatorias pendientes
- [ ] Historial de capacitaciones por trabajador
- [ ] Responsive
- [ ] Tests

**Diseño UI:**
- Calendario full-featured (FullCalendar.js)
- Modal de creación rápida
- Vista detalle de sesión con lista de participantes
- Badge de asistencia (presente, ausente, tarde)

**Librería:**
```bash
pnpm add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
```

**Componentes:**
```
app/(app)/trainings/
  page.tsx                    # Calendario + Lista
  create/page.tsx             # Crear capacitación
  sessions/
    [id]/page.tsx             # Detalle de sesión
    [id]/attendance/page.tsx  # Registro asistencia
    [id]/evaluation/page.tsx  # Registro evaluación
  _components/
    TrainingCalendar.tsx
    SessionModal.tsx
    AttendanceList.tsx
    EvaluationForm.tsx
    CertificateGenerator.tsx
    TrainingAlerts.tsx
```

**Hooks:**
```typescript
export function useTrainingSessions(params) {
  // GET /trainings/sessions
}

export function useRegisterAttendance(sessionId: string) {
  // POST /trainings/sessions/:id/attendance
}

export function useGenerateCertificate(data) {
  // POST /trainings/certificates/generate
}
```

**Schema:**
```typescript
const trainingSessionSchema = z.object({
  trainingId: z.string().uuid(),
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  instructorName: z.string(),
  capacity: z.number().min(1),
  materials: z.array(z.string()),
})
```

**Dependencias:** Backend HU10 (Capacitaciones)

---

### Historia de Usuario FE-8: Notificaciones en Tiempo Real (WebSockets)
**Como** usuario autenticado
**Quiero** recibir notificaciones en tiempo real
**Para** estar al tanto de eventos importantes

**Prioridad:** CRÍTICO
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Alto - UX moderna
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Conexión WebSocket automática al autenticarse
- [ ] Reconexión automática si se pierde conexión
- [ ] Toast notifications con Sonner
- [ ] Badge de notificaciones no leídas en Navbar
- [ ] Centro de notificaciones (dropdown)
- [ ] Marcar como leída
- [ ] Marcar todas como leídas
- [ ] Filtros: tipo, leídas/no leídas
- [ ] Navegación a entidad relacionada al hacer click
- [ ] Sonido/vibración opcional
- [ ] Tests

**Diseño UI:**
- Bell icon en Navbar con badge de contador
- Dropdown con lista de notificaciones
- Toast en esquina inferior derecha
- Notificación con título, mensaje, timestamp, botón de acción

**Componentes:**
```
shared/components/notifications/
  NotificationProvider.tsx    # Context con WebSocket
  NotificationBell.tsx        # Icon con badge
  NotificationDropdown.tsx    # Dropdown de notificaciones
  NotificationItem.tsx        # Item individual
  NotificationToast.tsx       # Toast customizado
```

**Hook:**
```typescript
export function useNotifications() {
  // Context hook
  // Devuelve: notifications[], markAsRead(), markAllAsRead()
}

export function useWebSocket() {
  // Manejo de conexión WS
  // Auto-reconnect, heartbeat
}
```

**WebSocket Events:**
```typescript
type NotificationEvent = {
  type: 'incident_created' | 'workflow_assigned' | 'document_ready' | 'training_reminder' | 'epp_low_stock' | 'compliance_alert'
  title: string
  message: string
  entityType: string
  entityId: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
}
```

**Tareas Técnicas:**
1. WebSocket client en `lib/api/websocket-client.ts`
2. NotificationProvider con Context
3. Componentes UI
4. Integración con Sonner
5. Persistencia de estado (leídas/no leídas)
6. Tests con mocks

**Dependencias:** Backend HU6 (WebSockets)

---

### Historia de Usuario FE-9: Mejorar Testing - Cobertura 80%
**Como** desarrollador
**Quiero** aumentar cobertura de tests a 80%
**Para** garantizar calidad del código

**Prioridad:** CRÍTICO
**Esfuerzo:** 21 puntos (5 semanas)
**Impacto:** Alto - Calidad
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Cobertura de tests: 80% (branches, functions, lines, statements)
- [ ] Tests unitarios para todos los componentes compartidos
- [ ] Tests unitarios para todos los hooks
- [ ] Tests E2E para flujos críticos (login, crear incidente, DIAT)
- [ ] Tests de accesibilidad con jest-axe
- [ ] CI/CD con GitHub Actions
- [ ] Pre-commit hooks con Husky

**Tests a Crear:**
```
Componentes UI (20 tests):
- Button.test.tsx
- Input.test.tsx
- Form.test.tsx
- Card.test.tsx
- Badge.test.tsx
- Dialog.test.tsx
- Select.test.tsx
- (13 componentes más)

Componentes Dashboard (6 tests):
- DashboardFilters.test.tsx
- DashboardMetrics.test.tsx
- IncidentTrendsChart.test.tsx
- SeverityDistributionChart.test.tsx
- KPICard.test.tsx
- IncidentCard.test.tsx

Hooks (9 tests):
- use-api.test.ts
- use-auth.test.ts
- use-tenant.test.ts
- incident-hooks.test.ts
- analysis-hooks.test.ts
- document-hooks.test.ts
- workflow-hooks.test.ts
- causal-tree-hooks.test.ts
- compliance-hooks.test.ts

E2E Cypress (10 tests):
- auth.cy.ts
- incidents.cy.ts
- diat.cy.ts
- epp.cy.ts
- iper.cy.ts
- trainings.cy.ts
- dashboard.cy.ts
- compliance.cy.ts
- inspections.cy.ts
- workflows.cy.ts
```

**Configuración:**
```bash
# Instalar dependencias
pnpm add -D jest-axe husky lint-staged

# Setup Husky
npx husky install
npx husky add .husky/pre-commit "pnpm lint && pnpm test:ci"
```

**Scripts package.json:**
```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e": "cypress open",
    "test:e2e:ci": "cypress run"
  }
}
```

**Dependencias:** Ninguna

---

### Historia de Usuario FE-10: Refactorizar Landing Page (740 líneas)
**Como** desarrollador
**Quiero** refactorizar landing page en componentes más pequeños
**Para** mejorar mantenibilidad

**Prioridad:** CRÍTICO
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Medio - Mantenibilidad
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Separar landing page en componentes atómicos
- [ ] Cada sección en su propio componente
- [ ] Máximo 100 líneas por componente
- [ ] Props tipados con TypeScript
- [ ] Tests para cada componente
- [ ] Sin cambios visuales

**Componentes a crear:**
```
app/(landing)/_components/
  Navbar.tsx
  Hero.tsx
  Features.tsx
  FeatureCard.tsx
  Stats.tsx
  StatCard.tsx
  Testimonials.tsx
  TestimonialCard.tsx
  Integrations.tsx
  Pricing.tsx
  PricingCard.tsx
  FAQ.tsx
  FAQItem.tsx
  Footer.tsx
  CTA.tsx
```

**Tareas Técnicas:**
1. Identificar secciones de page.tsx (740 líneas)
2. Extraer cada sección a componente
3. Definir props e interfaces
4. Tests unitarios para cada componente
5. Refactorizar page.tsx para usar componentes
6. Verificar que no hay regresión visual

**Dependencias:** Ninguna

---

## ALTA - Competitividad en Chile (3-6 meses)

### Historia de Usuario FE-11: Formulario DIEP
**Como** prevencionista
**Quiero** formulario DIEP digital
**Para** reportar enfermedades profesionales

**Prioridad:** ALTA
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Alto - Cumplimiento legal
**Épica:** FE1 - Cumplimiento Regulatorio

**Criterios de Aceptación:**
- Similar a FE-2 (DIAT) pero con campos de enfermedad profesional
- Wizard multi-step
- Validación Zod
- PDF generation

**Dependencias:** Backend HU11 (DIEP), FE-2 (DIAT)

---

### Historia de Usuario FE-12: Inspecciones con Checklists Digitales
**Como** supervisor
**Quiero** realizar inspecciones con checklist digital
**Para** detectar condiciones inseguras

**Prioridad:** ALTA
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Alto - Mejora continua
**Épica:** FE7 - Inspecciones Digitales

**Criterios de Aceptación:**
- [ ] Selección de checklist (catálogo)
- [ ] Responder preguntas secuencialmente
- [ ] Captura de fotos (evidencia)
- [ ] Geolocalización automática
- [ ] Clasificación de hallazgos (crítico, alto, medio, bajo)
- [ ] Generación automática de plan de acción
- [ ] Firma digital de inspector
- [ ] PDF de reporte
- [ ] Modo offline (PWA)
- [ ] Tests

**Diseño UI:**
- Mobile-first (uso en terreno)
- Swipe entre preguntas
- Captura de foto con cámara nativa
- Botón flotante para agregar hallazgo

**Componentes:**
```
app/(app)/inspections/
  page.tsx                    # Lista de inspecciones
  create/page.tsx             # Seleccionar checklist
  [id]/page.tsx               # Realizar inspección
  _components/
    ChecklistSelector.tsx
    InspectionProgress.tsx    # Barra de progreso
    QuestionCard.tsx          # Pregunta individual
    PhotoCapture.tsx          # Captura de foto
    FindingForm.tsx           # Formulario de hallazgo
    ActionPlanGenerator.tsx   # Plan de acción automático
```

**Hooks:**
```typescript
export function useInspection(id: string) {
  // GET /inspections/:id con offline support
}

export function useCreateInspection() {
  // POST /inspections con queue si offline
}

export function useUploadPhoto() {
  // POST a S3 con presigned URL
}
```

**PWA:**
- Service Worker para cache de checklists
- IndexedDB para guardar inspecciones offline
- Background sync al recuperar conexión

**Dependencias:** Backend HU14 (Inspecciones)

---

### Historia de Usuario FE-13: CPHS - Gestión de Comité Paritario
**Como** presidente del CPHS
**Quiero** gestionar comité digitalmente
**Para** cumplir con DS 54

**Prioridad:** ALTA
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Alto - Cumplimiento legal
**Épica:** FE1 - Cumplimiento Regulatorio

**Criterios de Aceptación:**
- [ ] CRUD de CPHS
- [ ] Gestión de miembros
- [ ] Programar reuniones
- [ ] Crear actas de reuniones
- [ ] Seguimiento de acuerdos
- [ ] Dashboard de estadísticas de incidentes para reunión
- [ ] Generación de acta en PDF
- [ ] Calendario de reuniones
- [ ] Tests

**Componentes:**
```
app/(app)/cphs/
  page.tsx                    # Lista de CPHS
  [id]/page.tsx               # Detalle de CPHS
  [id]/meetings/
    page.tsx                  # Lista de reuniones
    create/page.tsx           # Programar reunión
    [meetingId]/page.tsx      # Detalle de reunión
    [meetingId]/acta/page.tsx # Crear acta
  _components/
    CPHSForm.tsx
    MemberManager.tsx
    MeetingCalendar.tsx
    ActaEditor.tsx
    AgreementTracker.tsx
    CPHSStats.tsx
```

**Dependencias:** Backend HU13 (CPHS)

---

### Historia de Usuario FE-14: Protocolo PREXOR UI
**Como** prevencionista
**Quiero** interfaz para protocolo PREXOR
**Para** gestionar vigilancia de exposición a ruido

**Prioridad:** ALTA
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Alto - Cumplimiento MINSAL
**Épica:** FE1 - Cumplimiento Regulatorio

**Criterios de Aceptación:**
- [ ] Formulario de evaluación PREXOR
- [ ] Registro de mediciones de ruido
- [ ] Clasificación automática de exposición
- [ ] Programa de vigilancia médica
- [ ] Registro de audiometrías
- [ ] Dashboard de trabajadores expuestos
- [ ] Alertas de exámenes próximos
- [ ] Reporte de cumplimiento
- [ ] Tests

**Componentes:**
```
app/(app)/protocols/prexor/
  page.tsx                    # Dashboard PREXOR
  workers/page.tsx            # Trabajadores expuestos
  assessments/
    create/page.tsx           # Nueva evaluación
    [id]/page.tsx             # Detalle evaluación
  _components/
    PREXORForm.tsx
    NoiseMeasurement.tsx
    AudiologySchedule.tsx
    ExposureClassification.tsx
    PREXORDashboard.tsx
```

**Dependencias:** Backend HU15 (PREXOR)

---

### Historia de Usuario FE-15: Protocolo TMERT UI
**Como** prevencionista
**Quiero** interfaz para TMERT
**Para** prevenir trastornos musculoesqueléticos

**Prioridad:** ALTA
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Alto - Cumplimiento MINSAL
**Épica:** FE1 - Cumplimiento Regulatorio

**Criterios de Aceptación:**
- Similar a FE-14 pero para TMERT
- Evaluación de puestos de trabajo
- Identificación de factores de riesgo
- Clasificación de riesgo (verde, amarillo, rojo)

**Dependencias:** Backend HU16 (TMERT)

---

### Historia de Usuario FE-16: Protocolo ISTAS 21 - Cuestionario Digital
**Como** psicólogo organizacional
**Quiero** aplicar cuestionario ISTAS 21 digitalmente
**Para** evaluar riesgos psicosociales

**Prioridad:** ALTA
**Esfuerzo:** 21 puntos (5 semanas)
**Impacto:** Alto - Cumplimiento Ley 20.996
**Épica:** FE1 - Cumplimiento Regulatorio

**Criterios de Aceptación:**
- [ ] Cuestionario digital (anónimo o identificado)
- [ ] 20 preguntas con escala Likert
- [ ] Cálculo automático de dimensiones
- [ ] Dashboard de resultados
- [ ] Gráficos radar por dimensión
- [ ] Comparación histórica
- [ ] Generación de informe PDF
- [ ] Plan de intervención
- [ ] Tests

**Componentes:**
```
app/(app)/protocols/istas21/
  page.tsx                    # Dashboard ISTAS 21
  survey/
    page.tsx                  # Aplicar cuestionario
  results/
    [surveyId]/page.tsx       # Resultados
  _components/
    ISTAS21Survey.tsx         # Cuestionario
    DimensionChart.tsx        # Gráfico radar
    ResultsDashboard.tsx
    InterventionPlan.tsx
```

**Librería:**
```bash
pnpm add recharts  # Ya instalado
```

**Dependencias:** Backend HU17 (ISTAS 21)

---

### Historia de Usuario FE-17: Planes de Emergencia y Simulacros
**Como** jefe de emergencias
**Quiero** gestionar planes de emergencia
**Para** estar preparado ante crisis

**Prioridad:** ALTA
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Alto - Preparación
**Épica:** FE1 - Cumplimiento Regulatorio

**Criterios de Aceptación:**
- [ ] CRUD de planes de emergencia
- [ ] Mapas de evacuación (upload imagen)
- [ ] Gestión de brigadas
- [ ] Programar simulacros
- [ ] Evaluación de simulacros
- [ ] Reporte de simulacro en PDF
- [ ] Checklist de preparación
- [ ] Tests

**Componentes:**
```
app/(app)/emergency-plans/
  page.tsx
  create/page.tsx
  [id]/page.tsx
  [id]/drills/
    create/page.tsx
    [drillId]/evaluate/page.tsx
  _components/
    EmergencyPlanForm.tsx
    EvacuationMap.tsx
    BrigadeManager.tsx
    DrillScheduler.tsx
    DrillEvaluation.tsx
```

**Dependencias:** Backend HU18 (Planes Emergencia)

---

### Historia de Usuario FE-18: PWA - Progressive Web App
**Como** usuario móvil
**Quiero** instalar app en mi dispositivo
**Para** usarla como app nativa

**Prioridad:** ALTA
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Muy Alto - UX mobile
**Épica:** FE5 - Mobile & Offline

**Criterios de Aceptación:**
- [ ] Manifest.json con icons
- [ ] Service Worker con cache strategies
- [ ] Offline support para páginas críticas
- [ ] Background sync para crear incidentes/inspecciones
- [ ] Push notifications (opcional)
- [ ] Installable en iOS y Android
- [ ] Splash screen
- [ ] Tests

**Tareas Técnicas:**
1. Crear manifest.json con metadata
2. Generar iconos (512x512, 192x192, etc.)
3. Service Worker con Workbox
4. Cache strategies:
   - Network-first: API calls
   - Cache-first: Assets estáticos
   - Stale-while-revalidate: Imágenes
5. IndexedDB para storage offline
6. Background Sync API
7. Tests con Cypress

**Archivos:**
```
public/
  manifest.json
  icons/
    icon-192x192.png
    icon-512x512.png
  sw.js                       # Service Worker

app/
  layout.tsx                  # Link a manifest
```

**Librería:**
```bash
pnpm add next-pwa
```

**next.config.ts:**
```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // ...config
})
```

**Dependencias:** Ninguna

---

### Historia de Usuario FE-19: Dark Mode Completo
**Como** usuario
**Quiero** modo oscuro
**Para** reducir fatiga visual

**Prioridad:** ALTA
**Esfuerzo:** 5 puntos (1 semana)
**Impacto:** Medio - UX
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Toggle dark/light mode en Navbar
- [ ] Persistencia de preferencia
- [ ] Todos los componentes soportan dark mode
- [ ] Transición suave entre modos
- [ ] Respeto de preferencia del sistema
- [ ] Tests

**Tareas Técnicas:**
- Ya tienes `next-themes` instalado
- Configurar provider en layout.tsx
- Agregar clases dark: en Tailwind
- Componente ThemeToggle

**Archivos:**
```
shared/components/ui/
  theme-toggle.tsx

app/layout.tsx                # Wrap con ThemeProvider
```

**Dependencias:** Ninguna

---

### Historia de Usuario FE-20: Exportación de Reportes Ejecutivos
**Como** gerente
**Quiero** exportar reportes a PDF/Excel
**Para** compartir con stakeholders

**Prioridad:** ALTA
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Medio - Utilidad
**Épica:** FE6 - Dashboard Ejecutivo

**Criterios de Aceptación:**
- [ ] Exportar dashboard de cumplimiento a PDF
- [ ] Exportar listado de incidentes a Excel
- [ ] Exportar matriz IPER a PDF
- [ ] Exportar capacitaciones a Excel
- [ ] Exportar EPP a Excel
- [ ] Botón de exportación en cada módulo
- [ ] Loading state durante exportación
- [ ] Tests

**Librerías:**
```bash
pnpm add jspdf jspdf-autotable xlsx
```

**Componentes:**
```
shared/components/export/
  ExportButton.tsx
  PDFExporter.tsx
  ExcelExporter.tsx
```

**Hooks:**
```typescript
export function useExportPDF(data, template) {
  // Genera PDF con jsPDF
}

export function useExportExcel(data, filename) {
  // Genera Excel con xlsx
}
```

**Dependencias:** Backend opcional (puede ser client-side)

---

## MEDIA - Mejoras UX y Optimizaciones (6-12 meses)

### Historia de Usuario FE-21: Internacionalización (i18n)
**Como** empresa multinacional
**Quiero** app en varios idiomas
**Para** estandarizar procesos

**Prioridad:** MEDIA
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Medio - Internacionalización
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Soporte para ES (Chile), EN, PT (Brasil)
- [ ] Selector de idioma en Navbar
- [ ] Persistencia de preferencia
- [ ] Todos los strings traducidos
- [ ] Fechas y números formateados según locale
- [ ] Tests

**Librería:**
```bash
pnpm add next-intl
```

**Estructura:**
```
messages/
  es-CL.json
  en-US.json
  pt-BR.json

middleware.ts                 # Locale detection
```

**Dependencias:** Backend HU31 (i18n)

---

### Historia de Usuario FE-22: Storybook para Documentación
**Como** desarrollador
**Quiero** Storybook para componentes
**Para** documentar y desarrollar aisladamente

**Prioridad:** MEDIA
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Medio - DX (Developer Experience)
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Storybook instalado y configurado
- [ ] Stories para todos los componentes UI
- [ ] Stories para componentes de dashboard
- [ ] Documentación de props
- [ ] Ejemplos de uso
- [ ] Accessibility addon
- [ ] Tests visuales con Chromatic (opcional)

**Instalación:**
```bash
npx storybook@latest init
```

**Estructura:**
```
.storybook/
  main.ts
  preview.ts

shared/components/ui/
  button.stories.tsx
  input.stories.tsx
  (todos los componentes)
```

**Dependencias:** Ninguna

---

### Historia de Usuario FE-23: Mejoras de Accesibilidad (WCAG AA)
**Como** usuario con discapacidad
**Quiero** app accesible
**Para** poder usarla sin barreras

**Prioridad:** MEDIA
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Alto - Inclusión
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Contraste de colores WCAG AA (4.5:1)
- [ ] Navegación completa por teclado
- [ ] ARIA labels en todos los elementos interactivos
- [ ] Focus visible en todos los elementos
- [ ] Screen reader compatible
- [ ] Skip to main content
- [ ] Error messages descriptivos
- [ ] Tests con jest-axe
- [ ] Auditoría con Lighthouse (90+)

**Herramientas:**
```bash
pnpm add -D jest-axe @axe-core/react
```

**Tareas Técnicas:**
1. Auditoría inicial con Lighthouse
2. Fix de issues de contraste
3. Agregar ARIA labels faltantes
4. Implementar focus management
5. Tests automatizados con jest-axe
6. Documentar guías de accesibilidad

**Dependencias:** Ninguna

---

### Historia de Usuario FE-24: Performance Optimization
**Como** usuario
**Quiero** app rápida y fluida
**Para** trabajar eficientemente

**Prioridad:** MEDIA
**Esfuerzo:** 13 puntos (3 semanas)
**Impacto:** Alto - UX
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Lighthouse Performance: 90+
- [ ] First Contentful Paint: <1.5s
- [ ] Time to Interactive: <3s
- [ ] Cumulative Layout Shift: <0.1
- [ ] Code splitting por ruta
- [ ] Lazy loading de componentes pesados
- [ ] Optimización de imágenes (next/image)
- [ ] Prefetching de rutas
- [ ] Bundle size: <500kb
- [ ] Tests de performance

**Tareas Técnicas:**
1. Análisis con Next.js Bundle Analyzer
2. Code splitting de componentes grandes
3. React.lazy() para componentes pesados
4. Optimización de imágenes
5. Memoization con useMemo/useCallback
6. Virtualización de listas largas (react-window)
7. Tests de performance con Lighthouse CI

**Librerías:**
```bash
pnpm add -D @next/bundle-analyzer react-window
```

**Dependencias:** Ninguna

---

### Historia de Usuario FE-25: Error Boundaries y Error Handling
**Como** desarrollador
**Quiero** manejo robusto de errores
**Para** evitar crashes de la app

**Prioridad:** MEDIA
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Alto - Estabilidad
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Error Boundary global en layout.tsx
- [ ] Error Boundaries por sección
- [ ] Página de error customizada
- [ ] Logging de errores a Sentry (opcional)
- [ ] Retry automático en errores de red
- [ ] Mensajes de error user-friendly
- [ ] Tests

**Componentes:**
```
shared/components/errors/
  ErrorBoundary.tsx
  ErrorFallback.tsx
  NetworkError.tsx
  NotFound.tsx
```

**Librerías:**
```bash
pnpm add @sentry/nextjs  # Opcional
```

**Dependencias:** Ninguna

---

### Historia de Usuario FE-26: Skeleton Loaders
**Como** usuario
**Quiero** ver loaders elegantes
**Para** percibir mejor performance

**Prioridad:** MEDIA
**Esfuerzo:** 5 puntos (1 semana)
**Impacto:** Medio - UX
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Skeleton loaders para todas las páginas principales
- [ ] Skeleton para cards, tablas, forms
- [ ] Animación suave
- [ ] Coherencia visual
- [ ] Tests

**Componentes:**
```
shared/components/ui/
  skeleton.tsx               # Ya existe

shared/components/skeletons/
  DashboardSkeleton.tsx
  TableSkeleton.tsx
  FormSkeleton.tsx
  CardSkeleton.tsx
```

**Dependencias:** Ninguna

---

### Historia de Usuario FE-27: Animaciones y Transiciones
**Como** usuario
**Quiero** animaciones suaves
**Para** mejor experiencia visual

**Prioridad:** MEDIA
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Medio - UX
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Transiciones de página con Framer Motion
- [ ] Animaciones de modal/dialog
- [ ] Animaciones de lista (stagger)
- [ ] Animaciones de hover
- [ ] Respeto de prefers-reduced-motion
- [ ] Tests

**Librería:**
```bash
pnpm add framer-motion
```

**Componentes:**
```
shared/components/animations/
  PageTransition.tsx
  FadeIn.tsx
  SlideIn.tsx
  StaggerList.tsx
```

**Dependencias:** Ninguna

---

### Historia de Usuario FE-28: Dashboard Personalizable
**Como** usuario
**Quiero** personalizar mi dashboard
**Para** ver métricas relevantes para mí

**Prioridad:** MEDIA
**Esfuerzo:** 21 puntos (5 semanas)
**Impacto:** Alto - Personalización
**Épica:** FE6 - Dashboard Ejecutivo

**Criterios de Aceptación:**
- [ ] Drag & drop de widgets
- [ ] Agregar/remover widgets
- [ ] Resize de widgets
- [ ] Guardar configuración por usuario
- [ ] Templates predefinidos (Gerente, Prevencionista, etc.)
- [ ] Tests

**Librería:**
```bash
pnpm add react-grid-layout
```

**Dependencias:** Backend para persistencia de config

---

### Historia de Usuario FE-29: Chat de Soporte en Vivo
**Como** usuario
**Quiero** chat de soporte
**Para** resolver dudas rápidamente

**Prioridad:** MEDIA
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Medio - Soporte
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Widget de chat en esquina inferior derecha
- [ ] Integración con Intercom/Crisp/Tawk.to
- [ ] Notificaciones de nuevos mensajes
- [ ] Historial de conversaciones
- [ ] Attachment de archivos

**Librería:**
```bash
pnpm add @intercom/messenger-js-sdk
```

**Dependencias:** Cuenta en proveedor de chat

---

### Historia de Usuario FE-30: Tour Guiado (Onboarding)
**Como** nuevo usuario
**Quiero** tour guiado de la app
**Para** aprender a usarla rápidamente

**Prioridad:** MEDIA
**Esfuerzo:** 8 puntos (2 semanas)
**Impacto:** Alto - Onboarding
**Épica:** FE8 - UX Optimizations

**Criterios de Aceptación:**
- [ ] Tour interactivo para nuevos usuarios
- [ ] Highlights de features principales
- [ ] Skip tour
- [ ] Re-iniciar tour desde settings
- [ ] Tests

**Librería:**
```bash
pnpm add react-joyride
```

**Componentes:**
```
shared/components/onboarding/
  ProductTour.tsx
  TourStep.tsx
```

**Dependencias:** Ninguna

---

## BAJA - Futuro y Escalabilidad (12+ meses)

### Historia de Usuario FE-31: App Móvil Nativa (React Native)
**Como** trabajador de terreno
**Quiero** app móvil nativa
**Para** mejor performance que PWA

**Prioridad:** BAJA
**Esfuerzo:** 55 puntos (12 semanas)
**Impacto:** Alto - Mobile
**Épica:** FE5 - Mobile & Offline

**Criterios de Aceptación:**
- [ ] App iOS y Android
- [ ] Compartir código con web (shared logic)
- [ ] Modo offline completo
- [ ] GPS nativo
- [ ] Cámara nativa
- [ ] Push notifications nativas
- [ ] Firma digital con touch

**Stack:**
- React Native
- Expo
- Shared hooks y lógica con web

**Dependencias:** Backend completo

---

### Historia de Usuario FE-32: AI Assistant para Análisis de Riesgos
**Como** prevencionista
**Quiero** asistente IA
**Para** sugerencias de medidas de control

**Prioridad:** BAJA
**Esfuerzo:** 34 puntos (8 semanas)
**Impacto:** Alto - Innovación
**Épica:** Nueva - AI

**Criterios de Aceptación:**
- [ ] Chat con IA para consultas de seguridad
- [ ] Sugerencias de controles basadas en peligro
- [ ] Generación de descripciones de incidentes
- [ ] Análisis predictivo de riesgos

**Librería:**
```bash
pnpm add openai
```

**Dependencias:** Backend HU37 (ML), API OpenAI

---

### Historia de Usuario FE-33: Realidad Aumentada para Inspecciones
**Como** inspector
**Quiero** AR para anotar sobre espacios físicos
**Para** documentar hallazgos visualmente

**Prioridad:** BAJA
**Esfuerzo:** 55 puntos (12 semanas)
**Impacto:** Medio - Innovación
**Épica:** Nueva - AR/VR

**Criterios de Aceptación:**
- [ ] Usar cámara para AR
- [ ] Anotar sobre espacios físicos
- [ ] Guardar anotaciones 3D
- [ ] Visualizar anotaciones históricas

**Stack:**
- AR.js o WebXR

**Dependencias:** App móvil nativa

---

### Historia de Usuario FE-34: Dashboards con BI (Business Intelligence)
**Como** analista
**Quiero** herramientas BI avanzadas
**Para** análisis profundos

**Prioridad:** BAJA
**Esfuerzo:** 34 puntos (8 semanas)
**Impacto:** Alto - Analytics
**Épica:** FE6 - Dashboard Ejecutivo

**Criterios de Aceptación:**
- [ ] Integración con Metabase/Superset
- [ ] Dashboards embebidos
- [ ] SQL query builder
- [ ] Reportes programados

**Dependencias:** Backend, herramienta BI

---

### Historia de Usuario FE-35: Voice Commands
**Como** usuario ocupado
**Quiero** controles por voz
**Para** manos libres

**Prioridad:** BAJA
**Esfuerzo:** 21 puntos (5 semanas)
**Impacto:** Bajo - Innovación
**Épica:** Nueva - Voice

**Criterios de Aceptación:**
- [ ] "Crear incidente"
- [ ] "Buscar trabajador Juan Pérez"
- [ ] "Mostrar dashboard"
- [ ] Web Speech API

**Dependencias:** Ninguna

---

## ROADMAP TEMPORAL

### Sprint 0-3 meses (MVP - Lanzamiento Crítico)
**Objetivo:** UI completa para funcionalidades críticas del backend

**Historias:**
- FE-1: Refresh Token Integration ✅
- FE-2: Formulario DIAT ✅
- FE-3: Dashboard Cumplimiento ✅
- FE-4: Gestión EPP - Inventario ✅
- FE-5: Entrega EPP con Firma Digital ✅
- FE-6: Matriz IPER Interactiva ✅
- FE-7: Capacitaciones - Calendario ✅
- FE-8: Notificaciones WebSocket ✅
- FE-9: Testing - 80% Cobertura ✅
- FE-10: Refactor Landing Page ✅

**Resultado esperado:**
- UI completa para MVP
- Testing robusto
- UX pulida

---

### Sprint 3-6 meses (Alta Competitividad)
**Objetivo:** Interfaces para protocolos MINSAL y funcionalidades avanzadas

**Historias:**
- FE-11: Formulario DIEP
- FE-12: Inspecciones Digitales
- FE-13: CPHS
- FE-14: Protocolo PREXOR
- FE-15: Protocolo TMERT
- FE-16: Protocolo ISTAS 21
- FE-17: Planes de Emergencia
- FE-18: PWA
- FE-19: Dark Mode
- FE-20: Exportación Reportes

**Resultado esperado:**
- UI completa para cumplimiento chileno
- PWA funcional
- Exportación de reportes

---

### Sprint 6-12 meses (Optimización UX)
**Objetivo:** Pulir UX y agregar mejoras de usabilidad

**Historias:**
- FE-21 a FE-30: i18n, Storybook, Accesibilidad, Performance, Error Handling, Animaciones, Dashboard Personalizable, Chat, Tour

**Resultado esperado:**
- UX clase mundial
- App accesible y performante
- Onboarding efectivo

---

### Sprint 12+ meses (Innovación)
**Objetivo:** Innovación con tecnologías emergentes

**Historias:**
- FE-31 a FE-35: App Nativa, AI Assistant, AR, BI, Voice Commands

**Resultado esperado:**
- Diferenciación radical
- Innovación tecnológica

---

## MÉTRICAS DE ÉXITO

### Métricas de UX
- **Lighthouse Performance:** 90+
- **Lighthouse Accessibility:** 95+
- **Lighthouse Best Practices:** 95+
- **Lighthouse SEO:** 90+

### Métricas de Negocio
- **Time to First Action:** <30 segundos desde login
- **Task Success Rate:** >95%
- **Error Rate:** <1%
- **User Satisfaction (CSAT):** >4.5/5

### Métricas Técnicas
- **Test Coverage:** 80%+
- **Build Time:** <2 minutos
- **Bundle Size:** <500kb
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s

### Métricas de Adopción
- **Daily Active Users:** Objetivo según plan de negocio
- **Feature Adoption Rate:** >70% para funcionalidades críticas
- **Mobile Usage:** >40% del tráfico total

---

## CONCLUSIÓN

Este backlog frontend complementa perfectamente el backlog backend para crear **la mejor experiencia de usuario en software de seguridad industrial en Chile**.

### Ventajas Competitivas UX:
1. ✅ **Interfaces intuitivas** para cumplimiento regulatorio
2. ✅ **Mobile-first** con PWA y offline support
3. ✅ **Dashboards visuales** con KPIs legales
4. ✅ **Firma digital** integrada en flujos
5. ✅ **Notificaciones en tiempo real** vía WebSockets
6. ✅ **Accesibilidad WCAG AA** inclusiva
7. ✅ **Performance optimizado** (<3s TTI)

### Diferenciadores vs Competencia:
- **ISL Safety**: UX 10x mejor, moderna, mobile-first
- **AURUS**: Simplicidad sin sacrificar funcionalidad
- **SafetyCulture**: Mismo nivel de UX mobile, con más funcionalidades

### Próximos Pasos:
1. Validar diseños con usuarios finales
2. Crear prototipos de alta fidelidad (Figma)
3. Iniciar Sprint 0 con desarrollo
4. Testing continuo con usuarios reales
5. Iterar basado en feedback

---

**Fecha de última actualización:** 21 de Octubre, 2025
**Próxima revisión:** 21 de Noviembre, 2025
