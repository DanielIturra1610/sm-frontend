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
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !!user

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  // Protected route logic
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname.startsWith('/login') ||
                        pathname.startsWith('/register') ||
                        pathname.startsWith('/verify-email') ||
                        pathname.startsWith('/forgot-password') ||
                        pathname.startsWith('/reset-password')

      const isPublicPage = pathname === '/' ||
                          isAuthPage ||
                          pathname.startsWith('/terms') ||
                          pathname.startsWith('/privacy')
      const isTenantSelectionPage = pathname.startsWith('/select-tenant')

      if (!isAuthenticated && !isPublicPage) {
        router.push('/login')
      } else if (isAuthenticated && isAuthPage) {
        // After successful login with verified email, go to tenant selection
        router.push('/select-tenant')
      } else if (isAuthenticated && !isTenantSelectionPage && !selectedCompany && pathname !== '/dashboard') {
        // If authenticated but no company selected, go to tenant selection
        router.push('/select-tenant')
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, selectedCompany])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)

      // Only try to get profile if there's a token stored
      const token = await api.getToken()
      if (!token) {
        // No token, user not authenticated
        setUser(null)
        return
      }

      // Try to get user profile with existing token
      const userProfile = await api.auth.profile()
      setUser(userProfile)
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      // Token invalid or other error, clear it
      await api.removeToken()
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

      // After successful login, redirect to tenant selection
      router.push('/select-tenant')
    } catch (error) {
      setIsLoading(false)
      throw error
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
      const selectedCompanyData = companies.find(c => c.id === companyId) || null
      setSelectedCompany(selectedCompanyData)

      // Redirect to dashboard after tenant selection
      router.push('/dashboard')
    } catch (error) {
      setIsLoading(false)
      console.error('Failed to select tenant:', error)
      throw error
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
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}