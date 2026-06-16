'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import { LogOut, Plus, Search, X, ChevronDown, Pill, Calendar } from 'lucide-react'

type FoodResult = {
  fdcId: number
  description: string
  brandOwner: string | null
  servingSize: number
  servingSizeUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

type NutritionLog = {
  id: string
  meal_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  entry_method: 'search' | 'manual'
}

type SuppLog = {
  id: string
  supplement_name: string
  taken: boolean
}

type Profile = {
  id: string
  full_name: string
  role: string
}

type Targets = {
  calories: number
  protein: number
  carbs: number
  fat: number
  supplements: string[]
} | null

type MacroRingProps = {
  label: string
  value: number
  target: number
  color: string
  unit?: string
}

function MacroRing({ label, value, target, color, unit = 'g' }: MacroRingProps) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0
  const r = 30
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#374151" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="44" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
          {value}
        </text>
      </svg>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs text-gray-500">{target}{unit} goal</p>
    </div>
  )
}

export default function LogClient({
  profile,
  initialLogs,
  initialSuppLogs,
  targets,
  today,
}: {
  profile: Profile
  initialLogs: NutritionLog[]
  initialSuppLogs: SuppLog[]
  targets: Targets
  today: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [tab, setTab] = useState<'today' | 'week' | 'month'>('today')
  const [logs, setLogs] = useState<NutritionLog[]>(initialLogs)
  const [suppLogs, setSuppLogs] = useState<SuppLog[]>(initialSuppLogs)
  const [showAddModal, setShowAddModal] = useState(false)
  const [mode, setMode] = useState<'search' | 'manual'>('search')
  const [historyLogs, setHistoryLogs] = useState<{ log_date: string; calories: number; protein: number; carbs: number; fat: number }[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const loadHistory = useCallback(async (range: 'week' | 'month') => {
    setHistoryLoading(true)
    const res = await fetch(`/api/history?range=${range}`)
    const data = await res.json()
    setHistoryLogs(data.logs ?? [])
    setHistoryLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'week') loadHistory('week')
    if (tab === 'month') loadHistory('month')
  }, [tab, loadHistory])

  // Search state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<FoodResult | null>(null)
  const [servings, setServings] = useState('1')
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Manual state
  const [manual, setManual] = useState({ meal_name: '', calories: '', protein: '', carbs: '', fat: '' })

  const [, startTransition] = useTransition()

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      protein: acc.protein + l.protein,
      carbs: acc.carbs + l.carbs,
      fat: acc.fat + l.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  useEffect(() => {
    if (mode !== 'search' || query.length < 2) { setResults([]); return }
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.foods)
      setSearching(false)
    }, 400)
  }, [query, mode])

  async function addFromSearch() {
    if (!selected) return
    const mult = parseFloat(servings) || 1
    const entry = {
      log_date: today,
      meal_name: selected.description,
      calories: Math.round(selected.calories * mult),
      protein: Math.round(selected.protein * mult * 10) / 10,
      carbs: Math.round(selected.carbs * mult * 10) / 10,
      fat: Math.round(selected.fat * mult * 10) / 10,
      entry_method: 'search',
    }
    const res = await fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })
    const { data } = await res.json()
    if (data) setLogs(prev => [...prev, data])
    resetModal()
  }

  async function addManual() {
    if (!manual.meal_name || !manual.calories) return
    const entry = {
      log_date: today,
      meal_name: manual.meal_name,
      calories: parseInt(manual.calories) || 0,
      protein: parseFloat(manual.protein) || 0,
      carbs: parseFloat(manual.carbs) || 0,
      fat: parseFloat(manual.fat) || 0,
      entry_method: 'manual',
    }
    const res = await fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })
    const { data } = await res.json()
    if (data) setLogs(prev => [...prev, data])
    resetModal()
  }

  async function deleteLog(id: string) {
    await fetch('/api/log', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  async function toggleSupp(name: string) {
    const existing = suppLogs.find(s => s.supplement_name === name)
    if (existing) {
      await fetch('/api/supp', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: existing.id }) })
      setSuppLogs(prev => prev.filter(s => s.id !== existing.id))
    } else {
      const res = await fetch('/api/supp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ log_date: today, supplement_name: name }) })
      const { data } = await res.json()
      if (data) setSuppLogs(prev => [...prev, data])
    }
  }

  function resetModal() {
    setShowAddModal(false)
    setQuery('')
    setResults([])
    setSelected(null)
    setServings('1')
    setManual({ meal_name: '', calories: '', protein: '', carbs: '', fat: '' })
  }

  async function signOut() {
    await supabase.auth.signOut()
    startTransition(() => router.push('/login'))
  }

  const supplements: string[] = targets?.supplements ?? []

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-4 flex items-center justify-between border-b border-gray-800">
        <div>
          <p className="text-xs text-gray-400">Welcome back</p>
          <h1 className="font-bold text-lg">{profile.full_name}</h1>
        </div>
        <button onClick={signOut} className="text-gray-400 hover:text-white">
          <LogOut size={20} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex bg-gray-900 border-b border-gray-800">
        {(['today', 'week', 'month'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'}`}
          >
            {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 space-y-6 max-w-lg mx-auto">
        {/* Macro rings */}
        {tab === 'today' && <div>
          <h2 className="text-sm text-gray-400 mb-3 font-medium">TODAY'S TOTALS</h2>
          <div className="bg-gray-900 rounded-2xl p-4 grid grid-cols-4 gap-2">
            <MacroRing label="Cal" value={totals.calories} target={targets?.calories ?? 2500} color="#22c55e" unit="" />
            <MacroRing label="Protein" value={Math.round(totals.protein)} target={targets?.protein ?? 150} color="#3b82f6" />
            <MacroRing label="Carbs" value={Math.round(totals.carbs)} target={targets?.carbs ?? 300} color="#f59e0b" />
            <MacroRing label="Fat" value={Math.round(totals.fat)} target={targets?.fat ?? 80} color="#ef4444" />
          </div>
        </div>}

        {/* Supplements */}
        {tab === 'today' && supplements.length > 0 && (
          <div>
            <h2 className="text-sm text-gray-400 mb-3 font-medium flex items-center gap-1"><Pill size={14} /> SUPPLEMENTS</h2>
            <div className="flex flex-wrap gap-2">
              {supplements.map(s => {
                const taken = suppLogs.some(l => l.supplement_name === s)
                return (
                  <button
                    key={s}
                    onClick={() => toggleSupp(s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${taken ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    {taken ? '✓ ' : ''}{s}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Food logs - today */}
        {tab === 'today' && (
          <div>
            <h2 className="text-sm text-gray-400 mb-3 font-medium">FOOD LOG</h2>
            <div className="space-y-2">
              {logs.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-6">No food logged yet today</p>
              )}
              {logs.map(log => (
                <div key={log.id} className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{log.meal_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {log.calories} cal · {log.protein}g P · {log.carbs}g C · {log.fat}g F
                    </p>
                  </div>
                  <button onClick={() => deleteLog(log.id)} className="text-gray-600 hover:text-red-400 ml-3 shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History view - week/month */}
        {(tab === 'week' || tab === 'month') && (
          <div>
            <h2 className="text-sm text-gray-400 mb-3 font-medium flex items-center gap-1">
              <Calendar size={14} /> {tab === 'week' ? 'LAST 7 DAYS' : 'LAST 30 DAYS'}
            </h2>
            {historyLoading && <p className="text-gray-500 text-sm text-center py-6">Loading…</p>}
            {!historyLoading && historyLogs.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-6">No logs in this period</p>
            )}
            {!historyLoading && (() => {
              // Group by date
              const byDate = historyLogs.reduce<Record<string, typeof historyLogs>>((acc, l) => {
                acc[l.log_date] = acc[l.log_date] ?? []
                acc[l.log_date].push(l)
                return acc
              }, {})

              return Object.entries(byDate).reverse().map(([date, dayLogs]) => {
                const total = dayLogs.reduce((a, l) => ({
                  calories: a.calories + l.calories,
                  protein: a.protein + l.protein,
                  carbs: a.carbs + l.carbs,
                  fat: a.fat + l.fat,
                }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

                const calTarget = targets?.calories ?? 2500
                const pct = Math.min(Math.round((total.calories / calTarget) * 100), 100)
                const label = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

                return (
                  <div key={date} className="bg-gray-900 rounded-xl px-4 py-3 mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{label}</span>
                      <span className={`text-xs font-semibold ${pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {total.calories} cal ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.round(total.protein)}g P · {Math.round(total.carbs)}g C · {Math.round(total.fat)}g F
                    </p>
                  </div>
                )
              })
            })()}
          </div>
        )}
      </div>

      {/* FAB - today only */}
      {tab === 'today' && <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-400 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors z-10"
      >
        <Plus size={26} />
      </button>}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-20 flex items-end" onClick={e => e.target === e.currentTarget && resetModal()}>
          <div className="bg-gray-900 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add Food</h3>
              <button onClick={resetModal}><X size={22} className="text-gray-400" /></button>
            </div>

            {/* Toggle */}
            <div className="flex bg-gray-800 rounded-xl p-1 mb-5">
              {(['search', 'manual'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-green-500 text-white' : 'text-gray-400'}`}
                >
                  {m === 'search' ? <span className="flex items-center justify-center gap-1"><Search size={14} /> Search</span> : <span className="flex items-center justify-center gap-1"><ChevronDown size={14} /> Manual</span>}
                </button>
              ))}
            </div>

            {mode === 'search' ? (
              <div className="space-y-3">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelected(null) }}
                  placeholder="Search foods…"
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
                {searching && <p className="text-gray-500 text-sm text-center">Searching…</p>}
                {!selected && results.map(f => (
                  <button
                    key={f.fdcId}
                    onClick={() => setSelected(f)}
                    className="w-full text-left bg-gray-800 rounded-xl px-4 py-3 hover:bg-gray-700 transition-colors"
                  >
                    <p className="text-sm font-medium line-clamp-1">{f.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.calories} cal · {f.protein}g P · {f.carbs}g C · {f.fat}g F per serving</p>
                  </button>
                ))}
                {selected && (
                  <div className="bg-gray-800 rounded-xl p-4 space-y-3">
                    <p className="font-medium text-sm">{selected.description}</p>
                    <div>
                      <label className="text-xs text-gray-400">Servings</label>
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={servings}
                        onChange={e => setServings(e.target.value)}
                        className="w-full mt-1 bg-gray-700 text-white rounded-lg px-3 py-2 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {(['calories', 'protein', 'carbs', 'fat'] as const).map(k => (
                        <div key={k} className="bg-gray-700 rounded-lg p-2">
                          <p className="font-bold text-sm">{Math.round(selected[k] * (parseFloat(servings) || 1) * 10) / 10}</p>
                          <p className="text-gray-400 capitalize">{k === 'calories' ? 'cal' : k.slice(0,3)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl bg-gray-700 text-sm">Back</button>
                      <button onClick={addFromSearch} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm">Add</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={manual.meal_name}
                  onChange={e => setManual(p => ({ ...p, meal_name: e.target.value }))}
                  placeholder="Food name *"
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'calories', label: 'Calories *', type: 'number' },
                    { key: 'protein', label: 'Protein (g)', type: 'number' },
                    { key: 'carbs', label: 'Carbs (g)', type: 'number' },
                    { key: 'fat', label: 'Fat (g)', type: 'number' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-400">{label}</label>
                      <input
                        type="number"
                        min="0"
                        value={manual[key as keyof typeof manual]}
                        onChange={e => setManual(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full mt-1 bg-gray-800 text-white rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={addManual}
                  disabled={!manual.meal_name || !manual.calories}
                  className="w-full py-3 rounded-xl bg-green-500 disabled:opacity-40 text-white font-semibold"
                >
                  Add Food
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
