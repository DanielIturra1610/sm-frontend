'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Shield, Users, BarChart3, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { AuthLayout } from './auth-layout'
import { useAuth } from '@/shared/contexts/auth-context'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { login, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    setFocus,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setApiError(null)
    clearErrors()

    try {
      await login({
        email: data.email,
        password: data.password,
      })
    } catch (error: any) {
      if (error.name === 'NetworkError') {
        setApiError('Unable to connect to the server. Please check your connection and try again.')
      } else if (error.message?.includes('invalid credentials') || error.message?.includes('unauthorized')) {
        setApiError('Invalid email or password. Please check your credentials and try again.')
        setFocus('email')
      } else {
        setApiError(error.message || 'An unexpected error occurred. Please try again.')
      }
    }
  }

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Advanced Safety Protocols",
      description: "Comprehensive incident management and compliance tracking with enterprise-grade security"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Seamless multi-tenant workspace management for teams of any size"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics & Insights",
      description: "Data-driven safety performance monitoring with real-time reporting"
    }
  ]

  return (
    <AuthLayout
      title="Industrial Safety Management Platform"
      subtitle="Streamline your safety processes with our comprehensive management solution designed for modern industrial environments."
      features={features}
    >
      <Card className="card-stegmaier border-0 shadow-xl">
        <CardHeader className="text-center space-y-3 pb-8">
          <CardTitle className="text-3xl font-bold text-foreground">
            Welcome back
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Sign in to your safety management workspace
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form role="form" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              {/* Email Field */}
              <div className="form-group">
                <Label htmlFor="email" className="form-label text-base font-medium">
                  Email address
                </Label>
                <Input
                  {...register('email')}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  disabled={isLoading || isSubmitting}
                  className={`input-stegmaier h-12 text-base transition-all duration-300 ${
                    errors.email
                      ? 'border-destructive focus:ring-destructive/20'
                      : 'focus:ring-stegmaier-blue/20 focus:border-stegmaier-blue'
                  }`}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p id="email-error" className="form-error text-sm" aria-live="polite">
                      {errors.email.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <Label htmlFor="password" className="form-label text-base font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    {...register('password')}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={isLoading || isSubmitting}
                    className={`input-stegmaier h-12 text-base pr-12 transition-all duration-300 ${
                      errors.password
                        ? 'border-destructive focus:ring-destructive/20'
                        : 'focus:ring-stegmaier-blue/20 focus:border-stegmaier-blue'
                    }`}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute inset-y-0 right-0 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading || isSubmitting}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p id="password-error" className="form-error text-sm" aria-live="polite">
                      {errors.password.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  {...register('rememberMe')}
                  id="rememberMe"
                  disabled={isLoading || isSubmitting}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  Remember me
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-stegmaier-blue hover:text-stegmaier-blue-dark transition-colors underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {apiError && (
              <div
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Sign in failed</p>
                  <p className="text-sm text-destructive/80 mt-1">{apiError}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-stegmaier-blue hover:bg-stegmaier-blue-dark transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              loading={isLoading || isSubmitting}
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in to your account'
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-stegmaier-blue hover:text-stegmaier-blue-dark transition-colors underline-offset-4 hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}