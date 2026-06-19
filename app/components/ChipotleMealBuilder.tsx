'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

type Component = { name: string; calories: number; protein: number; carbs: number; fat: number; portion: string }
type Selection = { component: Component; qty: number }

const BASES: Component[] = [
  { name: 'Burrito Bowl (no tortilla)', calories: 0, protein: 0, carbs: 0, fat: 0, portion: '' },
  { name: 'Flour Tortilla (Burrito)', calories: 320, protein: 8, carbs: 50, fat: 9, portion: '1 tortilla' },
  { name: 'Flour Tortilla (Taco ×3)', calories: 240, protein: 6, carbs: 39, fat: 8, portion: '3 tortillas' },
  { name: 'Crispy Corn Tortilla (×3)', calories: 210, protein: 3, carbs: 30, fat: 9, portion: '3 tortillas' },
  { name: 'Supergreens Salad', calories: 15, protein: 1, carbs: 3, fat: 0, portion: '3 oz' },
]

const PROTEINS: Component[] = [
  { name: 'Chicken', calories: 180, protein: 32, carbs: 0, fat: 7, portion: '4 oz' },
  { name: 'Steak', calories: 150, protein: 21, carbs: 1, fat: 6, portion: '4 oz' },
  { name: 'Barbacoa', calories: 170, protein: 24, carbs: 2, fat: 7, portion: '4 oz' },
  { name: 'Carnitas', calories: 210, protein: 23, carbs: 0, fat: 12, portion: '4 oz' },
  { name: 'Sofritas (vegan)', calories: 150, protein: 8, carbs: 9, fat: 10, portion: '4 oz' },
]

const RICE: Component[] = [
  { name: 'No Rice', calories: 0, protein: 0, carbs: 0, fat: 0, portion: '' },
  { name: 'White Rice', calories: 210, protein: 4, carbs: 40, fat: 4, portion: '4 oz' },
  { name: 'Brown Rice', calories: 210, protein: 4, carbs: 36, fat: 6, portion: '4 oz' },
]

const BEANS: Component[] = [
  { name: 'No Beans', calories: 0, protein: 0, carbs: 0, fat: 0, portion: '' },
  { name: 'Black Beans', calories: 130, protein: 8, carbs: 22, fat: 2, portion: '4 oz' },
  { name: 'Pinto Beans', calories: 130, protein: 8, carbs: 21, fat: 2, portion: '4 oz' },
]

const TOPPINGS: Component[] = [
  { name: 'Fajita Veggies', calories: 20, protein: 1, carbs: 5, fat: 0, portion: '2 oz' },
  { name: 'Fresh Tomato Salsa', calories: 25, protein: 0, carbs: 4, fat: 0, portion: '4 oz' },
  { name: 'Roasted Chili-Corn Salsa', calories: 80, protein: 3, carbs: 16, fat: 2, portion: '4 oz' },
  { name: 'Tomatillo-Green Chili Salsa', calories: 15, protein: 0, carbs: 4, fat: 0, portion: '2 fl oz' },
  { name: 'Tomatillo-Red Chili Salsa', calories: 30, protein: 0, carbs: 4, fat: 0, portion: '2 fl oz' },
  { name: 'Cheese', calories: 110, protein: 6, carbs: 1, fat: 8, portion: '1 oz' },
  { name: 'Sour Cream', calories: 110, protein: 2, carbs: 2, fat: 9, portion: '2 oz' },
  { name: 'Guacamole', calories: 230, protein: 2, carbs: 8, fat: 22, portion: '4 oz' },
  { name: 'Queso Blanco', calories: 120, protein: 5, carbs: 4, fat: 9, portion: '2 oz' },
  { name: 'Romaine Lettuce', calories: 5, protein: 0, carbs: 1, fat: 0, portion: '1 oz' },
  { name: 'Chips (regular)', calories: 540, protein: 7, carbs: 73, fat: 25, portion: '4 oz' },
]

const STEPS = ['Base', 'Protein', 'Rice', 'Beans', 'Toppings']

function MacroBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-black text-white">{Math.round(value)}</p>
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</p>
    </div>
  )
}

