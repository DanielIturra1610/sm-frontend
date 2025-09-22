/**
 * Stegmaier Management - API Client
 * Connects to 100% tested and operational Go backend
 */

import { env, apiConfig } from './env'
import { StegmaierApiError } from './errors'
import type {
  // Authentication
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,

  // Companies
  Company,
  CreateCompanyData,

  // Incidents
  Incident,
  CreateIncidentData,
  UpdateIncidentData,
  IncidentListParams,
  IncidentListResponse,

  // Analysis
  FiveWhysAnalysis,
  CreateFiveWhysData,
  FishboneAnalysis,
  CreateFishboneData,

  // Documents
  Document,
  GenerateDocumentRequest,
  DocumentListResponse,
} from '@/shared/types/api'

// ============================================================================
// API ERROR HANDLING
// ============================================================================
// StegmaierApiError is imported from './errors'

// ============================================================================
// MAIN API CLIENT
// ============================================================================

class ApiClient {
  private baseURL = env.NEXT_PUBLIC_API_URL
  private timeout = apiConfig.timeout
  private retries = apiConfig.retries
  private retryDelay = apiConfig.retryDelay

  /**
   * Get authentication token from storage
   */
  private async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null

    // Check localStorage first
    const token = localStorage.getItem('auth-token')
    if (token) return token

