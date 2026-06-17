const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function insertRestaurantData() {
  try {
    const restaurants = ['chickfila', 'mcdonalds', 'wendys'];
    let totalInserted = 0;

    for (const restaurant of restaurants) {
      const filename = restaurant === 'chickfila' ? 'chickfila_data.json' :
                      restaurant === 'mcdonalds' ? 'mcdonalds_data.json' :
                      'wendys_data.json';

      const data = JSON.parse(fs.readFileSync(`./${filename}`, 'utf8'));
      const restaurantName = restaurant === 'chickfila' ? 'Chick-fil-A' :
                            restaurant === 'mcdonalds' ? 'McDonald\'s' :
                            'Wendy\'s';

      console.log(`\nInserting ${data.items.length} ${restaurantName} items...`);

      const items = data.items.map(item => ({
        name: item.name,
        portion: item.portion,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        source: restaurantName
      }));

      const { data: result, error } = await supabase
        .from('custom_foods')
        .insert(items)
        .select();

      if (error) {
        console.error(`Error inserting ${restaurantName}:`, error);
        process.exit(1);
      }

      console.log(`✓ Successfully inserted ${result.length} ${restaurantName} items!`);
      totalInserted += result.length;
    }

    console.log(`\n✅ Total items inserted: ${totalInserted}`);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

insertRestaurantData();
