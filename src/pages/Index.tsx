import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import GameCard from '@/components/GameCard';
import { gamesData } from '@/data/gamesData';
import { Gamepad, Music, Joystick } from 'lucide-react';

const Index = () => {
  // Show only the first 3 featured games
  const featuredGames = gamesData.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-6 py-12 flex-grow">
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Games</h2>
            <a href="/games" className="text-game-primary hover:text-game-secondary transition-colors font-medium">
              View All Games
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map(game => (
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
        </section>
        <section>
          <div className="bg-card rounded-xl p-8 text-center border border-violet-700/30">
            <h2 className="text-2xl font-bold mb-4 text-white">Why Ready, Set, Play?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-muted p-6 rounded-lg shadow border border-violet-700/20">
                <div className="w-12 h-12 bg-violet-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad className="text-violet-400 h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">Variety of Games</h3>
                <p className="text-foreground">Discover a wide selection of fun mini-games across different genres.</p>
              </div>
              <div className="bg-muted p-6 rounded-lg shadow border border-violet-700/20">
                <div className="w-12 h-12 bg-violet-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="text-violet-400 h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">Integrated Music</h3>
                <p className="text-foreground">Play your favorite songs while gaming without switching applications.</p>
              </div>
              <div className="bg-muted p-6 rounded-lg shadow border border-violet-700/20">
                <div className="w-12 h-12 bg-violet-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Joystick className="text-violet-400 h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">Easy to Play</h3>
                <p className="text-foreground">Simple controls and intuitive interfaces for a seamless gaming experience.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
