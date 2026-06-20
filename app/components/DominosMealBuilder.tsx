'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

type Macros = { cal: number; protein: number; carbs: number; fat: number }

// Plain cheese base per slice, keyed by sizeKey + crustKey
const CHEESE_BASE: Record<string, Record<string, Macros & { slices: number }>> = {
  small: {
    'Hand Tossed':   { cal: 155, protein: 8,  carbs: 22, fat: 7,  slices: 6 },
    'Crunchy Thin':  { cal: 90,  protein: 5,  carbs: 8,  fat: 4,  slices: 8 },
  },
  medium: {
    'Hand Tossed':   { cal: 180, protein: 11, carbs: 23, fat: 6,  slices: 8 },
    'Pan':           { cal: 290, protein: 14, carbs: 27, fat: 13, slices: 8 },
    'Crunchy Thin':  { cal: 133, protein: 8,  carbs: 12, fat: 6,  slices: 8 },
    'New York Style':{ cal: 190, protein: 14, carbs: 23, fat: 8,  slices: 6 },
  },
  large: {
    'Hand Tossed':   { cal: 210, protein: 13, carbs: 32, fat: 8,  slices: 8 },
    'New York Style':{ cal: 230, protein: 16, carbs: 32, fat: 9,  slices: 6 },
  },
  xlarge: {
    'Hand Tossed':   { cal: 250, protein: 15, carbs: 42, fat: 10, slices: 8 },
    'New York Style':{ cal: 280, protein: 17, carbs: 43, fat: 12, slices: 6 },
  },
}

const SIZE_LABELS: Record<string, string> = {
  small:  '10" Small',
  medium: '12" Medium',
  large:  '14" Large',
  xlarge: '16" XL',
}

// Per-slice incremental macros for individual toppings
type Topping = { name: string; category: string; macros: Macros }
const TOPPINGS: Topping[] = [
  // Meats
  { name: 'Pepperoni',          category: 'Meats',   macros: { cal: 30, protein: 1, carbs: 0, fat: 2 } },
  { name: 'Italian Sausage',    category: 'Meats',   macros: { cal: 50, protein: 2, carbs: 1, fat: 4 } },
  { name: 'Bacon',              category: 'Meats',   macros: { cal: 35, protein: 2, carbs: 0, fat: 3 } },
  { name: 'Ham',                category: 'Meats',   macros: { cal: 15, protein: 2, carbs: 0, fat: 1 } },
  { name: 'Beef',               category: 'Meats',   macros: { cal: 40, protein: 2, carbs: 0, fat: 3 } },
  { name: 'Grilled Chicken',    category: 'Meats',   macros: { cal: 25, protein: 3, carbs: 0, fat: 1 } },
  { name: 'Philly Steak',       category: 'Meats',   macros: { cal: 35, protein: 3, carbs: 0, fat: 2 } },
  { name: 'Salami',             category: 'Meats',   macros: { cal: 30, protein: 1, carbs: 0, fat: 2 } },
  { name: 'Anchovies',          category: 'Meats',   macros: { cal: 10, protein: 2, carbs: 0, fat: 0 } },
  // Cheeses
  { name: 'Extra Cheese',       category: 'Cheeses', macros: { cal: 45, protein: 3, carbs: 0, fat: 3 } },
  { name: 'Feta Cheese',        category: 'Cheeses', macros: { cal: 20, protein: 1, carbs: 0, fat: 2 } },
  { name: 'Cheddar Cheese',     category: 'Cheeses', macros: { cal: 30, protein: 2, carbs: 0, fat: 2 } },
  { name: 'Provolone Cheese',   category: 'Cheeses', macros: { cal: 25, protein: 2, carbs: 0, fat: 2 } },
  // Veggies
  { name: 'Mushrooms',          category: 'Veggies', macros: { cal: 5,  protein: 0, carbs: 1, fat: 0 } },
  { name: 'Onions',             category: 'Veggies', macros: { cal: 5,  protein: 0, carbs: 1, fat: 0 } },
  { name: 'Green Peppers',      category: 'Veggies', macros: { cal: 5,  protein: 0, carbs: 1, fat: 0 } },
  { name: 'Black Olives',       category: 'Veggies', macros: { cal: 15, protein: 0, carbs: 0, fat: 1 } },
  { name: 'Jalapeños',          category: 'Veggies', macros: { cal: 3,  protein: 0, carbs: 1, fat: 0 } },
  { name: 'Banana Peppers',     category: 'Veggies', macros: { cal: 3,  protein: 0, carbs: 1, fat: 0 } },
  { name: 'Tomatoes',           category: 'Veggies', macros: { cal: 5,  protein: 0, carbs: 1, fat: 0 } },
  { name: 'Spinach',            category: 'Veggies', macros: { cal: 3,  protein: 0, carbs: 0, fat: 0 } },
  { name: 'Roasted Red Peppers',category: 'Veggies', macros: { cal: 5,  protein: 0, carbs: 1, fat: 0 } },
  { name: 'Pineapple',          category: 'Veggies', macros: { cal: 10, protein: 0, carbs: 2, fat: 0 } },
  { name: 'Diced Tomatoes',     category: 'Veggies', macros: { cal: 5,  protein: 0, carbs: 1, fat: 0 } },
  // Sauces
  { name: 'BBQ Drizzle',        category: 'Sauces',  macros: { cal: 15, protein: 0, carbs: 4, fat: 0 } },
  { name: 'Ranch Drizzle',      category: 'Sauces',  macros: { cal: 20, protein: 0, carbs: 0, fat: 2 } },
  { name: 'Hot Sauce Drizzle',  category: 'Sauces',  macros: { cal: 5,  protein: 0, carbs: 1, fat: 0 } },
]

