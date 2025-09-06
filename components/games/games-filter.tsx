"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function GamesFilter() {
  const [activeFilter, setActiveFilter] = useState("all")

  const filters = [
    { id: "all", label: "All Games", count: 24 },
    { id: "live", label: "Live", count: 3 },
    { id: "today", label: "Today", count: 8 },
    { id: "completed", label: "Completed", count: 156 },
    { id: "upcoming", label: "Upcoming", count: 42 },
  ]

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.id)}
              className={activeFilter === filter.id ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
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
