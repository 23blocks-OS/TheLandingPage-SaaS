import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logAdminAction } from '@/lib/admin-middleware'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  try {
    // Run VACUUM and ANALYZE on all tables
    // Note: This requires appropriate database permissions
    await db.$executeRawUnsafe('VACUUM ANALYZE')

    // Log the action
    await logAdminAction(
      admin.id,
      'OPTIMIZE_DATABASE',
      'System',
      null,
      {},
      req
    )

    return NextResponse.json({
      success: true,
      message: 'Database optimization completed',
    })
  } catch (error) {
    console.error('Failed to optimize database:', error)
    return NextResponse.json(
      { error: 'Failed to optimize database' },
      { status: 500 }
    )
  }
}
