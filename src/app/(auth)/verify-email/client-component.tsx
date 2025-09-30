'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { EmailVerification } from '../_components/email-verification'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Logo } from '@/shared/components/ui/logo'
import Link from 'next/link'

/**
 * Client-only component for email verification
 * Handles the conditional rendering based on URL token
 * SCOPE: LOCAL - Only used in verify-email page
 */
export default function ClientVerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  // Determine if we should show the instructions or the verification component
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // On the client side, check if there's a token
    setShowInstructions(!token)
  }, [token])

  if (showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-stegmaier-blue/5 via-transparent to-stegmaier-blue/10" />

        <div className="relative z-10 w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Logo size="lg" className="mx-auto mb-8" />
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center space-y-6 pb-8">
              {/* Mail Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <Mail className="h-16 w-16 text-stegmaier-blue" />
                  <div className="absolute inset-0 rounded-full border-4 border-stegmaier-blue/20 animate-pulse" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-stegmaier-blue">
                  ¡Revisa tu correo electrónico!
                </h1>

                <p className="text-muted-foreground text-lg leading-relaxed">
                  Te hemos enviado un enlace de verificación a tu correo electrónico.
                  Por favor, haz clic en el enlace para verificar tu cuenta.
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button asChild className="w-full h-12 bg-stegmaier-blue hover:bg-stegmaier-blue-dark">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al inicio
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full h-12">
                  <Link href="/login">
                    <Mail className="h-4 w-4 mr-2" />
                    Ir a iniciar sesión
                  </Link>
                </Button>
              </div>

              {/* Help Link */}
              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  ¿No recibiste el correo?{' '}
                  <Link
                    href="/contact"
                    className="font-medium text-stegmaier-blue hover:text-stegmaier-blue-dark transition-colors underline-offset-4 hover:underline"
                  >
                    Contactar soporte
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
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // When there's a token, render the verification component
  return <EmailVerification />
}