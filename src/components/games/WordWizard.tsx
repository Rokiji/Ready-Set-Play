import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, RefreshCw } from 'lucide-react';
import { submitScore } from '@/lib/api';
import { gamesData } from '@/data/gamesData';

// List of words for the game
const WORD_LIST = [
  "APPLE", "BEACH", "CHAIR", "DANCE", "EARTH",
  "FLAME", "GRAPE", "HOUSE", "IGLOO", "JUICE",
  "KOALA", "LEMON", "MONEY", "NIGHT", "OCEAN",
  "PIANO", "QUEEN", "RIVER", "SNAKE", "TABLE",
  "UMBRA", "VOICE", "WATER", "XENON", "YACHT",
  "ZEBRA", "CLOUD", "DREAM", "TOWER", "SMILE"
];

const WordWizard: React.FC = () => {
  const { toast } = useToast();
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_WRONG_GUESSES = 6;

  // Start a new game with a random word
  const startNewGame = () => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setCurrentWord(randomWord);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameStatus('playing');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  // Initialize game on component mount
  useEffect(() => {
    startNewGame();
  }, []);

  // Handle letter input
  const handleGuess = (event: React.FormEvent) => {
    event.preventDefault();

    if (gameStatus !== 'playing' || !inputRef.current) return;

    const letter = inputRef.current.value.toUpperCase();
    
    if (!/^[A-Z]$/.test(letter)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a single letter (A-Z).",
        variant: "destructive",
      });
      return;
    }

    if (guessedLetters.has(letter)) {
      toast({
        title: "Letter Already Guessed",
        description: `You've already guessed the letter ${letter}.`,
        variant: "destructive",
      });
      return;
    }

    // Add the new letter to guessedLetters
    const updatedGuessedLetters = new Set(guessedLetters);
    updatedGuessedLetters.add(letter);
    setGuessedLetters(updatedGuessedLetters);

    // Check if the guessed letter is in the word
    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= MAX_WRONG_GUESSES) {
        setGameStatus('lost');
        toast({
          title: "Game Over!",
          description: `The word was "${currentWord}". Try again!`,
          variant: "destructive",
        });
      }
    } else {
      // Check if all letters have been guessed
      const allLettersGuessed = [...currentWord].every(char => 
        updatedGuessedLetters.has(char)
      );

      if (allLettersGuessed) {
        setGameStatus('won');
        const newScore = score + 1;
        setScore(newScore);
        toast({
          title: "Congratulations!",
          description: `You guessed "${currentWord}" correctly!`,
        });
        // Submit score to leaderboard
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const gameId = gamesData.find(g => g.component === 'WordWizard')?.id || 'word-wizard';
        if (user) {
          submitScore({
            game_id: gameId,
            user_id: user.id,
            username: user.username,
            score: newScore,
          });
        }
      }
    }

    // Clear input
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  // Display word with guessed letters revealed and others hidden
  const displayWord = () => {
    return [...currentWord].map((letter, index) => (
      <div 
        key={index} 
        className={`
          w-10 h-12 border-b-2 flex items-end justify-center pb-1 mx-1
          ${guessedLetters.has(letter) ? 'border-accent' : 'border-muted-foreground'}
          ${gameStatus === 'lost' && !guessedLetters.has(letter) ? 'border-destructive' : ''}
        `}
      >
        <span className={`text-xl font-bold ${
          guessedLetters.has(letter) || gameStatus === 'lost' 
            ? 'visible' 
            : 'invisible'
        }`}>
          {letter}
        </span>
      </div>
    ));
  };

  // Hangman figure based on wrong guesses
  const hangmanFigure = () => {
    const figure = [];
    
    if (wrongGuesses >= 1) figure.push(<circle key="head" cx="50" cy="25" r="10" className="stroke-current stroke-2 fill-none" />);
    if (wrongGuesses >= 2) figure.push(<line key="body" x1="50" y1="35" x2="50" y2="70" className="stroke-current stroke-2" />);
    if (wrongGuesses >= 3) figure.push(<line key="arm-left" x1="50" y1="45" x2="30" y2="55" className="stroke-current stroke-2" />);
    if (wrongGuesses >= 4) figure.push(<line key="arm-right" x1="50" y1="45" x2="70" y2="55" className="stroke-current stroke-2" />);
    if (wrongGuesses >= 5) figure.push(<line key="leg-left" x1="50" y1="70" x2="30" y2="90" className="stroke-current stroke-2" />);
    if (wrongGuesses >= 6) figure.push(<line key="leg-right" x1="50" y1="70" x2="70" y2="90" className="stroke-current stroke-2" />);
    
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className={`mx-auto ${gameStatus === 'lost' ? 'text-destructive' : 'text-primary'}`}>
        {/* Gallows */}
        <line x1="10" y1="95" x2="90" y2="95" className="stroke-current stroke-2" />
        <line x1="30" y1="95" x2="30" y2="5" className="stroke-current stroke-2" />
        <line x1="30" y1="5" x2="50" y2="5" className="stroke-current stroke-2" />
        <line x1="50" y1="5" x2="50" y2="15" className="stroke-current stroke-2" />
        
        {/* Figure parts based on wrong guesses */}
        {figure}
      </svg>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-card rounded-xl shadow-lg overflow-hidden">
      <div className="bg-game-primary text-white p-4">
        <h2 className="text-xl font-bold text-center">Word Wizard</h2>
        <p className="text-center text-sm opacity-90">
          Guess the hidden word one letter at a time
        </p>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-6">
          <div className="w-32 h-32 flex items-center justify-center">
            {hangmanFigure()}
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {gameStatus === 'playing' ? (
                `Guesses remaining: ${MAX_WRONG_GUESSES - wrongGuesses}`
              ) : gameStatus === 'won' ? (
                "You won! Great job!"
              ) : (
                "Game over! Try again."
              )}
            </p>
            <div className="flex flex-wrap justify-center my-4">
              {displayWord()}
            </div>
            
            <p className="text-sm text-muted-foreground mt-2">
              Guessed letters: {[...guessedLetters].sort().join(', ')}
            </p>
          </div>
        </div>
        
        {gameStatus === 'playing' ? (
          <form onSubmit={handleGuess} className="flex gap-2 justify-center">
            <input
              ref={inputRef}
              type="text"
              maxLength={1}
              autoFocus
              className="w-12 h-12 text-center text-xl font-bold rounded-md bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit">
              <Check size={16} className="mr-1" />
              Guess
            </Button>
          </form>
        ) : (
          <div className="flex justify-center">
            <Button onClick={startNewGame} className="flex items-center">
              <RefreshCw size={16} className="mr-2" />
              New Word
            </Button>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Words solved</p>
          <p className="text-2xl font-bold text-accent">{score}</p>
        </div>
      </div>
    </div>
  );
};

export default WordWizard;
