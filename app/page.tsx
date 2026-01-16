'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Skull, Trophy, ShieldCheck } from 'lucide-react';

const BRAND_COLOR = '#4e24cf';

const DICTIONARY: Record<string, string> = {
  'WAGMI': 'We All Gonna Make It.', 'REKT': 'Total loss.', 'HODL': 'Hold On for Dear Life.',
  'LFG': 'Lets Go!', 'RUG': 'Rug Pull.', 'MOON': 'Price pumping.',
  'APE IN': 'Degenerate buying.', 'FOMO': 'Fear Of Missing Out.', 'WHALE': 'Huge capital.',
  'DEGEN': 'High-risk trader.', 'DIAMOND HANDS': 'Refusing to sell.', 'SAFU': 'Funds are safe.',
  'JEET': 'Selling too fast.', 'SHITCOIN': 'Zero utility coin.', 'YOLO': 'You Only Live Once.',
  'DEX': 'Exchange.', 'LIQUIDITY': 'Pool funds.', 'MINT': 'Create NFT.',
  'ALPHA': 'Insider info.', 'BAGHOLDER': 'Holding losers.', 'BTFD': 'Buy The Dip.',
  'GAS': 'Fees.', 'NGMI': 'Not Gonna Make It.', 'PFP': 'Profile Pic.'
};

const RUG_MESSAGES = [
  "YOU BOUGHT THE TOP.", "YOU'RE SO DOOMED, PACK EVERYTHING.", "DON'T SLEEP, WORK HARD.",
  "YOU RAN OUT OF REACH.", "ONLY LEGEND HERE, PLS.", "NOT FOR YAPPERS.",
  "TO KNOW IS TO BE FREE.", "WHERE IS YOUR AURA?", "NO AURA, YOU CAN DO BETTER.",
  "YOU'RE JUST AN EXIT LIQUIDITY.", "DEV IS DED. KEK.", "KEK YOU'RE DED.",
  "THANK YOU FOR YOUR ATTENTION.", "EXIT LIQUIDITY DETECTED.", "THANKS FOR THE SOL, JEET."
];

