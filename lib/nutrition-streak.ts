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
  // Loss: must eat at least 700 cal (minimum nutrition floor) but stay at/under target
  // Gain: must hit 90% of target
  const caloriesMet = plan === 'loss'
    ? totalCals >= 700 && totalCals <= calTarget * 1.05
    : totalCals >= calTarget * 0.9

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

  // Check if today qualifies, then always move cursor to yesterday before looping
  const todayQualifies = meetsNutritionGoals(byDate[today] || [], target)
  if (todayQualifies) streak = 1
  cursor.setDate(cursor.getDate() - 1)

  // Count backwards from yesterday
  while (true) {
    const dateStr = cursor.toISOString().split('T')[0]
    const dayLogs = byDate[dateStr] || []

    if (!meetsNutritionGoals(dayLogs, target)) break

    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
