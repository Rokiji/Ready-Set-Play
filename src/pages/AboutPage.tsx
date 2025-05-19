
import React from 'react';
import Navbar from '@/components/Navbar';
import MusicPlayer from '@/components/MusicPlayer';
import { Gamepad, Music, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-white">About Ready, Set, Play</h1>
          
          <div className="bg-card rounded-xl shadow-lg p-8 mb-12 border border-violet-700/30">
            <p className="text-lg mb-6 text-foreground">
              Ready, Set, Play is a web-based entertainment platform that combines gaming and music in one seamless experience. Our mission is to provide users with an all-in-one solution for entertainment, eliminating the need to switch between multiple applications.
            </p>
            
            <p className="text-lg mb-6 text-foreground">
              Developed by The Three Stooges, our platform features a variety of mini-games across different genres while allowing users to enjoy their favorite music simultaneously. Whether you're solving puzzles, testing your reflexes, or enjoying casual gameplay, your personalized soundtrack is always just a click away.
            </p>
            
            <p className="text-lg text-foreground">
              We believe that gaming and music are natural companions, enhancing each other to create a more immersive and enjoyable experience. Ready, Set, Play is designed to be accessible, user-friendly, and fun for players of all ages and skill levels.
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Our Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg shadow-md text-center border border-violet-700/30">
              <div className="w-16 h-16 bg-violet-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad className="text-violet-400 h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Diverse Game Library</h3>
              <p className="text-foreground">
                Explore a growing collection of mini-games spanning multiple genres, from action and puzzle to racing and educational games.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md text-center border border-violet-700/30">
              <div className="w-16 h-16 bg-violet-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="text-violet-400 h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Integrated Music Player</h3>
              <p className="text-foreground">
                Play, pause, skip, and control your music without leaving your game, creating a personalized entertainment experience.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md text-center border border-violet-700/30">
              <div className="w-16 h-16 bg-violet-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-violet-400 h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Community Features</h3>
              <p className="text-foreground">
                Connect with other players, challenge friends, and compete on leaderboards across various games.
              </p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-8 text-center border border-violet-700/30">
            <h2 className="text-2xl font-bold mb-4 text-white">Meet The Team</h2>
            <p className="mb-6 text-foreground">Ready, Set, Play was created by The Three Stooges, a passionate team of developers and gaming enthusiasts.</p>
            <p className="text-violet-400 font-medium">© 2023 The Three Stooges. All rights reserved.</p>
          </div>
        </div>
      </main>
      
      <MusicPlayer />
    </div>
  );
};

export default AboutPage;
