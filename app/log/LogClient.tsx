'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Search, X, ChevronDown, Pill, Calendar, Flame, Settings, Info, LayoutDashboard, BookOpen, ChevronRight } from 'lucide-react'
import WeightTracker from './WeightTracker'
import NotificationBanner from '@/app/components/NotificationBanner'
import NutritionStreakBadge from '@/app/components/NutritionStreakBadge'
import ChipotleMealBuilder from '@/app/components/ChipotleMealBuilder'
import SubwayMealBuilder from '@/app/components/SubwayMealBuilder'
import DominosMealBuilder from '@/app/components/DominosMealBuilder'
import CookOutMealBuilder from '@/app/components/CookOutMealBuilder'
import ChallengeCard from '@/app/components/ChallengeCard'
import FastFoodMealBuilder, { MCDONALDS_MENU, WENDYS_MENU, WHATABURGER_MENU, RALLYS_MENU, CHICKFILA_MENU, BOSTONS_MENU, LONGHORN_MENU, MCALISTERS_MENU, BRENTS_MENU, PIGANDPINT_MENU, WINGSTOP_MENU, CANES_MENU, WAFFLEHOUSE_MENU, ZAXBYS_MENU } from '@/app/components/FastFoodMealBuilder'

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
  fiber?: number
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
  fiber?: number | null
  goal_weight?: number | null
  supplements: string[]
} | null

