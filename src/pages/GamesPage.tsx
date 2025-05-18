
import React from 'react';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import MusicPlayer from '@/components/MusicPlayer';
import { gamesData } from '@/data/gamesData';

const GamesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Game Library</h1>
          <p className="text-gray-600">Choose from our collection of mini-games</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gamesData.map(game => (
            <GameCard
              key={game.id}
              id={game.id}
              title={game.title}
              description={game.description}
              imageUrl={game.imageUrl}
              genre={game.genre}
            />
          ))}
        </div>
      </main>
      
      <MusicPlayer />
    </div>
  );
};

export default GamesPage;
