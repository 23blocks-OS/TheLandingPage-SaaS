'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Rocket,
  Server,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatNumber, formatBytes } from '@/lib/utils'

interface DashboardStats {
  users: {
    total: number
    active: number
    newToday: number
  }
  deployments: {
    total: number
    today: number
    successful: number
    failed: number
  }
  storage: {
    total: number
    used: number
  }
  system: {
    uptime: number
    health: 'healthy' | 'degraded' | 'down'
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={formatNumber(stats?.users.total || 0)}
          subtitle={`${stats?.users.newToday || 0} new today`}
          icon={<Users className="h-8 w-8 text-primary-600" />}
          trend={+12.5}
        />
        <StatCard
          title="Deployments"
          value={formatNumber(stats?.deployments.total || 0)}
          subtitle={`${stats?.deployments.today || 0} today`}
          icon={<Rocket className="h-8 w-8 text-success-600" />}
          trend={+8.3}
        />
        <StatCard
          title="Storage Used"
          value={formatBytes(stats?.storage.used || 0)}
          subtitle={`of ${formatBytes(stats?.storage.total || 0)}`}
          icon={<Server className="h-8 w-8 text-warning-600" />}
        />
        <StatCard
          title="System Health"
          value={stats?.system.health || 'healthy'}
          subtitle={`${Math.round((stats?.system.uptime || 0) / 86400)} days uptime`}
          icon={<Activity className="h-8 w-8 text-success-600" />}
          badge={stats?.system.health === 'healthy' ? 'success' : 'warning'}
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deployments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Deployments</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <DeploymentRow key={i} />
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <UserRow key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="Clear Cache"
            description="Invalidate CloudFront cache"
            icon={<Server className="h-6 w-6" />}
            onClick={() => console.log('Clear cache')}
          />
          <QuickAction
            title="Run Cleanup"
            description="Delete old deployments"
            icon={<Clock className="h-6 w-6" />}
            onClick={() => console.log('Run cleanup')}
          />
          <QuickAction
            title="Generate Report"
            description="Create usage report"
            icon={<Activity className="h-6 w-6" />}
            onClick={() => console.log('Generate report')}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  trend?: number
  badge?: 'success' | 'warning' | 'danger'
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={badge ? getBadgeColor(badge) : ''}>
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{subtitle}</p>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  )
}

function DeploymentRow() {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3">
        <CheckCircle className="h-5 w-5 text-success-600" />
        <div>
          <p className="text-sm font-medium text-gray-900">my-project-123</p>
          <p className="text-xs text-gray-500">user@example.com</p>
        </div>
      </div>
      <span className="text-xs text-gray-500">2 min ago</span>
    </div>
  )
}

function UserRow() {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Users className="h-4 w-4 text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">user@example.com</p>
          <p className="text-xs text-gray-500">0 deployments</p>
        </div>
      </div>
      <span className="text-xs text-gray-500">5 min ago</span>
    </div>
  )
}

function QuickAction({
  title,
  description,
  icon,
  onClick
}: {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
    >
      <div className="flex-shrink-0 mr-3 text-primary-600">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </button>
  )
}

function getBadgeColor(badge: 'success' | 'warning' | 'danger') {
  const colors = {
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
  }
  return colors[badge]
}
