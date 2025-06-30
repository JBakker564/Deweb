import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideo } from '../context/VideoContext';
import { Plus, Video, LogOut, Trash2, Edit, Loader, AlertCircle, ExternalLink, Database, RefreshCw, Download, Image, Type, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { seedDefaultVideos, clearAllVideos } from '../utils/seedVideos';
import { fetchYouTubeTitle, convertToEmbedUrl, getYouTubeVideoId } from '../utils/youtubeUtils';

export default function Dashboard() {
  const { 
    videos, 
    loading, 
    error, 
    addVideo, 
    updateVideo, 
    deleteVideo, 
    moveVideo,
    isAuthenticated, 
    authLoading, 
    signOut,
    refetch,
    // About content
    aboutContent,
    aboutLoading,
    aboutError,
    addAboutContent,
    updateAboutContent,
    deleteAboutContent,
    refetchAboutContent,
    fetchAllAboutContent
  } = useVideo();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Short Films',
    description: '',
    year: new Date().getFullYear(),
    format: '4K Digital',
    runtime: ''
  });
  
  // About content form
  const [showAboutForm, setShowAboutForm] = useState(false);
  const [editingAboutContent, setEditingAboutContent] = useState<any>(null);
  const [aboutFormData, setAboutFormData] = useState({
    content_type: 'text' as 'text' | 'image',
    title: '',
    content: '',
    order_index: 0,
    is_active: true
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [titleFetchMessage, setTitleFetchMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load about content when switching to about tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'about') {
      fetchAllAboutContent();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      category: 'Short Films',
      description: '',
      year: new Date().getFullYear(),
      format: '4K Digital',
      runtime: ''
    });
    setEditingVideo(null);
    setShowAddForm(false);
    setTitleFetchMessage(null);
  };

  const resetAboutForm = () => {
    setAboutFormData({
      content_type: 'text',
      title: '',
      content: '',
      order_index: Math.max(...aboutContent.map(c => c.order_index), 0) + 1,
      is_active: true
    });
    setEditingAboutContent(null);
    setShowAboutForm(false);
  };

  const handleFetchTitle = async () => {
    if (!formData.url) {
      setTitleFetchMessage('❌ Voer eerst een YouTube URL in');
      setTimeout(() => setTitleFetchMessage(null), 3000);
      return;
    }

    setFetchingTitle(true);
    setTitleFetchMessage(null);

    const result = await fetchYouTubeTitle(formData.url);
    
    if (result.success && result.title) {
      setFormData(prev => ({ ...prev, title: result.title! }));
      setTitleFetchMessage('✅ Titel succesvol opgehaald!');
    } else {
      setTitleFetchMessage(`❌ ${result.error}`);
    }
    
    setFetchingTitle(false);
    
    // Clear message after 5 seconds
    setTimeout(() => setTitleFetchMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const videoData = {
      title: formData.title,
      url: convertToEmbedUrl(formData.url),
      category: formData.category,
      description: formData.description,
      year: formData.year,
      format: formData.format,
      runtime: formData.runtime
    };

    let result;
    if (editingVideo) {
      result = await updateVideo(editingVideo.id, videoData);
    } else {
      result = await addVideo(videoData);
    }

    if (result.success) {
      resetForm();
    }
    
    setSubmitting(false);
  };

  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    let result;
    if (editingAboutContent) {
      result = await updateAboutContent(editingAboutContent.id, aboutFormData);
    } else {
      result = await addAboutContent(aboutFormData);
    }

    if (result.success) {
      resetAboutForm();
    }
    
    setSubmitting(false);
  };

  const handleEdit = (video: any) => {
    setFormData({
      title: video.title,
      url: video.url,
      category: video.category,
      description: video.description || '',
      year: video.year || new Date().getFullYear(),
      format: video.format || '4K Digital',
      runtime: video.runtime || ''
    });
    setEditingVideo(video);
    setShowAddForm(true);
  };

  const handleEditAboutContent = (content: any) => {
    setAboutFormData({
      content_type: content.content_type,
      title: content.title,
      content: content.content,
      order_index: content.order_index,
      is_active: content.is_active
    });
    setEditingAboutContent(content);
    setShowAboutForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Weet je zeker dat je deze video wilt verwijderen?')) {
      await deleteVideo(id);
    }
  };

  const handleDeleteAboutContent = async (id: string) => {
    if (confirm('Weet je zeker dat je deze content wilt verwijderen?')) {
      await deleteAboutContent(id);
    }
  };

  const handleMoveVideo = async (id: string, direction: 'up' | 'down') => {
    const result = await moveVideo(id, direction);
    if (!result.success) {
      console.error('Failed to move video:', result.error);
    }
  };

  const handleSeedVideos = async () => {
    setSeeding(true);
    setSeedMessage(null);
    
    const result = await seedDefaultVideos();
    
    if (result.success) {
      setSeedMessage(`✅ ${result.message}`);
      refetch(); // Refresh the video list
    } else {
      setSeedMessage(`❌ Error: ${result.error}`);
    }
    
    setSeeding(false);
    
    // Clear message after 5 seconds
    setTimeout(() => setSeedMessage(null), 5000);
  };

  const handleClearVideos = async () => {
    if (confirm('⚠️ WAARSCHUWING: Dit verwijdert ALLE video\'s uit de database. Weet je het zeker?')) {
      setSeeding(true);
      setSeedMessage(null);
      
      const result = await clearAllVideos();
      
      if (result.success) {
        setSeedMessage(`✅ ${result.message}`);
        refetch(); // Refresh the video list
      } else {
        setSeedMessage(`❌ Error: ${result.error}`);
      }
      
      setSeeding(false);
      
      // Clear message after 5 seconds
      setTimeout(() => setSeedMessage(null), 5000);
    }
  };

  const moveAboutContent = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = aboutContent.findIndex(c => c.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= aboutContent.length) return;
    
    const currentItem = aboutContent[currentIndex];
    const targetItem = aboutContent[newIndex];
    
    // Swap order indices
    await updateAboutContent(currentItem.id, { order_index: targetItem.order_index });
    await updateAboutContent(targetItem.id, { order_index: currentItem.order_index });
  };

  const toggleAboutContentVisibility = async (id: string, currentStatus: boolean) => {
    await updateAboutContent(id, { is_active: !currentStatus });
  };

  const categories = ['Short Films', 'Documentaries', 'Music Videos', 'Commercials'];

  if (authLoading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-2">Beheer je portfolio content</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Uitloggen
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === 'videos' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video className="h-5 w-5 mr-2" />
            Video's
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === 'about' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Type className="h-5 w-5 mr-2" />
            About Pagina
          </button>
        </div>

        {(error || aboutError) && (
          <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error || aboutError}
          </div>
        )}

        {seedMessage && (
          <div className={`px-4 py-3 rounded-lg mb-6 flex items-center ${
            seedMessage.startsWith('✅') 
              ? 'bg-green-600/20 border border-green-600 text-green-400' 
              : 'bg-red-600/20 border border-red-600 text-red-400'
          }`}>
            <Database className="h-5 w-5 mr-2" />
            {seedMessage}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Video className="h-8 w-8 text-blue-400 mr-3" />
                  <div>
                    <p className="text-gray-400">Totaal Videos</p>
                    <p className="text-2xl font-bold text-white">{videos.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Edit className="h-8 w-8 text-green-400 mr-3" />
                  <div>
                    <p className="text-gray-400">Categorieën</p>
                    <p className="text-2xl font-bold text-white">{categories.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-purple-400 mr-3" />
                  <div>
                    <p className="text-gray-400">Snelle Acties</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Video Toevoegen
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-yellow-400 mr-3" />
                  <div>
                    <p className="text-gray-400">Database</p>
                    <button
                      onClick={handleSeedVideos}
                      disabled={seeding}
                      className="text-yellow-400 hover:text-yellow-300 font-medium disabled:opacity-50"
                    >
                      {seeding ? 'Bezig...' : 'Seed Videos'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Management */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Database className="h-6 w-6 mr-2" />
                Database Beheer
              </h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleSeedVideos}
                  disabled={seeding}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {seeding ? (
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-5 w-5 mr-2" />
                  )}
                  Standaard Videos Toevoegen
                </button>
                
                <button
                  onClick={() => refetch()}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {loading ? (
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-5 w-5 mr-2" />
                  )}
                  Vernieuwen
                </button>
                
                <button
                  onClick={handleClearVideos}
                  disabled={seeding}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {seeding ? (
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5 mr-2" />
                  )}
                  Alle Videos Wissen
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-3">
                <strong>Standaard Videos Toevoegen:</strong> Voegt 6 voorbeeldvideo's toe aan de database (alleen als deze leeg is)<br/>
                <strong>Vernieuwen:</strong> Herlaadt alle video's uit de database<br/>
                <strong>Alle Videos Wissen:</strong> ⚠️ Verwijdert ALLE video's permanent uit de database
              </p>
            </div>

            {/* Add/Edit Video Form */}
            {showAddForm && (
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  {editingVideo ? 'Video Bewerken' : 'Nieuwe Video Toevoegen'}
                </h2>

                {titleFetchMessage && (
                  <div className={`px-4 py-3 rounded-lg mb-4 flex items-center ${
                    titleFetchMessage.startsWith('✅') 
                      ? 'bg-green-600/20 border border-green-600 text-green-400' 
                      : 'bg-red-600/20 border border-red-600 text-red-400'
                  }`}>
                    <Download className="h-5 w-5 mr-2" />
                    {titleFetchMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Video Titel
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                          placeholder="Voer video titel in of haal op van YouTube"
                        />
                        <button
                          type="button"
                          onClick={handleFetchTitle}
                          disabled={fetchingTitle || !formData.url}
                          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                          title="Haal titel op van YouTube"
                        >
                          {fetchingTitle ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        💡 Tip: Voer eerst de YouTube URL in en klik op de paarse knop om de titel automatisch op te halen
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Categorie
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="https://www.youtube.com/watch?v=... of https://youtu.be/..."
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Ondersteunt YouTube watch URLs, youtu.be links en embed URLs
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Jaar
                      </label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        min="2000"
                        max="2030"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Format
                      </label>
                      <input
                        type="text"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="Bijv. 4K Digital, 16mm Film, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Runtime
                      </label>
                      <input
                        type="text"
                        value={formData.runtime}
                        onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="Bijv. 5:30, 12:45, etc."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Beschrijving (Optioneel)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="Voer video beschrijving in..."
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                    >
                      {submitting ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          {editingVideo ? 'Bijwerken...' : 'Toevoegen...'}
                        </>
                      ) : (
                        editingVideo ? 'Video Bijwerken' : 'Video Toevoegen'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Video List */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Video's Beheren</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Video Toevoegen
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-8 w-8 text-white animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video, index) => (
                    <div key={video.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {/* YouTube Thumbnail */}
                        <div className="w-24 h-16 bg-gray-600 rounded overflow-hidden">
                          {getYouTubeVideoId(video.url) ? (
                            <img
                              src={`https://img.youtube.com/vi/${getYouTubeVideoId(video.url)}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{video.title}</h3>
                          <p className="text-sm text-gray-400">{video.category} • {video.year}</p>
                          <div className="text-xs text-gray-500 mt-1 flex space-x-4">
                            {video.format && <span>Format: {video.format}</span>}
                            {video.runtime && <span>Runtime: {video.runtime}</span>}
                          </div>
                          {video.description && (
                            <p className="text-xs text-gray-500 mt-1 max-w-md truncate">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Move buttons */}
                        <button
                          onClick={() => handleMoveVideo(video.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Omhoog verplaatsen"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveVideo(video.id, 'down')}
                          disabled={index === videos.length - 1}
                          className="p-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Omlaag verplaatsen"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        
                        <a
                          href={video.url.replace('/embed/', '/watch?v=')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                          title="Bekijk op YouTube"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                        <button 
                          onClick={() => handleEdit(video)}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Bewerken"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(video.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Verwijderen"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {videos.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Geen video's gevonden</p>
                      <p className="text-sm">Klik op "Standaard Videos Toevoegen" om te beginnen met voorbeeldcontent</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <>
            {/* About Content Management */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">About Pagina Beheren</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => fetchAllAboutContent()}
                    disabled={aboutLoading}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {aboutLoading ? (
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-5 w-5 mr-2" />
                    )}
                    Vernieuwen
                  </button>
                  <button
                    onClick={() => setShowAboutForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Content Toevoegen
                  </button>
                </div>
              </div>

              {/* Add/Edit About Content Form */}
              {showAboutForm && (
                <div className="bg-gray-700 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingAboutContent ? 'Content Bewerken' : 'Nieuwe Content Toevoegen'}
                  </h3>

                  <form onSubmit={handleAboutSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Content Type
                        </label>
                        <select
                          value={aboutFormData.content_type}
                          onChange={(e) => setAboutFormData({ ...aboutFormData, content_type: e.target.value as 'text' | 'image' })}
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                        >
                          <option value="text">Tekst</option>
                          <option value="image">Afbeelding</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Titel
                        </label>
                        <input
                          type="text"
                          value={aboutFormData.title}
                          onChange={(e) => setAboutFormData({ ...aboutFormData, title: e.target.value })}
                          required
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                          placeholder="Bijv. 'About Text' of 'Portrait Photo'"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Volgorde
                        </label>
                        <input
                          type="number"
                          value={aboutFormData.order_index}
                          onChange={(e) => setAboutFormData({ ...aboutFormData, order_index: parseInt(e.target.value) })}
                          min="0"
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {aboutFormData.content_type === 'text' ? 'Tekst Content' : 'Afbeelding URL'}
                      </label>
                      {aboutFormData.content_type === 'text' ? (
                        <textarea
                          value={aboutFormData.content}
                          onChange={(e) => setAboutFormData({ ...aboutFormData, content: e.target.value })}
                          required
                          rows={6}
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                          placeholder="Voer de about tekst in..."
                        />
                      ) : (
                        <input
                          type="url"
                          value={aboutFormData.content}
                          onChange={(e) => setAboutFormData({ ...aboutFormData, content: e.target.value })}
                          required
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                          placeholder="https://example.com/image.jpg"
                        />
                      )}
                      {aboutFormData.content_type === 'image' && (
                        <p className="text-xs text-gray-400 mt-1">
                          💡 Tip: Upload je foto's naar een service zoals Imgur, Cloudinary, of gebruik Pexels URLs
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={aboutFormData.is_active}
                          onChange={(e) => setAboutFormData({ ...aboutFormData, is_active: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-gray-300">Actief (zichtbaar op website)</span>
                      </label>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                      >
                        {submitting ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            {editingAboutContent ? 'Bijwerken...' : 'Toevoegen...'}
                          </>
                        ) : (
                          editingAboutContent ? 'Content Bijwerken' : 'Content Toevoegen'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={resetAboutForm}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Annuleren
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* About Content List */}
              {aboutLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-8 w-8 text-white animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {aboutContent.map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {/* Content Preview */}
                        <div className="w-16 h-16 bg-gray-600 rounded overflow-hidden flex items-center justify-center">
                          {content.content_type === 'image' ? (
                            <img
                              src={content.content}
                              alt={content.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <Type className="h-6 w-6 text-gray-400" />
                          )}
                          <div className="w-full h-full hidden items-center justify-center">
                            <Image className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-white">{content.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${
                              content.content_type === 'text' 
                                ? 'bg-blue-600/20 text-blue-400' 
                                : 'bg-purple-600/20 text-purple-400'
                            }`}>
                              {content.content_type === 'text' ? 'Tekst' : 'Afbeelding'}
                            </span>
                            {!content.is_active && (
                              <span className="px-2 py-1 text-xs rounded bg-gray-600/20 text-gray-400">
                                Inactief
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            Volgorde: {content.order_index}
                          </p>
                          {content.content_type === 'text' ? (
                            <p className="text-xs text-gray-500 mt-1 max-w-md truncate">
                              {content.content}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 mt-1 max-w-md truncate">
                              {content.content}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Move buttons */}
                        <button
                          onClick={() => moveAboutContent(content.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Omhoog verplaatsen"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveAboutContent(content.id, 'down')}
                          disabled={index === aboutContent.length - 1}
                          className="p-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Omlaag verplaatsen"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        
                        {/* Visibility toggle */}
                        <button
                          onClick={() => toggleAboutContentVisibility(content.id, content.is_active)}
                          className={`p-2 transition-colors ${
                            content.is_active 
                              ? 'text-green-400 hover:text-green-300' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                          title={content.is_active ? 'Verbergen' : 'Tonen'}
                        >
                          {content.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        
                        {/* Edit button */}
                        <button 
                          onClick={() => handleEditAboutContent(content)}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Bewerken"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {/* Delete button */}
                        <button 
                          onClick={() => handleDeleteAboutContent(content.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Verwijderen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {aboutContent.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Geen about content gevonden</p>
                      <p className="text-sm">Klik op "Content Toevoegen" om te beginnen</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}