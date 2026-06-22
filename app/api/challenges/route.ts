import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const today = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' }).split('/').reverse().join('-').replace(/(\d+)-(\d+)-(\d+)/, '$1-$3-$2')

  // Get profile for position group filtering
  const { data: profile } = await admin.from('profiles').select('position').eq('id', user.id).single()

  // Active challenges — team-wide or matching athlete's position group
  const { data: challenges } = await admin
    .from('challenges')
    .select('*')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('end_date', { ascending: true })

  if (!challenges) return NextResponse.json({ challenges: [] })

  // Filter to relevant challenges for this athlete
  const relevant = challenges.filter(c =>
    c.scope === 'team' || c.position_group === profile?.position
  )

  // For each challenge, get approved totals and this user's submissions
  const enriched = await Promise.all(relevant.map(async (c) => {
    const { data: allSubs } = await admin
      .from('challenge_submissions')
      .select('user_id, value, status')
      .eq('challenge_id', c.id)
      .eq('status', 'approved')

    const { data: mySubs } = await admin
      .from('challenge_submissions')
      .select('id, value, video_url, note, status, created_at')
      .eq('challenge_id', c.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const approvedTotal = (allSubs ?? []).reduce((sum, s) => sum + Number(s.value), 0)
    const myApproved = (mySubs ?? []).filter(s => s.status === 'approved').reduce((sum, s) => sum + Number(s.value), 0)
    const pendingCount = (mySubs ?? []).filter(s => s.status === 'pending').length

    return { ...c, approvedTotal, myApproved, pendingCount, mySubmissions: mySubs ?? [] }
  }))

  return NextResponse.json({ challenges: enriched })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challenge_id, value, video_url, note } = await request.json()
  if (!challenge_id || !value) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('challenge_submissions')
    .insert({ challenge_id, user_id: user.id, value, video_url: video_url || null, note: note || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
