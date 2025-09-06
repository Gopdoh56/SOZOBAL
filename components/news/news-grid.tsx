import { NewsCard } from "./news-card"

export function NewsGrid() {
  const newsArticles = [
    {
      id: 1,
      headline: "Warriors Defeat Kings in Overtime Thriller",
      summary: "Stephen Curry's 42-point performance leads Golden State to a crucial victory in the playoff race.",
      category: "Game Recap",
      author: "Mike Chen",
      publishedAt: "8 hours ago",
      readTime: "3 min read",
      views: "8.2K",
      image: "/placeholder.svg?key=warriors-game",
      teamLogo: "/warriors-basketball-team-logo.png",
    },
    {
      id: 2,
      headline: "Heat Sign Former All-Star Center to Multi-Year Deal",
      summary: "Miami bolsters their frontcourt with the addition of veteran center in preparation for playoff push.",
      category: "Trades & Signings",
      author: "Lisa Rodriguez",
      publishedAt: "12 hours ago",
      readTime: "4 min read",
      views: "6.7K",
      image: "/placeholder.svg?key=heat-signing",
      teamLogo: "/heat-basketball-team-logo.jpg",
    },
    {
      id: 3,
      headline: "Bulls' Rising Star Named Rookie of the Month",
      summary: "Chicago's first-year player continues to impress with outstanding performances throughout March.",
      category: "Awards & Honors",
      author: "David Park",
      publishedAt: "1 day ago",
      readTime: "2 min read",
      views: "5.1K",
      image: "/placeholder.svg?key=bulls-rookie",
      teamLogo: "/bulls-basketball-team-logo.png",
    },
    {
      id: 4,
      headline: "Nets Injury Update: Star Player Expected to Return Next Week",
      summary: "Brooklyn receives positive news as their leading scorer nears return from ankle injury.",
      category: "Injury Reports",
      author: "Jennifer Kim",
      publishedAt: "1 day ago",
      readTime: "3 min read",
      views: "4.8K",
      image: "/placeholder.svg?key=nets-injury",
      teamLogo: "/nets-basketball-team-logo.jpg",
    },
    {
      id: 5,
      headline: "SOZOBAL Announces New Playoff Format for 2024 Season",
      summary: "League officials reveal changes to postseason structure aimed at increasing competitive balance.",
      category: "League News",
      author: "Robert Taylor",
      publishedAt: "2 days ago",
      readTime: "5 min read",
      views: "9.3K",
      image: "/placeholder.svg?key=league-news",
      teamLogo: "/abstract-basketball-logo.png",
    },
    {
      id: 6,
      headline: "Celtics Extend Home Winning Streak to 15 Games",
      summary: "Boston continues their dominant home performance with another convincing victory at TD Garden.",
      category: "Game Recap",
      author: "Amanda White",
      publishedAt: "2 days ago",
      readTime: "3 min read",
      views: "7.1K",
      image: "/placeholder.svg?key=celtics-home",
      teamLogo: "/celtics-basketball-team-logo.png",
    },
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6">Latest News</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {newsArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
