import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

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
    .select('id, full_name')
    .eq('role', 'athlete')
    .order('full_name')

  const { data: logs } = await admin
    .from('nutrition_logs')
    .select('user_id, calories, protein, carbs, fat')
    .eq('log_date', today)

  const { data: suppLogs } = await admin
    .from('supplement_logs')
    .select('user_id, supplement_name, taken')
    .eq('log_date', today)

  const { data: targets } = await admin.from('macro_targets').select('*')

  return (
    <DashboardClient
      coachName={profile.full_name}
      athletes={athletes ?? []}
      logs={logs ?? []}
      suppLogs={suppLogs ?? []}
      targets={targets ?? []}
      today={today}
    />
  )
}
