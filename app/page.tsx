import { Navigation } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TeamsSection } from "@/components/teams-section"
import { ScoresScheduleSection } from "@/components/scores-schedule-section"
import { NewsSection } from "@/components/news-section"
import { PlayerSpotlightSection } from "@/components/player-spotlight-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <TeamsSection />
        <ScoresScheduleSection />
        <NewsSection />
        <PlayerSpotlightSection />
        <Footer />
      </main>
    </div>
  )
}