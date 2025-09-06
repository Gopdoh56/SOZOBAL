import { Navigation } from "@/components/header"
import { PlayersHeader } from "@/components/players/players-header"
import { PlayersFilters } from "@/components/players/players-filters"
import { FeaturedPlayers } from "@/components/players/featured-players"
import { PlayersGrid } from "@/components/players/players-grid"

export default function PlayersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <PlayersHeader />
        <PlayersFilters />
        <FeaturedPlayers />
        <PlayersGrid />
      </main>
    </div>
  )
}
