/**
 * Suggestion Hooks
 * Hooks for fetching suggestion data from the backend
 */

import useSWR, { type SWRConfiguration } from 'swr'
import { env } from '@/lib/env'

/**
 * Suggestion from backend
 */
interface SuggestionResponse {
  suggestions: Array<{ value: string; count: number; last_used: string }>
  total: number
  limit: number
  offset: number
}

/**
 * Fetcher for suggestions endpoint
 */
async function fetchSuggestions(url: string): Promise<string[]> {
  const token = localStorage.getItem('auth-token')
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${url}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch suggestions')
  }

  const data = await response.json()
  // Backend returns { data: { suggestions: [...], total, limit, offset } }
  const suggestionData = data.data as SuggestionResponse | undefined
  if (!suggestionData?.suggestions) {
    return []
  }
  // Extract just the value strings from the suggestion objects
  return suggestionData.suggestions.map((s) => s.value)
}

/**
 * Get suggestions by type (responsables or clientes)
 */
export function useSuggestions(
  type: 'responsables' | 'clientes',
  config?: SWRConfiguration
) {
  // Note: Don't include /api/v1 since NEXT_PUBLIC_API_URL already includes it
  return useSWR<string[]>(
    `/suggestions/${type}`,
    fetchSuggestions,
    config
  )
}
