export default function HomePage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🎉 Stegmaier Management
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sistema de Gestión de Seguridad Industrial
        </p>
        <div className="space-x-4">
          <a
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Registro
          </a>
          <a
            href="/login"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  )
}