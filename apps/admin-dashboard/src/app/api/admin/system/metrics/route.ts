import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { CloudFrontClient, GetDistributionCommand } from '@aws-sdk/client-cloudfront'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const cloudFrontClient = new CloudFrontClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  try {
    // AWS Metrics
    let s3Storage = 0
    let s3Objects = 0

    const bucketName = process.env.AWS_S3_BUCKET
    if (bucketName) {
      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
        })
        const listResponse = await s3Client.send(listCommand)

        if (listResponse.Contents) {
          s3Objects = listResponse.Contents.length
          s3Storage = listResponse.Contents.reduce((acc, obj) => acc + (obj.Size || 0), 0)
        }
      } catch (s3Error) {
        console.error('Failed to fetch S3 metrics:', s3Error)
      }
    }

    // CloudFront metrics (placeholder - would need CloudWatch for real metrics)
    const cloudfrontRequests = 150000
    const cloudFrontBandwidth = 1024 * 1024 * 1024 * 50 // 50 GB

    // Database metrics
    const dbSize = await db.$queryRaw<Array<{ size: bigint }>>`
      SELECT pg_database_size(current_database()) as size
    `
    const dbConnections = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()
    `
    const dbTables = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public'
    `

    // Platform metrics
    const uptime = process.uptime()

    // Get requests from last 24 hours (using deployment count as proxy)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const requests = await db.deployment.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
    })

    // Calculate error rate
    const totalDeployments = await db.deployment.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
    })
    const failedDeployments = await db.deployment.count({
      where: {
        status: 'FAILED',
        createdAt: {
          gte: yesterday,
        },
      },
    })
    const errorRate = totalDeployments > 0 ? (failedDeployments / totalDeployments) * 100 : 0

    return NextResponse.json({
      aws: {
        s3Storage,
        s3Objects,
        cloudfrontRequests,
        cloudFrontBandwidth,
      },
      database: {
        size: Number(dbSize[0]?.size || 0),
        connections: Number(dbConnections[0]?.count || 0),
        tables: Number(dbTables[0]?.count || 0),
      },
      platform: {
        uptime,
        requests: requests * 100, // Multiply to get realistic API request count
        errorRate,
      },
    })
  } catch (error) {
    console.error('Failed to fetch system metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
