import React from 'react';
import { spotifyPlaylistData } from '@/data/musicData';
import { Minus, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

const MusicPlayer: React.FC = () => {
  const [minimized, setMinimized] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(localStorage.getItem('isLoggedIn') === 'true');

  React.useEffect(() => {
    const onStorage = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('loginStateChanged', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('loginStateChanged', onStorage);
    };
  }, []);

  const handleOverlayClick = () => {
    toast.error('Please log in or sign up first to use the music player.');
  };

  return (
    <div className="music-player bg-gray-900/90 text-white py-4 fixed bottom-0 left-0 right-0 z-50">
      {/* Minimize button in upper right */}
      {!minimized && (
        <button
          className="absolute top-2 right-4 z-10 p-1 rounded hover:bg-gray-800 transition"
          aria-label="Minimize player"
          onClick={() => setMinimized(true)}
        >
          <Minus size={18} />
        </button>
      )}
      {minimized ? (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 rounded shadow w-full">
          <span className="text-sm text-white/80">
            {/* No playlist name/description */}
          </span>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-800 transition"
            aria-label="Restore player"
            onClick={() => setMinimized(false)}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      ) : (
        <div className="container mx-auto flex flex-col justify-between items-center relative">
          <div className="w-full mb-4 mt-5 flex flex-col items-center justify-center relative">
            <iframe
              src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistData.id}?utm_source=generator&autoplay=1`}
              width="100%"
              height="80"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl w-full"
              title="Spotify Playlist"
            ></iframe>
            {!isLoggedIn && (
              <div
                className="absolute inset-0 bg-transparent cursor-pointer z-20"
                style={{ pointerEvents: 'auto' }}
                onClick={handleOverlayClick}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
