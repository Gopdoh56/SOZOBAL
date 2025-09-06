import { Navigation } from "@/components/header"
import { GamesHeader } from "@/components/games/games-header"
import { GamesFilter } from "@/components/games/games-filter"
import { GamesList } from "@/components/games/games-list"

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <GamesHeader />
        <GamesFilter />
        <GamesList />
      </main>
    </div>
  )
}
