import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logAdminAction } from '@/lib/admin-middleware'
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront'

const cloudFrontClient = new CloudFrontClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  try {
    const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID

    if (!distributionId) {
      return NextResponse.json(
        { error: 'CloudFront distribution ID not configured' },
        { status: 400 }
      )
    }

    // Create invalidation for all paths
    const invalidationCommand = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `admin-clear-cache-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ['/*'],
        },
      },
    })

    const invalidationResponse = await cloudFrontClient.send(invalidationCommand)

    // Log the action
    await logAdminAction(
      admin.id,
      'CLEAR_CACHE',
      'System',
      null,
      {
        distributionId,
        invalidationId: invalidationResponse.Invalidation?.Id,
      },
      req
    )

    return NextResponse.json({
      success: true,
      invalidationId: invalidationResponse.Invalidation?.Id,
      message: 'Cache invalidation request sent',
    })
  } catch (error) {
    console.error('Failed to clear cache:', error)
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 })
  }
}
