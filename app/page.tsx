'use client';

import React, { useState, useEffect } from 'react';
import Game from '@/components/Game';

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the leaderboard from our fixed API
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Leaderboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-red-600">TRENCH SNIPER</h1>
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Game onGameOver={fetchLeaderboard} />
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-xl font-bold mb-4 border-b border-zinc-700 pb-2">TRENCH LEGENDS</h2>
          {loading ? (
            <p className="text-zinc-500 italic">Loading scores...</p>
          ) : (
            <ul className="space-y-2">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{i + 1}. {entry.member}</span>
                    <span className="font-mono text-red-500">{entry.score}</span>
                  </li>
                ))
              ) : (
                <p className="text-zinc-600">No legends yet.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
