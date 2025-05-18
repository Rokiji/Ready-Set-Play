
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gamepad } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-game-primary to-game-background py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
          {Array.from({ length: 100 }).map((_, index) => (
            <div 
              key={index} 
              className="animate-pulse-scale"
              style={{ 
                animationDelay: `${Math.random() * 5}s`,
                backgroundColor: index % 5 === 0 ? '#6E59A5' : index % 3 === 0 ? '#D946EF' : '#F97316',
                opacity: Math.random() * 0.5,
                borderRadius: '50%',
                transform: 'scale(0.5)',
                margin: '10%'
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-white mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Play Games. <span className="text-game-secondary">Enjoy Music.</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-lg opacity-90">
              Ready, Set, Play combines your favorite mini-games with a seamless music experience. No more switching apps - play and listen all in one place!
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-game-secondary hover:bg-game-secondary/90 text-white">
                <Link to="/games">
                  Play Now <ArrowRight className="ml-2" size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-game-primary">
                <Link to="/music">
                  Browse Music
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 md:w-72 md:h-72 animate-float">
              <div className="absolute inset-0 rounded-2xl bg-game-secondary/20 rotate-45 transform scale-90"></div>
              <div className="absolute inset-0 rounded-2xl bg-game-accent/20 rotate-12 transform scale-95"></div>
              <div className="absolute inset-0 bg-white rounded-2xl shadow-xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Gamepad className="text-game-primary h-16 w-16" />
                  </div>
                  <h3 className="text-xl font-bold text-game-primary">Ready, Set, Play</h3>
                  <p className="text-gray-600 mt-2">Your entertainment hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
