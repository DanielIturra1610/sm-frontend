'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'
import type { Company } from '@/shared/types/api'

interface TenantContextType {
  currentTenant: Company | null;
  tenants: Company[];
  switchTenant: (tenantId: string) => Promise<void>;
  isLoading: boolean;
  loadTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider')
  }
  return context
}

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<Company | null>(null)
  const [tenants, setTenants] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // DO NOT auto-load tenants on mount - let the auth flow handle it
  // This prevents unauthorized API calls when user is not logged in

  const loadTenants = async () => {
    try {
      setIsLoading(true)

      // Check if user has a token before calling API
      const token = await api.getToken()
      if (!token) {
        setTenants([])
        setIsLoading(false)
        return
      }

      const companies = await api.companies.list()
      setTenants(companies)

      // Set first as current if none selected
      if (companies.length > 0 && !currentTenant) {
        setCurrentTenant(companies[0])
      }
    } catch (error) {
      console.error('Error loading tenants:', error)
      setTenants([])
    } finally {
      setIsLoading(false)
    }
  }

  const switchTenant = async (tenantId: string) => {
    try {
      // Call the API to select the tenant - backend will return new token with tenant_id
      const response = await api.companies.selectTenant(tenantId)

      // Update the token with the new one that includes tenant_id
      if (response.token) {
        await api.updateToken(response.token)
      }

      // Update the current tenant in state
      const tenant = tenants.find(t => t.id === tenantId)
      if (tenant) {
        setCurrentTenant(tenant)
      }

      // Reload tenants to get updated information
      await loadTenants()
    } catch (error) {
      console.error('Error switching tenant:', error)
      throw error
    }
  }

  const value: TenantContextType = {
    currentTenant,
    tenants,
    switchTenant,
    isLoading,
    loadTenants
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}