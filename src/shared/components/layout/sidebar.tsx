'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Logo } from '@/shared/components/ui/logo'
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  FileText,
  GitBranch,
  ListTodo,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ClipboardList,
  ShieldAlert,
  Target,
  Search,
  FileCheck,
} from 'lucide-react'

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'Panel de Control',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Incidentes',
    icon: AlertTriangle,
    children: [
      { title: 'Todos los Incidentes', href: '/incidents', icon: AlertTriangle },
      { title: 'Crear Incidente', href: '/incidents/create', icon: AlertTriangle },
    ],
  },
  {
    title: 'Reportes',
    icon: ClipboardList,
    children: [
      { title: 'Todos los Reportes', href: '/reports', icon: ClipboardList },
      { title: 'Flash Report', href: '/reports/flash', icon: FileText },
      { title: 'Acciones Inmediatas', href: '/reports/immediate-actions', icon: ListTodo },
      { title: 'Análisis Causa Raíz', href: '/reports/root-cause', icon: Search },
      { title: 'Plan de Acción', href: '/reports/action-plan', icon: Target },
      { title: 'Tolerancia Cero', href: '/reports/zero-tolerance', icon: ShieldAlert },
      { title: 'Reporte Final', href: '/reports/final', icon: FileCheck },
    ],
  },
  {
    title: 'Análisis',
    icon: BarChart3,
    children: [
      { title: 'Árbol Causal', href: '/causal-tree', icon: BarChart3 },
      { title: 'Crear Árbol Causal', href: '/causal-tree/create', icon: BarChart3 },
      { title: 'Diagrama de Pescado', href: '/analysis/fishbone', icon: BarChart3 },
      { title: 'Crear Diagrama de Pescado', href: '/analysis/fishbone/create', icon: BarChart3 },
    ],
  },
  // TODO: Habilitar cuando estén listos
  // {
  //   title: 'Documentos',
  //   icon: FileText,
  //   children: [
  //     { title: 'Todos los Documentos', href: '/documents', icon: FileText },
  //     { title: 'Generar Documento', href: '/documents/generate', icon: FileText },
  //   ],
  // },
  // {
  //   title: 'Flujos de Trabajo',
  //   icon: GitBranch,
  //   children: [
  //     { title: 'Todos los Flujos', href: '/workflows', icon: GitBranch },
  //     { title: 'Crear Flujo', href: '/workflows/create', icon: GitBranch },
  //     { title: 'Mis Tareas', href: '/workflows/tasks', icon: ListTodo },
  //   ],
  // },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Incidentes', 'Reportes', 'Análisis'])
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    )
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href
  }

  const isParentActive = (item: NavItem) => {
    if (item.href) return isActive(item.href)
    return item.children?.some((child) => isActive(child.href)) || false
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const active = isActive(item.href)
    const parentActive = isParentActive(item)

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              parentActive
                ? 'bg-stegmaier-blue/10 text-stegmaier-blue'
                : 'text-gray-700 hover:bg-gray-100',
              depth > 0 && 'ml-4'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href || '#'}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          active
            ? 'bg-stegmaier-blue text-white'
            : 'text-gray-700 hover:bg-gray-100',
          depth > 0 && 'ml-4'
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{item.title}</span>
      </Link>
    )
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Logo size="sm" />
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => renderNavItem(item))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Stegmaier Safety Management
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-gray-200">
        {sidebarContent}
      </aside>
    </>
  )
}