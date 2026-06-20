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
      { name: '#1 Whataburger',                    macros: { cal: 590,  protein: 29, carbs: 62, fat: 25 } },
      { name: '#2 Double Meat Whataburger',         macros: { cal: 830,  protein: 47, carbs: 62, fat: 44 } },
      { name: '#3 Triple Meat Whataburger',         macros: { cal: 1070, protein: 65, carbs: 62, fat: 63 } },
      { name: '#4 Jalapeño & Cheese Whataburger',   macros: { cal: 680,  protein: 34, carbs: 63, fat: 32 } },
      { name: '#5 Bacon & Cheese Whataburger',      macros: { cal: 750,  protein: 39, carbs: 62, fat: 37 } },
      { name: '#6 Avocado Bacon Burger',            macros: { cal: 820,  protein: 37, carbs: 52, fat: 52 } },
      { name: '#7 Whataburger Jr.',                 macros: { cal: 310,  protein: 14, carbs: 37, fat: 11 } },
      { name: '#8 Double Meat Whataburger Jr.',     macros: { cal: 420,  protein: 23, carbs: 37, fat: 20 } },
      { name: 'Bacon & Cheese Whataburger Jr.',     macros: { cal: 400,  protein: 21, carbs: 37, fat: 18 } },
      { name: 'Whataburger Patty Melt',             macros: { cal: 940,  protein: 49, carbs: 45, fat: 61 } },
      { name: 'Mushroom Swiss Burger',              macros: { cal: 1110, protein: 56, carbs: 61, fat: 70 } },
      { name: 'Honey BBQ Chicken Strip Sandwich',   macros: { cal: 890,  protein: 38, carbs: 87, fat: 42 } },
    ],
  },
  {
    emoji: '🍗', label: 'Chicken',
    items: [
      { name: "#10 Whatachick'n Sandwich (Whatasauce)", macros: { cal: 540, protein: 32, carbs: 54, fat: 22 } },
      { name: "#10 Whatachick'n Sandwich (Mayo)",       macros: { cal: 580, protein: 32, carbs: 52, fat: 28 } },
      { name: '#11 Grilled Chicken Sandwich (Whatasauce)', macros: { cal: 430, protein: 32, carbs: 44, fat: 14 } },
      { name: '#11 Grilled Chicken Sandwich (Mayo)',    macros: { cal: 470, protein: 32, carbs: 42, fat: 20 } },
      { name: '#12 Spicy Chicken Sandwich',            macros: { cal: 550, protein: 31, carbs: 50, fat: 26 } },
      { name: "#13 Whatachick'n Strips (3)",           macros: { cal: 460, protein: 24, carbs: 30, fat: 27 } },
      { name: "#14 Whatachick'n Bites (6)",            macros: { cal: 390, protein: 30, carbs: 25, fat: 19 } },
      { name: "#15 Whatachick'n Bites (9)",            macros: { cal: 580, protein: 45, carbs: 37, fat: 28 } },
      { name: 'Grilled Chicken Melt',                  macros: { cal: 390, protein: 33, carbs: 39, fat: 11 } },
    ],
  },
  {
    emoji: '🍳', label: 'Breakfast',
    items: [
      { name: 'Taquito w/ Cheese & Bacon',          macros: { cal: 400, protein: 20, carbs: 29, fat: 23 } },
      { name: 'Taquito w/ Cheese & Sausage',        macros: { cal: 420, protein: 19, carbs: 28, fat: 26 } },
      { name: 'Taquito w/ Cheese & Potato',         macros: { cal: 440, protein: 17, carbs: 38, fat: 25 } },
      { name: 'Breakfast on a Bun w/ Bacon',        macros: { cal: 360, protein: 18, carbs: 35, fat: 16 } },
      { name: 'Breakfast on a Bun w/ Sausage',      macros: { cal: 510, protein: 27, carbs: 35, fat: 28 } },
      { name: 'Biscuit Sandwich w/ Bacon',          macros: { cal: 490, protein: 18, carbs: 35, fat: 31 } },
      { name: 'Biscuit Sandwich w/ Sausage',        macros: { cal: 640, protein: 27, carbs: 35, fat: 44 } },
      { name: 'Honey Butter Chicken Biscuit',       macros: { cal: 580, protein: 13, carbs: 52, fat: 36 } },
      { name: 'Pancake Platter w/ Bacon',           macros: { cal: 680, protein: 12, carbs: 109, fat: 21 } },
      { name: 'Pancake Platter w/ Sausage',         macros: { cal: 830, protein: 21, carbs: 109, fat: 33 } },
      { name: 'Breakfast Platter w/ Bacon',         macros: { cal: 600, protein: 28, carbs: 39, fat: 38 } },
      { name: 'Breakfast Platter w/ Sausage',       macros: { cal: 750, protein: 37, carbs: 39, fat: 50 } },
      { name: 'Hashbrowns',                         macros: { cal: 190, protein: 2,  carbs: 21, fat: 11 } },
      { name: 'Cinnamon Roll',                      macros: { cal: 580, protein: 8,  carbs: 103, fat: 16 } },
    ],
  },
  {
    emoji: '🍟', label: 'Sides',
    items: [
      { name: 'Large French Fries',    macros: { cal: 530, protein: 6, carbs: 68, fat: 28 } },
      { name: 'Medium French Fries',   macros: { cal: 400, protein: 4, carbs: 51, fat: 21 } },
      { name: 'Small French Fries',    macros: { cal: 270, protein: 3, carbs: 34, fat: 14 } },
      { name: 'Large Onion Rings',     macros: { cal: 450, protein: 7, carbs: 49, fat: 25 } },
      { name: 'Medium Onion Rings',    macros: { cal: 300, protein: 4, carbs: 33, fat: 17 } },
      { name: 'Apple Slices',          macros: { cal: 30,  protein: 0, carbs: 8,  fat: 0  } },
      { name: 'Hot Apple Pie',         macros: { cal: 270, protein: 3, carbs: 34, fat: 14 } },
      { name: 'Hot Lemon Pie',         macros: { cal: 320, protein: 4, carbs: 41, fat: 16 } },
    ],
  },
  {
    emoji: '🥤', label: 'Shakes & Malts',
    items: [
      { name: 'Chocolate Shake (small 16oz)',  macros: { cal: 440, protein: 10, carbs: 80,  fat: 11 } },
      { name: 'Chocolate Shake (medium 20oz)', macros: { cal: 560, protein: 13, carbs: 102, fat: 14 } },
      { name: 'Chocolate Shake (large 32oz)',  macros: { cal: 890, protein: 20, carbs: 159, fat: 23 } },
      { name: 'Vanilla Shake (small 16oz)',    macros: { cal: 410, protein: 10, carbs: 69,  fat: 12 } },
      { name: 'Vanilla Shake (medium 20oz)',   macros: { cal: 510, protein: 13, carbs: 86,  fat: 15 } },
      { name: 'Vanilla Shake (large 32oz)',    macros: { cal: 820, protein: 21, carbs: 137, fat: 24 } },
      { name: 'Strawberry Shake (small 16oz)', macros: { cal: 450, protein: 9,  carbs: 80,  fat: 11 } },
      { name: 'Strawberry Shake (medium 20oz)',macros: { cal: 560, protein: 12, carbs: 103, fat: 14 } },
      { name: 'Chocolate Malt (medium 20oz)',  macros: { cal: 590, protein: 12, carbs: 110, fat: 13 } },
      { name: 'Vanilla Malt (medium 20oz)',    macros: { cal: 540, protein: 12, carbs: 94,  fat: 14 } },
    ],
  },
]

