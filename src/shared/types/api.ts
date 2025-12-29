/**
 * Stegmaier Management - API Types
 * Type definitions matching the 100% tested Go backend
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiErrorResponse {
  message: string
  code: string
  details?: Record<string, unknown>
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  full_name: string
  phone: string
  email: string
  password: string
  password_confirm: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Email verification
export interface VerifyEmailData {
  token: string
}

// Password recovery
export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  new_password: string
  password_confirm: string
}

// Profile update
export interface UpdateProfileData {
  full_name?: string
  phone?: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  password_confirm: string
}

// User tenant status
export interface UserTenantStatus {
  user: User
  has_tenant: boolean
  needs_tenant: boolean
}

export interface User extends BaseEntity {
  email: string
  full_name: string
  phone?: string
  email_verified: boolean
  role: string
  created_at: string
  updated_at: string
}

export type UserRole = 'owner' | 'admin' | 'supervisor' | 'investigator' | 'operator' | 'viewer'

// ============================================================================
// MULTI-TENANT TYPES
// ============================================================================

export interface Company extends BaseEntity {
  name: string
  domain: string
  logo?: string
  settings: CompanySettings
  isActive: boolean
  subscription: Subscription
  userCount: number
}

export interface CompanySettings {
  timezone: string
  dateFormat: string
  language: string
  features: FeatureFlags
  branding: BrandingConfig
}

export interface FeatureFlags {
  fiveWhysAnalysis: boolean
  fishboneAnalysis: boolean
  documentGeneration: boolean
  workflowEngine: boolean
  customTemplates: boolean
}

export interface BrandingConfig {
  primaryColor: string
  secondaryColor: string
  logo?: string
  favicon?: string
}

export interface Subscription {
  plan: 'free' | 'basic' | 'professional' | 'enterprise'
  status: 'active' | 'inactive' | 'cancelled' | 'expired'
  expiresAt: string
  features: string[]
}

export interface CreateCompanyData {
  name: string
  rut: string // Chilean RUT or Tax ID
  domain?: string
  industry: string
  size: 'small' | 'medium' | 'large' | 'enterprise'
  country: string // ISO 2-character country code
  description?: string
  website?: string
  phone?: string
  address?: string
  city?: string
  settings?: Partial<CompanySettings>
}

// Company invitation/join
export interface JoinCompanyData {
  invitationCode: string
}

// ============================================================================
// SUCESO (INCIDENT) MANAGEMENT TYPES
// ============================================================================

// Nueva taxonomía de Sucesos
export type SucesoCategory = 'accidente' | 'incidente' | 'tolerancia_0'

// Tipos de Accidente
export type AccidenteType = 
  | 'acc_trabajo_con_baja'
  | 'acc_trabajo_sin_baja'
  | 'acc_trayecto_con_baja'
  | 'acc_trayecto_sin_baja'
  | 'acc_ambiental'

// Tipos de Incidente
export type IncidenteType = 
  | 'inc_laboral'
  | 'inc_industrial'
  | 'inc_ambiental'
  | 'inc_plgf'

// Tipos de Tolerancia 0
export type Tolerancia0Type = 
  | 't0_accion_insegura'
  | 't0_condicion_insegura'
  | 't0_stop_work'

// Tipo unión de todos los tipos de suceso
export type SucesoType = AccidenteType | IncidenteType | Tolerancia0Type

export interface Incident extends BaseEntity {
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  type: IncidentType
  location: string
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  assignedAt?: string
  resolvedAt?: string
  tags: string[]
  attachments: Attachment[]
  companyId: string
  workflowState: WorkflowState
  // Nuevos campos para taxonomía de Sucesos
  categoria?: SucesoCategory
  tipoSuceso?: SucesoType
  // Nuevos campos Sprint 1: GAP #6
  area_zona?: string
  empresa?: string
  supervisor?: string
  // Correlativo único del incidente
  correlativo?: string
  descripcion_breve?: string
  tipo?: string
  // Personas involucradas en el suceso
  personas_involucradas?: PersonaInvolucrada[]
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'closed'
// Tipos legacy - mantener para compatibilidad
export type IncidentType = 'accident' | 'incident' | 'near_miss' | 'zero_tolerance' | 'environmental' | 'occupational'

export interface WorkflowState {
  currentStep: string
  availableActions: string[]
  completedSteps: string[]
  pendingApprovals: Approval[]
}

export interface Approval {
  id: string
  type: string
  assignedTo: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Attachment {
  id: string
  filename: string
  contentType: string
  size: number
  url: string
  uploadedBy: string
  uploadedAt: string
}

export interface CreateIncidentData {
  title: string
  description: string
  severity: IncidentSeverity
  type: IncidentType
  location: string
  date_time: string
  tags?: string[]
  // Nuevos campos de taxonomía de Sucesos
  categoria?: SucesoCategory
  tipoSuceso?: SucesoType
  // Campos adicionales del Flash Report
  area_zona?: string
  empresa?: string
  supervisor?: string
  // Personas involucradas en el suceso
  personas_involucradas?: PersonaInvolucrada[]
}

export interface UpdateIncidentData {
  title?: string
  description?: string
  severity?: IncidentSeverity
  status?: IncidentStatus
  assignedTo?: string
  tags?: string[]
  // Nuevos campos de taxonomía de Sucesos
  categoria?: SucesoCategory
  tipoSuceso?: SucesoType
}

export interface IncidentListParams extends PaginationParams {
  status?: IncidentStatus
  severity?: IncidentSeverity
  type?: IncidentType
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  correlativo?: string
}

// ============================================================================
// ROOT CAUSE ANALYSIS TYPES
// ============================================================================

export interface FiveWhysAnalysis extends BaseEntity {
  incidentId: string
  tenantId?: string
  title: string
  problemStatement: string
  whys: WhyEntry[]
  rootCause: string | null
  rootCauseCategory?: string | null
  actionItems: FiveWhysActionItem[]
  status: AnalysisStatus
  leadAnalyst?: string
  analysisTeam?: string[]
  createdBy: string
  createdByName?: string
  updatedBy?: string
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewComments?: string | null
  rejectionReason?: string | null
}

export interface WhyEntry {
  id: string
  analysisId: string
  whyNumber: number
  question: string
  answer: string
  evidence: string[]
  notes?: string | null
  isRootCause: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Legacy alias for backwards compatibility
export type WhyStep = WhyEntry

export interface FiveWhysActionItem {
  id: string
  analysisId: string
  description: string
  actionType: 'corrective' | 'preventive'
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string | null
  dueDate?: string | null
  status: 'pending' | 'in_progress' | 'completed'
  completedAt?: string | null
  completedBy?: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface FishboneAnalysis extends BaseEntity {
  incidentId: string
  title: string
  problem: string
  categories: FishboneCategory[]
  causes: FishboneCause[]
  summary?: string
  conclusions?: string
  leadAnalyst: string
  analysisTeam: string[]
  createdBy: string
  updatedBy: string
}

export interface FishboneCause {
  id: string
  analysisId: string
  category: string
  description: string
  level: number
  parentId?: string
  evidence: string[]
  impact: string
  likelihood: string
  priority: number
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface FishboneCategory {
  name: string
  causes: Cause[]
}

export interface Cause {
  description: string
  subCauses?: string[]
  evidence?: string[]
}

export interface ActionItem {
  id: string
  description: string
  assignedTo: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

export type AnalysisStatus = 'draft' | 'in_review' | 'approved' | 'rejected'

export interface CreateFiveWhysData {
  incidentId: string
  title: string
  problemStatement: string
  analysisTeam?: string[]
}

export interface AddWhyEntryData {
  whyNumber: number
  question: string
  answer: string
  evidence?: string[]
  notes?: string
  isRootCause?: boolean
}

export interface UpdateWhyEntryData {
  question?: string
  answer?: string
  evidence?: string[]
  notes?: string
  isRootCause?: boolean
}

export interface AddActionItemData {
  description: string
  actionType: 'corrective' | 'preventive'
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
  dueDate?: string
}

export interface UpdateActionItemData {
  description?: string
  actionType?: 'corrective' | 'preventive'
  priority?: 'high' | 'medium' | 'low'
  assignedTo?: string
  dueDate?: string
  status?: 'pending' | 'in_progress' | 'completed'
}

export interface CreateFishboneData {
  incidentId: string
  title: string
  problem: string
  categories: FishboneCategory[]
}

// ============================================================================
// DOCUMENT GENERATION TYPES
// ============================================================================

export interface Document extends BaseEntity {
  title: string
  type: DocumentType
  status: DocumentStatus
  templateId: string
  content: DocumentContent
  metadata: DocumentMetadata
  generatedBy: string
  approvedBy?: string
  approvedAt?: string
  downloadUrl?: string
  companyId: string
}

export type DocumentType = 'incident_report' | 'analysis_report' | 'action_plan' | 'compliance_report'
export type DocumentStatus = 'generating' | 'ready' | 'approved' | 'expired'

export interface DocumentContent {
  sections: DocumentSection[]
  variables: Record<string, unknown>
}

export interface DocumentSection {
  id: string
  title: string
  content: string
  type: 'text' | 'table' | 'chart' | 'image'
  order: number
}

export interface DocumentMetadata {
  format: 'pdf' | 'docx' | 'html'
  language: string
  version: string
  size?: number
  pageCount?: number
}

export interface GenerateDocumentRequest {
  type: DocumentType
  templateId: string
  data: Record<string, unknown>
  format?: 'pdf' | 'docx' | 'html'
}

// ============================================================================
// REQUEST/RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  errors?: ApiErrorResponse[]
}

export type IncidentListResponse = PaginatedResponse<Incident>
export type CompanyListResponse = PaginatedResponse<Company>
export type DocumentListResponse = PaginatedResponse<Document>

// ============================================================================
// INCIDENT ANALYTICS TYPES
// ============================================================================

export interface IncidentStats {
  totalIncidents: number
  openIncidents: number
  severityDistribution: Record<string, number>
  statusDistribution: Record<string, number>
  typeDistribution: Record<string, number>
  avgResolutionTime: number
  incidentTrend: number
  incidentTrendIsPositive: boolean
}

export interface IncidentTrendData {
  month: string
  incidents: number
  resolved: number
  open: number
}

export interface IncidentTrends {
  trends: IncidentTrendData[]
  months: number
}

export interface IncidentExportRequest {
  format: 'csv' | 'pdf' | 'excel'
  filters?: IncidentListParams
  fields?: string[]
}

// ============================================================================
// ANALYSIS TEMPLATES & REPORTS
// ============================================================================

export interface AnalysisTemplate {
  id: string
  name: string
  description: string
  type: 'five_whys' | 'fishbone'
  content: Record<string, unknown>
  isDefault: boolean
  companyId: string
  createdAt: string
  updatedAt: string
}

export interface AnalysisReport {
  id: string
  analysisId: string
  format: 'pdf' | 'docx' | 'html'
  content: string
  downloadUrl: string
  createdAt: string
  createdBy: string
}

// ============================================================================
// DOCUMENT TEMPLATES TYPES
// ============================================================================

export interface DocumentTemplate extends BaseEntity {
  name: string
  type: DocumentType
  description: string
  content: DocumentTemplateContent
  variables: DocumentTemplateVariable[]
  isActive: boolean
  isDefault: boolean
  companyId: string
}

export interface DocumentTemplateContent {
  sections: DocumentSection[]
  layout: 'formal' | 'simple' | 'technical'
}

export interface DocumentTemplateVariable {
  key: string
  label: string
  type: 'text' | 'date' | 'number' | 'list' | 'boolean'
  required: boolean
  defaultValue?: string | number | boolean | string[]
}

// ============================================================================
// WORKFLOW MANAGEMENT TYPES
// ============================================================================

export interface Workflow extends BaseEntity {
  name: string
  description: string
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  companyId: string
  isActive: boolean
}

export interface WorkflowStep {
  id: string
  name: string
  description: string
  type: 'approval' | 'task' | 'notification' | 'automation'
  assignee: string | 'reporter' | 'manager' | 'custom'
  requiredApprovals: number
  permissions?: string[]
}

export interface WorkflowTrigger {
  event: 'incident_created' | 'incident_submitted' | 'status_changed' | 'custom'
  conditions: WorkflowCondition[]
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains'
  value: string | number | boolean
}

export interface WorkflowInstance extends BaseEntity {
  workflowId: string
  entityId: string
  entityType: 'incident' | 'analysis' | 'document'
  currentStep: string
  status: 'active' | 'completed' | 'cancelled'
  steps: WorkflowInstanceStep[]
  context: Record<string, unknown>
}

export interface WorkflowInstanceStep {
  id: string
  stepId: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  assignedTo: string[]
  completedAt?: string
  completedBy?: string
  output?: Record<string, unknown>
}

export interface WorkflowTask extends BaseEntity {
  workflowInstanceId: string
  stepId: string
  name: string
  description: string
  assignedTo: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  inputs?: Record<string, unknown>
  outputs?: Record<string, unknown>
}

export interface WorkflowTaskAssignment {
  assignedTo: string
  reason?: string
}

// ============================================================================
// REPORT TYPES - Sprint 5
// ============================================================================

export type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'published' | 'closed'

export type AnalysisMethodology = 'five_whys' | 'fishbone' | 'six_sigma' | 'fmea' | 'other'

// PLGF (Potencial de Lesión Grave o Fatal) Classification
export type PLGFLevel = 'potencial' | 'real' | 'fatal'

// ============================================================================
// FLASH REPORT TYPES
// ============================================================================

export interface FlashReport extends BaseEntity {
  tenant_id: string
  incident_id: string

  // Información básica del evento
  suceso?: string
  tipo?: string
  fecha?: string
  hora?: string
  lugar?: string
  area_zona?: string
  empresa?: string
  supervisor?: string

  // Descripción y análisis
  descripcion?: string
  acciones_inmediatas?: string
  controles_inmediatos?: string
  factores_riesgo?: string

  // Identificadores
  numero_prodity?: string
  zonal?: string

  // Clasificación del tipo de incidente/accidente
  con_baja_il: boolean
  sin_baja_il: boolean
  incidente_industrial: boolean
  incidente_laboral: boolean

  // Clasificación PLGF (Potencial de Lesión Grave o Fatal)
  es_plgf: boolean
  nivel_plgf?: string // 'potencial' | 'real' | 'fatal'
  justificacion_plgf?: string

  // Workflow y estado
  report_status: ReportStatus
  submitted_at?: string
  approved_at?: string
  approved_by?: string

  // SLA fields
  sla_deadline?: string | null
  sla_status?: string | null
  sla_hours?: number

  // Personas involucradas
  personas_involucradas?: PersonaInvolucrada[]

  created_at: string
  updated_at: string
}

export interface CreateFlashReportData {
  incident_id: string
  suceso?: string
  tipo?: string
  fecha?: string
  hora?: string
  lugar?: string
  area_zona?: string
  empresa?: string
  supervisor?: string
  descripcion?: string
  acciones_inmediatas?: string
  controles_inmediatos?: string
  factores_riesgo?: string
  numero_prodity?: string
  zonal?: string
  con_baja_il?: boolean
  sin_baja_il?: boolean
  incidente_industrial?: boolean
  incidente_laboral?: boolean
  // PLGF Classification
  es_plgf?: boolean
  nivel_plgf?: string
  justificacion_plgf?: string
  // Personas involucradas
  personas_involucradas?: PersonaInvolucrada[]
}

export interface UpdateFlashReportData {
  suceso?: string
  tipo?: string
  fecha?: string
  hora?: string
  lugar?: string
  area_zona?: string
  empresa?: string
  supervisor?: string
  descripcion?: string
  acciones_inmediatas?: string
  controles_inmediatos?: string
  factores_riesgo?: string
  numero_prodity?: string
  zonal?: string
  con_baja_il?: boolean
  sin_baja_il?: boolean
  incidente_industrial?: boolean
  incidente_laboral?: boolean
  // PLGF Classification
  es_plgf?: boolean
  nivel_plgf?: string
  justificacion_plgf?: string
  // Personas involucradas
  personas_involucradas?: PersonaInvolucrada[]
}

// ============================================================================
// IMMEDIATE ACTIONS REPORT TYPES
// ============================================================================

export interface ImmediateActionItem {
  id: string
  report_id: string
  numero: number
  tarea: string
  inicio?: string
  fin?: string
  responsable?: string
  cliente?: string
  avance_real: number
  avance_programado: number
  comentario?: string
  tipo_acc_inc?: string
  created_at: string
  updated_at: string
}

export interface ImmediateActionsReport extends BaseEntity {
  tenant_id: string
  incident_id: string
  fecha_inicio?: string
  fecha_termino?: string
  porcentaje_avance_plan: number
  estatus_plan: number
  items?: ImmediateActionItem[]
  // Related incident data (populated when using relations)
  incident?: {
    id: string
    correlativo?: string
    tipo?: string
    descripcion_breve?: string
    title?: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    location?: string
  }
  // PLGF Classification (inherited from Flash Report)
  es_plgf: boolean
  nivel_plgf?: string
  report_status: ReportStatus
  submitted_at?: string
  approved_at?: string
  approved_by?: string
  // SLA fields
  sla_deadline?: string | null
  sla_status?: string | null
  sla_hours?: number
  created_at: string
  updated_at: string
}

export interface CreateImmediateActionsReportData {
  incident_id: string
  fecha_inicio?: string
  fecha_termino?: string
  items?: CreateImmediateActionItemData[]
}

export interface CreateImmediateActionItemData {
  numero: number
  tarea: string
  inicio?: string
  fin?: string
  responsable?: string
  cliente?: string
  avance_real?: number
  avance_programado?: number
  comentario?: string
  tipo_acc_inc?: string
}

export interface UpdateImmediateActionsReportData {
  fecha_inicio?: string
  fecha_termino?: string
}

export interface UpdateImmediateActionItemData {
  inicio?: string
  fin?: string
  responsable?: string
  cliente?: string
  avance_real?: number
  avance_programado?: number
  comentario?: string
  tipo_acc_inc?: string
}

// ============================================================================
// ROOT CAUSE REPORT TYPES
// ============================================================================

export interface WhyQuestion {
  numero: number
  pregunta: string
  respuesta: string
}

export interface RootCauseAnalysisTable {
  id: string
  report_id: string
  table_number: number
  hecho_observacion: string
  porques: WhyQuestion[]
  accion_plan?: string
  created_at: string
  updated_at: string
}

export interface RootCauseReport extends BaseEntity {
  tenant_id: string
  incident_id: string
  metodologia: AnalysisMethodology
  analysis_tables?: RootCauseAnalysisTable[]
  report_status: ReportStatus
  submitted_at?: string
  approved_at?: string
  approved_by?: string
  // SLA fields
  sla_deadline?: string | null
  sla_status?: string | null
  sla_hours?: number
  created_at: string
  updated_at: string
}

export interface CreateRootCauseReportData {
  incident_id: string
  metodologia: AnalysisMethodology
  analysis_tables?: CreateRootCauseAnalysisTableData[]
}

export interface CreateRootCauseAnalysisTableData {
  table_number: number
  hecho_observacion: string
  porques?: WhyQuestion[]
  accion_plan?: string
}

export interface UpdateRootCauseReportData {
  metodologia?: AnalysisMethodology
}

export interface UpdateRootCauseAnalysisTableData {
  hecho_observacion?: string
  porques?: WhyQuestion[]
  accion_plan?: string
}

// ============================================================================
// ACTION PLAN REPORT TYPES
// ============================================================================

export type ActionPlanItemStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'delayed'

export interface ActionPlanItem {
  id: string
  report_id: string
  numero: number
  tarea: string
  subtarea?: string
  inicio?: string
  fin?: string
  responsable?: string
  cliente?: string
  avance_real: number
  avance_programado: number
  comentario?: string
  tipo_acc_inc?: string
  estado: ActionPlanItemStatus
  created_at: string
  updated_at: string
}

export interface ActionPlanReport extends BaseEntity {
  tenant_id: string
  incident_id: string
  fecha_inicio?: string
  duracion_dias?: number
  fecha_fin_estimada?: string
  porcentaje_avance_plan: number
  items?: ActionPlanItem[]
  // Related incident data (populated when using relations)
  incident?: {
    id: string
    correlativo?: string
    tipo?: string
    descripcion_breve?: string
    title?: string
  }
  report_status: ReportStatus
  submitted_at?: string
  approved_at?: string
  approved_by?: string
  // SLA fields
  sla_deadline?: string | null
  sla_status?: string | null
  sla_hours?: number
  created_at: string
  updated_at: string
}

export interface CreateActionPlanReportData {
  incident_id: string
  fecha_inicio?: string
  duracion_dias?: number
  items?: CreateActionPlanItemData[]
}

export interface CreateActionPlanItemData {
  numero: number
  tarea: string
  subtarea?: string
  inicio?: string
  fin?: string
  responsable?: string
  cliente?: string
  avance_real?: number
  avance_programado?: number
  comentario?: string
  tipo_acc_inc?: string
}

export interface UpdateActionPlanReportData {
  fecha_inicio?: string
  duracion_dias?: number
}

export interface UpdateActionPlanItemData {
  tarea?: string
  subtarea?: string
  inicio?: string
  fin?: string
  responsable?: string
  cliente?: string
  avance_real?: number
  avance_programado?: number
  comentario?: string
  tipo_acc_inc?: string
  estado?: ActionPlanItemStatus
}

// ============================================================================
// FINAL REPORT TYPES
// ============================================================================

export interface CompanyData {
  nombre?: string
  direccion?: string
  rut?: string
  telefono?: string
  email?: string
  contacto?: string
}

export interface TipoAccidenteTabla {
  con_baja_il: boolean
  sin_baja_il: boolean
  incidente_industrial: boolean
  incidente_laboral: boolean
  // PLGF Classification
  es_plgf: boolean
  nivel_plgf?: string
}

export interface PersonaInvolucrada {
  nombre: string
  cargo?: string
  empresa?: string
  tipo_lesion?: string
  gravedad?: string
  parte_cuerpo?: string
  descripcion?: string
}

export interface EquipoDanado {
  nombre: string
  tipo?: string
  marca?: string
  modelo?: string
  numero_serie?: string
  tipo_dano?: string
  descripcion?: string
  costo_estimado?: number
}

export interface TerceroIdentificado {
  nombre: string
  empresa?: string
  rol?: string
  contacto?: string
}

export interface CausaRaizSummary {
  problema: string
  causa_raiz: string
  accion_plan?: string
  metodologia?: string
}

export interface CostoItem {
  concepto: string
  monto: number
  moneda: string
  descripcion?: string
}

export interface ImagenEvidencia {
  url: string
  descripcion?: string
  fecha?: string
}

export interface ResponsableInvestigacion {
  nombre: string
  cargo?: string
  firma?: string
}

export interface FinalReport extends BaseEntity {
  tenant_id: string
  incident_id: string
  company_data: CompanyData
  tipo_accidente_tabla: TipoAccidenteTabla
  personas_involucradas?: PersonaInvolucrada[]
  equipos_danados?: EquipoDanado[]
  terceros_identificados?: TerceroIdentificado[]
  detalles_accidente?: string
  analisis_causas_raiz?: CausaRaizSummary[]
  descripcion_detallada?: string
  conclusiones?: string
  lecciones_aprendidas?: string
  acciones_inmediatas_resumen?: string
  plan_accion_resumen?: string
  costos_tabla?: CostoItem[]
  imagenes_evidencia?: ImagenEvidencia[]
  responsables_investigacion?: ResponsableInvestigacion[]
  left_logo_url?: string
  right_logo_url?: string
  side_image_url?: string
  report_status: ReportStatus
  generated_at?: string
  submitted_at?: string
  approved_at?: string
  approved_by?: string
  // SLA fields
  sla_deadline?: string | null
  sla_status?: string | null
  sla_hours?: number
  created_at: string
  updated_at: string
}

export interface CreateFinalReportData {
  incident_id: string
  company_data?: CompanyData
  tipo_accidente_tabla?: TipoAccidenteTabla
  personas_involucradas?: PersonaInvolucrada[]
  equipos_danados?: EquipoDanado[]
  terceros_identificados?: TerceroIdentificado[]
  detalles_accidente?: string
  analisis_causas_raiz?: CausaRaizSummary[]
  descripcion_detallada?: string
  conclusiones?: string
  lecciones_aprendidas?: string
  acciones_inmediatas_resumen?: string
  plan_accion_resumen?: string
  costos_tabla?: CostoItem[]
  imagenes_evidencia?: ImagenEvidencia[]
  responsables_investigacion?: ResponsableInvestigacion[]
}

export interface UpdateFinalReportData {
  company_data?: CompanyData
  tipo_accidente_tabla?: TipoAccidenteTabla
  personas_involucradas?: PersonaInvolucrada[]
  equipos_danados?: EquipoDanado[]
  terceros_identificados?: TerceroIdentificado[]
  detalles_accidente?: string
  analisis_causas_raiz?: CausaRaizSummary[]
  descripcion_detallada?: string
  conclusiones?: string
  lecciones_aprendidas?: string
  acciones_inmediatas_resumen?: string
  plan_accion_resumen?: string
  costos_tabla?: CostoItem[]
  imagenes_evidencia?: ImagenEvidencia[]
  responsables_investigacion?: ResponsableInvestigacion[]
}

// ============================================================================
// ZERO TOLERANCE REPORT TYPES
// ============================================================================

export type ZeroToleranceSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Fotografia {
  url: string
  descripcion?: string
  fecha?: string
}

export interface PersonaInvolucradaZT {
  nombre: string
  cargo?: string
  empresa?: string
}

export interface ZeroToleranceReport extends BaseEntity {
  tenant_id: string
  incident_id?: string
  numero_documento: string
  suceso?: string
  tipo?: string
  lugar?: string
  fecha_hora?: string
  area_zona?: string
  empresa?: string
  supervisor_cge?: string
  descripcion?: string
  numero_prodity?: string
  fotografias?: Fotografia[]
  severidad?: ZeroToleranceSeverity
  acciones_tomadas?: string
  personas_involucradas?: PersonaInvolucradaZT[]
  report_status: ReportStatus
  submitted_at?: string
  approved_at?: string
  approved_by?: string
  closed_at?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface CreateZeroToleranceReportData {
  incident_id?: string
  numero_documento?: string
  suceso?: string
  tipo?: string
  lugar?: string
  fecha_hora?: string
  area_zona?: string
  empresa?: string
  supervisor_cge?: string
  descripcion?: string
  numero_prodity?: string
  fotografias?: Fotografia[]
  severidad?: ZeroToleranceSeverity
  acciones_tomadas?: string
  personas_involucradas?: PersonaInvolucradaZT[]
}

export interface UpdateZeroToleranceReportData {
  suceso?: string
  tipo?: string
  lugar?: string
  fecha_hora?: string
  area_zona?: string
  empresa?: string
  supervisor_cge?: string
  descripcion?: string
  numero_prodity?: string
  fotografias?: Fotografia[]
  severidad?: ZeroToleranceSeverity
  acciones_tomadas?: string
  personas_involucradas?: PersonaInvolucradaZT[]
}

// ============================================================================
// REPORT LIST RESPONSES
// ============================================================================

export type FlashReportListResponse = PaginatedResponse<FlashReport>
export type ImmediateActionsReportListResponse = PaginatedResponse<ImmediateActionsReport>
export type RootCauseReportListResponse = PaginatedResponse<RootCauseReport>
export type ActionPlanReportListResponse = PaginatedResponse<ActionPlanReport>
export type FinalReportListResponse = PaginatedResponse<FinalReport>
export type ZeroToleranceReportListResponse = PaginatedResponse<ZeroToleranceReport>

// ============================================================================
// PREFILL DATA TYPES (Data persistence between reports)
// ============================================================================

// Valid report types for prefill
export type PrefillReportType =
  | 'flash-report'
  | 'immediate-actions'
  | 'root-cause'
  | 'action-plan'
  | 'final-report'

// Source reports info with IDs of reports used for prefill
export interface SourceReportsInfo {
  flash_report_id?: string
  immediate_actions_id?: string
  root_cause_id?: string
  action_plan_id?: string
  zero_tolerance_id?: string
  // Analysis reports
  five_whys_ids?: string[]
  fishbone_ids?: string[]
  causal_tree_ids?: string[]
}

// Prefill data containing consolidated data from previous reports
export interface PrefillData {
  incident_id: string

  // Basic incident data
  suceso?: string
  tipo?: string
  fecha?: string
  hora?: string
  lugar?: string
  area_zona?: string
  empresa?: string
  supervisor?: string
  descripcion?: string

  // Classification
  con_baja_il: boolean
  sin_baja_il: boolean
  incidente_industrial: boolean
  incidente_laboral: boolean
  es_plgf: boolean
  nivel_plgf?: string
  justificacion_plgf?: string

  // Identifiers
  numero_prodity?: string
  zonal?: string

  // Persons involved
  personas_involucradas?: PersonaInvolucrada[]

  // Data from previous reports
  acciones_inmediatas?: string
  controles_inmediatos?: string
  factores_riesgo?: string
  causas_identificadas?: string

  // Source reports metadata
  source_reports: SourceReportsInfo

  // Action Plan specific data (only populated when target is action-plan)
  action_plan_data?: ActionPlanPrefillExtension

  // Final Report specific data (only populated when target is final-report)
  final_report_data?: FinalReportPrefillExtension
}

// Action Plan prefill extension types
export interface ActionPlanSuggestedItem {
  numero: number
  tarea: string
  subtarea?: string
  tipo_acc_inc?: string // ACC or INC
  source?: string // Where this suggestion came from (five_whys, fishbone, causal_tree, root_cause, default)
  priority?: string // high, medium, low (for RCA items)
}

export interface ActionPlanPrefillExtension {
  suggested_duration_days: number
  suggested_items: ActionPlanSuggestedItem[]
}

// Final Report prefill extension types
export interface FinalReportPrefillExtension {
  // Company data
  company_data: CompanyDataPrefill

  // Accident classification
  tipo_accidente_tabla: TipoAccidenteTablaPrefill

  // Persons involved (consolidated from all reports)
  personas_involucradas?: PersonaInvolucrada[]

  // Damaged equipment (from flash report)
  equipos_danados?: EquipoDanadoPrefill[]

  // Third parties (from flash report)
  terceros_identificados?: TerceroIdentificadoPrefill[]

  // Accident details (consolidated description)
  detalles_accidente?: string

  // Root cause analysis summary (from root cause report + analyses)
  analisis_causas_raiz?: CausaRaizSummary[]

  // Detailed description (consolidated narrative)
  descripcion_detallada?: string

  // Suggested conclusions
  conclusiones?: string

  // Lessons learned
  lecciones_aprendidas?: string

  // Immediate actions summary
  acciones_inmediatas_resumen?: string

  // Action plan summary
  plan_accion_resumen?: string

  // Evidence images (consolidated from all reports)
  imagenes_evidencia?: ImagenEvidenciaPrefill[]

  // Investigation responsibles
  responsables_investigacion?: ResponsableInvestigacionPrefill[]

  // Zero tolerance info
  zero_tolerance_info?: ZeroToleranceSummaryPrefill
}

export interface CompanyDataPrefill {
  nombre?: string
  rut?: string
  direccion?: string
  comuna?: string
  ciudad?: string
}

export interface TipoAccidenteTablaPrefill {
  con_baja_il: boolean
  sin_baja_il: boolean
  incidente_industrial: boolean
  incidente_laboral: boolean
  es_plgf: boolean
  nivel_plgf?: string
}

export interface EquipoDanadoPrefill {
  nombre: string
  descripcion?: string
  costo_estimado?: number
}

export interface TerceroIdentificadoPrefill {
  nombre: string
  empresa?: string
  tipo_relacion?: string
}

export interface CausaRaizSummaryPrefill {
  problema: string
  causa_raiz: string
  accion_plan?: string
  metodologia: string
}

export interface ImagenEvidenciaPrefill {
  url: string
  descripcion?: string
  fecha?: string
}

export interface ResponsableInvestigacionPrefill {
  nombre: string
  cargo?: string
  rol?: string
}

export interface ZeroToleranceSummaryPrefill {
  numero_documento?: string
  severidad?: string
  acciones_tomadas?: string
}

// ============================================================================
// SLA (SERVICE LEVEL AGREEMENT) TYPES
// ============================================================================

export type SLAStatus = 'on_time' | 'at_risk' | 'overdue' | 'completed' | 'not_set'

export type SLAReportType =
  | 'flash_report'
  | 'immediate_actions'
  | 'root_cause'
  | 'action_plan'
  | 'final_report'

export type SLASeverity = 'low' | 'medium' | 'high' | 'critical'

export interface SLAConfiguration {
  id: string
  tenant_id: string
  report_type: SLAReportType
  base_hours: number
  severity_multipliers: SeverityMultipliers
  plgf_multiplier: number
  business_hours_only: boolean
  work_start_hour: number
  work_end_hour: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SeverityMultipliers {
  low: number
  medium: number
  high: number
  critical: number
}

export interface CreateSLAConfigurationData {
  report_type: SLAReportType
  base_hours: number
  severity_multipliers?: SeverityMultipliers
  plgf_multiplier?: number
  business_hours_only?: boolean
  work_start_hour?: number
  work_end_hour?: number
  is_active?: boolean
}

export interface UpdateSLAConfigurationData {
  base_hours?: number
  severity_multipliers?: SeverityMultipliers
  plgf_multiplier?: number
  business_hours_only?: boolean
  work_start_hour?: number
  work_end_hour?: number
  is_active?: boolean
}

export interface CalculateSLAInput {
  tenant_id: string
  report_type: SLAReportType
  incident_time: string
  severity: SLASeverity
  is_plgf?: boolean
}

export interface SLACalculationResult {
  deadline: string
  hours: number
  status: SLAStatus
  base_hours: number
  applied_multiplier: number
  is_business_hours: boolean
}

// SLA fields that can be added to any report
export interface SLAFields {
  sla_deadline?: string | null
  sla_status?: string | null
  sla_hours?: number
}

export type SLAConfigurationListResponse = SLAConfiguration[]