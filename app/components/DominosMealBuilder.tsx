'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

type Macros = { cal: number; protein: number; carbs: number; fat: number }

// Per-slice data keyed by [size][crust][topping]
type PizzaOption = { topping: string; macros: Macros }
type CrustOptions = { crust: string; slicesPerPizza: number; options: PizzaOption[] }
type SizeEntry = { label: string; crusts: CrustOptions[] }

const PIZZAS: Record<string, SizeEntry> = {
  small: {
    label: '10" Small',
    crusts: [
      {
        crust: 'Hand Tossed', slicesPerPizza: 6,
        options: [
          { topping: 'Plain Cheese',     macros: { cal: 155, protein: 8,  carbs: 22, fat: 7  } },
          { topping: 'Pepperoni',        macros: { cal: 180, protein: 9,  carbs: 22, fat: 9  } },
          { topping: 'Italian Sausage',  macros: { cal: 155, protein: 8,  carbs: 20, fat: 7  } },
          { topping: 'Bacon',            macros: { cal: 160, protein: 10, carbs: 21, fat: 7  } },
          { topping: 'MeatZZa',          macros: { cal: 200, protein: 12, carbs: 20, fat: 9  } },
        ],
      },
      {
        crust: 'Crunchy Thin', slicesPerPizza: 8,
        options: [
          { topping: 'Plain Cheese',    macros: { cal: 90,  protein: 5,  carbs: 8,  fat: 4  } },
          { topping: 'Pepperoni',       macros: { cal: 110, protein: 6,  carbs: 8,  fat: 6  } },
          { topping: 'Italian Sausage', macros: { cal: 95,  protein: 6,  carbs: 8,  fat: 5  } },
          { topping: 'MeatZZa',         macros: { cal: 125, protein: 7,  carbs: 7,  fat: 7  } },
        ],
      },
    ],
  },
  medium: {
    label: '12" Medium',
    crusts: [
      {
        crust: 'Hand Tossed', slicesPerPizza: 8,
        options: [
          { topping: 'Plain Cheese',    macros: { cal: 180, protein: 11, carbs: 23, fat: 6  } },
          { topping: 'Pepperoni',       macros: { cal: 210, protein: 12, carbs: 23, fat: 8  } },
          { topping: 'Italian Sausage', macros: { cal: 230, protein: 13, carbs: 23, fat: 11 } },
          { topping: 'Bacon',           macros: { cal: 215, protein: 13, carbs: 23, fat: 8  } },
          { topping: 'ExtravaganZZa',   macros: { cal: 290, protein: 18, carbs: 23, fat: 15 } },
          { topping: 'MeatZZa',         macros: { cal: 280, protein: 17, carbs: 23, fat: 13 } },
        ],
      },
      {
        crust: 'Pan', slicesPerPizza: 8,
        options: [
          { topping: 'Plain Cheese', macros: { cal: 290, protein: 14, carbs: 27, fat: 13 } },
          { topping: 'Pepperoni',    macros: { cal: 320, protein: 15, carbs: 27, fat: 15 } },
          { topping: 'MeatZZa',      macros: { cal: 380, protein: 19, carbs: 27, fat: 19 } },
        ],
      },
      {
        crust: 'Crunchy Thin', slicesPerPizza: 8,
        options: [
          { topping: 'Plain Cheese', macros: { cal: 133, protein: 8,  carbs: 12, fat: 6  } },
          { topping: 'Pepperoni',    macros: { cal: 155, protein: 9,  carbs: 12, fat: 8  } },
          { topping: 'MeatZZa',      macros: { cal: 180, protein: 11, carbs: 11, fat: 9  } },
        ],
      },
      {
        crust: 'New York Style', slicesPerPizza: 6,
        options: [
          { topping: 'Plain Cheese', macros: { cal: 190, protein: 14, carbs: 23, fat: 8  } },
          { topping: 'Pepperoni',    macros: { cal: 230, protein: 16, carbs: 23, fat: 12 } },
          { topping: 'MeatZZa',      macros: { cal: 290, protein: 20, carbs: 21, fat: 14 } },
        ],
      },
    ],
  },
  large: {
    label: '14" Large',
    crusts: [
      {
        crust: 'Hand Tossed', slicesPerPizza: 8,
        options: [
          { topping: 'Plain Cheese',   macros: { cal: 210, protein: 13, carbs: 32, fat: 8  } },
          { topping: 'Pepperoni',      macros: { cal: 250, protein: 15, carbs: 32, fat: 12 } },
          { topping: 'ExtravaganZZa',  macros: { cal: 320, protein: 19, carbs: 31, fat: 15 } },
          { topping: 'MeatZZa',        macros: { cal: 310, protein: 18, carbs: 30, fat: 15 } },
          { topping: 'Honolulu Hawaiian', macros: { cal: 280, protein: 16, carbs: 32, fat: 12 } },
        ],
      },
      {
        crust: 'New York Style', slicesPerPizza: 6,
        options: [
          { topping: 'Plain Cheese',  macros: { cal: 230, protein: 16, carbs: 32, fat: 9  } },
          { topping: 'Pepperoni',     macros: { cal: 280, protein: 18, carbs: 32, fat: 13 } },
          { topping: 'ExtravaganZZa', macros: { cal: 350, protein: 21, carbs: 31, fat: 17 } },
          { topping: 'MeatZZa',       macros: { cal: 340, protein: 20, carbs: 30, fat: 16 } },
        ],
      },
    ],
  },
  xlarge: {
    label: '16" XL',
    crusts: [
      {
        crust: 'Hand Tossed', slicesPerPizza: 8,
        options: [
          { topping: 'Plain Cheese',    macros: { cal: 250, protein: 15, carbs: 42, fat: 10 } },
          { topping: 'Pepperoni',       macros: { cal: 300, protein: 17, carbs: 42, fat: 14 } },
          { topping: 'Italian Sausage', macros: { cal: 320, protein: 18, carbs: 42, fat: 15 } },
          { topping: 'MeatZZa',         macros: { cal: 350, protein: 20, carbs: 40, fat: 16 } },
        ],
      },
      {
        crust: 'New York Style', slicesPerPizza: 6,
        options: [
          { topping: 'Plain Cheese',  macros: { cal: 280, protein: 17, carbs: 43, fat: 12 } },
          { topping: 'Pepperoni',     macros: { cal: 340, protein: 20, carbs: 43, fat: 16 } },
          { topping: 'ExtravaganZZa', macros: { cal: 380, protein: 22, carbs: 42, fat: 18 } },
          { topping: 'MeatZZa',       macros: { cal: 380, protein: 22, carbs: 42, fat: 18 } },
        ],
      },
    ],
  },
}

