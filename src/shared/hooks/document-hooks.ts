/**
 * Stegmaier Management - Document Hooks
 * Custom hooks for document management API integration with SWR
 */

import useSWR, { type SWRConfiguration } from 'swr'
import useSWRMutation from 'swr/mutation'
import { api } from '@/lib/api/modular-client'
import type {
  Document,
  GenerateDocumentRequest,
  DocumentListResponse,
  DocumentTemplate,
} from '@/shared/types/api'

// ============================================================================
// DOCUMENT HOOKS
// ============================================================================

/**
 * Get list of documents
 */
export function useDocuments(
  params?: { type?: string; status?: string },
  config?: SWRConfiguration
) {
  const key = params ? ['/documents', params] : '/documents'

  const { data, error, isLoading, isValidating, mutate } = useSWR<DocumentListResponse>(
    key,
    () => api.documents.list(params),
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

/**
 * Get specific document by ID
 */
export function useDocument(id: string | null, config?: SWRConfiguration) {
  return useSWR<Document>(
    id ? `/documents/${id}` : null,
    id ? () => api.documents.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Generate document
 */
export function useGenerateDocument() {
  const { mutate: mutateDocuments } = useDocuments()

  return useSWRMutation('/documents/generate',
    async (key, { arg }: { arg: GenerateDocumentRequest }) => {
      const document = await api.documents.generate(arg)

      // Refresh documents list
      await mutateDocuments()

      return document
    }
  )
}

/**
 * Create document template
 */
export function useCreateDocumentTemplate() {
  return useSWRMutation('/documents/templates',
    async (key, { arg }: { arg: DocumentTemplate }) =>
      api.documents.createTemplate(arg)
  )
}

/**
 * List document templates
 */
export function useDocumentTemplates(config?: SWRConfiguration) {
  return useSWR<DocumentTemplate[]>(
    '/documents/templates',
    () => api.documents.listTemplates(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config,
    }
  )
}

/**
 * Sign document
 */
export function useSignDocument(documentId: string) {
  const { mutate: mutateDocument } = useDocument(documentId)

  return {
    signDocument: async (signatureData: Record<string, unknown>) => {
      const response = await api.documents.sign(documentId, signatureData)

      // Update the cached document data
      await mutateDocument(response, false)

      return response
    }
  }
}

/**
 * Approve document
 */
export function useApproveDocument(documentId: string) {
  const { mutate: mutateDocument } = useDocument(documentId)

  return {
    approveDocument: async (approvalData: Record<string, unknown>) => {
      const response = await api.documents.approve(documentId, approvalData)

      // Update the cached document data
      await mutateDocument(response, false)

      return response
    }
  }
}