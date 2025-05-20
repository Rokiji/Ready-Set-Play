export interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  genre: string;
  component?: string;
}

export const gamesData: Game[] = [
  {
    id: "catch-game",
    title: "Catch Game",
    description: "Test your reflexes by clicking on targets as quickly as possible.",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop",
    genre: "Arcade",
    component: "CatchGame"
  },
  {
    id: "puzzle-masters",
    title: "Puzzle Masters",
    description: "Challenge your brain with engaging puzzles and mind-bending riddles.",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2574&auto=format&fit=crop",
    genre: "Puzzle",
    component: "PuzzleMasters"
  },
  {
    id: "space-shooter",
    title: "Space Shooter",
    description: "Defend the galaxy against alien invaders in this action-packed shooter.",
    imageUrl: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=2670&auto=format&fit=crop",
    genre: "Action",
    component: "SpaceShooter"
  },
  {
    id: "racing-fever",
    title: "Racing Fever",
    description: "Experience high-speed thrills as you race against opponents on various tracks.",
    imageUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=2671&auto=format&fit=crop",
    genre: "Racing",
    component: "RacingFever"
  },
  {
    id: "word-wizard",
    title: "Word Wizard",
    description: "Test your vocabulary skills and discover new words in this word game.",
    imageUrl: "https://images.unsplash.com/photo-1516383607781-913a19294fd1?q=80&w=2574&auto=format&fit=crop",
    genre: "Educational",
    component: "WordWizard"
  },
  {
    id: "memory-match",
    title: "Memory Match",
    description: "Find matching pairs and train your memory in this classic matching game.",
    imageUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2670&auto=format&fit=crop",
    genre: "Memory",
    component: "MemoryMatch"
  },
  {
    id: "arcade-racer",
    title: "Arcade Racer",
    description: "Navigate your car through traffic and obstacles in this retro racing game.",
    imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=2670&auto=format&fit=crop",
    genre: "Arcade",
    component: "ArcadeRacer"
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Classic game of X's and O's. Challenge the computer in this strategic battle.",
    imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2670&auto=format&fit=crop", // new tic tac toe photo
    genre: "Strategy",
    component: "TicTacToe"
  }
];
