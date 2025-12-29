'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Logo } from '@/shared/components/ui/logo'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion'
import {
  Workflow,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  TrendingDown,
  Zap,
  Target,
  Clock,
  Mail,
  Phone,
  AlertTriangle,
  PieChart,
  GitBranch,
  FileCheck,
  Sparkles,
  Award,
  BadgeCheck,
  Rocket,
  Eye,
  MousePointerClick
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

  const coreFeatures = [
    {
      icon: AlertTriangle,
      title: 'Registro de Incidentes',
      description: 'Captura cada detalle crítico en segundos. Formularios inteligentes que se adaptan al tipo de incidente.',
      highlight: 'Reduce tiempo de registro en 70%',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      icon: GitBranch,
      title: 'Análisis de Causa Raíz',
      description: '5 Porqués, Ishikawa y Árbol Causal integrados. Llega al origen real de cada problema.',
      highlight: 'Metodologías probadas ISO',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: FileCheck,
      title: 'Reportes Automáticos',
      description: 'Flash Reports, Investigaciones y Planes de Acción. Generación automática con un click.',
      highlight: 'Ahorra 5+ horas semanales',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Workflow,
      title: 'Flujos de Trabajo',
      description: 'Automatiza aprobaciones, notificaciones y seguimiento. Nada se pierde, todo se rastrea.',
      highlight: '100% trazabilidad',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: PieChart,
      title: 'Dashboard en Tiempo Real',
      description: 'KPIs, tendencias y métricas de seguridad. Toma decisiones basadas en datos reales.',
      highlight: 'Visibilidad total 24/7',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      icon: BadgeCheck,
      title: 'Cumplimiento ISO 45001',
      description: 'Preparado para auditorías. Documentación completa y evidencia trazable siempre disponible.',
      highlight: 'Auditorías sin estrés',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }
  ]

  const benefits = [
    {
      icon: TrendingDown,
      stat: '40%',
      label: 'Reducción de incidentes',
      description: 'en los primeros 6 meses de implementación'
    },
    {
      icon: Clock,
      stat: '70%',
      label: 'Menos tiempo en reportes',
      description: 'automatización de documentación'
    },
    {
      icon: Eye,
      stat: '100%',
      label: 'Visibilidad operacional',
      description: 'seguimiento en tiempo real'
    },
    {
      icon: Award,
      stat: '99%',
      label: 'Satisfacción en auditorías',
      description: 'cumplimiento normativo garantizado'
    }
  ]

  const testimonials = [
    {
      name: 'María González',
      role: 'Jefa de Seguridad',
      company: 'Industrias ACME',
      content: 'Antes perdíamos horas en papeleo. Ahora todo está digitalizado y podemos enfocarnos en lo que importa: prevenir incidentes. La plataforma transformó nuestra cultura de seguridad.',
      rating: 5,
      avatar: 'MG',
      result: '40% menos incidentes'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Gerente de Operaciones',
      company: 'Construcciones del Sur',
      content: 'Las herramientas de análisis de causa raíz son increíbles. Por fin entendemos por qué ocurren los problemas y podemos prevenirlos. El ROI fue inmediato.',
      rating: 5,
      avatar: 'CR',
      result: 'ROI en 3 meses'
    },
    {
      name: 'Ana Martínez',
      role: 'Supervisora HSE',
      company: 'Minera del Norte',
      content: 'La última auditoría ISO fue un éxito rotundo. Toda la documentación estaba lista, trazable y completa. Los auditores quedaron impresionados.',
      rating: 5,
      avatar: 'AM',
      result: 'Auditoría perfecta'
    }
  ]

  const faqs = [
    {
      question: '¿Qué tan rápido puedo empezar a usar la plataforma?',
      answer: 'La implementación es inmediata. En menos de 24 horas tendrás tu organización configurada, usuarios creados y estarás listo para registrar tu primer incidente. Nuestro equipo te acompaña en todo el proceso de onboarding.'
    },
    {
      question: '¿Necesito conocimientos técnicos para usar el sistema?',
      answer: 'No. La plataforma está diseñada para ser intuitiva y fácil de usar. Cualquier persona de tu equipo puede registrar incidentes, generar reportes y hacer seguimiento sin capacitación técnica previa. Además, ofrecemos entrenamiento personalizado.'
    },
    {
      question: '¿Cómo me ayuda con el cumplimiento ISO 45001?',
      answer: 'La plataforma está diseñada siguiendo los requisitos de ISO 45001. Cada incidente, investigación y acción correctiva queda documentada con trazabilidad completa. Cuando llegue la auditoría, tendrás toda la evidencia lista en segundos.'
    },
    {
      question: '¿Puedo ver una demostración antes de decidir?',
      answer: 'Por supuesto. Agenda una demo personalizada con nuestro equipo. Te mostraremos cómo la plataforma puede adaptarse a las necesidades específicas de tu organización y responderemos todas tus preguntas.'
    },
    {
      question: '¿Qué tipo de soporte ofrecen?',
      answer: 'Ofrecemos soporte dedicado con tiempos de respuesta garantizados. Además de soporte técnico, incluimos consultoría en gestión de seguridad para ayudarte a sacar el máximo provecho de la plataforma.'
    }
  ]

  const handleContactSales = (): void => {
    window.location.href = 'mailto:ventas@stegmaier.com?subject=Solicitud de información - Plataforma de Seguridad'
  }

  const handleDemo = (): void => {
    window.location.href = 'mailto:ventas@stegmaier.com?subject=Solicitud de Demo - Plataforma de Seguridad'
  }

  const handleLogin = (): void => {
    router.push('/login')
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center">
              <Logo size="sm" />
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className={`${scrolled ? 'text-slate-600 hover:text-stegmaier-blue' : 'text-white/90 hover:text-white'} transition-colors text-sm font-medium`}
              >
                Funcionalidades
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className={`${scrolled ? 'text-slate-600 hover:text-stegmaier-blue' : 'text-white/90 hover:text-white'} transition-colors text-sm font-medium`}
              >
                Beneficios
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className={`${scrolled ? 'text-slate-600 hover:text-stegmaier-blue' : 'text-white/90 hover:text-white'} transition-colors text-sm font-medium`}
              >
                Casos de Éxito
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className={`${scrolled ? 'text-slate-600 hover:text-stegmaier-blue' : 'text-white/90 hover:text-white'} transition-colors text-sm font-medium`}
              >
                FAQ
              </button>
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={handleLogin}
                className={`${scrolled ? 'text-slate-600 hover:text-stegmaier-blue hover:bg-stegmaier-blue/5' : 'text-white hover:bg-white/10'}`}
              >
                Iniciar Sesión
              </Button>
              <Button
                onClick={handleContactSales}
                className="!bg-stegmaier-blue hover:!bg-stegmaier-blue-dark !text-white shadow-md hover:shadow-lg transition-all border-0"
              >
                <Phone className="h-4 w-4 mr-2" />
                Contactar Ventas
              </Button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-100 bg-white">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-slate-600 hover:text-stegmaier-blue font-medium py-2 text-left"
                >
                  Funcionalidades
                </button>
                <button
                  onClick={() => scrollToSection('benefits')}
                  className="text-slate-600 hover:text-stegmaier-blue font-medium py-2 text-left"
                >
                  Beneficios
                </button>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="text-slate-600 hover:text-stegmaier-blue font-medium py-2 text-left"
                >
                  Casos de Éxito
                </button>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="text-slate-600 hover:text-stegmaier-blue font-medium py-2 text-left"
                >
                  FAQ
                </button>
                <div className="pt-4 flex flex-col space-y-2 border-t border-slate-100">
                  <Button variant="outline" onClick={handleLogin} className="w-full justify-center">
                    Iniciar Sesión
                  </Button>
                  <Button onClick={handleContactSales} className="w-full justify-center bg-stegmaier-blue hover:bg-stegmaier-blue-dark">
                    <Phone className="h-4 w-4 mr-2" />
                    Contactar Ventas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Impactante y emocional */}
      <section className="relative pt-28 md:pt-32 pb-20 md:pb-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-stegmaier-blue-dark" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8 border border-white/20">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Plataforma líder en indicadores predictivos y seguridad industrial</span>
            </div>

            {/* Headline principal */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
              Protege a tu equipo.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-stegmaier-blue-light to-emerald-400 pb-2">
                Transforma tu gestión.
              </span>
            </h1>

            {/* Subheadline emocional */}
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Cada incidente cuenta una historia. Nuestra plataforma te ayuda a entenderla,
              aprender de ella y <span className="text-white font-semibold">prevenir que vuelva a ocurrir</span>.
            </p>

            {/* Value proposition */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>Registro de incidentes inteligente</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>Análisis de causa raíz avanzado</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>Cumplimiento ISO 45001</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleDemo}
                className="!bg-white !text-slate-900 hover:!bg-slate-100 shadow-xl hover:shadow-2xl transition-all h-14 px-8 text-lg font-semibold group"
              >
                <Rocket className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                Solicitar Demo Gratis
              </Button>
              <Button
                size="lg"
                onClick={handleContactSales}
                className="!bg-transparent !border-2 !border-white/30 !text-white hover:!bg-white/10 h-14 px-8 text-lg"
              >
                <Phone className="h-5 w-5 mr-2" />
                Hablar con Ventas
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['MG', 'CR', 'AM', 'JP'].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-stegmaier-blue to-emerald-500 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800">
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-slate-300 text-sm ml-2">+500 empresas confían en nosotros</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-slate-300 text-sm ml-2">4.9/5 valoración</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
                <AlertTriangle className="h-4 w-4" />
                El problema
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                ¿Sigues gestionando la seguridad con hojas de cálculo y papeles?
              </h2>
              <div className="space-y-4 text-lg text-slate-600">
                <p className="flex items-start gap-3">
                  <X className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  Información dispersa en múltiples archivos y formatos
                </p>
                <p className="flex items-start gap-3">
                  <X className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  Horas perdidas buscando datos para auditorías
                </p>
                <p className="flex items-start gap-3">
                  <X className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  Incidentes que se repiten porque no se analiza la causa raíz
                </p>
                <p className="flex items-start gap-3">
                  <X className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  Falta de visibilidad sobre el estado real de la seguridad
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-stegmaier-blue/5 to-emerald-50 rounded-3xl p-8 border border-stegmaier-blue/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                <Zap className="h-4 w-4" />
                La solución
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                Una plataforma que centraliza todo y te da el control
              </h3>
              <div className="space-y-4 text-lg text-slate-600">
                <p className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  Todo en un solo lugar, accesible desde cualquier dispositivo
                </p>
                <p className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  Reportes generados automáticamente en segundos
                </p>
                <p className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  Herramientas de análisis para prevenir recurrencia
                </p>
                <p className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  Dashboard en tiempo real con métricas clave
                </p>
              </div>
              <Button
                onClick={handleDemo}
                className="mt-6 bg-stegmaier-blue hover:bg-stegmaier-blue-dark text-white"
              >
                Ver cómo funciona
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-stegmaier-blue/10 text-stegmaier-blue rounded-full text-sm font-medium mb-4">
              <Target className="h-4 w-4" />
              <span>Funcionalidades Poderosas</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Todo lo que necesitas para una
              <span className="text-stegmaier-blue"> gestión de seguridad excepcional</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Herramientas diseñadas por expertos en seguridad industrial para resolver los desafíos reales del día a día.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-stegmaier-blue/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full" />

                <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-stegmaier-blue transition-colors">
                  {feature.title}
                </h3>

                <p className="text-slate-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${feature.bgColor} rounded-full text-sm font-medium ${feature.color}`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {feature.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits/Results Section */}
      <section id="benefits" className="py-20 md:py-28 bg-gradient-to-br from-stegmaier-blue via-stegmaier-blue-dark to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Resultados que hablan por sí solos
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Empresas como la tuya ya están transformando su gestión de seguridad
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 group-hover:bg-white/20 transition-colors">
                  <benefit.icon className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="text-5xl md:text-6xl font-bold mb-2">{benefit.stat}</div>
                <div className="text-lg font-semibold text-white mb-1">{benefit.label}</div>
                <div className="text-sm text-white/60">{benefit.description}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-white/80 mb-6 text-lg">¿Listo para obtener estos resultados en tu organización?</p>
            <Button
              size="lg"
              onClick={handleDemo}
              className="bg-white text-stegmaier-blue hover:bg-slate-100 shadow-xl h-14 px-8 text-lg font-semibold"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Solicitar Demo Personalizada
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Empieza en minutos, no en semanas
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Implementación rápida y acompañamiento experto en cada paso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Agenda tu demo',
                description: 'Conversamos sobre tus necesidades y te mostramos cómo la plataforma puede ayudarte.',
                icon: MousePointerClick
              },
              {
                step: '02',
                title: 'Configuración express',
                description: 'En menos de 24 horas tendrás tu organización lista con usuarios y permisos configurados.',
                icon: Zap
              },
              {
                step: '03',
                title: 'Comienza a transformar',
                description: 'Registra incidentes, genera análisis y toma decisiones basadas en datos reales.',
                icon: Rocket
              }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-stegmaier-blue/30 hover:shadow-lg transition-all h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-6xl font-bold text-stegmaier-blue/20">{item.step}</div>
                    <div className="w-12 h-12 bg-stegmaier-blue/10 rounded-xl flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-stegmaier-blue" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-stegmaier-blue/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              <Star className="h-4 w-4 fill-amber-500" />
              <span>Casos de Éxito</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Empresas que ya transformaron su gestión
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Conoce las historias de organizaciones que eligieron dar el paso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-all relative"
              >
                {/* Result badge */}
                <div className="absolute -top-3 right-6">
                  <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    {testimonial.result}
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-6 pt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>

                <p className="text-slate-600 mb-6 leading-relaxed text-lg italic">
                  &quot;{testimonial.content}&quot;
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stegmaier-blue to-stegmaier-blue-dark flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                    <div className="text-sm text-stegmaier-blue font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-slate-600">
              Todo lo que necesitas saber antes de dar el siguiente paso
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-slate-50 border border-slate-200 rounded-xl px-6 overflow-hidden hover:border-stegmaier-blue/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-stegmaier-blue hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">¿Tienes más preguntas?</p>
            <Button
              onClick={handleContactSales}
              variant="outline"
              className="border-stegmaier-blue text-stegmaier-blue hover:bg-stegmaier-blue hover:text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Escríbenos
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-stegmaier-blue-dark to-stegmaier-blue relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 border border-white/20">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Da el siguiente paso</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Tu equipo merece la mejor protección
          </h2>

          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            No esperes al próximo incidente para actuar. Agenda una demo hoy y descubre cómo
            podemos ayudarte a construir una cultura de seguridad más fuerte.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleDemo}
              className="!bg-white !text-slate-900 hover:!bg-slate-100 shadow-xl hover:shadow-2xl h-14 px-8 text-lg font-semibold group"
            >
              <Rocket className="h-5 w-5 mr-2 group-hover:animate-bounce" />
              Solicitar Demo Gratis
            </Button>
            <Button
              size="lg"
              onClick={handleContactSales}
              className="!bg-transparent !border-2 !border-white/30 !text-white hover:!bg-white/10 h-14 px-8 text-lg"
            >
              <Phone className="h-5 w-5 mr-2" />
              Contactar Ventas
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Demo personalizada sin costo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Implementación en 24 horas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Soporte dedicado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Logo variant="white" size="sm" className="mb-4" />
              <p className="text-slate-400 mb-6 leading-relaxed max-w-md">
                La plataforma líder en gestión de seguridad industrial. Ayudamos a las organizaciones
                a proteger a su gente y cumplir con los más altos estándares de seguridad.
              </p>
              <div className="space-y-2">
                <a href="mailto:ventas@stegmaier.com" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>ventas@stegmaier.com</span>
                </a>
                <a href="tel:+56912345678" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>+56 9 1234 5678</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Navegación</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-slate-400 hover:text-white transition-colors">
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('benefits')} className="text-slate-400 hover:text-white transition-colors">
                    Beneficios
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('testimonials')} className="text-slate-400 hover:text-white transition-colors">
                    Casos de Éxito
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="text-slate-400 hover:text-white transition-colors">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                    Términos de Servicio
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Stegmaier Safety Management. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogin}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Iniciar Sesión
              </Button>
              <Button
                size="sm"
                onClick={handleContactSales}
                className="bg-stegmaier-blue hover:bg-stegmaier-blue-dark"
              >
                <Phone className="h-4 w-4 mr-2" />
                Contactar
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
