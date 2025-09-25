/**
 * RegisterForm Component Tests
 * TDD: Red phase - Writing tests BEFORE implementation
 *
 * @feature Authentication
 * @component app/(auth)/_components/register-form
 * @coverage unit
 *
 * PURPOSE: Validates registration form functionality, validation, and API integration
 * COVERAGE: Form fields, validation, submission, error handling, accessibility, terms
 * DEPENDENCIES: react-hook-form, zod, API client
 * MAINTENANCE: Update when registration requirements or validation rules change
 *
 * Test Scenarios:
 * - Form structure and fields (company, email, password, confirm password)
 * - Input validation and error display
 * - Password strength and confirmation validation
 * - Form submission and API integration
 * - Loading states and user feedback
 * - Terms acceptance and legal compliance
 * - Multi-tenant company creation
 * - Accessibility and user experience
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '../../../(auth)/_components/register-form'

// Mock the API
jest.mock('@/lib/api')

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form Structure and Fields', () => {
    it('should render company name input field', () => {
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      expect(companyInput).toBeInTheDocument()
      expect(companyInput).toHaveAttribute('type', 'text')
      expect(companyInput).toBeRequired()
    })

    it('should render email input field', () => {
      render(<RegisterForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toBeRequired()
    })

    it('should render password input field', () => {
      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toBeRequired()
    })

    it('should render confirm password input field', () => {
      render(<RegisterForm />)

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      expect(confirmPasswordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toBeRequired()
    })

    it('should render terms and conditions checkbox', () => {
      render(<RegisterForm />)

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i })
      expect(termsCheckbox).toBeInTheDocument()
      expect(termsCheckbox).toBeRequired()
    })

    it('should render submit button', () => {
      render(<RegisterForm />)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should have proper form structure', () => {
      render(<RegisterForm />)

      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Input Validation', () => {
    it('should show required field errors when form is submitted empty', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument()
        expect(screen.getByText(/you must accept the terms/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })

    it('should validate password minimum length', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(passwordInput, '123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate password strength requirements', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(passwordInput, 'weakpass')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument()
      })
    })

    it('should validate password confirmation match', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'DifferentPassword123!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })

    it('should validate company name length', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(companyInput, 'A')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/company name must be at least 2 characters/i)).toBeInTheDocument()
      })
    })

    it('should clear validation errors when user corrects input', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

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

  describe('Password Strength Indicators', () => {
    it('should show password strength meter', () => {
      render(<RegisterForm />)

      const strengthMeter = screen.getByTestId('password-strength-meter')
      expect(strengthMeter).toBeInTheDocument()
    })

    it('should update strength meter as user types', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      const strengthMeter = screen.getByTestId('password-strength-meter')

      // Weak password
      await user.type(passwordInput, 'weak')
      expect(strengthMeter).toHaveAttribute('data-strength', 'weak')

      // Medium password
      await user.clear(passwordInput)
      await user.type(passwordInput, 'Medium123')
      expect(strengthMeter).toHaveAttribute('data-strength', 'medium')

      // Strong password
      await user.clear(passwordInput)
      await user.type(passwordInput, 'StrongPass123!')
      expect(strengthMeter).toHaveAttribute('data-strength', 'strong')
    })

    it('should show password requirements checklist', () => {
      render(<RegisterForm />)

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument()
      expect(screen.getByText(/lowercase letter/i)).toBeInTheDocument()
      expect(screen.getByText(/number/i)).toBeInTheDocument()
      expect(screen.getByText(/special character/i)).toBeInTheDocument()
    })

    it('should update requirements checklist dynamically', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)

      await user.type(passwordInput, 'Password123!')

      await waitFor(() => {
        const lengthCheck = screen.getByTestId('requirement-length')
        const uppercaseCheck = screen.getByTestId('requirement-uppercase')
        const lowercaseCheck = screen.getByTestId('requirement-lowercase')
        const numberCheck = screen.getByTestId('requirement-number')
        const specialCheck = screen.getByTestId('requirement-special')

        expect(lengthCheck).toHaveAttribute('data-met', 'true')
        expect(uppercaseCheck).toHaveAttribute('data-met', 'true')
        expect(lowercaseCheck).toHaveAttribute('data-met', 'true')
        expect(numberCheck).toHaveAttribute('data-met', 'true')
        expect(specialCheck).toHaveAttribute('data-met', 'true')
      })
    })
  })

  describe('Form Submission and API Integration', () => {
    it('should call API with correct data on valid submission', async () => {
      const mockRegister = jest.fn().mockResolvedValue({
        token: 'fake-token',
        user: { id: '1', email: 'test@example.com' },
        company: { id: '1', name: 'Test Company' }
      })

      require('@/lib/api').api.auth.register = mockRegister

      const user = userEvent.setup()
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(companyInput, 'Stegmaier Test Corp')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(termsCheckbox)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          companyName: 'Stegmaier Test Corp',
          email: 'test@example.com',
          password: 'Password123!'
        })
      })
    })

    it('should show loading state during submission', async () => {
      const mockRegister = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      require('@/lib/api').api.auth.register = mockRegister

      const user = userEvent.setup()
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(companyInput, 'Test Company')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(termsCheckbox)
      await user.click(submitButton)

      // Should show loading state
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should disable form inputs during submission', async () => {
      const mockRegister = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      require('@/lib/api').api.auth.register = mockRegister

      const user = userEvent.setup()
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(companyInput, 'Test Company')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(termsCheckbox)
      await user.click(submitButton)

      expect(companyInput).toBeDisabled()
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(confirmPasswordInput).toBeDisabled()
      expect(termsCheckbox).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should display API error messages', async () => {
      const mockRegister = jest.fn().mockRejectedValue({
        message: 'Email already exists'
      })

      require('@/lib/api').api.auth.register = mockRegister

      const user = userEvent.setup()
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(companyInput, 'Test Company')
      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(termsCheckbox)
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      const mockRegister = jest.fn().mockRejectedValue({
        name: 'NetworkError',
        message: 'Network request failed'
      })

      require('@/lib/api').api.auth.register = mockRegister

      const user = userEvent.setup()
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(companyInput, 'Test Company')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(termsCheckbox)
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/connection error.*try again/i)).toBeInTheDocument()
      })
    })

    it('should clear error messages on new submission attempt', async () => {
      const mockRegister = jest.fn()
        .mockRejectedValueOnce({ message: 'Email already exists' })
        .mockResolvedValueOnce({ token: 'token', user: {}, company: {} })

      require('@/lib/api').api.auth.register = mockRegister

      const user = userEvent.setup()
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      // First attempt - should fail
      await user.type(companyInput, 'Test Company')
      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(termsCheckbox)
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
      })

      // Second attempt - should clear error
      await user.clear(emailInput)
      await user.type(emailInput, 'newemail@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/email already exists/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('User Experience and Navigation', () => {
    it('should have link to login page', () => {
      render(<RegisterForm />)

      const loginLink = screen.getByRole('link', { name: /sign in/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('should have terms and conditions link', () => {
      render(<RegisterForm />)

      const termsLink = screen.getByRole('link', { name: /terms and conditions/i })
      expect(termsLink).toBeInTheDocument()
      expect(termsLink).toHaveAttribute('href', '/terms')
    })

    it('should have privacy policy link', () => {
      render(<RegisterForm />)

      const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
      expect(privacyLink).toBeInTheDocument()
      expect(privacyLink).toHaveAttribute('href', '/privacy')
    })

    it('should show password visibility toggle for both password fields', () => {
      render(<RegisterForm />)

      const passwordToggles = screen.getAllByRole('button', { name: /toggle password visibility/i })
      expect(passwordToggles).toHaveLength(2)
    })

    it('should toggle password visibility when clicked', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i })
      const passwordToggle = toggleButtons[0]

      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(passwordToggle)
      expect(passwordInput).toHaveAttribute('type', 'text')

      await user.click(passwordToggle)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Multi-tenant Company Creation', () => {
    it('should emphasize company creation in form title', () => {
      render(<RegisterForm />)

      expect(screen.getByText(/create your company account/i)).toBeInTheDocument()
    })

    it('should provide company setup guidance', () => {
      render(<RegisterForm />)

      expect(screen.getByText(/set up your safety management workspace/i)).toBeInTheDocument()
    })

    it('should validate company name uniqueness hint', () => {
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      expect(companyInput).toHaveAttribute('placeholder', 'Your Company Name')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<RegisterForm />)

      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/terms and conditions/i)).toBeInTheDocument()
    })

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText(/email is required/i)
        expect(errorMessage).toBeInTheDocument()
        expect(emailInput).toHaveAttribute('aria-describedby')
      })
    })

    it('should have proper heading structure', () => {
      render(<RegisterForm />)

      const heading = screen.getByRole('heading', { name: /create your company account/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      // Tab navigation should work
      await user.tab()
      expect(companyInput).toHaveFocus()

      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(confirmPasswordInput).toHaveFocus()

      await user.tab()
      expect(termsCheckbox).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('should announce password strength to screen readers', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      const strengthMeter = screen.getByTestId('password-strength-meter')

      await user.type(passwordInput, 'StrongPass123!')

      expect(strengthMeter).toHaveAttribute('aria-live', 'polite')
      expect(strengthMeter).toHaveAttribute('aria-label', 'Password strength: strong')
    })
  })

  describe('Security Considerations', () => {
    it('should not log sensitive information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const user = userEvent.setup()

      render(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(passwordInput, 'secretpassword')

      // Should not log password to console
      const logCalls = consoleSpy.mock.calls.flat()
      expect(logCalls.some(call => String(call).includes('secretpassword'))).toBe(false)

      consoleSpy.mockRestore()
    })

    it('should have autocomplete attributes for password managers', () => {
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      expect(companyInput).toHaveAttribute('autocomplete', 'organization')
      expect(emailInput).toHaveAttribute('autocomplete', 'email')
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password')
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password')
    })

    it('should prevent password confirmation field from being autocompleted', () => {
      render(<RegisterForm />)

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password')
    })
  })

  describe('Business Requirements', () => {
    it('should emphasize safety management branding', () => {
      render(<RegisterForm />)

      const form = screen.getByRole('form')
      expect(form).toHaveTextContent(/safety management/i)
      expect(form).toHaveTextContent(/workspace/i)
    })

    it('should collect necessary data for multi-tenant setup', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      const companyInput = screen.getByRole('textbox', { name: /company name/i })

      // Company name should be prominently positioned
      const formElements = screen.getAllByRole('textbox')
      expect(formElements[0]).toBe(companyInput)
    })

    it('should require legal compliance acceptance', () => {
      render(<RegisterForm />)

      const termsCheckbox = screen.getByRole('checkbox', { name: /terms and conditions/i })
      expect(termsCheckbox).toBeRequired()
      expect(screen.getByText(/by creating an account, you agree to/i)).toBeInTheDocument()
    })
  })
})