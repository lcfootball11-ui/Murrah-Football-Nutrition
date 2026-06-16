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

  const range = request.nextUrl.searchParams.get('range') ?? 'week'
  const today = new Date()
  const start = new Date(today)

  if (range === 'week') {
    start.setDate(today.getDate() - 6)
  } else {
    start.setDate(today.getDate() - 29)
  }

  const startStr = start.toISOString().split('T')[0]
  const endStr = today.toISOString().split('T')[0]

  const admin = adminClient()
  const { data: logs } = await admin
    .from('nutrition_logs')
    .select('log_date, calories, protein, carbs, fat')
    .eq('user_id', user.id)
    .gte('log_date', startStr)
    .lte('log_date', endStr)
    .order('log_date', { ascending: true })

  return NextResponse.json({ logs: logs ?? [], startStr, endStr })
}
