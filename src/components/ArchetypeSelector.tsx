'use client'

import type { ArchetypeId } from '@/types'
import { ARCHETYPE_OPTIONS } from '@/lib/archetypes'
import { ArchetypeBadge } from './ArchetypeBadge'
import { Check } from 'lucide-react'

interface ArchetypeSelectorProps {
  value: ArchetypeId | null
  onChange: (value: ArchetypeId) => void
  className?: string
  layout?: 'grid' | 'list'
  disabled?: boolean
}

export function ArchetypeSelector({
  value,
  onChange,
  className = '',
  layout = 'grid',
  disabled = false,
}: ArchetypeSelectorProps) {
  const Wrapper = layout === 'grid' ? 'div' : 'div'

  return (
    <Wrapper
      className={[
        layout === 'grid'
          ? 'grid gap-3 md:grid-cols-2'
          : 'flex flex-col gap-3',
        className,
      ].join(' ')}
    >
      {ARCHETYPE_OPTIONS.map((archetype) => {
        const isActive = archetype.id === value
        return (
          <button
            key={archetype.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => !disabled && onChange(archetype.id)}
            disabled={disabled}
            className={[
              'group relative flex h-full flex-col items-start gap-3 rounded border px-4 py-4 text-left transition-all duration-200',
              'bg-black/60 hover:border-green-400/50 hover:bg-black/75',
              isActive ? 'ring-1 ring-offset-0' : '',
              disabled ? 'opacity-60 cursor-not-allowed' : '',
            ].join(' ')}
            style={{
              borderColor: isActive ? `${archetype.color}` : 'rgba(16, 185, 129, 0.2)',
              background: isActive
                ? `linear-gradient(135deg, ${archetype.background}, rgba(0, 0, 0, 0.65))`
                : 'rgba(0,0,0,0.45)',
              boxShadow: isActive ? `0 0 20px ${archetype.glow}33` : 'none',
            }}
          >
            <div className="flex w-full items-center justify-between">
              <ArchetypeBadge archetype={archetype.id} variant="label" className="tracking-wide" />
              {isActive && (
                <span
                  className="flex items-center gap-1 rounded-full border border-green-400/60 bg-green-400/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-green-200"
                  style={{ boxShadow: `0 0 12px ${archetype.glow}22` }}
                >
                  <Check className="h-3 w-3" />
                  Equipped
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-green-200/70">
              {archetype.description}
            </p>
          </button>
        )
      })}
    </Wrapper>
  )
}