const TOPPING_CATEGORIES = ['Meats', 'Cheeses', 'Veggies', 'Sauces']

const SPECIALTY: Record<string, { label: string; sizes: Record<string, Macros & { portion: string }> }> = {
  honolulu:     { label: 'Honolulu Hawaiian',         sizes: { 'Small': { cal: 350, protein: 15, carbs: 39, fat: 15, portion: '1/4 pizza' }, 'Medium': { cal: 380, protein: 17, carbs: 40, fat: 17, portion: '1/5 pizza' }, 'Large': { cal: 330, protein: 14, carbs: 36, fat: 14, portion: '1/8 pizza' }, 'XL': { cal: 430, protein: 19, carbs: 47, fat: 18, portion: '1/8 pizza' } } },
  memphis:      { label: 'Memphis BBQ Chicken',       sizes: { 'Small': { cal: 360, protein: 15, carbs: 41, fat: 14, portion: '1/4 pizza' }, 'Medium': { cal: 410, protein: 18, carbs: 44, fat: 17, portion: '1/5 pizza' }, 'Large': { cal: 350, protein: 15, carbs: 39, fat: 14, portion: '1/8 pizza' }, 'XL': { cal: 460, protein: 20, carbs: 51, fat: 18, portion: '1/8 pizza' } } },
  extravaganzza:{ label: 'ExtravaganZZa',             sizes: { 'Small': { cal: 400, protein: 16, carbs: 38, fat: 19, portion: '1/4 pizza' }, 'Medium': { cal: 440, protein: 18, carbs: 40, fat: 22, portion: '1/5 pizza' }, 'Large': { cal: 380, protein: 16, carbs: 36, fat: 19, portion: '1/8 pizza' }, 'XL': { cal: 500, protein: 21, carbs: 47, fat: 25, portion: '1/8 pizza' } } },
  philly:       { label: 'Philly Cheese Steak',       sizes: { 'Small': { cal: 340, protein: 14, carbs: 36, fat: 15, portion: '1/4 pizza' }, 'Medium': { cal: 370, protein: 15, carbs: 37, fat: 16, portion: '1/5 pizza' }, 'Large': { cal: 310, protein: 13, carbs: 33, fat: 13, portion: '1/8 pizza' }, 'XL': { cal: 400, protein: 17, carbs: 43, fat: 17, portion: '1/8 pizza' } } },
  ultimate:     { label: 'Ultimate Pepperoni',        sizes: { 'Small': { cal: 380, protein: 16, carbs: 38, fat: 18, portion: '1/4 pizza' }, 'Medium': { cal: 420, protein: 17, carbs: 38, fat: 21, portion: '1/5 pizza' }, 'Large': { cal: 360, protein: 15, carbs: 34, fat: 18, portion: '1/8 pizza' }, 'XL': { cal: 480, protein: 20, carbs: 45, fat: 23, portion: '1/8 pizza' } } },
  spicychicken: { label: 'Spicy Chicken Bacon Ranch', sizes: { 'Small': { cal: 390, protein: 16, carbs: 34, fat: 21, portion: '1/4 pizza' }, 'Medium': { cal: 480, protein: 19, carbs: 38, fat: 27, portion: '1/5 pizza' }, 'Large': { cal: 410, protein: 16, carbs: 34, fat: 22, portion: '1/8 pizza' }, 'XL': { cal: 530, protein: 21, carbs: 44, fat: 29, portion: '1/8 pizza' } } },
  wisconsin:    { label: 'Wisconsin 6 Cheese',        sizes: { 'Small': { cal: 340, protein: 14, carbs: 38, fat: 14, portion: '1/4 pizza' }, 'Medium': { cal: 390, protein: 17, carbs: 39, fat: 18, portion: '1/5 pizza' }, 'Large': { cal: 330, protein: 14, carbs: 35, fat: 15, portion: '1/8 pizza' }, 'XL': { cal: 440, protein: 19, carbs: 46, fat: 19, portion: '1/8 pizza' } } },
}

