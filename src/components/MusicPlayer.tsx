
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SpotifyPlayer from './SpotifyPlayer';
import { loginToSpotify, getStoredToken } from '@/utils/spotify';

const MusicPlayer: React.FC = () => {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a stored token
    const storedToken = getStoredToken();
    if (storedToken) {
      setSpotifyToken(storedToken);
    }
  }, []);

  const handleLoginClick = () => {
    // Store the current path to return to after login
    localStorage.setItem('spotify_return_path', window.location.pathname);
    loginToSpotify();
  };

  if (!spotifyToken) {
    return (
      <div className="music-player bg-gray-800 text-white py-4">
        <div className="container mx-auto flex justify-center items-center">
          <Button 
            onClick={handleLoginClick} 
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Connect to Spotify
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SpotifyPlayer token={spotifyToken} />
  );
};

export default MusicPlayer;
