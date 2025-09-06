"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Filter, SortAsc } from "lucide-react"

export function PlayersFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedPosition, setSelectedPosition] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  const teams = [
    { value: "all", label: "All Teams" },
    { value: "lakers", label: "Lakers" },
    { value: "warriors", label: "Warriors" },
    { value: "celtics", label: "Celtics" },
    { value: "heat", label: "Heat" },
    { value: "bulls", label: "Bulls" },
    { value: "nets", label: "Nets" },
  ]

  const positions = [
    { value: "all", label: "All Positions" },
    { value: "pg", label: "Point Guard" },
    { value: "sg", label: "Shooting Guard" },
    { value: "sf", label: "Small Forward" },
    { value: "pf", label: "Power Forward" },
    { value: "c", label: "Center" },
  ]

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "points", label: "Points" },
    { value: "assists", label: "Assists" },
    { value: "rebounds", label: "Rebounds" },
    { value: "team", label: "Team" },
  ]

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filters:</span>
            </div>

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

            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
