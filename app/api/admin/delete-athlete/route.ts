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
  // Verify the caller is a coach
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

  // Delete from profiles table first
  const { error: profileDeleteError } = await admin.from('profiles').delete().eq('id', athlete_id)
  if (profileDeleteError) {
    return NextResponse.json({ error: `Failed to delete profile: ${profileDeleteError.message}` }, { status: 400 })
  }

  // Delete the auth user
  const { error: deleteError } = await admin.auth.admin.deleteUser(athlete_id)
  if (deleteError) {
    console.error('Auth delete error:', deleteError)
    // Don't fail if auth user deletion fails - profile is already deleted
  }

  return NextResponse.json({ success: true })
}
