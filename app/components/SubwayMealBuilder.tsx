'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

type Macros = { cal: number; protein: number; carbs: number; fat: number }
type SandwichOption = {
  name: string
  category: string
  sixInch: Macros
  footlong: Macros
  wrap?: Macros
  bowl?: Macros
}

type Format = '6inch' | 'footlong' | 'wrap' | 'bowl'

const SANDWICHES: SandwichOption[] = [
  // Cheesesteaks
  { name: 'Steak Philly', category: '🥩 Cheesesteaks',
    sixInch: { cal: 510, protein: 28, carbs: 43, fat: 25 },
    footlong: { cal: 1020, protein: 56, carbs: 86, fat: 50 },
    wrap: { cal: 710, protein: 46, carbs: 56, fat: 35 },
    bowl: { cal: 630, protein: 43, carbs: 14, fat: 46 } },
  { name: 'Chipotle Philly', category: '🥩 Cheesesteaks',
    sixInch: { cal: 490, protein: 30, carbs: 44, fat: 22 },
    footlong: { cal: 980, protein: 60, carbs: 88, fat: 44 },
    wrap: { cal: 700, protein: 47, carbs: 56, fat: 32 },
    bowl: { cal: 600, protein: 46, carbs: 16, fat: 41 } },
  { name: 'Cheesy Garlic Steak', category: '🥩 Cheesesteaks',
    sixInch: { cal: 510, protein: 26, carbs: 49, fat: 23 },
    footlong: { cal: 1020, protein: 52, carbs: 98, fat: 46 },
    wrap: { cal: 710, protein: 43, carbs: 62, fat: 33 },
    bowl: { cal: 630, protein: 39, carbs: 27, fat: 42 } },
  // Chicken
  { name: 'Grilled Chicken', category: '🍗 Chicken',
    sixInch: { cal: 510, protein: 31, carbs: 43, fat: 24 },
    footlong: { cal: 1020, protein: 62, carbs: 86, fat: 48 },
    wrap: { cal: 680, protein: 48, carbs: 55, fat: 31 },
    bowl: { cal: 620, protein: 48, carbs: 12, fat: 44 } },
  { name: 'Chicken & Bacon Ranch', category: '🍗 Chicken',
    sixInch: { cal: 580, protein: 35, carbs: 44, fat: 29 },
    footlong: { cal: 1160, protein: 70, carbs: 88, fat: 58 },
    wrap: { cal: 830, protein: 56, carbs: 56, fat: 42 },
    bowl: { cal: 760, protein: 55, carbs: 14, fat: 55 } },
  { name: 'Spicy Nacho Chicken', category: '🍗 Chicken',
    sixInch: { cal: 440, protein: 24, carbs: 49, fat: 17 },
    footlong: { cal: 880, protein: 48, carbs: 98, fat: 34 },
    wrap: { cal: 610, protein: 40, carbs: 59, fat: 24 },
    bowl: { cal: 510, protein: 35, carbs: 26, fat: 30 } },
  { name: 'Honey Mustard BBQ Chicken', category: '🍗 Chicken',
    sixInch: { cal: 510, protein: 30, carbs: 53, fat: 20 },
    footlong: { cal: 1020, protein: 60, carbs: 106, fat: 40 },
    wrap: { cal: 680, protein: 46, carbs: 63, fat: 27 },
    bowl: { cal: 620, protein: 45, carbs: 31, fat: 36 } },
  { name: 'Sweet Onion Teriyaki Chicken', category: '🍗 Chicken',
    sixInch: { cal: 430, protein: 29, carbs: 55, fat: 11 },
    footlong: { cal: 860, protein: 58, carbs: 110, fat: 22 },
    wrap: { cal: 620, protein: 45, carbs: 76, fat: 16 },
    bowl: { cal: 470, protein: 42, carbs: 41, fat: 18 } },
  // Italians
  { name: 'B.M.T.', category: '🇮🇹 Italians',
    sixInch: { cal: 610, protein: 27, carbs: 44, fat: 36 },
    footlong: { cal: 1220, protein: 54, carbs: 88, fat: 72 },
    wrap: { cal: 810, protein: 27, carbs: 44, fat: 36 },
    bowl: { cal: 820, protein: 40, carbs: 14, fat: 68 } },
  { name: 'Spicy Italian', category: '🇮🇹 Italians',
    sixInch: { cal: 680, protein: 27, carbs: 44, fat: 44 },
    footlong: { cal: 1360, protein: 54, carbs: 88, fat: 88 },
    wrap: { cal: 1010, protein: 39, carbs: 57, fat: 69 },
    bowl: { cal: 960, protein: 39, carbs: 14, fat: 84 } },
  { name: '5 Meat Italian', category: '🇮🇹 Italians',
    sixInch: { cal: 680, protein: 40, carbs: 46, fat: 37 },
    footlong: { cal: 1360, protein: 80, carbs: 92, fat: 74 },
    wrap: { cal: 1000, protein: 66, carbs: 60, fat: 56 },
    bowl: { cal: 960, protein: 66, carbs: 17, fat: 70 } },
  { name: 'Meatball Marinara', category: '🇮🇹 Italians',
    sixInch: { cal: 570, protein: 27, carbs: 53, fat: 28 },
    footlong: { cal: 1140, protein: 54, carbs: 106, fat: 56 },
    wrap: { cal: 890, protein: 40, carbs: 76, fat: 49 },
    bowl: { cal: 880, protein: 42, carbs: 37, fat: 65 } },
  // Deli Classics
  { name: 'Oven-Roasted Turkey', category: '🥪 Deli Classics',
    sixInch: { cal: 480, protein: 26, carbs: 42, fat: 23 },
    footlong: { cal: 960, protein: 52, carbs: 84, fat: 46 },
    wrap: { cal: 610, protein: 38, carbs: 53, fat: 27 },
    bowl: { cal: 560, protein: 38, carbs: 10, fat: 42 } },
  { name: 'Black Forest Ham', category: '🥪 Deli Classics',
    sixInch: { cal: 490, protein: 25, carbs: 44, fat: 23 },
    footlong: { cal: 980, protein: 50, carbs: 88, fat: 46 },
    wrap: { cal: 630, protein: 36, carbs: 57, fat: 28 },
    bowl: { cal: 580, protein: 36, carbs: 14, fat: 43 } },
  { name: 'Roast Beef', category: '🥪 Deli Classics',
    sixInch: { cal: 500, protein: 31, carbs: 44, fat: 23 },
    footlong: { cal: 1000, protein: 62, carbs: 88, fat: 46 },
    wrap: { cal: 660, protein: 48, carbs: 57, fat: 27 },
    bowl: { cal: 610, protein: 48, carbs: 14, fat: 42 } },
  { name: 'Tuna', category: '🥪 Deli Classics',
    sixInch: { cal: 570, protein: 27, carbs: 42, fat: 33 },
    footlong: { cal: 1140, protein: 54, carbs: 84, fat: 66 },
    wrap: { cal: 900, protein: 41, carbs: 52, fat: 59 },
    bowl: { cal: 750, protein: 41, carbs: 9, fat: 62 } },
  { name: 'Veggie Delite', category: '🥦 Veggie',
    sixInch: { cal: 320, protein: 17, carbs: 41, fat: 10 },
    footlong: { cal: 640, protein: 34, carbs: 82, fat: 20 },
    wrap: { cal: 400, protein: 17, carbs: 53, fat: 13 },
    bowl: { cal: 150, protein: 10, carbs: 10, fat: 9 } },
  // Clubs
  { name: 'All American Club', category: '🏅 Clubs',
    sixInch: { cal: 540, protein: 27, carbs: 45, fat: 28 },
    footlong: { cal: 1080, protein: 54, carbs: 90, fat: 56 },
    wrap: { cal: 760, protein: 44, carbs: 57, fat: 39 },
    bowl: { cal: 690, protein: 40, carbs: 15, fat: 53 } },
  { name: 'Subway Club', category: '🏅 Clubs',
    sixInch: { cal: 500, protein: 31, carbs: 43, fat: 24 },
    footlong: { cal: 1000, protein: 62, carbs: 86, fat: 48 },
    wrap: { cal: 690, protein: 48, carbs: 58, fat: 30 },
    bowl: { cal: 410, protein: 44, carbs: 16, fat: 21 } },
  // Local Favorites
  { name: 'Big Hot Pastrami', category: '⭐ Local Favorites',
    sixInch: { cal: 550, protein: 30, carbs: 44, fat: 30 },
    footlong: { cal: 1100, protein: 60, carbs: 88, fat: 60 },
    wrap: { cal: 890, protein: 49, carbs: 56, fat: 54 },
    bowl: { cal: 740, protein: 46, carbs: 17, fat: 57 } },
  { name: 'B.L.T.', category: '⭐ Local Favorites',
    sixInch: { cal: 480, protein: 18, carbs: 42, fat: 26 },
    footlong: { cal: 960, protein: 36, carbs: 84, fat: 52 },
    wrap: { cal: 710, protein: 30, carbs: 53, fat: 42 },
    bowl: { cal: 560, protein: 22, carbs: 10, fat: 49 } },
  { name: 'Buffalo Chicken', category: '⭐ Local Favorites',
    sixInch: { cal: 510, protein: 31, carbs: 55, fat: 19 },
    footlong: { cal: 1020, protein: 62, carbs: 110, fat: 38 },
    wrap: { cal: 0, protein: 0, carbs: 0, fat: 0 }, // not available
    bowl: { cal: 0, protein: 0, carbs: 0, fat: 0 } },
  // Fresh Fit
  { name: 'Grilled Chicken & Smashed Avocado', category: '🥗 Fresh Fit',
    sixInch: { cal: 470, protein: 35, carbs: 44, fat: 19 },
    footlong: { cal: 940, protein: 70, carbs: 88, fat: 38 },
    wrap: { cal: 0, protein: 0, carbs: 0, fat: 0 },
    bowl: { cal: 0, protein: 0, carbs: 0, fat: 0 } },
  { name: 'Ham & Turkey Stacker', category: '🥗 Fresh Fit',
    sixInch: { cal: 290, protein: 20, carbs: 42, fat: 5 },
    footlong: { cal: 580, protein: 40, carbs: 84, fat: 10 },
    wrap: { cal: 0, protein: 0, carbs: 0, fat: 0 },
    bowl: { cal: 0, protein: 0, carbs: 0, fat: 0 } },
  { name: 'Turkey & Ranch Delite', category: '🥗 Fresh Fit',
    sixInch: { cal: 380, protein: 26, carbs: 41, fat: 13 },
    footlong: { cal: 760, protein: 52, carbs: 82, fat: 26 },
    wrap: { cal: 0, protein: 0, carbs: 0, fat: 0 },
    bowl: { cal: 0, protein: 0, carbs: 0, fat: 0 } },
  { name: 'Seasoned Steak & Smashed Avocado', category: '🥗 Fresh Fit',
    sixInch: { cal: 460, protein: 35, carbs: 45, fat: 16 },
    footlong: { cal: 920, protein: 70, carbs: 90, fat: 32 },
    wrap: { cal: 0, protein: 0, carbs: 0, fat: 0 },
    bowl: { cal: 0, protein: 0, carbs: 0, fat: 0 } },
]

