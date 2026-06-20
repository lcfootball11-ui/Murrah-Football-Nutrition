'use client'

import { useState } from 'react'

type Macros = { cal: number; protein: number; carbs: number; fat: number }
export type FFMenuItem = { name: string; macros: Macros }
export type FFCategory = { emoji: string; label: string; items: FFMenuItem[] }

export const MCDONALDS_MENU: FFCategory[] = [
  {
    emoji: '🍔', label: 'Burgers & Sandwiches',
    items: [
      { name: 'Big Mac',                         macros: { cal: 550, protein: 25, carbs: 46, fat: 30 } },
      { name: 'Quarter Pounder w/ Cheese',        macros: { cal: 530, protein: 30, carbs: 43, fat: 27 } },
      { name: 'Double Quarter Pounder w/ Cheese', macros: { cal: 740, protein: 48, carbs: 44, fat: 42 } },
      { name: 'McDouble',                         macros: { cal: 400, protein: 22, carbs: 34, fat: 20 } },
      { name: 'Double Cheeseburger',              macros: { cal: 440, protein: 25, carbs: 34, fat: 23 } },
      { name: 'Cheeseburger',                     macros: { cal: 300, protein: 15, carbs: 32, fat: 12 } },
      { name: 'Hamburger',                        macros: { cal: 260, protein: 13, carbs: 32, fat: 9  } },
    ],
  },
  {
    emoji: '🍗', label: 'Chicken',
    items: [
      { name: 'Crispy Chicken Sandwich',     macros: { cal: 470, protein: 27, carbs: 45, fat: 20 } },
      { name: 'Spicy Crispy Chicken Sandwich',macros: { cal: 530, protein: 27, carbs: 50, fat: 24 } },
      { name: 'McChicken',                   macros: { cal: 400, protein: 14, carbs: 42, fat: 19 } },
      { name: 'Chicken McNuggets 6pc',        macros: { cal: 250, protein: 15, carbs: 15, fat: 14 } },
      { name: 'Chicken McNuggets 10pc',       macros: { cal: 410, protein: 25, carbs: 26, fat: 24 } },
      { name: 'Chicken McNuggets 20pc',       macros: { cal: 830, protein: 50, carbs: 51, fat: 49 } },
    ],
  },
  {
    emoji: '🍳', label: 'Breakfast',
    items: [
      { name: 'Egg McMuffin',                     macros: { cal: 310, protein: 17, carbs: 30, fat: 13 } },
      { name: 'Sausage McMuffin',                 macros: { cal: 400, protein: 14, carbs: 29, fat: 24 } },
      { name: 'Sausage McMuffin w/ Egg',          macros: { cal: 480, protein: 21, carbs: 30, fat: 29 } },
      { name: 'Bacon, Egg & Cheese Biscuit',      macros: { cal: 460, protein: 19, carbs: 38, fat: 25 } },
      { name: 'Sausage Biscuit',                  macros: { cal: 430, protein: 11, carbs: 37, fat: 27 } },
      { name: 'Sausage, Egg & Cheese McGriddle',  macros: { cal: 550, protein: 20, carbs: 48, fat: 29 } },
      { name: 'Big Breakfast',                    macros: { cal: 760, protein: 28, carbs: 51, fat: 51 } },
      { name: 'Hotcakes (3)',                     macros: { cal: 590, protein: 9,  carbs: 102, fat: 15 } },
      { name: 'Hash Browns',                      macros: { cal: 150, protein: 1,  carbs: 15, fat: 9  } },
    ],
  },
  {
    emoji: '🍟', label: 'Sides',
    items: [
      { name: 'Large Fries',   macros: { cal: 490, protein: 7, carbs: 66, fat: 23 } },
      { name: 'Medium Fries',  macros: { cal: 320, protein: 4, carbs: 44, fat: 15 } },
      { name: 'Small Fries',   macros: { cal: 230, protein: 3, carbs: 30, fat: 11 } },
      { name: 'Apple Slices',  macros: { cal: 15,  protein: 0, carbs: 4,  fat: 0  } },
      { name: 'Side Salad',    macros: { cal: 15,  protein: 1, carbs: 3,  fat: 0  } },
    ],
  },
  {
    emoji: '🍦', label: 'Desserts & Shakes',
    items: [
      { name: 'Vanilla McFlurry (medium)',    macros: { cal: 510, protein: 13, carbs: 80, fat: 16 } },
      { name: 'Oreo McFlurry (medium)',       macros: { cal: 510, protein: 13, carbs: 80, fat: 16 } },
      { name: 'Chocolate Shake (medium)',     macros: { cal: 630, protein: 16, carbs: 89, fat: 21 } },
      { name: 'Vanilla Shake (medium)',       macros: { cal: 530, protein: 14, carbs: 77, fat: 16 } },
      { name: 'Strawberry Shake (medium)',    macros: { cal: 560, protein: 13, carbs: 84, fat: 16 } },
      { name: 'Baked Apple Pie',             macros: { cal: 240, protein: 2,  carbs: 38, fat: 11 } },
      { name: 'Vanilla Cone',               macros: { cal: 200, protein: 5,  carbs: 31, fat: 6  } },
    ],
  },
]

