"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"

export default function StoriesCarousel() {
  const [scrollPos, setScrollPos] = useState(0)

  const stories = [
    { title: "KIA SEASON PREVIEW: BREAKING DOWN ALL 30...", label: "NEW" },
    { title: "2025-26 NBA SEASON WATCH GUIDE", label: "NEW" },
    { title: "POWER RANKINGS: WHERE ALL 30 TEAMS STAND", label: "NEW" },
    { title: "DURANT AGREES TO EXTENSION WITH ROCKETS", label: "NEW" },
    { title: "TO EXTENSI TRAIL BLAZER", label: "NEW" },
  ]

  return (
    <div className="relative">
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 pb-4">
          {stories.map((story, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-72 bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 cursor-pointer transition group"
            >
              <div className="h-40 bg-gradient-to-br from-gray-700 to-zinc-900" />
              <div className="p-4">
                <div className="inline-block bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded mb-2">
                  {story.label}
                </div>
                <p className="font-bold text-sm leading-tight group-hover:text-yellow-400 transition">{story.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="absolute right-0 top-1/3 transform -translate-y-1/2 bg-black rounded-full p-2 hover:bg-zinc-800 transition">
        <ChevronRight className="w-6 h-6" />
      </button>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
