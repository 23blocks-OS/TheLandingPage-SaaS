import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logAdminAction } from '@/lib/admin-middleware'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  try {
    const job = await db.jobQueue.findUnique({
      where: { id: params.id },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Only allow cancelling pending jobs
    if (job.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending jobs' },
        { status: 400 }
      )
    }

    // Update job status to cancelled
    await db.jobQueue.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    })

    // Log the action
    await logAdminAction(
      admin.id,
      'CANCEL_JOB',
      'JobQueue',
      job.id,
      {
        jobType: job.type,
      },
      req
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to cancel job:', error)
    return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 })
  }
}
