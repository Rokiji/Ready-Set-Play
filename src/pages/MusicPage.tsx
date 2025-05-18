
import React from 'react';
import Navbar from '@/components/Navbar';
import MusicPlayer from '@/components/MusicPlayer';
import { Button } from '@/components/ui/button';
import { songsData } from '@/data/musicData';
import { Play, Plus } from 'lucide-react';

const MusicPage = () => {
  // Function to handle play button click on a song
  const handlePlaySong = (songId: string) => {
    // Find index of song in songsData
    const songIndex = songsData.findIndex(song => song.id === songId);
    
    // Store selected song index in localStorage to be used by MusicPlayer
    if (songIndex !== -1) {
      localStorage.setItem('current_song_index', songIndex.toString());
      // Dispatch a custom event for MusicPlayer to pick up
      window.dispatchEvent(new CustomEvent('play-song', { detail: { songIndex } }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Music Library</h1>
          <p className="text-gray-600">Find the perfect soundtrack for your gameplay</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <table className="w-full">
            <thead className="bg-game-primary text-white">
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
                <tr key={song.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="py-4 px-6 text-gray-500">{index + 1}</td>
                  <td className="py-4 px-6 font-medium">{song.title}</td>
                  <td className="py-4 px-6 text-gray-600 hidden md:table-cell">{song.artist}</td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    <span className="text-xs py-1 px-2 bg-game-muted text-game-primary rounded-full">
                      {song.genre}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 hidden sm:table-cell">{song.duration}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => handlePlaySong(song.id)}
                      >
                        <Play size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Plus size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Create Your Perfect Playlist</h2>
          <p className="text-center text-gray-600 mb-6">
            Want to add your own music? Upload your tracks to personalize your gaming experience.
          </p>
          <div className="flex justify-center">
            <Button className="bg-game-secondary hover:bg-game-secondary/90 text-white">
              Upload Your Music
            </Button>
          </div>
        </div>
      </main>
      
      <MusicPlayer />
    </div>
  );
};

export default MusicPage;
