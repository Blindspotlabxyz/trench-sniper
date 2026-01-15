'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Skull, Trophy } from 'lucide-react';

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
  'ALPHA': 'Insider info.', 'BAGHOLDER': 'Holding losers.', 'BTFD': 'Buy The Dip.',
  'DYOR': 'Do Your Own Research.', 'FUD': 'Fear Uncertainty Doubt.', 'GAS': 'Fees.',
  'LAMBO': 'When lambo?', 'NGMI': 'Not Gonna Make It.', 'NORMIE': 'Non-crypto person.',
  'PUMP': 'Price up.', 'DUMP': 'Price down.', 'SATS': 'Smallest BTC unit.',
  'STABLE': 'USD pegged.', 'VAPORWARE': 'No product.', 'WEN': 'Asking for dates.',
  'ZAP': 'Instaswap.', 'DAO': 'Community org.', 'DEFI': 'Finance apps.',
  'ORACLE': 'Data feed.', 'TVL': 'Total Value Locked.', 'WEB3': 'New internet.',
  'MINTING': 'Generating.', 'PFP': 'Profile Pic.', 'MOONBOY': 'Bullish anon.'
};

const RUG_MESSAGES = ["YOU BOUGHT THE TOP.", "EXIT LIQUIDITY DETECTED.", "DEV IS DED. KEK.", "KEK YOU'RE DED.", "THANKS FOR THE SOL, JEET."];
const TOP_CLOUT = ["TRENCH GOD 👑", "AURA MAXIMIZED ⚡", "LIQUIDITY KING 💎"];
const MID_CLOUT = ["WHALE IN TRAINING 🐋", "ALPHA FINDER"];
const LOW_CLOUT = ["TRENCH GRINDER ⚔️", "EXIT LIQUIDITY 💀"];

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
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const tileIdCounter = useRef(0);

  useEffect(() => {
    document.title = "TRENCH SNIPER";
    setHasMounted(true);
    const saved = localStorage.getItem('trench_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      let formatted: LeaderboardEntry[] = Array.isArray(data) ? (typeof data[0] === 'object' ? data : []) : [];
      setLeaderboard(formatted.sort((a, b) => b.score - a.score));
    } catch (e) { console.error(e); }
  }, []);

  const triggerGameOver = useCallback(async () => {
    setRugQuote(RUG_MESSAGES[Math.floor(Math.random() * RUG_MESSAGES.length)]);
    if (score > highScore) { setHighScore(score); localStorage.setItem('trench_highscore', score.toString()); }
    if (score > 0) {
      await fetch('/api/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, score }) });
    }
    setGameState('gameOver');
    fetchLeaderboard();
  }, [score, highScore, username, fetchLeaderboard]);

  useEffect(() => {
    if (gameState === 'playing' && hasMounted) {
      gameLoopRef.current = setInterval(() => {
        setTiles(prev => {
          let baseSpeed = 3.5 + (score * 0.08);
          const updated = prev.map(t => ({ ...t, y: t.y + baseSpeed }));
          if (updated.some(t => t.y >= 96 && t.type === 'green')) { triggerGameOver(); return []; }
          if (Math.random() < 0.08) {
            const allTerms = Object.keys(DICTIONARY);
            const isGreen = Math.random() > 0.4;
            updated.push({ id: tileIdCounter.current++, term: isGreen ? allTerms[Math.floor(Math.random() * allTerms.length)] : 'RUG', type: isGreen ? 'green' : 'red', lane: Math.floor(Math.random() * 4), y: -15 });
          }
          return updated.filter(t => t.y < 105);
        });
      }, 50);
      return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
    }
  }, [gameState, hasMounted, score, triggerGameOver]);

  const handleSnipe = (tile: Tile) => {
    if (tile.type === 'red') triggerGameOver();
    else {
      setScore(s => s + 1); setFlash(true);
      setPopup({ term: tile.term, def: DICTIONARY[tile.term] || 'Safe!' });
      setTiles(prev => prev.filter(t => t.id !== tile.id));
      setTimeout(() => setFlash(false), 100);
    }
  };

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', height: '100dvh', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
      
      {/* HEADER (6vh) */}
      <header style={{ height: '6vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: BRAND_COLOR, fontSize: '1.2rem', fontWeight: '900', fontStyle: 'italic' }}>TRENCH SNIPER</h1>
      </header>

      {/* INTEL FEED BOX (12vh) - OPTIMIZED FOR MOBILE STANDOUT */}
      <div style={{ height: '12vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 15px' }}>
          <div style={{ 
            width: '100%', height: '85%', backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '10px', boxShadow: `0 0 15px ${BRAND_COLOR}11`
          }}>
            {popup ? (
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
                <span style={{ color: BRAND_COLOR, fontWeight: 'bold', fontSize: '13px', display: 'block' }}>{popup.term}</span>
                <span style={{ color: '#aaa', fontSize: '11px' }}>{popup.def}</span>
              </div>
            ) : (
              <span style={{ color: '#333', fontSize: '10px', letterSpacing: '1px' }}>SNIPE FOR INTEL...</span>
            )}
          </div>
      </div>

      {/* GAME AREA (72vh) */}
      <main style={{ height: '72vh', width: '100%', maxWidth: '420px', position: 'relative', padding: '5px' }}>
        {gameState === 'playing' ? (
          <div style={{ width: '100%', height: '100%', border: flash ? `2px solid ${BRAND_COLOR}` : '1px solid #151515', position: 'relative', overflow: 'hidden', background: '#030303', borderRadius: '16px' }}>
            {tiles.map(tile => (
              <div key={tile.id} onPointerDown={() => handleSnipe(tile)} style={{
                  position: 'absolute', top: `${tile.y}%`, left: `${tile.lane * 25}%`, width: '23%', padding: '15px 0',
                  textAlign: 'center', border: `1px solid ${tile.type === 'green' ? '#22c55e' : '#ef4444'}`,
                  color: tile.type === 'green' ? '#22c55e' : '#ef4444', fontSize: '10px', fontWeight: '900',
                  backgroundColor: 'rgba(0,0,0,0.95)', borderRadius: '8px', marginLeft: '1%', zIndex: 10
              }}>{tile.term}</div>
            ))}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
             {gameState === 'identity' ? (
               <div style={{ width: '100%', border: `1px solid ${BRAND_COLOR}`, padding: '25px', textAlign: 'center', background: '#050505', borderRadius: '20px' }}>
                  <p style={{fontSize: '10px', color: BRAND_COLOR, marginBottom: '10px'}}>IDENTITY VERIFICATION</p>
                  <input style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #222', color: '#fff', marginBottom: '15px', textAlign: 'center', borderRadius: '10px', outline: 'none' }} placeholder="@X_HANDLE" value={username} onChange={(e) => setUsername(e.target.value)} />
                  <button onClick={() => username && setGameState('playing')} style={{ width: '100%', padding: '15px', background: BRAND_COLOR, color: '#fff', fontWeight: 'bold', borderRadius: '10px' }}>ENTER</button>
               </div>
             ) : (
               <div style={{ width: '100%', border: '1px solid #ef4444', padding: '25px', textAlign: 'center', background: '#050505', borderRadius: '20px' }}>
                  <Skull color="#ef4444" style={{margin: '0 auto 10px'}} />
                  <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '15px' }}>"{rugQuote}"</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>SCORE: {score}</p>
                  <button onClick={() => { setScore(0); setTiles([]); setGameState('playing'); }} style={{ width: '100%', padding: '15px', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '10px' }}>RETRY</button>
               </div>
             )}
          </div>
        )}
      </main>

      {/* FOOTER (10vh) */}
      <footer style={{ height: '10vh', fontSize: '9px', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
        <span>PB: {highScore}</span>
        <div style={{ width: '1px', height: '10px', background: '#222' }} />
        <a href="https://x.com/MojeebHQ" style={{ color: BRAND_COLOR, textDecoration: 'none' }}>@MOJEEBHQ</a>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
