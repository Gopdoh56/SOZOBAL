"use client"

import { useState } from "react"
import { GamesFilter } from "@/components/games-filter"
import { GamesList } from "@/components/games-list"

export default function GamesPage() {
  const [activeFilter, setActiveFilter] = useState("all")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Games</h1>
        <p className="text-gray-600">Watch live games, view schedules and past results</p>
      </div>

      <GamesFilter onFilterChange={setActiveFilter} />
      <GamesList filter={activeFilter} />
    </div>
  )
}