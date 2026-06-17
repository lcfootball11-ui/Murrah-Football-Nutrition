import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import HistoryView from './HistoryView'

export const dynamic = 'force-dynamic'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function AthleteHistoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  console.log('[AthleteHistory] Loading for athlete ID:', params.id)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('[AthleteHistory] Current user:', user?.id)

  if (!user) {
    console.log('[AthleteHistory] No user, redirecting to login')
    redirect('/login')
  }

  const admin = adminClient()
  const { data: profile, error: profileError } = await admin.from('profiles').select('role').eq('id', user.id).single()
  console.log('[AthleteHistory] User profile:', profile, 'Error:', profileError)

  if (!profile || profile.role !== 'coach') {
    console.log('[AthleteHistory] Not a coach, redirecting to /log')
    redirect('/log')
  }

  console.log('[AthleteHistory] Looking up athlete with ID:', params.id)
  const { data: athlete, error: athleteError } = await admin.from('profiles').select('id, full_name').eq('id', params.id).single()
  console.log('[AthleteHistory] Athlete found:', athlete, 'Error:', athleteError)

  if (athleteError || !athlete) {
    console.log('[AthleteHistory] Athlete not found, redirecting to dashboard')
    redirect('/dashboard')
  }

  const { data: logs } = await admin.from('nutrition_logs').select('*').eq('user_id', params.id).order('log_date', { ascending: false })
  const { data: targets } = await admin.from('macro_targets').select('*').eq('user_id', params.id).single()

  console.log('[AthleteHistory] Successfully loaded athlete data, returning component')

  return (
    <HistoryView
      athlete={athlete}
      logs={logs || []}
      targets={targets}
    />
  )
}
