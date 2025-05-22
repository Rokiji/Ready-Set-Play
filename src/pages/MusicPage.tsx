import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { songsData, spotifyPlaylistData } from '@/data/musicData';
import { Play, Plus, Music, Upload } from 'lucide-react';
import { toast } from 'sonner';

const MusicPage = () => {
  const [activeTab, setActiveTab] = useState<'songs' | 'playlist'>('songs');

  // Function to handle play button click on a song
  const handlePlaySong = (songId: string) => {
    // Find index of song in songsData
    const songIndex = songsData.findIndex(song => song.id === songId);

    // Store selected song index in localStorage to be used by MusicPlayer
    if (songIndex !== -1) {
      localStorage.setItem('current_song_index', songIndex.toString());
      // Dispatch a custom event for MusicPlayer to pick up, with autoplay true
      window.dispatchEvent(new CustomEvent('play-song', { detail: { songIndex, autoplay: true } }));

      // Attempt to play the static audio element directly (used by MusicPlayer)
      // This works only if the audio element is globally accessible
      setTimeout(() => {
        const audios = document.getElementsByTagName('audio');
        if (audios.length > 0) {
          try {
            audios[0].currentTime = 0;
            audios[0].play().catch(() => {});
          } catch {}
        }
      }, 100);

      toast(`Now playing ${songsData[songIndex].title}`, {
        description: `by ${songsData[songIndex].artist}`
      });
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

        {/* Tabs for Songs and Playlist */}
        <div className="flex mb-6 border-b border-violet-800/30">
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'songs' 
              ? 'text-white border-b-2 border-violet-500' 
              : 'text-white/80 hover:text-white'}`}
            onClick={() => setActiveTab('songs')}
          >
            Your Library
          </button>
          <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'playlist' 
              ? 'text-white border-b-2 border-violet-500' 
              : 'text-white/80 hover:text-white'}`}
            onClick={() => setActiveTab('playlist')}
          >
            Spotify Playlist
          </button>
        </div>
        
        {activeTab === 'songs' && (
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'playlist' && (
          <div className="mb-12">
            <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden p-6 border border-violet-800/20">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 lg:w-1/4">
                  <img 
                    src={spotifyPlaylistData.imageUrl} 
                    alt={spotifyPlaylistData.name}
                    className="w-full rounded-xl shadow-md border border-violet-800/30" 
                  />
                </div>
                <div className="md:w-2/3 lg:w-3/4">
                  <h2 className="text-2xl font-bold mb-2 text-white">{spotifyPlaylistData.name}</h2>
                  <p className="text-white/90 mb-6">{spotifyPlaylistData.description}</p>
                  
                  <iframe 
                    src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistData.id}?utm_source=generator&theme=0&autoplay=1`}
                    width="100%" 
                    height="380" 
                    frameBorder="0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    className="rounded-xl"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default MusicPage;
