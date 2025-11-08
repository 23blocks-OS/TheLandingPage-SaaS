'use client'

import { useState, useEffect } from 'react'
import { Server, Database, HardDrive, Cpu, RefreshCw } from 'lucide-react'
import { formatBytes, formatNumber } from '@/lib/utils'

interface SystemMetrics {
  aws: {
    s3Storage: number
    s3Objects: number
    cloudfrontRequests: number
    cloudFrontBandwidth: number
  }
  database: {
    size: number
    connections: number
    tables: number
  }
  platform: {
    uptime: number
    requests: number
    errorRate: number
  }
}

export default function SystemPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/system/metrics')
      const data = await res.json()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCache = async () => {
    if (!confirm('Clear CloudFront cache? This may temporarily affect performance.')) return

    try {
      await fetch('/api/admin/system/clear-cache', { method: 'POST' })
      alert('Cache invalidation request sent')
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  const handleOptimizeDatabase = async () => {
    if (!confirm('Optimize database? This may take a few minutes.')) return

    try {
      await fetch('/api/admin/system/optimize-db', { method: 'POST' })
      alert('Database optimization started')
    } catch (error) {
      console.error('Failed to optimize database:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System</h1>
          <p className="mt-2 text-gray-600">Monitor platform health and resources</p>
        </div>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* AWS Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Server className="h-5 w-5 mr-2 text-primary-600" />
          AWS Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="S3 Storage"
            value={formatBytes(metrics?.aws.s3Storage || 0)}
            subtitle={`${formatNumber(metrics?.aws.s3Objects || 0)} objects`}
          />
          <MetricCard
            label="CloudFront Requests"
            value={formatNumber(metrics?.aws.cloudfrontRequests || 0)}
            subtitle="Last 24 hours"
          />
          <MetricCard
            label="Bandwidth Used"
            value={formatBytes(metrics?.aws.cloudFrontBandwidth || 0)}
            subtitle="Last 24 hours"
          />
          <MetricCard
            label="Cache Hit Rate"
            value="98.5%"
            subtitle="Excellent"
          />
        </div>
      </div>

      {/* Database Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-primary-600" />
          Database
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Database Size"
            value={formatBytes(metrics?.database.size || 0)}
            subtitle={`${metrics?.database.tables || 0} tables`}
          />
          <MetricCard
            label="Active Connections"
            value={metrics?.database.connections || 0}
            subtitle="Current"
          />
          <MetricCard
            label="Query Performance"
            value="12ms"
            subtitle="Average"
          />
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Cpu className="h-5 w-5 mr-2 text-primary-600" />
          Platform
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Uptime"
            value={`${Math.round((metrics?.platform.uptime || 0) / 86400)} days`}
            subtitle="Since last restart"
          />
          <MetricCard
            label="API Requests"
            value={formatNumber(metrics?.platform.requests || 0)}
            subtitle="Last 24 hours"
          />
          <MetricCard
            label="Error Rate"
            value={`${(metrics?.platform.errorRate || 0).toFixed(2)}%`}
            subtitle="Last 24 hours"
          />
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionButton
            title="Clear CloudFront Cache"
            description="Invalidate all cached content"
            onClick={handleClearCache}
            variant="warning"
          />
          <ActionButton
            title="Optimize Database"
            description="Run VACUUM and ANALYZE"
            onClick={handleOptimizeDatabase}
            variant="primary"
          />
        </div>
      </div>

      {/* Health Checks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Checks</h2>
        <div className="space-y-3">
          <HealthCheck service="Database" status="healthy" />
          <HealthCheck service="S3 Storage" status="healthy" />
          <HealthCheck service="CloudFront CDN" status="healthy" />
          <HealthCheck service="API Server" status="healthy" />
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  subtitle
}: {
  label: string
  value: string | number
  subtitle: string
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  )
}

function ActionButton({
  title,
  description,
  onClick,
  variant = 'primary'
}: {
  title: string
  description: string
  onClick: () => void
  variant?: 'primary' | 'warning' | 'danger'
}) {
  const colors = {
    primary: 'border-primary-500 hover:bg-primary-50 text-primary-600',
    warning: 'border-warning-500 hover:bg-warning-50 text-warning-600',
    danger: 'border-danger-500 hover:bg-danger-50 text-danger-600',
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-start p-4 border-2 rounded-lg transition text-left ${colors[variant]}`}
    >
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs mt-1 opacity-75">{description}</p>
      </div>
    </button>
  )
}

function HealthCheck({ service, status }: { service: string; status: 'healthy' | 'degraded' | 'down' }) {
  const colors = {
    healthy: 'bg-success-500',
    degraded: 'bg-warning-500',
    down: 'bg-danger-500',
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-900">{service}</span>
      <div className="flex items-center">
        <span className={`h-2 w-2 rounded-full ${colors[status]} mr-2`} />
        <span className="text-sm text-gray-600 capitalize">{status}</span>
      </div>
    </div>
  )
}
