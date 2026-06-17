import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import LogClient from './LogClient'

export const dynamic = 'force-dynamic'

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  if (profile.role === 'coach') redirect('/dashboard')

  const today = new Date().toISOString().split('T')[0]

  const { data: logs } = await admin
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', today)
    .order('created_at', { ascending: true })

  const { data: suppLogs } = await admin
    .from('supplement_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', today)

  const { data: targets } = await admin
    .from('macro_targets')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <LogClient
      profile={profile}
      initialLogs={logs ?? []}
      initialSuppLogs={suppLogs ?? []}
      targets={targets}
      today={today}
    />
  )
}
