import React, { createContext, useContext, ReactNode } from 'react';
import { useVideos } from '../hooks/useVideos';
import { useAuth } from '../hooks/useAuth';
import { useAboutContent } from '../hooks/useAboutContent';

interface Video {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  year?: number;
  format?: string;
  runtime?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

interface AboutContent {
  id: string;
  content_type: 'text' | 'image';
  title: string;
  content: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface VideoContextType {
  // Video management
  videos: Video[];
  loading: boolean;
  error: string | null;
  addVideo: (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateVideo: (id: string, updates: Partial<Video>) => Promise<any>;
  deleteVideo: (id: string) => Promise<any>;
  moveVideo: (id: string, direction: 'up' | 'down') => Promise<any>;
  refetch: () => void;
  
  // About content management
  aboutContent: AboutContent[];
  aboutLoading: boolean;
  aboutError: string | null;
  addAboutContent: (content: Omit<AboutContent, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateAboutContent: (id: string, updates: Partial<AboutContent>) => Promise<any>;
  deleteAboutContent: (id: string) => Promise<any>;
  refetchAboutContent: () => void;
  fetchAllAboutContent: () => Promise<void>;
  
  // Authentication
  user: any;
  isAuthenticated: boolean;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Default videos for fallback when database is empty
const defaultVideos: Video[] = [
  {
    id: '1',
    title: 'Cinematic Masterpiece',
    url: 'https://www.youtube.com/embed/t9gqtyhL2m8',
    category: 'Short Films',
    description: 'A stunning visual journey through cinematic storytelling.',
    year: 2024,
    format: '4K Digital',
    runtime: '5:30',
    order_index: 1
  },
  {
    id: '2',
    title: 'Visual Storytelling',
    url: 'https://www.youtube.com/embed/F6fHfOSRwSw',
    category: 'Documentaries',
    description: 'Exploring the art of visual narrative.',
    year: 2024,
    format: '4K Digital',
    runtime: '8:15',
    order_index: 2
  },
  {
    id: '3',
    title: 'Creative Vision',
    url: 'https://www.youtube.com/embed/FBI42hpID5g',
    category: 'Music Videos',
    description: 'A creative exploration of music and visuals.',
    year: 2024,
    format: '4K Digital',
    runtime: '3:45',
    order_index: 3
  },
  {
    id: '4',
    title: 'Artistic Expression',
    url: 'https://www.youtube.com/embed/y8zNisqRZj4',
    category: 'Commercials',
    description: 'Commercial work with artistic flair.',
    year: 2024,
    format: '4K Digital',
    runtime: '2:30',
    order_index: 4
  },
  {
    id: '5',
    title: 'Emotional Journey',
    url: 'https://www.youtube.com/embed/1XrIUf_UaxY',
    category: 'Short Films',
    description: 'An emotional cinematic experience.',
    year: 2024,
    format: '4K Digital',
    runtime: '7:20',
    order_index: 5
  },
  {
    id: '6',
    title: 'Behind the Lens',
    url: 'https://www.youtube.com/embed/E2IYfaOW0vI',
    category: 'Documentaries',
    description: 'A look behind the camera.',
    year: 2024,
    format: '4K Digital',
    runtime: '4:10',
    order_index: 6
  }
];

export function VideoProvider({ children }: { children: ReactNode }) {
  const videoHook = useVideos();
  const authHook = useAuth();
  const aboutHook = useAboutContent();

  // Use database videos if available, otherwise fall back to default videos
  const videos = videoHook.videos.length > 0 ? videoHook.videos : defaultVideos;

  const contextValue = {
    // Video management
    videos,
    loading: videoHook.loading,
    error: videoHook.error,
    addVideo: videoHook.addVideo,
    updateVideo: videoHook.updateVideo,
    deleteVideo: videoHook.deleteVideo,
    moveVideo: videoHook.moveVideo,
    refetch: videoHook.refetch,
    
    // About content management
    aboutContent: aboutHook.content,
    aboutLoading: aboutHook.loading,
    aboutError: aboutHook.error,
    addAboutContent: aboutHook.addContent,
    updateAboutContent: aboutHook.updateContent,
    deleteAboutContent: aboutHook.deleteContent,
    refetchAboutContent: aboutHook.refetch,
    fetchAllAboutContent: aboutHook.fetchAllContent,
    
    // Authentication
    user: authHook.user,
    isAuthenticated: authHook.isAuthenticated,
    authLoading: authHook.loading,
    signIn: authHook.signIn,
    signOut: authHook.signOut,
    signUp: authHook.signUp,
  };

  return (
    <VideoContext.Provider value={contextValue}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}