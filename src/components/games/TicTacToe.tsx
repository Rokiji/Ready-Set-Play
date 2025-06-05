import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { submitScore } from '@/lib/api';
import { gamesData } from '@/data/gamesData';

type Player = 'X' | 'O' | null;
type GameStatus = Player | 'draw'; // Adding 'draw' as a possible game status
type BoardState = Player[];

const TicTacToe = () => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<GameStatus>(null); // Changed type to GameStatus
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState<boolean>(false);
  
  // Check for winner
  useEffect(() => {
    const winnerResult = calculateWinner(board);
    if (winnerResult) {
      setWinner(winnerResult.player);
      setWinningLine(winnerResult.line);
      // Submit score to leaderboard
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const gameId = gamesData.find(g => g.component === 'TicTacToe')?.id || 'tic-tac-toe';
      if (user) {
        submitScore({
          game_id: gameId,
          user_id: user.id,
          username: user.username,
          score: winnerResult.player === 'X' ? 1 : -1,
        });
      }
    } else if (board.every(square => square !== null)) {
      // It's a draw
      setWinner('draw');
      // Submit score to leaderboard
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const gameId = gamesData.find(g => g.component === 'TicTacToe')?.id || 'tic-tac-toe';
      if (user) {
        submitScore({
          game_id: gameId,
          user_id: user.id,
          username: user.username,
          score: 0,
        });
      }
    }
  }, [board]);
  
  // Computer move
  useEffect(() => {
    if (!isXNext && !winner) {
      setIsComputerThinking(true);
      const timeoutId = setTimeout(() => {
        const emptySquares = board.map((square, index) => square === null ? index : -1).filter(val => val !== -1);
        if (emptySquares.length > 0) {
          const randomIndex = Math.floor(Math.random() * emptySquares.length);
          const computerMove = emptySquares[randomIndex];
          handleClick(computerMove);
          setIsComputerThinking(false);
        }
      }, 700);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isXNext, winner, board]);
  
  const calculateWinner = (squares: BoardState) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { player: squares[a], line: lines[i] };
      }
    }
    
    return null;
  };
  
  const handleClick = (i: number) => {
    if (winner || board[i] || (isXNext === false && isComputerThinking)) return;
    
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };
  
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };
  
  const renderSquare = (i: number) => {
    const isWinningSquare = winningLine?.includes(i);
    
    return (
      <button 
        className={`w-20 h-20 text-2xl font-bold flex items-center justify-center 
          ${board[i] ? (board[i] === 'X' ? 'text-white' : 'text-white') : 'text-transparent'}
          ${isWinningSquare ? 'bg-violet-900/50 animate-pulse' : 'bg-gray-800/60'}
          border border-violet-700/40 transition-all duration-200 hover:bg-violet-900/30`}
        onClick={() => handleClick(i)}
        disabled={!!winner || !!board[i] || (!isXNext && !board[i])}
      >
        {board[i]}
      </button>
    );
  };

  let status;
  if (winner === 'draw') {
    status = "It's a draw!";
  } else if (winner) {
    status = `Winner: ${winner}`;
  } else {
    status = isComputerThinking ? "Computer is thinking..." : `Next player: ${isXNext ? 'X' : 'O'}`;
  }

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-gray-900 to-violet-900 rounded-lg p-8 shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-white">Tic Tac Toe</h2>
      
      <div className="mb-6">
        <div className="status text-xl font-medium mb-4 text-white">{status}</div>
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div key={i}>{renderSquare(i)}</div>
          ))}
        </div>
      </div>
      
      <Button 
        onClick={resetGame}
        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg"
      >
        New Game
      </Button>
      
      <div className="mt-6 text-white text-center">
        <h3 className="font-medium mb-2">How to Play:</h3>
        <p>You are X, computer is O.</p>
        <p>Take turns placing your marks.</p>
        <p>Get three in a row to win!</p>
      </div>
    </div>
  );
};

export default TicTacToe;
