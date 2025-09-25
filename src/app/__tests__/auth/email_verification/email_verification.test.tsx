/**
 * EmailVerification Component Tests
 * TDD: Testing existing implementation for verification
 *
 * @feature Authentication
 * @component app/(auth)/_components/email-verification
 * @coverage unit
 *
 * PURPOSE: Validates email verification functionality and user flow
 * COVERAGE: Token verification, status states, error handling, navigation
 * DEPENDENCIES: next/navigation, API client, lucide-react
 * MAINTENANCE: Update when verification flow or API endpoints change
 *
 * Test Scenarios:
 * - Token-based verification flow
 * - Success, error, expired, and loading states
 * - Auto-redirect behavior
 * - Resend verification functionality
 * - Error handling and user feedback
 * - Accessibility and navigation
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailVerification } from '../../../(auth)/_components/email-verification'

// Mock next/navigation
const mockPush = jest.fn()
const mockSearchParams = {
  get: jest.fn()
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}))

// Mock the API
jest.mock('@/lib/api')

describe('EmailVerification Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.get.mockReturnValue(null)
  })

  describe('Initial State and Token Handling', () => {
    it('should show loading state initially when token is present', () => {
      mockSearchParams.get.mockReturnValue('valid-token-123')

      render(<EmailVerification />)

      expect(screen.getByText(/verifying your email/i)).toBeInTheDocument()
      expect(screen.getByText(/please wait while we verify/i)).toBeInTheDocument()

      // Check for loading spinner by finding the SVG with animate-spin class
      const { container } = render(<EmailVerification />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('should show error when no token is provided', async () => {
      mockSearchParams.get.mockReturnValue(null)

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
        expect(screen.getByText(/invalid verification link/i)).toBeInTheDocument()
      })
    })

    it('should extract token from search params', () => {
      mockSearchParams.get.mockReturnValue('test-token-456')

      render(<EmailVerification />)

      expect(mockSearchParams.get).toHaveBeenCalledWith('token')
    })
  })

  describe('Successful Verification Flow', () => {
    it('should show success state after successful verification', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockResolvedValue({})
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/your email has been successfully verified/i)).toBeInTheDocument()
      })
    })

    it('should call API with correct token', async () => {
      mockSearchParams.get.mockReturnValue('test-token-123')

      const mockVerifyEmail = jest.fn().mockResolvedValue({})
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(mockVerifyEmail).toHaveBeenCalledWith({ token: 'test-token-123' })
      })
    })

    it('should auto-redirect to login after successful verification', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockResolvedValue({})
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      jest.useFakeTimers()
      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument()
      })

      // Fast-forward 3 seconds
      jest.advanceTimersByTime(3000)

      expect(mockPush).toHaveBeenCalledWith('/login')

      jest.useRealTimers()
    })

    it('should provide manual sign in link', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockResolvedValue({})
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        const signInLink = screen.getByRole('link', { name: /sign in now/i })
        expect(signInLink).toBeInTheDocument()
        expect(signInLink).toHaveAttribute('href', '/login')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle expired token error', async () => {
      mockSearchParams.get.mockReturnValue('expired-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Token expired'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/verification link expired/i)).toBeInTheDocument()
        expect(screen.getByText(/your verification link has expired/i)).toBeInTheDocument()
      })
    })

    it('should handle invalid token error', async () => {
      mockSearchParams.get.mockReturnValue('invalid-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Invalid token'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
      })
    })

    it('should handle general API errors', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Network error'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should handle unknown errors gracefully', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue(new Error())
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
        expect(screen.getByText(/failed to verify email/i)).toBeInTheDocument()
      })
    })
  })

  describe('Resend Verification Functionality', () => {
    it('should show resend button for expired tokens', async () => {
      mockSearchParams.get.mockReturnValue('expired-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Token expired'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/resend verification email/i)).toBeInTheDocument()
      })
    })

    it('should handle resend verification click', async () => {
      mockSearchParams.get.mockReturnValue('expired-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Token expired'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      const user = userEvent.setup()
      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/resend verification email/i)).toBeInTheDocument()
      })

      const resendButton = screen.getByText(/resend verification email/i)
      await user.click(resendButton)

      await waitFor(() => {
        expect(screen.getByText(/a new verification email has been sent/i)).toBeInTheDocument()
      })
    })

    it('should show success message after resend', async () => {
      mockSearchParams.get.mockReturnValue('expired-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Token expired'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      const user = userEvent.setup()
      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/resend verification email/i)).toBeInTheDocument()
      })

      const resendButton = screen.getByText(/resend verification email/i)
      await user.click(resendButton)

      // Check that the success message appears after clicking resend
      await waitFor(() => {
        expect(screen.getByText(/a new verification email has been sent/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation and Links', () => {
    it('should provide register again link for expired tokens', async () => {
      mockSearchParams.get.mockReturnValue('expired-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Token expired'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        const registerLink = screen.getByRole('link', { name: /register again/i })
        expect(registerLink).toBeInTheDocument()
        expect(registerLink).toHaveAttribute('href', '/register')
      })
    })

    it('should provide register again link for general errors', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Network error'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        const registerLink = screen.getByRole('link', { name: /register again/i })
        expect(registerLink).toBeInTheDocument()
        expect(registerLink).toHaveAttribute('href', '/register')
      })
    })

    it('should provide contact support link', async () => {
      render(<EmailVerification />)

      const supportLink = screen.getByRole('link', { name: /contact support/i })
      expect(supportLink).toBeInTheDocument()
      expect(supportLink).toHaveAttribute('href', '/contact')
    })

    it('should provide try again functionality for errors', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Network error'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        const tryAgainButton = screen.getByText(/try again/i)
        expect(tryAgainButton).toBeInTheDocument()
      })
    })
  })

  describe('Visual States and Icons', () => {
    it('should show loading spinner during verification', () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      render(<EmailVerification />)

      // Check for the loading spinner by its classes
      const container = screen.getByText(/verifying your email/i).closest('div')
      expect(container?.parentElement?.querySelector('.animate-spin')).toBeInTheDocument()
      expect(container?.parentElement?.querySelector('.text-blue-600')).toBeInTheDocument()
    })

    it('should show success icon after verification', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockResolvedValue({})
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument()
        // Check for green icon in the parent container
        const successHeading = screen.getByText(/email verified successfully/i)
        const container = successHeading.closest('div')?.parentElement
        expect(container?.querySelector('.text-green-600')).toBeInTheDocument()
      })
    })

    it('should show error icon for failed verification', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Network error'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
        // Check for red error icon in the parent container
        const errorHeading = screen.getByText(/verification failed/i)
        const container = errorHeading.closest('div')?.parentElement
        expect(container?.querySelector('.text-red-600')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockResolvedValue({})
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /email verified successfully/i })
        expect(heading).toBeInTheDocument()
        expect(heading.tagName).toBe('H1')
      })
    })

    it('should have accessible button text', async () => {
      mockSearchParams.get.mockReturnValue('expired-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Token expired'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        const resendButton = screen.getByRole('button', { name: /resend verification email/i })
        expect(resendButton).toHaveAccessibleName()
      })
    })

    it('should have accessible link text', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockResolvedValue({})
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        const signInLink = screen.getByRole('link', { name: /sign in now/i })
        expect(signInLink).toHaveAccessibleName()
      })
    })
  })

  describe('User Experience', () => {
    it('should show countdown for auto-redirect', async () => {
      mockSearchParams.get.mockReturnValue('valid-token')

      const mockVerifyEmail = jest.fn().mockResolvedValue({})
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/redirecting to login in 3 seconds/i)).toBeInTheDocument()
      })
    })

    it('should provide clear feedback for all states', async () => {
      // Test that each state has clear messaging
      mockSearchParams.get.mockReturnValue(null)

      render(<EmailVerification />)

      await waitFor(() => {
        expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
        expect(screen.getByText(/invalid verification link/i)).toBeInTheDocument()
      })
    })

    it('should handle button states correctly', async () => {
      mockSearchParams.get.mockReturnValue('expired-token')

      const mockVerifyEmail = jest.fn().mockRejectedValue({
        message: 'Token expired'
      })
      require('@/lib/api').api.auth.verifyEmail = mockVerifyEmail

      const user = userEvent.setup()
      render(<EmailVerification />)

      await waitFor(() => {
        const resendButton = screen.getByText(/resend verification email/i)
        expect(resendButton).not.toBeDisabled()
      })

      const resendButton = screen.getByText(/resend verification email/i)
      await user.click(resendButton)

      // The button immediately shows success state instead of loading state in the implementation
      await waitFor(() => {
        expect(screen.getByText(/a new verification email has been sent/i)).toBeInTheDocument()
      })
    })
  })
})