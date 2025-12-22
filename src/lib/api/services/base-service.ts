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

        if (contentType?.includes('application/json') && rawText) {
          // Only parse if we actually have JSON
          responseData = JSON.parse(rawText);
        } else {
          // If we get HTML or plain text, wrap it
          responseData = { message: rawText };
        }
      } catch (parseError) {
        // If JSON parsing fails, treat as plain text
        responseData = { message: rawText || 'Failed to parse response' };
      }

      if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
        console.log(`🔌 API Response [${response.status}]:`, responseData);
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

  /**
   * Special request method for file uploads (FormData)
   * Does not set Content-Type header - browser will set it with boundary
   */
  protected async uploadRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const headers: Record<string, string> = {};
    // Don't set Content-Type for FormData - browser will set it with boundary

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
      console.log(`🔌 API Upload Request [POST]:`, url);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        await this.redirectToLogin();
        throw new StegmaierApiError(401, 'Unauthorized - redirecting to login');
      }

      const responseData = await response.json();

      if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
        console.log(`🔌 API Upload Response [${response.status}]:`, responseData);
      }

      if (!response.ok) {
        throw new StegmaierApiError(
          response.status,
          responseData.error || responseData.message || `Upload failed with status ${response.status}`
        );
      }

      // Handle wrapped response
      return (responseData && typeof responseData === 'object' && 'data' in responseData)
        ? responseData.data as T
        : responseData as T;
    } catch (error) {
      if (error instanceof StegmaierApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'TypeError') {
        throw new StegmaierApiError(0, 'Network error', 'NETWORK_ERROR');
      }
      throw error;
    }
  }

  /**
   * Special request method for file downloads (PDF, DOCX, etc.)
   * Returns a Blob that can be downloaded
   */
  protected async downloadRequest(
    endpoint: string,
    filename: string,
    options: RequestInit = {}
  ): Promise<void> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
      console.log(`🔌 API Download Request [${options.method || 'GET'}]:`, url);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        await this.redirectToLogin();
        throw new StegmaierApiError(401, 'Unauthorized - redirecting to login');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Download failed with status ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore parse error, use default message
        }
        throw new StegmaierApiError(response.status, errorMessage);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
        console.log(`🔌 API Download Complete:`, filename);
      }
    } catch (error) {
      if (error instanceof StegmaierApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'TypeError') {
        throw new StegmaierApiError(0, 'Network error', 'NETWORK_ERROR');
      }
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