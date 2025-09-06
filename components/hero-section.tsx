"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, Trophy } from "lucide-react"
import { useState, useEffect } from "react"

export function HeroSection() {
  // Array of background images - replace these URLs with your actual images
  const backgroundImages = [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZGFvZWJ8fHwwfHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      )
    }, 2000) // Change image every 2 seconds

    return () => clearInterval(interval)
  }, [backgroundImages.length])

  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-in-out ${
              index === currentImageIndex 
                ? 'transform translate-x-0' 
                : index === (currentImageIndex - 1 + backgroundImages.length) % backgroundImages.length
                  ? 'transform -translate-x-full'
                  : 'transform translate-x-full'
            }`}
            style={{
              backgroundImage: `url(${image})`
            }}
          />
        ))}
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-16 md:py-12 text-center"> {/* Adjusted vertical padding */}
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-4"> {/* Reduced max-width and spacing */}
          <div className="space-y-4 md:space-y-3"> {/* Reduced spacing */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"> {/* Adjusted font sizes */}
              Experience the
              <span className="text-primary block">Ultimate Basketball</span>
              Action
            </h1>
            <p className="text-base md:text-lg text-gray-200 max-w-xl mx-auto"> {/* Adjusted font size and max-width */}
              Get real-time scores, player stats, team updates, and breaking news from the world of professional
              basketball.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center"> {/* Reduced gap */}
            <Button size="md" className="text-base font-medium px-6 py-2"> {/* Adjusted button size */}
              <Play className="mr-2 h-4 w-4" /> {/* Adjusted icon size */}
              Watch Highlights
            </Button>
            <Button variant="outline" size="md" className="text-base font-medium px-6 py-2 bg-white/10 border-white/30 text-white hover:bg-white/20"> {/* Adjusted button size */}
              <Trophy className="mr-2 h-4 w-4" /> {/* Adjusted icon size */}
              View Standings
            </Button>
          </div>

          {/* Quick Stats or Additional Info */}
          <div className="flex flex-wrap justify-center gap-3 pt-6"> {/* Reduced gap and padding-top */}
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 py-1.5 text-sm"> {/* Adjusted badge padding and font size */}
              <Calendar className="mr-2 h-3.5 w-3.5" /> {/* Adjusted icon size */}
              Live Games Today
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 py-1.5 text-sm"> {/* Adjusted badge padding and font size */}
              <Trophy className="mr-2 h-3.5 w-3.5" /> {/* Adjusted icon size */}
              Season 2024-25
            </Badge>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"> {/* Adjusted bottom position */}
        <div className="flex space-x-2">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${ // Adjusted indicator size
                index === currentImageIndex 
                  ? 'bg-primary' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}