'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Weight, TrendingUp, TrendingDown } from 'lucide-react'

type WeightLog = {
  id: string
  log_date: string
  weight_lbs: number
  created_at: string
}

export default function WeightTracker({ today }: { today: string }) {
  const supabase = createClient()
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
  const [currentWeight, setCurrentWeight] = useState('')
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadWeightLogs()
  }, [])

  const loadWeightLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/weight?days=90')
      const { data } = await res.json()
      setWeightLogs(data || [])

      // Set current weight from today's entry if exists
      const todayLog = data?.find((w: WeightLog) => w.log_date === today)
      if (todayLog) {
        setCurrentWeight(todayLog.weight_lbs.toString())
      }
    } catch (err) {
      setError('Failed to load weight data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveWeight = async () => {
    if (!currentWeight || parseFloat(currentWeight) <= 0) {
      setError('Please enter a valid weight')
      return
    }

    setSaveLoading(true)
    setError('')
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_lbs: parseFloat(currentWeight),
          log_date: today,
        }),
      })

      if (!res.ok) {
        const { error: errMsg } = await res.json()
        throw new Error(errMsg)
      }

      await loadWeightLogs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save weight')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDeleteWeight = async (id: string) => {
    if (!confirm('Delete this weight entry?')) return

    try {
      const res = await fetch('/api/weight', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error('Failed to delete')
      await loadWeightLogs()
    } catch (err) {
      setError('Failed to delete weight entry')
    }
  }

  // Calculate trend
  const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
  const startWeight = sortedLogs[0]?.weight_lbs
  const endWeight = sortedLogs[sortedLogs.length - 1]?.weight_lbs
  const weightChange = endWeight && startWeight ? endWeight - startWeight : 0
  const trend = weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'stable'

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Weight size={18} className="text-blue-400" />
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Weight Tracker</h3>
      </div>

      {/* Current Weight Input */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-medium">Today's Weight (lbs)</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder="Enter weight in lbs"
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={handleSaveWeight}
            disabled={saveLoading}
            className="btn-blue text-xs px-4 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            {saveLoading ? 'Saving...' : 'Log'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Weight Stats */}
      {sortedLogs.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="bg-slate-700/30 rounded-lg p-2 text-center">
            <p className="text-xs text-slate-400">Current</p>
            <p className="text-lg font-black text-white">{endWeight?.toFixed(1)}</p>
            <p className="text-xs text-slate-500">lbs</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-2 text-center">
            <p className="text-xs text-slate-400">Start</p>
            <p className="text-lg font-black text-white">{startWeight?.toFixed(1)}</p>
            <p className="text-xs text-slate-500">lbs</p>
          </div>
          <div className={`rounded-lg p-2 text-center ${trend === 'up' ? 'bg-red-500/20' : trend === 'down' ? 'bg-green-500/20' : 'bg-slate-700/30'}`}>
            <p className="text-xs text-slate-400">Change</p>
            <div className="flex items-center justify-center gap-1">
              {trend === 'up' && <TrendingUp size={14} className="text-red-400" />}
              {trend === 'down' && <TrendingDown size={14} className="text-green-400" />}
              <p className={`text-lg font-black ${trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-slate-400'}`}>
                {Math.abs(weightChange).toFixed(1)}
              </p>
            </div>
            <p className="text-xs text-slate-500">lbs</p>
          </div>
        </div>
      )}

      {/* History */}
      {sortedLogs.length > 0 && (
        <div className="pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-400 font-medium mb-2">Recent History</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {[...sortedLogs].reverse().map((log) => (
              <div key={log.id} className="flex items-center justify-between bg-slate-700/20 rounded-lg p-2 text-xs">
                <div>
                  <p className="text-slate-200 font-medium">{log.weight_lbs.toFixed(1)} lbs</p>
                  <p className="text-slate-500">{new Date(log.log_date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleDeleteWeight(log.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-xs text-slate-400 text-center">Loading weight data...</p>}
      {!loading && weightLogs.length === 0 && <p className="text-xs text-slate-500 text-center">No weight entries yet</p>}
    </div>
  )
}
