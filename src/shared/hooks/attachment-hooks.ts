/**
 * Stegmaier Management - Attachment Hooks
 * Custom hooks for photo/file attachment management
 */

import useSWR, { type SWRConfiguration, type KeyedMutator } from 'swr'
import { useState, useCallback } from 'react'
import { api } from '@/lib/api'
import type {
  EnhancedAttachment,
  UpdateAttachmentParams,
  ReorderAttachmentParams,
} from '@/lib/api/services/attachment-service'

// ============================================================================
// BASE HOOK TYPES
// ============================================================================

interface UseApiResponse<T> {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
  isValidating: boolean
  mutate: KeyedMutator<T>
}

interface UseApiListResponse<T> extends UseApiResponse<T> {
  refresh: () => Promise<T | undefined>
}

// ============================================================================
// ATTACHMENT FETCH HOOKS
// ============================================================================

/**
 * Get all attachments for an incident
 */
export function useIncidentAttachments(
  incidentId: string | null,
  config?: SWRConfiguration
): UseApiListResponse<EnhancedAttachment[]> {
  const { data, error, isLoading, isValidating, mutate } = useSWR<EnhancedAttachment[]>(
    incidentId ? `/attachments/incident/${incidentId}` : null,
    incidentId ? () => api.attachments.getByIncidentId(incidentId) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  }
}

/**
 * Get only photo attachments for an incident
 */
export function useIncidentPhotos(
  incidentId: string | null,
  config?: SWRConfiguration
): UseApiListResponse<EnhancedAttachment[]> {
  const { data, error, isLoading, isValidating, mutate } = useSWR<EnhancedAttachment[]>(
    incidentId ? `/attachments/incident/${incidentId}/photos` : null,
    incidentId ? () => api.attachments.getPhotosByIncidentId(incidentId) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  }
}

/**
 * Get photos marked for final report inclusion
 */
export function useFinalReportPhotos(
  incidentId: string | null,
  config?: SWRConfiguration
): UseApiListResponse<EnhancedAttachment[]> {
  const { data, error, isLoading, isValidating, mutate } = useSWR<EnhancedAttachment[]>(
    incidentId ? `/attachments/incident/${incidentId}/final-report` : null,
    incidentId ? () => api.attachments.getForFinalReport(incidentId) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  }
}

/**
 * Get a single attachment by ID
 */
