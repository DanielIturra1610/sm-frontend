/**
 * LoginForm Component Tests
 * TDD: Red phase - Writing tests BEFORE implementation
 *
 * @feature Authentication
 * @component app/(auth)/_components/login-form
 * @coverage unit
 *
 * PURPOSE: Validates login form functionality, validation, and API integration
 * COVERAGE: Form fields, validation, submission, error handling, accessibility
 * DEPENDENCIES: react-hook-form, zod, API client
 * MAINTENANCE: Update when login requirements or validation rules change
 *
 * Test Scenarios:
 * - Form structure and fields
 * - Input validation and error display
 * - Form submission and API integration
 * - Loading states and user feedback
 * - Accessibility and user experience
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../../../(auth)/_components/login-form'
import { useRouter, usePathname } from 'next/navigation'

// Mock next/navigation
const mockPush = jest.fn()
const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockUsePathname(),
}))

// Mock the API
jest.mock('@/lib/api')

// Mock the auth context
const mockAuthValue = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  companies: [],
  selectedCompany: null,
  isLoadingCompanies: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshAuth: jest.fn(),
  loadCompanies: jest.fn(),
  selectTenant: jest.fn(),
  createCompany: jest.fn(),
}

jest.mock('@/shared/contexts/auth-context', () => ({
  useAuth: () => mockAuthValue,
}))

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/login')

    // Reset mock auth values
    Object.assign(mockAuthValue, {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      companies: [],
      selectedCompany: null,
      isLoadingCompanies: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshAuth: jest.fn(),
      loadCompanies: jest.fn(),
      selectTenant: jest.fn(),
      createCompany: jest.fn(),
    })
  })

  describe('Form Structure and Fields', () => {
    it('should render email input field', () => {
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toBeRequired()
    })

    it('should render password input field', () => {
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toBeRequired()
    })

    it('should render submit button', () => {
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should have proper form structure', () => {
      render(<LoginForm />)

      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Input Validation', () => {
    it('should show required field errors when form is submitted empty', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })

    it('should validate password minimum length', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(passwordInput, '123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
    })

    it('should clear validation errors when user corrects input', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Trigger validation error
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })

      // Fix the input
      await user.clear(emailInput)
      await user.type(emailInput, 'valid@example.com')

      await waitFor(() => {
        expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission and API Integration', () => {
    it('should call API with correct credentials on valid submission', async () => {
      const mockLogin = jest.fn().mockResolvedValue(undefined)
      mockAuthValue.login = mockLogin

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    it('should show loading state during submission', async () => {
      mockAuthValue.isLoading = true

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Should show loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should disable form inputs during submission', async () => {
      mockAuthValue.isLoading = true

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should display API error messages', async () => {
      const mockLogin = jest.fn().mockRejectedValue({
        message: 'Invalid credentials'
      })
      mockAuthValue.login = mockLogin

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      const mockLogin = jest.fn().mockRejectedValue({
        name: 'NetworkError',
        message: 'Network request failed'
      })
      mockAuthValue.login = mockLogin

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/connection error.*try again/i)).toBeInTheDocument()
      })
    })

    it('should clear error messages on new submission attempt', async () => {
      const mockLogin = jest.fn()
        .mockRejectedValueOnce({ message: 'Invalid credentials' })
        .mockResolvedValueOnce(undefined)
      mockAuthValue.login = mockLogin

      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // First attempt - should fail
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })

      // Second attempt - should clear error
      await user.clear(passwordInput)
      await user.type(passwordInput, 'correctpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('User Experience and Navigation', () => {
    it('should have link to registration page', () => {
      render(<LoginForm />)

      const registerLink = screen.getByRole('link', { name: /create account/i })
      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute('href', '/register')
    })

    it('should have forgot password link', () => {
      render(<LoginForm />)

      const forgotLink = screen.getByRole('link', { name: /forgot password/i })
      expect(forgotLink).toBeInTheDocument()
    })

    it('should show password visibility toggle', () => {
      render(<LoginForm />)

      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
      expect(toggleButton).toBeInTheDocument()
    })

    it('should toggle password visibility when clicked', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText('Password')
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })

      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText(/email is required/i)
        expect(errorMessage).toBeInTheDocument()
        expect(emailInput).toHaveAttribute('aria-describedby')
      })
    })

    it('should have proper heading structure', () => {
      render(<LoginForm />)

      const heading = screen.getByRole('heading', { name: /sign in to your account/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Tab navigation should work
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })

  describe('Security Considerations', () => {
    it('should not log sensitive information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const user = userEvent.setup()

      render(<LoginForm />)

      const passwordInput = screen.getByLabelText('Password')
      await user.type(passwordInput, 'secretpassword')

      // Should not log password to console
      const logCalls = consoleSpy.mock.calls.flat()
      expect(logCalls.some(call => String(call).includes('secretpassword'))).toBe(false)

      consoleSpy.mockRestore()
    })

    it('should have autocomplete attributes for password managers', () => {
      render(<LoginForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText('Password')

      expect(emailInput).toHaveAttribute('autocomplete', 'email')
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
    })
  })
})