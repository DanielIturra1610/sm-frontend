/**
 * Report Validation Schemas
 * Zod schemas for all report types with proper validation rules
 */

import { z } from 'zod'

// ============================================================================
// FLASH REPORT SCHEMA
// ============================================================================

// PLGF Levels
export const plgfLevelSchema = z.enum(['potencial', 'real', 'fatal'])
export type PLGFLevel = z.infer<typeof plgfLevelSchema>

export const flashReportSchema = z.object({
  incident_id: z.string().uuid('Debe ser un UUID válido'),
  suceso: z.string().optional(),
  tipo: z.string().optional(),
  fecha: z.string().optional(),
  hora: z.string().optional(),
  lugar: z.string().optional(),
  area_zona: z.string().optional(),
  empresa: z.string().optional(),
  supervisor: z.string().optional(),
  descripcion: z.string().optional(),
  acciones_inmediatas: z.string().optional(),
  controles_inmediatos: z.string().optional(),
  factores_riesgo: z.string().optional(),
  numero_prodity: z.string().optional(),
  zonal: z.string().optional(),
  con_baja_il: z.boolean().default(false),
  sin_baja_il: z.boolean().default(false),
  incidente_industrial: z.boolean().default(false),
  incidente_laboral: z.boolean().default(false),
  // PLGF Classification
  es_plgf: z.boolean().default(false),
  nivel_plgf: plgfLevelSchema.optional(),
  justificacion_plgf: z.string().optional(),
})

export type FlashReportFormData = z.infer<typeof flashReportSchema>

// ============================================================================
// IMMEDIATE ACTIONS SCHEMA
// ============================================================================

export const immediateActionItemSchema = z.object({
  numero: z.number().int().positive('Debe ser un número positivo'),
  tarea: z.string().min(1, 'La tarea es requerida'),
  inicio: z.string().optional(),
  fin: z.string().optional(),
  responsable: z.string().optional(),
  cliente: z.string().optional(),
  avance_real: z.number().int().min(0).max(100).default(0),
  avance_programado: z.number().int().min(0).max(100).default(0),
  comentario: z.string().optional(),
  tipo_acc_inc: z.string().optional(),
})

export const immediateActionsReportSchema = z.object({
  incident_id: z.string().uuid('Debe ser un UUID válido'),
  fecha_inicio: z.string().optional(),
  fecha_termino: z.string().optional(),
  items: z.array(immediateActionItemSchema).optional(),
})

export type ImmediateActionsReportFormData = z.infer<typeof immediateActionsReportSchema>
export type ImmediateActionItemFormData = z.infer<typeof immediateActionItemSchema>

// ============================================================================
// ROOT CAUSE SCHEMA
// ============================================================================

export const whyQuestionSchema = z.object({
  numero: z.number().int().positive(),
  pregunta: z.string().min(1, 'La pregunta es requerida'),
  respuesta: z.string().min(1, 'La respuesta es requerida'),
})

export const rootCauseAnalysisTableSchema = z.object({
  table_number: z.number().int().positive(),
  hecho_observacion: z.string().min(1, 'El hecho u observación es requerido'),
  porques: z.array(whyQuestionSchema).optional(),
  accion_plan: z.string().optional(),
})

export const rootCauseReportSchema = z.object({
  incident_id: z.string().uuid('Debe ser un UUID válido'),
  metodologia: z.enum(['five_whys', 'fishbone', 'six_sigma', 'fmea', 'other'], {
    required_error: 'Debe seleccionar una metodología',
  }),
  analysis_tables: z.array(rootCauseAnalysisTableSchema).optional(),
})

export type RootCauseReportFormData = z.infer<typeof rootCauseReportSchema>
export type RootCauseAnalysisTableFormData = z.infer<typeof rootCauseAnalysisTableSchema>
export type WhyQuestionFormData = z.infer<typeof whyQuestionSchema>

// ============================================================================
// ACTION PLAN SCHEMA
// ============================================================================

export const actionPlanItemSchema = z.object({
  numero: z.number().int().positive('Debe ser un número positivo'),
  tarea: z.string().min(1, 'La tarea es requerida'),
  subtarea: z.string().optional(),
  inicio: z.string().optional(),
  fin: z.string().optional(),
  responsable: z.string().optional(),
  cliente: z.string().optional(),
  avance_real: z.number().int().min(0).max(100).default(0),
  avance_programado: z.number().int().min(0).max(100).default(0),
  comentario: z.string().optional(),
  tipo_acc_inc: z.string().optional(),
})

