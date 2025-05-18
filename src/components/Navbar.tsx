
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gamepad } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-game-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Gamepad size={28} className="text-game-secondary" />
          <h1 className="text-2xl font-bold">Ready, Set, Play</h1>
        </Link>
        
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className="hover:text-game-secondary transition-colors">Home</Link>
          <Link to="/games" className="hover:text-game-secondary transition-colors">Games</Link>
          <Link to="/music" className="hover:text-game-secondary transition-colors">Music</Link>
          <Link to="/about" className="hover:text-game-secondary transition-colors">About</Link>
        </div>
        
        <div>
          <Button className="bg-game-secondary hover:bg-game-secondary/90 text-white">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
