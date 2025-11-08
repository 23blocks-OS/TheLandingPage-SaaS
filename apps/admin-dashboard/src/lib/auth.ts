import { compare } from 'bcryptjs'
import { db } from './db'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
}

export async function verifyAdmin(email: string, password: string): Promise<AdminUser | null> {
  const admin = await db.admin.findUnique({
    where: { email },
  })

  if (!admin || !admin.isActive) {
    return null
  }

  const isValid = await compare(password, admin.password)
  if (!isValid) {
    return null
  }

  // Update last login
  await db.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  })

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  }
}

export async function createAdminSession(adminId: string, req?: Request): Promise<string> {
  const sessionToken = nanoid(32)

  // Get IP and user agent from request if available
  const ipAddress = req?.headers.get('x-forwarded-for') || req?.headers.get('x-real-ip') || undefined
  const userAgent = req?.headers.get('user-agent') || undefined

  await db.adminSession.create({
    data: {
      adminId,
      sessionToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })

  return sessionToken
}

export async function getAdminFromSession(): Promise<AdminUser | null> {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('admin_session')?.value

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

export async function deleteAdminSession(sessionToken: string): Promise<void> {
  await db.adminSession.delete({
    where: { sessionToken },
  })
}

export async function logAdminAction(
  adminId: string,
  action: string,
  resource?: string,
  details?: any,
  ipAddress?: string
): Promise<void> {
  await db.adminAuditLog.create({
    data: {
      adminId,
      action,
      resource,
      details,
      ipAddress,
    },
  })
}
