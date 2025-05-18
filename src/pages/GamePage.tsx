
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MusicPlayer from '@/components/MusicPlayer';
import CatchGame from '@/components/games/CatchGame';
import GameCard from '@/components/GameCard';
import { Button } from '@/components/ui/button';
import { gamesData } from '@/data/gamesData';
import { ArrowLeft } from 'lucide-react';

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const game = gamesData.find(g => g.id === gameId);

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-6 py-12 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
            <p className="mb-6">Sorry, the game you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/games">Return to Games</Link>
            </Button>
          </div>
        </main>
        <MusicPlayer />
      </div>
    );
  }

  const renderGameComponent = () => {
    switch (game.component) {
      case 'CatchGame':
        return <CatchGame />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{game.title}</h2>
            <p className="mb-6 text-gray-600">{game.description}</p>
            <div className="rounded-lg overflow-hidden mb-6">
              <img src={game.imageUrl} alt={game.title} className="w-full h-64 object-cover" />
            </div>
            <p className="text-game-primary font-medium">Coming soon! This game is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="mb-8 flex items-center">
          <Button asChild variant="ghost" className="mr-4">
            <Link to="/games">
              <ArrowLeft className="mr-2" size={16} />
              Back to Games
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{game.title}</h1>
        </div>
        
        <div className="mb-12">
          {renderGameComponent()}
        </div>
        
        {/* Game recommendations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gamesData
              .filter(g => g.id !== gameId)
              .slice(0, 4)
              .map(game => (
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
      </main>
      
      <MusicPlayer />
    </div>
  );
};

export default GamePage;
