
import React from 'react';
import { MusicPlayerProvider } from './MusicPlayerContext';
import { MusicPlayerContainer } from './MusicPlayerContainer';

const MusicPlayer: React.FC = () => {
  return (
    <MusicPlayerProvider>
      <MusicPlayerContainer />
    </MusicPlayerProvider>
  );
};

export default MusicPlayer;
