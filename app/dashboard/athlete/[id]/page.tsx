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

export default async function AthleteHistoryPage({ params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    const admin = adminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

    if (!profile || profile.role !== 'coach') {
      redirect('/log')
    }

    const { data: athlete, error: athleteError } = await admin.from('profiles').select('id, full_name').eq('id', params.id).single()

    if (athleteError || !athlete) {
      redirect('/dashboard')
    }

    const { data: logs } = await admin.from('nutrition_logs').select('*').eq('user_id', params.id).order('log_date', { ascending: false })
    const { data: targets } = await admin.from('macro_targets').select('*').eq('user_id', params.id).single()

    return (
      <HistoryView
        athlete={athlete}
        logs={logs || []}
        targets={targets}
      />
    )
  } catch (error) {
    console.error('Error in athlete history page:', error)
    redirect('/dashboard')
  }
}
