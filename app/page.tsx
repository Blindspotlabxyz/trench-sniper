'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Skull, Zap, ShieldCheck } from 'lucide-react';

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

const RUG_MESSAGES = [
  "YOU BOUGHT THE TOP.", "YOU'RE SO DOOMED, PACK EVERYTHING.", "DON'T SLEEP, WORK HARD.",
  "YOU RAN OUT OF REACH.", "ONLY LEGEND HERE, PLS.", "NOT FOR YAPPERS.",
  "TO KNOW IS TO BE FREE.", "WHERE IS YOUR AURA?", "NO AURA, YOU CAN DO BETTER.",
  "YOU'RE JUST AN EXIT LIQUIDITY.", "DEV IS DED. KEK.", "KEK YOU'RE DED.",
  "THANK YOU FOR YOUR ATTENTION.", "EXIT LIQUIDITY DETECTED.", "THANKS FOR THE SOL, JEET."
];

const TOP_CLOUT = ["TRENCH GOD 👑", "AURA MAXIMIZED ⚡", "LIQUIDITY KING 💎"];
const MID_CLOUT = ["WHALE IN TRAINING 🐋", "ALPHA FINDER 🔎", "DIAMOND HANDS 💎"];
const LOW_CLOUT = ["TRENCH GRINDER ⚔️", "EXIT LIQUIDITY 💀", "JEET DETECTED 🤡"];

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

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      const sorted = Array.isArray(data) ? data.sort((a, b) => b.score - a.score) : [];
      setLeaderboard(sorted);
      if (username) {
        const idx = sorted.findIndex(e => e.username.toLowerCase() === username.toLowerCase());
        setGlobalRank(idx !== -1 ? idx + 1 : null);
      }
    } catch (e) { console.error(e); }
  }, [username]);

  useEffect(() => {
    setHasMounted(true);
    const saved = localStorage.getItem('trench_highscore');
    if (saved) setHighScore(parseInt(saved));
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const triggerGameOver = useCallback(async () => {
    setRugQuote(RUG_MESSAGES[Math.floor(Math.random() * RUG_MESSAGES.length)]);
    if (score > highScore) { 
      setHighScore(score); 
      localStorage.setItem('trench_highscore', score.toString()); 
    }
    if (score > 0 && username) {
      await fetch('/api/leaderboard', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ username, score }) 
      });
    }
    setGameState('gameOver');
    fetchLeaderboard();
  }, [score, highScore, username, fetchLeaderboard]);

  const shareToX = () => {
    const gameUrl = typeof window !== 'undefined' ? window.location.origin : 'https://trencher.site';
    let titlePool = score >= 50 ? TOP_CLOUT : score >= 20 ? MID_CLOUT : LOW_CLOUT;
    const cloutTitle = titlePool[Math.floor(Math.random() * titlePool.length)];
    const shareText = `${cloutTitle}\nSniper: ${username}\nScore: ${score} | Rank: #${globalRank || '?'}\n\n"${rugQuote}"\n\nPlay Trench Sniper ONCHAIN: ${gameUrl}\n\nBuilt by @MojeebHQ`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  useEffect(() => {
    if (gameState === 'playing' && hasMounted) {
      gameLoopRef.current = setInterval(() => {
        setTiles(prev => {
          let baseSpeed = 4.0 + (score * 0.09);
          const updated = prev.map(t => ({ ...t, y: t.y + baseSpeed }));
          if (updated.some(t => t.y >= 96 && t.type === 'green')) { triggerGameOver(); return []; }
          if (Math.random() < 0.08) {
            const allTerms = Object.keys(DICTIONARY);
            const isGreen = Math.random() > 0.45;
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
      
      {/* 1. HEADER */}
      <div style={{ height: '7vh', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px', background: '#050505', borderBottom: '1px solid #111' }}>
         <div style={{ display: 'flex', gap: '15px', fontSize: '11px', fontWeight: 'bold' }}>
            <span style={{color: '#666'}}>PB: <span style={{color: '#fff'}}>{highScore}</span></span>
            <span style={{color: '#666'}}>RANK: <span style={{color: '#fbbf24'}}>#{globalRank || '--'}</span></span>
         </div>
         <div style={{ fontWeight: '900', color: BRAND_COLOR, fontSize: '12px' }}>TRENCH SNIPER</div>
      </div>

      {/* 2. MEANING AREA */}
      <div style={{ height: '12vh', width: '100%', display: 'flex', alignItems: 'center', padding: '5px 15px' }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: '#080808', border: '1px solid #1a1a1a', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', textAlign: 'center' }}>
            {popup ? (
              <div style={{ animation: 'fadeIn 0.2s ease' }}>
                <span style={{ color: BRAND_COLOR, fontWeight: 'bold', fontSize: '13px', display: 'block' }}>{popup.term}</span>
                <span style={{ color: '#aaa', fontSize: '10px' }}>{popup.def}</span>
              </div>
            ) : (
              <div style={{ color: '#222', fontSize: '9px', letterSpacing: '2px' }}>AWAITING INTEL...</div>
            )}
          </div>
      </div>

      {/* 3. MAIN GAME / GAME OVER AREA */}
      <main style={{ height: '60vh', width: '100%', maxWidth: '420px', position: 'relative', padding: '0 10px' }}>
        {gameState === 'playing' ? (
          <div style={{ width: '100%', height: '100%', border: flash ? `2px solid ${BRAND_COLOR}` : '1px solid #151515', position: 'relative', overflow: 'hidden', background: '#030303', borderRadius: '16px' }}>
             <div style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '24px', fontWeight: 'bold', opacity: 0.2, zIndex: 5 }}>{score}</div>
            {tiles.map(tile => (
              <div key={tile.id} onPointerDown={() => handleSnipe(tile)} style={{ position: 'absolute', top: `${tile.y}%`, left: `${tile.lane * 25}%`, width: '23%', padding: '15px 0', textAlign: 'center', border: `1px solid ${tile.type === 'green' ? '#22c55e' : '#ef4444'}`, color: tile.type === 'green' ? '#22c55e' : '#ef4444', fontSize: '10px', fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.95)', borderRadius: '8px', marginLeft: '1%', zIndex: 10 }}>{tile.term}</div>
            ))}
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
             {gameState === 'identity' ? (
               <div style={{ width: '100%', border: `1px solid ${BRAND_COLOR}`, padding: '25px', textAlign: 'center', background: '#050505', borderRadius: '20px', marginTop: '20px' }}>
                  <ShieldCheck color={BRAND_COLOR} size={28} style={{margin: '0 auto 10px'}} />
                  <input style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #222', color: '#fff', marginBottom: '15px', textAlign: 'center', borderRadius: '10px', outline: 'none' }} placeholder="@X_HANDLE" value={username} onChange={(e) => setUsername(e.target.value)} />
                  <button onClick={() => { if(username) { setGameState('playing'); fetchLeaderboard(); } }} style={{ width: '100%', padding: '15px', background: BRAND_COLOR, color: '#fff', fontWeight: 'bold', borderRadius: '10px' }}>ENTER TRENCHES</button>
               </div>
             ) : (
               <div style={{ width: '100%', height: '100%', border: '1px solid #ef4444', padding: '15px', textAlign: 'center', background: '#050505', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
                  <Skull color="#ef4444" style={{margin: '0 auto 5px'}} size={20} />
                  <p style={{ color: '#ef4444', fontSize: '10px', marginBottom: '8px', fontWeight: 'bold' }}>"{rugQuote}"</p>
                  
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', background: '#000', borderRadius: '8px', padding: '10px', border: '1px solid #111', maxHeight: '250px' }}>
                    <table style={{ width: '100%', fontSize: '10px', textAlign: 'left' }}>
                      <thead><tr style={{ color: '#444' }}><th style={{paddingBottom: '5px'}}>RANK</th><th>USER</th><th style={{textAlign: 'right'}}>SCORE</th></tr></thead>
                      <tbody>
                        {leaderboard.slice(0, 20).map((entry, i) => (
                          <tr key={i} style={{ color: entry.username.toLowerCase() === username.toLowerCase() ? BRAND_COLOR : '#ccc' }}>
                            <td style={{padding: '4px 0'}}>#{i + 1}</td>
                            <td>{entry.username.slice(0, 15)}</td>
                            <td style={{textAlign: 'right'}}>{entry.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={shareToX} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #1DA1F2', color: '#1DA1F2', fontWeight: 'bold', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px' }}>
                      <Share2 size={14} /> SHARE CLOUT
                    </button>
                    <button onClick={() => { setScore(0); setTiles([]); setGameState('playing'); }} style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '8px', fontSize: '12px' }}>LOCKED IN</button>
                  </div>
               </div>
             )}
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer style={{ height: '21vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <div style={{ animation: 'blink 2s infinite', fontSize: '9px', color: BRAND_COLOR, border: `1px solid ${BRAND_COLOR}44`, padding: '2px 8px', borderRadius: '4px', fontWeight: '900' }}>ONCHAIN</div>
        <a href="https://blindspotlabs.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
           <div style={{ fontSize: '9px', color: '#444', fontWeight: 'bold', letterSpacing: '1px' }}>POWERED BY BLINDSPOT LABS</div>
        </a>
        <a href="https://x.com/MojeebHQ" target="_blank" rel="noopener noreferrer" style={{ color: BRAND_COLOR, textDecoration: 'none', fontSize: '10px', fontWeight: 'bold' }}>BUILT BY @MOJEEBHQ</a>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
