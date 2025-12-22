/**
 * Metrics Service
 * Handles all metrics and analytics API calls
 */

import { BaseService } from './base-service'

export interface DashboardMetrics {
  total_incidents: number
  open_incidents: number
  closed_incidents: number
  overdue_incidents: number
  incidents_this_month: number
  incidents_last_month: number
  frequency_index: number
}

export interface FrequencyIndex {
  frequency_index: number
  total_accidents: number
  total_hours_worked: number
  period: string
}

export interface IncidentsByGroup {
  name: string
  count: number
}

export interface SafetyPyramid {
  fatalities: number
  lost_time_injuries: number
  medical_treatment: number
  first_aid: number
  near_miss: number
  total: number
}

export interface PyramidByZone {
  zone: string
  fatalities: number
  lost_time_injuries: number
  medical_treatment: number
  first_aid: number
  near_miss: number
}

export interface AccidentsByLeaveType {
  with_leave: number
  without_leave: number
  total_accidents: number
  average_leave_days: number
}

export interface IncidentTrend {
  date: string
  count: number
}

export interface IncidentsByCategory {
  accidente: number
  incidente: number
  tolerancia_0: number
  total: number
}

export interface OverdueIncident {
  id: string
  title: string
  severity: string
  days_overdue: number
}

export interface YearlyComparisonFilter {
  current_year?: number
  previous_year?: number
  limit?: number
}

export interface YearlyComparisonData {
  current_year: number
  previous_year: number
  current_year_total: number
  previous_year_total: number
  change_percentage: number
  by_category: {
    category: string
    current_year: number
    previous_year: number
    change_percentage: number
  }[]
  by_month: {
    month: number
    current_year: number
    previous_year: number
  }[]
  top_changes: {
    name: string
    current_year: number
    previous_year: number
    change_percentage: number
    type: string
  }[]
}

export class MetricsService extends BaseService {
  /**
   * Get dashboard overview metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/metrics/dashboard', {
      method: 'GET',
    })
  }

  /**
   * Get frequency index (KPI)
   */
  async getFrequencyIndex(): Promise<FrequencyIndex> {
    return this.request<FrequencyIndex>('/metrics/frequency-index', {
      method: 'GET',
    })
  }

  /**
   * Get incidents grouped by activity
   */
  async getIncidentsByActivity(): Promise<IncidentsByGroup[]> {
    return this.request<IncidentsByGroup[]>('/metrics/by-activity', {
      method: 'GET',
    })
  }

  /**
   * Get incidents grouped by risk factor
   */
  async getIncidentsByRiskFactor(): Promise<IncidentsByGroup[]> {
    return this.request<IncidentsByGroup[]>('/metrics/by-risk-factor', {
      method: 'GET',
    })
  }

  /**
   * Get incidents grouped by zone
   */
  async getIncidentsByZone(): Promise<IncidentsByGroup[]> {
    return this.request<IncidentsByGroup[]>('/metrics/by-zone', {
      method: 'GET',
    })
  }

  /**
   * Get incidents grouped by area
   */
  async getIncidentsByArea(): Promise<IncidentsByGroup[]> {
    return this.request<IncidentsByGroup[]>('/metrics/by-area', {
      method: 'GET',
    })
  }

  /**
   * Get incidents grouped by category
   */
  async getIncidentsByCategory(): Promise<IncidentsByCategory> {
    return this.request<IncidentsByCategory>('/metrics/by-category', {
      method: 'GET',
    })
  }

  /**
   * Get overdue incidents
   */
  async getOverdueIncidents(limit: number = 10): Promise<{ total: number; incidents: OverdueIncident[]; limit: number }> {
    return this.request<{ total: number; incidents: OverdueIncident[]; limit: number }>(
      `/metrics/overdue?limit=${limit}`,
      {
        method: 'GET',
      }
    )
  }

  /**
   * Get on-time incidents
   */
  async getOnTimeIncidents(limit: number = 10): Promise<{ total: number; incidents: unknown[]; limit: number }> {
    return this.request<{ total: number; incidents: unknown[]; limit: number }>(
      `/metrics/on-time?limit=${limit}`,
      {
        method: 'GET',
      }
    )
  }

  /**
   * Get safety pyramid metrics
   */
  async getSafetyPyramid(): Promise<SafetyPyramid> {
    return this.request<SafetyPyramid>('/metrics/safety-pyramid', {
      method: 'GET',
    })
  }

  /**
   * Get pyramid metrics by zone
   */
  async getPyramidByZone(): Promise<PyramidByZone[]> {
    return this.request<PyramidByZone[]>('/metrics/pyramid/by-zone', {
      method: 'GET',
    })
  }

  /**
   * Get pyramid metrics by area
   */
  async getPyramidByArea(): Promise<PyramidByZone[]> {
    return this.request<PyramidByZone[]>('/metrics/pyramid/by-area', {
      method: 'GET',
    })
  }

  /**
   * Get accidents by leave type
   */
  async getAccidentsByLeaveType(): Promise<AccidentsByLeaveType> {
    return this.request<AccidentsByLeaveType>('/metrics/accidents/by-leave-type', {
      method: 'GET',
    })
  }

  /**
   * Get incident trends over time
   */
  async getIncidentTrends(period: 'month' | 'quarter' | 'year' = 'month'): Promise<{ period: string; trends: IncidentTrend[] }> {
    return this.request<{ period: string; trends: IncidentTrend[] }>(
      `/metrics/trends?period=${period}`,
      {
        method: 'GET',
      }
    )
  }

  /**
   * Get yearly comparison metrics (REQ-024)
   * Compares current year with previous year
   */
  async getYearlyComparison(filter?: YearlyComparisonFilter): Promise<YearlyComparisonData> {
    const params = new URLSearchParams()
    if (filter?.current_year) params.append('current_year', String(filter.current_year))
    if (filter?.previous_year) params.append('previous_year', String(filter.previous_year))
    if (filter?.limit) params.append('limit', String(filter.limit))

    const queryString = params.toString()
    return this.request<YearlyComparisonData>(
      `/metrics/yearly-comparison${queryString ? `?${queryString}` : ''}`,
      {
        method: 'GET',
      }
    )
  }
}