interface Tile { id: number; term: string; type: 'green' | 'red'; lane: number; y: number; }
interface LeaderboardEntry { username: string; score: number; }

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

  // FETCH & DEDUPLICATE
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      
      let rawList: LeaderboardEntry[] = [];
      if (Array.isArray(data)) {
        if (typeof data[0] === 'object' && data[0] !== null) {
          rawList = data.map(i => ({ 
            username: String(i?.username || i?.name || 'ANON').trim(), 
            score: Number(i?.score) || 0 
          }));
        } else {
          for (let i = 0; i < data.length; i += 2) {
            if (data[i]) rawList.push({ username: String(data[i]).trim(), score: Number(data[i+1]) || 0 });
          }
        }
      }

      const bestScoresMap = new Map<string, number>();
      rawList.forEach(entry => {
        const lookupKey = entry.username.toLowerCase();
        if (!bestScoresMap.has(lookupKey) || entry.score > bestScoresMap.get(lookupKey)!) {
          bestScoresMap.set(lookupKey, entry.score);
        }
      });

      const finalSorted = Array.from(bestScoresMap.entries())
        .map(([key, s]) => {
          const original = rawList.find(r => r.username.toLowerCase() === key);
          return { username: original?.username || key, score: s };
        })
        .sort((a, b) => b.score - a.score);

      setLeaderboard(finalSorted);

      if (username) {
        const cleanUser = username.toLowerCase().trim();
        const myIdx = finalSorted.findIndex(e => e.username.toLowerCase() === cleanUser);
        setGlobalRank(myIdx !== -1 ? myIdx + 1 : null);
      }
    } catch (e) {
      console.error("Leaderboard Error:", e);
    }
  }, [username]);

  useEffect(() => {
    setHasMounted(true);
    const saved = localStorage.getItem('trench_highscore');
    if (saved) setHighScore(parseInt(saved));
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const triggerGameOver = useCallback(async () => {
    const quote = RUG_MESSAGES[Math.floor(Math.random() * RUG_MESSAGES.length)];
    setRugQuote(quote);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('trench_highscore', score.toString());
    }
    setGameState('gameOver');

    if (score > 0 && username) {
      try {
        await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), score }),
        });
        setTimeout(() => fetchLeaderboard(), 800);
      } catch (e) { console.error(e); }
    }
  }, [score, highScore, username, fetchLeaderboard]);

  const shareToX = () => {
    const rankMsg = globalRank ? ` (Rank #${globalRank})` : "";
    const shareText = `TRENCH SNIPER ONCHAIN\nSniper: ${username}${rankMsg}\nScore: ${score}\n\n"${rugQuote}"\n\nPlay: https://trench-sniper.vercel.app\nBuilt by @MojeebHQ`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  useEffect(() => {
    if (gameState === 'playing' && hasMounted) {
      gameLoopRef.current = setInterval(() => {
        setTiles(prev => {
          let baseSpeed = 3.5 + (score * 0.06);
          const updated = prev.map(t => ({ ...t, y: t.y + baseSpeed }));
          if (updated.some(t => t.y >= 94 && t.type === 'green')) { triggerGameOver(); return []; }
          if (Math.random() < 0.1) {
            const allTerms = Object.keys(DICTIONARY);
            const isGreen = Math.random() > 0.42;
            updated.push({
              id: tileIdCounter.current++,
              term: isGreen ? allTerms[Math.floor(Math.random() * allTerms.length)] : 'RUG',
              type: isGreen ? 'green' : 'red',
              lane: Math.floor(Math.random() * 4), y: -15
            });
          }
          return updated.filter(t => t.y < 105);
        });
      }, 50);
      return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
    }
  }, [gameState, hasMounted, score, triggerGameOver]);

  if (!hasMounted) return null;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', height: '100vh', width: '100vw', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      
      <div style={{ height: '15vh', width: '100%', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: BRAND_COLOR, letterSpacing: '2px', fontStyle: 'italic' }}>TRENCH SNIPER</h1>
        <div style={{ width: '100%', flex: 1, backgroundColor: '#080808', border: '1px solid #1a1a1a', borderRadius: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 5px' }}>
          {popup ? (
            <div>
              <div style={{ color: BRAND_COLOR, fontWeight: 'bold', fontSize: '11px' }}>{popup.term}</div>
              <div style={{ color: '#666', fontSize: '9px' }}>{popup.def}</div>
            </div>
          ) : <div style={{ color: '#222', fontSize: '10px' }}>WAITING FOR INTEL...</div>}
        </div>
      </div>

      <main style={{ height: '60vh', width: '100%', maxWidth: '420px', margin: '0 auto', position: 'relative' }}>
        {gameState === 'playing' ? (
          <div style={{ width: '100%', height: '100%', border: flash ? `2px solid ${BRAND_COLOR}` : '2px solid #151515', position: 'relative', overflow: 'hidden', background: '#030303', borderRadius: '24px' }}>
             <div style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '24px', fontWeight: 'bold', opacity: 0.1 }}>{score}</div>
             {tiles.map((tile) => (
                <div key={tile.id} onPointerDown={() => tile.type === 'red' ? triggerGameOver() : (setScore(s => s + 1), setFlash(true), setPopup({ term: tile.term, def: DICTIONARY[tile.term] }), setTiles(prev => prev.filter(t => t.id !== tile.id)), setTimeout(() => setFlash(false), 100))} style={{ position: 'absolute', top: `${tile.y}%`, left: `${tile.lane * 25}%`, width: '23%', padding: '14px 0', textAlign: 'center', border: `1px solid ${tile.type === 'green' ? '#22c55e' : '#ef4444'}`, color: tile.type === 'green' ? '#22c55e' : '#ef4444', fontSize: '8px', fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.95)', borderRadius: '8px', cursor: 'pointer', touchAction: 'none' }}>{tile.term}</div>
             ))}
          </div>
        ) : (
          <div style={{ height: '100%', padding: '0 15px', display: 'flex', flexDirection: 'column' }}>
            {gameState === 'identity' ? (
              <div style={{ border: `2px solid ${BRAND_COLOR}`, padding: '30px 20px', textAlign: 'center', background: '#050505', borderRadius: '24px' }}>
                <ShieldCheck color={BRAND_COLOR} size={40} style={{ margin: '0 auto 15px' }} />
                <input style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #222', color: BRAND_COLOR, marginBottom: '15px', textAlign: 'center', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', outline: 'none' }} placeholder="@" value={username} onChange={(e) => setUsername(e.target.value)} />
                <button onClick={() => username && setGameState('playing')} style={{ width: '100%', padding: '16px', background: BRAND_COLOR, color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none' }}>ENTER TRENCHES</button>
              </div>
            ) : (
              <div style={{ flex: 1, border: '2px solid #ef4444', padding: '15px', background: '#050505', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <Skull color="#ef4444" size={24} style={{ margin: '0 auto 5px' }} />
                  <h2 style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'italic', margin: '5px 0' }}>{rugQuote}</h2>
                  <div style={{ color: '#22c55e', fontSize: '16px', fontWeight: 'bold' }}>SCORE: {score}</div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', background: '#000', borderRadius: '12px', padding: '10px', border: '1px solid #111' }}>
                   <table style={{ width: '100%', fontSize: '11px' }}>
                      <tbody>{leaderboard.length > 0 ? leaderboard.slice(0, 50).map((e, i) => (
                        <tr key={i} style={{ color: e.username.toLowerCase().trim() === username.toLowerCase().trim() ? BRAND_COLOR : '#ccc' }}>
                          <td style={{ padding: '4px' }}>#{i + 1} {e.username}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{e.score}</td>
                        </tr>
                      )) : <tr><td colSpan={2} style={{textAlign:'center', color:'#333', padding:'20px'}}>SYNCING...</td></tr>}</tbody>
                   </table>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button onClick={() => { setScore(0); setTiles([]); setGameState('playing'); }} style={{ flex: 1, padding: '14px', background: '#fff', color: '#000', fontWeight: 'bold', borderRadius: '12px', border: 'none' }}>TRY AGAIN</button>
                  <button onClick={shareToX} style={{ flex: 1, padding: '14px', background: BRAND_COLOR, color: '#fff', fontWeight: 'bold', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Share2 size={18} /> SHARE</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ height: '25vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <div style={{ fontSize: '10px', color: '#555', fontWeight: 'bold', textAlign: 'center' }}>
          PERSONAL BEST: {highScore} <br/> 
          GLOBAL RANK: {globalRank ? `#${globalRank}` : '--'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: BRAND_COLOR, fontWeight: '900' }}>@MOJEEBHQ</span>
            <span style={{ fontSize: '9px', color: '#333' }}>BLINDSPOT LABS</span>
        </div>
      </footer>
    </div>
  );
}
