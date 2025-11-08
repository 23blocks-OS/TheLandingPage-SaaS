import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logAdminAction } from '@/lib/admin-middleware'
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function DELETE(
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

    // Delete files from S3
    const bucketName = process.env.AWS_S3_BUCKET
    if (bucketName && deployment.s3Path) {
      try {
        // List all objects in the deployment path
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: deployment.s3Path,
        })
        const listResponse = await s3Client.send(listCommand)

        if (listResponse.Contents && listResponse.Contents.length > 0) {
          // Delete all objects
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
              Objects: listResponse.Contents.map(obj => ({ Key: obj.Key! })),
            },
          })
          await s3Client.send(deleteCommand)
        }
      } catch (s3Error) {
        console.error('Failed to delete S3 files:', s3Error)
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database
    await db.deployment.delete({
      where: { id: params.id },
    })

    // Log the action
    await logAdminAction(
      admin.id,
      'DELETE_DEPLOYMENT',
      'Deployment',
      deployment.id,
      {
        projectName: deployment.project.name,
        userEmail: deployment.project.user.email,
        subdomain: deployment.subdomain,
      },
      req
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete deployment:', error)
    return NextResponse.json({ error: 'Failed to delete deployment' }, { status: 500 })
  }
}
