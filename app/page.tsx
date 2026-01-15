'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Skull, ShieldCheck } from 'lucide-react';

const BRAND_COLOR = '#4e24cf';

const DICTIONARY: Record<string, string> = {
  'WAGMI': 'We All Gonna Make It.', 'REKT': 'Total loss.', 'HODL': 'Hold On for Dear Life.',
  'LFG': 'Lets F***ing Go!', 'RUG': 'Rug Pull.', 'MOON': 'Price pumping.',
  'APE IN': 'Buying without research.', 'FOMO': 'Fear Of Missing Out.', 'WHALE': 'Huge capital.',
  'DEGEN': 'High-risk trader.', 'DIAMOND HANDS': 'Refusing to sell.', 'SAFU': 'Funds are safe.',
  'JEET': 'Selling too fast.', 'SHITCOIN': 'Zero utility coin.', 'YOLO': 'You Only Live Once.',
  'DEX': 'Decentralized Exchange.', 'LIQUIDITY': 'Pool funds.', 'MINT': 'Create NFT.',
  'ALPHA': 'Insider info.', 'BAGHOLDER': 'Holding losers.', 'BTFD': 'Buy The Dip.'
};

export default function TrenchSniper() {
  const [hasMounted, setHasMounted] = useState(false);
  const [gameState, setGameState] = useState<'identity' | 'playing' | 'gameOver'>('identity');
  const [username, setUsername] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [tiles, setTiles] = useState<any[]>([]);
  const [flash, setFlash] = useState(false);
  const [popup, setPopup] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [globalRank, setGlobalRank] = useState<number | null>(null);

  const gameLoopRef = useRef<any>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeaderboard(data);
        if (username) {
          const idx = data.findIndex(e => e.username?.toLowerCase() === username.toLowerCase());
          setGlobalRank(idx !== -1 ? idx + 1 : null);
        }
      }
    } catch (e) { console.error("Leaderboard sync pending..."); }
  }, [username]);

  useEffect(() => {
    setHasMounted(true);
    const saved = localStorage.getItem('trench_highscore');
    if (saved) setHighScore(parseInt(saved));
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const triggerGameOver = useCallback(async () => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('trench_highscore', score.toString());
    }
    setGameState('gameOver');
    if (score > 0 && username) {
      // POSTing to your existing leaderboard route
      await fetch('/api/leaderboard', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score }) 
      });
      fetchLeaderboard();
    }
  }, [score, highScore, username, fetchLeaderboard]);

  useEffect(() => {
    if (gameState === 'playing' && hasMounted) {
      gameLoopRef.current = setInterval(() => {
        setTiles(prev => {
          let baseSpeed = 4.2 + (score * 0.08);
          const updated = prev.map(t => ({ ...t, y: t.y + baseSpeed }));
          if (updated.some(t => t.y >= 98 && t.type === 'green')) { 
            clearInterval(gameLoopRef.current);
            triggerGameOver(); 
            return []; 
          }
          if (Math.random() < 0.08) {
            const all = Object.keys(DICTIONARY);
            const isG = Math.random() > 0.45;
            updated.push({ id: Math.random(), term: isG ? all[Math.floor(Math.random() * all.length)] : 'RUG', type: isG ? 'green' : 'red', lane: Math.floor(Math.random() * 4), y: -10 });
          }
          return updated.filter(t => t.y < 105);
        });
      }, 50);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [gameState, hasMounted, score, triggerGameOver]);

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', height: '100vh', width: '100vw', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      
      {/* 1. TOP INTEL (15% height) */}
      <div style={{ height: '15vh', width: '100%', padding: '10px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: '#080808', border: '1px solid #1a1a1a', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            {popup ? (
              <div style={{ animation: 'fadeIn 0.2s ease-in' }}>
                <div style={{ color: BRAND_COLOR, fontWeight: 'bold', fontSize: '14px' }}>{popup.term}</div>
                <div style={{ color: '#aaa', fontSize: '10px' }}>{popup.def}</div>
              </div>
            ) : <div style={{ color: '#222', fontSize: '9px', letterSpacing: '2px' }}>AWAITING INTEL...</div>}
          </div>
      </div>

      {/* 2. GAME WINDOW (65% height) */}
      <main style={{ height: '65vh', width: '100%', maxWidth: '420px', margin: '0 auto', position: 'relative' }}>
        {gameState === 'playing' ? (
          <div style={{ width: '100%', height: '100%', border: flash ? `2px solid ${BRAND_COLOR}` : '1px solid #151515', position: 'relative', overflow: 'hidden', background: '#030303', borderRadius: '16px' }}>
            <div style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '24px', fontWeight: 'bold', opacity: 0.1 }}>{score}</div>
            {tiles.map(tile => (
              <div key={tile.id} onPointerDown={() => {
                if (tile.type === 'red') triggerGameOver();
                else {
                  setScore(s => s + 1); setFlash(true);
                  setPopup({ term: tile.term, def: DICTIONARY[tile.term] });
                  setTiles(prev => prev.filter(t => t.id !== tile.id));
                  setTimeout(() => setFlash(false), 100);
                }
              }} style={{ position: 'absolute', top: `${tile.y}%`, left: `${tile.lane * 25}%`, width: '23%', padding: '15px 0', textAlign: 'center', border: `1px solid ${tile.type === 'green' ? '#22c55e' : '#ef4444'}`, color: tile.type === 'green' ? '#22c55e' : '#ef4444', fontSize: '10px', fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: '8px', cursor: 'pointer', touchAction: 'none' }}>{tile.term}</div>
            ))}
          </div>
        ) : (
          <div style={{ height: '100%', padding: '0 10px', display: 'flex', flexDirection: 'column' }}>
            {gameState === 'identity' ? (
              <div style={{ border: `1px solid ${BRAND_COLOR}`, padding: '25px', textAlign: 'center', background: '#050505', borderRadius: '20px', marginTop: '20px' }}>
                <ShieldCheck color={BRAND_COLOR} size={32} style={{margin: '0 auto 10px'}} />
                <input style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #222', color: '#fff', marginBottom: '15px', textAlign: 'center', borderRadius: '10px', outline: 'none' }} placeholder="@X_HANDLE" value={username} onChange={(e) => setUsername(e.target.value)} />
                <button onClick={() => username && setGameState('playing')} style={{ width: '100%', padding: '15px', background: BRAND_COLOR, color: '#fff', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer' }}>ENTER TRENCHES</button>
              </div>
            ) : (
              <div style={{ flex: 1, border: '1px solid #ef4444', padding: '15px', background: '#050505', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Skull color="#ef4444" size={20} style={{margin: '0 auto 5px'}} />
                <div style={{ flex: 1, overflowY: 'auto', margin: '10px 0', background: '#000', borderRadius: '8px', padding: '10px', border: '1px solid #111' }}>
                  <table style={{ width: '100%', fontSize: '11px', textAlign: 'left' }}>
                    <tbody>
                      {leaderboard.slice(0, 15).map((e, i) => (
                        <tr key={i} style={{ color: e.username?.toLowerCase() === username.toLowerCase() ? BRAND_COLOR : '#ccc' }}>
                          <td style={{padding: '4px 0'}}>#{i+1} {e.username?.slice(0, 12)}</td>
                          <td style={{textAlign: 'right'}}>{e.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button onClick={() => window.location.reload()} style={{ flex: 1, padding: '15px', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer' }}>RETRY</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. FOOTER (20% height) */}
      <footer style={{ height: '20vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div style={{ animation: 'blink 2s infinite', fontSize: '9px', color: BRAND_COLOR, border: `1px solid ${BRAND_COLOR}44`, padding: '2px 10px', marginBottom: '8px', fontWeight: '900' }}>ONCHAIN</div>
        <div style={{ fontSize: '10px', color: '#444' }}>PB: {highScore} | RANK: #{globalRank || '--'}</div>
        <a href="https://x.com/MojeebHQ" target="_blank" style={{ color: BRAND_COLOR, fontSize: '10px', fontWeight: 'bold', marginTop: '6px', textDecoration: 'none' }}>BUILT BY @MOJEEBHQ</a>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
