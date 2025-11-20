import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = createClient()
  
  const { data: divisions, error } = await supabase
    .from('divisions')
    .select('*')
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      {error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(divisions, null, 2)}
        </pre>
      )}
    </div>
  )
}