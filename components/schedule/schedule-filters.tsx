"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, List, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ScheduleFiltersProps {
  onFilterChange: (filters: {
    viewMode: string
    team: string
    month: string
  }) => void
}

export function ScheduleFilters({ onFilterChange }: ScheduleFiltersProps) {
  const [viewMode, setViewMode] = useState("calendar")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [teams, setTeams] = useState<Array<{ value: string; label: string }>>([])
  const [months, setMonths] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    loadTeams()
    loadAvailableMonths()
  }, [])

  useEffect(() => {
    onFilterChange({
      viewMode,
      team: selectedTeam,
      month: selectedMonth,
    })
  }, [viewMode, selectedTeam, selectedMonth])

  const loadTeams = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('teams')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error loading teams:', error)
      return
    }

    if (data) {
      const teamOptions = [
        { value: "all", label: "All Teams" },
        ...data.map(team => ({
          value: team.id,
          label: team.name,
        }))
      ]
      setTeams(teamOptions)
    }
  }

  const loadAvailableMonths = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('matches')
      .select('match_date')
      .order('match_date', { ascending: true })

    if (error) {
      console.error('Error loading matches:', error)
      return
    }

    if (data && data.length > 0) {
      // Extract unique year-month combinations
      const uniqueMonths = new Set<string>()
      data.forEach(match => {
        const date = new Date(match.match_date)
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        uniqueMonths.add(yearMonth)
      })

      // Convert to array and format
      const monthOptions = Array.from(uniqueMonths).map(yearMonth => {
        const [year, month] = yearMonth.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1)
        return {
          value: yearMonth,
          label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }
      })

      // Add "All Months" option
      const allOptions = [
        { value: "all", label: "All Months" },
        ...monthOptions
      ]

      setMonths(allOptions)
      
      // Set current month as default
      const now = new Date()
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      if (uniqueMonths.has(currentYearMonth)) {
        setSelectedMonth(currentYearMonth)
      } else if (monthOptions.length > 0) {
        setSelectedMonth(monthOptions[0].value)
      } else {
        setSelectedMonth("all")
      }
    }
  }

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode)
  }

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewModeChange("calendar")}
              className={viewMode === "calendar" ? "bg-accent text-accent-foreground" : ""}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewModeChange("list")}
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

            {months.length > 0 && (
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
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
            )}

            {teams.length > 0 && (
              <Select value={selectedTeam} onValueChange={handleTeamChange}>
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}