'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useAuth } from '@/shared/contexts/auth-context'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Logo } from '@/shared/components/ui/logo'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Eye, EyeOff, Shield, TrendingUp, Users, FileText, Loader2, CheckCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Por favor, ingresa un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  remember: z.boolean().optional()
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null)
      const { remember, ...loginData } = data
      await login(loginData)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión. Por favor, verifica tus credenciales.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Marca y Características */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-stegmaier-blue to-stegmaier-blue-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-24 text-white">
          <div className="mb-8">
            <Logo variant="white" size="lg" />
          </div>

          <h1 className="text-4xl font-bold mb-6">
            Bienvenido de nuevo a Stegmaier Management
          </h1>

          <p className="text-xl mb-12 text-white/90">
            Continúa gestionando tus operaciones de seguridad industrial con confianza y precisión.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Monitoreo en Tiempo Real</h3>
                <p className="text-white/80">Rastrea métricas de seguridad e incidentes según suceden</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Reportes de Cumplimiento</h3>
                <p className="text-white/80">Genera documentos de cumplimiento OSHA y regulatorios</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gestión de Equipos</h3>
                <p className="text-white/80">Coordina esfuerzos de seguridad en tu organización</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold">99.7%</div>
                <div className="text-sm text-white/70">Disponibilidad</div>
              </div>
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-white/70">Empresas</div>
              </div>
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-white/70">Soporte</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Login */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo Móvil */}
          <div className="lg:hidden mb-8 text-center">
            <Logo size="md" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Inicia sesión en tu cuenta</h2>
            <p className="text-gray-600">
              Accede a tu panel de gestión de seguridad
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Ingresa tu correo electrónico"
                className="mt-1"
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-stegmaier-blue hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Ingresa tu contraseña"
                  className="pr-10"
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                onCheckedChange={(checked) => {
                  // Convert the checked state to boolean and update the form state
                  setValue('remember', Boolean(checked));
                }}
                value={watch('remember') ? 'on' : ''}
                checked={!!watch('remember')}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Recordarme por 30 días
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-stegmaier-blue hover:underline font-medium">
                Crea una ahora
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                SSL Seguro
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-blue-500" />
                SOC 2 Tipo II
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}