const SPECIALTY: Record<string, { label: string; sizes: Record<string, Macros & { portion: string }> }> = {
  honolulu: {
    label: 'Honolulu Hawaiian',
    sizes: {
      'Small (1/4)':  { cal: 350, protein: 15, carbs: 39, fat: 15, portion: '1/4 pizza' },
      'Medium (1/5)': { cal: 380, protein: 17, carbs: 40, fat: 17, portion: '1/5 pizza' },
      'Large (1/8)':  { cal: 330, protein: 14, carbs: 36, fat: 14, portion: '1/8 pizza' },
      'XL (1/8)':     { cal: 430, protein: 19, carbs: 47, fat: 18, portion: '1/8 pizza' },
    },
  },
  memphis: {
    label: 'Memphis BBQ Chicken',
    sizes: {
      'Small (1/4)':  { cal: 360, protein: 15, carbs: 41, fat: 14, portion: '1/4 pizza' },
      'Medium (1/5)': { cal: 410, protein: 18, carbs: 44, fat: 17, portion: '1/5 pizza' },
      'Large (1/8)':  { cal: 350, protein: 15, carbs: 39, fat: 14, portion: '1/8 pizza' },
      'XL (1/8)':     { cal: 460, protein: 20, carbs: 51, fat: 18, portion: '1/8 pizza' },
    },
  },
  extravaganzza: {
    label: 'ExtravaganZZa',
    sizes: {
      'Small (1/4)':  { cal: 400, protein: 16, carbs: 38, fat: 19, portion: '1/4 pizza' },
      'Medium (1/5)': { cal: 440, protein: 18, carbs: 40, fat: 22, portion: '1/5 pizza' },
      'Large (1/8)':  { cal: 380, protein: 16, carbs: 36, fat: 19, portion: '1/8 pizza' },
      'XL (1/8)':     { cal: 500, protein: 21, carbs: 47, fat: 25, portion: '1/8 pizza' },
    },
  },
  philly: {
    label: 'Philly Cheese Steak',
    sizes: {
      'Small (1/4)':  { cal: 340, protein: 14, carbs: 36, fat: 15, portion: '1/4 pizza' },
      'Medium (1/5)': { cal: 370, protein: 15, carbs: 37, fat: 16, portion: '1/5 pizza' },
      'Large (1/8)':  { cal: 310, protein: 13, carbs: 33, fat: 13, portion: '1/8 pizza' },
      'XL (1/8)':     { cal: 400, protein: 17, carbs: 43, fat: 17, portion: '1/8 pizza' },
    },
  },
  ultimate: {
    label: 'Ultimate Pepperoni',
    sizes: {
      'Small (1/4)':  { cal: 380, protein: 16, carbs: 38, fat: 18, portion: '1/4 pizza' },
      'Medium (1/5)': { cal: 420, protein: 17, carbs: 38, fat: 21, portion: '1/5 pizza' },
      'Large (1/8)':  { cal: 360, protein: 15, carbs: 34, fat: 18, portion: '1/8 pizza' },
      'XL (1/8)':     { cal: 480, protein: 20, carbs: 45, fat: 23, portion: '1/8 pizza' },
    },
  },
  spicychicken: {
    label: 'Spicy Chicken Bacon Ranch',
    sizes: {
      'Small (1/4)':  { cal: 390, protein: 16, carbs: 34, fat: 21, portion: '1/4 pizza' },
      'Medium (1/5)': { cal: 480, protein: 19, carbs: 38, fat: 27, portion: '1/5 pizza' },
      'Large (1/8)':  { cal: 410, protein: 16, carbs: 34, fat: 22, portion: '1/8 pizza' },
      'XL (1/8)':     { cal: 530, protein: 21, carbs: 44, fat: 29, portion: '1/8 pizza' },
    },
  },
  wisconsin: {
    label: 'Wisconsin 6 Cheese',
    sizes: {
      'Small (1/4)':  { cal: 340, protein: 14, carbs: 38, fat: 14, portion: '1/4 pizza' },
      'Medium (1/5)': { cal: 390, protein: 17, carbs: 39, fat: 18, portion: '1/5 pizza' },
      'Large (1/8)':  { cal: 330, protein: 14, carbs: 35, fat: 15, portion: '1/8 pizza' },
      'XL (1/8)':     { cal: 440, protein: 19, carbs: 46, fat: 19, portion: '1/8 pizza' },
    },
  },
}

