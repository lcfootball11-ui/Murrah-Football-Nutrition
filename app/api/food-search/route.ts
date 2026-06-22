import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json({ foods: [] })

  try {
    // Fetch from USDA
    const apiKey = process.env.USDA_API_KEY ?? 'DEMO_KEY'
    const usdaUrl = `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&dataType=Survey%20(FNDDS),SR%20Legacy,Branded&pageSize=15&api_key=${apiKey}`
    const usdaRes = await fetch(usdaUrl, { cache: 'no-store' })
    const usdaData = await usdaRes.json()

    const usdaFoods = (usdaData.foods ?? []).map((f: Record<string, unknown>) => {
      const nutrients = (f.foodNutrients as Record<string, unknown>[]) ?? []
      const get = (name: string) =>
        (nutrients.find((n: Record<string, unknown>) => (n.nutrientName as string)?.toLowerCase().includes(name)) as Record<string, unknown>)?.value ?? 0

      return {
        fdcId: f.fdcId,
        description: f.description,
        brandOwner: f.brandOwner ?? null,
        servingSize: f.servingSize ?? 100,
        servingSizeUnit: f.servingSizeUnit ?? 'g',
        calories: Math.round(get('energy') as number),
        protein: Math.round((get('protein') as number) * 10) / 10,
        carbs: Math.round((get('carbohydrate') as number) * 10) / 10,
        fat: Math.round((get('total lipid') as number) * 10) / 10,
        source: 'USDA',
      }
    })

    // Fetch from custom foods (Popeyes, Wingstop, etc.)
    // Search is case-insensitive and searches both name and restaurant source
    const supabase = getSupabaseClient()
    const { data: customFoods } = await supabase
      .from('custom_foods')
      .select('*')
      .or(`name.ilike.%${query}%,source.ilike.%${query}%`)
      .limit(10)

    const customFoodsMapped = (customFoods ?? []).map((f: Record<string, unknown>) => ({
      fdcId: f.id,
      description: `${f.source} - ${f.name} (${f.portion})`,
      brandOwner: f.source,
      servingSize: 1,
      servingSizeUnit: f.portion,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      source: f.source,
    }))

    // Combine and return (custom foods first, then USDA)
    const foods = [...customFoodsMapped, ...usdaFoods]

    return NextResponse.json({ foods })
  } catch (error) {
    console.error('Food search error:', error)
    // Still try to return custom foods if USDA fails
    try {
      const supabase = getSupabaseClient()
      const { data: customFoods } = await supabase
        .from('custom_foods')
        .select('*')
        .or(`name.ilike.%${query}%,source.ilike.%${query}%`)
        .limit(10)
      const mapped = (customFoods ?? []).map((f: Record<string, unknown>) => ({
        fdcId: f.id, description: `${f.source} - ${f.name} (${f.portion})`,
        brandOwner: f.source, servingSize: 1, servingSizeUnit: f.portion,
        calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat, source: f.source,
      }))
      return NextResponse.json({ foods: mapped })
    } catch {
      return NextResponse.json({ foods: [] })
    }
  }
}
