import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Gamepad, Music, Users } from 'lucide-react';

const AboutPage = () => {
  const [feedback, setFeedback] = useState('');
  const [comments, setComments] = useState<{id:number, comment:string, username?:string, avatar_url?:string, created_at:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:3001/feedback');
        if (!res.ok) throw new Error('Failed to fetch comments');
        const data = await res.json();
        setComments(data);
      } catch (err: any) {
        setError(err.message || 'Error loading comments');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    // Always get the latest user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const username = user?.username || user?.name || 'Anonymous';
    const avatar_url = user?.avatar_url || null;
    console.log('Submitting feedback:', { comment: feedback, username, avatar_url });
    try {
      const res = await fetch('http://localhost:3001/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: feedback, username, avatar_url })
      });
      if (!res.ok) throw new Error('Failed to submit comment');
      const data = await res.json();
      setComments([{ id: data.id, comment: data.comment, username: data.username, avatar_url: data.avatar_url, created_at: new Date().toISOString() }, ...comments]);
      setFeedback('');
    } catch (err: any) {
      setError(err.message || 'Error submitting comment');
    }
  };

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
            <p className="text-violet-400 font-medium">© 2025 The Three Stooges. All rights reserved.</p>
          </div>

          {/* Feedback/Comment Section */}
          <div className="bg-card rounded-xl p-8 mt-12 border border-violet-700/30">
            <h2 className="text-2xl font-bold mb-4 text-white">Feedback & Comments</h2>
            <form onSubmit={handleSubmit} className="mb-6">
              <textarea
                className="w-full p-3 rounded-lg border border-violet-700/30 bg-background text-foreground resize-none mb-4"
                rows={3}
                placeholder="Leave your feedback or comment..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-game-secondary hover:bg-game-secondary/90 text-game-background font-semibold px-6 py-2 rounded-lg shadow"
              >
                Submit
              </button>
            </form>
            <div className="text-left">
              {loading ? (
                <p className="text-muted-foreground">Loading comments...</p>
              ) : error ? (
                <p className="text-destructive">{error}</p>
              ) : comments.length === 0 ? (
                <p className="text-muted-foreground">No comments yet. Be the first to leave feedback!</p>
              ) : (
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li key={c.id} className="bg-background rounded-lg p-4 border border-violet-700/10 flex items-center gap-3">
                      <img
                        src={
                          c.avatar_url
                            ? (c.avatar_url.startsWith('http')
                                ? c.avatar_url
                                : `http://localhost:3001${c.avatar_url}`)
                            : `https://api.dicebear.com/7.x/identicon/svg?seed=${c.username || 'Anonymous'}`
                        }
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <span className="font-semibold text-violet-400">{c.username || 'Anonymous'}:</span>
                        <span className="text-foreground ml-2">{c.comment}</span>
                        <div className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
