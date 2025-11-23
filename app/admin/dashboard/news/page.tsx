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
  updated_at: string
}

export default function LatestNewsAdmin() {
  const [stories, setStories] = useState<NewsStory[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [nextStory, setNextStory] = useState("")
  const [orderIndex, setOrderIndex] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('latest_news')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error loading stories:', error)
    } else if (data) {
      setStories(data)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    const supabase = createClient()

    if (editingId) {
      const { error } = await supabase
        .from('latest_news')
        .update({
          title,
          image_url: imageUrl || '',
          video_url: videoUrl || '',
          next_story: nextStory,
          order_index: orderIndex
        })
        .eq('id', editingId)

      if (error) console.error('Error updating story:', error)
    } else {
      const { error } = await supabase
        .from('latest_news')
        .insert({
          title,
          image_url: imageUrl || '',
          video_url: videoUrl || '',
          next_story: nextStory,
          order_index: orderIndex,
          is_active: true
        })

      if (error) console.error('Error creating story:', error)
    }

    resetForm()
    loadStories()
  }

  const resetForm = () => {
    setTitle("")
    setImageUrl("")
    setVideoUrl("")
    setNextStory("")
    setOrderIndex(0)
    setEditingId(null)
  }

  const handleEdit = (story: NewsStory) => {
    setTitle(story.title)
    setImageUrl(story.image_url)
    setVideoUrl(story.video_url)
    setNextStory(story.next_story)
    setOrderIndex(story.order_index)
    setEditingId(story.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('latest_news')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error toggling story:', error)
    } else {
      loadStories()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news story?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('latest_news')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting story:', error)
    } else {
      loadStories()
    }
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
        <h1 className="text-3xl font-bold text-black mb-6">Latest News Admin</h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4">
            {editingId ? 'Edit News Story' : 'Add New News Story'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black placeholder:text-gray-500"
                placeholder="/basketball-game-action.png"
              />
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full max-w-md h-40 object-cover rounded border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Video URL (Optional)
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black placeholder:text-gray-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Next Story Text
              </label>
              <input
                type="text"
                value={nextStory}
                onChange={(e) => setNextStory(e.target.value)}
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
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black placeholder:text-gray-500"
                placeholder="0"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                {editingId ? 'Update' : 'Add'} Story
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="bg-gray-200 text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stories List */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-xl font-bold text-black">Existing News Stories</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: {stories.length} stories ({stories.filter(s => s.is_active).length} active)
            </p>
          </div>
          <div className="divide-y divide-gray-300">
            {stories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No news stories yet. Add your first one above!
              </div>
            ) : (
              stories.map((story) => (
                <div key={story.id} className="p-6">
                  <div className="flex gap-4">
                    {story.image_url && (
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-32 h-20 object-cover rounded border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-black font-bold text-lg">{story.title}</h3>
                      {story.next_story && (
                        <p className="text-sm text-gray-600 mt-1 font-medium">
                          {story.next_story}
                        </p>
                      )}
                      {story.video_url && (
                        <p className="text-xs text-blue-600 mt-1">
                          📹 Video: {story.video_url}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-black font-bold">
                          Order: {story.order_index}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            story.is_active
                              ? 'bg-green-100 text-black border border-green-300'
                              : 'bg-gray-100 text-black border border-gray-300'
                          }`}
                        >
                          {story.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Updated: {new Date(story.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleToggle(story.id, story.is_active)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleEdit(story)}
                        className="text-black hover:text-gray-700 font-bold text-sm underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}