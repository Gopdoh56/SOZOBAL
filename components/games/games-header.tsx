import { Badge } from "@/components/ui/badge"

export function GamesHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-4xl font-bold text-foreground">Games</h1>
        <Badge className="bg-accent text-accent-foreground">Live</Badge>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Follow all SOZOBAL games with live scores, detailed statistics, and comprehensive game coverage.
      </p>
    </div>
  )
}
