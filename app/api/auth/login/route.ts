import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Just accept the email and return success
  // Authentication is email-only
  return NextResponse.json({
    success: true,
    email,
    redirectTo: '/log',
  })
}