export const WENDYS_MENU: FFCategory[] = [
  {
    emoji: '🍔', label: 'Burgers',
    items: [
      { name: "Dave's Single",  macros: { cal: 570, protein: 30, carbs: 40, fat: 32 } },
      { name: "Dave's Double",  macros: { cal: 830, protein: 55, carbs: 41, fat: 48 } },
      { name: "Dave's Triple",  macros: { cal: 1090, protein: 80, carbs: 42, fat: 64 } },
      { name: 'Baconator',      macros: { cal: 940, protein: 58, carbs: 38, fat: 59 } },
      { name: 'Son of Baconator', macros: { cal: 640, protein: 38, carbs: 36, fat: 38 } },
      { name: 'Jr. Cheeseburger', macros: { cal: 280, protein: 14, carbs: 26, fat: 13 } },
      { name: 'Jr. Bacon Cheeseburger', macros: { cal: 380, protein: 20, carbs: 26, fat: 20 } },
    ],
  },
  {
    emoji: '🍗', label: 'Chicken',
    items: [
      { name: 'Classic Chicken Sandwich',      macros: { cal: 470, protein: 28, carbs: 50, fat: 17 } },
      { name: 'Spicy Chicken Sandwich',        macros: { cal: 500, protein: 33, carbs: 52, fat: 17 } },
      { name: 'Crispy Chicken BLT',            macros: { cal: 570, protein: 35, carbs: 52, fat: 23 } },
      { name: 'Chicken Nuggets 6pc',           macros: { cal: 250, protein: 13, carbs: 16, fat: 15 } },
      { name: 'Chicken Nuggets 10pc',          macros: { cal: 420, protein: 22, carbs: 27, fat: 25 } },
      { name: 'Spicy Nuggets 6pc',             macros: { cal: 250, protein: 13, carbs: 16, fat: 15 } },
      { name: 'Spicy Nuggets 10pc',            macros: { cal: 420, protein: 23, carbs: 26, fat: 24 } },
    ],
  },
  {
    emoji: '🥗', label: 'Sides & More',
    items: [
      { name: 'Large Fries',          macros: { cal: 540, protein: 7,  carbs: 73, fat: 25 } },
      { name: 'Medium Fries',         macros: { cal: 420, protein: 5,  carbs: 56, fat: 19 } },
      { name: 'Small Fries',          macros: { cal: 230, protein: 3,  carbs: 31, fat: 11 } },
      { name: 'Chili (large)',         macros: { cal: 330, protein: 26, carbs: 32, fat: 9  } },
      { name: 'Chili (small)',         macros: { cal: 200, protein: 16, carbs: 20, fat: 5  } },
      { name: 'Baked Potato (plain)',  macros: { cal: 270, protein: 7,  carbs: 61, fat: 0  } },
      { name: 'Baked Potato (cheese)', macros: { cal: 400, protein: 10, carbs: 62, fat: 13 } },
      { name: 'Apple Bites',           macros: { cal: 35,  protein: 0,  carbs: 8,  fat: 0  } },
    ],
  },
  {
    emoji: '🍦', label: 'Frosty & Desserts',
    items: [
      { name: 'Chocolate Frosty (medium)', macros: { cal: 460, protein: 12, carbs: 75, fat: 12 } },
      { name: 'Chocolate Frosty (small)',  macros: { cal: 320, protein: 8,  carbs: 53, fat: 8  } },
      { name: 'Vanilla Frosty (medium)',   macros: { cal: 460, protein: 12, carbs: 74, fat: 12 } },
      { name: 'Vanilla Frosty (small)',    macros: { cal: 320, protein: 8,  carbs: 52, fat: 8  } },
      { name: 'Frosty Cream Cold Brew',    macros: { cal: 250, protein: 4,  carbs: 45, fat: 7  } },
    ],
  },
]

