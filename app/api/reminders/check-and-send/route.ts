import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getCentralTime() {
  const now = new Date()
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  return utcDate.toISOString().split('T')[0]
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const today = getCentralTime()

    // Get all athletes with phone numbers and reminders enabled
    const { data: athletes } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number')
      .eq('role', 'athlete')
      .eq('reminder_enabled', true)
      .not('phone_number', 'is', null)

    if (!athletes || athletes.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No athletes to remind' })
    }

    let remindersSent = 0

    for (const athlete of athletes) {
      try {
        // Get athlete's targets
        const { data: targets } = await supabase
          .from('macro_targets')
          .select('calories')
          .eq('user_id', athlete.id)
          .single()

        const calorieTarget = targets?.calories ?? 2500

        // Get today's logs
        const { data: logs } = await supabase
          .from('nutrition_logs')
          .select('calories')
          .eq('user_id', athlete.id)
          .eq('log_date', today)

        const totalCalories = logs?.reduce((sum, log) => sum + log.calories, 0) ?? 0
        const percentageOfGoal = (totalCalories / calorieTarget) * 100

        // Send reminder if below 50%
        if (percentageOfGoal < 50) {
          const percentage = Math.round(percentageOfGoal)
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mustangup.vercel.app'
          const message = `@${athlete.full_name} 🏈 You're at ${percentage}% of your nutrition goal!\n\nLog your meals now: ${appUrl}/log\n\nLet's hit those targets! 💪`

          // Send SMS via our endpoint
          const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reminders/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: athlete.phone_number,
              message,
            }),
          })

          if (smsResponse.ok) {
            remindersSent++
            console.log(`Reminder sent to ${athlete.full_name} (${percentageOfGoal.toFixed(1)}%)`)
          } else {
            console.error(`Failed to send reminder to ${athlete.full_name}`)
          }
        }
      } catch (error) {
        console.error(`Error processing reminder for ${athlete.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Reminder check error:', error)
    return NextResponse.json({ error: 'Failed to check reminders' }, { status: 500 })
  }
}
