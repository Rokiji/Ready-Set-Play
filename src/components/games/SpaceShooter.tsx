import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play, RefreshCw } from 'lucide-react';
import { submitScore } from '@/lib/api';
import { gamesData } from '@/data/gamesData';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Bullet extends GameObject {
  active: boolean;
}

interface Enemy extends GameObject {
  active: boolean;
  speed: number;
}

const SpaceShooter: React.FC = () => {
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
  const shipRef = useRef<GameObject>({ x: 0, y: 0, width: 30, height: 30 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const keysRef = useRef<Set<string>>(new Set());

  // Game settings
  const SHIP_SPEED = 5;
  const BULLET_SPEED = 7;
  const ENEMY_SPAWN_RATE = 60; // Frames between enemy spawns
  const MAX_ENEMIES = 10;

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

    // Reset ship position
    shipRef.current = {
      x: canvas.width / 2 - 15,
      y: canvas.height - 50,
      width: 30,
      height: 30
    };

    // Clear bullets and enemies
    bulletsRef.current = [];
    enemiesRef.current = [];

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
    const gameId = gamesData.find(g => g.component === 'SpaceShooter')?.id || 'space-shooter';
    if (user) {
      submitScore({
        game_id: gameId,
        user_id: user.id,
        username: user.username,
        score: scoreRef.current,
      });
    }
  };

  // Create a new bullet
  const fireBullet = () => {
    const ship = shipRef.current;
    bulletsRef.current.push({
      x: ship.x + ship.width / 2 - 2,
      y: ship.y - 10,
      width: 4,
      height: 10,
      active: true
    });
  };

  // Create a new enemy
  const spawnEnemy = (canvas: HTMLCanvasElement) => {
    if (enemiesRef.current.length >= MAX_ENEMIES) return;

    const size = 20 + Math.random() * 20;
    enemiesRef.current.push({
      x: Math.random() * (canvas.width - size),
      y: -size,
      width: size,
      height: size,
      active: true,
      speed: 1 + Math.random() * 3
    });
  };

  // Check collision between two objects
  const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
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

    // Set ship initial position
    shipRef.current = {
      x: canvas.width / 2 - 15,
      y: canvas.height - 50,
      width: 30,
      height: 30
    };

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      // Space bar to fire
      if (e.key === ' ' && gameActiveRef.current) {
        e.preventDefault(); // Prevent page scroll
        fireBullet();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let frameCount = 0;
    let animationId: number;

    // Main game loop
    const gameLoop = () => {
      if (!gameActiveRef.current) {
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw starfield background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = (Math.random() * canvas.height + frameCount) % canvas.height;
        const size = Math.random() * 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(x, y, size, size);
      }

      // Move ship based on key presses
      const ship = shipRef.current;
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) {
        ship.x = Math.max(0, ship.x - SHIP_SPEED);
      }
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) {
        ship.x = Math.min(canvas.width - ship.width, ship.x + SHIP_SPEED);
      }

      // Draw ship
      ctx.fillStyle = '#9370DB'; // Game primary color
      ctx.beginPath();
      ctx.moveTo(ship.x + ship.width / 2, ship.y);
      ctx.lineTo(ship.x + ship.width, ship.y + ship.height);
      ctx.lineTo(ship.x, ship.y + ship.height);
      ctx.closePath();
      ctx.fill();

      // Update and draw bullets
      bulletsRef.current.forEach((bullet, index) => {
        if (!bullet.active) return;

        // Move bullet up
        bullet.y -= BULLET_SPEED;

        // Remove bullet if it's off screen
        if (bullet.y < 0) {
          bullet.active = false;
        }

        // Draw bullet
        ctx.fillStyle = '#FFD700'; // Game accent color
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });

      // Clean up inactive bullets
      bulletsRef.current = bulletsRef.current.filter(bullet => bullet.active);

      // Spawn enemies
      if (frameCount % ENEMY_SPAWN_RATE === 0) {
        spawnEnemy(canvas);
      }

      // Update and draw enemies
      enemiesRef.current.forEach((enemy, index) => {
        if (!enemy.active) return;

        // Move enemy down
        enemy.y += enemy.speed;

        // Remove enemy if it's off screen
        if (enemy.y > canvas.height) {
          enemy.active = false;
        }

        // Check collision with ship
        if (checkCollision(ship, enemy)) {
          handleGameOver();
          return;
        }

        // Check collision with bullets
        bulletsRef.current.forEach((bullet, bIndex) => {
          if (bullet.active && enemy.active && checkCollision(bullet, enemy)) {
            bullet.active = false;
            enemy.active = false;
            
            // Increase score
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }
        });

        // Draw enemy
        ctx.fillStyle = '#FF69B4'; // Game secondary color
        ctx.beginPath();
        ctx.arc(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          enemy.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // Clean up inactive enemies
      enemiesRef.current = enemiesRef.current.filter(enemy => enemy.active);

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
        <h2 className="text-xl font-bold text-center">Space Shooter</h2>
        <p className="text-center text-sm opacity-90">
          Defend the galaxy from alien invaders!
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
              <h3 className="text-xl font-bold mb-2">Space Shooter</h3>
              <p className="text-muted-foreground mb-4 text-center px-4">
                Use arrow keys or A/D to move and space to shoot.<br/>
                Destroy enemies to score points!
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
          <p>Controls: Arrow Keys or A/D to move, Space to shoot</p>
        </div>
      </div>
    </div>
  );
};

export default SpaceShooter;