export const actionPlanReportSchema = z.object({
  incident_id: z.string().uuid('Debe ser un UUID válido'),
  fecha_inicio: z.string().optional(),
  duracion_dias: z.number().int().positive().optional(),
  items: z.array(actionPlanItemSchema).optional(),
})

export type ActionPlanReportFormData = z.infer<typeof actionPlanReportSchema>
export type ActionPlanItemFormData = z.infer<typeof actionPlanItemSchema>

// ============================================================================
// FINAL REPORT SCHEMA
// ============================================================================

export const companyDataSchema = z.object({
  nombre: z.string().optional(),
  direccion: z.string().optional(),
  rut: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  contacto: z.string().optional(),
})

export const personaInvolucradaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  cargo: z.string().optional(),
  empresa: z.string().optional(),
  tipo_lesion: z.string().optional(),
  gravedad: z.string().optional(),
  parte_cuerpo: z.string().optional(),
  descripcion: z.string().optional(),
})

export const equipoDanadoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  tipo: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numero_serie: z.string().optional(),
  tipo_dano: z.string().optional(),
  descripcion: z.string().optional(),
  costo_estimado: z.number().nonnegative().optional(),
})

export const costoItemSchema = z.object({
  concepto: z.string().min(1, 'El concepto es requerido'),
  monto: z.number().positive('El monto debe ser positivo'),
  moneda: z.string().min(1, 'La moneda es requerida'),
  descripcion: z.string().optional(),
})

export const finalReportSchema = z.object({
  incident_id: z.string().uuid('Debe ser un UUID válido'),
  company_data: companyDataSchema.optional(),
  tipo_accidente_tabla: z.object({
    con_baja_il: z.boolean().default(false),
    sin_baja_il: z.boolean().default(false),
    incidente_industrial: z.boolean().default(false),
    incidente_laboral: z.boolean().default(false),
    // PLGF Classification
    es_plgf: z.boolean().default(false),
    nivel_plgf: plgfLevelSchema.optional(),
  }).optional(),
  personas_involucradas: z.array(personaInvolucradaSchema).optional(),
  equipos_danados: z.array(equipoDanadoSchema).optional(),
  detalles_accidente: z.string().optional(),
  descripcion_detallada: z.string().optional(),
  conclusiones: z.string().optional(),
  lecciones_aprendidas: z.string().optional(),
  acciones_inmediatas_resumen: z.string().optional(),
  plan_accion_resumen: z.string().optional(),
  costos_tabla: z.array(costoItemSchema).optional(),
})

export type FinalReportFormData = z.infer<typeof finalReportSchema>

// ============================================================================
// ZERO TOLERANCE SCHEMA
// ============================================================================

export const fotografiaSchema = z.object({
  url: z.string().url('Debe ser una URL válida'),
  descripcion: z.string().optional(),
  fecha: z.string().optional(),
})

export const personaInvolucradaZTSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  cargo: z.string().optional(),
  empresa: z.string().optional(),
})

export const zeroToleranceReportSchema = z.object({
  incident_id: z.string().uuid().optional(),
  numero_documento: z.string().optional(),
  suceso: z.string().optional(),
  tipo: z.string().optional(),
  lugar: z.string().optional(),
  fecha_hora: z.string().optional(),
  area_zona: z.string().optional(),
  empresa: z.string().optional(),
  supervisor_cge: z.string().optional(),
  descripcion: z.string().optional(),
  numero_prodity: z.string().optional(),
  fotografias: z.array(fotografiaSchema).optional(),
  severidad: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  acciones_tomadas: z.string().optional(),
  personas_involucradas: z.array(personaInvolucradaZTSchema).optional(),
})

export type ZeroToleranceReportFormData = z.infer<typeof zeroToleranceReportSchema>

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ReportFormData =
  | FlashReportFormData
  | ImmediateActionsReportFormData
  | RootCauseReportFormData
  | ActionPlanReportFormData
  | FinalReportFormData
  | ZeroToleranceReportFormData
