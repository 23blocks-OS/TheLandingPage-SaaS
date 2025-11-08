import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logAdminAction } from '@/lib/admin-middleware'
import { z } from 'zod'

const createJobSchema = z.object({
  type: z.enum([
    'CLEANUP_OLD_DEPLOYMENTS',
    'INVALIDATE_CACHE',
    'SEND_NOTIFICATIONS',
    'GENERATE_REPORTS',
    'SYNC_METRICS',
    'BACKUP_DATABASE',
  ]),
  payload: z.record(z.any()).optional(),
})

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}

    if (status !== 'all') {
      where.status = status
    }

    const jobs = await db.jobQueue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  try {
    const body = await req.json()
    const { type, payload } = createJobSchema.parse(body)

    const job = await db.jobQueue.create({
      data: {
        type,
        payload: payload || {},
        status: 'PENDING',
        scheduledAt: new Date(),
      },
    })

    // Log the action
    await logAdminAction(
      admin.id,
      'CREATE_JOB',
      'JobQueue',
      job.id,
      {
        jobType: type,
      },
      req
    )

    return NextResponse.json({ success: true, job })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid job data', details: error.errors }, { status: 400 })
    }
    console.error('Failed to create job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
