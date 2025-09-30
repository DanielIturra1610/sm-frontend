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

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer'

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
  domain: string
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
// INCIDENT MANAGEMENT TYPES
// ============================================================================

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
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'closed'
export type IncidentType = 'safety' | 'security' | 'environmental' | 'quality' | 'operational'

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
  tags?: string[]
}

export interface UpdateIncidentData {
  title?: string
  description?: string
  severity?: IncidentSeverity
  status?: IncidentStatus
  assignedTo?: string
  tags?: string[]
}

export interface IncidentListParams extends PaginationParams {
  status?: IncidentStatus
  severity?: IncidentSeverity
  type?: IncidentType
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// ============================================================================
// ROOT CAUSE ANALYSIS TYPES
// ============================================================================

export interface FiveWhysAnalysis extends BaseEntity {
  incidentId: string
  problem: string
  whys: WhyStep[]
  rootCause: string
  actionItems: ActionItem[]
  status: AnalysisStatus
  createdBy: string
  reviewedBy?: string
  reviewedAt?: string
}

export interface WhyStep {
  question: string
  answer: string
  evidence?: string[]
}

export interface FishboneAnalysis extends BaseEntity {
  incidentId: string
  problem: string
  categories: FishboneCategory[]
  rootCause: string
  actionItems: ActionItem[]
  status: AnalysisStatus
  createdBy: string
  reviewedBy?: string
  reviewedAt?: string
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
  problem: string
  whys: Omit<WhyStep, 'evidence'>[]
}

export interface CreateFishboneData {
  incidentId: string
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
  total: number
  bySeverity: Record<IncidentSeverity, number>
  byStatus: Record<IncidentStatus, number>
  byType: Record<IncidentType, number>
  open: number
  closed: number
  avgResolutionTime: number
  trends: IncidentTrend[]
}

export interface IncidentTrend {
  date: string
  count: number
  severity: IncidentSeverity
}

export interface IncidentTrends {
  data: IncidentTrend[]
  period: string
  startDate: string
  endDate: string
}

export interface IncidentExportRequest {
  format: 'csv' | 'pdf' | 'excel'
  filters?: IncidentListParams
  fields?: string[]
}

// ============================================================================
// FISHBONE ANALYSIS TYPES
// ============================================================================

export interface FishboneCause {
  category: string
  description: string
  evidence?: string[]
}

export interface AnalysisTemplate {
  id: string
  name: string
  description: string
  type: 'five_whys' | 'fishbone'
  content: any
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
  defaultValue?: any
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
  value: any
}

export interface WorkflowInstance extends BaseEntity {
  workflowId: string
  entityId: string
  entityType: 'incident' | 'analysis' | 'document'
  currentStep: string
  status: 'active' | 'completed' | 'cancelled'
  steps: WorkflowInstanceStep[]
  context: Record<string, any>
}

export interface WorkflowInstanceStep {
  id: string
  stepId: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  assignedTo: string[]
  completedAt?: string
  completedBy?: string
  output?: Record<string, any>
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
  inputs?: Record<string, any>
  outputs?: Record<string, any>
}

export interface WorkflowTaskAssignment {
  assignedTo: string
  reason?: string
}