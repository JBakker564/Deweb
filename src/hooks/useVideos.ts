import { useState, useEffect } from 'react'
import { supabase, type Video } from '../lib/supabase'

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch videos from database
  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setVideos(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Add new video
  const addVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get the highest order_index and add 1
      const { data: existingVideos } = await supabase
        .from('videos')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1)

      const nextOrderIndex = existingVideos && existingVideos.length > 0 
        ? (existingVideos[0].order_index || 0) + 1 
        : 1

      const videoWithOrder = {
        ...video,
        order_index: nextOrderIndex
      }

      const { data, error } = await supabase
        .from('videos')
        .insert([videoWithOrder])
        .select()
        .single()

      if (error) throw error
      setVideos(prev => [...prev, data].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)))
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add video'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Update video
  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setVideos(prev => prev.map(v => v.id === id ? data : v).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)))
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update video'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Delete video
  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setVideos(prev => prev.filter(v => v.id !== id))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete video'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Move video up or down in order
  const moveVideo = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = videos.findIndex(v => v.id === id)
      if (currentIndex === -1) return { success: false, error: 'Video not found' }
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= videos.length) return { success: false, error: 'Cannot move video' }
      
      const currentVideo = videos[currentIndex]
      const targetVideo = videos[newIndex]
      
      // Swap order indices
      await updateVideo(currentVideo.id, { order_index: targetVideo.order_index })
      await updateVideo(targetVideo.id, { order_index: currentVideo.order_index })
      
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to move video'
      return { success: false, error: message }
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  return {
    videos,
    loading,
    error,
    addVideo,
    updateVideo,
    deleteVideo,
    moveVideo,
    refetch: fetchVideos
  }
}