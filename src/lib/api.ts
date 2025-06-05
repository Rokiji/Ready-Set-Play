export async function submitScore({ game_id, user_id, username, score }: {
  game_id: string;
  user_id: number;
  username: string;
  score: number;
}) {
  const res = await fetch('http://localhost:3001/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_id, user_id, username, score }),
  });
  return res.json();
} 