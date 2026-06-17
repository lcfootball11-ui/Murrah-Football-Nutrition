'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Calendar } from 'lucide-react'

type Log = {
  id: string
  log_date: string
  meal_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  created_at: string
}

type Target = {
  user_id: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function AthleteHistoryClient({
  athlete,
  logs,
  targets,
  coachId,
}: {
  athlete: { id: string; full_name: string }
  logs: Log[]
  targets: Target | null
  coachId: string
}) {
  const router = useRouter()
  const [view, setView] = useState<'week' | 'month'>('month')

  const calTarget = targets?.calories ?? 2500
  const proTarget = targets?.protein ?? 150
  const carbTarget = targets?.carbs ?? 300
  const fatTarget = targets?.fat ?? 80

  // Group logs by date
  const logsByDate = useMemo(() => {
    const grouped: Record<string, Log[]> = {}
    logs.forEach(log => {
      if (!grouped[log.log_date]) grouped[log.log_date] = []
      grouped[log.log_date].push(log)
    })
    return grouped
  }, [logs])

  // Get dates for view
  const today = new Date()
  const dates = useMemo(() => {
    const result = []
    const count = view === 'week' ? 7 : 30
    for (let i = 0; i < count; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      result.push(d.toISOString().split('T')[0])
    }
    return result
  }, [view])

  // Calculate daily totals
  const dailyTotals = dates.map(date => {
    const dayLogs = logsByDate[date] || []
    const totals = dayLogs.reduce(
      (acc, log) => ({
        cal: acc.cal + log.calories,
        pro: acc.pro + log.protein,
        carb: acc.carb + log.carbs,
        fat: acc.fat + log.fat,
      }),
      { cal: 0, pro: 0, carb: 0, fat: 0 }
    )
    return { date, ...totals, hasLogs: dayLogs.length > 0, logs: dayLogs }
  })

  // Group into weeks or months
  const grouped = useMemo(() => {
    if (view === 'week') {
      const weeks: typeof dailyTotals[][] = []
      let current: typeof dailyTotals[] = []
      dailyTotals.forEach((day, idx) => {
        current.push(day)
        if ((idx + 1) % 7 === 0 || idx === dailyTotals.length - 1) {
          weeks.push(current)
          current = []
        }
      })
      return weeks.reverse()
    } else {
      const months: typeof dailyTotals[][] = []
      let current: typeof dailyTotals[] = []
      let currentMonth = ''
      dailyTotals.forEach((day, idx) => {
        const month = day.date.slice(0, 7)
        if (currentMonth && month !== currentMonth) {
          months.push(current)
          current = []
        }
        currentMonth = month
        current.push(day)
      })
      if (current.length) months.push(current)
      return months.reverse()
    }
  }, [dailyTotals, view])

  const pct = (val: number, target: number) => {
    if (!target) return 0
    return Math.min(Math.round((val / target) * 100), 100)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen mustang-gradient text-white pb-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/murrah-team.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#08091a]" />
        <div className="relative px-4 pt-5 pb-5">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => router.back()}
              className="glass rounded-xl p-2.5 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">History</p>
              <h1 className="text-2xl font-black text-white">{athlete.full_name}</h1>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                view === 'month'
                  ? 'btn-blue text-white'
                  : 'glass text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                view === 'week'
                  ? 'btn-blue text-white'
                  : 'glass text-slate-400 hover:text-white'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-3xl mx-auto space-y-4">
        {grouped.length === 0 ? (
          <div className="glass rounded-2xl py-12 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-slate-400 font-medium">No nutrition data yet</p>
          </div>
        ) : (
          grouped.map((period, periodIdx) => (
            <div key={periodIdx}>
              {/* Period header */}
              {view === 'month' && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Calendar size={14} className="text-slate-500" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {new Date(period[0].date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {period.map(day => {
                  const calPct = pct(day.cal, calTarget)
                  const proPct = pct(day.pro, proTarget)
                  const compliant =
                    day.cal >= calTarget * 0.9 &&
                    day.pro >= proTarget * 0.9 &&
                    day.hasLogs

                  return (
                    <div key={day.date} className="card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-white">{formatDate(day.date)}</p>
                          {compliant && <span className="text-lg">✅</span>}
                          {!day.hasLogs && <span className="text-lg">💤</span>}
                        </div>
                        <p className="text-xs text-slate-400">
                          {day.logs.length} {day.logs.length === 1 ? 'entry' : 'entries'}
                        </p>
                      </div>

                      {day.hasLogs ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {[
                              { label: 'Calories', val: day.cal, target: calTarget, unit: '', color: '#3b82f6' },
                              { label: 'Protein', val: Math.round(day.pro), target: proTarget, unit: 'g', color: '#60a5fa' },
                              { label: 'Carbs', val: Math.round(day.carb), target: carbTarget, unit: 'g', color: '#94a3b8' },
                              { label: 'Fat', val: Math.round(day.fat), target: fatTarget, unit: 'g', color: '#cbd5e1' },
                            ].map(({ label, val, target: t, unit, color }) => (
                              <div key={label} className="bg-white/5 rounded-lg p-2.5">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-slate-400">{label}</span>
                                  <span className="text-xs font-bold" style={{ color }}>
                                    {val}/{t}{unit}
                                  </span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${pct(val, t)}%`, background: color }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Daily meals */}
                          <div className="space-y-1.5 bg-white/[0.02] rounded-lg p-2">
                            {day.logs.map(log => (
                              <div key={log.id} className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">{log.meal_name}</span>
                                <span className="text-slate-300">
                                  {log.calories} cal • {Math.round(log.protein)}g P
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-slate-500">No logs recorded</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
