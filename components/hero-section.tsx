"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, Trophy } from "lucide-react"
import { useState, useEffect } from "react"

export function HeroSection() {
  // Array of background images - replace these URLs with your actual images
  const backgroundImages = [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
      <div className="relative z-20 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight">
              Experience the
              <span className="text-primary block">Ultimate Basketball</span>
              Action
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Get real-time scores, player stats, team updates, and breaking news from the world of professional
              basketball.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-base font-medium px-8 py-3">
              <Play className="mr-2 h-5 w-5" />
              Watch Highlights
            </Button>
            <Button variant="outline" size="lg" className="text-base font-medium px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Trophy className="mr-2 h-5 w-5" />
              View Standings
            </Button>
          </div>

          {/* Quick Stats or Additional Info */}
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              <Calendar className="mr-2 h-4 w-4" />
              Live Games Today
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              <Trophy className="mr-2 h-4 w-4" />
              Season 2024-25
            </Badge>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
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