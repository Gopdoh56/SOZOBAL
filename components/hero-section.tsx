"use client"

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'

interface HeroSlide {
  id: string
  title: string
  image_url: string
  next_story: string
  order_index: number
  is_active: boolean
}

interface BannerConfig {
  id: string
  text: string
  is_active: boolean
}

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [bannerText, setBannerText] = useState("GOTECH SOLUTIONS - GET YOUR WEBSITES NOW!!!!! 🚀")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    // Load active slides
    const { data: slidesData } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    // Load active banner
    const { data: bannerData } = await supabase
      .from('banner_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (slidesData && slidesData.length > 0) {
      setSlides(slidesData)
    }

    if (bannerData && bannerData.length > 0) {
      setBannerText(bannerData[0].text)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <section className="bg-white pt-2 sm:pt-3">
        <div className="flex items-center justify-center h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </section>
    )
  }

  // If no slides, show placeholder
  if (slides.length === 0) {
    return (
      <section className="bg-white pt-2 sm:pt-3">
        <div className="bg-blue-600 text-white px-0 py-2 mb-1 sm:mb-2 overflow-hidden">
          <style jsx>{`
            @keyframes scroll {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .scrolling-text {
              animation: scroll 15s linear infinite;
              white-space: nowrap;
            }
          `}</style>
          
          <div className="flex items-center gap-8">
            <div className="scrolling-text flex items-center gap-8">
              <span className="text-sm sm:text-base font-bold">{bannerText}</span>
              <span className="text-sm sm:text-base font-bold">{bannerText}</span>
              <span className="text-sm sm:text-base font-bold">{bannerText}</span>
              <span className="text-sm sm:text-base font-bold">{bannerText}</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-500">No hero slides available. Please add slides in the admin panel.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white pt-2 sm:pt-3">
      {/* League Pass Banner - Scrolling Text */}
      <div className="bg-blue-600 text-white px-0 py-2 mb-1 sm:mb-2 overflow-hidden">
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .scrolling-text {
            animation: scroll 15s linear infinite;
            white-space: nowrap;
          }
        `}</style>
        
        <div className="flex items-center gap-8">
          <div className="scrolling-text flex items-center gap-8">
            <span className="text-sm sm:text-base font-bold">{bannerText}</span>
            <span className="text-sm sm:text-base font-bold">{bannerText}</span>
            <span className="text-sm sm:text-base font-bold">{bannerText}</span>
            <span className="text-sm sm:text-base font-bold">{bannerText}</span>
          </div>
        </div>
      </div>

      {/* Hero Image Section - FULL WIDTH */}
      <div className="w-full">
        {/* Removed rounded-lg and max-w constraint */}
        <div className="relative bg-black"> 
          
          {/* Featured Image */}
          {slides[currentSlide].image_url ? (
            <img
              src={slides[currentSlide].image_url}
              alt={slides[currentSlide].title}
              className="w-full h-[500px] md:h-[700px] object-cover"
            />
          ) : (
            <div className="w-full h-[500px] md:h-[700px] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-white text-xl">No Image</span>
            </div>
          )}

          {/* Dark Overlay for Text */}
          {/* Added padding structure here so text stays aligned while image goes full width */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent pb-12 pt-20">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 max-w-3xl leading-tight drop-shadow-lg">
                {slides[currentSlide].title}
              </h2>

              {/* Watch Button */}
              <button className="border-2 border-white text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold hover:bg-white hover:text-black transition text-base sm:text-lg tracking-wide">
                WATCH
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section - Kept in container so they align with page content */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Carousel Indicators */}
        {slides.length > 1 && (
          <div className="flex gap-2 py-4 sm:py-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 flex-1 rounded-full transition ${idx === currentSlide ? "bg-black" : "bg-gray-300"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Next Story Preview */}
        {slides[currentSlide].next_story && (
          <div className="pb-6 sm:pb-8">
            <p className="text-gray-600 text-sm">{slides[currentSlide].next_story}</p>
          </div>
        )}
      </div>
    </section>
  )
}