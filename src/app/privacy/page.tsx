/**
 * Privacy Policy Page
 */
export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, phone number, and company information.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our safety management services, process transactions, send technical notices and support messages, and respond to your comments and questions.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
        <p>We do not sell, rent, or share your personal information with third parties without your consent, except as described in this policy or as required by law.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@stegmaier.com</p>
      </div>

      <div className="mt-8">
        <a href="/register" className="text-stegmaier-blue hover:underline">
          ← Back to Registration
        </a>
      </div>
    </div>
  )
}