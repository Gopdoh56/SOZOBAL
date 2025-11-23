"use client"

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'

interface NewsStory {
  id: string
  title: string
  image_url: string
  video_url: string
  next_story: string
  order_index: number
  is_active: boolean
  created_at: string
}

export default function LatestNews() {
  const [stories, setStories] = useState<NewsStory[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('latest_news')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error loading stories:', error)
    } else if (data && data.length > 0) {
      setStories(data)
    }

    setLoading(false)
  }

  const currentStory = stories[currentIndex]

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold">Latest News</h2>
        </div>
        <div className="bg-black rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-800 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    )
  }

  if (stories.length === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold">Latest News</h2>
        </div>
        <div className="bg-black rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-800 flex items-center justify-center">
            <p className="text-white text-xl">No news stories available</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold">Latest News</h2>
        <a href="#" className="text-red-600 font-bold text-sm hover:text-red-700 transition">
          View All →
        </a>
      </div>

      <div className="bg-black rounded-lg overflow-hidden relative">
        {/* Navigation Arrows */}
        {stories.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition"
              aria-label="Previous story"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition"
              aria-label="Next story"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <div className="aspect-video bg-gray-800 flex items-center justify-center overflow-hidden">
          {currentStory.image_url ? (
            <img 
              src={currentStory.image_url} 
              alt={currentStory.title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 text-2xl">📰</span>
            </div>
          )}
        </div>

        <div className="p-8 text-white">
          <h3 className="text-3xl font-bold mb-4">{currentStory.title}</h3>

          {currentStory.video_url && (
            <a
              href={currentStory.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 border-white text-white px-8 py-2 rounded-full font-bold hover:bg-white hover:text-black transition"
            >
              WATCH
            </a>
          )}

          {stories.length > 1 && (
            <div className="flex gap-2 mt-8 mb-8">
              {stories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1 flex-1 rounded transition-all ${
                    index === currentIndex ? "bg-white" : "bg-gray-600 hover:bg-gray-500"
                  }`}
                  aria-label={`Go to story ${index + 1}`}
                />
              ))}
            </div>
          )}

          {currentStory.next_story && (
            <p className="text-gray-300">{currentStory.next_story}</p>
          )}
        </div>
      </div>
    </section>
  )
}