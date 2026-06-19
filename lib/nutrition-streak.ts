// Calculate nutrition quality streak (consecutive days meeting both calorie AND protein goals)

type NutritionLog = {
  log_date: string
  calories: number
  protein: number
}

type Target = {
  calories: number
  protein: number
  plan?: 'gain' | 'loss'
}

function meetsNutritionGoals(dayLogs: NutritionLog[], target: Target): boolean {
  if (dayLogs.length === 0) return false

  const totalCals = dayLogs.reduce((sum, log) => sum + log.calories, 0)
  const totalProtein = dayLogs.reduce((sum, log) => sum + log.protein, 0)

  const calTarget = target.calories || 2500
  const proTarget = target.protein || 150
  const plan = target.plan || 'gain'

  // Protein must be >= 90% of target
  const proteinMet = totalProtein >= proTarget * 0.9

  // Calories depend on plan
  const caloriesMet = plan === 'loss'
    ? totalCals <= calTarget * 1.05 // Allow 5% over for loss
    : totalCals >= calTarget * 0.9   // Need 90% for gain

  return proteinMet && caloriesMet
}

export function calcNutritionStreak(
  logs: NutritionLog[],
  target: Target,
  today: string
): number {
  if (!logs || logs.length === 0) return 0

  // Group logs by date
  const byDate: Record<string, NutritionLog[]> = {}
  for (const log of logs) {
    if (!byDate[log.log_date]) byDate[log.log_date] = []
    byDate[log.log_date].push(log)
  }

  // Start from today and work backwards
  let streak = 0
  const cursor = new Date(today + 'T12:00:00')

  // Check if today qualifies
  const todayQualifies = meetsNutritionGoals(byDate[today] || [], target)
  if (todayQualifies) {
    streak = 1
  } else {
    // Start from yesterday if today didn't qualify
    cursor.setDate(cursor.getDate() - 1)
  }

  // Count backwards from yesterday (or from today if today qualified)
  while (true) {
    const dateStr = cursor.toISOString().split('T')[0]
    const dayLogs = byDate[dateStr] || []

    if (!meetsNutritionGoals(dayLogs, target)) break

    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
