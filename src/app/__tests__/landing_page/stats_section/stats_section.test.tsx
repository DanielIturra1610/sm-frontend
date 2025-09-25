/**
 * StatsSection Component Tests
 * TDD: Red phase - Writing tests BEFORE implementation
 *
 * @feature Landing Page
 * @component app/_components/stats-section
 * @coverage unit
 *
 * PURPOSE: Validates statistics section showcasing Stegmaier Management impact and credibility
 * COVERAGE: Statistics display, animations, visual impact, business credibility
 * DEPENDENCIES: None (pure component with static stats)
 * MAINTENANCE: Update when business metrics change or new achievements are added
 *
 * Test Scenarios:
 * - Statistics content and formatting
 * - Visual hierarchy and emphasis
 * - Animation and engagement effects
 * - Business credibility communication
 * - Layout and responsive design
 */

import { render, screen } from '@testing-library/react'
import { StatsSection } from '../../../(landing)/_components/stats-section'

describe('StatsSection Component', () => {
  describe('Core Functionality', () => {
    it('should render key business statistics', () => {
      render(<StatsSection />)

      // Key metrics that build credibility
      expect(screen.getByText(/companies trust/i)).toBeInTheDocument()
      expect(screen.getByText(/incidents managed/i)).toBeInTheDocument()
      expect(screen.getByText(/documents generated/i)).toBeInTheDocument()
      expect(screen.getByText(/uptime guaranteed/i)).toBeInTheDocument()
    })

    it('should display impressive numerical values', () => {
      render(<StatsSection />)

      // Large numbers that demonstrate scale and reliability
      expect(screen.getByText(/500\+/)).toBeInTheDocument() // Companies
      expect(screen.getByText(/10,000\+/)).toBeInTheDocument() // Incidents
      expect(screen.getByText(/50,000\+/)).toBeInTheDocument() // Documents
      expect(screen.getByText(/99\.9%/)).toBeInTheDocument() // Uptime
    })

    it('should include descriptive labels for each statistic', () => {
      render(<StatsSection />)

      // Clear labels that explain what the numbers mean
      expect(screen.getByText(/companies trust stegmaier/i)).toBeInTheDocument()
      expect(screen.getByText(/safety incidents managed monthly/i)).toBeInTheDocument()
      expect(screen.getByText(/compliance documents generated/i)).toBeInTheDocument()
      expect(screen.getByText(/system uptime guaranteed/i)).toBeInTheDocument()
    })
  })

  describe('Visual Design and Impact', () => {
    it('should have contrasting background for emphasis', () => {
      render(<StatsSection />)

      const section = screen.getByRole('region', { name: /statistics/i })
      expect(section).toHaveClass('bg-blue-600', 'text-white')
    })

    it('should display statistics in a balanced grid layout', () => {
      render(<StatsSection />)

      const gridContainer = screen.getByRole('region').querySelector('.grid')
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-2',
        'md:grid-cols-4',
        'gap-8'
      )
    })

    it('should emphasize the numerical values', () => {
      render(<StatsSection />)

      const statNumbers = screen.getAllByTestId('stat-number')
      statNumbers.forEach(number => {
        expect(number).toHaveClass('text-4xl', 'font-bold', 'mb-2')
      })
    })

    it('should style labels for readability', () => {
      render(<StatsSection />)

      const statLabels = screen.getAllByTestId('stat-label')
      statLabels.forEach(label => {
        expect(label).toHaveClass('text-blue-100', 'text-sm')
      })
    })
  })

  describe('Content Strategy and Business Value', () => {
    it('should build trust through scale indicators', () => {
      render(<StatsSection />)

      // Numbers should indicate significant scale
      const companiesCount = screen.getByText(/500\+/)
      const incidentsCount = screen.getByText(/10,000\+/)

      expect(companiesCount).toBeInTheDocument()
      expect(incidentsCount).toBeInTheDocument()
    })

    it('should emphasize reliability and performance', () => {
      render(<StatsSection />)

      // Uptime and performance metrics
      expect(screen.getByText(/99\.9%/)).toBeInTheDocument()
      expect(screen.getByText(/uptime/i)).toBeInTheDocument()
    })

    it('should highlight productivity benefits', () => {
      render(<StatsSection />)

      // Document generation shows automation value
      expect(screen.getByText(/50,000\+/)).toBeInTheDocument()
      expect(screen.getByText(/documents generated/i)).toBeInTheDocument()
    })

    it('should communicate industry focus', () => {
      render(<StatsSection />)

      const section = screen.getByRole('region')

      // Should emphasize safety and compliance focus
      expect(section).toHaveTextContent(/safety/i)
      expect(section).toHaveTextContent(/compliance/i)
      expect(section).toHaveTextContent(/incidents/i)
    })
  })

  describe('Layout and Responsive Design', () => {
    it('should adapt to different screen sizes', () => {
      render(<StatsSection />)

      const grid = screen.getByRole('region').querySelector('.grid')

      // Mobile: 2x2 grid, Desktop: 1x4 grid
      expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-4')
    })

    it('should have proper spacing and padding', () => {
      render(<StatsSection />)

      const section = screen.getByRole('region')
      const container = section.querySelector('.container')

      expect(section).toHaveClass('py-16') // Vertical spacing
      expect(container).toHaveClass('mx-auto', 'px-4') // Horizontal spacing
    })

    it('should center align content for visual balance', () => {
      render(<StatsSection />)

      const statItems = screen.getAllByTestId('stat-item')
      statItems.forEach(item => {
        expect(item).toHaveClass('text-center')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have semantic landmark', () => {
      render(<StatsSection />)

      const section = screen.getByRole('region')
      expect(section).toHaveAttribute('aria-label', 'Statistics section')
    })

    it('should provide context for screen readers', () => {
      render(<StatsSection />)

      const statNumbers = screen.getAllByTestId('stat-number')
      statNumbers.forEach(number => {
        // Numbers should have associated labels
        expect(number).toHaveAttribute('aria-describedby')
      })
    })

    it('should have sufficient color contrast', () => {
      render(<StatsSection />)

      const section = screen.getByRole('region')

      // White text on blue background = good contrast
      expect(section).toHaveClass('bg-blue-600', 'text-white')

      // Lighter labels should still be readable
      const labels = screen.getAllByTestId('stat-label')
      labels.forEach(label => {
        expect(label).toHaveClass('text-blue-100')
      })
    })

    it('should support keyboard navigation', () => {
      render(<StatsSection />)

      // Section should be navigable but not focusable (no interactive elements)
      const section = screen.getByRole('region')
      expect(section).not.toHaveAttribute('tabindex')
    })
  })

  describe('Animation and Engagement', () => {
    it('should prepare for count-up animation structure', () => {
      render(<StatsSection />)

      const statNumbers = screen.getAllByTestId('stat-number')
      statNumbers.forEach(number => {
        // Should have data attributes for animation targeting
        expect(number).toHaveAttribute('data-count-target')
      })
    })

    it('should have smooth animation trigger points', () => {
      render(<StatsSection />)

      const section = screen.getByRole('region')
      // Should have intersection observer target class
      expect(section).toHaveClass('animate-on-scroll')
    })

    it('should not depend on animation for core functionality', () => {
      render(<StatsSection />)

      // All content should be visible immediately without animation
      expect(screen.getByText(/500\+/)).toBeVisible()
      expect(screen.getByText(/10,000\+/)).toBeVisible()
      expect(screen.getByText(/50,000\+/)).toBeVisible()
      expect(screen.getByText(/99\.9%/)).toBeVisible()
    })
  })

  describe('Performance Considerations', () => {
    it('should render static content efficiently', () => {
      render(<StatsSection />)

      // All stats should render in single pass
      const statItems = screen.getAllByTestId('stat-item')
      expect(statItems).toHaveLength(4)
    })

    it('should avoid layout shift with fixed content', () => {
      render(<StatsSection />)

      const statNumbers = screen.getAllByTestId('stat-number')
      statNumbers.forEach(number => {
        // Numbers should have consistent sizing
        expect(number).toHaveClass('text-4xl')
      })
    })
  })

  describe('Business Metrics Accuracy', () => {
    it('should display realistic and achievable numbers', () => {
      render(<StatsSection />)

      // Numbers should be believable for a growing SaaS platform
      const companyCount = screen.getByText(/500\+/)
      const incidentCount = screen.getByText(/10,000\+/)
      const documentCount = screen.getByText(/50,000\+/)
      const uptime = screen.getByText(/99\.9%/)

      expect(companyCount).toBeInTheDocument()
      expect(incidentCount).toBeInTheDocument()
      expect(documentCount).toBeInTheDocument()
      expect(uptime).toBeInTheDocument()
    })

    it('should maintain mathematical consistency', () => {
      render(<StatsSection />)

      // Ratios should make sense:
      // 500+ companies generating 50,000+ documents = ~100 docs per company
      // 10,000+ incidents monthly = ~20 incidents per company per month
      // These are reasonable ratios for safety management

      expect(screen.getByText(/monthly/i)).toBeInTheDocument() // Clarifies incident frequency
    })
  })
})