'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Check, X, Shield, Users, BarChart3, Zap, AlertCircle, Phone, Mail, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { AuthLayout } from './auth-layout'
import { useAuth } from '@/shared/contexts/auth-context'

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
    phone: z
      .string()
      .min(7, 'Phone number must be at least 7 digits')
      .max(15, 'Phone number must be less than 15 digits')
      .regex(/^[+]?[0-9\s-()]+$/, 'Please enter a valid phone number'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(100, 'Email must be less than 100 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

type PasswordStrength = 'weak' | 'medium' | 'strong'

interface PasswordRequirement {
  id: string
  text: string
  met: boolean
  required: boolean
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak')
  const { register: registerUser, isLoading } = useAuth()
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', text: 'At least 8 characters', met: false, required: true },
    { id: 'uppercase', text: 'One uppercase letter', met: false, required: true },
    { id: 'lowercase', text: 'One lowercase letter', met: false, required: true },
    { id: 'number', text: 'One number', met: false, required: true },
    { id: 'special', text: 'One special character', met: false, required: true },
  ])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    clearErrors,
    watch,
    setFocus,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      acceptTerms: false,
    },
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  useEffect(() => {
    if (password) {
      const requirements = [
        { id: 'length', text: 'At least 8 characters', met: password.length >= 8, required: true },
        { id: 'uppercase', text: 'One uppercase letter', met: /[A-Z]/.test(password), required: true },
        { id: 'lowercase', text: 'One lowercase letter', met: /[a-z]/.test(password), required: true },
        { id: 'number', text: 'One number', met: /\d/.test(password), required: true },
        { id: 'special', text: 'One special character', met: /[^A-Za-z0-9]/.test(password), required: true },
      ]

      setPasswordRequirements(requirements)

      const metCount = requirements.filter((req) => req.met).length
      if (metCount < 3) {
        setPasswordStrength('weak')
      } else if (metCount < 5) {
        setPasswordStrength('medium')
      } else {
        setPasswordStrength('strong')
      }
    } else {
      setPasswordStrength('weak')
      setPasswordRequirements((prev) =>
        prev.map((req) => ({ ...req, met: false }))
      )
    }
  }, [password])

  const onSubmit = async (data: RegisterForm) => {
    setApiError(null)
    clearErrors()

    try {
      await registerUser({
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        password: data.password,
        password_confirm: data.confirmPassword,
      })
    } catch (error: any) {
      if (error.name === 'NetworkError') {
        setApiError('Unable to connect to the server. Please check your connection and try again.')
      } else if (error.message?.includes('email already exists') || error.message?.includes('duplicate')) {
        setApiError('An account with this email already exists. Please use a different email or sign in.')
        setFocus('email')
      } else {
        setApiError(error.message || 'An unexpected error occurred. Please try again.')
      }
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return { text: 'Weak', color: 'text-error' }
      case 'medium':
        return { text: 'Good', color: 'text-warning' }
      case 'strong':
        return { text: 'Strong', color: 'text-success' }
      default:
        return { text: 'Weak', color: 'text-error' }
    }
  }

  const strengthInfo = getPasswordStrengthText()

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Quick Setup",
      description: "Get up and running in minutes with our guided onboarding process"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance standards protect your data"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Seamlessly manage teams across multiple locations and departments"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Real-time insights and comprehensive reporting for better decision making"
    }
  ]

  return (
    <AuthLayout
      title="Join the Future of Safety Management"
      subtitle="Get started with the most comprehensive industrial safety platform designed for modern workplaces."
      features={features}
    >
      <Card className="card-stegmaier border-0 shadow-xl">
        <CardHeader className="text-center space-y-3 pb-6">
          <CardTitle className="text-3xl font-bold text-foreground">
            Create your account
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Join thousands of safety professionals worldwide
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form role="form" className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Full Name Field */}
              <div className="form-group">
                <Label htmlFor="fullName" className="form-label text-base font-medium">
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name
                </Label>
                <Input
                  {...register('fullName')}
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  disabled={isLoading || isSubmitting}
                  className={`input-stegmaier h-12 text-base transition-all duration-300 ${
                    errors.fullName
                      ? 'border-destructive focus:ring-destructive/20'
                      : 'focus:ring-stegmaier-blue/20 focus:border-stegmaier-blue'
                  }`}
                />
                {errors.fullName && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="form-error text-sm" aria-live="polite">
                      {errors.fullName.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <Label htmlFor="phone" className="form-label text-base font-medium">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number
                </Label>
                <Input
                  {...register('phone')}
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  disabled={isLoading || isSubmitting}
                  className={`input-stegmaier h-12 text-base transition-all duration-300 ${
                    errors.phone
                      ? 'border-destructive focus:ring-destructive/20'
                      : 'focus:ring-stegmaier-blue/20 focus:border-stegmaier-blue'
                  }`}
                />
                {errors.phone && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="form-error text-sm" aria-live="polite">
                      {errors.phone.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <Label htmlFor="email" className="form-label text-base font-medium">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
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
                />
                {errors.email && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="form-error text-sm" aria-live="polite">
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
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    disabled={isLoading || isSubmitting}
                    className={`input-stegmaier h-12 text-base pr-12 transition-all duration-300 ${
                      errors.password
                        ? 'border-destructive focus:ring-destructive/20'
                        : 'focus:ring-stegmaier-blue/20 focus:border-stegmaier-blue'
                    }`}
                    aria-describedby="password-requirements"
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
                    <p className="form-error text-sm" aria-live="polite">
                      {errors.password.message}
                    </p>
                  </div>
                )}

                {/* Enhanced Password Strength Meter */}
                <div
                  data-testid="password-strength-meter"
                  data-strength={passwordStrength}
                  aria-live="polite"
                  aria-label={`Password strength: ${passwordStrength}`}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Password strength:</span>
                    <span className={`text-sm font-medium ${strengthInfo.color}`}>
                      {strengthInfo.text}
                    </span>
                  </div>

                  <div className="flex space-x-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                          level === 1 && passwordStrength === 'weak'
                            ? 'bg-error'
                            : level <= 2 && passwordStrength === 'medium'
                            ? 'bg-warning'
                            : level <= 3 && passwordStrength === 'strong'
                            ? 'bg-success'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Password Requirements */}
                  {password && (
                    <div id="password-requirements" className="space-y-2">
                      <p className="text-sm text-muted-foreground">Password requirements:</p>
                      <div className="grid grid-cols-1 gap-1">
                        {passwordRequirements.map((requirement) => (
                          <div
                            key={requirement.id}
                            data-testid={`requirement-${requirement.id}`}
                            data-met={requirement.met}
                            className="flex items-center gap-2 text-sm"
                          >
                            {requirement.met ? (
                              <Check className="h-4 w-4 text-success" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span
                              className={`transition-colors ${
                                requirement.met ? 'text-success' : 'text-muted-foreground'
                              }`}
                            >
                              {requirement.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <Label htmlFor="confirmPassword" className="form-label text-base font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    {...register('confirmPassword')}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    disabled={isLoading || isSubmitting}
                    className={`input-stegmaier h-12 text-base pr-12 transition-all duration-300 ${
                      errors.confirmPassword
                        ? 'border-destructive focus:ring-destructive/20'
                        : confirmPassword && password === confirmPassword
                        ? 'border-success focus:ring-success/20'
                        : 'focus:ring-stegmaier-blue/20 focus:border-stegmaier-blue'
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute inset-y-0 right-0 px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading || isSubmitting}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="form-error text-sm" aria-live="polite">
                      {errors.confirmPassword.message}
                    </p>
                  </div>
                )}
                {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    <Check className="h-4 w-4 text-success" />
                    <p className="text-sm text-success">Passwords match</p>
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-3 pt-2">
                <Controller
                  name="acceptTerms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="acceptTerms"
                      checked={field.value}
                      onCheckedChange={(value) => field.onChange(Boolean(value))}
                      disabled={isLoading || isSubmitting}
                      className="mt-0.5"
                    />
                  )}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="acceptTerms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer hover:text-foreground transition-colors"
                  >
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="font-medium text-stegmaier-blue hover:text-stegmaier-blue-dark transition-colors underline-offset-4 hover:underline"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="font-medium text-stegmaier-blue hover:text-stegmaier-blue-dark transition-colors underline-offset-4 hover:underline"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                  {errors.acceptTerms && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="form-error text-sm" aria-live="polite">
                        {errors.acceptTerms.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {apiError && (
              <div
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Registration failed</p>
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
                  Creating account...
                </span>
              ) : (
                'Create your account'
              )}
            </Button>

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-stegmaier-blue hover:text-stegmaier-blue-dark transition-colors underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}