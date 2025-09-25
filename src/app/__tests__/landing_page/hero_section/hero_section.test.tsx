/**
 * HeroSection Component Tests
 * TDD: Red phase - Writing tests BEFORE implementation
 */

import { render, screen } from '@testing-library/react'
import { HeroSection } from '../../../(landing)/_components/hero-section'

describe('HeroSection Component', () => {
  describe('Content and Structure', () => {
    it('should render the main heading with correct text', () => {
      render(<HeroSection />)

      const heading = screen.getByRole('heading', {
        level: 1,
        name: /stegmaier safety management/i
      })

      expect(heading).toBeInTheDocument()
    })

    it('should display the value proposition text', () => {
      render(<HeroSection />)

      const valueProposition = screen.getByText(
        /comprehensive industrial safety document management system/i
      )

      expect(valueProposition).toBeInTheDocument()
    })

    it('should have a call-to-action for getting started', () => {
      render(<HeroSection />)

      const ctaButton = screen.getByRole('link', {
        name: /get started free/i
      })

      expect(ctaButton).toBeInTheDocument()
      expect(ctaButton).toHaveAttribute('href', '/register')
    })

    it('should have a sign in link', () => {
      render(<HeroSection />)

      const signInLink = screen.getByRole('link', {
        name: /sign in/i
      })

      expect(signInLink).toBeInTheDocument()
      expect(signInLink).toHaveAttribute('href', '/login')
    })
  })

  describe('Visual Design and Styling', () => {
    it('should have proper semantic structure', () => {
      render(<HeroSection />)

      const section = screen.getByRole('banner')
      expect(section).toBeInTheDocument()
    })

    it('should display buttons with correct visual hierarchy', () => {
      render(<HeroSection />)

      const primaryCTA = screen.getByRole('link', { name: /get started free/i })
      const secondaryCTA = screen.getByRole('link', { name: /sign in/i })

      // Primary CTA should have prominent styling
      expect(primaryCTA).toHaveClass('bg-white', 'text-blue-600')

      // Secondary CTA should have outline styling
      expect(secondaryCTA).toHaveClass('border-white', 'text-white')
    })

    it('should have gradient background styling', () => {
      render(<HeroSection />)

      const section = screen.getByRole('banner')
      expect(section).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-blue-800')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<HeroSection />)

      // Should have exactly one h1 element
      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
    })

    it('should have accessible button and link text', () => {
      render(<HeroSection />)

      const ctaButton = screen.getByRole('link', { name: /get started free/i })
      const signInLink = screen.getByRole('link', { name: /sign in/i })

      // Links should have descriptive text, not just "click here"
      expect(ctaButton).toHaveAccessibleName()
      expect(signInLink).toHaveAccessibleName()
    })

    it('should have adequate color contrast for text', () => {
      render(<HeroSection />)

      const section = screen.getByRole('banner')
      expect(section).toHaveClass('text-white') // White text on blue background = good contrast
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive container styling', () => {
      render(<HeroSection />)

      const container = screen.getByRole('banner').querySelector('.container')
      expect(container).toHaveClass('mx-auto', 'px-4')
    })

    it('should have responsive text sizing', () => {
      render(<HeroSection />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('text-5xl') // Large text for desktop
    })

    it('should have responsive button layout', () => {
      render(<HeroSection />)

      const buttonContainer = screen.getByRole('banner')
        .querySelector('.flex')

      expect(buttonContainer).toHaveClass('gap-4', 'justify-center')
    })
  })

  describe('Content Quality', () => {
    it('should include key safety management keywords', () => {
      render(<HeroSection />)

      const content = screen.getByRole('banner')

      // Should mention key domain concepts
      expect(content).toHaveTextContent(/safety/i)
      expect(content).toHaveTextContent(/industrial/i)
      expect(content).toHaveTextContent(/document management/i)
    })

    it('should have compelling and clear value proposition', () => {
      render(<HeroSection />)

      const valueProposition = screen.getByText(
        /comprehensive industrial safety document management system/i
      )

      // Should be present and include benefit-focused language
      expect(valueProposition).toBeInTheDocument()

      const benefitsText = screen.getByText(
        /advanced incident reporting, root cause analysis, and workflow automation/i
      )
      expect(benefitsText).toBeInTheDocument()
    })
  })

  describe('Business Goals Alignment', () => {
    it('should prioritize registration over login', () => {
      render(<HeroSection />)

      const registerButton = screen.getByRole('link', { name: /get started free/i })
      const loginButton = screen.getByRole('link', { name: /sign in/i })

      // Registration should be more prominent (primary button with white background)
      expect(registerButton).toHaveClass('bg-white', 'text-blue-600')
      // Login should be outline style (border styling)
      expect(loginButton).toHaveClass('border-white', 'text-white')
    })

    it('should emphasize free tier to reduce friction', () => {
      render(<HeroSection />)

      const freeCallout = screen.getByText(/get started free/i)
      expect(freeCallout).toBeInTheDocument()
    })
  })
})