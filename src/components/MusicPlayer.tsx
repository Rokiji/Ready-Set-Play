
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
}

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  
  // Mock current song
  const currentSong: Song = {
    id: '1',
    title: 'Gaming Beats',
    artist: 'DJ Player'
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="music-player">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Music controls */}
          <button className="btn-icon" aria-label="Previous song">
            <SkipBack size={20} />
          </button>
          
          <button className="btn-icon p-3 bg-game-secondary rounded-full" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button className="btn-icon" aria-label="Next song">
            <SkipForward size={20} />
          </button>
        </div>
        
        <div className="hidden md:block flex-1 px-8">
          <div className="flex flex-col items-center">
            <div className="text-center mb-1">
              <span className="font-medium">{currentSong.title}</span>
              <span className="mx-1 text-gray-300">•</span>
              <span className="text-gray-300">{currentSong.artist}</span>
            </div>
            <Slider
              defaultValue={[33]}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn-icon" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <div className="hidden md:block w-28">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
