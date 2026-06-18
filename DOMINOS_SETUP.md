# Domino's Pizza Menu Setup

## How to Add Domino's Items to Your Food Database

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy the entire contents of `insert-dominos-menu.sql`
6. Paste into the SQL editor
7. Click **Run**

### Option 2: Using Supabase CLI

```bash
# Make sure you have Supabase CLI installed
# Then run this command from the project root:
supabase db execute < insert-dominos-menu.sql
```

### What Gets Added

The `insert-dominos-menu.sql` file contains **75 Domino's menu items** including:

- **8" Extra Small Hand Tossed** (5 items)
- **10" Small Hand Tossed** (5 items)
- **10" Crunchy Thin Crust** (4 items)
- **12" Medium Hand Tossed** (5 items)
- **12" Medium Pan** (3 items)
- **12" Medium Crunchy Thin** (3 items)
- **12" Medium New York Style** (3 items)
- **14" Large Hand Tossed** (5 items)
- **14" Large New York Style** (3 items)
- **16" Extra Large Hand Tossed** (4 items)
- **16" Extra Large New York Style** (4 items)
- **Specialty Pizzas** (20 items)
  - Honolulu Hawaiian
  - Memphis BBQ Chicken
  - ExtravaganZZa
  - Philly Cheese Steak
  - Pacific Veggie
  - Spicy Chicken Bacon Ranch
  - Spinach & Feta
  - Ultimate Pepperoni
  - Wisconsin 6 Cheese
- **Breakfast Pizzas** (2 items)

### What Athletes Can Do

Once added, athletes can:
- **Search** for "Dominos" to find all items
- **Search by size** (e.g., "14" Hand Tossed")
- **Search by specialty** (e.g., "Philly", "BBQ", "Pepperoni")
- **Click to log** a meal with pre-populated nutrition values
- **Track calories, protein, carbs, and fat** accurately

### Data Source

All nutrition information from: **Domino's Nutrition Guide January 2026**
- Official Domino's nutritional data
- Serving sizes include the whole pizza portion size
- Values calculated per slice or standard serving

### Note on Portions

Each menu item shows its standard serving size:
- Most small/medium items: per slice (1/4 or 1/5 of pizza)
- Most large/XL items: per slice (1/8 of pizza)
- Athletes should log based on how many slices they actually eat

Example: If an athlete eats 2 slices of a 14" large pizza, they'd log the item twice.