export const RALLYS_MENU: FFCategory[] = [
  {
    emoji: '🍔', label: 'Burgers',
    items: [
      { name: 'Big Buford',                macros: { cal: 770,  protein: 30, carbs: 41, fat: 57 } },
      { name: 'Big Buford Triple',          macros: { cal: 1010, protein: 42, carbs: 41, fat: 78 } },
      { name: 'Baconzilla',                macros: { cal: 960,  protein: 46, carbs: 41, fat: 75 } },
      { name: 'Baconzilla Triple',          macros: { cal: 1210, protein: 58, carbs: 42, fat: 96 } },
      { name: 'Smoky BBQ Bacon Buford',     macros: { cal: 970,  protein: 44, carbs: 47, fat: 70 } },
      { name: 'Checker/Rallyburger',        macros: { cal: 390,  protein: 12, carbs: 33, fat: 28 } },
      { name: 'Double Checker/Rallyburger w/ Cheese', macros: { cal: 570, protein: 21, carbs: 34, fat: 43 } },
      { name: 'Cheese Champ',              macros: { cal: 530,  protein: 18, carbs: 40, fat: 37 } },
    ],
  },
  {
    emoji: '🍗', label: 'Chicken & Fish',
    items: [
      { name: 'Classic Mother Cruncher',       macros: { cal: 700,  protein: 28, carbs: 62, fat: 41 } },
      { name: 'Bacon BBQ Mother Cruncher',     macros: { cal: 960,  protein: 37, carbs: 87, fat: 53 } },
      { name: 'Spicy Chicken Sandwich',        macros: { cal: 580,  protein: 15, carbs: 38, fat: 49 } },
      { name: 'Double Spicy Chicken',          macros: { cal: 870,  protein: 27, carbs: 48, fat: 71 } },
      { name: 'Crispy Fish Sandwich',          macros: { cal: 460,  protein: 14, carbs: 51, fat: 23 } },
      { name: '8pc Chicken Bites (Classic)',   macros: { cal: 330,  protein: 14, carbs: 20, fat: 22 } },
      { name: 'Fry-Seasoned Tenders 3pc',      macros: { cal: 410,  protein: 27, carbs: 33, fat: 20 } },
      { name: 'Fry-Seasoned Tenders 5pc',      macros: { cal: 680,  protein: 44, carbs: 54, fat: 33 } },
    ],
  },
  {
    emoji: '🍗', label: 'Wings',
    items: [
      { name: '5pc Wings — Plain',              macros: { cal: 350,  protein: 35, carbs: 2,  fat: 23 } },
      { name: '5pc Wings — Angry Buffalo',      macros: { cal: 360,  protein: 35, carbs: 3,  fat: 23 } },
      { name: '5pc Wings — Sweet & Smoky BBQ',  macros: { cal: 430,  protein: 35, carbs: 19, fat: 23 } },
      { name: '5pc Wings — Garlic Parmesan',    macros: { cal: 510,  protein: 35, carbs: 3,  fat: 40 } },
      { name: '10pc Wings — Plain',             macros: { cal: 690,  protein: 68, carbs: 4,  fat: 44 } },
      { name: '10pc Wings — Angry Buffalo',     macros: { cal: 710,  protein: 69, carbs: 6,  fat: 45 } },
      { name: '10pc Wings — Sweet & Smoky BBQ', macros: { cal: 840,  protein: 69, carbs: 38, fat: 44 } },
      { name: '10pc Wings — Garlic Parmesan',   macros: { cal: 1010, protein: 69, carbs: 6,  fat: 79 } },
    ],
  },
  {
    emoji: '🍟', label: 'Fries & Sides',
    items: [
      { name: 'Fries — Small',                 macros: { cal: 390,  protein: 5,  carbs: 49, fat: 19 } },
      { name: 'Fries — Medium',                macros: { cal: 500,  protein: 7,  carbs: 63, fat: 24 } },
      { name: 'Fries — Large',                 macros: { cal: 590,  protein: 8,  carbs: 74, fat: 29 } },
      { name: 'Chili Cheese Fries (reg)',       macros: { cal: 540,  protein: 7,  carbs: 43, fat: 37 } },
      { name: 'Fully Loaded Fries (reg)',       macros: { cal: 870,  protein: 14, carbs: 46, fat: 62 } },
      { name: 'Fully Loaded Fries (large)',     macros: { cal: 1090, protein: 14, carbs: 68, fat: 80 } },
      { name: 'Funnel Cake Fries',             macros: { cal: 370,  protein: 2,  carbs: 38, fat: 23 } },
      { name: 'Monsterella Stix 4pc',          macros: { cal: 280,  protein: 12, carbs: 20, fat: 17 } },
      { name: 'Monsterella Stix 6pc',          macros: { cal: 420,  protein: 18, carbs: 29, fat: 25 } },
    ],
  },
  {
    emoji: '🍦', label: 'Shakes & Desserts',
    items: [
      { name: 'Milkshake Banana (16oz)',       macros: { cal: 350,  protein: 7,  carbs: 58, fat: 10 } },
      { name: 'Milkshake Banana (22oz)',       macros: { cal: 460,  protein: 9,  carbs: 77, fat: 13 } },
      { name: 'Milkshake Chocolate (16oz)',    macros: { cal: 380,  protein: 8,  carbs: 64, fat: 11 } },
      { name: 'Milkshake Chocolate (22oz)',    macros: { cal: 470,  protein: 10, carbs: 79, fat: 13 } },
      { name: 'Milkshake Strawberry (16oz)',   macros: { cal: 350,  protein: 7,  carbs: 57, fat: 10 } },
      { name: 'Milkshake Strawberry (22oz)',   macros: { cal: 460,  protein: 9,  carbs: 75, fat: 13 } },
      { name: 'Milkshake Vanilla (16oz)',      macros: { cal: 290,  protein: 7,  carbs: 44, fat: 10 } },
      { name: 'Milkshake Vanilla (22oz)',      macros: { cal: 390,  protein: 9,  carbs: 57, fat: 13 } },
      { name: 'Fudge Cheesecake Sundae',       macros: { cal: 500,  protein: 8,  carbs: 79, fat: 17 } },
      { name: 'Soft Serve Cone',               macros: { cal: 140,  protein: 3,  carbs: 21, fat: 5  } },
      { name: 'Apple Pie',                     macros: { cal: 270,  protein: 3,  carbs: 38, fat: 12 } },
    ],
  },
]

