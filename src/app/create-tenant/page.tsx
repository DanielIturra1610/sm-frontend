'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/shared/contexts/auth-context'
import { useDebouncedCompanyValidation } from '@/shared/hooks/company-hooks'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/shared/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Loader2, Building2, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// RUT validation function (Chilean Tax ID)
function validateRUT(rut: string): boolean {
  // Remove dots and hyphens
  const cleanRUT = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
  
  // Check minimum length (7 digits + 1 verifier)
  if (cleanRUT.length < 8 || cleanRUT.length > 9) {
    return false
  }
  
  // Extract body and verifier digit
  const body = cleanRUT.slice(0, -1)
  const verifier = cleanRUT.slice(-1)
  
  // Check that body contains only numbers
  if (!/^\d+$/.test(body)) {
    return false
  }
  
  // Calculate verifier digit
  let sum = 0
  let multiplier = 2
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  
  const remainder = sum % 11
  const calculatedVerifier = 11 - remainder
  
  let expectedVerifier: string
  if (calculatedVerifier === 11) {
    expectedVerifier = '0'
  } else if (calculatedVerifier === 10) {
    expectedVerifier = 'K'
  } else {
    expectedVerifier = calculatedVerifier.toString()
  }
  
  return verifier === expectedVerifier
}

// Define the form schema
const createTenantSchema = z.object({
  name: z
    .string()
    .min(2, 'Nombre de la Empresa debe tener al menos 2 caracteres')
    .max(100, 'Nombre de la Empresa debe tener como máximo 100 caracteres'),
  rut: z
    .string()
    .min(8, 'RUT debe tener al menos 8 caracteres')
    .max(12, 'RUT debe tener como máximo 12 caracteres')
    .refine((val) => validateRUT(val), {
      message: 'RUT inválido. Verifica el formato y dígito verificador (ej: 12.345.678-9)',
    }),
  industry: z
    .string()
    .min(2, 'Industria debe tener al menos 2 caracteres')
    .max(50, 'Industria debe tener como máximo 50 caracteres'),
  size: z.enum(['small', 'medium', 'large', 'enterprise'], {
    errorMap: () => ({ message: 'Tamaño de la Empresa es requerido' }),
  }),
  country: z
    .string()
    .length(2, 'País debe ser un código de 2 caracteres'),
  description: z
    .string()
    .max(500, 'Descripción debe tener como máximo 500 caracteres')
    .optional(),
  website: z
    .string()
    .url('Por favor ingresa una URL válida')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(7, 'Teléfono debe tener al menos 7 caracteres')
    .max(15, 'Teléfono debe tener como máximo 15 caracteres')
    .optional(),
  address: z
    .string()
    .max(200, 'Dirección debe tener como máximo 200 caracteres')
    .optional(),
  city: z
    .string()
    .max(100, 'Ciudad debe tener como máximo 100 caracteres')
    .optional(),
})

type CreateTenantForm = z.infer<typeof createTenantSchema>

