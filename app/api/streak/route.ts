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

function calcStreak(dates: string[], today: string): number {
  const dateSet = new Set(dates)
  let streak = 0
  const cursor = new Date(today + 'T12:00:00')

  // If today has no log yet, start checking from yesterday so streak isn't broken mid-day
  if (!dateSet.has(today)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (true) {
    const dateStr = cursor.toISOString().split('T')[0]
    if (!dateSet.has(dateStr)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

// GET /api/streak — current user's streak
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ streak: 0 })

  const today = new Date().toISOString().split('T')[0]
  const admin = adminClient()

  const { data } = await admin
    .from('nutrition_logs')
    .select('log_date')
    .eq('user_id', user.id)
    .order('log_date', { ascending: false })
    .limit(120)

  const dates = [...new Set((data ?? []).map(r => r.log_date as string))]
  return NextResponse.json({ streak: calcStreak(dates, today) })
}

// POST /api/streak — coach fetching streaks for all athletes
export async function POST(request: NextRequest) {
  const { coach_secret, athlete_ids } = await request.json()
  if (coach_secret !== process.env.COACH_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const today = new Date().toISOString().split('T')[0]
  const admin = adminClient()

  const { data } = await admin
    .from('nutrition_logs')
    .select('user_id, log_date')
    .in('user_id', athlete_ids)
    .order('log_date', { ascending: false })

  // Group dates by athlete
  const byAthlete: Record<string, string[]> = {}
  for (const row of data ?? []) {
    if (!byAthlete[row.user_id]) byAthlete[row.user_id] = []
    byAthlete[row.user_id].push(row.log_date)
  }

  const streaks: Record<string, number> = {}
  for (const id of athlete_ids) {
    const dates = [...new Set(byAthlete[id] ?? [])]
    streaks[id] = calcStreak(dates, today)
  }

  return NextResponse.json({ streaks })
}
