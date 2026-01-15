'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Skull, ShieldCheck, Loader2 } from 'lucide-react';

const BRAND_COLOR = '#4e24cf';

interface Tile { id: number; term: string; type: 'green' | 'red'; lane: number; y: number; }
interface LeaderboardEntry { username: string; score: number; }

const DICTIONARY: Record<string, string> = {
  'WAGMI': 'We All Gonna Make It.', 'REKT': 'Total loss.', 'HODL': 'Hold On for Dear Life.',
  'LFG': 'Lets F***ing Go!', 'RUG': 'Rug Pull.', 'MOON': 'Price pumping.',
  'APE IN': 'Buying without research.', 'FOMO': 'Fear Of Missing Out.', 'WHALE': 'Huge capital.',
  'DEGEN': 'High-risk trader.', 'DIAMOND HANDS': 'Refusing to sell.', 'SAFU': 'Funds are safe.',
  'JEET': 'Selling too fast.', 'SHITCOIN': 'Zero utility coin.', 'YOLO': 'You Only Live Once.',
  'DEX': 'Decentralized Exchange.', 'LIQUIDITY': 'Pool funds.', 'MINT': 'Create NFT.',
  'ALPHA': 'Insider info.', 'BAGHOLDER': 'Holding losers.', 'BTFD': 'Buy The Dip.'
};

const RUG_MESSAGES = ["EXIT LIQUIDITY DETECTED.", "DEV IS DED. KEK.", "YOU BOUGHT THE TOP.", "NO AURA, DO BETTER."];

