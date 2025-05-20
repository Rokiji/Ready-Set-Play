
import React from 'react';
import { PlayerControls } from './PlayerControls';
import { TrackProgress } from './TrackProgress';
import { VolumeControl } from './VolumeControl';

export const MusicPlayerContainer: React.FC = () => {
  return (
    <div className="music-player bg-gray-900/90 text-white py-4">
      <div className="container mx-auto flex flex-col justify-between items-center">
        <div className="container mx-auto flex justify-between items-center">
          <PlayerControls />
          <TrackProgress />
          <VolumeControl />
        </div>
      </div>
    </div>
  );
};
