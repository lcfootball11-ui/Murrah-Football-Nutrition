'use client'

import { useEffect, useState } from 'react'

export default function NutritionStreakBadge() {
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch('/api/nutrition-streak')
        const { streak } = await res.json()
        setStreak(streak)
      } catch (err) {
        console.error('Failed to fetch nutrition streak:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [])

  if (loading || streak === 0) return null

  return (
    <div className="glass rounded-2xl p-4 mb-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">💪</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">
            {streak} day nutrition streak
          </p>
          <p className="text-xs text-slate-400">calories + protein met</p>
        </div>
      </div>
    </div>
  )
}