export const WHATABURGER_MENU: FFCategory[] = [
  {
    emoji: '🍔', label: 'Burgers',
    items: [
      { name: 'Whataburger',          macros: { cal: 590, protein: 30, carbs: 61, fat: 26 } },
      { name: 'Double Whataburger',   macros: { cal: 890, protein: 52, carbs: 63, fat: 50 } },
      { name: 'Triple Whataburger',   macros: { cal: 1180, protein: 73, carbs: 65, fat: 74 } },
      { name: 'Whataburger Jr.',      macros: { cal: 310, protein: 16, carbs: 32, fat: 13 } },
      { name: 'Jalapeño & Cheese Whataburger', macros: { cal: 650, protein: 31, carbs: 63, fat: 31 } },
      { name: 'Mushroom Swiss Burger',macros: { cal: 700, protein: 36, carbs: 55, fat: 36 } },
      { name: 'Bacon & Cheese Whataburger', macros: { cal: 670, protein: 35, carbs: 62, fat: 32 } },
    ],
  },
  {
    emoji: '🍗', label: 'Chicken',
    items: [
      { name: "Whatachick'n Sandwich",          macros: { cal: 500, protein: 26, carbs: 59, fat: 17 } },
      { name: 'Spicy Chicken Sandwich',         macros: { cal: 510, protein: 28, carbs: 59, fat: 19 } },
      { name: 'Chicken Strips 3pc',             macros: { cal: 410, protein: 30, carbs: 29, fat: 19 } },
      { name: 'Chicken Strips 5pc',             macros: { cal: 690, protein: 49, carbs: 48, fat: 32 } },
      { name: 'Honey BBQ Chicken Strip Sandwich',macros: { cal: 720, protein: 39, carbs: 76, fat: 28 } },
      { name: 'Grilled Chicken Sandwich',       macros: { cal: 370, protein: 30, carbs: 38, fat: 10 } },
    ],
  },
  {
    emoji: '🍳', label: 'Breakfast',
    items: [
      { name: 'Breakfast on a Bun (Egg & Cheese)',         macros: { cal: 430, protein: 19, carbs: 39, fat: 22 } },
      { name: 'Breakfast on a Bun (Sausage, Egg & Cheese)',macros: { cal: 620, protein: 27, carbs: 40, fat: 38 } },
      { name: 'Taquito w/ Cheese',                         macros: { cal: 380, protein: 18, carbs: 32, fat: 19 } },
      { name: 'Biscuit w/ Egg & Cheese',                   macros: { cal: 480, protein: 16, carbs: 45, fat: 26 } },
      { name: 'Pancakes (3)',                              macros: { cal: 590, protein: 10, carbs: 111,fat: 12 } },
      { name: 'Cinnamon Roll',                             macros: { cal: 400, protein: 5,  carbs: 59, fat: 16 } },
    ],
  },
  {
    emoji: '🍟', label: 'Sides',
    items: [
      { name: 'Large Fries',         macros: { cal: 600, protein: 8, carbs: 79, fat: 28 } },
      { name: 'Medium Fries',        macros: { cal: 400, protein: 5, carbs: 52, fat: 19 } },
      { name: 'Small Fries',         macros: { cal: 280, protein: 4, carbs: 37, fat: 13 } },
      { name: 'Onion Rings (large)', macros: { cal: 430, protein: 6, carbs: 52, fat: 21 } },
      { name: 'Onion Rings (small)', macros: { cal: 250, protein: 4, carbs: 30, fat: 12 } },
      { name: 'Apple Slices',        macros: { cal: 30,  protein: 0, carbs: 8,  fat: 0  } },
    ],
  },
  {
    emoji: '🥤', label: 'Shakes',
    items: [
      { name: 'Chocolate Shake (medium)',   macros: { cal: 680, protein: 17, carbs: 94, fat: 26 } },
      { name: 'Vanilla Shake (medium)',     macros: { cal: 680, protein: 18, carbs: 92, fat: 27 } },
      { name: 'Strawberry Shake (medium)',  macros: { cal: 670, protein: 16, carbs: 93, fat: 25 } },
      { name: 'Cookies & Cream Shake (med)',macros: { cal: 780, protein: 18, carbs: 105,fat: 30 } },
    ],
  },
]

