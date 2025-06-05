import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { gamesData } from '@/data/gamesData';
import { Gamepad } from 'lucide-react';

const API_URL = 'http://localhost:3001';

const LeaderboardPage = () => {
  const [gameId, setGameId] = useState('catch-game'); // default game
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_URL}/leaderboard/${gameId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return res.json();
      })
      .then(data => {
        setScores(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not load leaderboard. Please try again later.');
        setScores([]);
        setLoading(false);
      });
  }, [gameId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-6 py-12 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-gradient-violet">Leaderboard</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar search bar */}
          <aside className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
            <div className="bg-card border border-border rounded-lg shadow-sm px-4 py-5 flex flex-col items-start gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Gamepad className="text-game-secondary" size={24} />
                <span className="font-medium text-lg">Select Game</span>
              </div>
              <select
                value={gameId}
                onChange={e => setGameId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                {gamesData.map(game => (
                  <option key={game.id} value={game.id}>{game.title}</option>
                ))}
              </select>
            </div>
          </aside>
          {/* Main leaderboard content */}
          <section className="flex-1">
            {loading ? (
              <div className="text-center text-violet-300 py-8">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-400 py-8">{error}</div>
            ) : (
              <table className="w-full bg-card rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left">#</th>
                    <th className="py-2 px-4 text-left">Username</th>
                    <th className="py-2 px-4 text-left">Score</th>
                    <th className="py-2 px-4 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((entry, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-4">{idx + 1}</td>
                      <td className="py-2 px-4">{entry.username}</td>
                      <td className="py-2 px-4">{entry.score}</td>
                      <td className="py-2 px-4">{new Date(entry.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {scores.length === 0 && !loading && !error && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-violet-300">No scores yet for this game.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
