// ============================================================================
// Causal Tree (Árbol de Causas) Types
// ============================================================================

export type NodeType = 'final_event' | 'intermediate' | 'root_cause'

export type RelationType = 'chain' | 'conjunctive' | 'disjunctive'

export type MeasureType = 'preventive' | 'corrective'

export type Priority = 'high' | 'medium' | 'low'

export type MeasureStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface NodePosition {
  x: number
  y: number
}

export interface CausalNode {
  id: string
  analysisId: string
  fact: string
  nodeType: NodeType
  relationType: RelationType
  parentNodes: string[]
  childNodes: string[]
  level: number
  isRootCause: boolean
  evidence: string[]
  position: NodePosition
  createdAt: string
  updatedAt: string
}

export interface PreventiveMeasure {
  id: string
  analysisId: string
  targetCauseId: string
  description: string
  measureType: MeasureType
  priority: Priority
  responsible?: string
  dueDate?: string
  status: MeasureStatus
  implementedAt?: string
  effectivenessScore?: number
  followUpNotes?: string
  createdAt: string
  updatedAt: string
}

export interface CausalTreeAnalysis {
  id: string
  tenantId: string
  incidentId: string
  title: string
  finalEvent: string
  description: string
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed' | 'archived'
  nodes: CausalNode[]
  rootCauses: string[]
  preventiveMeasures: PreventiveMeasure[]
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface CausalTreeValidation {
  isValid: boolean
  completeness: number
  qualityScore: number
  issues: string[]
  suggestions: string[]
  hasRootCauses: boolean
  hasMeasures: boolean
  objectivityScore: number
}

export interface CausalTreeMetrics {
  totalNodes: number
  rootCauseCount: number
  intermediateCount: number
  maxDepth: number
  branchingFactor: number
  measuresCount: number
  implementedMeasures: number
  timeToComplete?: number
}

// DTOs for API calls
export interface CreateCausalTreeAnalysisDTO {
  incidentId: string
  title: string
  finalEvent: string
  description: string
  analysisTeam?: string[]
}

export interface UpdateCausalTreeAnalysisDTO {
  title?: string
  finalEvent?: string
  description?: string
  analysisTeam?: string[]
}

export interface AddCausalNodeDTO {
  analysisId: string
  fact: string
  nodeType: NodeType
  relationType: RelationType
  parentNodes: string[]
  evidence?: string[]
  position: NodePosition
}

export interface UpdateCausalNodeDTO {
  fact?: string
  nodeType?: NodeType
  relationType?: RelationType
  parentNodes?: string[]
  evidence?: string[]
  position?: NodePosition
  isRootCause?: boolean
}

export interface AddPreventiveMeasureDTO {
  analysisId: string
  targetCauseId: string
  description: string
  measureType: MeasureType
  priority: Priority
  responsible?: string
  dueDate?: string
}

export interface UpdatePreventiveMeasureDTO {
  description?: string
  measureType?: MeasureType
  priority?: Priority
  responsible?: string
  dueDate?: string
  status?: MeasureStatus
  effectivenessScore?: number
  followUpNotes?: string
}

// Response types
export interface CausalTreeAnalysisListResponse {
  analyses: CausalTreeAnalysis[]
  total: number
  limit: number
  offset: number
}

// Filter for listing analyses
export interface CausalTreeAnalysisFilter {
  incidentId?: string
  status?: string
  leadAnalyst?: string
  dateFrom?: string
  dateTo?: string
  hasRootCauses?: boolean
  hasMeasures?: boolean
  minQualityScore?: number
  limit?: number
  offset?: number
}

// UI specific types for react-flow
export interface ReactFlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    causalNode: CausalNode
    onEdit?: (node: CausalNode) => void
    onDelete?: (nodeId: string) => void
    onMarkAsRootCause?: (nodeId: string) => void
  }
}

export interface ReactFlowEdge {
  id: string
  source: string
  target: string
  type?: string
  animated?: boolean
  label?: string
  style?: React.CSSProperties
}