export default function ChipotleMealBuilder({ onAdd, onClose }: { onAdd: (name: string, cal: number, protein: number, carbs: number, fat: number) => void; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [base, setBase] = useState<Component>(BASES[0])
  const [protein, setProtein] = useState<Component>(PROTEINS[0])
  const [rice, setRice] = useState<Component>(RICE[0])
  const [beans, setBeans] = useState<Component>(BEANS[0])
  const [toppings, setToppings] = useState<Set<string>>(new Set())
  const [extraProtein, setExtraProtein] = useState(false)

  const selectedToppings = TOPPINGS.filter(t => toppings.has(t.name))

  const totals = [base, protein, rice, beans, ...selectedToppings].reduce(
    (acc, c) => ({ cal: acc.cal + c.calories, protein: acc.protein + c.protein, carbs: acc.carbs + c.carbs, fat: acc.fat + c.fat }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  )
  const extraProteinBonus = extraProtein ? { cal: protein.calories, protein: protein.protein, carbs: protein.carbs, fat: protein.fat } : { cal: 0, protein: 0, carbs: 0, fat: 0 }
  const finalCal = totals.cal + extraProteinBonus.cal
  const finalProtein = totals.protein + extraProteinBonus.protein
  const finalCarbs = totals.carbs + extraProteinBonus.carbs
  const finalFat = totals.fat + extraProteinBonus.fat

  function toggleTopping(name: string) {
    setToppings(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function handleAdd() {
    const mealName = `Chipotle - ${base.name !== 'Burrito Bowl (no tortilla)' ? base.name : 'Bowl'} w/ ${protein.name}`
    onAdd(mealName, finalCal, finalProtein, finalCarbs, finalFat)
  }

  const stepOptions = [BASES, PROTEINS, RICE, BEANS, TOPPINGS][step]
  const isSingleSelect = step < 4
  const currentSingle = [base, protein, rice, beans][step]

  return (
    <div className="flex flex-col h-full">
      {/* Running totals */}
      <div className="glass-blue rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">Your Meal</p>
            <p className="text-2xl font-black text-white">{finalCal} <span className="text-sm font-bold text-slate-400">cal</span></p>
          </div>
          <div className="flex gap-4">
            <MacroBar label="Protein" value={finalProtein} color="#60a5fa" />
            <MacroBar label="Carbs" value={finalCarbs} color="#94a3b8" />
            <MacroBar label="Fat" value={finalFat} color="#cbd5e1" />
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${step === i ? 'btn-blue text-white' : 'glass text-slate-400 hover:text-white'}`}
          >
            {step > i ? '✓ ' : ''}{s}
          </button>
        ))}
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {step === 1 && (
          <button
            onClick={() => setExtraProtein(e => !e)}
            className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all border ${extraProtein ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10'}`}
          >
            <div className="text-left">
              <p className="text-sm font-bold text-white">Double Protein</p>
              <p className="text-xs text-slate-400">+{protein.calories} cal · +{protein.protein}g protein</p>
            </div>
            {extraProtein && <Check size={16} className="text-blue-400 shrink-0" />}
          </button>
        )}

        {isSingleSelect ? (
          (stepOptions as Component[]).map(opt => {
            const isSelected = currentSingle?.name === opt.name
            return (
              <button
                key={opt.name}
                onClick={() => {
                  if (step === 0) setBase(opt)
                  else if (step === 1) setProtein(opt)
                  else if (step === 2) setRice(opt)
                  else if (step === 3) setBeans(opt)
                }}
                className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all border ${isSelected ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{opt.name}</p>
                  {opt.calories > 0 && (
                    <p className="text-xs text-slate-400">{opt.calories} cal · {opt.protein}g P · {opt.carbs}g C · {opt.fat}g F</p>
                  )}
                </div>
                {isSelected && <Check size={16} className="text-blue-400 shrink-0" />}
              </button>
            )
          })
        ) : (
          (TOPPINGS as Component[]).map(opt => {
            const isSelected = toppings.has(opt.name)
            return (
              <button
                key={opt.name}
                onClick={() => toggleTopping(opt.name)}
                className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all border ${isSelected ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{opt.name}</p>
                  <p className="text-xs text-slate-400">{opt.calories} cal · {opt.protein}g P · {opt.carbs}g C · {opt.fat}g F</p>
                </div>
                {isSelected && <Check size={16} className="text-blue-400 shrink-0" />}
              </button>
            )
          })
        )}
      </div>

      {/* Nav + Add */}
      <div className="flex gap-2">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="px-4 py-3 rounded-2xl glass text-slate-300 font-bold text-sm">← Back</button>
        )}
        {step < 4 ? (
          <button onClick={() => setStep(s => s + 1)} className="flex-1 py-3 rounded-2xl btn-blue text-white font-bold text-sm">Next: {STEPS[step + 1]} →</button>
        ) : (
          <button onClick={handleAdd} className="flex-1 py-3 rounded-2xl btn-blue text-white font-bold text-sm">Add to Log ✓</button>
        )}
      </div>
    </div>
  )
}
