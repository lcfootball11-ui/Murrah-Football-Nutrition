# Weight Tracking Notification System Setup

## Overview

Automated notifications alert athletes and coaches when an athlete hasn't logged weight for more than 7 days.

## Setup Steps

### 1. Create Database Table

Run this SQL in Supabase SQL Editor:

```sql
-- Copy contents of add-notifications-schema.sql
```

File: `add-notifications-schema.sql`

### 2. Set Up Vercel Cron Job

Add this to `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/notifications/check-weight-stale",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This runs daily at 8 AM UTC (3 AM Central Time).

Alternatively, create the file if it doesn't exist:

```bash
cat > vercel.json << 'EOF'
{
  "crons": [
    {
      "path": "/api/notifications/check-weight-stale",
      "schedule": "0 8 * * *"
    }
  ]
}
EOF
```

### 3. Deploy

Push to main branch and deploy to Vercel:

```bash
git push origin main
```

The cron job will automatically run at the scheduled time.

## How It Works

### Automatic Checks (Daily)
- Runs every day at 8 AM UTC
- Checks each athlete's last weight entry date
- If last entry > 7 days ago:
  - Creates notification for the athlete
  - Creates notification for all coaches
  - Won't create duplicate notifications within 24 hours

### Notifications Include
- **Athlete notification**: Reminder to log weight
- **Coach notification**: Alert about athlete's overdue weight log
- Timestamp and dismissal capability

### Notification Lifecycle
- Created automatically by cron job
- Marked as read when athlete/coach reads it
- Auto-expire after 7 days
- Deletable by user

## Notification Badge

Both athlete and coach pages display:
- Bell icon with unread count badge (bottom-right)
- Notification panel slides in from bottom-right
- Real-time notifications (polled every 60 seconds)
- Mark as read or delete individually

## Manual Testing

To test the notification system manually:

```bash
# Test the check-weight-stale endpoint
curl -X POST http://localhost:3000/api/notifications/check-weight-stale \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Database Schema

```
notifications table:
- id (UUID, primary key)
- user_id (UUID, refs profiles)
- notification_type (enum: 'weight_stale', 'weight_reminder')
- subject (string)
- message (text)
- related_athlete_id (UUID, refs profiles)
- read_at (timestamp, nullable)
- created_at (timestamp, auto)
- expires_at (timestamp, auto - 7 days from creation)
```

## API Endpoints

### Get Notifications
```
GET /api/notifications?unread_only=true
```

### Mark as Read
```
PATCH /api/notifications
{
  "id": "notification-id",
  "read": true
}
```

### Delete Notification
```
DELETE /api/notifications
{
  "id": "notification-id"
}
```

### Check Stale Weight (Cron)
```
POST /api/notifications/check-weight-stale
Authorization: Bearer {CRON_SECRET}
```

## Customization

### Change Check Frequency
Edit `vercel.json` schedule:
- `"0 8 * * *"` = Daily at 8 AM UTC
- `"0 */6 * * *"` = Every 6 hours
- See [cron schedule syntax](https://crontab.guru/)

### Change Stale Threshold
In `/api/notifications/check-weight-stale/route.ts`, change:
```typescript
cutoffDate.setDate(cutoffDate.getDate() - 7) // Change 7 to desired days
```

### Notification Expiration
In `add-notifications-schema.sql`, change:
```sql
expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
```

## Monitoring

Check notification creation logs in:
- Vercel dashboard → Cron jobs → Function Logs
- Look for successful runs and any error messages

## Troubleshooting

### Notifications Not Appearing
1. Verify `vercel.json` is in project root
2. Check `CRON_SECRET` environment variable is set in Vercel
3. Wait for cron job to run (check scheduled time)
4. Manually trigger with test endpoint

### Duplicate Notifications
- System prevents duplicates within 24 hours
- Older duplicates are automatically cleaned up after 7 days

### Athletes Not Receiving Notifications
- Ensure notifications table is created
- Verify athlete has actually logged weight before
- Check if notifications are auto-expiring

## Future Enhancements

- [ ] Email notifications for coaches
- [ ] SMS reminders (integrate with GroupMe)
- [ ] Customizable stale threshold per athlete
- [ ] Batch notification summaries
- [ ] Push notifications (if PWA enabled)
