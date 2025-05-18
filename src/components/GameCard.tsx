
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  genre: string;
}

const GameCard: React.FC<GameCardProps> = ({ id, title, description, imageUrl, genre }) => {
  return (
    <Link to={`/game/${id}`}>
      <Card className="game-card h-full">
        <div className="overflow-hidden rounded-lg">
          <img 
            src={imageUrl} 
            alt={title}
            className="game-card-img transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardContent className="pt-3 pb-1 px-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
            <span className="text-xs py-1 px-2 bg-game-muted text-game-primary rounded-full">
              {genre}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GameCard;
