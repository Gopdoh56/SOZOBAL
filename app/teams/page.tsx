import { Navigation } from "@/components/header"
import { TeamsHeader } from "@/components/teams/teams-header"
import { ConferenceStandings } from "@/components/teams/conference-standings"
import { TeamsGrid } from "@/components/teams/teams-grid"

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <TeamsHeader />
        <ConferenceStandings />
        <TeamsGrid />
      </main>
    </div>
  )
}
