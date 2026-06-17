'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface Log {
  id: string
  log_date: string
  meal_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Target {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Athlete {
  id: string
  full_name: string
}

export default function HistoryView({
  athlete,
  logs,
  targets,
}: {
  athlete: Athlete
  logs: Log[]
  targets: Target | null
}) {
  const router = useRouter()
  const [view, setView] = useState('month')

  const calTarget = targets?.calories ?? 2500
  const proTarget = targets?.protein ?? 150
  const carbTarget = targets?.carbs ?? 300
  const fatTarget = targets?.fat ?? 80

  // Get all unique dates from logs
  const allDates = [...new Set(logs.map(l => l.log_date))].sort().reverse()

  // Filter dates based on view
  const getFilteredDates = () => {
    const now = new Date()
    if (view === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return allDates.filter(d => new Date(d) >= weekAgo)
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return allDates.filter(d => new Date(d) >= monthAgo)
    }
  }

  const filteredDates = getFilteredDates()
  const daysData = filteredDates.map(date => {
    const dayLogs = logs.filter(l => l.log_date === date)
    const totals = dayLogs.reduce(
      (acc, l) => ({
        cal: acc.cal + l.calories,
        pro: acc.pro + l.protein,
        carb: acc.carb + l.carbs,
        fat: acc.fat + l.fat,
      }),
      { cal: 0, pro: 0, carb: 0, fat: 0 }
    )
    return { date, logs: dayLogs, totals }
  })

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
          <div className="flex gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                view === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'glass text-slate-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                view === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'glass text-slate-400 hover:text-white'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-3xl mx-auto space-y-3">
        {daysData.length === 0 ? (
          <div className="glass rounded-2xl py-12 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-slate-400 font-medium">No logs in this period</p>
          </div>
        ) : (
          daysData.map(day => (
            <div key={day.date} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm text-white">{formatDate(day.date)}</p>
                <p className="text-xs text-slate-400">{day.logs.length} entries</p>
              </div>

              {day.totals.cal > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: 'Cal', val: day.totals.cal, target: calTarget, color: '#3b82f6' },
                      { label: 'Pro', val: Math.round(day.totals.pro), target: proTarget, color: '#60a5fa' },
                      { label: 'Carb', val: Math.round(day.totals.carb), target: carbTarget, color: '#94a3b8' },
                      { label: 'Fat', val: Math.round(day.totals.fat), target: fatTarget, color: '#cbd5e1' },
                    ].map(m => (
                      <div key={m.label} className="bg-white/5 rounded-lg p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-400">{m.label}</span>
                          <span className="text-xs font-bold" style={{ color: m.color }}>
                            {m.val}/{m.target}
                          </span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct(m.val, m.target)}%`, background: m.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Meals list */}
                  <div className="bg-white/[0.02] rounded-lg p-2 space-y-1">
                    {day.logs.map(log => (
                      <div key={log.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{log.meal_name}</span>
                        <span className="text-slate-300">
                          {log.calories} cal • {Math.round(log.protein)}g
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500">No logs recorded</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
