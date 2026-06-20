'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

type Macros = { cal: number; protein: number; carbs: number; fat: number }

type MenuItem = {
  name: string
  macros: Macros
  addOns?: { name: string; macros: Macros }[]
}

type Category = {
  emoji: string
  label: string
  items: MenuItem[]
}

const MENU: Category[] = [
  {
    emoji: '🍔',
    label: 'Burgers',
    items: [
      {
        name: 'Small Burger (1/8 lb)',
        macros: { cal: 245, protein: 14, carbs: 27, fat: 8 },
        addOns: [
          { name: 'Everything Style', macros: { cal: 91, protein: 1, carbs: 5, fat: 8 } },
          { name: 'Cook Out® Style', macros: { cal: 123, protein: 3, carbs: 7, fat: 5 } },
          { name: 'Out West Style', macros: { cal: 202, protein: 8, carbs: 4, fat: 18 } },
          { name: 'Steak Style', macros: { cal: 91, protein: 1, carbs: 5, fat: 8 } },
          { name: 'Cheddar Style', macros: { cal: 233, protein: 8, carbs: 5, fat: 20 } },
        ],
      },
      {
        name: 'Regular Burger (1/4 lb)',
        macros: { cal: 328, protein: 22, carbs: 27, fat: 14 },
        addOns: [
          { name: 'Everything Style', macros: { cal: 91, protein: 1, carbs: 5, fat: 8 } },
          { name: 'Cook Out® Style', macros: { cal: 123, protein: 3, carbs: 7, fat: 5 } },
          { name: 'Out West Style', macros: { cal: 202, protein: 8, carbs: 4, fat: 18 } },
          { name: 'Steak Style', macros: { cal: 91, protein: 1, carbs: 5, fat: 8 } },
          { name: 'Cheddar Style', macros: { cal: 233, protein: 8, carbs: 5, fat: 20 } },
        ],
      },
      {
        name: 'Huge Burger (1/2 lb)',
        macros: { cal: 516, protein: 40, carbs: 27, fat: 26 },
        addOns: [
          { name: 'Everything Style', macros: { cal: 91, protein: 1, carbs: 5, fat: 8 } },
          { name: 'Cook Out® Style', macros: { cal: 123, protein: 3, carbs: 7, fat: 5 } },
          { name: 'Out West Style', macros: { cal: 202, protein: 8, carbs: 4, fat: 18 } },
          { name: 'Steak Style', macros: { cal: 91, protein: 1, carbs: 5, fat: 8 } },
          { name: 'Cheddar Style', macros: { cal: 233, protein: 8, carbs: 5, fat: 20 } },
        ],
      },
      {
        name: 'Big Double™',
        macros: { cal: 311, protein: 20, carbs: 27, fat: 13 },
        addOns: [
          { name: 'Everything Style', macros: { cal: 91, protein: 1, carbs: 5, fat: 8 } },
          { name: 'Cook Out® Style', macros: { cal: 123, protein: 3, carbs: 7, fat: 5 } },
          { name: 'Cheddar Style', macros: { cal: 233, protein: 8, carbs: 5, fat: 20 } },
        ],
      },
    ],
  },
  {
    emoji: '🍗',
    label: 'Grilled Chicken',
    items: [
      {
        name: 'Char-Grilled Chicken Breast',
        macros: { cal: 377, protein: 25, carbs: 29, fat: 17 },
        addOns: [
          { name: 'Original Style', macros: { cal: 16, protein: 0, carbs: 2, fat: 1 } },
          { name: 'Barbeque Style', macros: { cal: -1, protein: 0, carbs: 0, fat: 0 } },
          { name: 'Club Style', macros: { cal: 188, protein: 0, carbs: 0, fat: 0 } },
          { name: 'Cheddar Style', macros: { cal: 157, protein: 8, carbs: 3, fat: 13 } },
        ],
      },
    ],
  },
  {
    emoji: '🌶️',
    label: 'Spicy Chicken',
    items: [
      {
        name: 'Spicy Chicken Breast',
        macros: { cal: 446, protein: 21, carbs: 45, fat: 18 },
        addOns: [
          { name: 'Cheese Style', macros: { cal: 188, protein: 11, carbs: 1, fat: 17 } },
        ],
      },
    ],
  },
  {
    emoji: '🥩',
    label: 'BBQ & Pork',
    items: [
      { name: 'Reg BBQ Sandwich', macros: { cal: 368, protein: 29, carbs: 35, fat: 12 } },
      { name: 'BBQ Plate', macros: { cal: 976, protein: 35, carbs: 105, fat: 43 } },
    ],
  },
  {
    emoji: '🌭',
    label: 'Hot Dogs',
    items: [
      {
        name: 'Hot Dog',
        macros: { cal: 260, protein: 8, carbs: 22, fat: 15 },
        addOns: [
          { name: 'Cook Out® Style', macros: { cal: 123, protein: 3, carbs: 7, fat: 5 } },
          { name: 'Mexi Style', macros: { cal: 125, protein: 4, carbs: 7, fat: 4 } },
          { name: 'Bacon Cheddar Style', macros: { cal: 263, protein: 11, carbs: 25, fat: 14 } },
        ],
      },
      { name: 'Cook Out® Style Hot Dog', macros: { cal: 383, protein: 11, carbs: 29, fat: 20 } },
      { name: 'Mexi Hot Dog', macros: { cal: 385, protein: 12, carbs: 29, fat: 19 } },
      { name: 'Bacon Cheddar Hot Dog', macros: { cal: 523, protein: 19, carbs: 47, fat: 29 } },
      { name: 'Corn Dog', macros: { cal: 220, protein: 5, carbs: 26, fat: 11 } },
      { name: 'Cheese Dog', macros: { cal: 146, protein: 3, carbs: 25, fat: 3 } },
    ],
  },
  {
    emoji: '🌯',
    label: 'Wraps',
    items: [
      { name: 'Cajun Wrap', macros: { cal: 501, protein: 25, carbs: 44, fat: 27 } },
      { name: 'Ranch Wrap', macros: { cal: 522, protein: 25, carbs: 44, fat: 29 } },
      { name: 'Honey Mustard Wrap', macros: { cal: 517, protein: 25, carbs: 46, fat: 28 } },
      { name: 'Bacon Ranch Wrap', macros: { cal: 419, protein: 20, carbs: 24, fat: 28 } },
    ],
  },
  {
    emoji: '🧆',
    label: 'Quesadillas',
    items: [
      { name: 'Cheese Quesadilla', macros: { cal: 355, protein: 13, carbs: 24, fat: 23 } },
      { name: 'Chicken Quesadilla', macros: { cal: 449, protein: 19, carbs: 31, fat: 28 } },
      { name: 'Beef Quesadilla', macros: { cal: 514, protein: 22, carbs: 42, fat: 29 } },
    ],
  },
  {
    emoji: '🍗',
    label: 'Chicken Strips',
    items: [
      { name: 'Chicken Strips (3)', macros: { cal: 660, protein: 36, carbs: 60, fat: 33 } },
      { name: 'Chicken Strip Sandwich', macros: { cal: 674, protein: 28, carbs: 71, fat: 32 } },
      { name: 'Chicken Strip Club', macros: { cal: 846, protein: 39, carbs: 70, fat: 48 } },
      { name: 'Chicken Nuggets (Full)', macros: { cal: 240, protein: 16, carbs: 12, fat: 18 } },
      { name: 'Chicken Nuggets (Side)', macros: { cal: 144, protein: 10, carbs: 7, fat: 11 } },
    ],
  },
  {
    emoji: '🍟',
    label: 'Sides',
    items: [
      { name: 'Large Fries', macros: { cal: 694, protein: 7, carbs: 89, fat: 34 } },
      { name: 'Regular Fries', macros: { cal: 347, protein: 4, carbs: 45, fat: 17 } },
      { name: 'Cook Out Fries', macros: { cal: 465, protein: 7, carbs: 49, fat: 21 } },
      { name: 'Onion Rings (Full)', macros: { cal: 256, protein: 6, carbs: 56, fat: 2 } },
      { name: 'Onion Rings (Side)', macros: { cal: 128, protein: 3, carbs: 28, fat: 1 } },
      { name: 'Hushpuppies (Full)', macros: { cal: 600, protein: 3, carbs: 93, fat: 18 } },
      { name: 'Hushpuppies (Side)', macros: { cal: 300, protein: 2, carbs: 47, fat: 9 } },
      { name: 'Cook Out Rounds (Full)', macros: { cal: 298, protein: 8, carbs: 30, fat: 17 } },
      { name: 'Cook Out Rounds (Side)', macros: { cal: 149, protein: 4, carbs: 15, fat: 8 } },
      { name: 'Cheese Curds (Full)', macros: { cal: 299, protein: 16, carbs: 14, fat: 19 } },
      { name: 'Cheese Curds (Side)', macros: { cal: 150, protein: 8, carbs: 7, fat: 10 } },
      { name: 'BLT Sandwich', macros: { cal: 392, protein: 15, carbs: 29, fat: 25 } },
      { name: 'Okra', macros: { cal: 228, protein: 3, carbs: 26, fat: 13 } },
      { name: 'Side of Chili', macros: { cal: 164, protein: 5, carbs: 4, fat: 3 } },
      { name: 'Side of Slaw', macros: { cal: 405, protein: 0, carbs: 30, fat: 32 } },
      { name: 'Mustard Relish Hot Dog', macros: { cal: 394, protein: 11, carbs: 50, fat: 16 } },
    ],
  },
  {
    emoji: '🥤',
    label: 'Drinks',
    items: [
      { name: 'Coca-Cola (Small 12oz)', macros: { cal: 105, protein: 0, carbs: 29, fat: 0 } },
      { name: 'Coca-Cola (Regular 16oz)', macros: { cal: 140, protein: 0, carbs: 39, fat: 0 } },
      { name: 'Coca-Cola (Large 24oz)', macros: { cal: 210, protein: 0, carbs: 59, fat: 0 } },
      { name: 'Coca-Cola (Huge 32oz)', macros: { cal: 280, protein: 0, carbs: 78, fat: 0 } },
      { name: 'Sweet Tea (Small 12oz)', macros: { cal: 177, protein: 0, carbs: 56, fat: 0 } },
      { name: 'Sweet Tea (Regular 16oz)', macros: { cal: 236, protein: 0, carbs: 74, fat: 0 } },
      { name: 'Sweet Tea (Large 24oz)', macros: { cal: 248, protein: 0, carbs: 111, fat: 0 } },
      { name: 'Sweet Tea (Huge 32oz)', macros: { cal: 330, protein: 0, carbs: 148, fat: 0 } },
      { name: 'Sprite (Regular 16oz)', macros: { cal: 139, protein: 0, carbs: 31, fat: 0 } },
      { name: 'Sprite (Large 24oz)', macros: { cal: 222, protein: 0, carbs: 50, fat: 0 } },
      { name: 'Coke Float (16oz)', macros: { cal: 399, protein: 10, carbs: 69, fat: 11 } },
      { name: 'Cheerwine Float (16oz)', macros: { cal: 401, protein: 10, carbs: 69, fat: 11 } },
    ],
  },
  {
    emoji: '🍦',
    label: 'Milkshakes',
    items: [
      { name: 'Vanilla Milkshake', macros: { cal: 555, protein: 16, carbs: 86, fat: 18 } },
      { name: 'Hershey\'s Chocolate Milkshake', macros: { cal: 620, protein: 16, carbs: 110, fat: 18 } },
      { name: 'Strawberry Milkshake', macros: { cal: 610, protein: 15, carbs: 105, fat: 17 } },
      { name: 'Fresh Banana Milkshake', macros: { cal: 538, protein: 15, carbs: 89, fat: 16 } },
      { name: 'Banana Berry Milkshake', macros: { cal: 671, protein: 15, carbs: 123, fat: 16 } },
      { name: 'Banana Fudge Milkshake', macros: { cal: 772, protein: 17, carbs: 130, fat: 24 } },
      { name: 'Banana Pudding Milkshake', macros: { cal: 781, protein: 16, carbs: 126, fat: 26 } },
      { name: 'Fresh Peanut Butter Milkshake', macros: { cal: 847, protein: 27, carbs: 91, fat: 45 } },
      { name: 'Peanut Butter Banana Milkshake', macros: { cal: 864, protein: 27, carbs: 99, fat: 43 } },
      { name: 'Peanut Butter Fudge Milkshake', macros: { cal: 765, protein: 21, carbs: 101, fat: 34 } },
      { name: 'Oreo Milkshake', macros: { cal: 802, protein: 17, carbs: 125, fat: 29 } },
      { name: 'M&M Milkshake', macros: { cal: 755, protein: 17, carbs: 114, fat: 27 } },
      { name: 'Snickers Milkshake', macros: { cal: 720, protein: 19, carbs: 107, fat: 27 } },
      { name: 'Reese\'s Cup Milkshake', macros: { cal: 894, protein: 24, carbs: 121, fat: 37 } },
      { name: 'Cherry Cheesecake Milkshake', macros: { cal: 925, protein: 21, carbs: 119, fat: 42 } },
      { name: 'Chocolate Chip Milkshake', macros: { cal: 783, protein: 18, carbs: 107, fat: 32 } },
      { name: 'Blueberry Milkshake', macros: { cal: 617, protein: 15, carbs: 107, fat: 17 } },
      { name: 'Peach Milkshake', macros: { cal: 547, protein: 15, carbs: 91, fat: 17 } },
      { name: 'Caramel Milkshake', macros: { cal: 560, protein: 15, carbs: 91, fat: 17 } },
      { name: 'Caramel Fudge Milkshake', macros: { cal: 677, protein: 16, carbs: 111, fat: 21 } },
      { name: 'Mint Milkshake', macros: { cal: 605, protein: 16, carbs: 99, fat: 18 } },
      { name: 'Fudge Milkshake', macros: { cal: 754, protein: 17, carbs: 122, fat: 25 } },
      { name: 'Walnut Milkshake', macros: { cal: 853, protein: 15, carbs: 109, fat: 40 } },
    ],
  },
]

