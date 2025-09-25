/**
 * StatsSection Component - Landing Page
 * TDD: GREEN phase - Minimal implementation to pass tests
 * Scope: LOCAL to landing page only (1 feature usage)
 */

const stats = [
  {
    number: '500+',
    label: 'Companies trust Stegmaier',
    target: '500'
  },
  {
    number: '10,000+',
    label: 'Safety incidents managed monthly',
    target: '10000'
  },
  {
    number: '50,000+',
    label: 'Compliance documents generated',
    target: '50000'
  },
  {
    number: '99.9%',
    label: 'System uptime guaranteed',
    target: '99.9'
  }
]

export function StatsSection() {
  return (
    <section
      className="py-16 bg-blue-600 text-white animate-on-scroll"
      role="region"
      aria-label="Statistics section"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center" data-testid="stat-item">
              <div
                className="text-4xl font-bold mb-2"
                data-testid="stat-number"
                data-count-target={stat.target}
                aria-describedby={`stat-label-${index}`}
              >
                {stat.number}
              </div>
              <p
                className="text-blue-100 text-sm"
                data-testid="stat-label"
                id={`stat-label-${index}`}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}