"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export function Navigation() {
  const pathname = usePathname()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/games", label: "Games" },
    { href: "/schedule", label: "Schedule" },
    { href: "/teams", label: "Teams" },
    { href: "/players", label: "Players" },
    { href: "/news", label: "News" },
  ]

  // Filter out the current page from navigation items
  const filteredNavItems = navItems.filter(item => item.href !== pathname)

  // Auto-scroll to show active or important items
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Reset scroll position when route changes
      scrollContainerRef.current.scrollLeft = 0
    }
  }, [pathname])

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0 mr-4">
            <div className="bg-accent text-accent-foreground rounded-lg p-2 font-bold text-xl">SZ</div>
            <span className="font-bold text-2xl text-foreground hidden sm:block">SOZOBAL</span>
            <span className="font-bold text-xl text-foreground sm:hidden">SZ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-accent transition-colors font-medium whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Slidable Navigation */}
          <div 
            ref={scrollContainerRef}
            className="md:hidden flex-1 overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <div className="flex space-x-6 px-2 py-2 min-w-max">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground hover:text-accent transition-colors font-medium whitespace-nowrap text-sm px-3 py-2 rounded-lg hover:bg-accent/10 flex-shrink-0"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Current Page Indicator (Mobile) */}
          <div className="md:hidden flex-shrink-0 ml-4">
            <div className="bg-accent/20 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium">
              {navItems.find(item => item.href === pathname)?.label || 'Current'}
            </div>
          </div>
        </div>

        {/* Optional: Scroll indicator for mobile */}
        <div className="md:hidden relative">
          <div className="absolute right-4 top-[-8px] text-xs text-muted-foreground opacity-50">
            ← Slide to explore
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  )
}