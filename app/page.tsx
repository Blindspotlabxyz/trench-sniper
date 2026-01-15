'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Skull, Trophy } from 'lucide-react';

const BRAND_COLOR = '#4e24cf';

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
const MID_CLOUT = ["WHALE IN TRAINING 🐋", "ALPHA FINDER", "GIGA CHAD ENERGY", "DIAMOND HANDED"];
const LOW_CLOUT = ["TRENCH GRINDER ⚔️", "EXIT LIQUIDITY 💀", "JEET DETECTED", "NORMIE TIER"];

interface Tile {
  id: number; term: string; type: 'green' | 'red'; lane: number; y: number;
}

interface LeaderboardEntry {
  username: string;
  score: number;
}

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
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      
      let formatted: LeaderboardEntry[] = [];
      if (Array.isArray(data)) {
        if (typeof data[0] === 'object' && data[0] !== null) {
          formatted = data;
        } else {
          for (let i = 0; i < data.length; i += 2) {
            formatted.push({ username: data[i], score: Number(data[i+1]) });
          }
        }
      }

      const sortedList = formatted.sort((a, b) => b.score - a.score);
      setLeaderboard(sortedList);

      const mySavedBest = Number(localStorage.getItem('trench_highscore') || 0);
      if (mySavedBest > 0 && sortedList.length > 0) {
        const myIndex = sortedList.findIndex(e => e.username.toLowerCase() === username.toLowerCase());
        if (myIndex !== -1) {
          setGlobalRank(myIndex + 1);
        } else {
          const rankPos = sortedList.findIndex(e => mySavedBest > e.score);
          setGlobalRank(rankPos !== -1 ? rankPos + 1 : sortedList.length + 1);
        }
      }
    } catch (e) {
      console.error("Leaderboard error", e);
    }
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
      } catch (e) {
        console.error("Score save failed", e);
      }
    }

    setGameState('gameOver');
    fetchLeaderboard();
  }, [highScore, score, username, fetchLeaderboard]);

  useEffect(() => {
    setHasMounted(true);
    const saved = typeof window !== 'undefined' ? localStorage.getItem('trench_highscore') : null;
    if (saved) setHighScore(parseInt(saved));
    fetchLeaderboard(); 
  }, [fetchLeaderboard]);

  const shareToX = () => {
    const gameUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    // VIRAL LOGIC: Determine Title based on Rank
    let rankTitle = "";
    if (globalRank && globalRank <= 10) rankTitle = TOP_CLOUT[Math.floor(Math.random() * TOP_CLOUT.length)];
    else if (globalRank && globalRank <= 100) rankTitle = MID_CLOUT[Math.floor(Math.random() * MID_CLOUT.length)];
    else rankTitle = LOW_CLOUT[Math.floor(Math.random() * LOW_CLOUT.length)];

    const rankText = globalRank ? ` (Global Rank: #${globalRank})` : "";
    
    const shareText = `${rankTitle}\nSniper: ${username}${rankText}\nScore: ${score} on Trench Sniper 🎯\n\n"${rugQuote}"\n\nMastering Web3 terms and dodging rugs. ⚔️\n\nPlay here: ${gameUrl}\n\nBuilt by @MojeebHQ`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(xUrl, '_blank');
  };

  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => setFlash(false), 100);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  useEffect(() => {
    if (gameState === 'playing' && hasMounted) {
      gameLoopRef.current = setInterval(() => {
        setTiles(prev => {
          let baseSpeed = 3.2;
          if (score >= 10) baseSpeed = 4.8;
          if (score >= 20) baseSpeed = 6.2;
          if (score >= 30) baseSpeed = 8.0 + (score * 0.05);
          
          const updated = prev.map(t => ({ ...t, y: t.y + baseSpeed }));
          if (updated.some(t => t.y >= 94 && t.type === 'green')) {
            triggerGameOver();
            return [];
          }

          if (Math.random() < 0.09) {
            const allTerms = Object.keys(DICTIONARY);
            const isGreen = Math.random() > (score < 25 ? 0.35 : 0.52);
            const randomGreenTerm = allTerms[Math.floor(Math.random() * allTerms.length)];
            const redTerms = ['SCAM', 'RUG', 'DRAINER', 'MEV BOT', 'HONEYPOT'];
            const randomRedTerm = redTerms[Math.floor(Math.random() * redTerms.length)];

            updated.push({
              id: tileIdCounter.current++,
              term: isGreen ? randomGreenTerm : randomRedTerm,
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
    }
  };

  if (!hasMounted) return <div style={{ background: '#000', minHeight: '100vh' }} />;

  return (
    <div style={{ 
      backgroundColor: '#000', color: '#fff', height: '100vh', 
      fontFamily: 'monospace', padding: '10px 20px', display: 'flex', 
      flexDirection: 'column', alignItems: 'center', userSelect: 'none', 
      touchAction: 'none', overflow: 'hidden' 
    }}>
      
      <header style={{ textAlign: 'center', padding: '10px 0', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2px' }}>
            <div style={{ 
                width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%',
                animation: 'blink 1.5s infinite'
            }} />
            <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: 'bold', letterSpacing: '1px' }}>ONCHAIN</span>
        </div>
        
        <h1 style={{ color: BRAND_COLOR, fontSize: '1.8rem', fontWeight: '900', margin: 0, fontStyle: 'italic', letterSpacing: '-2px' }}>TRENCH SNIPER</h1>
        
        <div style={{ fontSize: '10px', color: '#444', fontWeight: 'bold', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <span>PB: <span style={{color: BRAND_COLOR}}>{highScore}</span></span>
            {globalRank && <span>GLOBAL RANK: <span style={{color: '#fbbf24'}}>#{globalRank}</span></span>}
        </div>

        <style>{`
          @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        `}</style>
      </header>

      <div style={{ flex: 1, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {gameState === 'identity' && (
          <div style={{ border: `2px solid ${BRAND_COLOR}`, padding: '30px', textAlign: 'center', background: '#0a0a0a', borderRadius: '24px' }}>
            <p style={{fontSize: '10px', color: BRAND_COLOR, marginBottom: '10px' }}>@X_HANDLE REQUIRED TO ENTER</p>
            <input 
              style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #333', color: BRAND_COLOR, marginBottom: '20px', outline: 'none', borderRadius: '12px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
              placeholder="@"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button 
              onClick={() => username && setGameState('playing')}
              style={{ width: '100%', padding: '16px', background: BRAND_COLOR, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '12px', marginBottom: '20px' }}
            >
              ENTER TRENCHES
            </button>

            <div style={{ background: '#000', borderRadius: '12px', padding: '10px', border: '1px solid #222' }}>
               <p style={{fontSize: '8px', color: '#444', marginBottom: '8px'}}>CURRENT TRENCH LEGENDS</p>
               {leaderboard.length > 0 ? leaderboard.slice(0, 3).map((entry, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888' }}>
                   <span>{i+1}. {entry.username}</span>
                   <span>{entry.score}</span>
                 </div>
               )) : <p style={{fontSize: '8px', color: '#333'}}>Connecting to network...</p>}
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div style={{ fontSize: '0.9rem', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
              <span>SNIPER: <span style={{color: BRAND_COLOR}}>{username.toUpperCase()}</span></span>
              <span>SCORE: {score}</span>
            </div>
            
            <div style={{ 
                width: '100%', height: '60vh', border: flash ? `2px solid ${BRAND_COLOR}` : '2px solid #222', 
                position: 'relative', overflow: 'hidden', background: flash ? `${BRAND_COLOR}22` : '#050505', 
                borderRadius: '24px', transition: 'all 0.1s ease' 
            }}>
              {tiles.map(tile => (
                <div 
                  key={tile.id}
                  onMouseDown={() => handleSnipe(tile)}
                  onTouchStart={(e) => { e.preventDefault(); handleSnipe(tile); }}
                  style={{
                    position: 'absolute', top: `${tile.y}%`, left: `${tile.lane * 25}%`, width: '23%', padding: '12px 0',
                    textAlign: 'center', cursor: 'pointer', border: `1px solid ${tile.type === 'green' ? '#22c55e' : '#ef4444'}`,
                    color: tile.type === 'green' ? '#22c55e' : '#ef4444', fontSize: '7.5px', fontWeight: '900',
                    backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 20, borderRadius: '8px', marginLeft: '1%'
                  }}
                >
                  {tile.term}
                </div>
              ))}

              {popup && (
                <div style={{ 
                  position: 'absolute', bottom: '15px', left: '15px', right: '15px',
                  background: 'rgba(0,0,0,0.9)', color: '#fff', padding: '10px', 
                  zIndex: 100, textAlign: 'center', border: `1px solid ${BRAND_COLOR}`,
                  pointerEvents: 'none', borderRadius: '12px'
                }}>
                  <div style={{ fontWeight: 'bold', color: BRAND_COLOR, fontSize: '0.7rem' }}>{popup.term}</div>
                  <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.8 }}>{popup.def}</div>
                </div>
              )}
            </div>
          </>
        )}

        {gameState === 'gameOver' && (
          <div style={{ border: '2px solid #ef4444', padding: '20px', textAlign: 'center', background: '#0a0a0a', borderRadius: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
            <Skull color="#ef4444" size={24} style={{margin: '0 auto 10px'}} />
            <h2 style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '900', marginBottom: '10px' }}>&quot;{rugQuote}&quot;</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '15px', fontWeight: 'bold' }}>SCORE: {score}</p>
            
            <div style={{ background: '#000', borderRadius: '12px', padding: '15px', marginBottom: '15px', border: '1px solid #222' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: BRAND_COLOR, fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '10px' }}>
                <Trophy size={14} /> GLOBAL TOP 10
              </div>
              {leaderboard.length > 0 ? leaderboard.slice(0, 10).map((entry, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '4px 0', borderBottom: '1px solid #111', backgroundColor: entry.username === username ? '#4e24cf22' : 'transparent' }}>
                  <span style={{ color: i === 0 ? '#fbbf24' : '#888' }}>{i + 1}. {entry.username} {entry.username === username && '(YOU)'}</span>
                  <span style={{ fontWeight: 'bold' }}>{entry.score}</span>
                </div>
              )) : <div style={{ fontSize: '9px', color: '#444' }}>Loading the trench legends...</div>}
            </div>

            <button 
              onClick={shareToX}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #1DA1F2', color: '#1DA1F2', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px', fontSize: '0.8rem' }}
            >
              <Share2 size={16} /> SHARE TO COPE
            </button>
            <button 
              onClick={() => { setScore(0); setTiles([]); setGameState('playing'); }}
              style={{ width: '100%', padding: '16px', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '12px' }}
            >
              LOCKED IN AGAIN
            </button>
          </div>
        )}
      </div>

      <footer style={{ padding: '15px 0', fontSize: '8px', color: '#444', letterSpacing: '1px', textAlign: 'center' }}>
        <a href="https://blindspotlabs.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'none', borderBottom: '1px solid #222' }}>BLINDSPOT LABS</a>
        <span style={{ margin: '0 8px' }}>|</span>
        BUILT BY <a href="https://x.com/MojeebHQ" target="_blank" rel="noopener noreferrer" style={{ color: BRAND_COLOR, textDecoration: 'none', fontWeight: 'bold' }}>MOJEEB</a>
      </footer>
    </div>
  );
}
