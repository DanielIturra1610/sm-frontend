/**
 * FeaturesSection Component - Landing Page
 * TDD: GREEN phase - Minimal implementation to pass tests
 * Scope: LOCAL to landing page only (1 feature usage)
 */

import { Shield, FileText, BarChart3, Workflow } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Incident Management',
    description: 'Complete incident reporting and tracking system',
    testId: 'incident-management-icon'
  },
  {
    icon: BarChart3,
    title: 'Root Cause Analysis',
    description: 'Five Whys and Fishbone analysis tools',
    testId: 'root-cause-analysis-icon'
  },
  {
    icon: FileText,
    title: 'Document Generation',
    description: 'Automated safety document creation',
    testId: 'document-generation-icon'
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description: 'Streamlined approval and notification processes',
    testId: 'workflow-automation-icon'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-50" role="region" aria-label="Features section">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need for Safety Management
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center" data-testid="feature-item">
              <feature.icon
                className="h-12 w-12 mx-auto mb-4 text-blue-600"
                aria-hidden="true"
                data-testid={feature.testId}
              />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}