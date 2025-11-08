'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, RotateCw, ExternalLink, Filter } from 'lucide-react'
import { formatBytes } from '@/lib/utils'
import { format } from 'date-fns'

interface Deployment {
  id: string
  projectId: string
  project: {
    name: string
    subdomain: string
  }
  user: {
    email: string
  }
  status: string
  url: string
  fileCount: number
  totalSize: number
  createdAt: string
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchDeployments()
  }, [])

  const fetchDeployments = async () => {
    try {
      const res = await fetch('/api/admin/deployments')
      const data = await res.json()
      setDeployments(data.deployments)
    } catch (error) {
      console.error('Failed to fetch deployments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deployment?')) return

    try {
      const res = await fetch(`/api/admin/deployments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDeployments(deployments.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete deployment:', error)
    }
  }

  const handleRebuild = async (id: string) => {
    try {
      await fetch(`/api/admin/deployments/${id}/rebuild`, { method: 'POST' })
      fetchDeployments()
    } catch (error) {
      console.error('Failed to rebuild deployment:', error)
    }
  }

  const filteredDeployments = deployments.filter(d => {
    const matchesSearch = d.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deployments</h1>
          <p className="mt-2 text-gray-600">Manage all platform deployments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deployments..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="READY">Ready</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={fetchDeployments}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDeployments.map(deployment => (
              <tr key={deployment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{deployment.project.name}</div>
                    <div className="text-sm text-gray-500">{deployment.project.subdomain}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {deployment.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={deployment.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatBytes(deployment.totalSize)}
                  <div className="text-xs text-gray-400">{deployment.fileCount} files</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(deployment.createdAt), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <a
                    href={deployment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleRebuild(deployment.id)}
                    className="text-warning-600 hover:text-warning-900"
                    title="Rebuild"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(deployment.id)}
                    className="text-danger-600 hover:text-danger-900"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDeployments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No deployments found</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading deployments...</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    READY: 'bg-success-100 text-success-800',
    PENDING: 'bg-warning-100 text-warning-800',
    FAILED: 'bg-danger-100 text-danger-800',
    UPLOADING: 'bg-primary-100 text-primary-800',
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}
