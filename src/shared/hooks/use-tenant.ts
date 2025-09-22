/**
 * Stegmaier Management - Multi-Tenant Hook
 * Manages tenant/company switching and context
 */

import React, { useState, useEffect, createContext, useContext } from 'react'
import { api } from '@/lib/api'
import { useCompanies } from './use-api'
import type { Company } from '@/shared/types/api'

// ============================================================================
// TENANT CONTEXT
// ============================================================================

interface TenantContextType {
  currentTenant: Company | null
  tenants: Company[]
  switchTenant: (tenantId: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

// ============================================================================
// TENANT PROVIDER COMPONENT
// ============================================================================

interface TenantProviderProps {
  children: React.ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch user companies
  const {
    data: tenants = [],
    error: tenantsError,
    isLoading: tenantsLoading,
  } = useCompanies()

  // Load current tenant from localStorage on mount
  useEffect(() => {
    const loadCurrentTenant = () => {
      try {
        if (typeof window === 'undefined') return

        const savedTenantId = localStorage.getItem('current-tenant-id')
        if (savedTenantId && tenants.length > 0) {
          const tenant = tenants.find(t => t.id === savedTenantId)
          if (tenant) {
            setCurrentTenant(tenant)
            setIsLoading(false)
            return
          }
        }

        // If no saved tenant or tenant not found, use first available
        if (tenants.length > 0) {
          setCurrentTenant(tenants[0])
          localStorage.setItem('current-tenant-id', tenants[0].id)
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load current tenant:', err)
        setError(err instanceof Error ? err : new Error('Failed to load tenant'))
        setIsLoading(false)
      }
    }

    if (!tenantsLoading) {
      loadCurrentTenant()
    }
  }, [tenants, tenantsLoading])

  // Handle tenants error
  useEffect(() => {
    if (tenantsError) {
      setError(tenantsError)
      setIsLoading(false)
    }
  }, [tenantsError])

  const switchTenant = async (tenantId: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      // Find the tenant
      const tenant = tenants.find(t => t.id === tenantId)
      if (!tenant) {
        throw new Error('Tenant not found')
      }

      // Call API to switch tenant on backend
      await api.companies.selectTenant(tenantId)

      // Update local state
      setCurrentTenant(tenant)

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('current-tenant-id', tenantId)
      }

      setIsLoading(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to switch tenant')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }

  const contextValue: TenantContextType = {
    currentTenant,
    tenants,
    switchTenant,
    isLoading: isLoading || tenantsLoading,
    error,
  }

  return React.createElement(
    TenantContext.Provider,
    { value: contextValue },
    children
  )
}

// ============================================================================
// TENANT HOOK
// ============================================================================

/**
 * Hook to access tenant context
 */
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

// ============================================================================
// TENANT UTILITIES
// ============================================================================

/**
 * Get tenant-specific configuration
 */
export function useTenantConfig() {
  const { currentTenant } = useTenant()

  return {
    // Feature flags from tenant settings
    features: currentTenant?.settings?.features || {
      fiveWhysAnalysis: true,
      fishboneAnalysis: true,
      documentGeneration: true,
      workflowEngine: true,
      customTemplates: false,
    },

    // Branding configuration
    branding: currentTenant?.settings?.branding || {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
    },

    // Localization settings
    locale: {
      timezone: currentTenant?.settings?.timezone || 'UTC',
      dateFormat: currentTenant?.settings?.dateFormat || 'MM/dd/yyyy',
      language: currentTenant?.settings?.language || 'en',
    },

    // Subscription info
    subscription: currentTenant?.subscription || {
      plan: 'free',
      status: 'active',
      expiresAt: '',
      features: [],
    },
  }
}

/**
 * Check if a feature is enabled for current tenant
 */
export function useFeatureFlag(feature: string) {
  const { features } = useTenantConfig()
  return (features as unknown as Record<string, boolean>)[feature] || false
}

/**
 * Get tenant-aware API base URL
 */
export function useTenantApiUrl() {
  const { currentTenant } = useTenant()

  // In a real multi-tenant setup, you might have tenant-specific subdomains
  // For now, we'll use the same API URL but the backend will handle tenant context
  return {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    tenantId: currentTenant?.id,
    tenantDomain: currentTenant?.domain,
  }
}

/**
 * Local storage utilities with tenant context
 */
export function useTenantStorage() {
  const { currentTenant } = useTenant()

  const getKey = (key: string) => {
    return currentTenant ? `${currentTenant.id}:${key}` : key
  }

  return {
    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(getKey(key))
    },

    setItem: (key: string, value: string): void => {
      if (typeof window === 'undefined') return
      localStorage.setItem(getKey(key), value)
    },

    removeItem: (key: string): void => {
      if (typeof window === 'undefined') return
      localStorage.removeItem(getKey(key))
    },

    clear: (): void => {
      if (typeof window === 'undefined' || !currentTenant) return

      // Only clear items for current tenant
      const prefix = `${currentTenant.id}:`
      const keysToRemove: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))
    },
  }
}

/**
 * Hook for tenant switching UI
 */
export function useTenantSwitcher() {
  const { currentTenant, tenants, switchTenant, isLoading } = useTenant()
  const [isSwitching, setIsSwitching] = useState(false)

  const handleSwitchTenant = async (tenantId: string) => {
    if (tenantId === currentTenant?.id) return

    setIsSwitching(true)
    try {
      await switchTenant(tenantId)
      // Optionally reload the page to ensure clean state
      // window.location.reload()
    } catch (error) {
      console.error('Failed to switch tenant:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSwitching(false)
    }
  }

  return {
    currentTenant,
    tenants,
    switchTenant: handleSwitchTenant,
    isLoading: isLoading || isSwitching,
    canSwitch: tenants.length > 1,
  }
}