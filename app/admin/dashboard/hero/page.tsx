"use client"

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'

interface BannerConfig {
  id: string
  text: string
  is_active: boolean
  created_at: string
}

interface HeroSlide {
  id: string
  title: string
  image_url: string
  next_story: string
  order_index: number
  is_active: boolean
  created_at: string
}

export default function HeroAdmin() {
  const [banners, setBanners] = useState<BannerConfig[]>([])
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'banner' | 'slides'>('banner')

  // Banner form state
  const [bannerText, setBannerText] = useState("")
  const [editingBanner, setEditingBanner] = useState<string | null>(null)

  // Slide form state
  const [slideTitle, setSlideTitle] = useState("")
  const [slideImageUrl, setSlideImageUrl] = useState("")
  const [slideNextStory, setSlideNextStory] = useState("")
  const [slideOrderIndex, setSlideOrderIndex] = useState(0)
  const [editingSlide, setEditingSlide] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()

    const [bannersResult, slidesResult] = await Promise.all([
      supabase.from('banner_config').select('*').order('created_at', { ascending: false }),
      supabase.from('hero_slides').select('*').order('order_index', { ascending: true })
    ])

    if (bannersResult.data) setBanners(bannersResult.data)
    if (slidesResult.data) setSlides(slidesResult.data)

    setLoading(false)
  }

  // Banner CRUD operations
  const handleSaveBanner = async () => {
    if (!bannerText.trim()) return

    const supabase = createClient()

    if (editingBanner) {
      await supabase
        .from('banner_config')
        .update({ text: bannerText })
        .eq('id', editingBanner)
    } else {
      await supabase
        .from('banner_config')
        .insert({ text: bannerText, is_active: true })
    }

    setBannerText("")
    setEditingBanner(null)
    loadData()
  }

  const handleEditBanner = (banner: BannerConfig) => {
    setBannerText(banner.text)
    setEditingBanner(banner.id)
  }

  const handleToggleBanner = async (id: string, currentStatus: boolean) => {
    const supabase = createClient()
    await supabase
      .from('banner_config')
      .update({ is_active: !currentStatus })
      .eq('id', id)
    loadData()
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    
    const supabase = createClient()
    await supabase.from('banner_config').delete().eq('id', id)
    loadData()
  }

  // Slide CRUD operations
  const handleSaveSlide = async () => {
    if (!slideTitle.trim()) return

    const supabase = createClient()

    if (editingSlide) {
      await supabase
        .from('hero_slides')
        .update({
          title: slideTitle,
          image_url: slideImageUrl || '',
          next_story: slideNextStory,
          order_index: slideOrderIndex
        })
        .eq('id', editingSlide)
    } else {
      await supabase
        .from('hero_slides')
        .insert({
          title: slideTitle,
          image_url: slideImageUrl || '',
          next_story: slideNextStory,
          order_index: slideOrderIndex,
          is_active: true
        })
    }

    resetSlideForm()
    loadData()
  }

  const resetSlideForm = () => {
    setSlideTitle("")
    setSlideImageUrl("")
    setSlideNextStory("")
    setSlideOrderIndex(0)
    setEditingSlide(null)
  }

  const handleEditSlide = (slide: HeroSlide) => {
    setSlideTitle(slide.title)
    setSlideImageUrl(slide.image_url)
    setSlideNextStory(slide.next_story)
    setSlideOrderIndex(slide.order_index)
    setEditingSlide(slide.id)
  }

  const handleToggleSlide = async (id: string, currentStatus: boolean) => {
    const supabase = createClient()
    await supabase
      .from('hero_slides')
      .update({ is_active: !currentStatus })
      .eq('id', id)
    loadData()
  }

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return
    
    const supabase = createClient()
    await supabase.from('hero_slides').delete().eq('id', id)
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">Hero Section Admin</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('banner')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'banner'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-black hover:bg-gray-100'
            }`}
          >
            Scrolling Banner
          </button>
          <button
            onClick={() => setActiveTab('slides')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'slides'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-black hover:bg-gray-100'
            }`}
          >
            Hero Slides
          </button>
        </div>

        {/* Banner Tab */}
        {activeTab === 'banner' && (
          <div>
            {/* Banner Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-bold text-black mb-4">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Banner Text
                  </label>
                  <input
                    type="text"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black placeholder:text-gray-500"
                    placeholder="GOTECH SOLUTIONS - GET YOUR WEBSITES NOW!!!!! 🚀"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveBanner}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    {editingBanner ? 'Update' : 'Add'} Banner
                  </button>
                  {editingBanner && (
                    <button
                      onClick={() => {
                        setBannerText("")
                        setEditingBanner(null)
                      }}
                      className="bg-gray-200 text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Banner List */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-xl font-bold text-black">Existing Banners</h2>
              </div>
              <div className="divide-y divide-gray-300">
                {banners.map((banner) => (
                  <div key={banner.id} className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-black font-bold text-lg">{banner.text}</p>
                      <p className="text-sm text-black mt-1 font-medium">
                        Created: {new Date(banner.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          banner.is_active
                            ? 'bg-green-100 text-black border border-green-300'
                            : 'bg-gray-100 text-black border border-gray-300'
                        }`}
                      >
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleBanner(banner.id, banner.is_active)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleEditBanner(banner)}
                        className="text-black hover:text-gray-700 font-bold text-sm underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Slides Tab */}
        {activeTab === 'slides' && (
          <div>
            {/* Slide Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-bold text-black mb-4">
                {editingSlide ? 'Edit Slide' : 'Add New Slide'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={slideTitle}
                    onChange={(e) => setSlideTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black placeholder:text-gray-500"
                    placeholder="FANTASTIC FINISH: VUČEVIĆ'S CLUTCH 3 STUNS BLAZERS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={slideImageUrl}
                    onChange={(e) => setSlideImageUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black placeholder:text-gray-500"
                    placeholder="/basketball-players-red-jerseys-celebrating-clutch-.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Next Story Text
                  </label>
                  <input
                    type="text"
                    value={slideNextStory}
                    onChange={(e) => setSlideNextStory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black placeholder:text-gray-500"
                    placeholder="Next: Fantastic Finish: Knicks prevail in wild finish"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Order Index (Lower numbers appear first)
                  </label>
                  <input
                    type="number"
                    value={slideOrderIndex}
                    onChange={(e) => setSlideOrderIndex(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black placeholder:text-gray-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveSlide}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    {editingSlide ? 'Update' : 'Add'} Slide
                  </button>
                  {editingSlide && (
                    <button
                      onClick={resetSlideForm}
                      className="bg-gray-200 text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Slides List */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-300">
                <h2 className="text-xl font-bold text-black">Existing Slides</h2>
              </div>
              <div className="divide-y divide-gray-300">
                {slides.map((slide) => (
                  <div key={slide.id} className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        className="w-32 h-20 object-cover rounded border border-gray-300"
                      />
                      <div className="flex-1">
                        <h3 className="text-black font-bold text-lg">{slide.title}</h3>
                        <p className="text-sm text-black mt-1 font-medium">{slide.next_story}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-black font-bold">Order: {slide.order_index}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              slide.is_active
                                ? 'bg-green-100 text-black border border-green-300'
                                : 'bg-gray-100 text-black border border-gray-300'
                            }`}
                          >
                            {slide.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleToggleSlide(slide.id, slide.is_active)}
                          className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleEditSlide(slide)}
                          className="text-black hover:text-gray-700 font-bold text-sm underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="text-red-600 hover:text-red-800 font-bold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}