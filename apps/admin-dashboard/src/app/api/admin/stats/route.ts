import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  try {
    // User stats
    const totalUsers = await db.user.count()
    const activeUsers = await db.user.count({
      where: {
        sessions: {
          some: {
            expires: {
              gt: new Date(),
            },
          },
        },
      },
    })
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newToday = await db.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    })

    // Deployment stats
    const totalDeployments = await db.deployment.count()
    const deploymentsToday = await db.deployment.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    })
    const successfulDeployments = await db.deployment.count({
      where: { status: 'READY' },
    })
    const failedDeployments = await db.deployment.count({
      where: { status: 'FAILED' },
    })

    // Storage stats (placeholder - would need to query AWS S3 for actual values)
    const storage = {
      total: 1024 * 1024 * 1024 * 100, // 100GB placeholder
      used: 1024 * 1024 * 1024 * 25, // 25GB placeholder
    }

    // System stats
    const uptime = process.uptime()
    const health = 'healthy' as const

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday,
      },
      deployments: {
        total: totalDeployments,
        today: deploymentsToday,
        successful: successfulDeployments,
        failed: failedDeployments,
      },
      storage,
      system: {
        uptime,
        health,
      },
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
