import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AthleteHistoryClient from './AthleteHistoryClient'

export const dynamic = 'force-dynamic'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function AthleteHistoryPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = adminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'coach') redirect('/log')

  // Get athlete info
  const { data: athlete } = await admin.from('profiles').select('id, full_name').eq('id', params.id).single()

  if (!athlete) redirect('/dashboard')

  // Get all logs for this athlete
  const { data: logs } = await admin.from('nutrition_logs').select('*').eq('user_id', params.id).order('log_date', { ascending: false })

  // Get targets
  const { data: targets } = await admin.from('macro_targets').select('*').eq('user_id', params.id).single()

  return (
    <AthleteHistoryClient
      athlete={athlete}
      logs={logs || []}
      targets={targets}
      coachId={user.id}
    />
  )
}
