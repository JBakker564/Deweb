/**
 * Utility functions for YouTube video handling
 */

/**
 * Extract YouTube video ID from various URL formats
 */
export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Convert any YouTube URL to embed format
 */
export function convertToEmbedUrl(url: string): string {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

/**
 * Fetch YouTube video title using oEmbed API
 */
export async function fetchYouTubeTitle(url: string): Promise<{ success: boolean; title?: string; error?: string }> {
  try {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
      return { success: false, error: 'Ongeldige YouTube URL' };
    }

    // Use YouTube oEmbed API to get video info
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.title) {
      return { success: true, title: data.title };
    } else {
      return { success: false, error: 'Geen titel gevonden' };
    }
    
  } catch (error) {
    console.error('Error fetching YouTube title:', error);
    
    // Provide user-friendly error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Netwerkfout - controleer je internetverbinding' };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Onbekende fout bij ophalen titel' 
    };
  }
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(url: string, quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'mqdefault'): string | null {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  }
  return null;
}