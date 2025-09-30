/**
 * Email Verification Page - Stegmaier Safety Management
 * Handles email verification after registration
 * Scope: LOCAL auth page (part of (auth) route group)
 */

import { Suspense } from 'react'
import ClientVerifyEmailPage from './client-component'

// Server component that sets up the Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification...</p>
        </div>
      </div>
    }>
      <ClientVerifyEmailPage />
    </Suspense>
  )
}