/**
 * Terms of Service Page
 */
export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using Stegmaier Safety Management System, you accept and agree to be bound by the terms and provision of this agreement.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
        <p>Permission is granted to temporarily use this system for personal, non-commercial transitory viewing only.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Disclaimer</h2>
        <p>Stegmaier makes no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Contact Information</h2>
        <p>Questions about the Terms of Service should be sent to us at support@stegmaier.com</p>
      </div>

      <div className="mt-8">
        <a href="/register" className="text-stegmaier-blue hover:underline">
          ← Back to Registration
        </a>
      </div>
    </div>
  )
}