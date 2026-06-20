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

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { meal_name, calories, protein, carbs, fat, fiber, entry_method, log_date } = body

  if (!meal_name || calories === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const admin = adminClient()

  // Build insert — only include fiber if it's provided (requires DB migration add-fiber-tracking.sql)
  const insertData: Record<string, unknown> = {
    user_id: user.id,
    log_date,
    meal_name,
    calories,
    protein,
    carbs,
    fat,
    entry_method,
  }
  if (fiber !== undefined && fiber !== null) {
    insertData.fiber = fiber
  }

  const { data, error } = await admin.from('nutrition_logs').insert(insertData).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  const admin = adminClient()

  // Only allow deleting own logs
  const { error } = await admin
    .from('nutrition_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
