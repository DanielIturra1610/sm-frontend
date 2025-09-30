/**
 * Base service class for API operations
 */

import { env } from '@/lib/env'
import { StegmaierApiError } from '@/lib/errors'

export interface ServiceConfig {
  baseURL: string;
  timeout?: number;
}

export abstract class BaseService {
  protected baseURL: string;
  protected timeout: number;

  constructor(config: ServiceConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000; // Default 10 seconds
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Log request if enabled
    if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
      console.log(`🔌 API Request [${options.method || 'GET'}]:`, url, {
        headers,
        body: options.body,
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // CRITICAL DEBUG: Log the actual status and headers
      console.log('🚨 CRITICAL DEBUG - Response Status:', response.status);
      console.log('🚨 CRITICAL DEBUG - Response OK:', response.ok);
      console.log('🚨 CRITICAL DEBUG - Response Headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        server: response.headers.get('server'),
        statusText: response.statusText,
      });

      // Handle authentication errors immediately
      if (response.status === 401) {
        await this.redirectToLogin();
        throw new StegmaierApiError(401, 'Unauthorized - redirecting to login');
      }

      // Parse response body
      let responseData: unknown;
      const contentType = response.headers.get('content-type');
      let rawText = '';

      try {
        rawText = await response.text();
        console.log('🚨 CRITICAL DEBUG - Raw Response Text:', rawText.substring(0, 500));

        if (contentType?.includes('application/json') && rawText) {
          // Only parse if we actually have JSON
          responseData = JSON.parse(rawText);
        } else {
          // If we get HTML or plain text, wrap it
          responseData = { message: rawText };
        }
      } catch (parseError) {
        // If JSON parsing fails, treat as plain text
        console.error('🚨 CRITICAL DEBUG - Failed to parse response:', parseError);
        console.error('🚨 CRITICAL DEBUG - Raw text was:', rawText);
        responseData = { message: rawText || 'Failed to parse response' };
      }

      if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
        console.log(`🔌 API Response [${response.status}]:`, {
          contentType,
          data: responseData,
          rawText: rawText.substring(0, 200) // Log first 200 chars
        });
      }

      // Handle successful responses
      if (response.ok) {
        const typedData = responseData as { data?: T } | T;
        return (typedData && typeof typedData === 'object' && 'data' in typedData)
          ? typedData.data as T
          : typedData as T;
      }

      // Handle error responses
      const errorData = responseData as {
        message?: string;
        code?: string;
        details?: Record<string, unknown>;
      };

      // Extract meaningful error message
      let errorMessage = errorData.message || `Request failed with status ${response.status}`;

      // If the error message looks like HTML, extract or simplify
      if (errorMessage.includes('<html') || errorMessage.includes('<!DOCTYPE')) {
        errorMessage = `Cannot ${options.method || 'GET'} ${endpoint}`;
      }

      const error = new StegmaierApiError(
        response.status,
        errorMessage,
        errorData.code,
        errorData.details
      );

      throw error;
    } catch (error) {
      // Handle network errors
      if (error instanceof Error && error.name === 'TypeError') {
        const networkError = new StegmaierApiError(
          0,
          'Network error',
          'NETWORK_ERROR'
        );
        throw networkError;
      }

      // Re-throw API errors and other errors
      throw error;
    }
  }

  protected async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    // Check localStorage first
    const token = localStorage.getItem('auth-token');
    if (token) return token;

    // Check sessionStorage as fallback
    return sessionStorage.getItem('auth-token');
  }

  protected async redirectToLogin(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Clear tokens
    localStorage.removeItem('auth-token');
    sessionStorage.removeItem('auth-token');

    // Redirect to login
    const currentPath = window.location.pathname;
    const loginUrl = `/login${currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;
    window.location.href = loginUrl;
  }

  protected toQueryString(params?: Record<string, unknown>): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}