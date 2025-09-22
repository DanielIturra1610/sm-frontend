/**
 * Environment Configuration for Stegmaier Management
 * Type-safe environment variables with validation
 */

import { z } from 'zod'

// Environment schema definition
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url('Invalid API URL'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url('Invalid API base URL'),

  // Application Configuration
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'App name is required'),
  NEXT_PUBLIC_APP_VERSION: z.string().min(1, 'App version is required'),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1, 'App description is required'),

  // Authentication
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL').optional(),
  NEXTAUTH_SECRET: z.string().min(1, 'NextAuth secret is required').optional(),

  // File Upload Configuration
  NEXT_PUBLIC_MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()),
  NEXT_PUBLIC_ALLOWED_FILE_TYPES: z.string().min(1, 'Allowed file types required'),

  // Development Flags
  NEXT_PUBLIC_DEBUG_MODE: z.string().transform(val => val === 'true'),
  NEXT_PUBLIC_SHOW_API_LOGS: z.string().transform(val => val === 'true'),

  // Multi-tenant Configuration
  NEXT_PUBLIC_DEFAULT_TENANT: z.string().min(1, 'Default tenant is required'),
  NEXT_PUBLIC_ENABLE_TENANT_SIGNUP: z.string().transform(val => val === 'true'),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_FIVE_WHYS_ANALYSIS: z.string().transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_FISHBONE_ANALYSIS: z.string().transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_DOCUMENT_GENERATION: z.string().transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_WORKFLOW_ENGINE: z.string().transform(val => val === 'true'),
})

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
      NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXT_PUBLIC_MAX_FILE_SIZE: process.env.NEXT_PUBLIC_MAX_FILE_SIZE,
      NEXT_PUBLIC_ALLOWED_FILE_TYPES: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
      NEXT_PUBLIC_SHOW_API_LOGS: process.env.NEXT_PUBLIC_SHOW_API_LOGS,
      NEXT_PUBLIC_DEFAULT_TENANT: process.env.NEXT_PUBLIC_DEFAULT_TENANT,
      NEXT_PUBLIC_ENABLE_TENANT_SIGNUP: process.env.NEXT_PUBLIC_ENABLE_TENANT_SIGNUP,
      NEXT_PUBLIC_ENABLE_FIVE_WHYS_ANALYSIS: process.env.NEXT_PUBLIC_ENABLE_FIVE_WHYS_ANALYSIS,
      NEXT_PUBLIC_ENABLE_FISHBONE_ANALYSIS: process.env.NEXT_PUBLIC_ENABLE_FISHBONE_ANALYSIS,
      NEXT_PUBLIC_ENABLE_DOCUMENT_GENERATION: process.env.NEXT_PUBLIC_ENABLE_DOCUMENT_GENERATION,
      NEXT_PUBLIC_ENABLE_WORKFLOW_ENGINE: process.env.NEXT_PUBLIC_ENABLE_WORKFLOW_ENGINE,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join('\n')

      throw new Error(`Environment validation failed:\n${formattedErrors}`)
    }
    throw error
  }
}

// Export validated environment
export const env = validateEnv()

// Type for environment variables
export type Environment = z.infer<typeof envSchema>

// Helper functions
export const isProduction = () => process.env.NODE_ENV === 'production'
export const isDevelopment = () => process.env.NODE_ENV === 'development'
export const isDebugMode = () => env.NEXT_PUBLIC_DEBUG_MODE

// Feature flag helpers
export const features = {
  fiveWhysAnalysis: () => env.NEXT_PUBLIC_ENABLE_FIVE_WHYS_ANALYSIS,
  fishboneAnalysis: () => env.NEXT_PUBLIC_ENABLE_FISHBONE_ANALYSIS,
  documentGeneration: () => env.NEXT_PUBLIC_ENABLE_DOCUMENT_GENERATION,
  workflowEngine: () => env.NEXT_PUBLIC_ENABLE_WORKFLOW_ENGINE,
  tenantSignup: () => env.NEXT_PUBLIC_ENABLE_TENANT_SIGNUP,
} as const

// API configuration
export const apiConfig = {
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
} as const

// File upload configuration
export const fileConfig = {
  maxSize: env.NEXT_PUBLIC_MAX_FILE_SIZE,
  allowedTypes: env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',').map(type => type.trim()),
  maxFiles: 5, // Maximum files per upload
} as const

// Application metadata
export const appConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  version: env.NEXT_PUBLIC_APP_VERSION,
  description: env.NEXT_PUBLIC_APP_DESCRIPTION,
  defaultTenant: env.NEXT_PUBLIC_DEFAULT_TENANT,
} as const