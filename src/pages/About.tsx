import React from 'react';
import { useAboutContent } from '../hooks/useAboutContent';
import { Loader } from 'lucide-react';

export default function About() {
  const { content, loading } = useAboutContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Separate text and images
  const textContent = content.find(item => item.content_type === 'text');
  const images = content.filter(item => item.content_type === 'image');
  const mainImage = images[0]; // First image as main portrait
  const galleryImages = images.slice(1); // Rest as gallery

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Main Image */}
          <div className="relative">
            {mainImage ? (
              <img
                src={mainImage.content}
                alt={mainImage.title}
                className="w-full h-96 object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            ) : (
              <div className="w-full h-96 bg-gray-800 flex items-center justify-center">
                <p className="text-gray-400">Geen hoofdfoto beschikbaar</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl lg:text-5xl font-light tracking-wider mb-8">About</h1>
              {textContent ? (
                <div className="text-gray-400 text-lg leading-relaxed font-light space-y-6">
                  {textContent.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  Geen about tekst beschikbaar. Voeg content toe via het admin dashboard.
                </p>
              )}
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-xl font-light tracking-wide text-white">Services</h3>
              <div className="space-y-2 text-gray-400 font-light">
                <p>• Director of Photography</p>
                <p>• Colorist</p>
                <p>• Gaffer</p>
                <p>• Editor</p>
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-4">
              <h3 className="text-xl font-light tracking-wide text-white">Equipment</h3>
              <div className="space-y-2 text-gray-400 font-light">
                <p>• RED Digital Cinema Camera</p>
                <p>• Vintage Canon FD & Pentacon lens kit</p>
                <p>• DaVinci Resolve Studio</p>
                <p>• Color grade suite</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      {galleryImages.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.content}
                  alt={image.title}
                  className="w-full h-80 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-700"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}