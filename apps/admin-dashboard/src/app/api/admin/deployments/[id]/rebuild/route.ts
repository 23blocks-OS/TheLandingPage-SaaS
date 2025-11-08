import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logAdminAction } from '@/lib/admin-middleware'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  try {
    const deployment = await db.deployment.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    }

    // Create a job to rebuild the deployment
    await db.jobQueue.create({
      data: {
        type: 'REBUILD_DEPLOYMENT',
        payload: {
          deploymentId: deployment.id,
          projectId: deployment.projectId,
        },
        status: 'PENDING',
        scheduledAt: new Date(),
      },
    })

    // Log the action
    await logAdminAction(
      admin.id,
      'REBUILD_DEPLOYMENT',
      'Deployment',
      deployment.id,
      {
        projectName: deployment.project.name,
        userEmail: deployment.project.user.email,
        subdomain: deployment.subdomain,
      },
      req
    )

    return NextResponse.json({ success: true, message: 'Rebuild job queued' })
  } catch (error) {
    console.error('Failed to rebuild deployment:', error)
    return NextResponse.json({ error: 'Failed to rebuild deployment' }, { status: 500 })
  }
}
