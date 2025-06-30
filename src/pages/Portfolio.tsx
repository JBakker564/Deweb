import React, { useState, useEffect } from 'react';
import { useVideo } from '../context/VideoContext';
import { Loader, ChevronDown } from 'lucide-react';

export default function Portfolio() {
  const { videos, loading } = useVideo();
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      // Hide scroll indicator after user has scrolled a bit
      if (window.scrollY > 200) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl lg:text-2xl font-light text-gray-300 tracking-wide">
            Geen content beschikbaar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Showcase - Compactere layout */}
      <div className="relative pt-20">
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="relative min-h-[85vh] flex items-center py-12"
            onMouseEnter={() => setHoveredVideo(video.id)}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            {/* Background Video/Image */}
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                src={`${video.url}?autoplay=0&mute=1&controls=0&loop=1&playlist=${video.url.split('/').pop()}`}
                className="w-full h-full object-cover scale-110 opacity-20"
                allow="encrypted-media"
                style={{ pointerEvents: 'none' }}
              ></iframe>
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/60"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Video Player */}
              <div className="relative group">
                <div className="aspect-video bg-black/50 backdrop-blur-sm border border-white/10 overflow-hidden">
                  <iframe
                    src={`${video.url}?controls=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={video.title}
                  ></iframe>
                </div>
                
                {/* Cinematic Frame */}
                <div className="absolute inset-0 border-2 border-white/20 pointer-events-none group-hover:border-white/40 transition-all duration-500"></div>
                
                {/* Film Strip Effect */}
                <div className="absolute -left-4 top-0 bottom-0 w-8 bg-gradient-to-r from-white/5 to-transparent"></div>
                <div className="absolute -right-4 top-0 bottom-0 w-8 bg-gradient-to-l from-white/5 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h2 className="text-3xl lg:text-5xl font-light tracking-wide mb-4 leading-tight">
                    {video.title}
                  </h2>
                </div>

                {/* Description */}
                <div className="space-y-4 text-gray-300 font-light text-lg leading-relaxed">
                  {video.description ? (
                    <p>{video.description}</p>
                  ) : (
                    <>
                      <p>
                        Een cinematografische reis die de grenzen van visuele storytelling verkent. 
                        Elke frame is zorgvuldig gecomponeerd om emotie en betekenis over te brengen, 
                        waardoor een meeslepende ervaring ontstaat die het gewone overstijgt.
                      </p>
                      <p>
                        Door geavanceerde cinematografische technieken en precieze kleurgrading 
                        creëert dit werk een uniek visueel verhaal dat de kijker meeneemt 
                        door een onvergetelijk emotioneel landschap.
                      </p>
                    </>
                  )}
                </div>

                {/* Cinematic Details */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center space-x-8 text-sm font-light tracking-wide">
                    <div className="text-gray-400">
                      <span className="text-white">JAAR</span> • {video.year || 2024}
                    </div>
                    <div className="text-gray-400">
                      <span className="text-white">FORMAT</span> • {video.format || '4K Digital'}
                    </div>
                    <div className="text-gray-400">
                      <span className="text-white">RUNTIME</span> • {video.runtime || `${Math.floor(Math.random() * 10) + 3}:00`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Number */}
            <div className="absolute top-8 right-8 text-6xl font-light text-white/10 z-10">
              {String(index + 1).padStart(2, '0')}
            </div>

            {/* Scroll Indicator - Only on first video */}
            {index === 0 && showScrollIndicator && videos.length > 1 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                <div className="flex flex-col items-center space-y-2 animate-bounce">
                  <div className="text-white/60 text-sm font-light tracking-wider">
                    SCROLL
                  </div>
                  <ChevronDown className="h-6 w-6 text-white/60" />
                </div>
              </div>
            )}

            {/* Add data attribute for scroll targeting */}
            <div data-video-section={index} className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none"></div>
          </div>
        ))}

        {/* Bottom fade indicator */}
        {videos.length > 1 && (
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20"></div>
        )}
      </div>
    </div>
  );
}