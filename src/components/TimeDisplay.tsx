'use client'

import { useState, useEffect } from 'react'

export function TimeDisplay() {
  const [time, setTime] = useState('--:--:--')

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }
    
    // Update immediately
    updateTime()
    
    // Update every second
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return <span>{time}</span>
}
