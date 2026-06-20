import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const { coach_secret, user_id, calories, protein, carbs, fat, fiber, supplements, plan, target_weight, goal_weight } = await request.json()

  if (coach_secret !== process.env.COACH_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = adminClient()
  const { error } = await admin.from('macro_targets').upsert(
    { user_id, calories, protein, carbs, fat, fiber: fiber ?? null, supplements, plan: plan ?? 'gain', target_weight: target_weight || null, goal_weight: goal_weight || null },
    { onConflict: 'user_id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
