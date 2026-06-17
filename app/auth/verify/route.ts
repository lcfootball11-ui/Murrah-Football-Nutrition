import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const type = request.nextUrl.searchParams.get('type')

  if (!token || type !== 'magiclink') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify the token
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'magiclink',
  })

  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  // Get user role to determine redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const redirectTo = profile?.role === 'coach' ? '/dashboard' : '/log'

  return NextResponse.redirect(new URL(redirectTo, request.url))
}
