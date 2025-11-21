"use client"
import NBAHeader from "@/components/nba-header"
import MiniScores from "@/components/mini-scores"
import HeroSection from "@/components/hero-section"
import ScoresSection from "@/components/scores-section"
import StandingsSection from "@/components/standings-section"
import FeaturedPlayer from "@/components/featured-player"
import ScoringLeaders from "@/components/scoring-leaders"
import LatestNews from "@/components/latest-news"
import Foot from "@/components/footer"
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <NBAHeader />
      <MiniScores />
      <HeroSection />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <ScoresSection />
        <StandingsSection />
        <FeaturedPlayer />
        <ScoringLeaders />
        <LatestNews />
        <Foot />
        

      </main>
    </div>
  )
}
