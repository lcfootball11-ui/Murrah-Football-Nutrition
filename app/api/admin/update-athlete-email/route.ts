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

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = adminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'coach') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { athlete_id, email } = await request.json()
  if (!athlete_id || !email) {
    return NextResponse.json({ error: 'Missing athlete_id or email' }, { status: 400 })
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(athlete_id, {
    email,
  })

  if (updateError) {
    console.error('Auth email update error:', updateError)
    return NextResponse.json({ error: `Failed to update email: ${updateError.message}` }, { status: 400 })
  }

  const { error: profileError } = await admin.from('profiles').update({ email }).eq('id', athlete_id)
  if (profileError) {
    console.error('Profile email update error:', profileError)
    return NextResponse.json({ error: `Failed to update profile: ${profileError.message}` }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
