/**
 * FeaturesSection Component Tests
 * TDD: Red phase - Writing tests BEFORE implementation
 *
 * @feature Landing Page
 * @component app/_components/features-section
 * @coverage unit
 *
 * PURPOSE: Validates features section showcasing Stegmaier Safety Management capabilities
 * COVERAGE: Content, icons, layout, accessibility, business value communication
 * DEPENDENCIES: Lucide React icons
 * MAINTENANCE: Update when feature list or descriptions change
 *
 * Test Scenarios:
 * - Feature list rendering and content
 * - Icon display and accessibility
 * - Grid layout and responsive design
 * - Business value communication
 * - Visual hierarchy and styling
 */

import { render, screen } from '@testing-library/react'
import { FeaturesSection } from '../../../(landing)/_components/features-section'

describe('FeaturesSection Component', () => {
  describe('Core Functionality', () => {
    it('should render the main features heading', () => {
      render(<FeaturesSection />)

      const heading = screen.getByRole('heading', {
        level: 2,
        name: /everything you need for safety management/i
      })

      expect(heading).toBeInTheDocument()
    })

    it('should display all four core features', () => {
      render(<FeaturesSection />)

      // Core features that should be present
      expect(screen.getByText(/incident management/i)).toBeInTheDocument()
      expect(screen.getByText(/root cause analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/document generation/i)).toBeInTheDocument()
      expect(screen.getByText(/workflow automation/i)).toBeInTheDocument()
    })

    it('should include feature descriptions that communicate value', () => {
      render(<FeaturesSection />)

      // Incident Management
      expect(screen.getByText(/complete incident reporting and tracking system/i))
        .toBeInTheDocument()

      // Root Cause Analysis
      expect(screen.getByText(/five whys and fishbone analysis tools/i))
        .toBeInTheDocument()

      // Document Generation
      expect(screen.getByText(/automated safety document creation/i))
        .toBeInTheDocument()

      // Workflow Automation
      expect(screen.getByText(/streamlined approval and notification processes/i))
        .toBeInTheDocument()
    })
  })

  describe('Visual Design and Layout', () => {
    it('should have proper semantic structure', () => {
      render(<FeaturesSection />)

      const section = screen.getByRole('region', { name: /features/i })
      expect(section).toBeInTheDocument()
    })

    it('should display features in a responsive grid layout', () => {
      render(<FeaturesSection />)

      const gridContainer = screen.getByRole('region').querySelector('.grid')
      expect(gridContainer).toHaveClass(
        'grid',
        'md:grid-cols-2',
        'lg:grid-cols-4',
        'gap-8'
      )
    })

    it('should have appropriate background styling', () => {
      render(<FeaturesSection />)

      const section = screen.getByRole('region')
      expect(section).toHaveClass('py-16', 'bg-gray-50')
    })

    it('should center align feature content', () => {
      render(<FeaturesSection />)

      const featureItems = screen.getAllByTestId('feature-item')
      featureItems.forEach(item => {
        expect(item).toHaveClass('text-center')
      })
    })
  })

  describe('Icons and Visual Elements', () => {
    it('should display appropriate icons for each feature', () => {
      render(<FeaturesSection />)

      // Check that icons are present - we'll use test-ids for specific icon verification
      const incidentIcon = screen.getByTestId('incident-management-icon')
      const analysisIcon = screen.getByTestId('root-cause-analysis-icon')
      const documentIcon = screen.getByTestId('document-generation-icon')
      const workflowIcon = screen.getByTestId('workflow-automation-icon')

      expect(incidentIcon).toBeInTheDocument()
      expect(analysisIcon).toBeInTheDocument()
      expect(documentIcon).toBeInTheDocument()
      expect(workflowIcon).toBeInTheDocument()
    })

    it('should style icons with proper size and color', () => {
      render(<FeaturesSection />)

      const icons = screen.getAllByTestId(/-icon$/)
      icons.forEach(icon => {
        expect(icon).toHaveClass('h-12', 'w-12', 'mx-auto', 'mb-4', 'text-blue-600')
      })
    })

    it('should have consistent visual hierarchy', () => {
      render(<FeaturesSection />)

      // Main heading should be prominent
      const mainHeading = screen.getByRole('heading', { level: 2 })
      expect(mainHeading).toHaveClass('text-3xl', 'font-bold', 'text-center', 'mb-12')

      // Feature titles should be secondary
      const featureTitles = screen.getAllByRole('heading', { level: 3 })
      featureTitles.forEach(title => {
        expect(title).toHaveClass('text-xl', 'font-semibold', 'mb-2')
      })
    })
  })

  describe('Content Quality and Business Value', () => {
    it('should emphasize safety management domain', () => {
      render(<FeaturesSection />)

      const section = screen.getByRole('region')

      // Should prominently mention safety
      expect(section).toHaveTextContent(/safety management/i)
      expect(section).toHaveTextContent(/incident/i)
      expect(section).toHaveTextContent(/analysis/i)
    })

    it('should communicate automation and efficiency benefits', () => {
      render(<FeaturesSection />)

      const section = screen.getByRole('region')

      // Should highlight automation benefits
      expect(section).toHaveTextContent(/automated/i)
      expect(section).toHaveTextContent(/streamlined/i)
      expect(section).toHaveTextContent(/complete/i)
    })

    it('should mention specific methodologies', () => {
      render(<FeaturesSection />)

      // Should reference industry-standard analysis methods
      expect(screen.getByText(/five whys/i)).toBeInTheDocument()
      expect(screen.getByText(/fishbone/i)).toBeInTheDocument()
    })

    it('should emphasize comprehensive solution', () => {
      render(<FeaturesSection />)

      const heading = screen.getByText(/everything you need/i)
      expect(heading).toBeInTheDocument()

      // Should communicate complete solution
      expect(screen.getByText(/complete/i)).toBeInTheDocument()
      expect(screen.getByText(/automated/i)).toBeInTheDocument()
      expect(screen.getByText(/streamlined/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<FeaturesSection />)

      // Should have one h2 and four h3 elements
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      const h3Elements = screen.getAllByRole('heading', { level: 3 })

      expect(h2Elements).toHaveLength(1)
      expect(h3Elements).toHaveLength(4)
    })

    it('should have accessible icon representations', () => {
      render(<FeaturesSection />)

      const icons = screen.getAllByTestId(/-icon$/)
      icons.forEach(icon => {
        // Icons should have aria-hidden since they're decorative
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('should have sufficient color contrast', () => {
      render(<FeaturesSection />)

      const section = screen.getByRole('region')

      // Gray background with dark text should have good contrast
      expect(section).toHaveClass('bg-gray-50')

      const descriptions = screen.getAllByText(/system|tools|creation|processes/)
      descriptions.forEach(desc => {
        expect(desc).toHaveClass('text-gray-600')
      })
    })

    it('should have semantic landmark', () => {
      render(<FeaturesSection />)

      const section = screen.getByRole('region')
      expect(section).toHaveAttribute('aria-label', 'Features section')
    })
  })

  describe('Responsive Design', () => {
    it('should have mobile-first grid system', () => {
      render(<FeaturesSection />)

      const grid = screen.getByRole('region').querySelector('.grid')

      // Should stack on mobile, 2 cols on tablet, 4 cols on desktop
      expect(grid).toHaveClass(
        'grid',          // Base: 1 column
        'md:grid-cols-2', // Tablet: 2 columns
        'lg:grid-cols-4'  // Desktop: 4 columns
      )
    })

    it('should have responsive spacing', () => {
      render(<FeaturesSection />)

      const section = screen.getByRole('region')
      const container = section.querySelector('.container')

      expect(section).toHaveClass('py-16') // Vertical padding
      expect(container).toHaveClass('mx-auto', 'px-4') // Responsive horizontal spacing
    })

    it('should maintain readability across breakpoints', () => {
      render(<FeaturesSection />)

      const grid = screen.getByRole('region').querySelector('.grid')
      expect(grid).toHaveClass('gap-8') // Consistent spacing between items
    })
  })

  describe('Performance Considerations', () => {
    it('should render efficiently without unnecessary re-renders', () => {
      // This would be tested with React DevTools Profiler in integration tests
      render(<FeaturesSection />)

      // Verify that all content renders in single pass
      const features = screen.getAllByTestId('feature-item')
      expect(features).toHaveLength(4)
    })

    it('should not cause layout shift', () => {
      render(<FeaturesSection />)

      // Icons should have fixed dimensions to prevent layout shift
      const icons = screen.getAllByTestId(/-icon$/)
      icons.forEach(icon => {
        expect(icon).toHaveClass('h-12', 'w-12')
      })
    })
  })
})