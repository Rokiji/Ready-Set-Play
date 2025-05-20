
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useMusicPlayer } from './MusicPlayerContext';

export const PlayerControls: React.FC = () => {
  const { isPlaying, togglePlay, previousTrack, nextTrack, musicSource } = useMusicPlayer();

  return (
    <div className="flex items-center gap-4">
      <button 
        className={`btn-icon ${musicSource === 'api' ? 'opacity-50' : ''}`} 
        aria-label="Previous song"
        onClick={previousTrack}
        disabled={musicSource === 'api'}
      >
        <SkipBack size={20} className="text-white" />
      </button>
      
      <button 
        className="btn-icon p-3 bg-violet-600 hover:bg-violet-700 rounded-full" 
        onClick={togglePlay} 
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      
      <button 
        className={`btn-icon ${musicSource === 'api' ? 'opacity-50' : ''}`} 
        aria-label="Next song"
        onClick={nextTrack}
        disabled={musicSource === 'api'}
      >
        <SkipForward size={20} className="text-white" />
      </button>
    </div>
  );
};
