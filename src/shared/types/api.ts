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
  email: string
  password: string
  firstName: string
  lastName: string
  companyName?: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
  expiresAt: string
}

export interface User extends BaseEntity {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: string
  companyId?: string
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
  settings?: Partial<CompanySettings>
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