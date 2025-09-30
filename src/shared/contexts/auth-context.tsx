'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api } from '@/lib/api'
import type { User, AuthResponse, Company, CreateCompanyData } from '@/shared/types/api'

  interface AuthContextType {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  companies: Company[]
  selectedCompany: Company | null
  isLoadingCompanies: boolean

  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (data: { full_name: string; phone: string; email: string; password: string; password_confirm: string }) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  loadCompanies: () => Promise<void>
  selectTenant: (companyId: string) => Promise<void>
  createCompany: (data: CreateCompanyData) => Promise<void>
  joinCompany: (data: { invitationCode: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !!user

  // Initialize auth state on mount - ONLY ONCE
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      if (isInitialized) return; // Prevent duplicate initializations

      try {
        await initializeAuth()
        if (isMounted) {
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Error during auth initialization:', error)
        if (isMounted) {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Protected route logic
  useEffect(() => {
    // Wait for initialization to complete
    if (!isInitialized || isLoading) {
      return
    }

    const isAuthPage = pathname.startsWith('/login') ||
                      pathname.startsWith('/register') ||
                      pathname.startsWith('/verify-email') ||
                      pathname.startsWith('/forgot-password') ||
                      pathname.startsWith('/reset-password')

    const isPublicPage = pathname === '/' ||
                        isAuthPage ||
                        pathname.startsWith('/terms') ||
                        pathname.startsWith('/privacy')

    const isTenantPage = pathname.startsWith('/select-tenant') ||
                        pathname.startsWith('/create-tenant') ||
                        pathname.startsWith('/join-tenant')

    // Rule 1: Unauthenticated users can only access public pages
    if (!isAuthenticated && !isPublicPage) {
      console.log('[AuthContext] Redirecting to login - not authenticated')
      router.push('/login')
      return
    }

    // Rule 2: Authenticated users on auth pages should be redirected
    if (isAuthenticated && isAuthPage) {
      console.log('[AuthContext] Redirecting authenticated user from auth page')
      const checkTenantStatusAndRedirect = async () => {
        try {
          const tenantStatus = await api.auth.getTenantStatus()
          setUser(tenantStatus.user)

          if (!tenantStatus.has_tenant) {
            router.push('/create-tenant')
          } else {
            router.push('/select-tenant')
          }
        } catch (error) {
          console.error('[AuthContext] Error checking tenant status:', error)
          router.push('/select-tenant')
        }
      }
      checkTenantStatusAndRedirect()
      return
    }

    // Rule 3: Authenticated users accessing protected pages need a selected company
    if (isAuthenticated && !isPublicPage && !isTenantPage && !selectedCompany) {
      console.log('[AuthContext] Redirecting to select tenant - no company selected')
      router.push('/select-tenant')
      return
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized, isLoading, pathname, selectedCompany])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)

      // Only try to get profile if there's a token stored
      const token = await api.getToken()
      if (!token) {
        // No token, user not authenticated
        setUser(null)
        setIsInitialized(true);
        setIsLoading(false)
        return
      }

      // Try to get user profile with existing token
      const userProfile = await api.auth.profile()
      setUser(userProfile)

      // Load user's companies only if we have a valid user
      let userCompanies: Company[] = []
      if (userProfile) {
        userCompanies = await api.companies.list()
        setCompanies(userCompanies)
      }

      // If user has companies, set the first one as selected
      if (userCompanies && userCompanies.length > 0) {
        // Try to get selected company from backend if available
        try {
          // Attempt to select the company already chosen by the user
          const tenantStatus = await api.auth.getTenantStatus()
          // Update user data from tenant status response
          setUser(tenantStatus.user)

          if (tenantStatus.has_tenant) {
            // If user has a tenant, try to select the appropriate company
            // This would typically be handled by the backend based on their current session
            if (userCompanies.length > 0) {
              // Default to the first company if no specific one is selected
              setSelectedCompany(userCompanies[0])
            }
          } else if (userCompanies.length > 0) {
            // Default to the first company if no specific one is selected
            setSelectedCompany(userCompanies[0])
          }
        } catch (tenantError) {
          // If there's an error getting tenant status, default to first company
          if (userCompanies.length > 0) {
            setSelectedCompany(userCompanies[0])
          }
          console.error('Error getting tenant status:', tenantError)
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      // Token invalid or other error, clear it
      try {
        await api.removeToken()
      } catch (tokenError) {
        console.error('Error removing token:', tokenError)
      }
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      const response: AuthResponse = await api.auth.login(credentials)
      setUser(response.user)

      // Check if user's email is verified
      if (!response.user.email_verified) {
        router.push('/verify-email')
        return
      }

      // Get user's tenant status to determine where to redirect
      const tenantStatus = await api.auth.getTenantStatus()
      
      // Update user data from tenant status response
      setUser(tenantStatus.user)
      
      // Based on the response, redirect appropriately
      if (!tenantStatus.has_tenant) {
        // User doesn't have any tenant - redirect to create/join
        router.push('/create-tenant')
      } else if (tenantStatus.has_tenant) {
        // User has tenants - always go to tenant selection first
        // This allows user to see and select from their available companies
        router.push('/select-tenant')
      } else {
        // Default to tenant selection if the status is unclear
        router.push('/select-tenant')
      }
    } catch (error) {
      // If there's an error getting tenant status, show error and stay on login
      console.error('Login error:', error)
      throw error
    } finally {
      // Always reset loading state
      setIsLoading(false)
    }
  }

  const register = async (data: {
    full_name: string;
    phone: string;
    email: string;
    password: string;
    password_confirm: string
  }) => {
    setIsLoading(true)
    try {
      const response: AuthResponse = await api.auth.register(data)
      setUser(response.user)

      // After registration, redirect to email verification page (without token, shows email instructions)
      router.push('/verify-email')
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setCompanies([])
      setSelectedCompany(null)
      setIsLoading(false)
      router.push('/')
    }
  }

  const refreshAuth = async () => {
    try {
      const userProfile = await api.auth.profile()
      setUser(userProfile)
    } catch (error) {
      console.error('Failed to refresh auth:', error)
      await logout()
    }
  }

  const loadCompanies = async () => {
    setIsLoadingCompanies(true)
    try {
      const userCompanies = await api.companies.list()
      setCompanies(userCompanies)
    } catch (error) {
      console.error('Failed to load companies:', error)
      setCompanies([])
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  const selectTenant = async (companyId: string) => {
    setIsLoading(true)
    try {
      await api.companies.selectTenant(companyId)

      // Find and set the selected company immediately
      let selectedCompanyData = companies.find(c => c.id === companyId) || null
      if (selectedCompanyData) {
        setSelectedCompany(selectedCompanyData)
      } else {
        // If company is not in local state, try to fetch it
        const freshCompanies = await api.companies.list()
        setCompanies(freshCompanies)
        selectedCompanyData = freshCompanies.find(c => c.id === companyId) || null
        setSelectedCompany(selectedCompanyData)
      }

      // Wait for state update before redirecting
      await new Promise(resolve => setTimeout(resolve, 0))

      // Redirect to dashboard after tenant selection
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to select tenant:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const createCompany = async (data: CreateCompanyData) => {
    setIsLoadingCompanies(true)
    try {
      const newCompany = await api.companies.create(data)
      setCompanies(prev => [...prev, newCompany])

      // Automatically select the new company
      await selectTenant(newCompany.id)
    } catch (error) {
      setIsLoadingCompanies(false)
      console.error('Failed to create company:', error)
      throw error
    }
  }

  const joinCompany = async (data: { invitationCode: string }) => {
    setIsLoadingCompanies(true)
    try {
      await api.companies.joinCompany(data)
      
      // Reload companies to include the one we just joined
      const updatedCompanies = await api.companies.list()
      setCompanies(updatedCompanies)

      // Optionally select the company we just joined if it's available
      if (updatedCompanies.length > 0) {
        setSelectedCompany(updatedCompanies[0]) // Or the specific company we joined
      }
    } catch (error) {
      setIsLoadingCompanies(false)
      console.error('Failed to join company:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    // State
    user,
    isLoading,
    isAuthenticated,
    companies,
    selectedCompany,
    isLoadingCompanies,

    // Actions
    login,
    register,
    logout,
    refreshAuth,
    loadCompanies,
    selectTenant,
    createCompany,
    joinCompany,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}