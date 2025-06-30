import { useState, useEffect, useCallback } from 'react'
import { supabase, type AboutContent } from '../lib/supabase'

export function useAboutContent() {
  const [content, setContent] = useState<AboutContent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch about content from database (public view)
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })

      if (error) throw error
      setContent(data || [])
    } catch (err) {
      console.error('Error fetching about content:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Add new content
  const addContent = async (contentData: Omit<AboutContent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .insert([contentData])
        .select()
        .single()

      if (error) throw error
      
      // Refresh all content after adding
      await fetchAllContent()
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add content'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Update content
  const updateContent = async (id: string, updates: Partial<AboutContent>) => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Refresh all content after updating
      await fetchAllContent()
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update content'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Delete content
  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('about_content')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Refresh all content after deleting
      await fetchAllContent()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete content'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Fetch all content (including inactive) for admin
  const fetchAllContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setContent(data || [])
    } catch (err) {
      console.error('Error fetching all about content:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Only fetch on mount, not on every render
  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  return {
    content,
    loading,
    error,
    addContent,
    updateContent,
    deleteContent,
    refetch: fetchContent,
    fetchAllContent
  }
}