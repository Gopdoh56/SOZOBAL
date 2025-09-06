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
          {/* Logo - Two-line SOZ/BAL design */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0 mr-6">
            {/* Cursive Logo */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-lg p-2 min-w-[48px] shadow-sm">
              <div className="text-sm font-bold leading-none" style={{ fontFamily: 'cursive' }}>SOZ</div>
              <div className="text-sm font-bold leading-none" style={{ fontFamily: 'cursive' }}>BAL</div>
            </div>
            {/* Full name for larger screens */}
            <span className="font-bold text-2xl text-foreground hidden lg:block">SOZOBAL</span>
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
            <div className="flex space-x-3 px-2 py-2 min-w-max">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground hover:text-accent transition-colors font-medium whitespace-nowrap text-sm px-3 py-1.5 rounded-md hover:bg-accent/10 flex-shrink-0 border border-border/30"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>


        </div>

        {/* Optional: Scroll indicator for mobile - Positioned better */}
        <div className="md:hidden pb-1">
          <div className="text-right text-xs text-muted-foreground/60">
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