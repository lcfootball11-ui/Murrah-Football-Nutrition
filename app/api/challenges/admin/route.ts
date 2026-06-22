import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function requireCoach() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'coach') return null
  return { user, admin }
}

// GET: all challenges + pending submissions
export async function GET() {
  const ctx = await requireCoach()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { admin } = ctx

  const { data: challenges } = await admin
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: submissions } = await admin
    .from('challenge_submissions')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ challenges: challenges ?? [], submissions: submissions ?? [] })
}

// POST: create a challenge
export async function POST(request: NextRequest) {
  const ctx = await requireCoach()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { user, admin } = ctx

  const body = await request.json()
  const { title, description, goal_type, goal_total, unit, reward, scope, position_group, start_date, end_date } = body

  const { data, error } = await admin
    .from('challenges')
    .insert({ title, description, goal_type, goal_total, unit, reward, scope, position_group: position_group || null, start_date, end_date, created_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// DELETE: remove a challenge
export async function DELETE(request: NextRequest) {
  const ctx = await requireCoach()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { admin } = ctx

  const { id } = await request.json()
  const { error } = await admin.from('challenges').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
