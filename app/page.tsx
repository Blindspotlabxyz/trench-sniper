'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Skull, Trophy } from 'lucide-react';

const BRAND_COLOR = '#4e24cf';

// --- INTERFACES (Fixed the missing Type error) ---
interface Tile { 
  id: number; 
  term: string; 
  type: 'green' | 'red'; 
  lane: number; 
  y: number; 
}

interface LeaderboardEntry { 
  username: string; 
  score: number; 
}

// --- CONSTANTS ---
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

const RUG_MESSAGES = [
  "YOU BOUGHT THE TOP.", "YOU'RE SO DOOMED, PACK EVERYTHING.", "DON'T SLEEP, WORK HARD.",
  "YOU RAN OUT OF REACH.", "ONLY LEGEND HERE, PLS.", "NOT FOR YAPPERS.",
  "TO KNOW IS TO BE FREE.", "WHERE IS YOUR AURA?", "NO AURA, YOU CAN DO BETTER.",
  "YOU'RE JUST AN EXIT LIQUIDITY.", "DEV IS DED. KEK.", "KEK YOU'RE DED.",
  "THANK YOU FOR YOUR ATTENTION.", "EXIT LIQUIDITY DETECTED.", "THANKS FOR THE SOL, JEET."
];

const TOP_CLOUT = ["TRENCH GOD 👑", "AURA MAXIMIZED ⚡", "VITALIK'S CHOSEN ONE", "LIQUIDITY KING 💎", "SMART MONEY 🧠"];
const MID_CLOUT = ["WHALE IN TRAINING 🐋", "ALPHA FINDER", "GIGA CHAD ENERGY", "DIAMOND HANDS"];
const LOW_CLOUT = ["TRENCH GRINDER ⚔️", "EXIT LIQUIDITY 💀", "JEET DETECTED", "NORMIE TIER"];

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
    document.title = "TRENCH SNIPER | Master Web3 Terms While You Play";
    setHasMounted(true);
    const saved = localStorage.getItem('trench_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      let formatted: LeaderboardEntry[] = Array.isArray(data) ? (typeof data[0] === 'object' ? data : []) : [];
      const sortedList = formatted.sort((a, b) => b.score - a.score);
      setLeaderboard(sortedList);
      if (username) {
        const myIndex = sortedList.findIndex(e => e.username.toLowerCase() === username.toLowerCase());
        if (myIndex !== -1) setGlobalRank(myIndex + 1);
      }
    } catch (e) { console.error(e); }
  }, [username]);

  const triggerGameOver = useCallback(async () => {
    setRugQuote(RUG_MESSAGES[Math.floor(Math.random() * RUG_MESSAGES.length)]);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('trench_highscore', score.toString());
    }
    if (score > 0) {
      try {
        await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, score }),
        });
      } catch (e) { console.error(e); }
    }
    setGameState('gameOver');
    fetchLeaderboard();
  }, [highScore, score, username, fetchLeaderboard]);

  const shareToX = () => {
    const gameUrl = typeof window !== 'undefined' ? window.location.origin : '';
    let rankTitle = "";
    if (globalRank && globalRank <= 10) rankTitle = TOP_CLOUT[Math.floor(Math.random() * TOP_CLOUT.length)];
    else if (globalRank && globalRank <= 100) rankTitle = MID_CLOUT[Math.floor(Math.random() * MID_CLOUT.length)];
    else rankTitle = LOW_CLOUT[Math.floor(Math.random() * LOW_CLOUT.length)];
    const shareText = `${rankTitle}\nSniper: ${username}\nScore: ${score} on Trench Sniper 🎯\n\n"${rugQuote}"\n\nMastering Web3 terms and dodging rugs. ⚔️\n\nPlay here: ${gameUrl}\n\nBuilt by @MojeebHQ`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  useEffect(() => {
    if (gameState === 'playing' && hasMounted) {
      gameLoopRef.current = setInterval(() => {
        setTiles(prev => {
          let baseSpeed = 3.5 + (score * 0.08);
          const updated = prev.map(t => ({ ...t, y: t.y + baseSpeed }));
          if (updated.some(t => t.y >= 96 && t.type === 'green')) {
            triggerGameOver();
            return [];
          }
          if (Math.random() < 0.08) {
            const allTerms = Object.keys(DICTIONARY);
            const isGreen = Math.random() > 0.4;
            const term = isGreen ? allTerms[Math.floor(Math.random() * allTerms.length)] : 'RUG';
            updated.push({
              id: tileIdCounter.current++,
              term,
              type: isGreen ? 'green' : 'red',
              lane: Math.floor(Math.random() * 4),
              y: -15
            });
          }
          return updated.filter(t => t.y < 105);
        });
      }, 50);
      return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
    }
  }, [gameState, hasMounted, score, triggerGameOver]);

  const handleSnipe = (tile: Tile) => {
    if (tile.type === 'red') {
      triggerGameOver();
    } else {
      setScore(s => s + 1);
      setFlash(true);
      setPopup({ term: tile.term, def: DICTIONARY[tile.term] || 'Safe!' });
      setTiles(prev => prev.filter(t => t.id !== tile.id));
      setTimeout(() => setFlash(false), 100);
    }
  };

  if (!hasMounted) return <div style={{ background: '#000', minHeight: '100vh' }} />;

  return (
    <div style={{ 
      backgroundColor: '#000', color: '#fff', height: '100vh', 
      fontFamily: 'monospace', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', userSelect: 'none', touchAction: 'none', overflow: 'hidden' 
    }}>
      
      {/* 1. HEADER (8vh) */}
      <header style={{ height: '8vh', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ color: BRAND_COLOR, fontSize: '1.4rem', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>TRENCH SNIPER</h1>
      </header>

      {/* 2. THE "5" ZONE: INTEL FEED (10vh) */}
      <div style={{ height: '10vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', borderBottom: '1px solid #111' }}>
          {popup ? (
            <div style={{ textAlign: 'center', padding: '0 20px', animation: 'slideDown 0.2s ease-out' }}>
              <span style={{ color: BRAND_COLOR, fontWeight: 'bold', fontSize: '12px' }}>{popup.term}: </span>
              <span style={{ color: '#888', fontSize: '11px' }}>{popup.def}</span>
            </div>
          ) : (
            <span style={{ color: '#222', fontSize: '10px', letterSpacing: '2px' }}>AWAITING INTEL...</span>
          )}
      </div>

      {/* 3. THE "70" ZONE: GAME AREA */}
      <main style={{ flex: 1, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 0' }}>
        {gameState === 'playing' ? (
          <div style={{ 
              width: '94%', height: '70vh', margin: '0 auto', border: flash ? `2px solid ${BRAND_COLOR}` : '1px solid #222', 
              position: 'relative', overflow: 'hidden', background: '#050505', borderRadius: '16px'
          }}>
            {tiles.map(tile => (
              <div key={tile.id} onPointerDown={() => handleSnipe(tile)} style={{
                  position: 'absolute', top: `${tile.y}%`, left: `${tile.lane * 25}%`, width: '23%', padding: '14px 0',
                  textAlign: 'center', cursor: 'pointer', border: `1px solid ${tile.type === 'green' ? '#22c55e' : '#ef4444'}`,
                  color: tile.type === 'green' ? '#22c55e' : '#ef4444', fontSize: '9px', fontWeight: '900',
                  backgroundColor: 'rgba(0,0,0,0.95)', borderRadius: '8px', marginLeft: '1%', zIndex: 10
              }}>{tile.term}</div>
            ))}
          </div>
        ) : gameState === 'identity' ? (
          <div style={{ border: `2px solid ${BRAND_COLOR}`, padding: '30px', textAlign: 'center', background: '#0a0a0a', borderRadius: '24px', margin: '20px' }}>
            <p style={{fontSize: '10px', color: BRAND_COLOR, marginBottom: '10px' }}>@X_HANDLE REQUIRED</p>
            <input style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #333', color: BRAND_COLOR, marginBottom: '20px', textAlign: 'center', borderRadius: '12px' }} 
                   placeholder="@username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <button onClick={() => username && setGameState('playing')} style={{ width: '100%', padding: '16px', background: BRAND_COLOR, color: '#fff', fontWeight: 'bold', borderRadius: '12px' }}>ENTER TRENCHES</button>
          </div>
        ) : (
          <div style={{ border: '2px solid #ef4444', padding: '20px', textAlign: 'center', background: '#0a0a0a', borderRadius: '24px', margin: '20px' }}>
            <Skull color="#ef4444" size={24} style={{margin: '0 auto 10px'}} />
            <h2 style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '900', marginBottom: '10px' }}>"{rugQuote}"</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '15px', fontWeight: 'bold' }}>SCORE: {score}</p>
            <button onClick={shareToX} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #1DA1F2', color: '#1DA1F2', fontWeight: 'bold', marginBottom: '10px', borderRadius: '12px' }}>SHARE TO COPE</button>
            <button onClick={() => { setScore(0); setTiles([]); setGameState('playing'); }} style={{ width: '100%', padding: '16px', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '12px' }}>LOCKED IN</button>
          </div>
        )}
      </main>

      {/* FOOTER (6vh) */}
      <footer style={{ height: '6vh', fontSize: '8px', color: '#222', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>BLINDSPOT LABS</span>
        <a href="https://x.com/MojeebHQ" style={{ color: BRAND_COLOR, textDecoration: 'none' }}>@MOJEEBHQ</a>
      </footer>

      <style>{`
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
