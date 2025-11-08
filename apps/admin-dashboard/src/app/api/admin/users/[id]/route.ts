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
    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        projects: {
          include: {
            deployments: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete all S3 files for user's deployments
    const bucketName = process.env.AWS_S3_BUCKET
    if (bucketName) {
      for (const project of user.projects) {
        for (const deployment of project.deployments) {
          if (deployment.s3Path) {
            try {
              const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: deployment.s3Path,
              })
              const listResponse = await s3Client.send(listCommand)

              if (listResponse.Contents && listResponse.Contents.length > 0) {
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
            }
          }
        }
      }
    }

    // Delete user and all related data (cascade deletes handled by Prisma)
    await db.user.delete({
      where: { id: params.id },
    })

    // Log the action
    await logAdminAction(
      admin.id,
      'DELETE_USER',
      'User',
      user.id,
      {
        email: user.email,
        projectCount: user.projects.length,
        deploymentCount: user.projects.reduce((acc, p) => acc + p.deployments.length, 0),
      },
      req
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
