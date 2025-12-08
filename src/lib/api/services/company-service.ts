/**
 * Company Service
 * Handles all company/multi-tenant API calls
 */

import { BaseService } from './base-service'
import type {
  Company,
  CreateCompanyData,
  JoinCompanyData,
  CompanyListResponse,
} from '@/shared/types/api'

export class CompanyService extends BaseService {
  /**
   * List all companies for current user
   */
  async list(): Promise<Company[]> {
    return this.request<Company[]>('/companies', {
      method: 'GET',
    })
  }

  /**
   * Get specific company by ID
   */
  async getById(id: string): Promise<Company> {
    return this.request<Company>(`/companies/${id}`, {
      method: 'GET',
    })
  }

  /**
   * Create new company
   */
  async create(data: CreateCompanyData): Promise<Company> {
    return this.request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update company
   */
  async update(id: string, data: Partial<CreateCompanyData>): Promise<Company> {
    return this.request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete company
   */
  async delete(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/companies/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Select tenant/company for current session
   */
  async selectTenant(companyId: string): Promise<{ message: string; tenant_id: string; token: string }> {
    return this.request<{ message: string; tenant_id: string; token: string }>(`/companies/${companyId}/select`, {
      method: 'POST',
    })
  }

  /**
   * Join company with invitation code
   */
  async joinCompany(data: JoinCompanyData): Promise<{ message: string; company: Company }> {
    return this.request<{ message: string; company: Company }>('/companies/join', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Generate invitation code for company
   */
  async generateInvitationCode(companyId: string): Promise<{ invitationCode: string; expiresAt: string }> {
    return this.request<{ invitationCode: string; expiresAt: string }>(`/companies/${companyId}/invitation`, {
      method: 'POST',
    })
  }

  /**
   * List company members
   */
  async listMembers(companyId: string): Promise<Array<{ id: string; name: string; email: string; role: string }>> {
    return this.request<Array<{ id: string; name: string; email: string; role: string }>>(`/companies/${companyId}/members`, {
      method: 'GET',
    })
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    companyId: string,
    userId: string,
    role: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/companies/${companyId}/members/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  /**
   * Remove member from company
   */
  async removeMember(companyId: string, userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/companies/${companyId}/members/${userId}`, {
      method: 'DELETE',
    })
  }
}