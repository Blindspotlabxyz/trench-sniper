'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Skull, ShieldCheck } from 'lucide-react';

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

const CLOUT = {
  TOP: ["TRENCH GOD 👑", "AURA MAXIMIZED ⚡", "LIQUIDITY KING 💎"],
  MID: ["WHALE IN TRAINING 🐋", "ALPHA FINDER 🔎", "DIAMOND HANDS 💎"],
  LOW: ["TRENCH GRINDER ⚔️", "EXIT LIQUIDITY 💀", "JEET DETECTED 🤡"]
};

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

  // FIX: Added strict null checks for username and entry data to prevent toLowerCase() crash
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) return;
      const data = await res.json();
      const sorted = Array.isArray(data) ? data.filter(e => e && e.username).sort((a, b) => b.score - a.score) : [];
      setLeaderboard(sorted);
      
      if (username && username.trim() !== "") {
        const idx = sorted.findIndex(e => e.username?.toLowerCase() === username.toLowerCase());
        setGlobalRank(idx !== -1 ? idx + 1 : null);
      }
    } catch (e) { console.error("Sync Error Fixed", e); }
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
    const pool = score >= 50 ? CLOUT.TOP : score >= 20 ? CLOUT.MID : CLOUT.LOW;
    const cloutTitle = pool[Math.floor(Math.random() * pool.length)];
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
            updated.push({ id: tileIdCounter.current++, term: isGreen ? allTerms[Math.floor(Math.random() * allTerms.length)] : 'RUG', type: isGreen ? 'green' : 'red', lane: Math.floor(Math.random() * 4), y: -10 });
          }
          return updated.filter(t => t.y < 100);
        });
      }, 50);
      return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
    }
  }, [gameState, hasMounted, score, triggerGameOver]);

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', height: '100vh', width: '100vw', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'fixed' }}>
      
      {/* HEADER (7%) */}
      <header style={{ height: '7vh', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px', background: '#050505', borderBottom: '1px solid #111' }}>
         <div style={{ fontSize: '11px' }}>PB: {highScore} | <span style={{color: '#fbbf24'}}>#{globalRank || '--'}</span></div>
         <div style={{ fontWeight: '900', color: BRAND_COLOR, fontSize: '12px' }}>TRENCH SNIPER</div>
      </header>

      {/* INTEL AREA (13%) */}
      <div style={{ height: '13vh', padding: '10px' }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: '#080808', border: '1px solid #1a1a1a', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            {popup ? (
              <div style={{ animation: 'fadeIn 0.2s ease' }}>
                <span style={{ color: BRAND_COLOR, fontWeight: 'bold', fontSize: '13px' }}>{popup.term}</span><br/>
                <span style={{ color: '#aaa', fontSize: '10px' }}>{popup.def}</span>
              </div>
            ) : <div style={{ color: '#222', fontSize: '9px' }}>AWAITING INTEL...</div>}
          </div>
      </div>

      {/* GAME SHELL (60%) - Fixed and non-expanding */}
      <main style={{ height: '60vh', width: '100%', maxWidth: '420px', margin: '0 auto', position: 'relative' }}>
        {gameState === 'playing' ? (
          <div style={{ width: '100%', height: '100%', border: flash ? `2px solid ${BRAND_COLOR}` : '1px solid #151515', position: 'relative', overflow: 'hidden', background: '#030303', borderRadius: '16px' }}>
            <div style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '24px', fontWeight: 'bold', opacity: 0.2 }}>{score}</div>
            {tiles.map(tile => (
              <div key={tile.id} onPointerDown={() => {
                if (tile.type === 'red') triggerGameOver();
                else { setScore(s => s + 1); setFlash(true); setPopup({ term: tile.term, def: DICTIONARY[tile.term] || 'Safe!' }); setTiles(prev => prev.filter(t => t.id !== tile.id)); setTimeout(() => setFlash(false), 100); }
              }} style={{ position: 'absolute', top: `${tile.y}%`, left: `${tile.lane * 25}%`, width: '23%', padding: '15px 0', textAlign: 'center', border: `1px solid ${tile.type === 'green' ? '#22c55e' : '#ef4444'}`, color: tile.type === 'green' ? '#22c55e' : '#ef4444', fontSize: '10px', fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.95)', borderRadius: '8px', marginLeft: '1%', cursor: 'pointer' }}>{tile.term}</div>
            ))}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {gameState === 'identity' ? (
              <div style={{ border: `1px solid ${BRAND_COLOR}`, padding: '25px', textAlign: 'center', background: '#050505', borderRadius: '20px' }}>
                <ShieldCheck color={BRAND_COLOR} size={28} style={{margin: '0 auto 10px'}} />
                <input style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #222', color: '#fff', marginBottom: '15px', textAlign: 'center', borderRadius: '10px' }} placeholder="@X_HANDLE" value={username} onChange={(e) => setUsername(e.target.value)} />
                <button onClick={() => username && setGameState('playing')} style={{ width: '100%', padding: '15px', background: BRAND_COLOR, color: '#fff', fontWeight: 'bold', borderRadius: '10px' }}>ENTER TRENCHES</button>
              </div>
            ) : (
              <div style={{ flex: 1, border: '1px solid #ef4444', padding: '15px', background: '#050505', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Skull color="#ef4444" style={{margin: '0 auto 5px'}} size={20} />
                <p style={{ color: '#ef4444', fontSize: '10px', fontWeight: 'bold' }}>"{rugQuote}"</p>
                <div style={{ flex: 1, overflowY: 'auto', margin: '10px 0', background: '#000', borderRadius: '8px', padding: '10px' }}>
                  <table style={{ width: '100%', fontSize: '10px', textAlign: 'left' }}>
                    <tbody style={{color: '#ccc'}}>
                      {leaderboard.slice(0, 15).map((e, i) => (
                        <tr key={i} style={{ color: e.username?.toLowerCase() === username?.toLowerCase() ? BRAND_COLOR : '#ccc' }}>
                          <td style={{padding: '3px 0'}}>#{i+1} {e.username?.slice(0,12)}</td>
                          <td style={{textAlign: 'right'}}>{e.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={shareToX} style={{ padding: '12px', background: '#1DA1F2', color: '#fff', borderRadius: '8px', marginBottom: '8px', fontSize: '12px' }}>SHARE CLOUT</button>
                <button onClick={() => { setScore(0); setTiles([]); setGameState('playing'); }} style={{ padding: '12px', background: '#fff', color: '#000', borderRadius: '8px', fontSize: '12px' }}>LOCKED IN</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER (20%) */}
      <footer style={{ height: '20vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div style={{ animation: 'blink 2s infinite', fontSize: '9px', color: BRAND_COLOR, border: `1px solid ${BRAND_COLOR}44`, padding: '2px 8px', borderRadius: '4px', marginBottom: '10px' }}>ONCHAIN</div>
        <div style={{ fontSize: '9px', color: '#444' }}>POWERED BY BLINDSPOT LABS</div>
        <a href="https://x.com/MojeebHQ" target="_blank" style={{ color: BRAND_COLOR, fontSize: '10px', fontWeight: 'bold', marginTop: '5px' }}>BUILT BY @MOJEEBHQ</a>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
