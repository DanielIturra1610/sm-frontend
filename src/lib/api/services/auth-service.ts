/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { BaseService } from './base-service'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  VerifyEmailData,
  ForgotPasswordData,
  ResetPasswordData,
  UpdateProfileData,
  ChangePasswordData,
  UserTenantStatus,
} from '@/shared/types/api'

export class AuthService extends BaseService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    // Store token in localStorage after successful login
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('auth-token', response.token)
    }

    return response
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    // Store token in localStorage after successful registration
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('auth-token', response.token)
    }

    return response
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.request<void>('/users/logout', {
        method: 'POST',
      })
    } finally {
      // Always remove token from storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token')
        sessionStorage.removeItem('auth-token')
      }
    }
  }

  /**
   * Get current user profile
   */
  async profile(): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'GET',
    })
  }

  /**
   * Refresh authentication token
   */
  async refresh(): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/refresh', {
      method: 'POST',
    })

    // Update token in localStorage
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('auth-token', response.token)
    }

    return response
  }

  /**
   * Verify email with token
   */
  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get user tenant status
   */
  async getTenantStatus(): Promise<UserTenantStatus> {
    return this.request<UserTenantStatus>('/users/status', {
      method: 'GET',
    })
  }

  /**
   * Get token from storage
   */
  async getToken(): Promise<string | null> {
    return super.getToken()
  }

  /**
   * Remove token from storage
   */
  async removeToken(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      sessionStorage.removeItem('auth-token')
    }
  }

  /**
   * Update token in storage
   */
  async updateToken(token: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token)
    }
  }
}