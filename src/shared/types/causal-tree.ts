// ============================================================================
// Causal Tree (Árbol de Causas) Types
// ============================================================================

export type NodeType = 'final_event' | 'intermediate' | 'root_cause'

export type RelationType = 'chain' | 'conjunctive' | 'disjunctive'

// FactType: Define si el hecho es una variación o condición permanente
// Círculo = Variación, Cuadrado = Permanente
export type FactType = 'variacion' | 'permanente'

// LinkType: Define el nivel de confianza de la relación causal
// Línea sólida = Confirmada, Línea punteada = Aparente
export type LinkType = 'confirmada' | 'aparente'

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
  numero: number              // Número del hecho en la lista (1, 2, 3...)
  fact: string
  nodeType: NodeType
  factType: FactType          // variacion (círculo) o permanente (cuadrado)
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

// NodeRelation representa la relación entre dos nodos con tipo de vínculo
export interface NodeRelation {
  id: string
  childNodeId: string    // Nodo hijo (efecto)
  parentNodeId: string   // Nodo padre (causa)
  linkType: LinkType     // confirmada o aparente
  createdAt: string
}

// ParentLink para DTOs - representa un nodo padre con su tipo de vínculo
export interface ParentLink {
  parentNodeId: string
  linkType: LinkType
}

export interface PreventiveMeasure {
  id: string
  analysisId: string
  targetCauseId: string
  description?: string
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
  description?: string
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed' | 'archived'
  nodes: CausalNode[]
  relations: NodeRelation[]  // Relaciones entre nodos con tipo de vinculación
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
  description?: string
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
  factType: FactType          // variacion o permanente
  relationType: RelationType
  parentNodes?: string[]      // IDs de nodos que son CAUSAS de este nodo (este nodo es efecto)
  parentLinks?: ParentLink[]  // Relaciones donde este nodo es el efecto
  effectNodeId?: string       // ID del nodo que es EFECTO de este nodo (este nodo es causa)
  evidence?: string[]
  position?: NodePosition
}

export interface UpdateCausalNodeDTO {
  fact?: string
  nodeType?: NodeType
  factType?: FactType
  relationType?: RelationType
  parentNodes?: string[]
  parentLinks?: ParentLink[]
  evidence?: string[]
  position?: NodePosition
  isRootCause?: boolean
}

export interface AddPreventiveMeasureDTO {
  analysisId: string
  targetCauseId: string
  description?: string
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
    onAddCause?: (parentNodeId: string) => void
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
  data?: {
    linkType: LinkType
  }
}

// Constantes para UI
export const FACT_TYPE_LABELS: Record<FactType, string> = {
  variacion: 'Variación',
  permanente: 'Permanente',
}

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  confirmada: 'Confirmada',
  aparente: 'Aparente',
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  final_event: 'Evento Final',
  intermediate: 'Intermedio',
  root_cause: 'Causa Raíz',
}

export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  chain: 'Cadena (A → B)',
  conjunctive: 'Conjuntiva (A ∧ B)',
  disjunctive: 'Disyuntiva (A ∨ B)',
}