function MacroRing({ label, value, target, color, unit = 'g', onInfo }: {
  label: string; value: number; target: number; color: string; unit?: string; onInfo?: () => void
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
        {onInfo && (
          <button onClick={onInfo} className="mt-1 text-blue-400/50 hover:text-blue-400 transition-colors flex items-center justify-center w-full">
            <Info size={12} />
          </button>
        )}
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
  const [mode, setMode] = useState<'search' | 'manual' | 'restaurant' | 'chipotle' | 'subway' | 'dominos' | 'cookout' | 'mcdonalds' | 'wendys' | 'whataburger' | 'rallys' | 'canes' | 'wafflehouse' | 'zaxbys'>('search')
  const [historyLogs, setHistoryLogs] = useState<{ log_date: string; calories: number; protein: number; carbs: number; fat: number; fiber?: number }[]>([])
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
  const [manual, setManual] = useState({ meal_name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' })
  const [restaurantSearch, setRestaurantSearch] = useState('')
  const [showCalTooltip, setShowCalTooltip] = useState(false)
  const [showProteinTooltip, setShowProteinTooltip] = useState(false)
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
  const [showHandbook, setShowHandbook] = useState(false)
  const [handbookSection, setHandbookSection] = useState<string | null>(null)
  const [showEditGoals, setShowEditGoals] = useState(false)
  const [goalsForm, setGoalsForm] = useState({ calories: String(targets?.calories ?? ''), protein: String(targets?.protein ?? ''), goal_weight: String(targets?.goal_weight ?? '') })
  const [savingGoals, setSavingGoals] = useState(false)

  useEffect(() => {
    const handler = () => setShowHandbook(true)
    window.addEventListener('open-handbook', handler)
    return () => window.removeEventListener('open-handbook', handler)
  }, [])
  useEffect(() => {
    const shuffled = [...photoList].sort(() => Math.random() - 0.5)
    setPhotos(shuffled)
    const interval = setInterval(() => setPhotoIndex(i => (i + 1) % shuffled.length), 8000)
    return () => clearInterval(interval)
  }, [])

  const totals = logs.reduce(
    (acc, l) => ({ calories: acc.calories + l.calories, protein: acc.protein + l.protein, carbs: acc.carbs + l.carbs, fat: acc.fat + l.fat, fiber: acc.fiber + (l.fiber ?? 0) }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
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
    const entry: Record<string, unknown> = {
      log_date: activeDate,
      meal_name: manual.meal_name,
      calories: parseInt(manual.calories) || 0,
      protein: parseFloat(manual.protein) || 0,
      carbs: parseFloat(manual.carbs) || 0,
      fat: parseFloat(manual.fat) || 0,
      entry_method: 'manual',
    }
    if (manual.fiber) entry.fiber = parseFloat(manual.fiber) || 0
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
    setServings('1'); setManual({ meal_name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' })
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
            {profile.role === 'coach' && (
              <a href="/dashboard" className="glass rounded-xl p-2.5 text-blue-400 hover:text-blue-300 transition-colors" title="Back to Dashboard">
                <LayoutDashboard size={18} />
              </a>
            )}
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
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400">{calPct}% of goal</span>
                  <button onClick={() => setShowCalTooltip(v => !v)} className="text-blue-400/50 hover:text-blue-400 transition-colors">
                    <Info size={13} />
                  </button>
                </div>
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
              {showCalTooltip && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-blue-300 font-bold">Why calories matter:</span> Calories are the fuel your body runs on. Too few and you lose muscle mass and energy — too many and you gain unwanted fat. Hitting your daily calorie target helps you train harder, recover faster, and build the body composition your position demands.
                  </p>
                </div>
              )}
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
            <div className={`grid gap-4 ${profile.role === 'coach' ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <MacroRing label="Protein" value={Math.round(totals.protein)} target={targets?.protein ?? 150} color="#3b82f6" onInfo={() => setShowProteinTooltip(v => !v)} />
              <MacroRing label="Carbs" value={Math.round(totals.carbs)} target={targets?.carbs ?? 300} color="#94a3b8" />
              <MacroRing label="Fat" value={Math.round(totals.fat)} target={targets?.fat ?? 80} color="#60a5fa" />
              {profile.role === 'coach' && (
                <MacroRing label="Fiber" value={Math.round(totals.fiber)} target={targets?.fiber ?? 25} color="#22c55e" />
              )}
            </div>
            {showProteinTooltip && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-blue-300 font-bold">Why protein matters:</span> Protein builds and repairs the muscle tissue broken down during practice and lifting. Football players need roughly 0.7–1g per pound of bodyweight every day. Consistently hitting your protein goal is the single most important nutritional habit for getting bigger, stronger, and recovering between sessions.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Coach nutrition averages */}
        {profile.role === 'coach' && (() => {
          let avgCal = 0, avgPro = 0, avgFiber = 0, label = ''

          if (tab === 'today') {
            avgCal = totals.calories
            avgPro = Math.round(totals.protein)
            avgFiber = Math.round(totals.fiber)
            label = 'Today\'s Totals'
          } else {
            const byDate = historyLogs.reduce<Record<string, { cal: number; pro: number; fiber: number }>>((acc, l) => {
              if (!acc[l.log_date]) acc[l.log_date] = { cal: 0, pro: 0, fiber: 0 }
              acc[l.log_date].cal += l.calories
              acc[l.log_date].pro += l.protein
              acc[l.log_date].fiber += l.fiber ?? 0
              return acc
            }, {})
            const days = Object.values(byDate)
            if (days.length > 0) {
              avgCal = Math.round(days.reduce((s, d) => s + d.cal, 0) / days.length)
              avgPro = Math.round(days.reduce((s, d) => s + d.pro, 0) / days.length)
              avgFiber = Math.round(days.reduce((s, d) => s + d.fiber, 0) / days.length)
            }
            label = `${tab === 'week' ? '7-Day' : '30-Day'} Daily Average`
          }

          return (
            <div className="glass rounded-2xl p-4" style={{ borderLeft: '3px solid rgba(59,130,246,0.6)' }}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📊 {label}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Calories', value: avgCal.toLocaleString(), color: '#3b82f6', unit: 'cal' },
                  { label: 'Protein', value: avgPro, color: '#60a5fa', unit: 'g' },
                  { label: 'Fiber', value: avgFiber, color: '#22c55e', unit: 'g' },
                ].map(s => (
                  <div key={s.label} className="glass rounded-xl p-3">
                    <p className="text-xl font-black" style={{ color: s.color }}>{s.value}<span className="text-xs text-slate-500 font-normal ml-0.5">{s.unit}</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

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

        {/* Edit Goals — coaches only */}
        {tab === 'today' && profile.role === 'coach' && (
          <button
            onClick={() => setShowEditGoals(true)}
            className="w-full glass rounded-2xl px-4 py-3 flex items-center justify-between text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-sm font-bold">🎯 Edit My Calorie & Protein Goals</span>
            <span className="text-xs text-slate-600">cal: {targets?.calories ?? '—'} · pro: {targets?.protein ?? '—'}g</span>
          </button>
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

        {/* Active Challenges */}
        {tab === 'today' && profile.role === 'athlete' && (
          <ChallengeCard />
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
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${['restaurant','chipotle','subway','dominos','cookout','mcdonalds','wendys','whataburger','rallys'].includes(mode) ? 'btn-blue text-white' : 'text-slate-500 hover:text-slate-300'}`}
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
                  <input
                    type="text"
                    value={restaurantSearch}
                    onChange={e => setRestaurantSearch(e.target.value)}
                    placeholder="Search restaurants…"
                    className="w-full glass text-white rounded-2xl px-4 py-3 outline-none border border-white/10 focus:border-blue-500/50 transition-all placeholder-slate-600 text-sm"
                  />
                  {[
                    { mode: 'chipotle',    emoji: '🌯', name: 'Chipotle Mexican Grill',  desc: 'Build your bowl, burrito, or tacos step by step' },
                    { mode: 'subway',      emoji: '🥖', name: 'Subway',                  desc: '6" sub, footlong, wrap, or protein bowl' },
                    { mode: 'dominos',     emoji: '🍕', name: "Domino's Pizza",           desc: 'Build your own or choose a specialty pizza' },
                    { mode: 'cookout',     emoji: '🔥', name: 'Cook Out',                 desc: 'Burgers, chicken, hot dogs, sides & milkshakes' },
                    { mode: 'mcdonalds',   emoji: '🍟', name: "McDonald's",               desc: 'Burgers, chicken, breakfast, sides & shakes' },
                    { mode: 'wendys',      emoji: '🍔', name: "Wendy's",                  desc: "Dave's burgers, chicken, Frosty & chili" },
                    { mode: 'whataburger', emoji: '🧡', name: 'Whataburger',              desc: 'Burgers, chicken strips, breakfast & shakes' },
                    { mode: 'rallys',      emoji: '🏁', name: "Rally's / Checkers",       desc: 'Big Buford, loaded fries & milkshakes' },
                    { mode: 'chickfila',   emoji: '🐔', name: 'Chick-fil-A',              desc: 'Sandwiches, nuggets, grilled chicken & shakes' },
                    { mode: 'bostons',     emoji: '🐟', name: "Boston's Fish Supreme",    desc: 'Fish, shrimp, wings & Cajun fries' },
                    { mode: 'longhorn',    emoji: '🤠', name: 'LongHorn Steakhouse',      desc: 'Steaks, chicken, seafood, soups & salads' },
                    { mode: 'mcalisters',  emoji: '🥙', name: "McAlister's Deli",         desc: 'Sandwiches, spuds, soups & salads' },
                    { mode: 'brents',      emoji: '🧁', name: "Brent's Drugs",            desc: 'Classic diner — burgers, shakes & soda fountain' },
                    { mode: 'pigandpint',  emoji: '🐷', name: "The Pig & Pint",            desc: 'Award-winning BBQ — ribs, brisket, pulled pork & tacos' },
                    { mode: 'wingstop',   emoji: '🍗', name: 'Wingstop',                  desc: 'Classic & boneless wings, tenders, sandwiches & loaded fries' },
                    { mode: 'canes',      emoji: '🐓', name: "Raising Cane's",             desc: 'Chicken fingers, crinkle fries, Texas toast & Cane\'s sauce' },
                    { mode: 'wafflehouse', emoji: '🧇', name: 'Waffle House',              desc: 'Waffles, hashbrowns, eggs, biscuits, burgers & dinners' },
                    { mode: 'zaxbys',    emoji: '🔥', name: "Zaxby's",                    desc: 'Chicken fingers, wings, zalads & sandwiches' },
                  ]
                    .filter(r => r.name.toLowerCase().includes(restaurantSearch.toLowerCase()) || r.desc.toLowerCase().includes(restaurantSearch.toLowerCase()))
                    .map(r => (
                      <button
                        key={r.mode}
                        onClick={() => { setMode(r.mode as typeof mode); setRestaurantSearch('') }}
                        className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all"
                      >
                        <span className="text-3xl">{r.emoji}</span>
                        <div className="text-left">
                          <p className="font-bold text-white">{r.name}</p>
                          <p className="text-xs text-slate-400">{r.desc}</p>
                        </div>
                      </button>
                    ))
                  }
                </div>
              ) : (mode as string) === 'chipotle' ? (
                <ChipotleMealBuilder onAdd={addRestaurantMeal} onClose={resetModal} />
              ) : (mode as string) === 'subway' ? (
                <SubwayMealBuilder onAdd={addRestaurantMeal} onClose={resetModal} />
              ) : (mode as string) === 'dominos' ? (
                <DominosMealBuilder onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'cookout' ? (
                <CookOutMealBuilder onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'mcdonalds' ? (
                <FastFoodMealBuilder restaurantName="McDonald's" menu={MCDONALDS_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'wendys' ? (
                <FastFoodMealBuilder restaurantName="Wendy's" menu={WENDYS_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'whataburger' ? (
                <FastFoodMealBuilder restaurantName="Whataburger" menu={WHATABURGER_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'rallys' ? (
                <FastFoodMealBuilder restaurantName="Rally's" menu={RALLYS_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'chickfila' ? (
                <FastFoodMealBuilder restaurantName="Chick-fil-A" menu={CHICKFILA_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'bostons' ? (
                <FastFoodMealBuilder restaurantName="Boston's Fish Supreme" menu={BOSTONS_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'longhorn' ? (
                <FastFoodMealBuilder restaurantName="LongHorn Steakhouse" menu={LONGHORN_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'mcalisters' ? (
                <FastFoodMealBuilder restaurantName="McAlister's Deli" menu={MCALISTERS_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'brents' ? (
                <FastFoodMealBuilder restaurantName="Brent's Drugs" menu={BRENTS_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'pigandpint' ? (
                <FastFoodMealBuilder restaurantName="The Pig & Pint" menu={PIGANDPINT_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'wingstop' ? (
                <FastFoodMealBuilder restaurantName="Wingstop" menu={WINGSTOP_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'canes' ? (
                <FastFoodMealBuilder restaurantName="Raising Cane's" menu={CANES_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'wafflehouse' ? (
                <FastFoodMealBuilder restaurantName="Waffle House" menu={WAFFLEHOUSE_MENU} onAdd={addRestaurantMeal} />
              ) : (mode as string) === 'zaxbys' ? (
                <FastFoodMealBuilder restaurantName="Zaxby's" menu={ZAXBYS_MENU} onAdd={addRestaurantMeal} />
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
                      ...(profile.role === 'coach' ? [{ key: 'fiber', label: 'Fiber (g)' }] : []),
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

      {/* Edit Goals Modal — coaches only */}
      {showEditGoals && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end" onClick={e => e.target === e.currentTarget && setShowEditGoals(false)}>
          <div className="w-full rounded-t-3xl p-5 space-y-4 animate-slide-up" style={{ background: '#0d1433', border: '1px solid rgba(59,130,246,0.2)', borderBottom: 'none' }}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl">🎯 My Nutrition Goals</h3>
              <button onClick={() => setShowEditGoals(false)} className="glass rounded-xl p-2 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Daily Calories</label>
                <input
                  type="number" min="1000" max="6000"
                  value={goalsForm.calories}
                  onChange={e => setGoalsForm(p => ({ ...p, calories: e.target.value }))}
                  className="w-full glass border border-white/10 text-white rounded-xl px-3 py-3 outline-none focus:border-blue-500/50 text-center font-bold text-lg"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Protein (g)</label>
                <input
                  type="number" min="50" max="400"
                  value={goalsForm.protein}
                  onChange={e => setGoalsForm(p => ({ ...p, protein: e.target.value }))}
                  className="w-full glass border border-white/10 text-white rounded-xl px-3 py-3 outline-none focus:border-blue-500/50 text-center font-bold text-lg"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Goal Weight (lbs)</label>
              <input
                type="number" min="100" max="400" step="0.1"
                value={goalsForm.goal_weight}
                onChange={e => setGoalsForm(p => ({ ...p, goal_weight: e.target.value }))}
                placeholder="e.g. 185"
                className="w-full glass border border-white/10 text-white rounded-xl px-3 py-3 outline-none focus:border-blue-500/50 text-center font-bold text-lg placeholder-slate-600"
              />
            </div>
            <button
              onClick={async () => {
                if (!goalsForm.calories || !goalsForm.protein) return
                setSavingGoals(true)
                await fetch('/api/targets', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ calories: goalsForm.calories, protein: goalsForm.protein, goal_weight: goalsForm.goal_weight || null }),
                })
                setSavingGoals(false)
                setShowEditGoals(false)
              }}
              disabled={savingGoals || !goalsForm.calories || !goalsForm.protein}
              className="w-full py-3.5 rounded-2xl btn-blue disabled:opacity-40 text-white font-bold"
            >
              {savingGoals ? 'Saving…' : 'Save Goals ✓'}
            </button>
            <p className="text-xs text-slate-600 text-center">Changes take effect on your next page load</p>
          </div>
        </div>
      )}

      {/* Nutrition Handbook Modal */}
      {showHandbook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-end" onClick={e => e.target === e.currentTarget && setShowHandbook(false)}>
          <div className="w-full rounded-t-3xl flex flex-col animate-slide-up" style={{ background: '#0d1433', border: '1px solid rgba(59,130,246,0.2)', borderBottom: 'none', maxHeight: '92dvh' }}>
            <div className="px-5 pt-5 pb-3 shrink-0">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {handbookSection && (
                    <button onClick={() => setHandbookSection(null)} className="text-blue-400 hover:text-blue-300 transition-colors">
                      <ChevronDown size={18} className="rotate-90" />
                    </button>
                  )}
                  <h3 className="font-black text-xl text-white flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-400" />
                    {handbookSection ?? 'Nutrition Handbook'}
                  </h3>
                </div>
                <button onClick={() => { setShowHandbook(false); setHandbookSection(null) }} className="glass rounded-xl p-2 text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              {!handbookSection && <p className="text-xs text-slate-500 mt-1">Tap a topic to learn more</p>}
            </div>

            <div className="overflow-y-auto px-5 pb-8 flex-1">
              {!handbookSection ? (
                <div className="space-y-3 mt-2">
                  {[
                    { id: 'macros', emoji: '⚡', title: 'Macros & Calories', sub: 'Fuel, build, and recover' },
                    { id: 'weight', emoji: '🎯', title: 'Weight Goals', sub: 'Gain, loss, and maintenance' },
                    { id: 'hydration', emoji: '💧', title: 'Hydration', sub: 'The most overlooked edge' },
                    { id: 'sleep', emoji: '😴', title: 'Sleep & Recovery', sub: 'When growth actually happens' },
                    { id: 'fiber', emoji: '🥦', title: 'Fiber & Gut Health', sub: 'Absorb what you eat' },
                    { id: 'supplements', emoji: '💊', title: 'Supplements', sub: 'What you\'re taking and why' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setHandbookSection(s.id)}
                      className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all"
                    >
                      <span className="text-3xl w-10 text-center">{s.emoji}</span>
                      <div className="text-left flex-1">
                        <p className="font-bold text-white">{s.title}</p>
                        <p className="text-xs text-slate-400">{s.sub}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </button>
                  ))}
                </div>
              ) : handbookSection === 'macros' ? (
                <div className="space-y-4 mt-2">
                  <div className="glass-blue rounded-2xl p-4">
                    <p className="text-sm text-slate-300 leading-relaxed">Football is a power and collision sport. Your body needs the right fuel mix to hit hard, run routes, and still recover for tomorrow's practice. That fuel comes down to three macronutrients — and calories are how we measure all of it.</p>
                  </div>
                  {[
                    {
                      color: '#3b82f6', label: 'Calories', emoji: '🔥',
                      headline: 'Your total energy budget',
                      body: 'Every movement you make burns calories — sprinting, lifting, even thinking. Eat too few and your body starts burning muscle for fuel. Eat enough and you train harder, recover faster, and stay on the field.',
                      tip: 'Hitting your calorie target is the single most impactful thing you can do nutritionally.',
                    },
                    {
                      color: '#60a5fa', label: 'Protein', emoji: '💪',
                      headline: 'The building block of muscle',
                      body: 'Every time you lift or practice, you create tiny tears in muscle fibers. Protein repairs those tears and builds them back bigger and stronger. Aim for 0.7–1g per pound of bodyweight every day — spread across meals, not just post-workout.',
                      tip: 'If you only hit one macro, make it protein. Everything else is secondary.',
                    },
                    {
                      color: '#94a3b8', label: 'Carbs', emoji: '⚡',
                      headline: 'Your primary performance fuel',
                      body: 'Carbs are stored as glycogen in your muscles and liver — that\'s what powers your sprints, cuts, and explosive plays. Low carbs = slow feet and cloudy thinking. High carbs = sustained energy through two-a-days.',
                      tip: 'Eat carbs before practice and games. Save the lower-carb meals for rest days.',
                    },
                    {
                      color: '#facc15', label: 'Fat', emoji: '🛡️',
                      headline: 'Hormones, joints, and long-burn energy',
                      body: 'Fat is essential for producing testosterone and other hormones that drive muscle growth. It also cushions joints — important for a contact sport. Don\'t fear fat; just choose quality sources like eggs, avocado, and nuts.',
                      tip: 'Fat is slow-digesting. Avoid heavy fat meals right before practice.',
                    },
                  ].map(m => (
                    <div key={m.label} className="glass rounded-2xl p-4 border border-white/5" style={{ borderLeft: `3px solid ${m.color}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{m.emoji}</span>
                        <p className="font-black text-white">{m.label}</p>
                        <span className="text-xs text-slate-500 ml-1">— {m.headline}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed mb-3">{m.body}</p>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                        <p className="text-xs text-blue-300"><span className="font-bold">Key takeaway:</span> {m.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : handbookSection === 'weight' ? (
                <div className="space-y-4 mt-2">
                  <div className="glass-blue rounded-2xl p-4">
                    <p className="text-sm text-slate-300 leading-relaxed">Your coach has set a weight goal for you. Here\'s exactly what that means and how nutrition makes it happen.</p>
                  </div>
                  {[
                    {
                      emoji: '📈', title: 'Gaining Weight (Building Mass)',
                      color: '#22c55e',
                      body: 'To gain lean mass, you need a calorie surplus — eating slightly more than you burn. The goal is to add muscle, not just fat, so protein intake is critical. Aim to gain 0.5–1 lb per week. Faster than that and most of the gain is fat.',
                      bullets: ['Hit your full calorie target every day — don\'t leave calories on the table', 'Protein at every meal — eggs, chicken, beef, Greek yogurt', 'Carbs around practice — oatmeal before, rice or pasta after', 'Don\'t skip breakfast — it\'s hardest to hit calories if you start behind'],
                    },
                    {
                      emoji: '📉', title: 'Losing Weight (Cutting Fat)',
                      color: '#f87171',
                      body: 'Losing weight while keeping your strength means eating in a modest deficit — but never starving. Crash dieting destroys muscle and tanks your performance. The floor for active athletes is around 700 calories minimum per day; below that you\'re breaking down muscle.',
                      bullets: ['Keep protein high — it protects muscle when you\'re in a deficit', 'Cut calories from fat and refined carbs first, not protein', 'Eat filling, high-fiber foods to stay satisfied on fewer calories', 'Never skip a pre-practice meal — you\'ll run out of gas mid-session'],
                    },
                    {
                      emoji: '⚖️', title: 'Maintaining Weight',
                      color: '#60a5fa',
                      body: 'Maintenance means eating at roughly what you burn. For most athletes, this still means eating a lot — your body burns significant calories through practice, lifting, and daily movement. The goal is body recomposition: slowly trading fat for muscle.',
                      bullets: ['Focus on quality over quantity — whole foods over processed', 'Stay consistent — big swings up and down disrupt your metabolism', 'Prioritize protein to slowly improve body composition over time', 'Track your intake; it\'s easy to accidentally under or overeat at maintenance'],
                    },
                  ].map(g => (
                    <div key={g.title} className="glass rounded-2xl p-4 border border-white/5" style={{ borderLeft: `3px solid ${g.color}` }}>
                      <p className="font-black text-white text-base mb-1">{g.emoji} {g.title}</p>
                      <p className="text-sm text-slate-300 leading-relaxed mb-3">{g.body}</p>
                      <ul className="space-y-1.5">
                        {g.bullets.map((b, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                            <span style={{ color: g.color }} className="mt-0.5 shrink-0">▸</span>{b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : handbookSection === 'hydration' ? (
                <div className="space-y-4 mt-2">
                  <div className="glass-blue rounded-2xl p-4">
                    <p className="text-sm text-slate-300 leading-relaxed">A 2% drop in body water causes a measurable drop in strength, speed, and decision-making. For a 200 lb lineman, that\'s just 4 lbs of sweat — less than one practice in Mississippi heat.</p>
                  </div>
                  {[
                    { emoji: '📏', title: 'How Much to Drink', body: 'Base target is half your bodyweight in ounces per day. Add 16–24 oz for every hour of practice or lifting. In summer heat, you can lose 2–3 liters per session through sweat alone.', example: '200 lb athlete → 100 oz baseline + 24 oz per practice hour' },
                    { emoji: '⏱️', title: 'When to Drink', body: 'Don\'t wait until you\'re thirsty — thirst means you\'re already behind. Sip consistently all day. Chug 16 oz first thing in the morning (you lose water overnight). Have 16 oz 30 min before practice, sip during, and 20 oz after.', example: 'Morning → Before practice → During → After → Dinner → Before bed' },
                    { emoji: '🧂', title: 'Electrolytes Matter', body: 'Water alone isn\'t enough if you\'re sweating heavily. You lose sodium, potassium, and magnesium in sweat — cramping is usually an electrolyte deficit, not just dehydration. Sports drinks or electrolyte tablets help on long practice days.', example: 'Signs you need electrolytes: muscle cramps, headache, fatigue that\'s not fixed by rest' },
                    { emoji: '🔍', title: 'Check Your Urine', body: 'The fastest hydration test: look at the color. Pale yellow = well hydrated. Dark yellow or amber = drink more, now. Clear = possibly over-hydrated (rare but real). Do this check every morning and after practice.', example: 'Target: pale lemonade color. Avoid: apple juice color going into a game.' },
                  ].map(h => (
                    <div key={h.title} className="glass rounded-2xl p-4 border border-white/5 border-l-2 border-l-blue-400">
                      <p className="font-black text-white mb-1">{h.emoji} {h.title}</p>
                      <p className="text-sm text-slate-300 leading-relaxed mb-2">{h.body}</p>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                        <p className="text-xs text-blue-300">{h.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : handbookSection === 'sleep' ? (
                <div className="space-y-4 mt-2">
                  <div className="glass-blue rounded-2xl p-4">
                    <p className="text-sm text-slate-300 leading-relaxed">You don\'t grow in the weight room. You grow while you sleep. Every rep you do creates the signal — sleep is when your body actually builds the muscle. Skipping sleep erases gains no matter how hard you train.</p>
                  </div>
                  {[
                    { emoji: '🕐', title: 'How Much Sleep You Need', body: 'High school and college athletes need 8–10 hours. Not 6. Not 7. Eight to ten. Studies on NBA and NFL players show performance drops measurably below 8 hours — slower sprint times, worse reaction speed, higher injury risk.', highlight: 'Target: 8–10 hours. Non-negotiable during the season.' },
                    { emoji: '🧬', title: 'What Happens While You Sleep', body: 'The first few hours of deep sleep trigger a surge of human growth hormone (HGH) — the most powerful muscle-building signal your body produces. Protein synthesis (turning the protein you ate into actual muscle) peaks during sleep. Cortisol (a stress hormone that breaks down muscle) drops to its lowest point.', highlight: 'Sleep is literally when your gains happen. No sleep = no gains from the food you ate.' },
                    { emoji: '🥛', title: 'Nutrition Before Bed', body: 'Eat a slow-digesting protein 30–60 minutes before bed. Cottage cheese, Greek yogurt, or a casein protein shake are ideal — they release amino acids slowly through the night to keep protein synthesis running while you sleep.', highlight: 'Casein protein or cottage cheese before bed = 8 hours of muscle-building fuel.' },
                    { emoji: '📵', title: 'Sleep Hygiene for Athletes', body: 'Phone screens suppress melatonin — the hormone that triggers sleep. Put your phone face-down 30 minutes before bed. Keep your room cold (65–68°F is ideal for sleep quality). Consistent bedtimes matter more than total hours — your body clock is a real thing.', highlight: 'Same bedtime every night > sleeping in on weekends. Consistency wins.' },
                  ].map(s => (
                    <div key={s.title} className="glass rounded-2xl p-4 border border-white/5 border-l-2 border-l-purple-400">
                      <p className="font-black text-white mb-1">{s.emoji} {s.title}</p>
                      <p className="text-sm text-slate-300 leading-relaxed mb-2">{s.body}</p>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
                        <p className="text-xs text-purple-300">{s.highlight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : handbookSection === 'fiber' ? (
                <div className="space-y-4 mt-2">
                  <div className="glass-blue rounded-2xl p-4">
                    <p className="text-sm text-slate-300 leading-relaxed">You can eat perfectly on paper and still not see results if your gut isn\'t absorbing nutrients properly. Fiber is what keeps your digestive system running so the protein and carbs you eat actually make it to your muscles.</p>
                  </div>
                  {[
                    { emoji: '🔬', title: 'What Fiber Actually Does', body: 'Fiber feeds the good bacteria in your gut (your microbiome). A healthy microbiome improves how efficiently you absorb protein, carbs, and vitamins. It also reduces inflammation — critical for athletes who are constantly breaking down and rebuilding tissue.', highlight: 'Better gut = better absorption = more results from every meal you eat.' },
                    { emoji: '📊', title: 'How Much You Need', body: 'Athletes should aim for 25–35g of fiber per day. Most people eating a typical diet get 10–15g. The gap is mostly from cutting out vegetables and whole grains in favor of easier fast food options.', highlight: 'Target: 25–35g/day. Check your fiber ring in this app to track it.' },
                    { emoji: '⚡', title: 'Fiber and Energy Levels', body: 'Soluble fiber slows the absorption of carbohydrates, which stabilizes your blood sugar. That means no energy crash mid-practice from spiking and dropping glucose. Steady fuel = steady performance.', highlight: 'High fiber carbs (oats, brown rice, beans) = sustained energy vs. white bread crashes.' },
                    { emoji: '🥗', title: 'Best Sources for Athletes', body: 'You don\'t need to overthink this. Add one or two of these to every meal: oats, brown rice, black beans, lentils, broccoli, spinach, apples, bananas, whole wheat bread. These also come loaded with vitamins and minerals that support performance.', highlight: 'Easiest win: add spinach to every protein shake and black beans to every rice meal.' },
                  ].map(f => (
                    <div key={f.title} className="glass rounded-2xl p-4 border border-white/5 border-l-2 border-l-green-400">
                      <p className="font-black text-white mb-1">{f.emoji} {f.title}</p>
                      <p className="text-sm text-slate-300 leading-relaxed mb-2">{f.body}</p>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                        <p className="text-xs text-green-300">{f.highlight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : handbookSection === 'supplements' ? (
                <div className="space-y-4 mt-2">
                  <div className="glass-blue rounded-2xl p-4">
                    <p className="text-sm text-slate-300 leading-relaxed">Supplements are exactly that — supplemental. They fill gaps in your nutrition and enhance what food already does. None of them work if your food and sleep are a mess. Get the basics right first, then supplements amplify the results.</p>
                  </div>
                  {[
                    {
                      emoji: '💪', title: 'Creatine Monohydrate', color: '#3b82f6',
                      body: 'The most researched supplement in sports science — thousands of studies, consistently proven to work. Creatine increases your muscles\' capacity to produce explosive energy (ATP). More ATP = more reps, heavier lifts, more powerful plays.',
                      howto: 'Take 3–5g daily, any time. You don\'t need to "load." It takes 2–4 weeks to saturate your muscles, then you notice the difference.',
                    },
                    {
                      emoji: '🥛', title: 'Protein Powder (Whey or Casein)', color: '#60a5fa',
                      body: 'Not magic — just a convenient way to hit your protein target when whole food isn\'t available. Whey is fast-absorbing and best post-workout. Casein is slow-absorbing and best before bed (keeps protein synthesis running overnight).',
                      howto: 'Use whey within 30–60 min after lifting. Use casein before bed. Don\'t rely on shakes over real food.',
                    },
                    {
                      emoji: '☀️', title: 'Vitamin D3', color: '#facc15',
                      body: 'Most athletes are deficient in Vitamin D, especially if you\'re inside a lot. Vitamin D regulates testosterone production, immune function, and bone density. Low Vitamin D = lower testosterone, slower recovery, higher injury risk.',
                      howto: 'Take 2,000–5,000 IU daily with a meal that has fat. Ask your doctor for a blood test to know your actual level.',
                    },
                    {
                      emoji: '🐟', title: 'Fish Oil (Omega-3s)', color: '#22c55e',
                      body: 'Fish oil reduces inflammation in joints and muscles — crucial for a collision sport where your body takes constant hits. It also supports brain function and heart health. Think of it as joint insurance for a sport that\'s hard on your body.',
                      howto: 'Take 2–3g of EPA+DHA daily (read the label, not just total fish oil). Take with food to avoid fishy aftertaste.',
                    },
                    {
                      emoji: '🍋', title: 'Electrolyte Supplements', color: '#f97316',
                      body: 'Sodium, potassium, and magnesium lost through sweat. Especially important in summer camps and two-a-days when you can sweat 2+ liters per session. Prevents cramping and supports nerve function (which affects coordination and reaction time).',
                      howto: 'Use on heavy practice days. Mix into your water bottle. Don\'t use sugary sports drinks as your primary hydration source.',
                    },
                  ].map(s => (
                    <div key={s.title} className="glass rounded-2xl p-4 border border-white/5" style={{ borderLeft: `3px solid ${s.color}` }}>
                      <p className="font-black text-white mb-1">{s.emoji} {s.title}</p>
                      <p className="text-sm text-slate-300 leading-relaxed mb-3">{s.body}</p>
                      <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <p className="text-xs text-slate-300"><span className="font-bold text-white">How to use:</span> {s.howto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
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