export const CHICKFILA_MENU: FFCategory[] = [
  {
    emoji: '🍳', label: 'Breakfast',
    items: [
      { name: 'Egg White Grill',                     macros: { cal: 300, protein: 27, carbs: 29, fat: 8  } },
      { name: 'Chick-n-Minis (4pc)',                 macros: { cal: 360, protein: 20, carbs: 41, fat: 13 } },
      { name: 'Chicken Biscuit',                     macros: { cal: 460, protein: 19, carbs: 45, fat: 23 } },
      { name: 'Spicy Chicken Biscuit',               macros: { cal: 450, protein: 19, carbs: 44, fat: 22 } },
      { name: 'Chicken, Egg & Cheese Biscuit',       macros: { cal: 550, protein: 27, carbs: 48, fat: 28 } },
      { name: 'Sausage, Egg & Cheese Biscuit',       macros: { cal: 620, protein: 22, carbs: 38, fat: 42 } },
      { name: 'Bacon, Egg & Cheese Biscuit',         macros: { cal: 420, protein: 15, carbs: 38, fat: 23 } },
      { name: 'Chicken, Egg & Cheese Muffin',        macros: { cal: 410, protein: 27, carbs: 36, fat: 18 } },
      { name: 'Sausage, Egg & Cheese Muffin',        macros: { cal: 490, protein: 23, carbs: 29, fat: 32 } },
      { name: 'Bacon, Egg & Cheese Muffin',          macros: { cal: 300, protein: 16, carbs: 28, fat: 13 } },
      { name: 'Hash Brown Scramble Bowl',            macros: { cal: 470, protein: 29, carbs: 19, fat: 30 } },
      { name: 'Hash Brown Scramble Burrito',         macros: { cal: 700, protein: 34, carbs: 51, fat: 40 } },
      { name: 'Hash Browns',                         macros: { cal: 270, protein: 3,  carbs: 23, fat: 18 } },
      { name: 'Berry Parfait',                       macros: { cal: 270, protein: 13, carbs: 35, fat: 9  } },
    ],
  },
  {
    emoji: '🍗', label: 'Sandwiches & Entrées',
    items: [
      { name: 'Chick-fil-A Chicken Sandwich',        macros: { cal: 420, protein: 29, carbs: 41, fat: 18 } },
      { name: 'Chick-fil-A Deluxe Sandwich',         macros: { cal: 490, protein: 32, carbs: 43, fat: 22 } },
      { name: 'Spicy Chicken Sandwich',              macros: { cal: 450, protein: 28, carbs: 45, fat: 19 } },
      { name: 'Spicy Deluxe Sandwich',               macros: { cal: 540, protein: 34, carbs: 47, fat: 26 } },
      { name: 'Grilled Chicken Sandwich',            macros: { cal: 390, protein: 28, carbs: 45, fat: 11 } },
      { name: 'Grilled Chicken Club Sandwich',       macros: { cal: 520, protein: 37, carbs: 45, fat: 22 } },
      { name: 'Honey Pepper Pimento Sandwich (CFA Filet)',     macros: { cal: 600, protein: 34, carbs: 53, fat: 30 } },
      { name: 'Honey Pepper Pimento Sandwich (Spicy Filet)',   macros: { cal: 620, protein: 33, carbs: 56, fat: 31 } },
      { name: 'Honey Pepper Pimento Sandwich (Grilled Filet)', macros: { cal: 450, protein: 30, carbs: 42, fat: 20 } },
      { name: 'Grilled Cool Wrap',                   macros: { cal: 660, protein: 43, carbs: 32, fat: 45 } },
      { name: 'Nuggets 8pc',                        macros: { cal: 250, protein: 27, carbs: 11, fat: 11 } },
      { name: 'Nuggets 12pc',                       macros: { cal: 380, protein: 41, carbs: 17, fat: 17 } },
      { name: 'Grilled Nuggets 8pc',                macros: { cal: 130, protein: 25, carbs: 1,  fat: 3  } },
      { name: 'Grilled Nuggets 12pc',               macros: { cal: 200, protein: 38, carbs: 2,  fat: 4  } },
      { name: 'Chick-n-Strips 3pc',                 macros: { cal: 310, protein: 29, carbs: 16, fat: 14 } },
      { name: 'Chick-n-Strips 4pc',                 macros: { cal: 420, protein: 39, carbs: 21, fat: 19 } },
    ],
  },
  {
    emoji: '🥗', label: 'Salads',
    items: [
      { name: 'Cobb Salad',                         macros: { cal: 830, protein: 42, carbs: 31, fat: 60 } },
      { name: 'Spicy Southwest Salad',              macros: { cal: 680, protein: 33, carbs: 27, fat: 49 } },
      { name: 'Market Salad',                       macros: { cal: 550, protein: 28, carbs: 42, fat: 31 } },
    ],
  },
  {
    emoji: '🍟', label: 'Sides',
    items: [
      { name: 'Waffle Potato Fries (medium)',        macros: { cal: 420, protein: 5,  carbs: 45, fat: 24 } },
      { name: 'Waffle Potato Fries (large)',         macros: { cal: 490, protein: 6,  carbs: 53, fat: 28 } },
      { name: 'Mac & Cheese',                       macros: { cal: 450, protein: 20, carbs: 28, fat: 29 } },
      { name: 'Chicken Noodle Soup',                macros: { cal: 190, protein: 11, carbs: 27, fat: 5  } },
      { name: 'Chicken Tortilla Soup',              macros: { cal: 280, protein: 24, carbs: 31, fat: 7  } },
      { name: 'Kale Crunch Side',                   macros: { cal: 170, protein: 4,  carbs: 13, fat: 12 } },
      { name: 'Fruit Cup (small)',                  macros: { cal: 70,  protein: 1,  carbs: 16, fat: 0  } },
      { name: 'Waffle Potato Chips',                macros: { cal: 220, protein: 3,  carbs: 25, fat: 13 } },
    ],
  },
  {
    emoji: '🍦', label: 'Treats & Shakes',
    items: [
      { name: 'Peach Milkshake',                    macros: { cal: 600, protein: 11, carbs: 101, fat: 18 } },
      { name: 'Chocolate Milkshake',                macros: { cal: 600, protein: 12, carbs: 93,  fat: 22 } },
      { name: 'Cookies & Cream Milkshake',          macros: { cal: 630, protein: 13, carbs: 91,  fat: 25 } },
      { name: 'Vanilla Milkshake',                  macros: { cal: 580, protein: 13, carbs: 82,  fat: 23 } },
      { name: 'Strawberry Milkshake',               macros: { cal: 560, protein: 10, carbs: 92,  fat: 18 } },
      { name: 'Frosted Lemonade',                   macros: { cal: 350, protein: 7,  carbs: 67,  fat: 7  } },
      { name: 'Frosted Coffee',                     macros: { cal: 260, protein: 7,  carbs: 45,  fat: 7  } },
      { name: 'Icedream Cone',                      macros: { cal: 180, protein: 4,  carbs: 32,  fat: 4  } },
      { name: 'Chocolate Fudge Brownie',            macros: { cal: 370, protein: 4,  carbs: 47,  fat: 21 } },
      { name: 'Chocolate Chunk Cookie',             macros: { cal: 370, protein: 5,  carbs: 49,  fat: 17 } },
    ],
  },
  {
    emoji: '🥤', label: 'Drinks',
    items: [
      { name: 'Lemonade (large)',                   macros: { cal: 260, protein: 0,  carbs: 66,  fat: 0  } },
      { name: 'Diet Lemonade (large)',              macros: { cal: 60,  protein: 0,  carbs: 15,  fat: 0  } },
      { name: 'Sweet Tea (large)',                  macros: { cal: 120, protein: 0,  carbs: 31,  fat: 0  } },
      { name: 'Iced Coffee',                        macros: { cal: 200, protein: 7,  carbs: 34,  fat: 4  } },
      { name: '1% Chocolate Milk',                  macros: { cal: 140, protein: 7,  carbs: 23,  fat: 2  } },
    ],
  },
]

