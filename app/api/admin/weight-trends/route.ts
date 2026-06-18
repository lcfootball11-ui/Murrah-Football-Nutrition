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

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = adminClient()

  // Verify user is a coach
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'coach') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '90')

  // Get all athletes
  const { data: athletes } = await admin
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'athlete')
    .order('full_name')

  if (!athletes || athletes.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const athleteIds = athletes.map(a => a.id)

  // Get weight logs for all athletes
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { data: weightLogs } = await admin
    .from('weight_logs')
    .select('user_id, log_date, weight_lbs')
    .in('user_id', athleteIds)
    .gte('log_date', startDateStr)
    .order('log_date', { ascending: true })

  // Format data for chart
  const athleteMap = new Map(athletes.map(a => [a.id, a.full_name]))
  const dataByAthlete = new Map<string, Array<{ date: string; weight: number }>>()

  athletes.forEach(a => {
    dataByAthlete.set(a.id, [])
  })

  weightLogs?.forEach(log => {
    const athleteData = dataByAthlete.get(log.user_id)
    if (athleteData) {
      athleteData.push({ date: log.log_date, weight: log.weight_lbs })
    }
  })

  // Convert to array format
  const result = athletes
    .filter(a => dataByAthlete.get(a.id)!.length > 0)
    .map(a => ({
      athlete_id: a.id,
      full_name: a.full_name,
      data: dataByAthlete.get(a.id) || [],
    }))

  return NextResponse.json({ data: result })
}
