'use client'

import { useState, useEffect } from 'react'
import { Play, Trash2, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'
import { format } from 'date-fns'

interface Job {
  id: string
  type: string
  status: string
  attempts: number
  maxAttempts: number
  error: string | null
  scheduledAt: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/admin/jobs')
      const data = await res.json()
      setJobs(data.jobs)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTriggerJob = async (type: string) => {
    try {
      await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      fetchJobs()
    } catch (error) {
      console.error('Failed to trigger job:', error)
    }
  }

  const handleCancelJob = async (id: string) => {
    try {
      await fetch(`/api/admin/jobs/${id}`, {
        method: 'DELETE',
      })
      fetchJobs()
    } catch (error) {
      console.error('Failed to cancel job:', error)
    }
  }

  const filteredJobs = jobs.filter(j =>
    statusFilter === 'all' || j.status === statusFilter
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-2 text-gray-600">Manage background jobs and tasks</p>
        </div>
      </div>

      {/* Job Triggers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trigger Jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TriggerButton
            title="Cleanup Old Deployments"
            description="Delete deployments older than 90 days"
            onClick={() => handleTriggerJob('CLEANUP_OLD_DEPLOYMENTS')}
          />
          <TriggerButton
            title="Invalidate Cache"
            description="Clear CloudFront cache"
            onClick={() => handleTriggerJob('INVALIDATE_CACHE')}
          />
          <TriggerButton
            title="Generate Reports"
            description="Create usage and analytics reports"
            onClick={() => handleTriggerJob('GENERATE_REPORTS')}
          />
          <TriggerButton
            title="Sync Metrics"
            description="Update system metrics"
            onClick={() => handleTriggerJob('SYNC_METRICS')}
          />
          <TriggerButton
            title="Backup Database"
            description="Create database backup"
            onClick={() => handleTriggerJob('BACKUP_DATABASE')}
          />
          <TriggerButton
            title="Send Notifications"
            description="Process pending notifications"
            onClick={() => handleTriggerJob('SEND_NOTIFICATIONS')}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="RUNNING">Running</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Job Queue */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{job.type.replace(/_/g, ' ')}</div>
                  {job.error && (
                    <div className="text-xs text-danger-600 mt-1 truncate max-w-xs">{job.error}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <JobStatusBadge status={job.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.attempts} / {job.maxAttempts}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(job.scheduledAt), 'MMM d, HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.completedAt && job.startedAt
                    ? `${Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)}s`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {job.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelJob(job.id)}
                      className="text-danger-600 hover:text-danger-900"
                      title="Cancel"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredJobs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No jobs found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TriggerButton({
  title,
  description,
  onClick
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left"
    >
      <Play className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </button>
  )
}

function JobStatusBadge({ status }: { status: string }) {
  const configs = {
    PENDING: { color: 'bg-warning-100 text-warning-800', icon: Clock },
    RUNNING: { color: 'bg-primary-100 text-primary-800', icon: Loader },
    COMPLETED: { color: 'bg-success-100 text-success-800', icon: CheckCircle },
    FAILED: { color: 'bg-danger-100 text-danger-800', icon: XCircle },
    CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
  }

  const config = configs[status as keyof typeof configs] || configs.PENDING
  const Icon = config.icon

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {status}
    </span>
  )
}