export function useAttachment(
  id: string | null,
  config?: SWRConfiguration
): UseApiResponse<EnhancedAttachment> {
  return useSWR<EnhancedAttachment>(
    id ? `/attachments/${id}` : null,
    id ? () => api.attachments.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

// ============================================================================
// ATTACHMENT MUTATION HOOKS
// ============================================================================

/**
 * Hook for attachment mutations (upload, update, delete, reorder)
 */
export function useAttachmentMutations() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Upload a single file
   */
  const upload = useCallback(async (
    incidentId: string,
    file: File,
    options?: {
      description?: string
      caption?: string
      reportId?: string
      reportType?: string
    }
  ): Promise<EnhancedAttachment> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.attachments.upload({
        file,
        incident_id: incidentId,
        description: options?.description,
        caption: options?.caption,
        report_id: options?.reportId,
        report_type: options?.reportType,
      })
      setIsLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload file')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  /**
   * Upload multiple files sequentially
   */
  const uploadMultiple = useCallback(async (
    incidentId: string,
    files: File[],
    options?: {
      reportId?: string
      reportType?: string
    }
  ): Promise<EnhancedAttachment[]> => {
    setIsLoading(true)
    setError(null)
    setUploadProgress(0)

    const results: EnhancedAttachment[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const result = await api.attachments.upload({
          file: files[i],
          incident_id: incidentId,
          report_id: options?.reportId,
          report_type: options?.reportType,
        })
        results.push(result)
        setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      }
      setIsLoading(false)
      setUploadProgress(0)
      return results
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload files')
      setError(error)
      setIsLoading(false)
      setUploadProgress(0)
      throw error
    }
  }, [])

  /**
   * Update attachment metadata
   */
  const update = useCallback(async (
    id: string,
    data: UpdateAttachmentParams
  ): Promise<EnhancedAttachment> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.attachments.update(id, data)
      setIsLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update attachment')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  /**
   * Delete an attachment
   */
  const remove = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await api.attachments.delete(id)
      setIsLoading(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete attachment')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  /**
   * Reorder attachments for final report
   */
  const reorder = useCallback(async (attachments: ReorderAttachmentParams[]): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await api.attachments.reorder(attachments)
      setIsLoading(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reorder attachments')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  /**
   * Toggle include in final report
   */
  const toggleFinalReport = useCallback(async (
    id: string,
    include: boolean
  ): Promise<EnhancedAttachment> => {
    return update(id, { include_in_final: include })
  }, [update])

  /**
   * Update caption
   */
  const updateCaption = useCallback(async (
    id: string,
    caption: string
  ): Promise<EnhancedAttachment> => {
    return update(id, { caption })
  }, [update])

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
    setUploadProgress(0)
  }, [])

  return {
    upload,
    uploadMultiple,
    update,
    remove,
    reorder,
    toggleFinalReport,
    updateCaption,
    isLoading,
    uploadProgress,
    error,
    reset,
  }
}

// ============================================================================
// COMBINED HOOK FOR INCIDENT PHOTOS WITH MUTATIONS
// ============================================================================

/**
 * All-in-one hook for managing incident photos
 * Combines fetching with mutation capabilities
 */
export function useIncidentPhotoManager(incidentId: string | null) {
  const {
    data: photos,
    error: fetchError,
    isLoading: isFetching,
    mutate,
    refresh,
  } = useIncidentPhotos(incidentId)

  const {
    upload,
    uploadMultiple,
    update,
    remove,
    toggleFinalReport,
    updateCaption,
    isLoading: isMutating,
    uploadProgress,
    error: mutationError,
    reset: resetMutation,
  } = useAttachmentMutations()

  /**
   * Upload files and refresh the list
   */
  const uploadAndRefresh = useCallback(async (files: File[]): Promise<EnhancedAttachment[]> => {
    if (!incidentId) throw new Error('No incident ID')

    const results = await uploadMultiple(incidentId, files)
    await mutate()
    return results
  }, [incidentId, uploadMultiple, mutate])

  /**
   * Delete and refresh the list
   */
  const deleteAndRefresh = useCallback(async (id: string): Promise<void> => {
    await remove(id)
    await mutate()
  }, [remove, mutate])

  /**
   * Update caption and refresh
   */
  const updateCaptionAndRefresh = useCallback(async (id: string, caption: string): Promise<void> => {
    await updateCaption(id, caption)
    await mutate()
  }, [updateCaption, mutate])

  /**
   * Toggle final report inclusion and refresh
   */
  const toggleFinalReportAndRefresh = useCallback(async (id: string, include: boolean): Promise<void> => {
    await toggleFinalReport(id, include)
    await mutate()
  }, [toggleFinalReport, mutate])

  return {
    // Data
    photos: photos || [],

    // Loading states
    isLoading: isFetching,
    isMutating,
    uploadProgress,

    // Errors
    error: fetchError || mutationError,

    // Actions
    upload: uploadAndRefresh,
    delete: deleteAndRefresh,
    updateCaption: updateCaptionAndRefresh,
    toggleFinalReport: toggleFinalReportAndRefresh,
    refresh,
    reset: resetMutation,
  }
}

// ============================================================================
// CAUSAL TREE DIAGRAM IMAGES
// ============================================================================

/**
 * Get causal tree diagram images for an incident
 * Filters attachments by report_type='causal_tree'
 */
export function useCausalTreeImages(
  incidentId: string | null,
  config?: SWRConfiguration
): UseApiListResponse<EnhancedAttachment[]> {
  const { data, error, isLoading, isValidating, mutate } = useSWR<EnhancedAttachment[]>(
    incidentId ? `/attachments/incident/${incidentId}/causal-tree` : null,
    incidentId ? async () => {
      // Get all attachments and filter by report_type
      const allAttachments = await api.attachments.getByIncidentId(incidentId)
      return allAttachments.filter(att => att.report_type === 'causal_tree')
    } : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  }
}

/**
 * Get a specific causal tree diagram image by analysis ID
 */
export function useCausalTreeImageByAnalysis(
  incidentId: string | null,
  analysisId: string | null,
  config?: SWRConfiguration
): UseApiResponse<EnhancedAttachment | null> {
  const { data, error, isLoading, isValidating, mutate } = useSWR<EnhancedAttachment | null>(
    incidentId && analysisId ? `/attachments/incident/${incidentId}/causal-tree/${analysisId}` : null,
    incidentId && analysisId ? async () => {
      const allAttachments = await api.attachments.getByIncidentId(incidentId)
      const found = allAttachments.find(
        att => att.report_type === 'causal_tree' && att.report_id === analysisId
      )
      return found || null
    } : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/**
 * Get category from MIME type
 */
export function getCategoryFromMimeType(mimeType: string): 'photo' | 'document' | 'video' | 'audio' {
  if (mimeType.startsWith('image/')) return 'photo'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'document'
}
