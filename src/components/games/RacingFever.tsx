import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play, RefreshCw } from 'lucide-react';
import { submitScore } from '@/lib/api';
import { gamesData } from '@/data/gamesData';

interface Car {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
}

const RacingFever: React.FC = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Game state refs to avoid dependency issues in animation loop
  const gameActiveRef = useRef(false);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);

  // Game objects
  const carRef = useRef<Car>({ x: 0, y: 0, width: 40, height: 70, speed: 5 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const roadLinesRef = useRef<{ y: number }[]>([]);

  // Game settings
  const CAR_SPEED = 6;
  const OBSTACLE_SPAWN_RATE = 90; // Frames between obstacle spawns
  const ROAD_SPEED = 5;
  const LANE_WIDTH = 80;
  const MAX_OBSTACLES = 8;

  // Initialize game
  const initializeGame = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset state
    setScore(0);
    setGameOver(false);
    scoreRef.current = 0;
    gameOverRef.current = false;

    // Reset car position
    const carWidth = 40;
    const carHeight = 70;
    carRef.current = {
      x: canvas.width / 2 - carWidth / 2,
      y: canvas.height - carHeight - 20,
      width: carWidth,
      height: carHeight,
      speed: CAR_SPEED
    };

    // Clear obstacles
    obstaclesRef.current = [];

    // Initialize road lines
    roadLinesRef.current = [];
    const lineCount = 5;
    const lineHeight = 50;
    const lineGap = 100;
    for (let i = 0; i < lineCount; i++) {
      roadLinesRef.current.push({
        y: i * (lineHeight + lineGap)
      });
    }

    // Start game loop
    setGameActive(true);
    gameActiveRef.current = true;
  };

  // Handle game over
  const handleGameOver = () => {
    gameActiveRef.current = false;
    gameOverRef.current = true;
    setGameActive(false);
    setGameOver(true);

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      toast({
        title: "New High Score!",
        description: `You achieved a new high score of ${scoreRef.current}!`,
        duration: 5000,
      });
    } else {
      toast({
        title: "Game Over!",
        description: `Your final score: ${scoreRef.current}`,
        duration: 3000,
      });
    }
    // Submit score to leaderboard
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const gameId = gamesData.find(g => g.component === 'RacingFever')?.id || 'racing-fever';
    if (user) {
      submitScore({
        game_id: gameId,
        user_id: user.id,
        username: user.username,
        score: scoreRef.current,
      });
    }
  };

  // Create a new obstacle
  const spawnObstacle = (canvas: HTMLCanvasElement) => {
    if (obstaclesRef.current.length >= MAX_OBSTACLES) return;

    // Calculate lane positions
    const lanes = 3;
    const laneWidth = LANE_WIDTH;
    const roadWidth = lanes * laneWidth;
    const roadStart = (canvas.width - roadWidth) / 2;
    
    // Choose a random lane
    const lane = Math.floor(Math.random() * lanes);
    
    // Calculate x position for the chosen lane
    const obstacleWidth = 35;
    const x = roadStart + lane * laneWidth + (laneWidth - obstacleWidth) / 2;
    
    obstaclesRef.current.push({
      x,
      y: -80, // Start just above the visible canvas
      width: obstacleWidth,
      height: 70,
      speed: ROAD_SPEED + Math.random(),
      active: true
    });
  };

  // Check collision between two objects
  const checkCollision = (obj1: Car, obj2: Obstacle): boolean => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };

  // Game loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Reset car position
    const carWidth = 40;
    const carHeight = 70;
    carRef.current = {
      x: canvas.width / 2 - carWidth / 2,
      y: canvas.height - carHeight - 20,
      width: carWidth,
      height: carHeight,
      speed: CAR_SPEED
    };

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let frameCount = 0;
    let animationId: number;
    let lastScoreUpdate = 0;

    // Main game loop
    const gameLoop = () => {
      if (!gameActiveRef.current) {
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate road dimensions
      const lanes = 3;
      const laneWidth = LANE_WIDTH;
      const roadWidth = lanes * laneWidth;
      const roadStart = (canvas.width - roadWidth) / 2;

      // Draw road
      ctx.fillStyle = '#333';
      ctx.fillRect(roadStart, 0, roadWidth, canvas.height);
      
      // Draw road lines
      ctx.fillStyle = '#FFF';
      roadLinesRef.current.forEach((line, index) => {
        // Update line position
        line.y += ROAD_SPEED;
        if (line.y > canvas.height) {
          line.y = -50;
        }
        
        // Draw line segments for each lane divider
        for (let i = 1; i < lanes; i++) {
          ctx.fillRect(
            roadStart + i * laneWidth - 2,
            line.y,
            4,
            50
          );
        }
      });

      // Move car based on key presses
      const car = carRef.current;
      if ((keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) && car.x > roadStart) {
        car.x = Math.max(roadStart, car.x - car.speed);
      }
      if ((keysRef.current.has('ArrowRight') || keysRef.current.has('d')) && car.x + car.width < roadStart + roadWidth) {
        car.x = Math.min(roadStart + roadWidth - car.width, car.x + car.speed);
      }

      // Draw car
      ctx.fillStyle = '#9370DB'; // Player car color
      ctx.fillRect(car.x, car.y, car.width, car.height);
      
      // Add details to the car
      ctx.fillStyle = '#000';
      ctx.fillRect(car.x + 5, car.y + 10, car.width - 10, 5); // Window
      ctx.fillRect(car.x + 5, car.y + 25, car.width - 10, 5); // Window

      // Spawn obstacles
      if (frameCount % OBSTACLE_SPAWN_RATE === 0 && obstaclesRef.current.length < MAX_OBSTACLES) {
        spawnObstacle(canvas);
      }

      // Update and draw obstacles
      obstaclesRef.current.forEach((obstacle, index) => {
        if (!obstacle.active) return;

        // Move obstacle down
        obstacle.y += obstacle.speed;

        // Remove obstacle if it's off screen
        if (obstacle.y > canvas.height) {
          obstacle.active = false;
          
          // Increase score when passing an obstacle
          scoreRef.current += 10;
          setScore(scoreRef.current);
        }

        // Check collision with car
        if (checkCollision(car, obstacle)) {
          handleGameOver();
          return;
        }

        // Draw obstacle (other car)
        ctx.fillStyle = '#FF69B4'; // Obstacle car color
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add details to obstacle car
        ctx.fillStyle = '#000';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 10, obstacle.width - 10, 5); // Window
        ctx.fillRect(obstacle.x + 5, obstacle.y + 40, obstacle.width - 10, 5); // Window
      });

      // Clean up inactive obstacles
      obstaclesRef.current = obstaclesRef.current.filter(obstacle => obstacle.active);

      // Increase score based on time
      if (frameCount - lastScoreUpdate > 30) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        lastScoreUpdate = frameCount;
      }

      // Draw score
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 20);

      frameCount++;
      animationId = requestAnimationFrame(gameLoop);
    };

    if (gameActive) {
      animationId = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [gameActive]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-lg overflow-hidden">
      <div className="bg-game-primary text-white p-4">
        <h2 className="text-xl font-bold text-center">Racing Fever</h2>
        <p className="text-center text-sm opacity-90">
          Dodge traffic and set a new high score!
        </p>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-xl font-bold text-game-accent">{score}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">High Score</p>
            <p className="text-xl font-bold text-game-secondary">{highScore}</p>
          </div>
          
          {gameActive ? (
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => {
                gameActiveRef.current = false;
                setGameActive(false);
              }}
            >
              <RefreshCw size={16} />
              Reset
            </Button>
          ) : (
            <Button
              className="bg-game-secondary hover:bg-game-secondary/90 text-white flex items-center gap-1"
              onClick={initializeGame}
            >
              <Play size={16} />
              {gameOver ? 'Play Again' : 'Start Game'}
            </Button>
          )}
        </div>
        
        <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted/30">
          <canvas 
            ref={canvasRef}
            className="w-full aspect-video"
            tabIndex={0}
          />
          
          {!gameActive && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70">
              <h3 className="text-xl font-bold mb-2">Racing Fever</h3>
              <p className="text-muted-foreground mb-4 text-center px-4">
                Use arrow keys or A/D to steer your car.<br/>
                Avoid hitting other vehicles!
              </p>
              <Button 
                className="bg-game-secondary hover:bg-game-secondary/90 text-white"
                onClick={initializeGame}
              >
                Start Game
              </Button>
            </div>
          )}
          
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70">
              <h3 className="text-xl font-bold mb-2">Game Over!</h3>
              <p className="text-muted-foreground mb-2">
                Final Score: <span className="font-bold text-game-accent">{score}</span>
              </p>
              <p className="text-muted-foreground mb-4">
                High Score: <span className="font-bold text-game-secondary">{highScore}</span>
              </p>
              <Button 
                className="bg-game-secondary hover:bg-game-secondary/90 text-white"
                onClick={initializeGame}
              >
                Play Again
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Controls: Arrow Keys or A/D to steer</p>
        </div>
      </div>
    </div>
  );
};

export default RacingFever;
