import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { gamesData } from '@/data/gamesData';
import { Input } from '@/components/ui/input';

const GamesPage = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [search, setSearch] = useState('');

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-6 py-12 flex-grow flex items-center justify-center">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="mb-2">Please log in or sign up first to access this page.</p>
          </div>
        </main>
      </div>
    );
  }

  const filteredGames = gamesData.filter(game =>
    game.title.toLowerCase().includes(search.toLowerCase()) ||
    game.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gradient-violet">Game Library</h1>
          <p className="text-violet-300 mb-4">Choose from our collection of mini-games</p>
          <div className="max-w-md mb-4">
            <Input
              type="text"
              placeholder="Search games by title or genre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <GameCard
              key={game.id}
              id={game.id}
              title={game.title}
              description={game.description}
              imageUrl={game.imageUrl}
              genre={game.genre}
            />
          ))}
          {filteredGames.length === 0 && (
            <div className="col-span-full text-center text-violet-300 py-8">No games found.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GamesPage;
