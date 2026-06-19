import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { calcNutritionStreak } from '@/lib/nutrition-streak'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const [logsRes, targetRes] = await Promise.all([
    supabase
      .from('nutrition_logs')
      .select('log_date, calories, protein')
      .eq('user_id', user.id)
      .order('log_date', { ascending: true }),
    supabase
      .from('macro_targets')
      .select('calories, protein, plan')
      .eq('user_id', user.id)
      .single(),
  ])

  const logs = logsRes.data || []
  const target = targetRes.data || { calories: 2500, protein: 150, plan: 'gain' }

  const streak = calcNutritionStreak(logs, target, today)

  return NextResponse.json({ streak, today })
}
