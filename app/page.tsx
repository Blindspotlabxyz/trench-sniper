// Replace your fetchLeaderboard function with this refined logic:

const fetchLeaderboard = useCallback(async () => {
  try {
    const res = await fetch('/api/leaderboard', { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    
    let rawList: LeaderboardEntry[] = [];
    if (Array.isArray(data)) {
      if (typeof data[0] === 'object') {
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

    // 🔥 THE FIX: Use a Map to ensure one entry per username
    const bestScoresMap = new Map<string, number>();
    
    rawList.forEach(entry => {
      const name = entry.username; // Keep original casing for display
      const lookupKey = name.toLowerCase(); // Use lowercase for merging
      
      if (!bestScoresMap.has(lookupKey) || entry.score > bestScoresMap.get(lookupKey)!) {
        bestScoresMap.set(lookupKey, entry.score);
      }
    });

    // Convert Map back to sorted array
    // Note: We'll use the name from the rawList for the first time we saw it
    const finalLeaderboard = Array.from(bestScoresMap.entries())
      .map(([key, score]) => {
        // Find the original casing for the username
        const originalEntry = rawList.find(r => r.username.toLowerCase() === key);
        return { username: originalEntry?.username || key, score };
      })
      .sort((a, b) => b.score - a.score);

    setLeaderboard(finalLeaderboard);

    if (username) {
      const cleanUser = username.toLowerCase().trim();
      const myIdx = finalLeaderboard.findIndex(e => e.username.toLowerCase() === cleanUser);
      setGlobalRank(myIdx !== -1 ? myIdx + 1 : null);
    }
  } catch (e) {
    console.error("Leaderboard Error:", e);
  }
}, [username]);
