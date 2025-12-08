'use client'

import { useAuth } from '@/shared/contexts/auth-context'
import { Sidebar } from '@/shared/components/layout/sidebar'
import { Button } from '@/shared/components/ui/button'
import { Toaster } from '@/shared/components/ui/toaster'
import { LogOut, Bell, Settings, Search } from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isLoading } = useAuth()

  // If still loading or no user, show loading state
  // AuthContext will handle redirect to /login
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-1 flex items-center gap-4">
                <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                  Stegmaier Safety Management
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Settings className="h-5 w-5" />
                </Button>

                <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Button onClick={logout} variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>

                {/* Mobile logout button */}
                <Button onClick={logout} variant="ghost" size="icon" className="sm:hidden">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}