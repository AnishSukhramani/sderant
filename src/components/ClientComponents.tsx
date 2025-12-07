'use client'

import dynamic from 'next/dynamic'

// Lazy load non-critical components to improve FCP
const CustomCursor = dynamic(() => import('@/components/CustomCursor').then(mod => ({ default: mod.CustomCursor })), {
  ssr: false,
})

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => ({ default: mod.SmoothScroll })), {
  ssr: false,
})

export function ClientComponents() {
  return (
    <>
      <CustomCursor />
      <SmoothScroll />
    </>
  )
}

