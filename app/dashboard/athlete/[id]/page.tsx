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
  try {
    console.log('[AthleteHistory] Loading for athlete:', params.id)

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('[AthleteHistory] No user found, redirecting to login')
      redirect('/login')
    }

    const admin = adminClient()
    const { data: profile, error: profileError } = await admin.from('profiles').select('role').eq('id', user.id).single()

    if (profileError || !profile) {
      console.log('[AthleteHistory] Profile error or not found:', profileError)
      redirect('/login')
    }

    if (profile.role !== 'coach') {
      console.log('[AthleteHistory] User is not a coach, redirecting to /log')
      redirect('/log')
    }

    // Get athlete info
    const { data: athlete, error: athleteError } = await admin.from('profiles').select('id, full_name').eq('id', params.id).single()

    if (athleteError || !athlete) {
      console.log('[AthleteHistory] Athlete not found:', athleteError, 'params.id:', params.id)
      redirect('/dashboard')
    }

    console.log('[AthleteHistory] Found athlete:', athlete.full_name)

    // Get all logs for this athlete
    const { data: logs, error: logsError } = await admin.from('nutrition_logs').select('*').eq('user_id', params.id).order('log_date', { ascending: false })

    if (logsError) {
      console.log('[AthleteHistory] Logs error:', logsError)
    }

    // Get targets
    const { data: targets, error: targetsError } = await admin.from('macro_targets').select('*').eq('user_id', params.id).single()

    if (targetsError && targetsError.code !== 'PGRST116') {
      console.log('[AthleteHistory] Targets error:', targetsError)
    }

    return (
      <AthleteHistoryClient
        athlete={athlete}
        logs={logs || []}
        targets={targets}
        coachId={user.id}
      />
    )
  } catch (error) {
    console.error('[AthleteHistory] Caught error:', error)
    redirect('/dashboard')
  }
}
