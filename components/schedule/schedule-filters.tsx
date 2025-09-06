"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, List, Filter } from "lucide-react"

export function ScheduleFilters() {
  const [viewMode, setViewMode] = useState("calendar")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("march")

  const teams = [
    { value: "all", label: "All Teams" },
    { value: "lakers", label: "Lakers" },
    { value: "warriors", label: "Warriors" },
    { value: "celtics", label: "Celtics" },
    { value: "heat", label: "Heat" },
    { value: "bulls", label: "Bulls" },
    { value: "nets", label: "Nets" },
  ]

  const months = [
    { value: "march", label: "March 2024" },
    { value: "april", label: "April 2024" },
    { value: "may", label: "May 2024" },
    { value: "june", label: "June 2024" },
  ]

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={viewMode === "calendar" ? "bg-accent text-accent-foreground" : ""}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-accent text-accent-foreground" : ""}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filters:</span>
            </div>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.value} value={team.value}>
                    {team.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
