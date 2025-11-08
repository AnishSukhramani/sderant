import { type ArchetypeId } from '@/types'
import type { LucideIcon } from 'lucide-react'
import { 
  BriefcaseBusiness,
  Globe2,
  Handshake,
  Compass,
  GraduationCap,
  Cpu
} from 'lucide-react'

export type ArchetypeMeta = {
  id: ArchetypeId
  label: string
  description: string
  color: string
  glow: string
  background: string
  icon: LucideIcon
}

export const ARCHETYPE_ORDER: ArchetypeId[] = [
  'corpo',
  'mercenary',
  'fixer',
  'nomad',
  'street_kid',
  'netrunner',
]

export const ARCHETYPE_META: Record<ArchetypeId, ArchetypeMeta> = {
  corpo: {
    id: 'corpo',
    label: 'Corpo',
    description: 'Corporate operators embedded in the neon towers.',
    color: '#38bdf8',
    glow: '#0ea5e9',
    background: 'rgba(14, 165, 233, 0.16)',
    icon: BriefcaseBusiness,
  },
  mercenary: {
    id: 'mercenary',
    label: 'Mercenary',
    description: 'Remote mercs pulling code contracts across borders.',
    color: '#c084fc',
    glow: '#a855f7',
    background: 'rgba(168, 85, 247, 0.16)',
    icon: Globe2,
  },
  fixer: {
    id: 'fixer',
    label: 'Fixer',
    description: 'Connectors orchestrating gigs, talent, and opportunities.',
    color: '#facc15',
    glow: '#eab308',
    background: 'rgba(234, 179, 8, 0.16)',
    icon: Handshake,
  },
  nomad: {
    id: 'nomad',
    label: 'Nomad',
    description: 'Free-range coders, open-source drifters, and contract pros.',
    color: '#f87171',
    glow: '#ef4444',
    background: 'rgba(248, 113, 113, 0.16)',
    icon: Compass,
  },
  street_kid: {
    id: 'street_kid',
    label: 'Street Kid',
    description: 'Students grinding through the grid one commit at a time.',
    color: '#94a3b8',
    glow: '#cbd5f5',
    background: 'rgba(148, 163, 184, 0.18)',
    icon: GraduationCap,
  },
  netrunner: {
    id: 'netrunner',
    label: 'Netrunner',
    description: 'Cyber defense and red-team specialists breaching the matrix.',
    color: '#4ade80',
    glow: '#22c55e',
    background: 'rgba(34, 197, 94, 0.16)',
    icon: Cpu,
  },
}

export const ARCHETYPE_OPTIONS = ARCHETYPE_ORDER.map((id) => ARCHETYPE_META[id])

export function getArchetypeMeta(id: ArchetypeId | null | undefined) {
  if (!id) return null
  return ARCHETYPE_META[id]
}