export default function TrenchSniper() {
  const [hasMounted, setHasMounted] = useState(false);
  const [gameState, setGameState] = useState<'identity' | 'playing' | 'gameOver'>('identity');
  const [username, setUsername] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flash, setFlash] = useState(false);
  const [rugQuote, setRugQuote] = useState("");
  const [popup, setPopup] = useState<{term: string, def: string} | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const tileIdCounter = useRef(0);

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
    } catch (e) { console.error("Sync Error"); }
  }, [username]);

  useEffect(() => {
    setHasMounted(true);
    const saved = localStorage.getItem('trench_highscore');
    if (saved) setHighScore(parseInt(saved));
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const triggerGameOver = useCallback(async () => {
    setRugQuote(RUG_MESSAGES[Math.floor(Math.random() * RUG_MESSAGES.length)]);
    if (score > highScore) { setHighScore(score); localStorage.setItem('trench_highscore', score.toString()); }
    setGameState('gameOver');
    if (score > 0 && username) {
      setLoading(true);
      await fetch('/api/leaderboard', { method: 'POST', body: JSON.stringify({ username, score }) });
      await fetchLeaderboard();
      setLoading(false);
    }
  }, [score, highScore, username, fetchLeaderboard]);

  useEffect(() => {
    if (gameState === 'playing' && hasMounted) {
      gameLoopRef.current = setInterval(() => {
        setTiles(prev => {
          let baseSpeed = 4.0 + (score * 0.08);
          const updated = prev.map(t => ({ ...t, y: t.y + baseSpeed }));
          if (updated.some(t => t.y >= 96 && t.type === 'green')) { triggerGameOver(); return []; }
          if (Math.random() < 0.08) {
            const allTerms = Object.keys(DICTIONARY);
            const isGreen = Math.random() > 0.4;
            updated.push({ id: tileIdCounter.current++, term: isGreen ? allTerms[Math.floor(Math.random() * allTerms.length)] : 'RUG', type: isGreen ? 'green' : 'red', lane: Math.floor(Math.random() * 4), y: -10 });
          }
          return updated.filter(t => t.y < 100);
        });
      }, 50);
      return () => clearInterval(gameLoopRef.current!);
    }
  }, [gameState, hasMounted, score, triggerGameOver]);

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', height: '100vh', width: '100vw', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'fixed' }}>
      
      {/* 1. MEANING OF THE WORD (Per your draft) */}
      <div style={{ height: '15vh', width: '100%', padding: '10px', flexShrink: 0 }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: '#080808', border: '1px solid #1a1a1a', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            {popup ? (
              <div>
                <span style={{ color: BRAND_COLOR, fontWeight: 'bold', fontSize: '14px' }}>{popup.term}</span><br/>
                <span style={{ color: '#aaa', fontSize: '11px' }}>{popup.def}</span>
              </div>
            ) : <div style={{ color: '#222', fontSize: '10px' }}>INTEL AREA</div>}
          </div>
      </div>

      {/* 2. MAIN GAME AREA (Fixed 65vh) */}
      <main style={{ height: '65vh', width: '100%', maxWidth: '420px', margin: '0 auto', position: 'relative', flexShrink: 0 }}>
        {gameState === 'playing' ? (
          <div style={{ width: '100%', height: '100%', border: flash ? `2px solid ${BRAND_COLOR}` : '1px solid #151515', position: 'relative', overflow: 'hidden', background: '#030303', borderRadius: '16px' }}>
            <div style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '24px', fontWeight: 'bold', opacity: 0.2 }}>{score}</div>
            {tiles.map(tile => (
              <div key={tile.id} onPointerDown={() => {
                if (tile.type === 'red') triggerGameOver();
                else { setScore(s => s + 1); setFlash(true); setPopup({ term: tile.term, def: DICTIONARY[tile.term] }); setTiles(prev => prev.filter(t => t.id !== tile.id)); setTimeout(() => setFlash(false), 100); }
              }} style={{ position: 'absolute', top: `${tile.y}%`, left: `${tile.lane * 25}%`, width: '23%', padding: '15px 0', textAlign: 'center', border: `1px solid ${tile.type === 'green' ? '#22c55e' : '#ef4444'}`, color: tile.type === 'green' ? '#22c55e' : '#ef4444', fontSize: '10px', fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: '8px', cursor: 'pointer' }}>{tile.term}</div>
            ))}
          </div>
        ) : (
          <div style={{ height: '100%', padding: '0 10px', display: 'flex', flexDirection: 'column' }}>
            {gameState === 'identity' ? (
              <div style={{ border: `1px solid ${BRAND_COLOR}`, padding: '20px', textAlign: 'center', background: '#050505', borderRadius: '20px' }}>
                <ShieldCheck color={BRAND_COLOR} style={{margin: '0 auto 10px'}} />
                <input style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #222', color: '#fff', marginBottom: '15px', textAlign: 'center' }} placeholder="@X_HANDLE" value={username} onChange={(e) => setUsername(e.target.value)} />
                <button onClick={() => username && setGameState('playing')} style={{ width: '100%', padding: '15px', background: BRAND_COLOR, color: '#fff', fontWeight: 'bold', width: '100%' }}>SNIPE</button>
              </div>
            ) : (
              <div style={{ flex: 1, border: '1px solid #ef4444', padding: '15px', background: '#050505', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Skull color="#ef4444" style={{margin: '0 auto 5px'}} size={20} />
                <p style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold' }}>"{rugQuote}"</p>
                <div style={{ flex: 1, overflowY: 'auto', margin: '10px 0', background: '#000', borderRadius: '8px', padding: '10px' }}>
                  <table style={{ width: '100%', fontSize: '11px' }}>
                    <tbody>
                      {leaderboard.map((e, i) => (
                        <tr key={i} style={{ color: e.username?.toLowerCase() === username.toLowerCase() ? BRAND_COLOR : '#ccc' }}>
                          <td>#{i+1} {e.username}</td>
                          <td style={{textAlign: 'right'}}>{e.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => { setScore(0); setTiles([]); setGameState('playing'); }} style={{ padding: '12px', background: '#fff', color: '#000', fontWeight: 'bold' }}>RETRY</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. FOOTER (20vh) */}
      <footer style={{ height: '20vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        <div style={{ animation: 'blink 2s infinite', fontSize: '10px', color: BRAND_COLOR, border: `1px solid ${BRAND_COLOR}`, padding: '2px 10px' }}>ONCHAIN</div>
        <div style={{ fontSize: '10px', color: '#444' }}>PB: {highScore} | RANK: #{globalRank || '--'}</div>
      </footer>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
