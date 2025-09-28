'use client'

import { TrendingUp, Clock, Zap } from 'lucide-react'

interface TrendingFilterProps {
  period: 'hour' | 'day' | 'all'
  onPeriodChange: (period: 'hour' | 'day' | 'all') => void
}

export function TrendingFilter({ period, onPeriodChange }: TrendingFilterProps) {
  const periods = [
    { key: 'hour' as const, label: 'LAST HOUR', icon: Zap },
    { key: 'day' as const, label: 'TODAY', icon: Clock },
    { key: 'all' as const, label: 'ALL TIME', icon: TrendingUp },
  ]

  return (
    <div className="flex border border-green-400/20">
      {periods.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onPeriodChange(key)}
          className={`px-4 py-2 flex items-center space-x-2 transition-colors ${
            period === key
              ? 'bg-green-400 text-black font-bold'
              : 'hover:bg-green-400/20 text-green-400/70'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  )
}