const EXTRAS: { name: string; cal: number; protein: number; carbs: number; fat: number }[] = [
  { name: 'Extra Cheese', cal: 90, protein: 5, carbs: 1, fat: 8 },
  { name: 'Avocado (sliced)', cal: 45, protein: 1, carbs: 2, fat: 4 },
  { name: 'Smashed Avocado', cal: 70, protein: 1, carbs: 3, fat: 6 },
  { name: 'Bacon (2 strips)', cal: 80, protein: 5, carbs: 1, fat: 6 },
  { name: 'Mayonnaise', cal: 100, protein: 0, carbs: 0, fat: 11 },
  { name: 'Peppercorn Ranch', cal: 80, protein: 0, carbs: 1, fat: 8 },
  { name: 'Baja Chipotle Sauce', cal: 70, protein: 0, carbs: 1, fat: 7 },
  { name: 'Honey Mustard', cal: 60, protein: 0, carbs: 3, fat: 5 },
  { name: 'Chips (side)', cal: 210, protein: 3, carbs: 30, fat: 10 },
  { name: 'Cookie', cal: 210, protein: 2, carbs: 30, fat: 10 },
]

const FORMAT_LABELS: Record<Format, string> = {
  '6inch': '6" Sub',
  footlong: 'Footlong',
  wrap: 'Wrap',
  bowl: 'Protein Bowl',
}