export const RALLYS_MENU: FFCategory[] = [
  {
    emoji: '🍔', label: 'Burgers',
    items: [
      { name: 'Big Buford',             macros: { cal: 740, protein: 45, carbs: 42, fat: 44 } },
      { name: 'Baconzilla',             macros: { cal: 820, protein: 47, carbs: 42, fat: 52 } },
      { name: 'Deep Sea Double',        macros: { cal: 630, protein: 28, carbs: 58, fat: 31 } },
      { name: 'Rallyburger',            macros: { cal: 360, protein: 18, carbs: 35, fat: 16 } },
      { name: 'Double Rallyburger',     macros: { cal: 530, protein: 30, carbs: 36, fat: 28 } },
      { name: 'Fully Loaded Burger',    macros: { cal: 590, protein: 32, carbs: 40, fat: 33 } },
    ],
  },
  {
    emoji: '🍗', label: 'Chicken',
    items: [
      { name: 'Classic Chicken Sandwich', macros: { cal: 390, protein: 17, carbs: 45, fat: 16 } },
      { name: 'Spicy Chicken Sandwich',   macros: { cal: 430, protein: 18, carbs: 45, fat: 19 } },
      { name: 'Mother Cruncher',          macros: { cal: 640, protein: 22, carbs: 68, fat: 31 } },
      { name: 'Chicken Bites 6pc',        macros: { cal: 290, protein: 16, carbs: 25, fat: 14 } },
      { name: 'Chicken Bites 10pc',       macros: { cal: 470, protein: 26, carbs: 40, fat: 22 } },
    ],
  },
  {
    emoji: '🍟', label: 'Fries & Sides',
    items: [
      { name: 'Large Fries',              macros: { cal: 430, protein: 5,  carbs: 57, fat: 21 } },
      { name: 'Medium Fries',             macros: { cal: 310, protein: 4,  carbs: 41, fat: 15 } },
      { name: 'Fully Loaded Fries (reg)', macros: { cal: 670, protein: 22, carbs: 66, fat: 38 } },
      { name: 'Funnel Cake Fries',        macros: { cal: 340, protein: 4,  carbs: 46, fat: 16 } },
      { name: 'Cheese Fries',             macros: { cal: 420, protein: 8,  carbs: 53, fat: 20 } },
      { name: 'Onion Rings',             macros: { cal: 350, protein: 4,  carbs: 43, fat: 18 } },
    ],
  },
  {
    emoji: '🍦', label: 'Desserts & Shakes',
    items: [
      { name: 'Milkshake Chocolate (reg)',  macros: { cal: 490, protein: 10, carbs: 77, fat: 17 } },
      { name: 'Milkshake Vanilla (reg)',    macros: { cal: 470, protein: 10, carbs: 74, fat: 17 } },
      { name: 'Milkshake Strawberry (reg)', macros: { cal: 480, protein: 10, carbs: 75, fat: 17 } },
      { name: 'Cookie Dough Milkshake',     macros: { cal: 620, protein: 11, carbs: 94, fat: 24 } },
    ],
  },
]

