/**
 * HeroSection Component - Landing Page
 * TDD: GREEN phase - Minimal implementation to pass tests
 * Scope: LOCAL to landing page only (1 feature usage)
 */

import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { Logo } from '@/shared/components/ui/logo'
import { ArrowRight, Shield, Users, BarChart3, CheckCircle } from 'lucide-react'

export function HeroSection() {
  return (
    <section
      className="bg-gradient-stegmaier text-white relative overflow-hidden min-h-screen flex items-center"
      role="banner"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-white/5 bg-repeat" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <Logo variant="white" size="xl" />
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Industrial Safety
              <br />
              <span className="text-white/90">Made Simple</span>
            </h1>

            <p className="text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed max-w-2xl">
              Comprehensive safety management system with advanced incident reporting,
              root cause analysis, and workflow automation for industrial environments.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-white/90" />
                <span className="text-white/90">ISO Compliant</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-white/90" />
                <span className="text-white/90">Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-white/90" />
                <span className="text-white/90">Multi-tenant Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-white/90" />
                <span className="text-white/90">24/7 Support</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-stegmaier-blue hover:bg-white/90 border-0 shadow-lg px-8 py-4 text-lg"
                asChild
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            <p className="text-sm text-white/70 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="relative">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Advanced Safety Protocols</h3>
                    <p className="text-white/80">
                      Comprehensive incident management with automated workflows and compliance tracking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Team Collaboration</h3>
                    <p className="text-white/80">
                      Multi-tenant workspace management with role-based access and permissions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Analytics & Insights</h3>
                    <p className="text-white/80">
                      Real-time dashboards with comprehensive reporting and trend analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}