const CATEGORIES = [...new Set(SANDWICHES.map(s => s.category))]

function getMacros(sandwich: SandwichOption, format: Format): Macros {
  if (format === '6inch') return sandwich.sixInch
  if (format === 'footlong') return sandwich.footlong
  if (format === 'wrap') return sandwich.wrap ?? { cal: 0, protein: 0, carbs: 0, fat: 0 }
  return sandwich.bowl ?? { cal: 0, protein: 0, carbs: 0, fat: 0 }
}

export default function SubwayMealBuilder({ onAdd, onClose }: {
  onAdd: (name: string, cal: number, protein: number, carbs: number, fat: number) => void
  onClose: () => void
}) {
  const [step, setStep] = useState(0)
  const [format, setFormat] = useState<Format>('6inch')
  const [category, setCategory] = useState<string | null>(null)
  const [sandwich, setSandwich] = useState<SandwichOption | null>(null)
  const [extras, setExtras] = useState<Set<string>>(new Set())

  const baseMacros: Macros = sandwich ? getMacros(sandwich, format) : { cal: 0, protein: 0, carbs: 0, fat: 0 }
  const selectedExtras = EXTRAS.filter(e => extras.has(e.name))
  const totalMacros = selectedExtras.reduce(
    (acc, e) => ({ cal: acc.cal + e.cal, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat }),
    baseMacros
  )

  function toggleExtra(name: string) {
    setExtras(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function handleAdd() {
    const formatLabel = FORMAT_LABELS[format]
    const name = `Subway ${formatLabel} - ${sandwich?.name}`
    onAdd(name, totalMacros.cal, totalMacros.protein, totalMacros.carbs, totalMacros.fat)
  }

  const filteredSandwiches = category ? SANDWICHES.filter(s => s.category === category) : []

  const STEPS = ['Size', 'Sandwich', 'Extras']

  return (
    <div>
      {/* Running totals */}
      <div className="glass-blue rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">
              {sandwich ? `${FORMAT_LABELS[format]} - ${sandwich.name}` : 'Your Meal'}
            </p>
            <p className="text-2xl font-black text-white">
              {totalMacros.cal} <span className="text-sm font-bold text-slate-400">cal</span>
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-lg font-black text-white">{Math.round(totalMacros.protein)}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-400">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-white">{Math.round(totalMacros.carbs)}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-white">{Math.round(totalMacros.fat)}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Fat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => i <= step && setStep(i)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${step === i ? 'btn-blue text-white' : i < step ? 'glass text-green-400' : 'glass text-slate-600'}`}
          >
            {i < step ? '✓ ' : ''}{s}
          </button>
        ))}
      </div>

      {/* Step 0: Size */}
      {step === 0 && (
        <div className="space-y-2">
          {(Object.entries(FORMAT_LABELS) as [Format, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setFormat(key); setStep(1) }}
              className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between border transition-all ${format === key ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
            >
              <div className="text-left">
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-slate-400">
                  {key === '6inch' ? 'Standard half sandwich' :
                   key === 'footlong' ? 'Full 12" sandwich — double macros' :
                   key === 'wrap' ? '12" flour wrap with footlong meat' :
                   'No bread — footlong meat + veggies'}
                </p>
              </div>
              {format === key && <Check size={16} className="text-blue-400" />}
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Category then Sandwich */}
      {step === 1 && (
        <div>
          {!category ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Select Category</p>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="w-full px-4 py-3 rounded-2xl glass border border-white/10 hover:border-white/20 text-left transition-all"
                >
                  <p className="text-sm font-bold text-white">{cat}</p>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setCategory(null)}
                className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 mb-3"
              >
                ← {category}
              </button>
              <div className="space-y-2">
                {filteredSandwiches.map(s => {
                  const m = getMacros(s, format)
                  const unavailable = m.cal === 0
                  return (
                    <button
                      key={s.name}
                      disabled={unavailable}
                      onClick={() => { setSandwich(s); setStep(2) }}
                      className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between border transition-all ${unavailable ? 'opacity-30 cursor-not-allowed glass border-white/5' : sandwich?.name === s.name ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{s.name}</p>
                        {!unavailable && (
                          <p className="text-xs text-slate-400">{m.cal} cal · {m.protein}g P · {m.carbs}g C · {m.fat}g F</p>
                        )}
                        {unavailable && <p className="text-xs text-slate-600">Not available in this format</p>}
                      </div>
                      {sandwich?.name === s.name && <Check size={16} className="text-blue-400 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Extras */}
      {step === 2 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Add Extras (optional)</p>
          {EXTRAS.map(e => (
            <button
              key={e.name}
              onClick={() => toggleExtra(e.name)}
              className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between border transition-all ${extras.has(e.name) ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
            >
              <div className="text-left">
                <p className="text-sm font-bold text-white">{e.name}</p>
                <p className="text-xs text-slate-400">+{e.cal} cal · +{e.protein}g P · +{e.carbs}g C · +{e.fat}g F</p>
              </div>
              {extras.has(e.name) && <Check size={16} className="text-blue-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {/* Nav */}
      <div className="flex gap-2 mt-4">
        {step > 0 && (
          <button
            onClick={() => { if (step === 1 && category) { setCategory(null) } else { setStep(s => s - 1) } }}
            className="px-4 py-3 rounded-2xl glass text-slate-300 font-bold text-sm"
          >
            ← Back
          </button>
        )}
        {step === 2 && sandwich && (
          <button onClick={handleAdd} className="flex-1 py-3 rounded-2xl btn-blue text-white font-bold text-sm">
            Add to Log ✓
          </button>
        )}
        {step === 2 && !sandwich && (
          <button disabled className="flex-1 py-3 rounded-2xl glass text-slate-600 font-bold text-sm cursor-not-allowed">
            Select a sandwich first
          </button>
        )}
      </div>
    </div>
  )
}
