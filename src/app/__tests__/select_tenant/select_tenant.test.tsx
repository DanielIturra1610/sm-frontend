/**
 * Tenant Selection Page Tests
 * TDD: RED phase - Writing tests before implementation
 *
 * @feature Authentication
 * @component app/select-tenant/page
 * @coverage unit
 *
 * PURPOSE: Validates tenant selection and company creation functionality
 * COVERAGE: Company listing, selection, creation, loading states, error handling
 * DEPENDENCIES: AuthContext, next/navigation, API client, shadcn/ui
 * MAINTENANCE: Update when tenant selection flow or API endpoints change
 *
 * Test Scenarios:
 * - Company listing and selection
 * - Company creation flow
 * - Loading and error states
 * - Navigation and redirects
 * - Empty state handling
 * - User interaction flows
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TenantSelectionPage } from '../../select-tenant/page'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock AuthContext
const mockUseAuth = {
  user: {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    email_verified: true,
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  companies: [],
  selectedCompany: null,
  isLoading: false,
  isLoadingCompanies: false,
  loadCompanies: jest.fn(),
  selectTenant: jest.fn(),
  createCompany: jest.fn(),
}

jest.mock('@/shared/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth,
}))

describe('TenantSelectionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.companies = []
    mockUseAuth.selectedCompany = null
    mockUseAuth.isLoading = false
    mockUseAuth.isLoadingCompanies = false
    mockUseAuth.loadCompanies.mockResolvedValue(undefined)
    mockUseAuth.selectTenant.mockResolvedValue(undefined)
    mockUseAuth.createCompany.mockResolvedValue(undefined)
  })

  describe('Initial State and Loading', () => {
    it('should load companies on mount', async () => {
      render(<TenantSelectionPage />)

      await waitFor(() => {
        expect(mockUseAuth.loadCompanies).toHaveBeenCalledTimes(1)
      })
    })

    it('should show loading state while loading companies', () => {
      mockUseAuth.isLoadingCompanies = true

      render(<TenantSelectionPage />)

      expect(screen.getByText(/loading companies/i)).toBeInTheDocument()
    })

    it('should show page title and description', () => {
      render(<TenantSelectionPage />)

      expect(screen.getByText(/select your company/i)).toBeInTheDocument()
      expect(screen.getByText(/choose a company to continue or create a new one/i)).toBeInTheDocument()
    })
  })

  describe('Company Listing', () => {
    it('should display list of companies when available', () => {
      mockUseAuth.companies = [
        {
          id: '1',
          name: 'Acme Corp',
          domain: 'acme.com',
          isActive: true,
          userCount: 5,
          subscription: { plan: 'professional', status: 'active', expiresAt: '2024-12-31T00:00:00Z', features: [] },
          settings: { timezone: 'UTC', dateFormat: 'YYYY-MM-DD', language: 'en', features: {}, branding: {} },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Beta Inc',
          domain: 'beta.com',
          isActive: true,
          userCount: 10,
          subscription: { plan: 'basic', status: 'active', expiresAt: '2024-12-31T00:00:00Z', features: [] },
          settings: { timezone: 'UTC', dateFormat: 'YYYY-MM-DD', language: 'en', features: {}, branding: {} },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      render(<TenantSelectionPage />)

      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('Beta Inc')).toBeInTheDocument()
      expect(screen.getByText('5 users')).toBeInTheDocument()
      expect(screen.getByText('10 users')).toBeInTheDocument()
    })

    it('should show company details correctly', () => {
      mockUseAuth.companies = [
        {
          id: '1',
          name: 'Test Company',
          domain: 'test.com',
          isActive: true,
          userCount: 15,
          subscription: { plan: 'enterprise', status: 'active', expiresAt: '2024-12-31T00:00:00Z', features: [] },
          settings: { timezone: 'UTC', dateFormat: 'YYYY-MM-DD', language: 'en', features: {}, branding: {} },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      render(<TenantSelectionPage />)

      expect(screen.getByText('Test Company')).toBeInTheDocument()
      expect(screen.getByText('test.com')).toBeInTheDocument()
      expect(screen.getByText('15 users')).toBeInTheDocument()
      expect(screen.getByText('Enterprise')).toBeInTheDocument()
    })

    it('should show empty state when no companies exist', () => {
      mockUseAuth.companies = []
      mockUseAuth.isLoadingCompanies = false

      render(<TenantSelectionPage />)

      expect(screen.getByText(/no companies found/i)).toBeInTheDocument()
      expect(screen.getByText(/get started by creating your first company/i)).toBeInTheDocument()
    })
  })

  describe('Company Selection', () => {
    it('should call selectTenant when company is selected', async () => {
      mockUseAuth.companies = [
        {
          id: '1',
          name: 'Test Company',
          domain: 'test.com',
          isActive: true,
          userCount: 5,
          subscription: { plan: 'basic', status: 'active', expiresAt: '2024-12-31T00:00:00Z', features: [] },
          settings: { timezone: 'UTC', dateFormat: 'YYYY-MM-DD', language: 'en', features: {}, branding: {} },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const selectButton = screen.getByRole('button', { name: /select test company/i })
      await user.click(selectButton)

      expect(mockUseAuth.selectTenant).toHaveBeenCalledWith('1')
    })

    it('should handle selection errors gracefully', async () => {
      mockUseAuth.companies = [
        {
          id: '1',
          name: 'Test Company',
          domain: 'test.com',
          isActive: true,
          userCount: 5,
          subscription: { plan: 'basic', status: 'active', expiresAt: '2024-12-31T00:00:00Z', features: [] },
          settings: { timezone: 'UTC', dateFormat: 'YYYY-MM-DD', language: 'en', features: {}, branding: {} },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      mockUseAuth.selectTenant.mockRejectedValue(new Error('Selection failed'))

      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const selectButton = screen.getByRole('button', { name: /select test company/i })
      await user.click(selectButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to select company/i)).toBeInTheDocument()
      })
    })

    it('should show loading state on company button during selection', async () => {
      mockUseAuth.companies = [
        {
          id: '1',
          name: 'Test Company',
          domain: 'test.com',
          isActive: true,
          userCount: 5,
          subscription: { plan: 'basic', status: 'active', expiresAt: '2024-12-31T00:00:00Z', features: [] },
          settings: { timezone: 'UTC', dateFormat: 'YYYY-MM-DD', language: 'en', features: {}, branding: {} },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const selectButton = screen.getByRole('button', { name: /select test company/i })
      await user.click(selectButton)

      expect(screen.getByText(/selecting/i)).toBeInTheDocument()
    })
  })

  describe('Company Creation', () => {
    it('should show create company form when create button is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const createButton = screen.getByRole('button', { name: /create new company/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/domain/i)).toBeInTheDocument()
      })
    })

    it('should validate company creation form', async () => {
      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const createButton = screen.getByRole('button', { name: /create new company/i })
      await user.click(createButton)

      const submitButton = screen.getByRole('button', { name: /create company/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/domain is required/i)).toBeInTheDocument()
      })
    })

    it('should create company when form is submitted with valid data', async () => {
      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const createButton = screen.getByRole('button', { name: /create new company/i })
      await user.click(createButton)

      const nameInput = screen.getByLabelText(/company name/i)
      const domainInput = screen.getByLabelText(/domain/i)

      await user.type(nameInput, 'New Company')
      await user.type(domainInput, 'newcompany.com')

      const submitButton = screen.getByRole('button', { name: /create company/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUseAuth.createCompany).toHaveBeenCalledWith({
          name: 'New Company',
          domain: 'newcompany.com'
        })
      })
    })

    it('should handle company creation errors', async () => {
      mockUseAuth.createCompany.mockRejectedValue(new Error('Creation failed'))

      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const createButton = screen.getByRole('button', { name: /create new company/i })
      await user.click(createButton)

      const nameInput = screen.getByLabelText(/company name/i)
      const domainInput = screen.getByLabelText(/domain/i)

      await user.type(nameInput, 'New Company')
      await user.type(domainInput, 'newcompany.com')

      const submitButton = screen.getByRole('button', { name: /create company/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to create company/i)).toBeInTheDocument()
      })
    })

    it('should close creation form when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const createButton = screen.getByRole('button', { name: /create new company/i })
      await user.click(createButton)

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('User Experience', () => {
    it('should display user information', () => {
      render(<TenantSelectionPage />)

      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('should provide logout functionality', async () => {
      const mockLogout = jest.fn()
      mockUseAuth.logout = mockLogout

      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      await user.click(logoutButton)

      expect(mockLogout).toHaveBeenCalled()
    })

    it('should show appropriate messages for different subscription plans', () => {
      mockUseAuth.companies = [
        {
          id: '1',
          name: 'Free Company',
          domain: 'free.com',
          isActive: true,
          userCount: 2,
          subscription: { plan: 'free', status: 'active', expiresAt: '2024-12-31T00:00:00Z', features: [] },
          settings: { timezone: 'UTC', dateFormat: 'YYYY-MM-DD', language: 'en', features: {}, branding: {} },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Pro Company',
          domain: 'pro.com',
          isActive: true,
          userCount: 25,
          subscription: { plan: 'professional', status: 'active', expiresAt: '2024-12-31T00:00:00Z', features: [] },
          settings: { timezone: 'UTC', dateFormat: 'YYYY-MM-DD', language: 'en', features: {}, branding: {} },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      render(<TenantSelectionPage />)

      expect(screen.getByText('Free')).toBeInTheDocument()
      expect(screen.getByText('Professional')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TenantSelectionPage />)

      const heading = screen.getByRole('heading', { name: /select your company/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('should have accessible button labels', () => {
      mockUseAuth.companies = [
        {
          id: '1',
          name: 'Test Company',
          domain: 'test.com',
          isActive: true,
          userCount: 5,
          subscription: { plan: 'basic', status: 'active', expiresAt: '2024-12-31T00:00:00Z', features: [] },
          settings: { timezone: 'UTC', dateFormat: 'YYYY-MM-DD', language: 'en', features: {}, branding: {} },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]

      render(<TenantSelectionPage />)

      const selectButton = screen.getByRole('button', { name: /select test company/i })
      expect(selectButton).toHaveAccessibleName()

      const createButton = screen.getByRole('button', { name: /create new company/i })
      expect(createButton).toHaveAccessibleName()
    })

    it('should have accessible form labels', async () => {
      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      const createButton = screen.getByRole('button', { name: /create new company/i })
      await user.click(createButton)

      const nameInput = screen.getByLabelText(/company name/i)
      expect(nameInput).toHaveAccessibleName()

      const domainInput = screen.getByLabelText(/domain/i)
      expect(domainInput).toHaveAccessibleName()
    })
  })

  describe('Error Handling', () => {
    it('should handle load companies error gracefully', async () => {
      mockUseAuth.loadCompanies.mockRejectedValue(new Error('Failed to load'))

      render(<TenantSelectionPage />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load companies/i)).toBeInTheDocument()
      })
    })

    it('should provide retry functionality for failed loads', async () => {
      mockUseAuth.loadCompanies.mockRejectedValue(new Error('Failed to load'))

      const user = userEvent.setup()
      render(<TenantSelectionPage />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load companies/i)).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /try again/i })
      await user.click(retryButton)

      expect(mockUseAuth.loadCompanies).toHaveBeenCalledTimes(2)
    })
  })
})