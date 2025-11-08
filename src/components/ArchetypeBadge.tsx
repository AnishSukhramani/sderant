'use client'

import type { ArchetypeId } from '@/types'
import { ARCHETYPE_OPTIONS, getArchetypeMeta } from '@/lib/archetypes'
import { useMemo } from 'react'

type ArchetypeBadgeVariant = 'compact' | 'label' | 'profile'

interface ArchetypeBadgeProps {
  archetype?: ArchetypeId | null
  variant?: ArchetypeBadgeVariant
  className?: string
  withGlow?: boolean
}

export function ArchetypeBadge({
  archetype,
  variant = 'compact',
  className = '',
  withGlow = true,
}: ArchetypeBadgeProps) {
  const meta = useMemo(() => getArchetypeMeta(archetype), [archetype])

  if (!meta) return null

  const Icon = meta.icon
  const glow = withGlow ? `0 0 18px ${meta.glow}33` : 'none'

  if (variant === 'profile') {
    return (
      <div
        className={[
          'flex items-center gap-4 rounded-md border px-4 py-3 transition-all duration-200',
          'bg-black/70',
          className,
        ].join(' ')}
        style={{
          borderColor: `${meta.color}66`,
          boxShadow: glow,
          background: `linear-gradient(135deg, ${meta.background} 0%, rgba(0, 0, 0, 0.65) 100%)`,
        }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full border-2"
          style={{
            borderColor: meta.color,
            background: `radial-gradient(circle at 30% 30%, ${meta.glow}44, transparent 70%)`,
            boxShadow: glow,
          }}
        >
          <Icon className="h-7 w-7" strokeWidth={2} style={{ color: meta.glow }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold tracking-wide" style={{ color: meta.glow }}>
            {meta.label.toUpperCase()}
          </p>
          <p className="text-xs text-green-200/70">{meta.description}</p>
        </div>
      </div>
    )
  }

  if (variant === 'label') {
    return (
      <div
        className={[
          'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
          className,
        ].join(' ')}
        style={{
          color: meta.glow,
          borderColor: `${meta.color}66`,
          background: `linear-gradient(135deg, ${meta.background}, rgba(0, 0, 0, 0.75))`,
          boxShadow: glow,
        }}
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full border"
          style={{
            borderColor: meta.color,
            background: `radial-gradient(circle at 25% 25%, ${meta.glow}44, transparent 70%)`,
          }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <span>{meta.label}</span>
      </div>
    )
  }

  return (
    <span
      className={[
        'inline-flex h-6 w-6 items-center justify-center rounded-full border',
        className,
      ].join(' ')}
      style={{
        borderColor: `${meta.color}66`,
        background: `radial-gradient(circle at 50% 40%, ${meta.glow}55, ${meta.background})`,
        color: meta.glow,
        boxShadow: glow,
      }}
      title={meta.label}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
    </span>
  )
}

export const ArchetypePreviewStrip = () => {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ARCHETYPE_OPTIONS.map((option) => (
        <div
          key={option.id}
          className="flex items-center justify-between rounded border border-green-400/10 bg-black/60 px-3 py-2"
        >
          <ArchetypeBadge archetype={option.id} variant="label" withGlow={false} />
        </div>
      ))}
    </div>
  )
}

