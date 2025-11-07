import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { slugify, validateSubdomain } from '@/lib/utils'

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  subdomain: z.string().min(1).max(63).optional(),
  description: z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await db.project.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        deployments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            deployments: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, subdomain: customSubdomain, description } = createProjectSchema.parse(body)

    // Generate subdomain from name if not provided
    let subdomain = customSubdomain || slugify(name)

    // Validate subdomain
    if (!validateSubdomain(subdomain)) {
      return NextResponse.json(
        { error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      )
    }

    // Check if subdomain is already taken
    const existingProject = await db.project.findUnique({
      where: { subdomain },
    })

    if (existingProject) {
      // Generate unique subdomain by appending random string
      subdomain = `${subdomain}-${Math.random().toString(36).substring(2, 8)}`
    }

    // Create project
    const project = await db.project.create({
      data: {
        name,
        subdomain,
        description,
        userId: session.user.id,
      },
    })

    // Log audit
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'project.created',
        resource: `project:${project.id}`,
        metadata: { name, subdomain },
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
