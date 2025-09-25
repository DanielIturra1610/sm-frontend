/**
 * AuthContext Tests
 * TDD: Testing existing authentication context implementation
 *
 * @feature Authentication
 * @component shared/contexts/auth-context
 * @coverage unit
 *
 * PURPOSE: Validates authentication context functionality and state management
 * COVERAGE: User authentication, route protection, state management, API integration
 * DEPENDENCIES: next/navigation, API client, React hooks
 * MAINTENANCE: Update when auth flow or API endpoints change
 *
 * Test Scenarios:
 * - Authentication state management
 * - Login, register, logout functionality
 * - Protected route navigation
 * - Error handling and user feedback
 * - Token refresh and session management
 * - Provider context behavior
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '@/shared/contexts/auth-context'
import { api } from '@/lib/api'
import type { User, AuthResponse } from '@/shared/types/api'

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

// Test component to access auth context
function TestComponent() {
  const { user, isLoading, isAuthenticated, login, register, logout, refreshAuth } = useAuth()

  return (
    <div>
      <div data-testid="user-info">
        {user ? `User: ${user.full_name}` : 'No user'}
      </div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password123' })}>
        Login
      </button>
      <button onClick={() => register({
        full_name: 'Test User',
        phone: '1234567890',
        email: 'test@example.com',
        password: 'password123',
        password_confirm: 'password123'
      })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshAuth}>Refresh</button>
    </div>
  )
}

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  phone: '1234567890',
  email_verified: true,
  role: 'user',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockAuthResponse: AuthResponse = {
  user: mockUser,
  token: 'mock-token-123'
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/dashboard')
  })

  describe('Provider and Hook Integration', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })

    it('should provide auth context when used within AuthProvider', () => {
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.profile as jest.Mock) = mockProfile

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  describe('Authentication State Management', () => {
    it('should initialize with loading state', () => {
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.profile as jest.Mock) = mockProfile

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('loading')).toHaveTextContent('true')
    })

    it('should load user on mount when token exists', async () => {
      const mockProfile = jest.fn().mockResolvedValue(mockUser)
      ;(api.auth.profile as jest.Mock) = mockProfile

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(mockProfile).toHaveBeenCalled()
    })

    it('should handle failed initialization gracefully', async () => {
      const mockProfile = jest.fn().mockRejectedValue(new Error('Token invalid'))
      ;(api.auth.profile as jest.Mock) = mockProfile

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  describe('Login Functionality', () => {
    it('should handle successful login with verified email', async () => {
      const mockLogin = jest.fn().mockResolvedValue(mockAuthResponse)
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.login as jest.Mock) = mockLogin
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User')
      })

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should redirect to email verification for unverified users', async () => {
      const unverifiedUser = { ...mockUser, email_verified: false }
      const unverifiedResponse = { ...mockAuthResponse, user: unverifiedUser }

      const mockLogin = jest.fn().mockResolvedValue(unverifiedResponse)
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.login as jest.Mock) = mockLogin
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User')
      })

      expect(mockPush).toHaveBeenCalledWith('/verify-email')
    })

    it('should handle login errors', async () => {
      const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'))
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.login as jest.Mock) = mockLogin
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const loginButton = screen.getByText('Login')

      await expect(async () => {
        await user.click(loginButton)
      }).rejects.toThrow('Invalid credentials')

      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  describe('Registration Functionality', () => {
    it('should handle successful registration', async () => {
      const mockRegister = jest.fn().mockResolvedValue(mockAuthResponse)
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.register as jest.Mock) = mockRegister
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const registerButton = screen.getByText('Register')
      await user.click(registerButton)

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User')
      })

      expect(mockRegister).toHaveBeenCalledWith({
        full_name: 'Test User',
        phone: '1234567890',
        email: 'test@example.com',
        password: 'password123',
        password_confirm: 'password123'
      })
      expect(mockPush).toHaveBeenCalledWith('/verify-email')
    })

    it('should handle registration errors', async () => {
      const mockRegister = jest.fn().mockRejectedValue(new Error('Email already exists'))
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.register as jest.Mock) = mockRegister
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const registerButton = screen.getByText('Register')

      await expect(async () => {
        await user.click(registerButton)
      }).rejects.toThrow('Email already exists')

      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  describe('Logout Functionality', () => {
    it('should handle successful logout', async () => {
      const mockLogout = jest.fn().mockResolvedValue({})
      const mockProfile = jest.fn().mockResolvedValue(mockUser)
      ;(api.auth.logout as jest.Mock) = mockLogout
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User')
      })

      const logoutButton = screen.getByText('Logout')
      await user.click(logoutButton)

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      })

      expect(mockLogout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })

    it('should handle logout API errors gracefully', async () => {
      const mockLogout = jest.fn().mockRejectedValue(new Error('Network error'))
      const mockProfile = jest.fn().mockResolvedValue(mockUser)
      ;(api.auth.logout as jest.Mock) = mockLogout
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User')
      })

      const logoutButton = screen.getByText('Logout')
      await user.click(logoutButton)

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      })

      // Should still clear user state and redirect even if API fails
      expect(mockPush).toHaveBeenCalledWith('/')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  describe('Refresh Authentication', () => {
    it('should refresh user profile successfully', async () => {
      const updatedUser = { ...mockUser, full_name: 'Updated User' }
      const mockProfile = jest.fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser)
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User')
      })

      const refreshButton = screen.getByText('Refresh')
      await user.click(refreshButton)

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: Updated User')
      })

      expect(mockProfile).toHaveBeenCalledTimes(2)
    })

    it('should logout on refresh failure', async () => {
      const mockLogout = jest.fn().mockResolvedValue({})
      const mockProfile = jest.fn()
        .mockResolvedValueOnce(mockUser)
        .mockRejectedValueOnce(new Error('Token expired'))
      ;(api.auth.profile as jest.Mock) = mockProfile
      ;(api.auth.logout as jest.Mock) = mockLogout

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User')
      })

      const refreshButton = screen.getByText('Refresh')
      await user.click(refreshButton)

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      })

      expect(mockLogout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Route Protection Logic', () => {
    it('should redirect unauthenticated users to login from protected routes', async () => {
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.profile as jest.Mock) = mockProfile
      mockUsePathname.mockReturnValue('/dashboard')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('should redirect authenticated users away from auth pages', async () => {
      const mockProfile = jest.fn().mockResolvedValue(mockUser)
      ;(api.auth.profile as jest.Mock) = mockProfile
      mockUsePathname.mockReturnValue('/login')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should allow access to public pages', async () => {
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.profile as jest.Mock) = mockProfile
      mockUsePathname.mockReturnValue('/')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should allow access to auth pages for unauthenticated users', async () => {
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.profile as jest.Mock) = mockProfile
      mockUsePathname.mockReturnValue('/register')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('should set loading during login', async () => {
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })

      const mockLogin = jest.fn().mockReturnValue(loginPromise)
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.login as jest.Mock) = mockLogin
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const loginButton = screen.getByText('Login')
      await user.click(loginButton)

      expect(screen.getByTestId('loading')).toHaveTextContent('true')

      resolveLogin!(mockAuthResponse)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })
    })

    it('should set loading during registration', async () => {
      let resolveRegister: (value: any) => void
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve
      })

      const mockRegister = jest.fn().mockReturnValue(registerPromise)
      const mockProfile = jest.fn().mockRejectedValue(new Error('Not authenticated'))
      ;(api.auth.register as jest.Mock) = mockRegister
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const registerButton = screen.getByText('Register')
      await user.click(registerButton)

      expect(screen.getByTestId('loading')).toHaveTextContent('true')

      resolveRegister!(mockAuthResponse)

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })
    })

    it('should set loading during logout', async () => {
      let resolveLogout: (value: any) => void
      const logoutPromise = new Promise((resolve) => {
        resolveLogout = resolve
      })

      const mockLogout = jest.fn().mockReturnValue(logoutPromise)
      const mockProfile = jest.fn().mockResolvedValue(mockUser)
      ;(api.auth.logout as jest.Mock) = mockLogout
      ;(api.auth.profile as jest.Mock) = mockProfile

      const user = userEvent.setup()
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: Test User')
      })

      const logoutButton = screen.getByText('Logout')
      await user.click(logoutButton)

      expect(screen.getByTestId('loading')).toHaveTextContent('true')

      resolveLogout!({})

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })
    })
  })
})