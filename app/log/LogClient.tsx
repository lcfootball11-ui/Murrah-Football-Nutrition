'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Search, X, ChevronDown, Pill, Calendar, Flame, Settings } from 'lucide-react'
import WeightTracker from './WeightTracker'
import NotificationBanner from '@/app/components/NotificationBanner'
import NutritionStreakBadge from '@/app/components/NutritionStreakBadge'
import ChipotleMealBuilder from '@/app/components/ChipotleMealBuilder'
import SubwayMealBuilder from '@/app/components/SubwayMealBuilder'
import DominosMealBuilder from '@/app/components/DominosMealBuilder'
import CookOutMealBuilder from '@/app/components/CookOutMealBuilder'

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
  phone_number?: string | null
}

type Targets = {
  calories: number
  protein: number
  carbs: number
  fat: number
  supplements: string[]
} | null

function MacroRing({ label, value, target, color, unit = 'g' }: {
  label: string; value: number; target: number; color: string; unit?: string
}) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0
  const r = 32
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const isOver = value > target && target > 0

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle
          cx="42" cy="42" r={r}
          fill="none"
          stroke={isOver ? '#f87171' : color}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
          style={{ filter: `drop-shadow(0 0 6px ${isOver ? '#f87171' : color}88)`, transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text x="42" y="38" textAnchor="middle" fill="white" fontSize="13" fontWeight="800">{value}</text>
        <text x="42" y="52" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">{unit === '' ? 'CAL' : unit.toUpperCase()}</text>
      </svg>
      <div className="text-center">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">{label}</p>
        <p className="text-xs text-slate-600">{target}{unit}</p>
      </div>
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
  const [activeDate, setActiveDate] = useState(today)
  const [logs, setLogs] = useState<NutritionLog[]>(initialLogs)
  const [suppLogs, setSuppLogs] = useState<SuppLog[]>(initialSuppLogs)
  const [dateLoading, setDateLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [mode, setMode] = useState<'search' | 'manual' | 'restaurant' | 'chipotle' | 'subway' | 'dominos' | 'cookout'>('search')
  const [historyLogs, setHistoryLogs] = useState<{ log_date: string; calories: number; protein: number; carbs: number; fat: number }[]>([])
  const [historyWeights, setHistoryWeights] = useState<{ log_date: string; weight_lbs: number }[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [streak, setStreak] = useState(0)
  const [nutritionStreak, setNutritionStreak] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/streak').then(r => r.json()).then(d => setStreak(d.streak ?? 0))
    fetch('/api/nutrition-streak').then(r => r.json()).then(d => setNutritionStreak(d.streak ?? 0))
  }, [])

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<FoodResult | null>(null)
  const [servings, setServings] = useState('1')
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [manual, setManual] = useState({ meal_name: '', calories: '', protein: '', carbs: '', fat: '' })
  const [, startTransition] = useTransition()
  const [photoIndex, setPhotoIndex] = useState(0)
  const photoList = [
    'IMG_9077.jpeg', 'IMG_9079.jpeg', 'IMG_9080.jpeg', 'IMG_9081.jpeg',
    'IMG_9082.jpeg', 'IMG_9083.jpeg', 'IMG_9084.jpeg', 'IMG_9085.jpeg',
    'IMG_9086.jpeg', 'IMG_9087.jpeg', 'IMG_9088.jpeg', 'IMG_9089.jpeg',
    'IMG_9090.jpeg', 'IMG_9091.jpeg', 'IMG_9092.jpeg', 'IMG_9093.jpeg',
    'IMG_9094.jpeg', 'IMG_9096.jpeg', 'IMG_9097.jpeg'
  ]
  const [photos, setPhotos] = useState(photoList)
  const [showSettings, setShowSettings] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || '')
  const [savingPhone, setSavingPhone] = useState(false)
  useEffect(() => {
    const shuffled = [...photoList].sort(() => Math.random() - 0.5)
    setPhotos(shuffled)
    const interval = setInterval(() => setPhotoIndex(i => (i + 1) % shuffled.length), 8000)
    return () => clearInterval(interval)
  }, [])

  const totals = logs.reduce(
    (acc, l) => ({ calories: acc.calories + l.calories, protein: acc.protein + l.protein, carbs: acc.carbs + l.carbs, fat: acc.fat + l.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const calTarget = targets?.calories ?? 2500
  const calPct = Math.min(Math.round((totals.calories / calTarget) * 100), 100)

  const loadDate = useCallback(async (date: string) => {
    setDateLoading(true)
    const res = await fetch(`/api/log-for-date?date=${date}`)
    const data = await res.json()
    setLogs(data.logs ?? [])
    setSuppLogs(data.suppLogs ?? [])
    setDateLoading(false)
  }, [])

  const loadHistory = useCallback(async (range: 'week' | 'month') => {
    setHistoryLoading(true)
    const res = await fetch(`/api/history?range=${range}`)
    const data = await res.json()
    setHistoryLogs(data.logs ?? [])
    setHistoryWeights(data.weights ?? [])
    setHistoryLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'week') loadHistory('week')
    if (tab === 'month') loadHistory('month')
  }, [tab, loadHistory])

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

  function goToDate(date: string) {
    setActiveDate(date)
    setTab('today')
    if (date === today) { setLogs(initialLogs); setSuppLogs(initialSuppLogs) }
    else loadDate(date)
  }

  function changeDate(offset: number) {
    const d = new Date(activeDate + 'T12:00:00')
    d.setDate(d.getDate() + offset)
    const newDate = d.toISOString().split('T')[0]
    if (newDate > today) return
    goToDate(newDate)
  }

  async function addFromSearch() {
    if (!selected) return
    const mult = parseFloat(servings) || 1
    const entry = {
      log_date: activeDate,
      meal_name: selected.description,
      calories: Math.round(selected.calories * mult),
      protein: Math.round(selected.protein * mult * 10) / 10,
      carbs: Math.round(selected.carbs * mult * 10) / 10,
      fat: Math.round(selected.fat * mult * 10) / 10,
      entry_method: 'search',
    }
    const res = await fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })
    const { data } = await res.json()
    if (data) {
      setLogs(prev => [...prev, data])
      fetch('/api/streak').then(r => r.json()).then(d => setStreak(d.streak ?? 0))
    }
    resetModal()
  }

  async function addManual() {
    if (!manual.meal_name || !manual.calories) return
    const entry = {
      log_date: activeDate,
      meal_name: manual.meal_name,
      calories: parseInt(manual.calories) || 0,
      protein: parseFloat(manual.protein) || 0,
      carbs: parseFloat(manual.carbs) || 0,
      fat: parseFloat(manual.fat) || 0,
      entry_method: 'manual',
    }
    const res = await fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })
    const { data } = await res.json()
    if (data) {
      setLogs(prev => [...prev, data])
      fetch('/api/streak').then(r => r.json()).then(d => setStreak(d.streak ?? 0))
    }
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
      const res = await fetch('/api/supp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ log_date: activeDate, supplement_name: name }) })
      const { data } = await res.json()
      if (data) setSuppLogs(prev => [...prev, data])
    }
  }

  async function addRestaurantMeal(name: string, calories: number, protein: number, carbs: number, fat: number) {
    const entry = { log_date: activeDate, meal_name: name, calories, protein, carbs, fat, entry_method: 'manual' }
    const res = await fetch('/api/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })
    const { data } = await res.json()
    if (data) {
      setLogs(prev => [...prev, data])
      fetch('/api/streak').then(r => r.json()).then(d => setStreak(d.streak ?? 0))
    }
    resetModal()
  }

  function resetModal() {
    setShowAddModal(false); setQuery(''); setResults([]); setSelected(null)
    setServings('1'); setManual({ meal_name: '', calories: '', protein: '', carbs: '', fat: '' })
    setMode('search')
  }

  async function signOut() {
    await supabase.auth.signOut()
    startTransition(() => router.push('/login'))
  }

  async function savePhoneNumber() {
    setSavingPhone(true)
    const res = await fetch('/api/athlete/update-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    })
    setSavingPhone(false)
    if (res.ok) {
      setShowSettings(false)
    } else {
      alert('Failed to save phone number')
    }
  }

  const supplements: string[] = targets?.supplements ?? []
  const firstName = profile.full_name.split(' ')[0]

  const dateLabel = activeDate === today
    ? 'Today'
    : new Date(activeDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="min-h-screen mustang-gradient text-white pb-10 lg:pb-28 relative">
      {/* Left side panel with vertically stacked images */}
      <div className="hidden lg:fixed lg:left-0 lg:top-[300px] lg:bottom-0 lg:w-64 xl:w-80 2xl:w-96 lg:z-0 lg:flex lg:flex-col lg:overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 border-b border-[#1a2844] relative overflow-hidden">
            {i === 0 && (
              <>
                <img
                  src="/PigandPint.jpg"
                  alt="Murrah"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#08091a] to-transparent" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Right side panel with rotating player photos */}
      <div className="hidden lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-64 xl:w-80 2xl:w-96 lg:z-0 lg:flex lg:flex-col lg:items-center lg:justify-center lg:overflow-hidden">
        <div className="relative w-full h-full">
          {photos.map((photo, i) => (
            <div
              key={photo}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: i === photoIndex ? 1 : 0 }}
            >
              <img
                src={`/${photo}`}
                alt="Murrah Mustang"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#08091a] via-[#08091a]/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Team photo background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/murrah-team.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#08091a]" />
        <div className="relative px-4 pt-5 pb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Murrah Mustangs 🐴</p>
            <h1 className="text-2xl font-black text-white mt-0.5">Hey, {firstName}!</h1>
            <p className="text-slate-400 text-xs mt-0.5">MustangUp 💪</p>
          </div>
          <div className="flex items-center gap-2 mr-10">
            {streak > 0 && (
              <div className="streak-badge rounded-2xl px-3 py-2 text-center">
                <p className="text-xl font-black text-white leading-none">{streak}</p>
                <p className="text-xs font-bold text-blue-300 leading-none mt-0.5">🔥 logging</p>
              </div>
            )}
            {nutritionStreak !== null && (
              <div className="rounded-2xl px-3 py-2 text-center" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(168, 85, 247, 0.15) 100%)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <p className="text-xl font-black text-white leading-none">{nutritionStreak}</p>
                <p className="text-xs font-bold text-purple-300 leading-none mt-0.5">💪 nutrition</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} className="glass rounded-xl p-2.5 text-slate-400 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
            <button onClick={signOut} className="glass rounded-xl p-2.5 text-slate-400 hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Calorie hero bar */}
        {tab === 'today' && (
          <div className="px-4 pb-5">
            <div className="glass-blue rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-blue-400" />
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">{dateLabel}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{calPct}% of goal</span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black text-white">{totals.calories}</span>
                <span className="text-slate-400 text-sm mb-1.5">/ {calTarget} cal</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${calPct}%`,
                    background: calPct >= 90 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : calPct >= 60 ? 'linear-gradient(90deg,#3b82f6,#60a5fa)' : 'linear-gradient(90deg,#1d4ed8,#3b82f6)',
                    boxShadow: '0 0 12px rgba(59,130,246,0.5)'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex glass border-b border-white/5 sticky top-0 z-10">
        {(['today', 'week', 'month'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${tab === t ? 'tab-active' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t === 'today' ? '📅 Today' : t === 'week' ? '📊 Week' : '📈 Month'}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">

        {/* Date navigator */}
        {tab === 'today' && (
          <div className="glass rounded-2xl px-4 py-2.5 flex items-center justify-between">
            <button onClick={() => changeDate(-1)} className="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-xl">‹</button>
            <div className="text-center">
              <input
                type="date"
                max={today}
                value={activeDate}
                onChange={e => e.target.value && goToDate(e.target.value)}
                className="bg-transparent text-white text-sm font-bold text-center outline-none cursor-pointer"
              />
              {activeDate !== today && (
                <button onClick={() => goToDate(today)} className="block mx-auto text-xs text-blue-400 hover:text-blue-300 mt-0.5">↩ Back to today</button>
              )}
            </div>
            <button
              onClick={() => changeDate(1)}
              disabled={activeDate >= today}
              className="text-slate-400 hover:text-white disabled:opacity-20 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-xl"
            >›</button>
          </div>
        )}

        {/* Macro rings */}
        {tab === 'today' && (
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Macros</p>
            <div className="grid grid-cols-3 gap-4">
              <MacroRing label="Protein" value={Math.round(totals.protein)} target={targets?.protein ?? 150} color="#3b82f6" />
              <MacroRing label="Carbs" value={Math.round(totals.carbs)} target={targets?.carbs ?? 300} color="#94a3b8" />
              <MacroRing label="Fat" value={Math.round(totals.fat)} target={targets?.fat ?? 80} color="#60a5fa" />
            </div>
          </div>
        )}

        {/* Supplements */}
        {tab === 'today' && supplements.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Pill size={12} /> Supplements</p>
            <div className="flex flex-wrap gap-2">
              {supplements.map(s => {
                const taken = suppLogs.some(l => l.supplement_name === s)
                return (
                  <button
                    key={s}
                    onClick={() => toggleSupp(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${taken
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'glass text-slate-400 hover:text-white'}`}
                    style={taken ? { boxShadow: '0 0 14px rgba(59,130,246,0.5)' } : {}}
                  >
                    {taken ? '✓ ' : ''}{s}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Weight Tracker */}
        {tab === 'today' && (
          <WeightTracker today={today} />
        )}

        {/* Logging Streak */}
        {tab === 'today' && streak > 0 && (
          <div className="px-4 py-0">
            <div className="glass rounded-2xl p-4 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    {streak} day logging streak
                  </p>
                  <p className="text-xs text-slate-400">keep tracking daily</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Goals Streak */}
        {tab === 'today' && (
          <div className="px-4 py-0">
            <NutritionStreakBadge />
          </div>
        )}

        {/* Food log - today */}
        {tab === 'today' && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Food Log</p>
            {dateLoading && (
              <div className="text-center py-8">
                <div className="text-3xl animate-bounce">🐴</div>
                <p className="text-slate-500 text-sm mt-2">Loading…</p>
              </div>
            )}
            <div className="space-y-2">
              {!dateLoading && logs.length === 0 && (
                <div className="glass rounded-2xl py-10 text-center">
                  <p className="text-3xl mb-2">🍽️</p>
                  <p className="text-slate-500 text-sm font-medium">No food logged yet</p>
                  <p className="text-slate-600 text-xs mt-1">Tap + to add your first meal</p>
                </div>
              )}
              {logs.map((log, i) => (
                <div key={log.id} className="card px-4 py-3 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="w-9 h-9 rounded-xl glass-blue flex items-center justify-center text-lg shrink-0">
                    {log.entry_method === 'search' ? '🔍' : '✏️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{log.meal_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-blue-400 font-bold text-xs">{log.calories} cal</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-400 text-xs">{log.protein}g P</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-400 text-xs">{log.carbs}g C</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-400 text-xs">{log.fat}g F</span>
                    </div>
                  </div>
                  <button onClick={() => deleteLog(log.id)} className="text-slate-700 hover:text-red-400 transition-colors p-1 shrink-0">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History view */}
        {(tab === 'week' || tab === 'month') && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar size={12} /> {tab === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
            </p>
            {historyLoading && (
              <div className="text-center py-10">
                <div className="text-3xl animate-bounce">🐴</div>
                <p className="text-slate-500 text-sm mt-2">Loading your history…</p>
              </div>
            )}
            {!historyLoading && historyLogs.length === 0 && (
              <div className="glass rounded-2xl py-10 text-center">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-slate-500 text-sm">No logs in this period yet</p>
              </div>
            )}
            {!historyLoading && (() => {
              const byDate = historyLogs.reduce<Record<string, typeof historyLogs>>((acc, l) => {
                acc[l.log_date] = acc[l.log_date] ?? []
                acc[l.log_date].push(l)
                return acc
              }, {})

              return Object.entries(byDate).reverse().map(([date, dayLogs], i) => {
                const total = dayLogs.reduce((a, l) => ({
                  calories: a.calories + l.calories, protein: a.protein + l.protein,
                  carbs: a.carbs + l.carbs, fat: a.fat + l.fat,
                }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
                const pct = Math.min(Math.round((total.calories / (targets?.calories ?? 2500)) * 100), 100)
                const label = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#3b82f6' : '#ef4444'
                const emoji = pct >= 80 ? '🔥' : pct >= 50 ? '💪' : '😤'

                return (
                  <button
                    key={date}
                    onClick={() => goToDate(date)}
                    className="card w-full text-left px-4 py-3.5 mb-2 animate-slide-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{emoji}</span>
                        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}88` }} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-bold text-xs">{total.calories} cal</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-400 text-xs">{Math.round(total.protein)}g P</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-400 text-xs">{Math.round(total.carbs)}g C</span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-slate-400 text-xs">{Math.round(total.fat)}g F</span>
                      {historyWeights.find(w => w.log_date === date) && (
                        <>
                          <span className="text-slate-600 text-xs">·</span>
                          <span className="text-green-400 text-xs font-bold">{historyWeights.find(w => w.log_date === date)?.weight_lbs.toFixed(1)} lbs ⚖️</span>
                        </>
                      )}
                      <span className="text-slate-600 text-xs ml-auto">tap to edit →</span>
                    </div>
                  </button>
                )
              })
            })()}
          </div>
        )}
      </div>

      {/* FAB */}
      {tab === 'today' && (
        <button
          onClick={() => { setShowAddModal(true); setTimeout(() => searchInputRef.current?.focus(), 100) }}
          className="btn-blue fixed bottom-6 right-6 text-white rounded-2xl w-16 h-16 flex items-center justify-center shadow-2xl z-10"
          style={{ boxShadow: '0 0 30px rgba(29,78,216,0.6)' }}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end" onClick={e => e.target === e.currentTarget && resetModal()}>
          <div className="w-full rounded-t-3xl animate-slide-up flex flex-col" style={{ background: '#0d1433', border: '1px solid rgba(59,130,246,0.2)', borderBottom: 'none', maxHeight: '92dvh' }}>

            {/* Sticky header — always visible above keyboard */}
            <div className="px-5 pt-5 pb-3 shrink-0">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-xl text-white">Add Food</h3>
                <button onClick={resetModal} className="glass rounded-xl p-2 text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              {/* Mode toggle — pinned at top so keyboard never covers it */}
              <div className="flex glass rounded-2xl p-1 gap-1">
                <button
                  onClick={() => setMode('search')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${mode === 'search' ? 'btn-blue text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Search size={13} /> Search
                </button>
                <button
                  onClick={() => setMode('restaurant')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${mode === 'restaurant' || mode === 'chipotle' || mode === 'subway' || mode === 'dominos' || mode === 'cookout' ? 'btn-blue text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  🍽️ Restaurants
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${mode === 'manual' ? 'btn-blue text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <ChevronDown size={13} /> Manual
                </button>
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="overflow-y-auto px-5 pb-6 flex-1">

              {mode === 'restaurant' ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Select Restaurant</p>
                  <button
                    onClick={() => setMode('chipotle' as typeof mode)}
                    className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all"
                  >
                    <span className="text-3xl">🌯</span>
                    <div className="text-left">
                      <p className="font-bold text-white">Chipotle Mexican Grill</p>
                      <p className="text-xs text-slate-400">Build your bowl, burrito, or tacos step by step</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setMode('subway' as typeof mode)}
                    className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all"
                  >
                    <span className="text-3xl">🥖</span>
                    <div className="text-left">
                      <p className="font-bold text-white">Subway</p>
                      <p className="text-xs text-slate-400">6" sub, footlong, wrap, or protein bowl</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setMode('dominos' as typeof mode)}
                    className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all"
                  >
                    <span className="text-3xl">🍕</span>
                    <div className="text-left">
                      <p className="font-bold text-white">Domino's Pizza</p>
                      <p className="text-xs text-slate-400">Build your own or choose a specialty pizza</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setMode('cookout' as typeof mode)}
                    className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all"
                  >
                    <span className="text-3xl">🔥</span>
                    <div className="text-left">
                      <p className="font-bold text-white">Cook Out</p>
                      <p className="text-xs text-slate-400">Burgers, chicken, hot dogs, sides & milkshakes</p>
                    </div>
                  </button>
                </div>
              ) : (mode as string) === 'chipotle' ? (
                <ChipotleMealBuilder onAdd={addRestaurantMeal} onClose={resetModal} />
              ) : (mode as string) === 'subway' ? (
                <SubwayMealBuilder onAdd={addRestaurantMeal} onClose={resetModal} />
              ) : (mode as string) === 'dominos' ? (
                <DominosMealBuilder onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'cookout' ? (
                <CookOutMealBuilder onAdd={addRestaurantMeal} />
              ) : mode === 'search' ? (
                <div className="space-y-3">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSelected(null) }}
                    placeholder="Search foods (e.g. chicken breast)…"
                    className="w-full glass text-white rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500 transition-all placeholder-slate-600 text-sm border border-white/10 focus:border-blue-500/50"
                  />
                  {searching && (
                    <div className="text-center py-4">
                      <div className="text-2xl animate-bounce">🔍</div>
                      <p className="text-slate-500 text-xs mt-1">Searching USDA database…</p>
                    </div>
                  )}
                  {!selected && results.map(f => (
                    <button
                      key={f.fdcId}
                      onClick={() => setSelected(f)}
                      className="card w-full text-left px-4 py-3 hover:border-blue-500/40"
                    >
                      <p className="text-sm font-semibold text-white line-clamp-1">{f.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-blue-400 font-bold text-xs">{f.calories} cal</span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-slate-400 text-xs">{f.protein}g P · {f.carbs}g C · {f.fat}g F</span>
                      </div>
                    </button>
                  ))}
                  {selected && (
                    <div className="glass-blue rounded-2xl p-4 space-y-4">
                      <p className="font-bold text-sm text-white line-clamp-2">{selected.description}</p>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Servings</label>
                        <input
                          type="number" min="0.25" step="0.25" value={servings}
                          onChange={e => setServings(e.target.value)}
                          className="w-full mt-1.5 glass text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 border border-white/10 text-center font-bold text-lg"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {(['calories', 'protein', 'carbs', 'fat'] as const).map(k => (
                          <div key={k} className="glass rounded-xl p-2.5">
                            <p className="font-black text-sm text-white">{Math.round(selected[k] * (parseFloat(servings) || 1) * 10) / 10}</p>
                            <p className="text-slate-500 text-xs mt-0.5 capitalize">{k === 'calories' ? 'cal' : k.slice(0,3)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(null)} className="flex-1 py-3 rounded-xl glass text-slate-300 font-bold text-sm">← Back</button>
                        <button onClick={addFromSearch} className="flex-1 py-3 rounded-xl btn-blue text-white font-bold text-sm">Add Food ✓</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text" value={manual.meal_name}
                    onChange={e => setManual(p => ({ ...p, meal_name: e.target.value }))}
                    placeholder="Food name *"
                    className="w-full glass border border-white/10 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-blue-500/50 placeholder-slate-600 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'calories', label: 'Calories *' },
                      { key: 'protein', label: 'Protein (g)' },
                      { key: 'carbs', label: 'Carbs (g)' },
                      { key: 'fat', label: 'Fat (g)' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
                        <input
                          type="number" min="0"
                          value={manual[key as keyof typeof manual]}
                          onChange={e => setManual(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full mt-1.5 glass border border-white/10 text-white rounded-xl px-3 py-3 outline-none focus:border-blue-500/50 text-center font-bold"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addManual}
                    disabled={!manual.meal_name || !manual.calories}
                    className="w-full py-3.5 rounded-2xl btn-blue disabled:opacity-30 text-white font-bold"
                  >
                    Add Food ✓
                  </button>
                </div>
              )}
            </div>{/* end scrollable content */}
          </div>{/* end modal sheet */}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end" onClick={() => setShowSettings(false)}>
          <div className="w-full rounded-t-3xl p-5 space-y-4 animate-slide-up" style={{ background: '#0d1433', border: '1px solid rgba(59,130,246,0.2)', borderBottom: 'none' }}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl flex items-center gap-2"><Settings size={20} className="text-blue-400" /> Settings</h3>
              <button onClick={() => setShowSettings(false)} className="glass rounded-xl p-2 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Phone Number for Reminders</label>
              <p className="text-xs text-slate-500 mb-2">Coaches will send you nutrition reminders if you fall below 50% of your daily goals</p>
              <input
                type="tel"
                placeholder="(123) 456-7890"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full glass border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 placeholder-slate-600"
              />
            </div>
            <button
              onClick={savePhoneNumber}
              disabled={savingPhone || !phoneNumber}
              className="w-full py-3.5 rounded-2xl btn-blue disabled:opacity-50 text-white font-bold"
            >
              {savingPhone ? 'Saving…' : 'Save Phone Number ✓'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom picture bar - only shows on small screens */}
      <div className="flex lg:hidden h-40 md:h-56 mt-4">
        <div className="flex-1 relative overflow-hidden border-r border-[#1a2844]">
          <img
            src="/PigandPint.jpg"
            alt="Murrah"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08091a] to-transparent" />
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="relative w-full h-full">
            {photos.map((photo, i) => (
              <div
                key={photo}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === photoIndex ? 1 : 0 }}
              >
                <img
                  src={`/${photo}`}
                  alt="Murrah Mustang"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#08091a] via-[#08091a]/40" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <NotificationBanner />
    </div>
  )
}
