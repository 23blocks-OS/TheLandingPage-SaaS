import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { uploadFileToS3, getDeploymentUrl, invalidateCloudFrontCache } from '@/lib/s3'
import { nanoid } from 'nanoid'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  const form = formidable({
    maxFileSize: parseInt(process.env.MAX_UPLOAD_SIZE || '104857600'), // 100MB
    maxFiles: 1000,
    multiples: true,
  })

  return new Promise((resolve, reject) => {
    // Convert NextRequest to Node.js IncomingMessage
    const nodeReq = req as any

    form.parse(nodeReq, (err, fields, files) => {
      if (err) reject(err)
      resolve({ fields, files })
    })
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For this implementation, we'll use a simpler approach with FormData
    const formData = await req.formData()
    const projectId = formData.get('projectId') as string
    const files = formData.getAll('files') as File[]

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // Verify project ownership
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create deployment record
    const deploymentId = nanoid()
    const s3Path = `${project.subdomain}/${deploymentId}`

    const deployment = await db.deployment.create({
      data: {
        id: deploymentId,
        projectId: project.id,
        userId: session.user.id,
        status: 'UPLOADING',
        url: getDeploymentUrl(project.subdomain),
        s3Path,
      },
    })

    try {
      // Upload files to S3
      let totalSize = 0
      const uploadPromises = files.map(async file => {
        const buffer = Buffer.from(await file.arrayBuffer())
        const contentType = file.type || mime.lookup(file.name) || 'application/octet-stream'

        totalSize += buffer.length

        const s3Key = `${s3Path}/${file.name}`
        await uploadFileToS3(
          process.env.S3_DEPLOYMENTS_BUCKET!,
          s3Key,
          buffer,
          contentType
        )
      })

      await Promise.all(uploadPromises)

      // Update deployment status
      await db.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'READY',
          fileCount: files.length,
          totalSize,
          publishedAt: new Date(),
        },
      })

      // Invalidate CloudFront cache
      try {
        await invalidateCloudFrontCache([`/${s3Path}/*`])
      } catch (error) {
        console.error('CloudFront invalidation error:', error)
      }

      // Log audit
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'deployment.created',
          resource: `deployment:${deploymentId}`,
          metadata: {
            projectId,
            fileCount: files.length,
            totalSize,
          },
        },
      })

      return NextResponse.json({
        deployment: {
          id: deploymentId,
          url: getDeploymentUrl(project.subdomain),
          status: 'READY',
        },
      })
    } catch (error) {
      console.error('Upload error:', error)

      // Update deployment status to failed
      await db.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Upload failed',
        },
      })

      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
  } catch (error) {
    console.error('Deploy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
