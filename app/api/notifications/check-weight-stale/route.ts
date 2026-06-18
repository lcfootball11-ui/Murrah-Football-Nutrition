import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Get all athletes
    const { data: athletes } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'athlete')

    if (!athletes || athletes.length === 0) {
      return NextResponse.json({ checked: 0, notifications: 0 })
    }

    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 7)
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

    let notificationsCreated = 0

    for (const athlete of athletes) {
      // Get latest weight entry for this athlete
      const { data: latestWeight } = await supabase
        .from('weight_logs')
        .select('log_date')
        .eq('user_id', athlete.id)
        .order('log_date', { ascending: false })
        .limit(1)
        .single()

      // If no weight entry or last entry is older than 7 days
      if (!latestWeight || latestWeight.log_date < cutoffDateStr) {
        // Check if we already have an active notification for this athlete
        const { data: existingNotifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', athlete.id)
          .eq('notification_type', 'weight_stale')
          .is('read_at', null)
          .eq('related_athlete_id', athlete.id)
          .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        // Only create notification if we haven't created one in the last 24 hours
        if (!existingNotifications || existingNotifications.length === 0) {
          // Create notification for athlete
          const athleteNotif = await supabase.from('notifications').insert({
            user_id: athlete.id,
            notification_type: 'weight_stale',
            subject: 'Time to Log Weight',
            message: `It's been more than a week since you logged your weight. Please update your weight to track your progress.`,
            related_athlete_id: athlete.id,
          })

          if (athleteNotif.error) {
            console.error(`Failed to create athlete notification for ${athlete.full_name}:`, athleteNotif.error)
          } else {
            notificationsCreated++
          }

          // Create notification for all coaches
          const { data: coaches } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'coach')

          if (coaches) {
            for (const coach of coaches) {
              const coachNotif = await supabase.from('notifications').insert({
                user_id: coach.id,
                notification_type: 'weight_stale',
                subject: `${athlete.full_name} - Weight Tracking Overdue`,
                message: `${athlete.full_name} hasn't logged weight in over a week. Consider sending a reminder.`,
                related_athlete_id: athlete.id,
              })

              if (coachNotif.error) {
                console.error(`Failed to create coach notification for ${athlete.full_name}:`, coachNotif.error)
              } else {
                notificationsCreated++
              }
            }
          }
        }
      }
    }

    // Clean up expired notifications
    const expirationDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', expirationDate)

    return NextResponse.json({
      success: true,
      checked: athletes.length,
      notifications: notificationsCreated,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Weight stale check error:', error)
    return NextResponse.json({ error: 'Failed to check weight staleness' }, { status: 500 })
  }
}
