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
  const { athlete_email, calories, protein, carbs, fat, plan } = await request.json()

  // Verify Cal AI API key
  const calaiKey = request.headers.get('x-calai-api-key')
  if (calaiKey !== process.env.CALAI_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!athlete_email) {
    return NextResponse.json({ error: 'Missing athlete_email' }, { status: 400 })
  }

  const admin = adminClient()

  // Find athlete by email
  const { data: user } = await admin.auth.admin.listUsers()
  const athleteUser = user?.users.find(u => u.email === athlete_email)

  if (!athleteUser) {
    return NextResponse.json({ error: 'Athlete not found' }, { status: 404 })
  }

  // Update macro targets
  const { error } = await admin.from('macro_targets').upsert(
    {
      user_id: athleteUser.id,
      calories: calories || undefined,
      protein: protein || undefined,
      carbs: carbs || undefined,
      fat: fat || undefined,
      plan: plan || 'gain',
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    athlete_id: athleteUser.id,
    updated_at: new Date().toISOString()
  })
}
