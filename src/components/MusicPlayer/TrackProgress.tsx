
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { useMusicPlayer } from './MusicPlayerContext';
import { formatDuration } from '@/services/musicApi';

export const TrackProgress: React.FC = () => {
  const { currentTime, duration, handleSeekChange, getCurrentTrackInfo } = useMusicPlayer();
  const trackInfo = getCurrentTrackInfo();

  return (
    <div className="hidden md:block flex-1 px-8">
      <div className="flex flex-col items-center">
        <div className="text-center mb-1">
          <span className="font-medium text-white">
            {trackInfo.title}
          </span>
          {trackInfo.artist && (
            <>
              <span className="mx-1 text-white/80">•</span>
              <span className="text-white/80">
                {trackInfo.artist}
              </span>
            </>
          )}
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-xs text-white/80 w-10 text-right">
            {formatDuration(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeekChange}
            className="w-full"
          />
          <span className="text-xs text-white/80 w-10">
            {formatDuration(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};
