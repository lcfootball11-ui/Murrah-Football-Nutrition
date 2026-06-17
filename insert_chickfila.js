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

async function insertChickfilaData() {
  try {
    const data = JSON.parse(fs.readFileSync('./chickfila_data.json', 'utf8'));

    console.log(`Inserting ${data.items.length} Chick-fil-A items...`);

    const items = data.items.map(item => ({
      name: item.name,
      portion: item.portion,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      source: 'Chick-fil-A'
    }));

    const { data: result, error } = await supabase
      .from('custom_foods')
      .insert(items)
      .select();

    if (error) {
      console.error('Error inserting data:', error);
      process.exit(1);
    }

    console.log(`✓ Successfully inserted ${result.length} Chick-fil-A items!`);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

insertChickfilaData();
