
export const dynamic = 'force-dynamic'
export const revalidate = 0"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/Client"

interface FilterCounts {
  all: number
  live: number
  today: number
  completed: number
  upcoming: number
}

interface GamesFilterProps {
  onFilterChange: (filter: string) => void
}

export function GamesFilter({ onFilterChange }: GamesFilterProps) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [counts, setCounts] = useState<FilterCounts>({
    all: 0,
    live: 0,
    today: 0,
    completed: 0,
    upcoming: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCounts()
  }, [])

  const loadCounts = async () => {
    const supabase = createClient()
    
    // Get all matches
    const { data: allMatches, error } = await supabase
      .from('matches')
      .select('id, status, match_date')
    
    if (error) {
      console.error('Error loading match counts:', error)
      setLoading(false)
      return
    }

    if (!allMatches) {
      setLoading(false)
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const newCounts: FilterCounts = {
      all: allMatches.length,
      live: allMatches.filter(m => m.status === 'live').length,
      today: allMatches.filter(m => {
        const matchDate = new Date(m.match_date)
        return matchDate >= today && matchDate < tomorrow
      }).length,
      completed: allMatches.filter(m => m.status === 'completed').length,
      upcoming: allMatches.filter(m => m.status === 'scheduled').length,
    }

    setCounts(newCounts)
    setLoading(false)
  }

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    onFilterChange(filterId)
  }

  const filters = [
    { id: "all", label: "All Games", count: counts.all },
    { id: "live", label: "Live", count: counts.live },
    { id: "today", label: "Today", count: counts.today },
    { id: "completed", label: "Completed", count: counts.completed },
    { id: "upcoming", label: "Upcoming", count: counts.upcoming },
  ]

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => handleFilterChange(filter.id)}
              className={activeFilter === filter.id ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
              disabled={loading}
            >
              {filter.label}
              <span className="ml-2 text-sm opacity-75">({filter.count})</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}