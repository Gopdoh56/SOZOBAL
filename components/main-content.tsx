"use client"
import StoriesCarousel from "./stories-carousel"
import TrendingNow from "./trending-now"

export default function MainContent() {
  return (
    <div className="space-y-12">
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">STORIES</h2>
        </div>
        <StoriesCarousel />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">TRENDING NOW</h2>
        <TrendingNow />
      </section>
    </div>
  )
}