export default function CookOutMealBuilder({ onAdd }: {
  onAdd: (name: string, cal: number, protein: number, carbs: number, fat: number) => void
}) {
  const [step, setStep] = useState<'category' | 'item' | 'addon'>('category')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedAddOn, setSelectedAddOn] = useState<string | null>(null)

  const addOnEntry = selectedItem?.addOns?.find(a => a.name === selectedAddOn)
  const totalMacros: Macros = selectedItem
    ? {
        cal: selectedItem.macros.cal + (addOnEntry?.macros.cal ?? 0),
        protein: selectedItem.macros.protein + (addOnEntry?.macros.protein ?? 0),
        carbs: selectedItem.macros.carbs + (addOnEntry?.macros.carbs ?? 0),
        fat: selectedItem.macros.fat + (addOnEntry?.macros.fat ?? 0),
      }
    : { cal: 0, protein: 0, carbs: 0, fat: 0 }

  function handleAdd() {
    if (!selectedItem) return
    const name = selectedAddOn
      ? `Cook Out ${selectedItem.name} (${selectedAddOn})`
      : `Cook Out ${selectedItem.name}`
    onAdd(name, totalMacros.cal, totalMacros.protein, totalMacros.carbs, totalMacros.fat)
  }

  return (
    <div>
      {/* Running totals */}
      {selectedItem && (
        <div className="glass-blue rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">Your Order</p>
              <p className="text-2xl font-black text-white">{totalMacros.cal} <span className="text-sm font-bold text-slate-400">cal</span></p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-lg font-black text-white">{totalMacros.protein}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-400">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">{totalMacros.carbs}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-white">{totalMacros.fat}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Fat</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Category */}
      {step === 'category' && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">What are you getting?</p>
          {MENU.map(cat => (
            <button
              key={cat.label}
              onClick={() => { setSelectedCategory(cat); setSelectedItem(null); setSelectedAddOn(null); setStep('item') }}
              className="w-full glass border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:border-blue-500/40 transition-all text-left"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="font-bold text-white">{cat.label}</span>
              <span className="ml-auto text-slate-600 text-sm">›</span>
            </button>
          ))}
        </div>
      )}

      {/* Step: Item */}
      {step === 'item' && selectedCategory && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{selectedCategory.emoji} {selectedCategory.label}</p>
          {selectedCategory.items.map(item => (
            <button
              key={item.name}
              onClick={() => { setSelectedItem(item); setSelectedAddOn(null); setStep('addon') }}
              className="w-full glass border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between hover:border-blue-500/40 transition-all text-left"
            >
              <div>
                <p className="font-bold text-white text-sm">{item.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.macros.cal} cal · {item.macros.protein}g P · {item.macros.carbs}g C · {item.macros.fat}g F</p>
              </div>
              <span className="text-slate-600 text-sm ml-3 shrink-0">›</span>
            </button>
          ))}
          <button onClick={() => setStep('category')} className="mt-2 text-xs font-bold text-slate-500 hover:text-slate-300">← Back</button>
        </div>
      )}

      {/* Step: Add-on / confirm */}
      {step === 'addon' && selectedItem && (
        <div className="space-y-3">
          <div className="glass rounded-2xl p-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">Selected</p>
            <p className="font-bold text-white">{selectedItem.name}</p>
            <p className="text-xs text-slate-400">{selectedItem.macros.cal} cal · {selectedItem.macros.protein}g P</p>
          </div>

          {selectedItem.addOns && selectedItem.addOns.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Style (optional)</p>
              <button
                onClick={() => setSelectedAddOn(null)}
                className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between border transition-all mb-1.5 ${selectedAddOn === null ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
              >
                <span className="text-sm font-bold text-white">Plain (no style)</span>
                {selectedAddOn === null && <Check size={14} className="text-blue-400" />}
              </button>
              {selectedItem.addOns.map(addon => (
                <button
                  key={addon.name}
                  onClick={() => setSelectedAddOn(addon.name)}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between border transition-all mb-1.5 ${selectedAddOn === addon.name ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-white/20'}`}
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{addon.name}</p>
                    {addon.macros.cal > 0 && (
                      <p className="text-xs text-slate-400">+{addon.macros.cal} cal · +{addon.macros.protein}g P</p>
                    )}
                  </div>
                  {selectedAddOn === addon.name && <Check size={14} className="text-blue-400 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          )}

          <button onClick={handleAdd} className="w-full py-3 rounded-2xl btn-blue text-white font-bold text-sm mt-2">
            Add to Log ✓
          </button>
          <button onClick={() => setStep('item')} className="text-xs font-bold text-slate-500 hover:text-slate-300">← Back</button>
        </div>
      )}
    </div>
  )
}
