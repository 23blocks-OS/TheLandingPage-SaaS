import { NextRequest, NextResponse } from 'next/server'
import { db } from './db'

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
}

export async function getAdminFromRequest(req: NextRequest): Promise<AdminUser | null> {
  const sessionToken = req.cookies.get('admin_session')?.value

  if (!sessionToken) {
    return null
  }

  const session = await db.adminSession.findUnique({
    where: { sessionToken },
    include: { admin: true },
  })

  if (!session || session.expiresAt < new Date() || !session.admin.isActive) {
    return null
  }

  return {
    id: session.admin.id,
    email: session.admin.email,
    name: session.admin.name,
    role: session.admin.role,
  }
}

export async function requireAdmin(req: NextRequest): Promise<AdminUser | NextResponse> {
  const admin = await getAdminFromRequest(req)

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return admin
}

export async function logAdminAction(
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  metadata?: Record<string, any>,
  req?: NextRequest
) {
  const ipAddress = req?.headers.get('x-forwarded-for') || req?.headers.get('x-real-ip') || null
  const userAgent = req?.headers.get('user-agent') || null

  await db.adminAuditLog.create({
    data: {
      adminId,
      action,
      resource: resourceId ? `${resourceType}:${resourceId}` : resourceType,
      details: metadata || {},
      ipAddress,
      userAgent,
    },
  })
}
