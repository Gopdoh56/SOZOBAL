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
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-full">
        {/* Top Navigation */}
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-6 md:gap-10">
            
            {/* Hamburger Menu - Mobile/All screens */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white text-2xl p-1"
              aria-label="Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* NBA Logo - Made Clickable */}
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-0 hover:opacity-80 transition"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded flex items-center justify-center">
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-blue-600 rounded-sm" style={{ clipPath: "polygon(0 0, 45% 0, 45% 100%, 0 100%)" }}></div>
                    <div className="absolute inset-0 bg-red-600 rounded-sm" style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 55% 100%)" }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-xs font-bold">🏀</div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-2xl md:text-3xl font-black tracking-tight ml-1">265HOOPS</span>
            </button>

            {/* Main Nav Items - Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className="text-base font-semibold hover:text-gray-300 transition whitespace-nowrap"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 transition flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gray-900 border-t border-gray-800">
            <nav className="flex flex-col">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className="text-left px-6 py-4 text-base font-medium hover:bg-gray-800 transition border-b border-gray-800"
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
