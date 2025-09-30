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
import Link from 'next/link'

const createCompanySchema = z.object({
  name: z.string().min(1, 'El nombre de la empresa es requerido'),
  domain: z.string().min(1, 'El dominio es requerido'),
  industry: z.string().min(2, 'La industria debe tener al menos 2 caracteres').max(50, 'La industria debe tener como máximo 50 caracteres'),
  size: z.string().min(1, 'El tamaño de la empresa es requerido'),
  country: z.string().min(2, 'El código de país debe tener 2 caracteres').max(2, 'El código de país debe tener 2 caracteres'),
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
  const [mounted, setMounted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema)
  })

  // Prevent hydration errors - wait for mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load companies only after auth context is ready and component is mounted
  useEffect(() => {
    if (!mounted || isLoading || !user) {
      return
    }

    // Only load if companies haven't been loaded yet
    if (companies.length === 0) {
      loadCompanies().catch((err) => {
        console.error('Error loading companies:', err)
        setError('Error al cargar las empresas')
      })
    }
  }, [mounted, user, companies.length, loadCompanies]) // Remove isLoading from dependencies to prevent infinite loop

  // Early return for SSR/hydration safety
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Cargando...</h2>
        </div>
      </div>
    )
  }

  const handleSelectTenant = async (companyId: string) => {
    // Validation guards
    if (!companyId || !selectTenant) {
      setError('Error: Datos inválidos para seleccionar empresa')
      return
    }

    try {
      setSelectingCompanyId(companyId)
      setError(null)
      await selectTenant(companyId)
    } catch (error) {
      console.error('Error selecting tenant:', error)
      setError('Error al seleccionar la empresa')
      setSelectingCompanyId(null)
    }
  }

  const handleCreateCompany = async (data: CreateCompanyForm) => {
    try {
      setError(null)
      
      // Map the user selection to backend-expected values
      // Size mapping: "1-50" -> "small", "51-200" -> "medium", "201-500" -> "large", "500+" -> "enterprise"
      let backendSize: 'small' | 'medium' | 'large' | 'enterprise'
      switch(data.size) {
        case '1-50':
          backendSize = 'small'
          break
        case '51-200':
          backendSize = 'medium'
          break
        case '201-500':
          backendSize = 'large'
          break
        case '500+':
          backendSize = 'enterprise'
          break
        default:
          // Default to 'small' if somehow an invalid value gets through
          backendSize = 'small'
      }
      
      await createCompany({
        name: data.name,
        domain: data.domain,
        industry: data.industry,
        size: backendSize,
        country: data.country,
        settings: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFormat: 'DD/MM/YYYY',
          language: 'es',
          features: {
            fiveWhysAnalysis: true,
            fishboneAnalysis: true,
            documentGeneration: true,
            workflowEngine: true,
            customTemplates: true,
          },
          branding: {
            primaryColor: '#00a8e6',
            secondaryColor: '#10b981',
          },
        }
      })
      setIsCreateDialogOpen(false)
      reset()
    } catch (error) {
      setError('Error al crear la empresa')
    }
  }

  const handleRetryLoad = () => {
    if (!loadCompanies) {
      setError('Error: Función de carga no disponible')
      return
    }

    setError(null)
    loadCompanies().catch((err) => {
      console.error('Error retrying to load companies:', err)
      setError('Error al cargar las empresas')
    })
  }

  const capitalizeFirst = (str: string) => {
    if (!str || typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  if (isLoadingCompanies) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Cargando empresas...</h2>
          <p className="text-gray-600 mt-2">Por favor espere mientras buscamos sus empresas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Encabezado */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Selecciona Tu Empresa</h1>
            <p className="text-gray-600">Elige una empresa para continuar o crea una nueva</p>
          </div>

          {/* Información de usuario y cierre de sesión */}
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
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Mensaje de error */}
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
                  Intentar de nuevo
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Cuadrícula de empresas */}
        {Array.isArray(companies) && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {companies.map((company) => {
              // Validation guards for each company
              if (!company || !company.id) {
                console.warn('Invalid company data:', company)
                return null
              }

              return (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{company.name || 'Empresa sin nombre'}</CardTitle>
                          <CardDescription>{company.domain || 'Sin dominio'}</CardDescription>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        company.subscription?.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                        company.subscription?.plan === 'professional' ? 'bg-blue-100 text-blue-800' :
                        company.subscription?.plan === 'basic' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {capitalizeFirst(company.subscription?.plan || 'básico')}
                      </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Users className="h-4 w-4" />
                    {company.userCount || 0} usuarios
                  </div>
                  <Button
                    onClick={() => handleSelectTenant(company.id)}
                    disabled={selectingCompanyId === company.id || isLoading}
                    className="w-full"
                  >
                    {selectingCompanyId === company.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Seleccionando...
                      </>
                    ) : (
                      `Seleccionar ${company.name || 'Empresa'}`
                    )}
                  </Button>
                </CardContent>
              </Card>
              )
            }).filter(Boolean)}
          </div>
        ) : (
          <Card className="text-center py-12 mb-8">
            <CardContent>
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron empresas</h3>
              <p className="text-gray-600 mb-6">Comienza creando tu primera empresa</p>
            </CardContent>
          </Card>
        )}

        {/* Botones de crear o unirse a empresa */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/create-tenant">
              <Button size="lg" className="flex-1 gap-2 w-full">
                <Plus className="h-5 w-5" />
                Crear Nueva Empresa
              </Button>
            </Link>
            <Link href="/join-tenant">
              <Button size="lg" variant="outline" className="flex-1 gap-2 w-full">
                <Users className="h-5 w-5" />
                Unirse a Empresa
              </Button>
            </Link>
          </div>
          
          {/* Alternativa con diálogo para crear */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Empresa</DialogTitle>
                <DialogDescription>
                  Configura una nueva empresa para comenzar con la gestión de incidentes
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreateCompany)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ingresa el nombre de la empresa"
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Dominio/Identificación</Label>
                  <Input
                    id="domain"
                    {...register('domain')}
                    placeholder="empresa.com o RUT"
                    aria-invalid={errors.domain ? 'true' : 'false'}
                  />
                  {errors.domain && (
                    <p className="text-sm text-red-600">{errors.domain.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria *</Label>
                  <select
                    id="industry"
                    {...register('industry')}
                    className={`w-full p-2 border rounded-md ${
                      errors.industry ? 'border-red-500' : 'border-gray-300'
                    } bg-white`}
                    aria-invalid={errors.industry ? 'true' : 'false'}
                  >
                    <option value="">Selecciona una industria</option>
                    <option value="Manufacturing">Manufactura</option>
                    <option value="Technology">Tecnología</option>
                    <option value="Healthcare">Salud</option>
                    <option value="Construction">Construcción</option>
                    <option value="Retail">Venta Minorista</option>
                    <option value="Finance">Finanzas</option>
                    <option value="Education">Educación</option>
                    <option value="Energy">Energía</option>
                    <option value="Transportation">Transporte</option>
                    <option value="Agriculture">Agricultura</option>
                    <option value="Other">Otro</option>
                  </select>
                  {errors.industry && (
                    <p className="text-sm text-red-600">{errors.industry.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Tamaño de la Empresa *</Label>
                  <select
                    id="size"
                    {...register('size')}
                    className={`w-full p-2 border rounded-md ${
                      errors.size ? 'border-red-500' : 'border-gray-300'
                    } bg-white`}
                    aria-invalid={errors.size ? 'true' : 'false'}
                  >
                    <option value="">Selecciona el tamaño de la empresa</option>
                    <option value="1-50">Pequeña (1-50 empleados)</option>
                    <option value="51-200">Mediana (51-200 empleados)</option>
                    <option value="201-500">Grande (201-500 empleados)</option>
                    <option value="500+">Empresarial (500+ empleados)</option>
                  </select>
                  {errors.size && (
                    <p className="text-sm text-red-600">{errors.size.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País *</Label>
                  <select
                    id="country"
                    {...register('country')}
                    className={`w-full p-2 border rounded-md ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    } bg-white`}
                    aria-invalid={errors.country ? 'true' : 'false'}
                  >
                    <option value="">Selecciona un país</option>
                    <option value="CL">Chile</option>
                    <option value="US">Estados Unidos</option>
                    <option value="ES">España</option>
                    <option value="MX">México</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                    <option value="PE">Perú</option>
                    <option value="BR">Brasil</option>
                    <option value="DE">Alemania</option>
                    <option value="FR">Francia</option>
                    <option value="GB">Reino Unido</option>
                    <option value="IT">Italia</option>
                  </select>
                  {errors.country && (
                    <p className="text-sm text-red-600">{errors.country.message}</p>
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
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoadingCompanies}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creando...
                      </>
                    ) : (
                      'Crear Empresa'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Crear empresa sin salir (experimental)
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SelectTenantPage() {
  return <TenantSelectionPage />
}