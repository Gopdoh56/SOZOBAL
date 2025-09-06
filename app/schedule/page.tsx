import { Navigation } from "@/components/header"
import { ScheduleHeader } from "@/components/schedule/schedule-header"
import { ScheduleFilters } from "@/components/schedule/schedule-filters"
import { ScheduleCalendar } from "@/components/schedule/schedule-calendar"

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <ScheduleHeader />
        <ScheduleFilters />
        <ScheduleCalendar />
      </main>
    </div>
  )
}
