export const dynamic = 'force-dynamic'
export const revalidate = 0

"use client"

import { useState } from "react"
import { ScheduleFilters } from "@/components/schedule/schedule-filters"
import { ScheduleCalendar } from "@/components/schedule/schedule-calendar"

export default function SchedulePage() {
  const [filters, setFilters] = useState({
    viewMode: "calendar",
    team: "all",
    month: "",
  })

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Schedule</h1>
        <p className="text-gray-600">View upcoming games and plan your attendance</p>
      </div>

      <ScheduleFilters onFilterChange={handleFilterChange} />
      
      {filters.viewMode === "calendar" ? (
        <ScheduleCalendar filters={filters} />
      ) : (
        <ScheduleCalendar filters={filters} />
      )}
    </div>
  )
}