"use client"

import { useState } from "react"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "FANTASTIC FINISH: VUČEVIĆ'S CLUTCH 3 STUNS BLAZERS",
      image: "/basketball-players-red-jerseys-celebrating-clutch-.jpg",
      nextStory: "Next: Fantastic Finish: Knicks prevail in wild finish",
    },
    {
      title: "KNICKS DOMINATE IN THRILLING OVERTIME VICTORY",
      image: "/basketball-action.png",
      nextStory: "Next: Historic performance leads team to championship",
    },
  ]

  return (
    <section className="bg-white pt-4 sm:pt-6">
      {/* League Pass Banner - Centered and Narrower */}
      <div className="bg-blue-600 text-white px-4 py-3 sm:py-4 mb-4 sm:mb-6 mx-4 rounded-lg">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <span className="text-base sm:text-lg font-bold">GOTECH SOLUTIONS</span>
          <button className="bg-white text-blue-600 px-4 sm:px-6 py-2 rounded font-bold hover:bg-gray-100 transition text-sm sm:text-base">
            GET YOUR WEBSITES NOW!!!!!
          </button>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative bg-black overflow-hidden rounded-lg">
          {/* Featured Image */}
          <img
            src={slides[currentSlide].image || "/placeholder.svg"}
            alt={slides[currentSlide].title}
            className="w-full h-96 object-cover"
          />

          {/* Dark Overlay for Text */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 max-w-2xl leading-tight">
              {slides[currentSlide].title}
            </h2>

            {/* Watch Button */}
            <button className="border-2 border-white text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold hover:bg-white hover:text-black transition text-sm sm:text-base">
              WATCH
            </button>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-2 py-4 sm:py-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 flex-1 rounded-full transition ${idx === currentSlide ? "bg-black" : "bg-gray-300"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Next Story Preview */}
        <div className="pb-6 sm:pb-8">
          <p className="text-gray-600 text-sm">{slides[currentSlide].nextStory}</p>
        </div>
      </div>
    </section>
  )
}