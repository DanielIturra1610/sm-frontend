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
import { Eye, EyeOff, Shield, Users, BarChart3, CheckCircle, Loader2 } from 'lucide-react'

const registerSchema = z.object({
  full_name: z.string().min(2, 'El nombre completo debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El número de teléfono debe tener al menos 10 dígitos'),
  email: z.string().email('Por favor, ingresa un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  password_confirm: z.string(),
  terms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones')
}).refine(data => data.password === data.password_confirm, {
  message: "Las contraseñas no coinciden",
  path: ["password_confirm"]
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const password = watch('password')

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return { strength: 1, label: 'Débil' }
    if (score <= 3) return { strength: 2, label: 'Aceptable' }
    if (score <= 4) return { strength: 3, label: 'Buena' }
    return { strength: 4, label: 'Fuerte' }
  }

  const passwordStrength = getPasswordStrength(password || '')

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null)
      const { terms, ...registerData } = data
      await registerUser(registerData)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error en el registro. Por favor, inténtalo de nuevo.')
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
            Únete al Futuro de la Seguridad Industrial
          </h1>

          <p className="text-xl mb-12 text-white/90">
            Simplifica tu gestión de seguridad con herramientas empresariales diseñadas para entornos industriales modernos.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Cumplimiento OSHA</h3>
                <p className="text-white/80">Seguimiento y reporte automático de cumplimiento</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Análisis Avanzado</h3>
                <p className="text-white/80">Información en tiempo real y métricas predictivas de seguridad</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Colaboración en Equipo</h3>
                <p className="text-white/80">Gestión de flujos de trabajo sin problemas entre departamentos</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-white/70">
              Confiado por más de 500 empresas en todo el mundo para sus necesidades de gestión de seguridad
            </p>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Registro */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo Móvil */}
          <div className="lg:hidden mb-8 text-center">
            <Logo size="md" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Crea tu cuenta</h2>
            <p className="text-gray-600">
              Comienza con tu plataforma de gestión de seguridad
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Ingresa tu nombre completo"
                className="mt-1"
                aria-invalid={errors.full_name ? 'true' : 'false'}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Ingresa tu número de teléfono"
                className="mt-1"
                aria-invalid={errors.phone ? 'true' : 'false'}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

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
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Crea una contraseña segura"
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
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength === 1 ? 'w-1/4 bg-red-500' :
                          passwordStrength.strength === 2 ? 'w-2/4 bg-orange-500' :
                          passwordStrength.strength === 3 ? 'w-3/4 bg-yellow-500' :
                          'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 1 ? 'text-red-500' :
                      passwordStrength.strength === 2 ? 'text-orange-500' :
                      passwordStrength.strength === 3 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password_confirm">Confirmar Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="password_confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('password_confirm')}
                  placeholder="Confirma tu contraseña"
                  className="pr-10"
                  aria-invalid={errors.password_confirm ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password_confirm && (
                <p className="mt-1 text-sm text-red-600">{errors.password_confirm.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                onCheckedChange={(checked) => {
                  // Convert the checked state to boolean and update the form state
                  setValue('terms', Boolean(checked), { shouldValidate: true });
                }}
                value={watch('terms') ? 'on' : ''}
                checked={!!watch('terms')}
              />
              <Label htmlFor="terms" className="text-sm font-normal">
                Acepto los{' '}
                <Link href="/terms" className="text-stegmaier-blue hover:underline">
                  Términos y Condiciones
                </Link>{' '}
                y{' '}
                <Link href="/privacy" className="text-stegmaier-blue hover:underline">
                  Política de Privacidad
                </Link>
              </Label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-stegmaier-blue hover:underline font-medium">
                Iniciar sesión
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
                Cumple con GDPR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}