    // Check sessionStorage as fallback
    return sessionStorage.getItem('auth-token')
  }

  /**
   * Set authentication token in storage
   */
  private async setToken(token: string): Promise<void> {
    if (typeof window === 'undefined') return

    localStorage.setItem('auth-token', token)
  }

  /**
   * Remove authentication token from storage
   */
  private async removeToken(): Promise<void> {
    if (typeof window === 'undefined') return

    localStorage.removeItem('auth-token')
    sessionStorage.removeItem('auth-token')
  }

  /**
   * Redirect to login page
   */
  private async redirectToLogin(): Promise<void> {
    if (typeof window === 'undefined') return

    // Clear tokens
    await this.removeToken()

    // Redirect to login
    const currentPath = window.location.pathname
    const loginUrl = `/login${currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`
    window.location.href = loginUrl
  }

  /**
   * Build query string from parameters
   */
  private toQueryString(params?: Record<string, unknown>): string {
    if (!params) return ''

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Core request method with retry logic and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = await this.getToken()

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
        console.log(`🔌 API Request [${options.method || 'GET'}]:`, url, {
          headers,
          body: options.body,
        })
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle authentication errors immediately
      if (response.status === 401) {
        await this.redirectToLogin()
        throw new StegmaierApiError(401, 'Unauthorized - redirecting to login')
      }

      // Parse response body
      let responseData: unknown
      const contentType = response.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = { message: await response.text() }
      }

      if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
        console.log(`🔌 API Response [${response.status}]:`, responseData)
      }

      // Handle successful responses
      if (response.ok) {
        const typedData = responseData as { data?: T } | T
        return (typedData && typeof typedData === 'object' && 'data' in typedData)
          ? typedData.data as T
          : typedData as T
      }

      // Handle error responses
      const errorData = responseData as {
        message?: string;
        code?: string;
        details?: Record<string, unknown>
      }
      const error = new StegmaierApiError(
        response.status,
        errorData.message || `Request failed with status ${response.status}`,
        errorData.code,
        errorData.details
      )

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw error
      }

      // Retry server errors (5xx) and network errors
      if (attempt < this.retries) {
        await this.sleep(this.retryDelay * attempt)
        return this.request<T>(endpoint, options, attempt + 1)
      }

      throw error

    } catch (error) {
      clearTimeout(timeoutId)

      // Handle network errors and timeouts
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TypeError')) {
        const networkError = new StegmaierApiError(
          0,
          error.name === 'AbortError' ? 'Request timeout' : 'Network error',
          'NETWORK_ERROR'
        )

        // Retry network errors
        if (attempt < this.retries) {
          await this.sleep(this.retryDelay * attempt)
          return this.request<T>(endpoint, options, attempt + 1)
        }

        throw networkError
      }

      // Re-throw API errors and other errors
      throw error
    }
  }

  // ========================================================================
  // AUTHENTICATION ENDPOINTS
  // ========================================================================

  auth = {
    /**
     * User login
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      // Store token on successful login
      if (response.token) {
        await this.setToken(response.token)
      }

      return response
    },

    /**
     * User registration
     */
    register: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      // Store token on successful registration
      if (response.token) {
        await this.setToken(response.token)
      }

      return response
    },

    /**
     * Refresh authentication token
     */
    refresh: async (): Promise<AuthResponse> => {
      return this.request<AuthResponse>('/auth/refresh', {
        method: 'POST',
      })
    },

    /**
     * Get current user profile
     */
    profile: async (): Promise<User> => {
      return this.request<User>('/auth/profile')
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
      try {
        await this.request<void>('/auth/logout', {
          method: 'POST',
        })
      } finally {
        // Always clear local token regardless of API response
        await this.removeToken()
      }
    },
  }

  // ========================================================================
  // MULTI-TENANT ENDPOINTS
  // ========================================================================

  companies = {
    /**
     * List user companies
     */
    list: async (): Promise<Company[]> => {
      return this.request<Company[]>('/companies')
    },

    /**
     * Create new company
     */
    create: async (data: CreateCompanyData): Promise<Company> => {
      return this.request<Company>('/companies', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    /**
     * Get company details
     */
    getById: async (id: string): Promise<Company> => {
      return this.request<Company>(`/companies/${id}`)
    },

    /**
     * Update company
     */
    update: async (id: string, data: Partial<CreateCompanyData>): Promise<Company> => {
      return this.request<Company>(`/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    /**
     * Delete company
     */
    delete: async (id: string): Promise<void> => {
      return this.request<void>(`/companies/${id}`, {
        method: 'DELETE',
      })
    },

    /**
     * Select tenant/company
     */
    selectTenant: async (companyId: string): Promise<void> => {
      return this.request<void>(`/companies/${companyId}/select`, {
        method: 'POST',
      })
    },
  }

  // ========================================================================
  // INCIDENT MANAGEMENT ENDPOINTS
  // ========================================================================

  incidents = {
    /**
     * List incidents with optional filtering
     */
    list: async (params?: IncidentListParams): Promise<IncidentListResponse> => {
      const queryString = this.toQueryString(params as Record<string, unknown>)
      return this.request<IncidentListResponse>(`/incidents${queryString}`)
    },

    /**
     * Create new incident
     */
    create: async (data: CreateIncidentData): Promise<Incident> => {
      return this.request<Incident>('/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    /**
     * Get incident by ID
     */
    getById: async (id: string): Promise<Incident> => {
      return this.request<Incident>(`/incidents/${id}`)
    },

    /**
     * Update incident
     */
    update: async (id: string, data: UpdateIncidentData): Promise<Incident> => {
      return this.request<Incident>(`/incidents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    /**
     * Delete incident
     */
    delete: async (id: string): Promise<void> => {
      return this.request<void>(`/incidents/${id}`, {
        method: 'DELETE',
      })
    },

    /**
     * Submit incident for review
     */
    submit: async (id: string): Promise<Incident> => {
      return this.request<Incident>(`/incidents/${id}/submit`, {
        method: 'POST',
      })
    },
  }

  // ========================================================================
  // ROOT CAUSE ANALYSIS ENDPOINTS
  // ========================================================================

  analysis = {
    fiveWhys: {
      /**
       * Create Five Whys analysis
       */
      create: async (data: CreateFiveWhysData): Promise<FiveWhysAnalysis> => {
        return this.request<FiveWhysAnalysis>('/analysis/five-whys', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      /**
       * Get Five Whys analysis by ID
       */
      getById: async (id: string): Promise<FiveWhysAnalysis> => {
        return this.request<FiveWhysAnalysis>(`/analysis/five-whys/${id}`)
      },

      /**
       * Update Five Whys analysis
       */
      update: async (id: string, data: Partial<CreateFiveWhysData>): Promise<FiveWhysAnalysis> => {
        return this.request<FiveWhysAnalysis>(`/analysis/five-whys/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      },
    },

    fishbone: {
      /**
       * Create Fishbone analysis
       */
      create: async (data: CreateFishboneData): Promise<FishboneAnalysis> => {
        return this.request<FishboneAnalysis>('/analysis/fishbone', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      /**
       * Get Fishbone analysis by ID
       */
      getById: async (id: string): Promise<FishboneAnalysis> => {
        return this.request<FishboneAnalysis>(`/analysis/fishbone/${id}`)
      },

      /**
       * Update Fishbone analysis
       */
      update: async (id: string, data: Partial<CreateFishboneData>): Promise<FishboneAnalysis> => {
        return this.request<FishboneAnalysis>(`/analysis/fishbone/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
      },
    },
  }

  // ========================================================================
  // DOCUMENT GENERATION ENDPOINTS
  // ========================================================================

  documents = {
    /**
     * Generate document
     */
    generate: async (request: GenerateDocumentRequest): Promise<Document> => {
      return this.request<Document>('/documents/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      })
    },

    /**
     * Get document by ID
     */
    getById: async (id: string): Promise<Document> => {
      return this.request<Document>(`/documents/${id}`)
    },

    /**
     * Download document
     */
    download: async (id: string): Promise<Blob> => {
      const response = await fetch(`${this.baseURL}/documents/${id}/download`, {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
        },
      })

      if (!response.ok) {
        throw new StegmaierApiError(response.status, 'Failed to download document')
      }

      return response.blob()
    },

    /**
     * List documents
     */
    list: async (params?: { type?: string; status?: string }): Promise<DocumentListResponse> => {
      const queryString = this.toQueryString(params as Record<string, unknown>)
      return this.request<DocumentListResponse>(`/documents${queryString}`)
    },
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const api = new ApiClient()

// Export types for use in components
export { StegmaierApiError } from './errors'
export type { ApiClient }