'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/shared/contexts/auth-context'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Loader2, Building2, Users, Plus, LogOut } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CreateCompanyData } from '@/shared/types/api'

const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  domain: z.string().min(1, 'Domain is required'),
})

type CreateCompanyForm = z.infer<typeof createCompanySchema>

export function TenantSelectionPage() {
  const {
    user,
    companies,
    selectedCompany,
    isLoading,
    isLoadingCompanies,
    loadCompanies,
    selectTenant,
    createCompany,
    logout
  } = useAuth()

  const [selectingCompanyId, setSelectingCompanyId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema)
  })

  useEffect(() => {
    loadCompanies().catch(() => {
      setError('Failed to load companies')
    })
  }, [loadCompanies])

  const handleSelectTenant = async (companyId: string) => {
    try {
      setSelectingCompanyId(companyId)
      setError(null)
      await selectTenant(companyId)
    } catch (error) {
      setError('Failed to select company')
      setSelectingCompanyId(null)
    }
  }

  const handleCreateCompany = async (data: CreateCompanyForm) => {
    try {
      setError(null)
      await createCompany(data)
      setIsCreateDialogOpen(false)
      reset()
    } catch (error) {
      setError('Failed to create company')
    }
  }

  const handleRetryLoad = () => {
    setError(null)
    loadCompanies().catch(() => {
      setError('Failed to load companies')
    })
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  if (isLoadingCompanies) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Loading companies...</h2>
          <p className="text-gray-600 mt-2">Please wait while we fetch your companies</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Company</h1>
            <p className="text-gray-600">Choose a company to continue or create a new one</p>
          </div>

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-red-800">{error}</p>
              {error.includes('load') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryLoad}
                  className="text-red-600 border-red-200"
                >
                  Try again
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Companies grid */}
        {companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <CardDescription>{company.domain}</CardDescription>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      company.subscription.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      company.subscription.plan === 'professional' ? 'bg-blue-100 text-blue-800' :
                      company.subscription.plan === 'basic' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {capitalizeFirst(company.subscription.plan)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Users className="h-4 w-4" />
                    {company.userCount} users
                  </div>
                  <Button
                    onClick={() => handleSelectTenant(company.id)}
                    disabled={selectingCompanyId === company.id || isLoading}
                    className="w-full"
                  >
                    {selectingCompanyId === company.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Selecting...
                      </>
                    ) : (
                      `Select ${company.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 mb-8">
            <CardContent>
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first company</p>
            </CardContent>
          </Card>
        )}

        {/* Create company button */}
        <div className="text-center">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create New Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Set up a new company to get started with incident management
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreateCompany)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter company name"
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    {...register('domain')}
                    placeholder="company.com"
                    aria-invalid={errors.domain ? 'true' : 'false'}
                  />
                  {errors.domain && (
                    <p className="text-sm text-red-600">{errors.domain.message}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      reset()
                      setError(null)
                    }}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoadingCompanies}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Company'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export default function SelectTenantPage() {
  return <TenantSelectionPage />
}