/**
 * Advanced Dashboard Page - Stegmaier Safety Management
 * Complete dashboard with KPIs, charts, and filters
 */

'use client'

import { useAuth } from '@/shared/contexts/auth-context'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, InteractiveCard } from '@/shared/components/ui/card'
import { Logo } from '@/shared/components/ui/logo'
import {
  DashboardMetrics,
  IncidentTrendsChart,
  SeverityDistributionChart,
  DashboardFilters,
  type DashboardFiltersType
} from '@/shared/components/dashboard'
import {
  Shield,
  FileText,
  BarChart3,
  Users,
  LogOut,
  Plus,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Bell,
  Settings,
  Calendar,
  Download
} from 'lucide-react'

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stegmaier-blue"></div>
      </div>
    )
  }

  const handleFiltersChange = (filters: DashboardFiltersType) => {
    console.log('Dashboard filters changed:', filters)
  }

  return (
    <div className="min-h-screen bg-stegmaier-gray-light">
      {/* Modern Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div className="hidden lg:block border-l border-border pl-4">
                <h1 className="text-2xl font-bold text-stegmaier-black">Safety Dashboard</h1>
                <p className="text-sm text-stegmaier-gray">
                  Welcome back, {user?.full_name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-error rounded-full text-xs"></span>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Filters */}
        <div className="mb-8">
          <DashboardFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Key Performance Indicators */}
        <div className="mb-8">
          <DashboardMetrics />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <IncidentTrendsChart />
          <SeverityDistributionChart />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Recent Incidents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                    <div className="h-12 w-12 bg-error/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="h-6 w-6 text-error" />
                    </div>
                    <h3 className="font-semibold mb-1">Report Incident</h3>
                    <p className="text-sm text-muted-foreground">Submit new safety incident</p>
                  </InteractiveCard>

                  <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                    <div className="h-12 w-12 bg-stegmaier-blue/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-stegmaier-blue" />
                    </div>
                    <h3 className="font-semibold mb-1">Generate Report</h3>
                    <p className="text-sm text-muted-foreground">Create safety documentation</p>
                  </InteractiveCard>

                  <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                    <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-success" />
                    </div>
                    <h3 className="font-semibold mb-1">Safety Audit</h3>
                    <p className="text-sm text-muted-foreground">Schedule new audit</p>
                  </InteractiveCard>

                  <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                    <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-warning" />
                    </div>
                    <h3 className="font-semibold mb-1">View Analytics</h3>
                    <p className="text-sm text-muted-foreground">Performance insights</p>
                  </InteractiveCard>

                  <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                    <div className="h-12 w-12 bg-info/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-info" />
                    </div>
                    <h3 className="font-semibold mb-1">Team Training</h3>
                    <p className="text-sm text-muted-foreground">Schedule training sessions</p>
                  </InteractiveCard>

                  <InteractiveCard className="p-4 text-center hover:shadow-lg cursor-pointer">
                    <div className="h-12 w-12 bg-stegmaier-gray/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-6 w-6 text-stegmaier-gray" />
                    </div>
                    <h3 className="font-semibold mb-1">More Actions</h3>
                    <p className="text-sm text-muted-foreground">View all available actions</p>
                  </InteractiveCard>
                </div>
              </CardContent>
            </Card>

            {/* Recent Incidents */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Recent Incidents</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/incidents">View All</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-error/5 rounded-lg border border-error/20 hover:bg-error/10 transition-colors">
                    <div className="h-3 w-3 bg-error rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-semibold">Equipment Malfunction - Line 3</p>
                      <p className="text-sm text-muted-foreground">Production halt due to conveyor belt failure</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                        High
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">2h ago</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-warning/5 rounded-lg border border-warning/20 hover:bg-warning/10 transition-colors">
                    <div className="h-3 w-3 bg-warning rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-semibold">Near Miss - Warehouse</p>
                      <p className="text-sm text-muted-foreground">Forklift operator reported near collision</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                        Medium
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">4h ago</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-success/5 rounded-lg border border-success/20 hover:bg-success/10 transition-colors">
                    <div className="h-3 w-3 bg-success rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="font-semibold">Safety Protocol Update</p>
                      <p className="text-sm text-muted-foreground">Emergency evacuation procedures revised</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                        Resolved
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">1d ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Notifications */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-success/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Safety audit completed</p>
                      <p className="text-xs text-muted-foreground">Building A - All checks passed</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-stegmaier-blue/10 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-stegmaier-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Report generated</p>
                      <p className="text-xs text-muted-foreground">Monthly safety summary</p>
                      <p className="text-xs text-muted-foreground mt-1">4 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-warning/10 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Incident reported</p>
                      <p className="text-xs text-muted-foreground">Minor slip in cafeteria</p>
                      <p className="text-xs text-muted-foreground mt-1">6 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 bg-info/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Training session</p>
                      <p className="text-xs text-muted-foreground">Fire safety drill completed</p>
                      <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-stegmaier-blue/5 rounded-lg hover:bg-stegmaier-blue/10 transition-colors cursor-pointer">
                    <Calendar className="h-4 w-4 text-stegmaier-blue mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Equipment inspection</p>
                      <p className="text-xs text-muted-foreground">Due tomorrow</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-warning/5 rounded-lg hover:bg-warning/10 transition-colors cursor-pointer">
                    <Calendar className="h-4 w-4 text-warning mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Safety training renewal</p>
                      <p className="text-xs text-muted-foreground">Due in 3 days</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-success/5 rounded-lg hover:bg-success/10 transition-colors cursor-pointer">
                    <Calendar className="h-4 w-4 text-success mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Monthly safety meeting</p>
                      <p className="text-xs text-muted-foreground">Next Friday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}