export const BOSTONS_MENU: FFCategory[] = [
  {
    emoji: '🐟', label: 'Fish',
    items: [
      { name: '(2pc) Swai Fish Combo',              macros: { cal: 400, protein: 20, carbs: 50, fat: 15 } },
      { name: '(2pc) Tilapia Combo',                macros: { cal: 600, protein: 40, carbs: 50, fat: 20 } },
      { name: '(2pc) Pantrout Combo',               macros: { cal: 600, protein: 40, carbs: 70, fat: 20 } },
      { name: '(4pc) Pantrout',                     macros: { cal: 560, protein: 30, carbs: 50, fat: 20 } },
      { name: '(4pc) Swai Fish',                    macros: { cal: 260, protein: 24, carbs: 20, fat: 10 } },
      { name: 'Swai Fish Snack',                    macros: { cal: 250, protein: 15, carbs: 30, fat: 8  } },
      { name: 'Tilapia Fish Snack',                 macros: { cal: 300, protein: 20, carbs: 30, fat: 15 } },
      { name: 'Pantrout Fish Snack',                macros: { cal: 250, protein: 15, carbs: 20, fat: 12 } },
      { name: 'Pantrout Nuggets',                   macros: { cal: 250, protein: 15, carbs: 30, fat: 10 } },
      { name: 'Swai Fish Nuggets',                  macros: { cal: 250, protein: 15, carbs: 30, fat: 8  } },
    ],
  },
  {
    emoji: '🦐', label: 'Shrimp',
    items: [
      { name: 'Shrimp Dinner',                      macros: { cal: 600, protein: 35, carbs: 50, fat: 25 } },
      { name: '(12pc) Shrimp',                      macros: { cal: 120, protein: 23, carbs: 2,  fat: 2  } },
    ],
  },
  {
    emoji: '🍗', label: 'Wings & Chicken',
    items: [
      { name: '(6pc) Wings Combo (w/ side)',         macros: { cal: 900, protein: 50, carbs: 70, fat: 50 } },
      { name: '(6pc) Wings Combo',                  macros: { cal: 600, protein: 30, carbs: 50, fat: 30 } },
      { name: '10 Wings Combo',                     macros: { cal: 800, protein: 40, carbs: 60, fat: 45 } },
      { name: '10 Wings',                           macros: { cal: 800, protein: 45, carbs: 60, fat: 40 } },
      { name: 'Chicken Tenders (4pc)',              macros: { cal: 600, protein: 25, carbs: 70, fat: 25 } },
      { name: '(4pc) Halal Chicken Tenders',        macros: { cal: 400, protein: 25, carbs: 30, fat: 20 } },
      { name: 'Chicken Nuggets (10pc)',             macros: { cal: 290, protein: 15, carbs: 20, fat: 18 } },
      { name: '6 Shrimp & 6 Wings',                 macros: { cal: 450, protein: 35, carbs: 30, fat: 20 } },
    ],
  },
  {
    emoji: '🤝', label: 'Fish & Wing Combos',
    items: [
      { name: '(2pc) Swai Fish & (10) Wings',       macros: { cal: 860, protein: 48, carbs: 85, fat: 40 } },
      { name: '(2pc) Swai Fish & (4) Wings Combo',  macros: { cal: 700, protein: 45, carbs: 60, fat: 30 } },
      { name: '(2pc) Swai/Tilapia & (6) Wings',     macros: { cal: 650, protein: 40, carbs: 50, fat: 30 } },
      { name: '(10pc) Shrimp & (2pc) Swai Fish',    macros: { cal: 550, protein: 42, carbs: 45, fat: 20 } },
      { name: '(4pc) Shrimp & (2pc) Swai Fish',     macros: { cal: 400, protein: 30, carbs: 45, fat: 15 } },
      { name: '(2pc) Swai Fish & (4pc) Shrimp',     macros: { cal: 350, protein: 30, carbs: 40, fat: 15 } },
      { name: '(2pc) Swai/Tilapia & (6pc) Shrimp',  macros: { cal: 300, protein: 35, carbs: 10, fat: 12 } },
    ],
  },
  {
    emoji: '🍟', label: 'Sides',
    items: [
      { name: 'Large Cajun Ranch Fries',             macros: { cal: 900, protein: 20, carbs: 120, fat: 45 } },
      { name: 'Small Cajun Ranch Fries',             macros: { cal: 500, protein: 10, carbs: 60,  fat: 25 } },
      { name: 'Large Fries',                         macros: { cal: 365, protein: 4,  carbs: 66,  fat: 17 } },
      { name: 'Potato Salad (Small)',                macros: { cal: 350, protein: 8,  carbs: 45,  fat: 15 } },
      { name: 'Small Onion Rings',                  macros: { cal: 150, protein: 2,  carbs: 20,  fat: 8  } },
      { name: 'Small Okra',                         macros: { cal: 150, protein: 4,  carbs: 16,  fat: 9  } },
      { name: '3pc Hush Puppies',                   macros: { cal: 150, protein: 3,  carbs: 20,  fat: 8  } },
      { name: 'Large Drink',                        macros: { cal: 200, protein: 0,  carbs: 50,  fat: 0  } },
    ],
  },
]

