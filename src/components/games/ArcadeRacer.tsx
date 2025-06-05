import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { submitScore } from '@/lib/api';
import { gamesData } from '@/data/gamesData';

const ArcadeRacer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [position, setPosition] = useState(1); // 0, 1, 2 for left, center, right
  const [obstacles, setObstacles] = useState<number[]>([]);
  
  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('arcade-racer-highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    let gameInterval: number;
    let obstacleInterval: number;
    
    // Move obstacles down
    gameInterval = window.setInterval(() => {
      setScore(prevScore => prevScore + 1);
      setObstacles(prevObstacles => {
        const newObstacles = prevObstacles.map(pos => pos + 3);
        
        // Check for collisions
        newObstacles.forEach(obstaclePos => {
          if (obstaclePos > 75 && obstaclePos < 95 && position === Math.floor(newObstacles.indexOf(obstaclePos) / 3)) {
            handleGameOver();
          }
        });
        
        // Remove obstacles that moved off screen
        return newObstacles.filter(pos => pos < 100);
      });
    }, 100);
    
    // Generate new obstacles
    obstacleInterval = window.setInterval(() => {
      const randomLane = Math.floor(Math.random() * 3);
      setObstacles(prevObstacles => [...prevObstacles, randomLane * 3]);
    }, 2000);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPosition(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setPosition(prev => Math.min(2, prev + 1));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.clearInterval(gameInterval);
      window.clearInterval(obstacleInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, position]);
  
  const handleGameOver = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('arcade-racer-highscore', score.toString());
    }
    // Submit score to leaderboard
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const gameId = gamesData.find(g => g.component === 'ArcadeRacer')?.id || 'arcade-racer';
    if (user) {
      submitScore({
        game_id: gameId,
        user_id: user.id,
        username: user.username,
        score,
      });
    }
  };
  
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setObstacles([]);
  };
  
  const moveLeft = () => {
    setPosition(prev => Math.max(0, prev - 1));
  };
  
  const moveRight = () => {
    setPosition(prev => Math.min(2, prev + 1));
  };
  
  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-gray-900 to-violet-900 rounded-lg p-8 shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-gradient-violet">Arcade Racer</h2>
      
      <div className="flex justify-between w-full mb-4">
        <div className="text-violet-400 font-medium">Score: {score}</div>
        <div className="text-violet-300 font-medium">High Score: {highScore}</div>
      </div>
      
      {!isPlaying ? (
        <Button 
          onClick={startGame}
          className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-lg text-lg mb-4"
        >
          Start Game
        </Button>
      ) : (
        <div className="relative w-64 h-80 bg-gray-900 border border-violet-500 rounded-lg overflow-hidden mb-4">
          {/* Road */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-full bg-gray-800"></div>
          
          {/* Car */}
          <div 
            className="absolute bottom-4 w-8 h-12 bg-violet-500 rounded-md transition-all duration-200"
            style={{ left: `${(position * 33) + 14}%` }}
          ></div>
          
          {/* Obstacles */}
          {obstacles.map((pos, index) => (
            <div 
              key={index}
              className="absolute w-8 h-6 bg-red-500 rounded-sm"
              style={{ 
                left: `${(Math.floor(index / 3) * 33) + 14}%`,
                top: `${pos}%`
              }}
            ></div>
          ))}
        </div>
      )}
      
      {isPlaying && (
        <div className="flex gap-4 mt-4">
          <Button onClick={moveLeft} className="bg-violet-700 hover:bg-violet-800">⬅️ Left</Button>
          <Button onClick={moveRight} className="bg-violet-700 hover:bg-violet-800">Right ➡️</Button>
        </div>
      )}
      
      <div className="mt-6 text-violet-300 text-center">
        <h3 className="font-medium mb-2">How to Play:</h3>
        <p>Use arrow keys or buttons to move left and right.</p>
        <p>Avoid obstacles coming down the road.</p>
        <p>Score increases the longer you survive!</p>
      </div>
    </div>
  );
};

export default ArcadeRacer;