export default function FastFoodMealBuilder({
  restaurantName,
  menu,
  onAdd,
}: {
  restaurantName: string
  menu: FFCategory[]
  onAdd: (name: string, cal: number, protein: number, carbs: number, fat: number) => void
}) {
  const [step, setStep] = useState<'category' | 'item'>('category')
  const [selectedCategory, setSelectedCategory] = useState<FFCategory | null>(null)
  const [selectedItem, setSelectedItem] = useState<FFMenuItem | null>(null)

  function handleAdd() {
    if (!selectedItem) return
    onAdd(
      `${restaurantName} ${selectedItem.name}`,
      selectedItem.macros.cal,
      selectedItem.macros.protein,
      selectedItem.macros.carbs,
      selectedItem.macros.fat
    )
  }

  return (
    <div>
      {/* Running total — shows once an item is picked */}
      {selectedItem && (
        <div className="glass-blue rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">Selected</p>
              <p className="text-2xl font-black text-white">{selectedItem.macros.cal} <span className="text-sm font-bold text-slate-400">cal</span></p>
            </div>
            <div className="flex gap-4">
              {(['protein', 'carbs', 'fat'] as const).map(k => (
                <div key={k} className="text-center">
                  <p className="text-lg font-black text-white">{selectedItem.macros[k]}</p>
                  <p className={`text-xs font-bold uppercase tracking-wide ${k === 'protein' ? 'text-blue-400' : 'text-slate-400'}`}>{k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category list */}
      {step === 'category' && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">What are you getting?</p>
          {menu.map(cat => (
            <button
              key={cat.label}
              onClick={() => { setSelectedCategory(cat); setSelectedItem(null); setStep('item') }}
              className="w-full glass border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:border-blue-500/40 transition-all text-left"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="font-bold text-white">{cat.label}</span>
              <span className="ml-auto text-slate-600 text-sm">›</span>
            </button>
          ))}
        </div>
      )}

      {/* Item list */}
      {step === 'item' && selectedCategory && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{selectedCategory.emoji} {selectedCategory.label}</p>
          {selectedCategory.items.map(item => (
            <button
              key={item.name}
              onClick={() => setSelectedItem(item)}
              className={`w-full rounded-2xl px-4 py-3 flex items-center justify-between border transition-all text-left ${selectedItem?.name === item.name ? 'bg-blue-500/20 border-blue-500/50' : 'glass border-white/10 hover:border-blue-500/30'}`}
            >
              <div>
                <p className="font-bold text-white text-sm">{item.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {item.macros.cal} cal · {item.macros.protein}g P · {item.macros.carbs}g C · {item.macros.fat}g F
                </p>
              </div>
              {selectedItem?.name === item.name && <span className="text-blue-400 text-lg ml-3 shrink-0">✓</span>}
            </button>
          ))}

          {selectedItem && (
            <button onClick={handleAdd} className="w-full py-3 rounded-2xl btn-blue text-white font-bold text-sm mt-2">
              Add to Log ✓
            </button>
          )}

          <button onClick={() => { setStep('category'); setSelectedItem(null) }} className="mt-1 text-xs font-bold text-slate-500 hover:text-slate-300">
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
