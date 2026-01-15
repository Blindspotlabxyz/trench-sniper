'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Skull, Trophy } from 'lucide-react';

const BRAND_COLOR = '#4e24cf';

// Dictionary and Slang Logic...
const DICTIONARY: Record<string, string> = { /* ... terms ... */ };
const RUG_MESSAGES = [ /* ... quotes ... */ ];
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
  }, []);

  const shareToX = () => {
    const gameUrl = typeof window !== 'undefined' ? window.location.origin : '';
    let rankTitle = "";
    if (globalRank && globalRank <= 10) rankTitle = TOP_CLOUT[Math.floor(Math.random() * TOP_CLOUT.length)];
    else if (globalRank && globalRank <= 100) rankTitle = MID_CLOUT[Math.floor(Math.random() * MID_CLOUT.length)];
    else rankTitle = LOW_CLOUT[Math.floor(Math.random() * LOW_CLOUT.length)];
    const shareText = `${rankTitle}\nSniper: ${username}\nScore: ${score} on Trench Sniper 🎯\n\n"${rugQuote}"\n\nMastering Web3 terms and dodging rugs. ⚔️\n\nPlay here: ${gameUrl}\n\nBuilt by @MojeebHQ`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleSnipe = (tile: Tile) => {
    if (tile.type === 'red') {
      // Game Over Trigger
    } else {
      setScore(s => s + 1);
      setFlash(true);
      setPopup({ term: tile.term, def: DICTIONARY[tile.term] || 'Safe!' });
      setTiles(prev => prev.filter(t => t.id !== tile.id));
    }
  };

  if (!hasMounted) return <div style={{ background: '#000', minHeight: '100vh' }} />;

  return (
    <div style={{ 
      backgroundColor: '#000', color: '#fff', height: '100vh', 
      fontFamily: 'monospace', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', userSelect: 'none', touchAction: 'none', overflow: 'hidden' 
    }}>
      
      {/* 1. BRANDING & STATUS (TOP) */}
      <header style={{ height: '8vh', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ color: BRAND_COLOR, fontSize: '1.4rem', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>TRENCH SNIPER</h1>
        <div style={{ fontSize: '9px', color: '#444' }}>PB: {highScore} | SNIPER: {username || 'ANON'}</div>
      </header>

      {/* 2. THE "5" ZONE: MEANING AREA (TOP OF GAME) */}
      <div style={{ 
          height: '10vh', width: '100%', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', borderBottom: '1px solid #111', background: '#080808' 
      }}>
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
      <div style={{ flex: 1, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 0' }}>
        
        {gameState === 'playing' ? (
          <div style={{ 
              width: '94%', height: '70vh', margin: '0 auto', border: flash ? `2px solid ${BRAND_COLOR}` : '1px solid #222', 
              position: 'relative', overflow: 'hidden', background: '#050505', borderRadius: '16px', transition: 'border 0.1s'
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
        ) : (
          <div style={{ padding: '20px' }}>
            {/* Identity/GameOver screens stay consistent with your brand */}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ height: '6vh', fontSize: '8px', color: '#222', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>BLINDSPOT LABS</span>
        <div style={{ width: '4px', height: '4px', background: '#ef4444', borderRadius: '50%' }} />
        <a href="https://x.com/MojeebHQ" style={{ color: BRAND_COLOR, textDecoration: 'none' }}>@MOJEEBHQ</a>
      </footer>

      <style>{`
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
