import { NextRequest, NextResponse } from 'next/server'

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json({ foods: [] })

  const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&dataType=Survey%20(FNDDS),SR%20Legacy&pageSize=10&api_key=DEMO_KEY`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    const foods = (data.foods ?? []).map((f: Record<string, unknown>) => {
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
      }
    })

    return NextResponse.json({ foods })
  } catch {
    return NextResponse.json({ foods: [] }, { status: 500 })
  }
}
