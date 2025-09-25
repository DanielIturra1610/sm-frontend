'use client'

import { ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Logo } from '@/shared/components/ui/logo'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start space-x-4 group">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-white mb-1 group-hover:text-white/95 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-white/80 leading-relaxed group-hover:text-white/90 transition-colors">
          {description}
        </p>
      </div>
    </div>
  )
}

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  features: Array<{
    icon: ReactNode
    title: string
    description: string
  }>
  className?: string
  showMobileLogo?: boolean
}

export function AuthLayout({
  children,
  title,
  subtitle,
  features,
  className,
  showMobileLogo = true,
}: AuthLayoutProps) {
  return (
    <div className={cn('min-h-screen flex', className)}>
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-stegmaier relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-white/5 bg-repeat"></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Header Section */}
          <div className="space-y-8">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <Logo variant="white" size="lg" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-md">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-fade-in-up"
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center text-white/60 text-sm">
            <p>© 2024 Stegmaier Management. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-background relative">
        {/* Background decoration for mobile */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-stegmaier-blue/5 via-transparent to-stegmaier-blue/10" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile Logo */}
          {showMobileLogo && (
            <div className="lg:hidden text-center transform hover:scale-105 transition-transform duration-300">
              <Logo size="lg" />
            </div>
          )}

          {/* Form Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}