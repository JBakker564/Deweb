import React, { useState, useEffect } from 'react';
import { useVideo } from '../context/VideoContext';
import { Loader } from 'lucide-react';

export default function Home() {
  const { videos, loading } = useVideo();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Auto-rotate through videos every 17 seconds
  useEffect(() => {
    if (videos.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % Math.min(videos.length, 3));
    }, 17000);
    return () => clearInterval(interval);
  }, [videos.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const featuredVideos = videos.slice(0, 3);

  if (featuredVideos.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-light tracking-wider mb-4">
            LOW-KEY MEDIA
          </h1>
          <p className="text-lg lg:text-xl font-light text-gray-300 tracking-wide">
            Cinematographer • Director • Colorist
          </p>
          <p className="text-gray-500 mt-8">
            Geen video's beschikbaar. Voeg content toe via het admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fullscreen Video Hero */}
      <div className="relative h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <iframe
            src={`${featuredVideos[currentVideoIndex]?.url}?autoplay=1&mute=1&controls=0&loop=1&playlist=${featuredVideos[currentVideoIndex]?.url.split('/').pop()}`}
            className="w-full h-full object-cover scale-110"
            allow="autoplay; encrypted-media"
            style={{ pointerEvents: 'none' }}
          ></iframe>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Minimal Text Overlay */}
        <div className="absolute bottom-20 left-8 lg:left-16 z-10">
          <h1 className="text-4xl lg:text-6xl font-light tracking-wider mb-4">
            LOW-KEY MEDIA
          </h1>
          <p className="text-lg lg:text-xl font-light text-gray-300 tracking-wide">
            Cinematographer • Director • Colorist
          </p>
        </div>

        {/* Video Navigation Dots */}
        <div className="absolute bottom-8 right-8 flex space-x-3">
          {featuredVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVideoIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentVideoIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Minimal About Section */}
      <div className="max-w-4xl mx-auto px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-2xl font-light mb-8 tracking-wide">Visual Storytelling</h2>
            <p className="text-gray-400 text-lg leading-relaxed font-light">
              Creating cinematic experiences that transcend the ordinary. 
              Every frame crafted with precision, every story told with purpose.
            </p>
          </div>
          <div className="relative">
            <img
              src="/image_2025-06-23_210452505.png"
              alt="Behind the scenes"
              className="w-full h-80 object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}