import { Navigation } from "@/components/header"
import { NewsHeader } from "@/components/news/news-header"
import { BreakingNews } from "@/components/news/breaking-news"
import { NewsFilters } from "@/components/news/news-filters"
import { FeaturedNews } from "@/components/news/featured-news"
import { NewsGrid } from "@/components/news/news-grid"

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <NewsHeader />
        <BreakingNews />
        <NewsFilters />
        <FeaturedNews />
        <NewsGrid />
      </main>
    </div>
  )
}
