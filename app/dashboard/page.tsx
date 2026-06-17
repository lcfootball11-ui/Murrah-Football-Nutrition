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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'coach') redirect('/log')

  const today = new Date().toISOString().split('T')[0]

  const { data: athletes } = await admin
    .from('profiles')
    .select('id, full_name, email, phone_number, reminder_enabled')
    .eq('role', 'athlete')
    .order('full_name')

  const athleteIds = (athletes ?? []).map(a => a.id)

  const [logsRes, suppLogsRes, targetsRes, allLogsRes] = await Promise.all([
    admin.from('nutrition_logs').select('user_id, calories, protein, carbs, fat').eq('log_date', today),
    admin.from('supplement_logs').select('user_id, supplement_name, taken').eq('log_date', today),
    admin.from('macro_targets').select('*'),
    athleteIds.length > 0
      ? admin.from('nutrition_logs').select('user_id, log_date').in('user_id', athleteIds)
      : Promise.resolve({ data: [] }),
  ])

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
    />
  )
}
