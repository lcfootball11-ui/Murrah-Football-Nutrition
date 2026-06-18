'use client'

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'

type AthleteWeightData = {
  athlete_id: string
  full_name: string
  data: Array<{ date: string; weight: number }>
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#eab308',
  '#84cc16', '#6366f1', '#d946ef', '#0ea5e9', '#f43f5e',
  '#6ee7b7', '#fbbf24', '#a78bfa', '#67e8f9', '#fbcfe8',
]

export default function WeightTrendChart() {
  const [weightData, setWeightData] = useState<AthleteWeightData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAthletes, setSelectedAthletes] = useState<Set<string>>(new Set())
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  useEffect(() => {
    loadWeightTrends()
  }, [])

  const loadWeightTrends = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/weight-trends?days=90')
      const { data } = await res.json() as { data: AthleteWeightData[] }
      setWeightData(data || [])
      // By default, show first 10 athletes
      const defaultSelected = new Set<string>(data?.slice(0, 10).map((a: AthleteWeightData) => a.athlete_id) || [])
      setSelectedAthletes(defaultSelected)
    } catch (err) {
      console.error('Failed to load weight trends:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center h-96">
        <p className="text-slate-400">Loading weight data...</p>
      </div>
    )
  }

  if (weightData.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center h-96">
        <p className="text-slate-400">No weight data available</p>
      </div>
    )
  }

  // Collect all dates and get min/max weight
  const allDates = new Set<string>()
  let minWeight = Infinity
  let maxWeight = -Infinity

  weightData.forEach(athlete => {
    athlete.data.forEach(point => {
      allDates.add(point.date)
      minWeight = Math.min(minWeight, point.weight)
      maxWeight = Math.max(maxWeight, point.weight)
    })
  })

  const sortedDates = Array.from(allDates).sort()
  const padding = (maxWeight - minWeight) * 0.1
  const yMin = minWeight - padding
  const yMax = maxWeight + padding

  // Chart dimensions
  const chartWidth = 1000
  const chartHeight = 400
  const marginLeft = 60
  const marginRight = 20
  const marginTop = 20
  const marginBottom = 40

  const graphWidth = chartWidth - marginLeft - marginRight
  const graphHeight = chartHeight - marginTop - marginBottom

  // Create path for each athlete
  const athletePaths = weightData
    .filter(a => selectedAthletes.has(a.athlete_id))
    .map((athlete, idx) => {
      const points = sortedDates.map((date, i) => {
        const dataPoint = athlete.data.find(d => d.date === date)
        if (!dataPoint) return null

        const x = marginLeft + (i / (sortedDates.length - 1)) * graphWidth
        const y = marginTop + graphHeight - ((dataPoint.weight - yMin) / (yMax - yMin)) * graphHeight

        return { x, y, weight: dataPoint.weight, date }
      }).filter(p => p !== null)

      if (points.length === 0) return null

      const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p!.x} ${p!.y}`).join(' ')
      const color = COLORS[idx % COLORS.length]

      return { athlete, pathData, color, points }
    })
    .filter(p => p !== null)

  // Y-axis labels
  const yLabels = []
  for (let i = 0; i <= 5; i++) {
    const weight = yMin + (yMax - yMin) * (i / 5)
    yLabels.push({ weight: weight.toFixed(0), y: marginTop + graphHeight - (i / 5) * graphHeight })
  }

  // X-axis labels (show every Nth date)
  const dateStep = Math.ceil(sortedDates.length / 5)
  const xLabels = sortedDates
    .map((date, i) => (i % dateStep === 0 ? { date, index: i } : null))
    .filter(l => l !== null)

  const toggleAthlete = (athleteId: string) => {
    const newSelected = new Set(selectedAthletes)
    if (newSelected.has(athleteId)) {
      newSelected.delete(athleteId)
    } else {
      newSelected.add(athleteId)
    }
    setSelectedAthletes(newSelected)
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={18} className="text-blue-400" />
        <h3 className="text-lg font-bold text-white">Weight Trends (90 Days)</h3>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="min-w-full" style={{ background: 'transparent' }}>
          {/* Y-axis */}
          <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={chartHeight - marginBottom} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

          {/* X-axis */}
          <line x1={marginLeft} y1={chartHeight - marginBottom} x2={chartWidth - marginRight} y2={chartHeight - marginBottom} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

          {/* Y-axis grid and labels */}
          {yLabels.map((label, i) => (
            <g key={`y-${i}`}>
              <line x1={marginLeft} y1={label.y} x2={chartWidth - marginRight} y2={label.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4" />
              <text x={marginLeft - 10} y={label.y + 4} textAnchor="end" fontSize="12" fill="rgba(255,255,255,0.5)">
                {label.weight}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels.map((label, i) => {
            const x = marginLeft + (label.index / (sortedDates.length - 1)) * graphWidth
            const dateObj = new Date(label.date + 'T12:00:00')
            const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
            return (
              <g key={`x-${i}`}>
                <line x1={x} y1={chartHeight - marginBottom} x2={x} y2={chartHeight - marginBottom + 5} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <text x={x} y={chartHeight - marginBottom + 20} textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.5)">
                  {dateStr}
                </text>
              </g>
            )
          })}

          {/* Y-axis label */}
          <text x={15} y={chartHeight / 2} textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.5)" transform={`rotate(-90 15 ${chartHeight / 2})`}>
            Weight (lbs)
          </text>

          {/* Lines for each athlete */}
          {athletePaths.map((path, idx) => (
            path && (
              <g key={path.athlete.athlete_id}>
                {/* Shadow effect */}
                <path
                  d={path.pathData}
                  fill="none"
                  stroke={path.color}
                  strokeWidth="3"
                  opacity="0.3"
                />
                {/* Main line */}
                <path
                  d={path.pathData}
                  fill="none"
                  stroke={path.color}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 4px ${path.color}88)` }}
                />
                {/* Data points */}
                {path.points.map((point, i) => (
                  <circle
                    key={`point-${i}`}
                    cx={point!.x}
                    cy={point!.y}
                    r="3"
                    fill={path.color}
                    opacity="0.8"
                    onMouseEnter={() => setHoveredDate(point!.date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </g>
            )
          ))}

          {/* Tooltip */}
          {hoveredDate && (
            <g>
              {athletePaths.map((path, idx) => {
                if (!path) return null
                const point = path.points.find(p => p!.date === hoveredDate)
                if (!point) return null
                return (
                  <g key={`tooltip-${path.athlete.athlete_id}`}>
                    <rect
                      x={point!.x + 10}
                      y={point!.y - 40}
                      width="120"
                      height="35"
                      rx="4"
                      fill="rgba(0,0,0,0.8)"
                      stroke={path.color}
                      strokeWidth="2"
                    />
                    <text x={point!.x + 15} y={point!.y - 23} fontSize="11" fontWeight="bold" fill={path.color}>
                      {path.athlete.full_name}
                    </text>
                    <text x={point!.x + 15} y={point!.y - 10} fontSize="12" fontWeight="bold" fill="white">
                      {point!.weight.toFixed(1)} lbs
                    </text>
                  </g>
                )
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Athletes ({selectedAthletes.size} selected)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
          {weightData.map((athlete, idx) => (
            <button
              key={athlete.athlete_id}
              onClick={() => toggleAthlete(athlete.athlete_id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedAthletes.has(athlete.athlete_id)
                  ? 'bg-opacity-20 text-white'
                  : 'bg-slate-700/30 text-slate-500 hover:text-slate-300'
              }`}
              style={
                selectedAthletes.has(athlete.athlete_id)
                  ? {
                      backgroundColor: COLORS[idx % COLORS.length] + '33',
                      color: COLORS[idx % COLORS.length],
                      border: `1px solid ${COLORS[idx % COLORS.length]}`,
                    }
                  : {}
              }
            >
              {athlete.full_name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {weightData.length > 0 && (
        <div className="pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 font-medium mb-2">Selected Athlete Stats</p>
          <div className="grid grid-cols-3 gap-2">
            {Array.from(selectedAthletes).map(athleteId => {
              const athlete = weightData.find(a => a.athlete_id === athleteId)
              if (!athlete || athlete.data.length === 0) return null
              const startWeight = athlete.data[0].weight
              const endWeight = athlete.data[athlete.data.length - 1].weight
              const change = endWeight - startWeight
              return (
                <div key={athleteId} className="bg-slate-700/20 rounded-lg p-2 text-xs">
                  <p className="text-slate-300 font-bold truncate">{athlete.full_name}</p>
                  <p className={`font-bold ${change > 0 ? 'text-red-400' : change < 0 ? 'text-green-400' : 'text-slate-400'}`}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)} lbs
                  </p>
                  <p className="text-slate-500">{startWeight.toFixed(1)} → {endWeight.toFixed(1)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
