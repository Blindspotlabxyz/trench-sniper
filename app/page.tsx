// 1. UPDATE THIS FUNCTION IN YOUR CODE
const triggerGameOver = useCallback(async () => {
  const quote = RUG_MESSAGES[Math.floor(Math.random() * RUG_MESSAGES.length)];
  setRugQuote(quote);
  
  // FORCE LOCAL UPDATE IMMEDIATELY
  let finalScoreForThisRun = score;
  if (finalScoreForThisRun > highScore) {
    setHighScore(finalScoreForThisRun); // Updates the Footer immediately
    localStorage.setItem('trench_highscore', finalScoreForThisRun.toString());
  }
  
  setGameState('gameOver');

  if (finalScoreForThisRun > 0 && username) {
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), score: finalScoreForThisRun }),
      });
      
      // Refresh the leaderboard to get the new Global Rank
      setTimeout(() => fetchLeaderboard(), 500);
    } catch (e) {
      console.error("Score submission failed", e);
    }
  }
}, [score, highScore, username, fetchLeaderboard]);
