
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { songsData } from '@/data/musicData';
import { Play, Plus, Music, Upload, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchTracks, searchTracks, Track, formatDuration } from '@/services/musicApi';
import MusicPlayer from '@/components/MusicPlayer';
import { useQuery } from '@tanstack/react-query';

const MusicPage = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'jamendo'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: apiTracks, isLoading, error } = useQuery({
    queryKey: ['musicTracks'],
    queryFn: () => fetchTracks(30),
  });

  const [searchResults, setSearchResults] = useState<Track[]>([]);

  // Function to handle play button click on a song from local library
  const handlePlaySong = (songId: string) => {
    // Find index of song in songsData
    const songIndex = songsData.findIndex(song => song.id === songId);
    
    // Store selected song index in localStorage to be used by MusicPlayer
    if (songIndex !== -1) {
      localStorage.setItem('current_song_index', songIndex.toString());
      localStorage.setItem('music_source', 'local');
      // Dispatch a custom event for MusicPlayer to pick up
      window.dispatchEvent(new CustomEvent('play-song', { detail: { songIndex, autoplay: true } }));
      toast(`Now playing ${songsData[songIndex].title}`, {
        description: `by ${songsData[songIndex].artist}`
      });
    }
  };

  // Function to handle play button click on a track from API
  const handlePlayApiTrack = (track: Track) => {
    localStorage.setItem('api_track', JSON.stringify(track));
    localStorage.setItem('music_source', 'api');
    window.dispatchEvent(new CustomEvent('play-api-track', { 
      detail: { track, autoplay: true } 
    }));
    toast(`Now playing ${track.name}`, {
      description: `by ${track.artist_name}`
    });
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast.error('Failed to search for tracks');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Music Library</h1>
          <p className="text-white">Find the perfect soundtrack for your gameplay</p>
        </div>

        {/* Tabs for Songs Library and API */}
        <div className="flex mb-6 border-b border-violet-800/30">
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'library' 
              ? 'text-white border-b-2 border-violet-500' 
              : 'text-white/80 hover:text-white'}`}
            onClick={() => setActiveTab('library')}
          >
            Your Library
          </button>
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'jamendo' 
              ? 'text-white border-b-2 border-violet-500' 
              : 'text-white/80 hover:text-white'}`}
            onClick={() => setActiveTab('jamendo')}
          >
            Jamendo Music
          </button>
        </div>
        
        {activeTab === 'library' && (
          <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden mb-12 border border-violet-800/20">
            <table className="w-full">
              <thead className="bg-violet-900/50 text-white">
                <tr>
                  <th className="py-4 px-6 text-left w-12">#</th>
                  <th className="py-4 px-6 text-left">Title</th>
                  <th className="py-4 px-6 text-left hidden md:table-cell">Artist</th>
                  <th className="py-4 px-6 text-left hidden md:table-cell">Genre</th>
                  <th className="py-4 px-6 text-left hidden sm:table-cell">Duration</th>
                  <th className="py-4 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {songsData.map((song, index) => (
                  <tr key={song.id} className="hover:bg-violet-900/20 border-b border-violet-800/20">
                    <td className="py-4 px-6 text-white/90">{index + 1}</td>
                    <td className="py-4 px-6 font-medium text-white">{song.title}</td>
                    <td className="py-4 px-6 text-white/90 hidden md:table-cell">{song.artist}</td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <span className="text-xs py-1 px-2 bg-violet-900/40 text-white rounded-full">
                        {song.genre}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/90 hidden sm:table-cell">{song.duration}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 hover:bg-violet-700/30 text-white/90 hover:text-white"
                          onClick={() => handlePlaySong(song.id)}
                        >
                          <Play size={16} />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 hover:bg-violet-700/30 text-white/90 hover:text-white"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'jamendo' && (
          <>
            <div className="flex items-center mb-6 gap-2">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search for tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-card border-violet-800/30 text-white pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 h-4 w-4" />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden mb-12 border border-violet-800/20">
                <h2 className="text-xl font-bold p-4 border-b border-violet-800/20 text-white">Search Results</h2>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-violet-900/50 text-white sticky top-0">
                      <tr>
                        <th className="py-4 px-6 text-left">Title</th>
                        <th className="py-4 px-6 text-left hidden md:table-cell">Artist</th>
                        <th className="py-4 px-6 text-left hidden md:table-cell">Album</th>
                        <th className="py-4 px-6 text-left hidden sm:table-cell">Duration</th>
                        <th className="py-4 px-6 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((track) => (
                        <tr key={track.id} className="hover:bg-violet-900/20 border-b border-violet-800/20">
                          <td className="py-4 px-6 font-medium text-white">{track.name}</td>
                          <td className="py-4 px-6 text-white/90 hidden md:table-cell">{track.artist_name}</td>
                          <td className="py-4 px-6 text-white/90 hidden md:table-cell">{track.album_name}</td>
                          <td className="py-4 px-6 text-white/90 hidden sm:table-cell">{formatDuration(track.duration)}</td>
                          <td className="py-4 px-6">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:bg-violet-700/30 text-white/90 hover:text-white"
                              onClick={() => handlePlayApiTrack(track)}
                            >
                              <Play size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center p-8 text-white/80">No results found for "{searchQuery}"</div>
            ) : null}

            <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden mb-12 border border-violet-800/20">
              <h2 className="text-xl font-bold p-4 border-b border-violet-800/20 text-white">Popular Tracks</h2>
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
              ) : error ? (
                <div className="text-center p-8 text-white/80">Failed to load tracks. Please try again later.</div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-violet-900/50 text-white sticky top-0">
                      <tr>
                        <th className="py-4 px-6 text-left">Title</th>
                        <th className="py-4 px-6 text-left hidden md:table-cell">Artist</th>
                        <th className="py-4 px-6 text-left hidden md:table-cell">Genre</th>
                        <th className="py-4 px-6 text-left hidden sm:table-cell">Duration</th>
                        <th className="py-4 px-6 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiTracks?.map((track) => (
                        <tr key={track.id} className="hover:bg-violet-900/20 border-b border-violet-800/20">
                          <td className="py-4 px-6 font-medium text-white">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                                <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
                              </div>
                              <span>{track.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white/90 hidden md:table-cell">{track.artist_name}</td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <span className="text-xs py-1 px-2 bg-violet-900/40 text-white rounded-full">
                              {track.genre || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-white/90 hidden sm:table-cell">{formatDuration(track.duration)}</td>
                          <td className="py-4 px-6">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:bg-violet-700/30 text-white/90 hover:text-white"
                              onClick={() => handlePlayApiTrack(track)}
                            >
                              <Play size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="bg-violet-900/30 rounded-xl p-8 border border-violet-800/30">
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Create Your Perfect Playlist</h2>
          <p className="text-center text-white/90 mb-6">
            Want to add your own music? Upload your tracks to personalize your gaming experience.
          </p>
          <div className="flex justify-center">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Upload className="mr-2 h-4 w-4" /> Upload Your Music
            </Button>
          </div>
        </div>
      </main>
      
      <MusicPlayer />
    </div>
  );
};

export default MusicPage;
