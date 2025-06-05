import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shuffle } from 'lucide-react';
import { submitScore } from '@/lib/api';
import { gamesData } from '@/data/gamesData';

const PuzzleMasters: React.FC = () => {
  const { toast } = useToast();
  const [tiles, setTiles] = useState<number[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gridSize, setGridSize] = useState(3); // 3x3 puzzle
  
  // Initialize and shuffle puzzle tiles
  const initializePuzzle = () => {
    const totalTiles = gridSize * gridSize;
    const newTiles = Array.from({ length: totalTiles }, (_, i) => i);
    // Shuffle tiles
    shuffleTiles(newTiles);
    setTiles(newTiles);
    setIsWon(false);
    setMoves(0);
  };

  // Custom shuffle algorithm to ensure the puzzle is solvable
  const shuffleTiles = (tilesArray: number[]) => {
    for (let i = tilesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tilesArray[i], tilesArray[j]] = [tilesArray[j], tilesArray[i]];
    }
    
    // Ensure the puzzle is solvable by checking inversions
    if (!isSolvable(tilesArray, gridSize)) {
      // Swap the first two non-zero tiles to make it solvable
      const firstNonZero = tilesArray.findIndex(t => t !== 0);
      const secondNonZero = tilesArray.findIndex((t, i) => t !== 0 && i > firstNonZero);
      
      if (firstNonZero !== -1 && secondNonZero !== -1) {
        [tilesArray[firstNonZero], tilesArray[secondNonZero]] = 
        [tilesArray[secondNonZero], tilesArray[firstNonZero]];
      }
    }
  };

  // Check if the puzzle is solvable
  const isSolvable = (tiles: number[], size: number): boolean => {
    let inversions = 0;
    const zeroPosition = tiles.indexOf(0);
    const zeroRow = Math.floor(zeroPosition / size);
    
    // Count inversions
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === 0) continue;
      
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[j] !== 0 && tiles[i] > tiles[j]) {
          inversions++;
        }
      }
    }
    
    // For odd grid size, the puzzle is solvable if inversions is even
    if (size % 2 === 1) {
      return inversions % 2 === 0;
    }
    // For even grid size, the puzzle is solvable if
    // (inversions + row of empty square from bottom) is odd
    else {
      return (inversions + (size - zeroRow)) % 2 === 1;
    }
  };

  // Handle tile click
  const handleTileClick = (index: number) => {
    if (isWon) return;
    
    const zeroIndex = tiles.indexOf(0);
    
    // Check if the clicked tile can move (adjacent to the empty tile)
    if (isAdjacent(index, zeroIndex)) {
      const newTiles = [...tiles];
      // Swap the clicked tile with the empty tile (0)
      [newTiles[index], newTiles[zeroIndex]] = [newTiles[zeroIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(moves + 1);
      
      // Check if the puzzle is solved
      if (isSolved(newTiles)) {
        setIsWon(true);
        toast({
          title: "Puzzle Solved!",
          description: `You completed the puzzle in ${moves + 1} moves.`,
          duration: 5000,
        });
        // Submit score to leaderboard
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const gameId = gamesData.find(g => g.component === 'PuzzleMasters')?.id || 'puzzle-masters';
        if (user) {
          submitScore({
            game_id: gameId,
            user_id: user.id,
            username: user.username,
            score: moves + 1,
          });
        }
      }
    }
  };

  // Check if a tile is adjacent to another (can be moved)
  const isAdjacent = (index1: number, index2: number): boolean => {
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;
    
    // Check if tiles are adjacent horizontally or vertically
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  };

  // Check if the puzzle is solved
  const isSolved = (tilesArray: number[]): boolean => {
    for (let i = 0; i < tilesArray.length - 1; i++) {
      if (tilesArray[i] !== i + 1) {
        return false;
      }
    }
    return tilesArray[tilesArray.length - 1] === 0;
  };

  // Initialize the puzzle on component mount
  useEffect(() => {
    initializePuzzle();
  }, [gridSize]);

  return (
    <div className="w-full max-w-lg mx-auto bg-card rounded-xl shadow-lg overflow-hidden">
      <div className="bg-game-primary text-white p-4">
        <h2 className="text-xl font-bold text-center">Puzzle Masters</h2>
        <p className="text-center text-sm opacity-90">
          Slide the tiles to place them in numerical order.
        </p>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Moves</p>
            <p className="text-xl font-bold text-game-primary">{moves}</p>
          </div>
          
          <Button
            onClick={initializePuzzle}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shuffle size={16} />
            Shuffle
          </Button>
        </div>
        
        <div 
          className="grid gap-1 mx-auto mb-4 aspect-square"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            maxWidth: '350px'
          }}
        >
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => handleTileClick(index)}
              disabled={tile === 0 || isWon}
              className={`
                aspect-square flex items-center justify-center rounded-md text-xl font-bold
                ${tile === 0 
                  ? 'bg-muted opacity-0 cursor-default' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                }
                ${isWon ? 'animate-pulse-scale' : ''}
              `}
            >
              {tile !== 0 ? tile : ''}
            </button>
          ))}
        </div>
        
        {isWon && (
          <div className="text-center mt-4 p-3 bg-accent/10 rounded-lg">
            <p className="font-bold text-lg text-accent">Congratulations!</p>
            <p className="text-muted-foreground">
              You solved the puzzle in {moves} moves.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleMasters;
