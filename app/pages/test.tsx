import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const [divisions, setDivisions] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('divisions')
        .select('*')
      
      if (error) {
        setError(error.message)
      } else {
        setDivisions(data || [])
      }
    }
    
    fetchData()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(divisions, null, 2)}
        </pre>
      )}
    </div>
  )
}