export default function CreateTenantPage() {
  const { createCompany } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  // Real-time validation hook
  const {
    validateName,
    validateRUT,
    nameExists,
    rutExists,
    isValidating,
  } = useDebouncedCompanyValidation(500)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTenantForm>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: '',
      rut: '',
      industry: '',
      size: undefined,
      country: '',
      description: '',
      website: '',
      phone: '',
      address: '',
      city: '',
    }
  })

  // Watch for changes in name and RUT fields
  const watchName = watch('name')
  const watchRUT = watch('rut')

  // Trigger validation when fields change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value && value.trim().length >= 2) {
      validateName(value)
    }
  }

  const handleRUTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value && value.trim().length >= 8) {
      validateRUT(value)
    }
  }

  // Set form errors when validation detects duplicates
  if (nameExists === true && !errors.name) {
    setFormError('name', { 
      type: 'manual', 
      message: 'Ya existe una empresa con este nombre' 
    })
  }

  if (rutExists === true && !errors.rut) {
    setFormError('rut', { 
      type: 'manual', 
      message: 'Ya existe una empresa con este RUT' 
    })
  }

  const onSubmit = async (data: CreateTenantForm) => {
    try {
      setError(null)
      
      // Call the API to create the company with all required fields
      await createCompany({
        name: data.name,
        rut: data.rut, // Using RUT field as required by backend
        industry: data.industry,
        size: data.size,
        country: data.country,
        description: data.description,
        website: data.website || undefined, // Convert empty string to undefined
        phone: data.phone || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        settings: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFormat: 'MM/DD/YYYY',
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
      
      // After successful creation, redirect to dashboard
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error al crear la empresa')
    }
  }

  // Industry options
  const industries = [
    'Tecnología',
    'Manufactura',
    'Salud',
    'Finanzas',
    'Retail',
    'Construcción',
    'Energía',
    'Transporte',
    'Otros'
  ]

  // Company size options
  const companySizes = [
    { value: 'small', label: 'Pequeña (1-50 empleados)' },
    { value: 'medium', label: 'Mediana (51-200 empleados)' },
    { value: 'large', label: 'Grande (201-1000 empleados)' },
    { value: 'enterprise', label: 'Empresarial (1000+ empleados)' },
  ]

  // Country options (ISO 3166-1 alpha-2 country codes) with Spanish names
  const countries = [
    { code: 'AF', name: 'Afganistán' },
    { code: 'AX', name: 'Islas Åland' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Argelia' },
    { code: 'AS', name: 'Samoa Americana' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AI', name: 'Anguila' },
    { code: 'AQ', name: 'Antártida' },
    { code: 'AG', name: 'Antigua y Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaiyán' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Baréin' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Bielorrusia' },
    { code: 'BE', name: 'Bélgica' },
    { code: 'BZ', name: 'Belice' },
    { code: 'BJ', name: 'Benín' },
    { code: 'BM', name: 'Bermudas' },
    { code: 'BT', name: 'Bután' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BQ', name: 'Caribe Neerlandés' },
    { code: 'BA', name: 'Bosnia y Herzegovina' },
    { code: 'BW', name: 'Botsuana' },
    { code: 'BV', name: 'Isla Bouvet' },
    { code: 'BR', name: 'Brasil' },
    { code: 'IO', name: 'Territorio Británico del Océano Índico' },
    { code: 'BN', name: 'Brunéi' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'KH', name: 'Camboya' },
    { code: 'CM', name: 'Camerún' },
    { code: 'CA', name: 'Canadá' },
    { code: 'CV', name: 'Cabo Verde' },
    { code: 'KY', name: 'Islas Caimán' },
    { code: 'CF', name: 'República Centroafricana' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CX', name: 'Isla de Navidad' },
    { code: 'CC', name: 'Islas Cocos' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoras' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'República Democrática del Congo' },
    { code: 'CK', name: 'Islas Cook' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: 'Costa de Marfil' },
    { code: 'HR', name: 'Croacia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CW', name: 'Curazao' },
    { code: 'CY', name: 'Chipre' },
    { code: 'CZ', name: 'República Checa' },
    { code: 'DK', name: 'Dinamarca' },
    { code: 'DJ', name: 'Yibuti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'República Dominicana' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egipto' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Guinea Ecuatorial' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'ET', name: 'Etiopía' },
    { code: 'FK', name: 'Islas Malvinas' },
    { code: 'FO', name: 'Islas Feroe' },
    { code: 'FJ', name: 'Fiyi' },
    { code: 'FI', name: 'Finlandia' },
    { code: 'FR', name: 'Francia' },
    { code: 'GF', name: 'Guayana Francesa' },
    { code: 'PF', name: 'Polinesia Francesa' },
    { code: 'TF', name: 'Tierras Australes y Antárticas Francesas' },
    { code: 'GA', name: 'Gabón' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Alemania' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GR', name: 'Grecia' },
    { code: 'GL', name: 'Groenlandia' },
    { code: 'GD', name: 'Granada' },
    { code: 'GP', name: 'Guadalupe' },
    { code: 'GU', name: 'Guam' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GG', name: 'Guernesey' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bisáu' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haití' },
    { code: 'HM', name: 'Islas Heard y McDonald' },
    { code: 'VA', name: 'Santa Sede' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'HU', name: 'Hungría' },
    { code: 'IS', name: 'Islandia' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IR', name: 'Irán' },
    { code: 'IQ', name: 'Irak' },
    { code: 'IE', name: 'Irlanda' },
    { code: 'IM', name: 'Isla de Man' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italia' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japón' },
    { code: 'JE', name: 'Jersey' },
    { code: 'JO', name: 'Jordania' },
    { code: 'KZ', name: 'Kazajistán' },
    { code: 'KE', name: 'Kenia' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KP', name: 'Corea del Norte' },
    { code: 'KR', name: 'Corea del Sur' },
    { code: 'XK', name: 'Kosovo' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kirguistán' },
    { code: 'LA', name: 'Laos' },
    { code: 'LV', name: 'Letonia' },
    { code: 'LB', name: 'Líbano' },
    { code: 'LS', name: 'Lesoto' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libia' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lituania' },
    { code: 'LU', name: 'Luxemburgo' },
    { code: 'MO', name: 'Macao' },
    { code: 'MK', name: 'Macedonia del Norte' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malaui' },
    { code: 'MY', name: 'Malasia' },
    { code: 'MV', name: 'Maldivas' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MH', name: 'Islas Marshall' },
    { code: 'MQ', name: 'Martinica' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauricio' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'MX', name: 'México' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'MD', name: 'Moldavia' },
    { code: 'MC', name: 'Mónaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'MA', name: 'Marruecos' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Birmania' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Países Bajos' },
    { code: 'NC', name: 'Nueva Caledonia' },
    { code: 'NZ', name: 'Nueva Zelanda' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Níger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NU', name: 'Niue' },
    { code: 'NF', name: 'Isla Norfolk' },
    { code: 'MP', name: 'Islas Marianas del Norte' },
    { code: 'NO', name: 'Noruega' },
    { code: 'OM', name: 'Omán' },
    { code: 'PK', name: 'Pakistán' },
    { code: 'PW', name: 'Palaos' },
    { code: 'PS', name: 'Palestina' },
    { code: 'PA', name: 'Panamá' },
    { code: 'PG', name: 'Papúa Nueva Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Perú' },
    { code: 'PH', name: 'Filipinas' },
    { code: 'PN', name: 'Islas Pitcairn' },
    { code: 'PL', name: 'Polonia' },
    { code: 'PT', name: 'Portugal' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'QA', name: 'Catar' },
    { code: 'RE', name: 'Reunión' },
    { code: 'RO', name: 'Rumania' },
    { code: 'RU', name: 'Rusia' },
    { code: 'RW', name: 'Ruanda' },
    { code: 'BL', name: 'San Bartolomé' },
    { code: 'SH', name: 'Santa Elena' },
    { code: 'KN', name: 'San Cristóbal y Nieves' },
    { code: 'LC', name: 'Santa Lucía' },
    { code: 'MF', name: 'San Martín' },
    { code: 'PM', name: 'San Pedro y Miquelón' },
    { code: 'VC', name: 'San Vicente y las Granadinas' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Santo Tomé y Príncipe' },
    { code: 'SA', name: 'Arabia Saudita' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leona' },
    { code: 'SG', name: 'Singapur' },
    { code: 'SX', name: 'Sint Maarten' },
    { code: 'SK', name: 'Eslovaquia' },
    { code: 'SI', name: 'Eslovenia' },
    { code: 'SB', name: 'Islas Salomón' },
    { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'Sudáfrica' },
    { code: 'GS', name: 'Georgia del Sur y las Islas Sandwich del Sur' },
    { code: 'SS', name: 'Sudán del Sur' },
    { code: 'ES', name: 'España' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudán' },
    { code: 'SR', name: 'Surinam' },
    { code: 'SJ', name: 'Svalbard y Jan Mayen' },
    { code: 'SZ', name: 'Esuatini' },
    { code: 'SE', name: 'Suecia' },
    { code: 'CH', name: 'Suiza' },
    { code: 'SY', name: 'Siria' },
    { code: 'TW', name: 'Taiwán' },
    { code: 'TJ', name: 'Tayikistán' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TH', name: 'Tailandia' },
    { code: 'TL', name: 'Timor Oriental' },
    { code: 'TG', name: 'Togo' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad y Tobago' },
    { code: 'TN', name: 'Túnez' },
    { code: 'TR', name: 'Turquía' },
    { code: 'TM', name: 'Turkmenistán' },
    { code: 'TC', name: 'Islas Turcas y Caicos' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UA', name: 'Ucrania' },
    { code: 'AE', name: 'Emiratos Árabes Unidos' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'UM', name: 'Islas Ultramarinas Menores de Estados Unidos' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistán' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'VG', name: 'Islas Vírgenes Británicas' },
    { code: 'VI', name: 'Islas Vírgenes de los Estados Unidos' },
    { code: 'WF', name: 'Wallis y Futuna' },
    { code: 'EH', name: 'Sahara Occidental' },
    { code: 'YE', name: 'Yemen' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabue' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stegmaier-blue/5 to-stegmaier-blue/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-stegmaier-blue/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-stegmaier-blue" />
          </div>
          <CardTitle className="text-2xl font-bold">Crear Empresa</CardTitle>
          <CardDescription>
            Ingresa la información de tu empresa para crear un nuevo tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Required fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre de la Empresa *
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    {...register('name')}
                    onChange={(e) => {
                      register('name').onChange(e)
                      handleNameChange(e)
                    }}
                    placeholder="Nombre legal de tu empresa"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    className={nameExists === false ? 'pr-10 border-green-500' : nameExists === true ? 'pr-10 border-red-500' : ''}
                  />
                  {isValidating && watchName && watchName.trim().length >= 2 && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {!isValidating && nameExists === false && watchName && watchName.trim().length >= 2 && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {!isValidating && nameExists === true && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </p>
                )}
                {!errors.name && nameExists === false && watchName && watchName.trim().length >= 2 && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Nombre disponible
                  </p>
                )}
                <p className="text-xs text-gray-500">Ingresa el nombre legal de tu empresa</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rut">
                  RUT / ID Tributario *
                </Label>
                <div className="relative">
                  <Input
                    id="rut"
                    {...register('rut')}
                    onChange={(e) => {
                      register('rut').onChange(e)
                      handleRUTChange(e)
                    }}
                    placeholder="12.345.678-9"
                    aria-invalid={errors.rut ? 'true' : 'false'}
                    className={rutExists === false ? 'pr-10 border-green-500' : rutExists === true ? 'pr-10 border-red-500' : ''}
                  />
                  {isValidating && watchRUT && watchRUT.trim().length >= 8 && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {!isValidating && rutExists === false && watchRUT && watchRUT.trim().length >= 8 && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {!isValidating && rutExists === true && (
                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.rut && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.rut.message}
                  </p>
                )}
                {!errors.rut && rutExists === false && watchRUT && watchRUT.trim().length >= 8 && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    RUT disponible
                  </p>
                )}
                <p className="text-xs text-gray-500">Ingresa el RUT con formato 12.345.678-9</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industria *
                </Label>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={errors.industry ? 'true' : 'false'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona industria" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.industry && (
                  <p className="text-sm text-red-600">{errors.industry.message}</p>
                )}
                <p className="text-xs text-gray-500">Selecciona la industria principal de tu empresa</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="size">
                  Tamaño de la Empresa *
                </Label>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={errors.size ? 'true' : 'false'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.size && (
                  <p className="text-sm text-red-600">{errors.size.message}</p>
                )}
                <p className="text-xs text-gray-500">Número de empleados en tu empresa</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">
                  País *
                </Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={errors.country ? 'true' : 'false'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona país" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.country && (
                  <p className="text-sm text-red-600">{errors.country.message}</p>
                )}
                <p className="text-xs text-gray-500">País donde opera tu empresa</p>
              </div>
            </div>
            
            {/* Optional fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">
                  Descripción de la Empresa
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe tu empresa y sus actividades comerciales..."
                  maxLength={500}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="text-xs text-gray-500">Proporciona una breve descripción de tu empresa (máximo 500 caracteres)</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">
                    Sitio Web de la Empresa
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    {...register('website')}
                    placeholder="https://www.tuempresa.com"
                    aria-invalid={errors.website ? 'true' : 'false'}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-600">{errors.website.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Ingresa el sitio web oficial de tu empresa</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Número de Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+56 9 1234 5678"
                    aria-invalid={errors.phone ? 'true' : 'false'}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Número de teléfono de contacto principal de tu empresa</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Dirección Calle
                  </Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Av. Principal 123, Oficina 100"
                    maxLength={200}
                    aria-invalid={errors.address ? 'true' : 'false'}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">{errors.address.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Dirección de la oficina principal de tu empresa</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">
                    Ciudad
                  </Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="Santiago"
                    maxLength={100}
                    aria-invalid={errors.city ? 'true' : 'false'}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">{errors.city.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Ciudad donde está ubicada tu empresa</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || nameExists === true || rutExists === true || isValidating}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando Empresa...
                  </>
                ) : (
                  'Crear Empresa'
                )}
              </Button>
              
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Inicio de Sesión
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}