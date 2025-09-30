'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/shared/contexts/auth-context'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Loader2, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Define the form schema
const joinTenantSchema = z.object({
  invitationCode: z.string().min(6, 'Invitation code must be at least 6 characters'),
})

type JoinTenantForm = z.infer<typeof joinTenantSchema>

export default function JoinTenantPage() {
  const { joinCompany } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinTenantForm>({
    resolver: zodResolver(joinTenantSchema),
    defaultValues: {
      invitationCode: '',
    }
  })

  const onSubmit = async (data: JoinTenantForm) => {
    try {
      setError(null)
      
      // Call the API to join the company using invitation code
      await joinCompany({ invitationCode: data.invitationCode })
      
      // After successful join, redirect to dashboard
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to join company')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stegmaier-blue/5 to-stegmaier-blue/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-stegmaier-blue/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-stegmaier-blue" />
          </div>
          <CardTitle className="text-2xl font-bold">Join a Company</CardTitle>
          <CardDescription>
            Enter your invitation code to join an existing organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="invitationCode">Invitation Code *</Label>
              <Input
                id="invitationCode"
                {...register('invitationCode')}
                placeholder="Enter your invitation code"
                className="mt-1"
                aria-invalid={errors.invitationCode ? 'true' : 'false'}
              />
              {errors.invitationCode && (
                <p className="mt-1 text-sm text-red-600">{errors.invitationCode.message}</p>
              )}
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  </>
                ) : (
                  'Join Company'
                )}
              </Button>
              
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}