import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function generateTempPassword() {
  return Math.random().toString(36).slice(-12).toUpperCase()
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = adminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'coach') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { athlete_id } = await request.json()
  if (!athlete_id) {
    return NextResponse.json({ error: 'Missing athlete_id' }, { status: 400 })
  }

  // Generate new temp password
  const tempPassword = generateTempPassword()

  // Update user password in Supabase
  const { error: updateError } = await admin.auth.admin.updateUserById(athlete_id, {
    password: tempPassword,
  })

  if (updateError) {
    console.error('Password update error:', updateError)
    return NextResponse.json({ error: 'Failed to generate password' }, { status: 400 })
  }

  // Get athlete email
  const { data: athleteData } = await admin.auth.admin.getUserById(athlete_id)
  const email = athleteData?.user?.email

  return NextResponse.json({
    success: true,
    tempPassword,
    email,
    message: `Share this password with the athlete: ${tempPassword}`,
  })
}
