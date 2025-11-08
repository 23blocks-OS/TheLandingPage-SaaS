import { NextRequest, NextResponse } from 'next/server'
import { deleteAdminSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (sessionToken) {
      await deleteAdminSession(sessionToken)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete('admin_session')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