export default function DominosMealBuilder({ onAdd }: {
  onAdd: (name: string, cal: number, protein: number, carbs: number, fat: number) => void
}) {
  const [pizzaType, setPizzaType] = useState<'build' | 'specialty' | null>(null)
  const [step, setStep]           = useState(0)

  // Build Your Own
  const [size, setSize]                   = useState('medium')
  const [crust, setCrust]                 = useState('Hand Tossed')
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(new Set())
  const [slices, setSlices]               = useState(2)

  // Specialty
  const [specialtyKey, setSpecialtyKey]   = useState('ultimate')
  const [specialtySize, setSpecialtySize] = useState('Large')

  const base = CHEESE_BASE[size]?.[crust] ?? CHEESE_BASE.medium['Hand Tossed']
  const availableCrusts = Object.keys(CHEESE_BASE[size] ?? {})

  const toppingExtra = Array.from(selectedToppings).reduce<Macros>(
    (acc, name) => {
      const t = TOPPINGS.find(t => t.name === name)
      if (!t) return acc
      return { cal: acc.cal + t.macros.cal, protein: acc.protein + t.macros.protein, carbs: acc.carbs + t.macros.carbs, fat: acc.fat + t.macros.fat }
    },
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const perSlice: Macros = {
    cal:     base.cal     + toppingExtra.cal,
    protein: base.protein + toppingExtra.protein,
    carbs:   base.carbs   + toppingExtra.carbs,
    fat:     base.fat     + toppingExtra.fat,
  }

  const specialtyEntry  = SPECIALTY[specialtyKey]
  const specialtyMacros = specialtyEntry?.sizes[specialtySize] ?? Object.values(specialtyEntry?.sizes ?? {})[0]

  const totalMacros: Macros = pizzaType === 'build'
    ? { cal: perSlice.cal * slices, protein: perSlice.protein * slices, carbs: perSlice.carbs * slices, fat: perSlice.fat * slices }
    : { cal: specialtyMacros?.cal ?? 0, protein: specialtyMacros?.protein ?? 0, carbs: specialtyMacros?.carbs ?? 0, fat: specialtyMacros?.fat ?? 0 }

  function toggleTopping(name: string) {
    setSelectedToppings(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function handleAdd() {
    const toppingList = selectedToppings.size > 0 ? ` + ${Array.from(selectedToppings).join(', ')}` : ''
    const name = pizzaType === 'build'
      ? `Domino's ${SIZE_LABELS[size]} ${crust} Cheese${toppingList} × ${slices} slice${slices > 1 ? 's' : ''}`
      : `Domino's ${specialtyEntry.label} (${specialtySize})`
    onAdd(name, totalMacros.cal, totalMacros.protein, totalMacros.carbs, totalMacros.fat)
  }

  const steps = pizzaType === 'specialty'
    ? ['Type', 'Pizza', 'Confirm']
    : ['Type', 'Size & Crust', 'Toppings', 'Slices']

  return (
    <div>
      {/* Running totals */}
      <div className="glass-blue rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">Your Order</p>
            <p className="text-2xl font-black text-white">{totalMacros.cal} <span className="text-sm font-bold text-slate-400">cal</span></p>
          </div>
          <div className="flex gap-4">
            {(['protein', 'carbs', 'fat'] as const).map(k => (
              <div key={k} className="text-center">
                <p className="text-lg font-black text-white">{Math.round(totalMacros[k])}</p>
                <p className={`text-xs font-bold uppercase tracking-wide ${k === 'protein' ? 'text-blue-400' : 'text-slate-400'}`}>{k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 mb-4">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => i < step && setStep(i)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${step === i ? 'btn-blue text-white' : i < step ? 'glass text-green-400' : 'glass text-slate-600'}`}
          >
            {i < step ? '✓' : s}
          </button>
        ))}
      </div>

      {/* Step 0: Type */}
      {step === 0 && (
        <div className="space-y-3">
          <button onClick={() => { setPizzaType('build'); setStep(1) }} className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all text-left">
            <span className="text-3xl">🍕</span>
            <div>
              <p className="font-bold text-white">Build Your Own</p>
              <p className="text-xs text-slate-400">Choose crust, size & individual toppings</p>
            </div>
          </button>
          <button onClick={() => { setPizzaType('specialty'); setStep(1) }} className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all text-left">
            <span className="text-3xl">⭐</span>
            <div>
              <p className="font-bold text-white">Specialty Pizza</p>
              <p className="text-xs text-slate-400">ExtravaganZZa, Philly, BBQ Chicken & more</p>
            </div>
          </button>
        </div>
      )}

      {/* Build: Step 1 — Size & Crust */}
      {step === 1 && pizzaType === 'build' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Size</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SIZE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSize(key); setCrust(Object.keys(CHEESE_BASE[key])[0]) }}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${size === key ? 'bg-blue-500/20 border-blue-500/50 text-white' : 'glass border-white/10 text-slate-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Crust</p>
            <div className="grid grid-cols-2 gap-2">
              {availableCrusts.map(c => (
                <button
                  key={c}
                  onClick={() => setCrust(c)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${crust === c ? 'bg-blue-500/20 border-blue-500/50 text-white' : 'glass border-white/10 text-slate-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl px-4 py-2.5 flex justify-between items-center">
            <span className="text-xs text-slate-400">Plain cheese base (per slice)</span>
            <span className="text-xs font-bold text-white">{base.cal} cal · {base.protein}g P</span>
          </div>
          <button onClick={() => setStep(2)} className="w-full py-3 rounded-2xl btn-blue text-white font-bold text-sm">
            Next: Toppings →
          </button>
        </div>
      )}

      {/* Build: Step 2 — Toppings */}
      {step === 2 && pizzaType === 'build' && (
        <div className="space-y-4">
          <div className="glass rounded-xl px-4 py-2.5 flex justify-between items-center">
            <span className="text-xs text-slate-400">Per slice with selected toppings</span>
            <span className="text-xs font-bold text-white">{perSlice.cal} cal · {perSlice.protein}g P</span>
          </div>
          {TOPPING_CATEGORIES.map(cat => (
            <div key={cat}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{cat}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {TOPPINGS.filter(t => t.category === cat).map(t => {
                  const on = selectedToppings.has(t.name)
                  return (
                    <button
                      key={t.name}
                      onClick={() => toggleTopping(t.name)}
                      className={`px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-1 text-left ${on ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{t.name}</p>
                        <p className="text-xs text-slate-500">+{t.macros.cal} cal/slice</p>
                      </div>
                      {on && <Check size={12} className="text-blue-400 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <button onClick={() => setStep(3)} className="w-full py-3 rounded-2xl btn-blue text-white font-bold text-sm mt-2">
            Next: Slices →
          </button>
        </div>
      )}

      {/* Build: Step 3 — Slices */}
      {step === 3 && pizzaType === 'build' && (
        <div className="space-y-4">
          <div className="glass rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">
              {SIZE_LABELS[size]} · {crust}
              {selectedToppings.size > 0 ? ` · ${Array.from(selectedToppings).join(', ')}` : ' · Plain Cheese'}
            </p>
            <p className="text-sm font-bold text-white">{perSlice.cal} cal per slice · {perSlice.protein}g P</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">How many slices?</p>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setSlices(s => Math.max(1, s - 1))} className="w-12 h-12 glass rounded-xl text-2xl font-black text-white hover:bg-white/10 transition-all">−</button>
              <span className="text-4xl font-black text-white w-12 text-center">{slices}</span>
              <button onClick={() => setSlices(s => Math.min(base.slices, s + 1))} className="w-12 h-12 glass rounded-xl text-2xl font-black text-white hover:bg-white/10 transition-all">+</button>
            </div>
            <p className="text-xs text-slate-600 text-center mt-2">Max {base.slices} slices for this size</p>
          </div>
          <button onClick={handleAdd} className="w-full py-3 rounded-2xl btn-blue text-white font-bold text-sm">
            Add to Log ✓
          </button>
        </div>
      )}

      {/* Specialty: Step 1 */}
      {step === 1 && pizzaType === 'specialty' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Specialty</p>
            <div className="space-y-1.5">
              {Object.entries(SPECIALTY).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => setSpecialtyKey(key)}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between border transition-all ${specialtyKey === key ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
                >
                  <span className="text-sm font-bold text-white">{s.label}</span>
                  {specialtyKey === key && <Check size={14} className="text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Size / Serving</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(specialtyEntry.sizes).map(([sizeLabel, m]) => (
                <button
                  key={sizeLabel}
                  onClick={() => setSpecialtySize(sizeLabel)}
                  className={`px-3 py-2.5 rounded-xl text-left border transition-all ${specialtySize === sizeLabel ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10'}`}
                >
                  <p className="text-sm font-bold text-white">{sizeLabel}</p>
                  <p className="text-xs text-slate-400">{m.cal} cal · {m.protein}g P</p>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full py-3 rounded-2xl btn-blue text-white font-bold text-sm">
            Next: Confirm →
          </button>
        </div>
      )}

      {/* Specialty: Step 2 — Confirm */}
      {step === 2 && pizzaType === 'specialty' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Order Summary</p>
            <p className="font-bold text-white">{specialtyEntry.label}</p>
            <p className="text-sm text-slate-400 mb-3">{specialtySize} · {specialtyMacros?.portion}</p>
            <div className="flex gap-4">
              <div className="text-center"><p className="font-black text-white">{specialtyMacros?.cal}</p><p className="text-xs text-slate-500">cal</p></div>
              <div className="text-center"><p className="font-black text-blue-300">{specialtyMacros?.protein}g</p><p className="text-xs text-slate-500">protein</p></div>
              <div className="text-center"><p className="font-black text-white">{specialtyMacros?.carbs}g</p><p className="text-xs text-slate-500">carbs</p></div>
              <div className="text-center"><p className="font-black text-white">{specialtyMacros?.fat}g</p><p className="text-xs text-slate-500">fat</p></div>
            </div>
          </div>
          <button onClick={handleAdd} className="w-full py-3 rounded-2xl btn-blue text-white font-bold text-sm">
            Add to Log ✓
          </button>
        </div>
      )}

      {/* Back */}
      {step > 0 && (
        <button onClick={() => setStep(s => s - 1)} className="mt-3 text-xs font-bold text-slate-500 hover:text-slate-300">
          ← Back
        </button>
      )}
    </div>
  )
}
