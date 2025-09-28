'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setTestResult('Testing connection...')
    
    try {
      // Test 1: Check if we can connect to Supabase
      const { data, error } = await supabase
        .from('posts')
        .select('count')
        .limit(1)

      if (error) {
        setTestResult(`❌ Connection Error: ${JSON.stringify(error, null, 2)}`)
      } else {
        setTestResult(`✅ Connection successful! Found ${data?.length || 0} posts.`)
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-green-400/20 bg-black/50 p-4 mb-4">
      <h3 className="text-lg font-bold mb-2">Supabase Connection Test</h3>
      <button
        onClick={testConnection}
        disabled={isLoading}
        className="px-4 py-2 bg-green-400 text-black font-bold hover:bg-green-300 disabled:opacity-50 mb-4"
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {testResult && (
        <div className="bg-black/80 p-3 border border-green-400/20">
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  )
}