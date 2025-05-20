
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX } from 'lucide-react';
import { useMusicPlayer } from './MusicPlayerContext';

export const VolumeControl: React.FC = () => {
  const { volume, isMuted, handleVolumeChange, toggleMute } = useMusicPlayer();

  return (
    <div className="flex items-center gap-2">
      <button 
        className="btn-icon" 
        onClick={toggleMute} 
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
      </button>
      
      <div className="hidden md:block w-28">
        <Slider
          value={[isMuted ? 0 : volume]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="w-full"
        />
      </div>
    </div>
  );
};
