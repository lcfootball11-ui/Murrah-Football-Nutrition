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

  // Delete the athlete
  const { error: deleteError } = await admin.auth.admin.deleteUser(athlete_id)
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
