import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

function calcStreak(dates: string[], today: string): number {
  const dateSet = new Set(dates)
  let streak = 0
  const cursor = new Date(today + 'T12:00:00')
  if (!dateSet.has(today)) cursor.setDate(cursor.getDate() - 1)
  while (true) {
    const d = cursor.toISOString().split('T')[0]
    if (!dateSet.has(d)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function getCentralTime() {
  const now = new Date()
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  return utcDate.toISOString().split('T')[0]
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'coach') redirect('/log')

  const today = getCentralTime()
  console.log('Dashboard querying for date:', today)

  const { data: athletes } = await admin
    .from('profiles')
    .select('id, full_name, email, phone_number, reminder_enabled')
    .eq('role', 'athlete')
    .order('full_name')

  const athleteIds = (athletes ?? []).map(a => a.id)

  // Calculate date range for last 7 days
  const sevenDaysAgo = new Date(today + 'T12:00:00')
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const weekStartDate = sevenDaysAgo.toISOString().split('T')[0]

  const [logsRes, suppLogsRes, targetsRes, allLogsRes, weeklyLogsRes] = await Promise.all([
    admin.from('nutrition_logs').select('user_id, calories, protein, carbs, fat').eq('log_date', today),
    admin.from('supplement_logs').select('user_id, supplement_name, taken').eq('log_date', today),
    admin.from('macro_targets').select('*'),
    athleteIds.length > 0
      ? admin.from('nutrition_logs').select('user_id, log_date').in('user_id', athleteIds)
      : Promise.resolve({ data: [] }),
    athleteIds.length > 0
      ? admin.from('nutrition_logs').select('user_id, log_date, calories').gte('log_date', weekStartDate).lte('log_date', today).in('user_id', athleteIds)
      : Promise.resolve({ data: [] }),
  ])

  console.log('Logs found for today:', logsRes.data?.length || 0)
  console.log('Athletes count:', athletes?.length || 0)
  console.log('Targets count:', targetsRes.data?.length || 0)

  // Calculate streaks for all athletes
  const byAthlete: Record<string, string[]> = {}
  for (const row of (allLogsRes.data ?? [])) {
    if (!byAthlete[row.user_id]) byAthlete[row.user_id] = []
    byAthlete[row.user_id].push(row.log_date)
  }
  const streaks: Record<string, number> = {}
  for (const id of athleteIds) {
    const dates = [...new Set(byAthlete[id] ?? [])]
    streaks[id] = calcStreak(dates, today)
  }

  return (
    <DashboardClient
      coachName={profile.full_name}
      athletes={athletes ?? []}
      logs={logsRes.data ?? []}
      suppLogs={suppLogsRes.data ?? []}
      targets={targetsRes.data ?? []}
      streaks={streaks}
      today={today}
      weeklyLogs={weeklyLogsRes.data ?? []}
    />
  )
}
