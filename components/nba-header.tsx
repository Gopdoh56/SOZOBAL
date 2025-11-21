"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NBAHeader() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    { name: "Games", path: "/games" },
    { name: "Schedule", path: "/schedule" },
    { name: "NBA Cup", path: "/nba-cup" },
    { name: "Watch", path: "/watch" },
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
        <div className="flex items-center h-14 px-3">
          <div className="flex items-center gap-3 md:gap-6">
            
            {/* Hamburger Menu - Mobile/All screens */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-1"
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* Logo - Made Clickable */}
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-0 hover:opacity-80 transition"
            >
              <div className="w-8 h-10 md:w-10 md:h-12 bg-white rounded flex items-center justify-center">
                <div className="w-6 h-8 md:w-8 md:h-10 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-blue-600 rounded-sm" style={{ clipPath: "polygon(0 0, 45% 0, 45% 100%, 0 100%)" }}></div>
                    <div className="absolute inset-0 bg-red-600 rounded-sm" style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 55% 100%)" }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-xs font-bold">🏀</div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tight ml-1">BALL</span>
            </button>

            {/* Main Nav Items - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className="text-sm font-semibold hover:text-gray-300 transition whitespace-nowrap"
                >
                  {item.name}
                </button>
              ))}
            </nav>
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