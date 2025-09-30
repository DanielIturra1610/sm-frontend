/**
 * Zod schemas for form validation
 * Based on the API types for the Stegmaier Management system
 */

import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Nombre completo debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  password_confirm: z.string(),
}).refine(data => data.password === data.password_confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirm'],
});

// Company schemas
export const companySchema = z.object({
  name: z.string().min(2, 'Nombre de la empresa es requerido'),
  domain: z.string().min(2, 'Dominio es requerido'),
  industry: z.string().min(2, 'Industria es requerida'),
  size: z.enum(['small', 'medium', 'large', 'enterprise']),
  country: z.string().min(2, 'País es requerido'),
  description: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  settings: z.object({
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    language: z.string().optional(),
    features: z.object({
      fiveWhysAnalysis: z.boolean().optional(),
      fishboneAnalysis: z.boolean().optional(),
      documentGeneration: z.boolean().optional(),
      workflowEngine: z.boolean().optional(),
      customTemplates: z.boolean().optional(),
    }).optional(),
    branding: z.object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      logo: z.string().optional(),
      favicon: z.string().optional(),
    }).optional(),
  }).optional(),
});

// Incident schemas
export const incidentSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.enum(['safety', 'security', 'environmental', 'quality', 'operational']),
  location: z.string().min(2, 'La ubicación es requerida'),
  tags: z.array(z.string()).optional(),
});

// 5 Whys analysis schema
export const fiveWhysSchema = z.object({
  incidentId: z.string().min(1, 'ID del incidente es requerido'),
  problem: z.string().min(10, 'La descripción del problema es requerida'),
  whys: z.array(
    z.object({
      question: z.string().min(1, 'La pregunta es requerida'),
      answer: z.string().min(1, 'La respuesta es requerida'),
    })
  ).min(1, 'Debe haber al menos una pregunta por qué').max(10, 'No puede haber más de 10 preguntas por qué'),
});

// Fishbone analysis schema
export const fishboneSchema = z.object({
  incidentId: z.string().min(1, 'ID del incidente es requerido'),
  problem: z.string().min(10, 'La descripción del problema es requerida'),
  categories: z.array(
    z.object({
      name: z.string().min(2, 'Nombre de categoría es requerido'),
      causes: z.array(
        z.object({
          description: z.string().min(5, 'La causa debe tener al menos 5 caracteres'),
          subCauses: z.array(z.string()).optional(),
          evidence: z.array(z.string()).optional(),
        })
      ).optional(),
    })
  ).min(1, 'Debe haber al menos una categoría').max(10, 'No puede haber más de 10 categorías'),
});

// Document generation schema
export const documentGenerationSchema = z.object({
  type: z.enum(['incident_report', 'analysis_report', 'action_plan', 'compliance_report']),
  templateId: z.string().min(1, 'ID de plantilla es requerido'),
  data: z.record(z.unknown()),
  format: z.enum(['pdf', 'docx', 'html']).optional().default('pdf'),
});

// Workflow schema
export const workflowSchema = z.object({
  name: z.string().min(2, 'Nombre es requerido'),
  description: z.string().optional(),
  steps: z.array(
    z.object({
      name: z.string().min(2, 'Nombre del paso es requerido'),
      description: z.string().optional(),
      type: z.enum(['approval', 'task', 'notification', 'automation']),
      assignee: z.string().min(1, 'Asignado a es requerido'),
      requiredApprovals: z.number().min(1, 'Requiere al menos 1 aprobación').optional().default(1),
      permissions: z.array(z.string()).optional(),
    })
  ).min(1, 'Debe haber al menos un paso'),
  triggers: z.array(
    z.object({
      event: z.enum(['incident_created', 'incident_submitted', 'status_changed', 'custom']),
      conditions: z.array(
        z.object({
          field: z.string().min(1, 'Campo es requerido'),
          operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains']),
          value: z.any(),
        })
      ).optional(),
    })
  ).optional(),
});

// User profile schema
export const userProfileSchema = z.object({
  full_name: z.string().min(2, 'Nombre completo es requerido'),
  phone: z.string().optional(),
});

// Change password schema
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Contraseña actual es requerida'),
  new_password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  password_confirm: z.string(),
}).refine(data => data.new_password === data.password_confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirm'],
});