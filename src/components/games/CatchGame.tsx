import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { submitScore } from '@/lib/api';
import { gamesData } from '@/data/gamesData';

const CatchGame: React.FC = () => {
  const { toast } = useToast();
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Start the game
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    moveTarget();
  };

  // Move target to a random position
  const moveTarget = () => {
    if (gameAreaRef.current) {
      const gameArea = gameAreaRef.current;
      const maxX = gameArea.clientWidth - 60;
      const maxY = gameArea.clientHeight - 60;
      
      setTargetPosition({
        x: Math.random() * maxX,
        y: Math.random() * maxY,
      });
    }
  };

  // Handle target click
  const handleTargetClick = () => {
    setScore(prevScore => prevScore + 1);
    moveTarget();
    
    // Show toast on milestone scores
    if ((score + 1) % 5 === 0) {
      toast({
        title: "Nice Catch!",
        description: `You've scored ${score + 1} points!`,
        duration: 2000,
      });
    }
  };

  // Game timer
  useEffect(() => {
    let timer: number;
    
    if (gameActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      toast({
        title: "Game Over!",
        description: `Your final score: ${score}`,
        duration: 4000,
      });
      // Submit score to leaderboard
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const gameId = gamesData.find(g => g.component === 'CatchGame')?.id || 'catch-game';
      if (user) {
        submitScore({
          game_id: gameId,
          user_id: user.id,
          username: user.username,
          score,
        });
      }
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameActive, timeLeft, score, toast]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-game-primary text-white p-4">
        <h2 className="text-xl font-bold text-center">Catch Game</h2>
        <p className="text-center text-sm opacity-90">Click the target as many times as you can!</p>
      </div>
      
      <div className="p-4 md:p-6 flex justify-between items-center">
        <div className="text-center">
          <p className="text-sm text-gray-600">Score</p>
          <p className="text-2xl font-bold text-game-primary">{score}</p>
        </div>
        
        {!gameActive ? (
          <Button 
            onClick={startGame} 
            className="bg-game-secondary hover:bg-game-secondary/90 text-white px-8"
          >
            Start Game
          </Button>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600">Time Left</p>
            <p className="text-2xl font-bold text-game-accent">{timeLeft}s</p>
          </div>
        )}
      </div>
      
      <div 
        ref={gameAreaRef}
        className="bg-gray-100 h-[400px] relative overflow-hidden"
        style={{ cursor: gameActive ? 'pointer' : 'default' }}
      >
        {!gameActive && !score ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-lg text-gray-500">Press Start Game to begin!</p>
          </div>
        ) : !gameActive && score > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-xl font-bold mb-2">Game Over!</p>
            <p className="text-lg text-gray-700">Your score: <span className="text-game-primary font-bold">{score}</span></p>
          </div>
        ) : null}
        
        {gameActive && (
          <div 
            className="absolute bg-game-accent rounded-full w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-75 transform hover:scale-110"
            style={{ 
              left: `${targetPosition.x}px`, 
              top: `${targetPosition.y}px`,
              transition: 'transform 0.1s ease-out'
            }}
            onClick={handleTargetClick}
          >
            <span className="text-white font-bold">+1</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatchGame;