const STEPS = ['Type', 'Pizza', 'Slices']

export default function DominosMealBuilder({ onAdd }: {
  onAdd: (name: string, cal: number, protein: number, carbs: number, fat: number) => void
}) {
  const [step, setStep] = useState(0)
  const [pizzaType, setPizzaType] = useState<'build' | 'specialty' | null>(null)

  // Build Your Own state
  const [size, setSize] = useState<string>('medium')
  const [crust, setCrust] = useState<string>('Hand Tossed')
  const [topping, setTopping] = useState<string>('Plain Cheese')
  const [slices, setSlices] = useState(2)

  // Specialty state
  const [specialtyKey, setSpecialtyKey] = useState<string>('ultimate')
  const [specialtySize, setSpecialtySize] = useState<string>('Large (1/8)')

  const sizeEntry = PIZZAS[size]
  const crustEntry = sizeEntry?.crusts.find(c => c.crust === crust) ?? sizeEntry?.crusts[0]
  const toppingEntry = crustEntry?.options.find(o => o.topping === topping) ?? crustEntry?.options[0]
  const perSlice: Macros = toppingEntry?.macros ?? { cal: 0, protein: 0, carbs: 0, fat: 0 }

  const specialtyEntry = SPECIALTY[specialtyKey]
  const specialtyMacros = specialtyEntry?.sizes[specialtySize] ?? Object.values(specialtyEntry?.sizes ?? {})[0]

  const totalMacros: Macros = pizzaType === 'build'
    ? { cal: perSlice.cal * slices, protein: perSlice.protein * slices, carbs: perSlice.carbs * slices, fat: perSlice.fat * slices }
    : { cal: specialtyMacros?.cal ?? 0, protein: specialtyMacros?.protein ?? 0, carbs: specialtyMacros?.carbs ?? 0, fat: specialtyMacros?.fat ?? 0 }

  function handleAdd() {
    const name = pizzaType === 'build'
      ? `Domino's ${sizeEntry.label} ${crust} - ${topping} (${slices} slice${slices > 1 ? 's' : ''})`
      : `Domino's ${specialtyEntry.label} ${specialtySize}`
    onAdd(name, totalMacros.cal, totalMacros.protein, totalMacros.carbs, totalMacros.fat)
  }

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
            onClick={() => i < step && setStep(i)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${step === i ? 'btn-blue text-white' : i < step ? 'glass text-green-400' : 'glass text-slate-600'}`}
          >
            {i < step ? '✓ ' : ''}{s}
          </button>
        ))}
      </div>

      {/* Step 0: Pizza Type */}
      {step === 0 && (
        <div className="space-y-3">
          <button
            onClick={() => { setPizzaType('build'); setStep(1) }}
            className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all text-left"
          >
            <span className="text-3xl">🍕</span>
            <div>
              <p className="font-bold text-white">Build Your Own</p>
              <p className="text-xs text-slate-400">Choose size, crust, topping & slices</p>
            </div>
          </button>
          <button
            onClick={() => { setPizzaType('specialty'); setStep(1) }}
            className="w-full glass border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-500/40 transition-all text-left"
          >
            <span className="text-3xl">⭐</span>
            <div>
              <p className="font-bold text-white">Specialty Pizza</p>
              <p className="text-xs text-slate-400">ExtravaganZZa, MeatZZa, BBQ Chicken & more</p>
            </div>
          </button>
        </div>
      )}

      {/* Step 1: Build Your Own config */}
      {step === 1 && pizzaType === 'build' && (
        <div className="space-y-4">
          {/* Size */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Size</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PIZZAS).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => { setSize(key); setCrust(PIZZAS[key].crusts[0].crust); setTopping(PIZZAS[key].crusts[0].options[0].topping) }}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${size === key ? 'bg-blue-500/20 border-blue-500/50 text-white' : 'glass border-white/10 text-slate-300'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {/* Crust */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Crust</p>
            <div className="grid grid-cols-2 gap-2">
              {sizeEntry.crusts.map(c => (
                <button
                  key={c.crust}
                  onClick={() => { setCrust(c.crust); setTopping(c.options[0].topping) }}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${crust === c.crust ? 'bg-blue-500/20 border-blue-500/50 text-white' : 'glass border-white/10 text-slate-300'}`}
                >
                  {c.crust}
                </button>
              ))}
            </div>
          </div>
          {/* Topping */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Topping</p>
            <div className="space-y-1.5">
              {crustEntry?.options.map(o => (
                <button
                  key={o.topping}
                  onClick={() => setTopping(o.topping)}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between border transition-all ${topping === o.topping ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
                >
                  <span className="text-sm font-bold text-white">{o.topping}</span>
                  <span className="text-xs text-slate-400">{o.macros.cal} cal/slice · {o.macros.protein}g P</span>
                  {topping === o.topping && <Check size={14} className="text-blue-400 ml-2 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full py-3 rounded-2xl btn-blue text-white font-bold text-sm">
            Next: Slices →
          </button>
        </div>
      )}

      {/* Step 1: Specialty config */}
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

      {/* Step 2: Slices (build only) or confirm (specialty) */}
      {step === 2 && (
        <div className="space-y-4">
          {pizzaType === 'build' && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                How many slices? <span className="text-slate-600">({perSlice.cal} cal each)</span>
              </p>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setSlices(s => Math.max(1, s - 1))}
                  className="w-12 h-12 glass rounded-xl text-2xl font-black text-white hover:bg-white/10 transition-all"
                >−</button>
                <span className="text-4xl font-black text-white w-12 text-center">{slices}</span>
                <button
                  onClick={() => setSlices(s => Math.min(crustEntry?.slicesPerPizza ?? 8, s + 1))}
                  className="w-12 h-12 glass rounded-xl text-2xl font-black text-white hover:bg-white/10 transition-all"
                >+</button>
              </div>
              <p className="text-xs text-slate-600 text-center mt-2">
                Max {crustEntry?.slicesPerPizza} slices for a {sizeEntry.label} {crust}
              </p>
            </div>
          )}

          {pizzaType === 'specialty' && (
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Order Summary</p>
              <p className="font-bold text-white">{specialtyEntry.label}</p>
              <p className="text-sm text-slate-400">{specialtySize}</p>
              <div className="flex gap-4 mt-3">
                <div className="text-center"><p className="font-black text-white">{specialtyMacros.cal}</p><p className="text-xs text-slate-500">cal</p></div>
                <div className="text-center"><p className="font-black text-blue-300">{specialtyMacros.protein}g</p><p className="text-xs text-slate-500">protein</p></div>
                <div className="text-center"><p className="font-black text-white">{specialtyMacros.carbs}g</p><p className="text-xs text-slate-500">carbs</p></div>
                <div className="text-center"><p className="font-black text-white">{specialtyMacros.fat}g</p><p className="text-xs text-slate-500">fat</p></div>
              </div>
            </div>
          )}

          <button onClick={handleAdd} className="w-full py-3 rounded-2xl btn-blue text-white font-bold text-sm">
            Add to Log ✓
          </button>
        </div>
      )}

      {/* Back button */}
      {step > 0 && (
        <button onClick={() => setStep(s => s - 1)} className="mt-3 text-xs font-bold text-slate-500 hover:text-slate-300">
          ← Back
        </button>
      )}
    </div>
  )
}
