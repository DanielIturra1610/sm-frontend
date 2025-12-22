'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Logo } from '@/shared/components/ui/logo'
import { 
  Shield,
  FileText,
  BarChart3,
  Workflow,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  TrendingUp,
  Activity,
  Zap,
  Award,
  Globe,
  Lock,
  ChevronDown,
  Play
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: Shield,
      title: 'Gestión de Incidentes',
      description: 'Reporte, seguimiento y análisis completo de incidentes de seguridad en tiempo real',
      gradient: 'from-red-500 to-red-600'
    },
    {
      icon: BarChart3,
      title: 'Análisis de Causas Raíz',
      description: 'Herramientas avanzadas de 5 porqués y espina de pescado para investigación profunda',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileText,
      title: 'Documentos y Reportes',
      description: 'Generación automática de documentos de cumplimiento y reportes personalizados',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Workflow,
      title: 'Flujos de Trabajo',
      description: 'Automatización de procesos y notificaciones con seguimiento de tareas',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Gestión de Equipos',
      description: 'Coordina y direcciona de manera más precisa las decisiones estratégicas de la organización para la operatividad diaria',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: CheckCircle,
      title: 'Cumplimiento',
      description: 'Seguimiento de estándares ISO 45001 y regulaciones locales',
      gradient: 'from-teal-500 to-cyan-600'
    }
  ]

  const testimonials = [
    {
      name: 'María González',
      role: 'Jefa de Seguridad',
      company: 'Industrias ACME',
      content: 'La plataforma ha reducido nuestros incidentes en un 40% en los primeros 6 meses. La trazabilidad y los análisis han sido fundamentales para nuestra transformación digital en seguridad.',
      rating: 5,
      avatar: 'MG'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Gerente de Operaciones',
      company: 'Construcciones Ltda.',
      content: 'La facilidad de uso y la rapidez para investigar incidentes es impresionante. Nuestro equipo de seguridad ahora puede enfocarse en la prevención en lugar de la documentación.',
      rating: 5,
      avatar: 'CR'
    },
    {
      name: 'Ana Martínez',
      role: 'Supervisora de Calidad',
      company: 'Minera del Norte',
      content: 'La trazabilidad de acciones correctivas es muy útil para auditorías. La integración con nuestros sistemas existentes ha sido perfecta, ahorrando horas de trabajo manual.',
      rating: 4,
      avatar: 'AM'
    }
  ]

  const stats = [
    { value: '99.9%', label: 'Tiempo de Operación', icon: Activity },
    { value: '500+', label: 'Clientes', icon: Globe },
    { value: '2M+', label: 'Incidentes gestionados', icon: TrendingUp },
    { value: '24/7', label: 'Soporte', icon: Shield }
  ]

  const integrations = [
    { name: 'ISO 45001', icon: Award },
    { name: 'SAP', icon: Workflow },
    { name: 'Microsoft 365', icon: Globe },
    { name: 'Salesforce', icon: Zap },
    { name: 'Google Workspace', icon: Globe },
    { name: 'Slack', icon: Zap }
  ]

  const pricingPlans = [
    {
      name: 'Básico',
      price: '$29',
      period: 'por mes',
      description: 'Perfecto para pequeñas empresas',
      features: [
        'Hasta 50 usuarios',
        '500 incidentes/mes',
        'Reportes básicos',
        'Soporte por email'
      ],
      cta: 'Comenzar',
      popular: false
    },
    {
      name: 'Profesional',
      price: '$99',
      period: 'por mes',
      description: 'Ideal para medianas empresas',
      features: [
        'Usuarios ilimitados',
        '2000 incidentes/mes',
        'Reportes avanzados',
        'Integraciones',
        'Soporte prioritario'
      ],
      cta: 'Comenzar',
      popular: true
    },
    {
      name: 'Empresarial',
      price: 'Personalizado',
      period: '',
      description: 'Para grandes organizaciones',
      features: [
        'Usuarios ilimitados',
        'Incidentes ilimitados',
        'Reportes personalizados',
        'API completa',
        'Soporte 24/7',
        'Consultoría dedicada'
      ],
      cta: 'Contactar ventas',
      popular: false
    }
  ]

  const faqs = [
    {
      question: '¿Cuánto tiempo tarda en implementarse la plataforma?',
      answer: 'La implementación básica toma menos de 24 horas. Nuestro proceso incluye configuración inicial, capacitación del equipo y migración de datos si es necesario.'
    },
    {
      question: '¿Qué tipo de soporte ofrecen?',
      answer: 'Ofrecemos soporte técnico 24/7 por chat, email y teléfono para planes Profesional y Empresarial. Los planes Básicos reciben soporte por email durante horario laboral.'
    },
    {
      question: '¿Puedo integrar con mis sistemas existentes?',
      answer: 'Sí, ofrecemos integraciones con sistemas populares como SAP, Microsoft 365, Salesforce y más. También disponemos de API REST completa para integraciones personalizadas.'
    },
    {
      question: '¿Cómo manejan la seguridad de los datos?',
      answer: 'Utilizamos cifrado AES-256 para datos en reposo, TLS 1.3 para transmisión, autenticación multifactor y cumplimiento con estándares ISO 27001 y SOC 2.'
    }
  ]

  const handleGetStarted = (): void => {
    router.push('/register')
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="sm" />
            </div>
            
            <nav className="hidden md:flex space-x-10">
              <button onClick={() => scrollToSection('features')} className="text-slate-700 hover:text-stegmaier-blue transition-colors font-medium">
                Funcionalidades
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-slate-700 hover:text-stegmaier-blue transition-colors font-medium">
                Testimonios
              </button>
              <button onClick={() => scrollToSection('stats')} className="text-slate-700 hover:text-stegmaier-blue transition-colors font-medium">
                Estadísticas
              </button>
              <button onClick={() => scrollToSection('integrations')} className="text-slate-700 hover:text-stegmaier-blue transition-colors font-medium">
                Integraciones
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-slate-700 hover:text-stegmaier-blue transition-colors font-medium">
                Precios
              </button>
            </nav>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-700 hover:text-stegmaier-blue">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-stegmaier-blue to-stegmaier-blue-dark hover:from-stegmaier-blue-dark hover:to-stegmaier-blue-dark shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  Crear Cuenta
                </Button>
              </Link>
            </div>
            
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection('features')} className="text-slate-700 hover:text-stegmaier-blue font-medium">
                  Funcionalidades
                </button>
                <button onClick={() => scrollToSection('testimonials')} className="text-slate-700 hover:text-stegmaier-blue font-medium">
                  Testimonios
                </button>
                <button onClick={() => scrollToSection('stats')} className="text-slate-700 hover:text-stegmaier-blue font-medium">
                  Estadísticas
                </button>
                <button onClick={() => scrollToSection('integrations')} className="text-slate-700 hover:text-stegmaier-blue font-medium">
                  Integraciones
                </button>
                <button onClick={() => scrollToSection('pricing')} className="text-slate-700 hover:text-stegmaier-blue font-medium">
                  Precios
                </button>
                <div className="pt-4 flex flex-col space-y-3 border-t border-slate-200 pt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-gradient-to-r from-stegmaier-blue to-stegmaier-blue-dark hover:from-stegmaier-blue-dark hover:to-stegmaier-blue-dark">
                      Crear Cuenta
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stegmaier-blue/5 via-transparent to-emerald-50/5"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-stegmaier-blue/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-stegmaier-blue/10 text-stegmaier-blue rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4 mr-2" />
                  Gestión de indicadores predictivos
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                  Transforma tu
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-stegmaier-blue to-emerald-600">
                    Gestión de Seguridad
                  </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                  La plataforma más avanzada para la gestión de incidentes, análisis de causas raíz, 
                  documentos de seguridad y flujos de trabajo. Cumple con estándares ISO y
                  mejora la efectividad en tu organización.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-stegmaier-blue to-emerald-600 hover:from-stegmaier-blue-dark hover:to-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-14 text-lg"
                  onClick={handleGetStarted}
                >
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/login">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-slate-200 hover:border-stegmaier-blue h-14 text-lg"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-6 pt-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <span className="text-slate-600 font-medium">4.9/5 de satisfacción</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-full h-full bg-gradient-to-r from-stegmaier-blue/20 to-emerald-500/20 rounded-2xl rotate-1 transform origin-center"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">12</div>
                      <div className="text-sm text-red-700">Incidentes Altos</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">34</div>
                      <div className="text-sm text-orange-700">Medios</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">156</div>
                      <div className="text-sm text-green-700">Resueltos</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">96%</div>
                      <div className="text-sm text-blue-700">Cumplimiento</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-stegmaier-blue to-emerald-500 w-3/4"></div>
                    </div>
                    <div className="text-sm text-slate-600 flex justify-between">
                      <span>Progreso</span>
                      <span>78%</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Tareas Pendientes</span>
                      <span className="text-sm font-medium text-slate-900">24</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Personalizados de gestión</span>
                        <span className="text-red-500 font-medium">Vence hoy</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Formación y entrenamiento</span>
                        <span className="text-amber-500 font-medium">Mañana</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-stegmaier-blue to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
              Funcionalidades que Transforman
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Herramientas poderosas diseñadas para mejorar la seguridad, la eficiencia y el cumplimiento normativo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:border-stegmaier-blue/20 transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-stegmaier-blue transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-24 bg-gradient-to-r from-stegmaier-blue to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Descubre Nuestra Plataforma
            </h2>
            <p className="text-xl text-stegmaier-blue/80 max-w-3xl mx-auto">
              Una vista rápida de cómo nuestra solución puede transformar tu gestión de seguridad
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-black/20 rounded-2xl overflow-hidden aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              Integraciones Perfectas
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Conecta nuestra plataforma con tus sistemas existentes para una experiencia sin interrupciones
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {integrations.map((integration, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center space-y-3 group hover:scale-110 transition-transform duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-stegmaier-blue to-emerald-500 rounded-xl flex items-center justify-center group-hover:from-emerald-500 group-hover:to-stegmaier-blue transition-colors duration-300">
                  <integration.icon className="h-8 w-8 text-white" />
                </div>
                <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                  {integration.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
              Planes que Crecen Contigo
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Elige el plan perfecto para las necesidades de tu organización
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-stegmaier-blue bg-gradient-to-b from-white to-stegmaier-blue/5 scale-105 z-10 shadow-xl' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-stegmaier-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-stegmaier-blue' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    {plan.period && <span className="text-slate-600">/{plan.period}</span>}
                  </div>
                  <p className="text-slate-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full h-12 ${
                    plan.popular 
                      ? 'bg-stegmaier-blue hover:bg-stegmaier-blue-dark text-white' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                  onClick={handleGetStarted}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
              Confian en Nosotros
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Empresas líderes en seguridad industrial han transformado sus operaciones con nuestra plataforma
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-stegmaier-blue to-emerald-500 flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-amber-400 fill-current' : 'text-slate-300'}`} 
                    />
                  ))}
                </div>
                
                <p className="text-slate-700 italic mb-6">
                  &quot;{testimonial.content}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-slate-600">
              Todo lo que necesitas saber sobre nuestra plataforma
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-6 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  </div>
                </div>
                <div className="p-6 border-t border-slate-200">
                  <p className="text-slate-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-stegmaier-blue to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Comienza tu Transformación en Seguridad
          </h2>
          <p className="text-xl text-stegmaier-blue/80 mb-10 max-w-2xl mx-auto">
            Úre tu cuenta gratuita hoy y descubre cómo nuestra plataforma puede transformar 
            tu gestión de seguridad industrial en minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-stegmaier-blue hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-14 text-lg px-8"
              onClick={handleGetStarted}
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="text-white/80 text-center">
              <div className="text-2xl font-bold text-white">14 días gratis</div>
              <div className="text-sm">Sin tarjeta de crédito</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <Logo variant="white" size="sm" className="mb-4" />
              <p className="text-slate-400 mb-6">
                La solución integral para la gestión de seguridad industrial y cumplimiento normativo.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-stegmaier-blue transition-colors cursor-pointer">
                  <span className="text-xs">f</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-stegmaier-blue transition-colors cursor-pointer">
                  <span className="text-xs">in</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-stegmaier-blue transition-colors cursor-pointer">
                  <span className="text-xs">t</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Producto</h4>
              <ul className="space-y-3 text-slate-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Funcionalidades</button></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentación</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Soporte</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Centro de Ayuda</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Estado del Servicio</Link></li>
                <li><Link href="/training" className="hover:text-white transition-colors">Capacitación</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Legal</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Seguridad</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Cumplimiento</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} Stegmaier Safety Management. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}