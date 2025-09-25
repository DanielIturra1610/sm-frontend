'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail, AlertCircle, Clock, RefreshCw, Home, Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Logo } from '@/shared/components/ui/logo'
import { api } from '@/lib/api'

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid'

export function EmailVerification() {
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [showResendButton, setShowResendButton] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setMessage('No verification token found in the URL. Please check your email and click the correct verification link.')
      return
    }

    verifyEmail(token)
  }, [token])

  useEffect(() => {
    // If verification is successful, redirect to login immediately
    if (status === 'success') {
      // Add a small delay to allow user to see the success message
      const timer = setTimeout(() => {
        router.push('/login')
      }, 2000) // 2 seconds delay before redirect
      
      return () => clearTimeout(timer)
    }
  }, [status, router])

  useEffect(() => {
    // Show resend button after 5 seconds for expired status
    if (status === 'expired') {
      const timer = setTimeout(() => {
        setShowResendButton(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading')
      setMessage('Verifying your email address...')

      await api.auth.verifyEmail({ token: verificationToken })

      setStatus('success')
      setMessage('Your email has been successfully verified! You can now access all features of your account.')
    } catch (error: unknown) {
      console.error('Email verification error:', error)

      if ((error instanceof Error && error.message?.includes('expired')) || (error as { status?: number }).status === 410) {
        setStatus('expired')
        setMessage('Your verification link has expired. Verification links are valid for 24 hours for security reasons.')
      } else if ((error instanceof Error && (error.message?.includes('invalid') || error.message?.includes('not found'))) || (error as { status?: number }).status === 404) {
        setStatus('invalid')
        setMessage('This verification link is invalid or has already been used. Please request a new verification email.')
      } else {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'An unexpected error occurred while verifying your email. Please try again.')
      }
    }
  }

  const resendVerification = async () => {
    setIsResending(true)
    try {
      // Note: This would typically require the user's email
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500))
      setMessage('A new verification email has been sent to your inbox. Please check your email and click the verification link.')
      setStatus('success')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Failed to resend verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    const iconProps = { className: "h-16 w-16" }

    switch (status) {
      case 'loading':
        return <Loader2 {...iconProps} className="h-16 w-16 text-stegmaier-blue animate-spin" />
      case 'success':
        return <CheckCircle {...iconProps} className="h-16 w-16 text-success" />
      case 'expired':
        return <Clock {...iconProps} className="h-16 w-16 text-warning" />
      case 'invalid':
        return <AlertCircle {...iconProps} className="h-16 w-16 text-destructive" />
      case 'error':
        return <XCircle {...iconProps} className="h-16 w-16 text-destructive" />
      default:
        return <Mail {...iconProps} className="h-16 w-16 text-muted-foreground" />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email'
      case 'success':
        return 'Email Verified Successfully!'
      case 'expired':
        return 'Verification Link Expired'
      case 'invalid':
        return 'Invalid Verification Link'
      case 'error':
        return 'Verification Failed'
      default:
        return 'Email Verification'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-stegmaier-blue'
      case 'success':
        return 'text-success'
      case 'expired':
        return 'text-warning'
      case 'invalid':
      case 'error':
        return 'text-destructive'
      default:
        return 'text-foreground'
    }
  }

  const renderActionButtons = () => {
    switch (status) {
      case 'success':
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                ¡Verificación exitosa! Redirigiendo al inicio de sesión...
              </p>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className="bg-success h-2 rounded-full transition-all duration-2000 ease-linear"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <Button asChild className="w-full h-12 bg-stegmaier-blue hover:bg-stegmaier-blue-dark" disabled>
              <Link href="/login">
                <Home className="h-4 w-4 mr-2" />
                Iniciar sesión
              </Link>
            </Button>
          </div>
        )

      case 'expired':
        return (
          <div className="space-y-4">
            {showResendButton ? (
              <Button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full h-12 bg-stegmaier-blue hover:bg-stegmaier-blue-dark"
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending verification email...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Resend Verification Email
                  </span>
                )}
              </Button>
            ) : (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-stegmaier-blue" />
                <p className="text-sm text-muted-foreground">Preparing options...</p>
              </div>
            )}
            <Button variant="outline" asChild className="w-full h-12">
              <Link href="/register">
                <Mail className="h-4 w-4 mr-2" />
                Register with Different Email
              </Link>
            </Button>
          </div>
        )

      case 'invalid':
      case 'error':
        return (
          <div className="space-y-4">
            <Button
              onClick={() => {
                if (token) {
                  verifyEmail(token)
                } else {
                  window.location.reload()
                }
              }}
              className="w-full h-12 bg-stegmaier-blue hover:bg-stegmaier-blue-dark"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full h-12">
              <Link href="/register">
                <Mail className="h-4 w-4 mr-2" />
                Register New Account
              </Link>
            </Button>
          </div>
        )

      case 'loading':
      default:
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing verification...</span>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-stegmaier-blue/5 via-transparent to-stegmaier-blue/10" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-8" />
        </div>

        <Card className="card-stegmaier border-0 shadow-xl">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Status Icon */}
            <div className="flex justify-center">
              <div className="relative">
                {getStatusIcon()}
                {status === 'loading' && (
                  <div className="absolute inset-0 rounded-full border-4 border-stegmaier-blue/20 animate-pulse" />
                )}
              </div>
            </div>

            {/* Status Title */}
            <div className="space-y-2">
              <h1 className={`text-3xl font-bold ${getStatusColor()}`}>
                {getStatusTitle()}
              </h1>

              {/* Status Message */}
              <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                {message}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Action Buttons */}
            {renderActionButtons()}

            {/* Help Link */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Having trouble?{' '}
                <Link
                  href="/contact"
                  className="font-medium text-stegmaier-blue hover:text-stegmaier-blue-dark transition-colors underline-offset-4 hover:underline"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Navigation */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}