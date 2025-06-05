import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { submitScore } from '@/lib/api';
import { gamesData } from '@/data/gamesData';

// Card icons - we'll use emojis for the memory cards
const CARD_ICONS = [
  '🌟', '🎮', '🎯', '🎲', '🎪', '🎭', '🎨', '🎬',
  '🎤', '🎧', '🎸', '🎹', '🎯', '🎪', '🎭', '🎨'
];

interface Card {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryMatch: React.FC = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize the game
  const initializeGame = () => {
    // Create pairs of cards with unique IDs
    const cardPairs = CARD_ICONS.slice(0, 8).flatMap((icon, index) => [
      { id: index * 2, icon, flipped: false, matched: false },
      { id: index * 2 + 1, icon, flipped: false, matched: false }
    ]);
    
    // Shuffle cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setGameComplete(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  // Start a new game
  const startNewGame = () => {
    initializeGame();
    setGameStarted(true);
    setStartTime(Date.now());
  };

  // Format time as mm:ss
  const formatTime = (timeInMs: number): string => {
    const seconds = Math.floor((timeInMs / 1000) % 60);
    const minutes = Math.floor((timeInMs / 1000 / 60) % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    // Don't allow clicks on already flipped cards or if 2 cards are already flipped
    if (
      flippedCards.length === 2 ||
      cards.find(card => card.id === cardId)?.flipped ||
      cards.find(card => card.id === cardId)?.matched
    ) {
      return;
    }

    // If this is the first move, start the timer
    if (moves === 0 && !startTime) {
      setStartTime(Date.now());
    }

    // Flip the card
    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, flipped: true } : card
    );
    setCards(newCards);
    
    // Add this card to flipped cards
    setFlippedCards([...flippedCards, cardId]);
  };

  // Check for matches when 2 cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(m => m + 1);
      
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard?.icon === secondCard?.icon) {
        // Mark cards as matched
        const newCards = cards.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, matched: true }
            : card
        );
        
        setCards(newCards);
        setFlippedCards([]);
        
        // Check if all cards are matched
        const allMatched = newCards.every(card => card.matched);
        if (allMatched) {
          const finalTime = Date.now() - (startTime || 0);
          setElapsedTime(finalTime);
          setGameComplete(true);
          
          // Update best score
          if (bestScore === null || moves + 1 < bestScore) {
            setBestScore(moves + 1);
            toast({
              title: "New High Score!",
              description: `You completed the game in ${moves + 1} moves!`,
              duration: 5000,
            });
          } else {
            toast({
              title: "Game Complete!",
              description: `You completed the game in ${moves + 1} moves!`,
              duration: 3000,
            });
          }
          // Submit score to leaderboard
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          const gameId = gamesData.find(g => g.component === 'MemoryMatch')?.id || 'memory-match';
          if (user) {
            submitScore({
              game_id: gameId,
              user_id: user.id,
              username: user.username,
              score: moves + 1,
            });
          }
        }
      } else {
        // If no match, flip cards back after a delay
        setTimeout(() => {
          setCards(cards.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, flipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, moves, bestScore, toast, startTime]);

  // Update elapsed time
  useEffect(() => {
    let timer: number;
    
    if (gameStarted && !gameComplete && startTime) {
      timer = window.setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameComplete, startTime]);

  return (
    <div className="w-full max-w-xl mx-auto bg-card rounded-xl shadow-lg overflow-hidden">
      <div className="bg-game-primary text-white p-4">
        <h2 className="text-xl font-bold text-center">Memory Match</h2>
        <p className="text-center text-sm opacity-90">
          Match pairs of cards to win!
        </p>
      </div>
      
      <div className="p-4">
        {!gameStarted ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-bold mb-4">Memory Match Challenge</h3>
            <p className="mb-6 text-muted-foreground">
              Flip cards to find matching pairs. Complete the game in the fewest moves!
            </p>
            <Button onClick={startNewGame} className="bg-game-secondary hover:bg-game-secondary/90 text-white">
              Start Game
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Moves</p>
                <p className="text-xl font-bold text-game-primary">{moves}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-xl font-bold text-game-secondary">{formatTime(elapsedTime)}</p>
              </div>
              
              {bestScore !== null && (
                <div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className="text-xl font-bold text-game-accent">{bestScore}</p>
                </div>
              )}
              
              <Button
                onClick={startNewGame}
                variant="outline"
                className="flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Restart
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {cards.map(card => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`
                    aspect-square flex items-center justify-center text-2xl rounded-md cursor-pointer
                    transition-all duration-500 transform perspective-500
                    ${card.flipped || card.matched ? 'rotate-y-180' : ''}
                    ${card.matched ? 'bg-accent text-accent-foreground' : 
                      card.flipped ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                    ${gameComplete ? 'cursor-default' : 'hover:bg-muted/90'}
                  `}
                  style={{ 
                    perspective: '1000px',
                    transformStyle: 'preserve-3d' 
                  }}
                >
                  {(card.flipped || card.matched) ? card.icon : '?'}
                </div>
              ))}
            </div>
            
            {gameComplete && (
              <div className="mt-6 text-center p-4 bg-accent/10 rounded-lg">
                <h3 className="text-lg font-bold text-accent mb-2">Congratulations!</h3>
                <p className="text-muted-foreground">
                  You completed the game in {moves} moves and {formatTime(elapsedTime)}.
                </p>
                <Button
                  onClick={startNewGame}
                  className="mt-4 bg-game-secondary hover:bg-game-secondary/90 text-white"
                >
                  Play Again
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemoryMatch;
