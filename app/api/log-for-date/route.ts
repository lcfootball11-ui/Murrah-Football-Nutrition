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

  const date = request.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const admin = adminClient()
  const { data: logs } = await admin
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', date)
    .order('created_at', { ascending: true })

  const { data: suppLogs } = await admin
    .from('supplement_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', date)

  return NextResponse.json({ logs: logs ?? [], suppLogs: suppLogs ?? [] })
}