export const LONGHORN_MENU: FFCategory[] = [
  {
    emoji: '🥩', label: 'Legendary Steaks',
    items: [
      { name: "Flo's Filet 6 oz.",               macros: { cal: 330,  protein: 37,  carbs: 2,  fat: 15 } },
      { name: "Flo's Filet 9 oz.",               macros: { cal: 450,  protein: 56,  carbs: 3,  fat: 19 } },
      { name: 'Renegade Sirloin 6 oz.',          macros: { cal: 320,  protein: 36,  carbs: 2,  fat: 15 } },
      { name: 'Renegade Sirloin 8 oz.',          macros: { cal: 390,  protein: 51,  carbs: 2,  fat: 16 } },
      { name: 'Ribeye 12 oz.',                   macros: { cal: 810,  protein: 66,  carbs: 4,  fat: 54 } },
      { name: 'New York Strip 12 oz.',           macros: { cal: 630,  protein: 72,  carbs: 1,  fat: 33 } },
      { name: 'Fire-Grilled T-Bone 18 oz.',      macros: { cal: 1130, protein: 123, carbs: 1,  fat: 62 } },
      { name: 'The LongHorn 22 oz.',             macros: { cal: 1280, protein: 150, carbs: 1,  fat: 67 } },
      { name: 'Outlaw Ribeye 20 oz.',            macros: { cal: 1250, protein: 94,  carbs: 2,  fat: 87 } },
      { name: 'LongHorn Steak Tips',             macros: { cal: 620,  protein: 64,  carbs: 15, fat: 34 } },
      { name: 'Churrasco Steak w/ Plantains',    macros: { cal: 840,  protein: 49,  carbs: 47, fat: 52 } },
      { name: 'Chicken Fried Steak',             macros: { cal: 890,  protein: 60,  carbs: 48, fat: 51 } },
      { name: 'Chop Steak',                      macros: { cal: 640,  protein: 44,  carbs: 13, fat: 46 } },
    ],
  },
  {
    emoji: '🍗', label: 'Chicken, Burgers & Ribs',
    items: [
      { name: 'Lemon Garlic Chicken 9 oz.',      macros: { cal: 330,  protein: 53,  carbs: 2,  fat: 12 } },
      { name: 'Lemon Garlic Chicken 12 oz.',     macros: { cal: 420,  protein: 70,  carbs: 2,  fat: 15 } },
      { name: 'Blackened Chicken 9 oz.',         macros: { cal: 420,  protein: 52,  carbs: 5,  fat: 22 } },
      { name: 'Parmesan Crusted Chicken 9 oz.',  macros: { cal: 650,  protein: 68,  carbs: 12, fat: 36 } },
      { name: 'Parmesan Crusted Chicken 12 oz.', macros: { cal: 1120, protein: 102, carbs: 24, fat: 69 } },
      { name: 'Hand-Breaded Chicken Tenders 6pc',macros: { cal: 420,  protein: 36,  carbs: 19, fat: 22 } },
      { name: 'Hand-Breaded Chicken Tenders 9pc',macros: { cal: 620,  protein: 53,  carbs: 28, fat: 33 } },
      { name: 'Chicken Fried Chicken',           macros: { cal: 800,  protein: 70,  carbs: 42, fat: 39 } },
      { name: 'Cowboy Pork Chops',              macros: { cal: 680,  protein: 87,  carbs: 0,  fat: 32 } },
      { name: 'Baby Back Ribs Half-Rack',        macros: { cal: 820,  protein: 62,  carbs: 16, fat: 56 } },
      { name: 'Baby Back Ribs Full-Rack',        macros: { cal: 1270, protein: 96,  carbs: 25, fat: 87 } },
      { name: 'Grilled Lamb Chops',             macros: { cal: 1120, protein: 63,  carbs: 6,  fat: 79 } },
      { name: 'The LH Burger',                  macros: { cal: 980,  protein: 54,  carbs: 46, fat: 63 } },
      { name: 'Steakhouse Cheeseburger (½ lb)',  macros: { cal: 850,  protein: 48,  carbs: 45, fat: 51 } },
      { name: 'Crispy Buttermilk Chicken Sandwich', macros: { cal: 920, protein: 43, carbs: 66, fat: 55 } },
    ],
  },
  {
    emoji: '🐟', label: 'Seafood',
    items: [
      { name: 'Redrock Grilled Shrimp 8ct',      macros: { cal: 160, protein: 30, carbs: 2,  fat: 3  } },
      { name: 'Redrock Grilled Shrimp 12ct',     macros: { cal: 240, protein: 46, carbs: 1,  fat: 4  } },
      { name: 'LongHorn Salmon 7 oz.',           macros: { cal: 300, protein: 33, carbs: 2,  fat: 16 } },
      { name: 'LongHorn Salmon 10 oz.',          macros: { cal: 430, protein: 47, carbs: 3,  fat: 23 } },
      { name: 'BBQ Chicken & Grilled Shrimp',    macros: { cal: 520, protein: 81, carbs: 28, fat: 10 } },
    ],
  },
  {
    emoji: '🥗', label: 'Appetizers',
    items: [
      { name: 'Seasoned Steakhouse Wings',       macros: { cal: 460,  protein: 53, carbs: 0,   fat: 28  } },
      { name: 'Spicy Chicken Bites (Large)',     macros: { cal: 920,  protein: 54, carbs: 66,  fat: 49  } },
      { name: 'Firecracker Chicken Wraps',       macros: { cal: 720,  protein: 28, carbs: 62,  fat: 42  } },
      { name: 'Wild West Shrimp',               macros: { cal: 970,  protein: 39, carbs: 65,  fat: 62  } },
      { name: 'White Cheddar Stuffed Mushrooms', macros: { cal: 730,  protein: 33, carbs: 14,  fat: 60  } },
      { name: 'Parmesan Crusted Spinach Dip',    macros: { cal: 770,  protein: 28, carbs: 21,  fat: 62  } },
      { name: 'Texas Brisket Nachos',            macros: { cal: 2040, protein: 64, carbs: 149, fat: 130 } },
    ],
  },
  {
    emoji: '🍲', label: 'Soups & Salads',
    items: [
      { name: 'Loaded Potato Soup - Cup',         macros: { cal: 270, protein: 10, carbs: 16, fat: 19 } },
      { name: 'Loaded Potato Soup - Bowl',        macros: { cal: 380, protein: 15, carbs: 21, fat: 27 } },
      { name: 'Shrimp & Lobster Chowder - Cup',   macros: { cal: 190, protein: 8,  carbs: 17, fat: 11 } },
      { name: 'Shrimp & Lobster Chowder - Bowl',  macros: { cal: 250, protein: 10, carbs: 23, fat: 15 } },
      { name: 'French Onion Soup - Cup',          macros: { cal: 170, protein: 8,  carbs: 13, fat: 10 } },
      { name: 'French Onion Soup - Bowl',         macros: { cal: 480, protein: 30, carbs: 20, fat: 31 } },
      { name: 'Grilled Chicken & Strawberry Salad', macros: { cal: 530, protein: 43, carbs: 52, fat: 19 } },
      { name: 'Field Greens w/ Crispy Tenders',   macros: { cal: 650, protein: 46, carbs: 41, fat: 35 } },
      { name: 'Field Greens w/ Salmon',           macros: { cal: 530, protein: 43, carbs: 23, fat: 29 } },
      { name: 'Caesar Salad w/ Chicken',          macros: { cal: 670, protein: 46, carbs: 24, fat: 43 } },
      { name: 'Caesar Salad w/ Salmon',           macros: { cal: 800, protein: 45, carbs: 26, fat: 55 } },
      { name: '7-Pepper Sirloin Salad',           macros: { cal: 490, protein: 45, carbs: 22, fat: 26 } },
    ],
  },
  {
    emoji: '🍟', label: 'Sides',
    items: [
      { name: 'Seasoned French Fries',            macros: { cal: 500, protein: 6,  carbs: 67, fat: 23 } },
      { name: 'Mashed Potatoes',                  macros: { cal: 340, protein: 5,  carbs: 37, fat: 19 } },
      { name: 'Seasoned Rice Pilaf',              macros: { cal: 230, protein: 3,  carbs: 41, fat: 6  } },
      { name: 'Plain Idaho Baked Potato',         macros: { cal: 290, protein: 7,  carbs: 62, fat: 2  } },
      { name: 'Loaded Idaho Baked Potato',        macros: { cal: 470, protein: 11, carbs: 62, fat: 20 } },
      { name: 'Steakhouse Mac & Cheese',          macros: { cal: 610, protein: 27, carbs: 43, fat: 37 } },
      { name: 'Fire-Grilled Corn On The Cob',     macros: { cal: 200, protein: 7,  carbs: 28, fat: 9  } },
      { name: 'Fresh Steamed Asparagus',          macros: { cal: 130, protein: 8,  carbs: 8,  fat: 7  } },
      { name: 'Fresh Steamed Broccoli',           macros: { cal: 90,  protein: 7,  carbs: 7,  fat: 4  } },
      { name: 'Honey Wheat Bread (Full Loaf)',    macros: { cal: 480, protein: 16, carbs: 88, fat: 7  } },
    ],
  },
  {
    emoji: '🍰', label: 'Desserts',
    items: [
      { name: 'Chocolate Stampede',               macros: { cal: 2460, protein: 28, carbs: 289, fat: 132 } },
      { name: 'Molten Lava Cake',                macros: { cal: 1150, protein: 15, carbs: 157, fat: 53  } },
      { name: 'Strawberries & Cream Shortcake',  macros: { cal: 640,  protein: 7,  carbs: 74,  fat: 37  } },
      { name: 'THE Cheesecake',                  macros: { cal: 1270, protein: 18, carbs: 117, fat: 82  } },
    ],
  },
]

