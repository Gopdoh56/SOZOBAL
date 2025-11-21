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
    { name: "Players", path: "/players" },
    { name: "Stats", path: "/stats" },
    { name: "Tournaments", path: "/tournaments" },
    { name: "News", path: "/news" },
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-black text-white sticky top-0 z-50">
      <div className="max-w-full px-4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 md:gap-8">
            
            {/* NBA Logo - Made Clickable */}
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white text-xs">
                🏀
              </div>
              <span className="text-xl md:text-2xl font-bold">265 HOOPS</span>
            </button>

            {/* Hamburger Menu - Mobile */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white text-2xl"
            >
              ☰
            </button>

            {/* Main Nav Items - Desktop */}
            <nav className="hidden md:flex items-center gap-4 md:gap-6">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className="text-sm font-medium hover:text-gray-300 transition"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <button className="text-xl md:text-2xl">👤</button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 py-4">
            <nav className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className="text-left px-4 py-2 text-sm font-medium hover:bg-gray-800 transition"
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


