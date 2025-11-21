"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NBAHeader() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    { name: "Games", path: "/games" },
    { name: "Schedule", path: "/schedule" },
    { name: "Teams", path: "/teams" },
    { name: "Stats", path: "/stats" },
    { name: "Players", path: "/players" },
    { name: "News", path: "/news" },
    { name: "Standings", path: "/standings" },
    { name: "Fantasy", path: "/fantasy" },
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      {/* CSS to hide scrollbar but keep functionality */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      <div className="max-w-full">
        {/* Single Row: Hamburger, Logo, and Horizontal Scrolling Nav */}
        <div className="flex items-center h-14">
          
          {/* Hamburger Menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 hover:bg-gray-800 rounded transition flex-shrink-0 ml-2"
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>

          {/* Logo */}
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-0 hover:opacity-80 transition flex-shrink-0 ml-2"
          >
            <div className="w-7 h-9 bg-white rounded flex items-center justify-center">
              <div className="w-5 h-7 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-green-600 rounded-sm" style={{ clipPath: "polygon(0 0, 45% 0, 45% 100%, 0 100%)" }}></div>
                  <div className="absolute inset-0 bg-red-600 rounded-sm" style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 55% 100%)" }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-xs font-bold">🏀</div>
                  </div>
                </div>
              </div>
            </div>
            <span className="text-lg md:text-xl font-black tracking-tight ml-1">BALL</span>
          </button>

          {/* Horizontal Scrolling Navigation */}
          <div className="flex-1 overflow-x-auto no-scrollbar ml-3">
            <nav className="flex items-center gap-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className="px-3 py-2 text-sm font-semibold hover:text-gray-300 hover:bg-gray-800 rounded transition whitespace-nowrap"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Vertical Menu (Expanded via Hamburger) */}
        {mobileMenuOpen && (
          <div className="bg-gray-900 border-t border-gray-800">
            <nav className="flex flex-col">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className="text-left px-6 py-4 text-base font-medium hover:bg-gray-800 transition border-b border-gray-800 last:border-b-0"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}