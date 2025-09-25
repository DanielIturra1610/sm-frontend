/**
 * Forgot Password Page
 */
export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>

      <div className="text-center">
        <p className="text-gray-600 mb-8">
          Password reset functionality coming soon.
        </p>

        <a
          href="/login"
          className="inline-block bg-stegmaier-blue hover:bg-stegmaier-blue/90 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Back to Login
        </a>
      </div>
    </div>
  )
}