export const MCALISTERS_MENU: FFCategory[] = [
  {
    emoji: '🥙', label: 'Build Your Own',
    items: [
      { name: 'Grilled Chicken Sandwich',          macros: { cal: 490,  protein: 38, carbs: 72, fat: 6  } },
      { name: 'Turkey Sandwich',                   macros: { cal: 460,  protein: 32, carbs: 73, fat: 5  } },
      { name: 'Ham Sandwich',                      macros: { cal: 490,  protein: 30, carbs: 73, fat: 9  } },
      { name: 'Roast Beef Sandwich',               macros: { cal: 540,  protein: 37, carbs: 73, fat: 13 } },
      { name: 'Corned Beef Sandwich',              macros: { cal: 550,  protein: 37, carbs: 73, fat: 13 } },
      { name: 'Pastrami Sandwich',                 macros: { cal: 540,  protein: 37, carbs: 73, fat: 13 } },
      { name: 'Salami Sandwich',                   macros: { cal: 590,  protein: 24, carbs: 71, fat: 24 } },
    ],
  },
  {
    emoji: '🥪', label: 'Club Sandwiches',
    items: [
      { name: "McAlister's Club",                  macros: { cal: 910,  protein: 45, carbs: 91, fat: 44 } },
      { name: "McAlister's Club Wrap",             macros: { cal: 810,  protein: 38, carbs: 61, fat: 46 } },
      { name: 'Black Angus Club',                  macros: { cal: 990,  protein: 50, carbs: 87, fat: 53 } },
      { name: 'Black Angus King Club',             macros: { cal: 1300, protein: 82, carbs: 82, fat: 75 } },
      { name: 'Grilled Chicken Club',              macros: { cal: 860,  protein: 40, carbs: 89, fat: 42 } },
      { name: 'Grilled Chicken King Club',         macros: { cal: 1170, protein: 85, carbs: 82, fat: 58 } },
      { name: 'King Club',                         macros: { cal: 1140, protein: 72, carbs: 85, fat: 60 } },
    ],
  },
  {
    emoji: '🍔', label: 'Classic Sandwiches',
    items: [
      { name: 'Grilled Chicken Sandwich (Classic)', macros: { cal: 590,  protein: 39, carbs: 46, fat: 27 } },
      { name: 'Ham & Cheese Melt',                 macros: { cal: 670,  protein: 35, carbs: 71, fat: 27 } },
      { name: 'Four Cheese Melt',                  macros: { cal: 730,  protein: 37, carbs: 71, fat: 34 } },
      { name: 'Turkey Ranch BLT',                  macros: { cal: 670,  protein: 37, carbs: 49, fat: 39 } },
      { name: 'BLT&A Sandwich',                    macros: { cal: 880,  protein: 33, carbs: 52, fat: 62 } },
      { name: 'Harvest Chicken Salad Sandwich',    macros: { cal: 700,  protein: 23, carbs: 52, fat: 44 } },
      { name: 'Grilled Chicken Caesar Wrap',       macros: { cal: 780,  protein: 36, carbs: 50, fat: 48 } },
      { name: 'The Veggie',                        macros: { cal: 680,  protein: 15, carbs: 80, fat: 37 } },
    ],
  },
  {
    emoji: '🔥', label: 'Bold & Signature',
    items: [
      { name: 'Chicago Style French Dip',          macros: { cal: 750,  protein: 50, carbs: 47, fat: 40 } },
      { name: 'Chicago Style French Dip (12")',    macros: { cal: 1500, protein: 99, carbs: 95, fat: 81 } },
      { name: 'French Dip (6")',                   macros: { cal: 640,  protein: 53, carbs: 45, fat: 27 } },
      { name: 'French Dip (12")',                  macros: { cal: 1280, protein: 106, carbs: 90, fat: 54 } },
      { name: 'The New Yorker',                    macros: { cal: 730,  protein: 67, carbs: 52, fat: 28 } },
      { name: 'Reuben',                            macros: { cal: 920,  protein: 57, carbs: 65, fat: 48 } },
      { name: 'Honey BBQ Pork Melt',              macros: { cal: 1240, protein: 65, carbs: 87, fat: 70 } },
      { name: 'Spicy Southwest Chicken',           macros: { cal: 880,  protein: 50, carbs: 84, fat: 39 } },
      { name: 'Spicy BBQ Chicken Crunch',          macros: { cal: 730,  protein: 47, carbs: 96, fat: 19 } },
      { name: 'Jalapeno Turkey Crunch',            macros: { cal: 1030, protein: 48, carbs: 86, fat: 57 } },
      { name: 'Smoky Pepper Jack Turkey',          macros: { cal: 780,  protein: 45, carbs: 77, fat: 33 } },
      { name: 'Cuban Sandwich (6")',               macros: { cal: 810,  protein: 47, carbs: 51, fat: 44 } },
      { name: 'The Italian (6")',                  macros: { cal: 810,  protein: 45, carbs: 52, fat: 46 } },
      { name: 'Memphian (6")',                     macros: { cal: 630,  protein: 45, carbs: 50, fat: 28 } },
      { name: 'Spicy Turkey Melt (6")',            macros: { cal: 770,  protein: 42, carbs: 56, fat: 42 } },
    ],
  },
  {
    emoji: '🥗', label: 'Salads',
    items: [
      { name: 'Grilled Chicken Salad',             macros: { cal: 490,  protein: 47, carbs: 20, fat: 26 } },
      { name: "McAlister's Chef Salad",            macros: { cal: 480,  protein: 40, carbs: 21, fat: 26 } },
      { name: 'Savannah Chopped Salad',            macros: { cal: 450,  protein: 36, carbs: 41, fat: 16 } },
      { name: 'Southwest Chicken & Avocado Salad', macros: { cal: 600,  protein: 45, carbs: 36, fat: 32 } },
      { name: 'Pecanberry Salad',                  macros: { cal: 360,  protein: 30, carbs: 33, fat: 14 } },
      { name: 'Caesar Salad',                      macros: { cal: 970,  protein: 25, carbs: 20, fat: 89 } },
      { name: 'Grilled Chicken Caesar Salad',      macros: { cal: 1100, protein: 50, carbs: 21, fat: 92 } },
      { name: 'Garden Salad',                      macros: { cal: 310,  protein: 18, carbs: 19, fat: 19 } },
      { name: 'Garden Salad w/ Harvest Chicken',   macros: { cal: 830,  protein: 39, carbs: 34, fat: 61 } },
    ],
  },
  {
    emoji: '🍲', label: 'Soups',
    items: [
      { name: 'Broccoli Cheddar - Cup',            macros: { cal: 300, protein: 11, carbs: 23, fat: 19 } },
      { name: 'Broccoli Cheddar - Bowl',           macros: { cal: 420, protein: 16, carbs: 30, fat: 27 } },
      { name: 'Traditional Chili - Cup',           macros: { cal: 300, protein: 19, carbs: 32, fat: 12 } },
      { name: 'Traditional Chili - Bowl',          macros: { cal: 420, protein: 28, carbs: 43, fat: 18 } },
      { name: 'Chicken Tortilla - Cup',            macros: { cal: 210, protein: 7,  carbs: 25, fat: 9  } },
      { name: 'Chicken Tortilla - Bowl',           macros: { cal: 350, protein: 11, carbs: 44, fat: 16 } },
      { name: 'Country Potato - Cup',              macros: { cal: 270, protein: 9,  carbs: 35, fat: 12 } },
      { name: 'Country Potato - Bowl',             macros: { cal: 390, protein: 12, carbs: 47, fat: 18 } },
      { name: 'Veggie Chili - Cup',                macros: { cal: 230, protein: 11, carbs: 43, fat: 3  } },
      { name: 'Veggie Chili - Bowl',               macros: { cal: 320, protein: 16, carbs: 60, fat: 4  } },
    ],
  },
  {
    emoji: '🥔', label: 'Spuds (Baked Potato)',
    items: [
      { name: 'Classic Spud',                      macros: { cal: 710,  protein: 17, carbs: 131, fat: 14 } },
      { name: 'Loaded Bacon Spud',                 macros: { cal: 930,  protein: 35, carbs: 132, fat: 32 } },
      { name: 'Spud Max',                          macros: { cal: 1090, protein: 45, carbs: 135, fat: 42 } },
      { name: 'Chicken Bacon Ranch Spud',          macros: { cal: 1160, protein: 61, carbs: 135, fat: 45 } },
      { name: 'Smokehouse Spud',                   macros: { cal: 1510, protein: 65, carbs: 166, fat: 65 } },
      { name: 'Honey BBQ Pork Spud',              macros: { cal: 1460, protein: 56, carbs: 166, fat: 64 } },
      { name: 'Veggie Spud',                       macros: { cal: 910,  protein: 28, carbs: 148, fat: 25 } },
    ],
  },
  {
    emoji: '🍟', label: 'Sides & Desserts',
    items: [
      { name: 'Cajun Red Beans and Rice',          macros: { cal: 160,  protein: 7,  carbs: 19,  fat: 7  } },
      { name: 'Mac & Cheese',                      macros: { cal: 230,  protein: 8,  carbs: 20,  fat: 14 } },
      { name: 'Potato Salad',                      macros: { cal: 290,  protein: 3,  carbs: 20,  fat: 22 } },
      { name: 'Steamed Broccoli',                  macros: { cal: 100,  protein: 3,  carbs: 6,   fat: 8  } },
      { name: 'Fruit',                             macros: { cal: 60,   protein: 2,  carbs: 15,  fat: 0  } },
      { name: 'Brookie',                           macros: { cal: 480,  protein: 7,  carbs: 55,  fat: 28 } },
      { name: 'Brownie',                           macros: { cal: 430,  protein: 4,  carbs: 61,  fat: 21 } },
      { name: 'Chocolate Chip Cookie',             macros: { cal: 370,  protein: 4,  carbs: 53,  fat: 17 } },
      { name: 'Salted Caramel Cookie',             macros: { cal: 380,  protein: 4,  carbs: 52,  fat: 19 } },
      { name: 'White Choc Macadamia Cookie',       macros: { cal: 400,  protein: 5,  carbs: 47,  fat: 23 } },
      { name: 'Sugar Cookie',                      macros: { cal: 340,  protein: 3,  carbs: 43,  fat: 17 } },
      { name: 'Colossal Carrot Cake',              macros: { cal: 1170, protein: 11, carbs: 110, fat: 79 } },
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
