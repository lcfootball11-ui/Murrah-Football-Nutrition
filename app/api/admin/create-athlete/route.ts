import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { full_name, email, password, coach_secret } = await request.json()

  if (coach_secret !== process.env.COACH_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!full_name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: 'athlete' },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await adminClient.from('profiles').insert({
    id: newUser.user.id,
    full_name,
    role: 'athlete',
  })

  return NextResponse.json({ success: true })
}
