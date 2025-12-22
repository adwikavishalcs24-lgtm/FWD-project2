
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import '../../styles/minigames.css';

export const MiniGameBase = React.forwardRef(({
  title,
  timeline,
  gameId,
  instructions,
  objective,
  scoring,
  duration = 30,
  difficulty = 'medium',
  onComplete,
  onClose,
  children
}, ref) => {
  const {
    submitMiniGameScore,
    addScore,
    completeMiniGame
  } = useGameStore();

  const [gameState, setGameState] = useState({
    isActive: false,
    score: 0,
    timeLeft:
      typeof duration === 'number' && duration > 0
        ? duration
        : 30,
    gameStarted: false,
    showInstructions: true,
    combos: 0,
    perfectStreak: 0,
    lives: 3,
    difficulty: difficulty,
    gameStatus: 'playing' // playing | won | gameover
  });

  const [particles, setParticles] = useState([]);
  const [effects, setEffects] = useState([]);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastPerfectTime, setLastPerfectTime] = useState(0);
  const [gameStats, setGameStats] = useState({
    totalActions: 0,
    perfectActions: 0,
    mistakes: 0,
    maxCombo: 0
  });

  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const statsRef = useRef({ totalActions: 0, perfectActions: 0, mistakes: 0, maxCombo: 0 });
  const timeLeftRef = useRef(duration);
  const gameTimerRef = useRef(null);
  const gameLogicRef = useRef(null);
  const hasEndedRef = useRef(false);


  // Initialize effects system
  const createParticle = (x, y, type = 'score') => {
    const newParticle = {
      id: Date.now() + Math.random(),
      x,
      y,
      type,
      life: 1,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      color: type === 'perfect' ? '#00ff88' : type === 'miss' ? '#ff4444' : '#00aaff'
    };
    setParticles(prev => [...prev, newParticle]);
  };

  const createScreenEffect = (type, message = '') => {
    const newEffect = {
      id: Date.now() + Math.random(),
      type,
      message,
      life: 1
    };
    setEffects(prev => [...prev, newEffect]);
  };

  // Internal End Game Logic
  // Handles stopping timers and setting final localized state before potentially submitting
  const internalEndGame = (status) => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    clearInterval(gameTimerRef.current);
    gameTimerRef.current = null;

    setGameState(prev => ({
      ...prev,
      isActive: false,
      gameStatus: status
    }));

    // If won, calculate rewards and submit
    if (status === 'won') {
      const finalScore = scoreRef.current;
      const rewards = calculateEnhancedRewards();
      // Submit or complete locally
      if (onComplete) {
        onComplete(timeline, gameId || title, finalScore, rewards);
      }
      // Also update global store
      completeMiniGame(timeline, gameId || title, finalScore, rewards);
    }
    // If gameover (lost), we do not award credits, but we might want to "fail" the mission?
    // For now, we just stop. The user will have to retry or return.
  };


  // Enhanced scoring system
  const addPoints = (basePoints, x, y, type = 'score') => {
    // If not playing, ignore input/points
    if (gameState.gameStatus !== 'playing' || !gameState.gameStarted) return;

    // Check for CRITICAL mistakes (explicit life loss)
    // Only 'critical' type removes lives - must be explicitly called for major failures
    if (type === 'critical') {
      handleMistake(x, y);
      return;
    }

    // Allow negative points for penalties (score reduction) without life loss
    let points = basePoints;
    if (basePoints > 0) {
      points = basePoints * comboMultiplier;
    }

    if (type === 'perfect') {
      points *= 2;
      setComboMultiplier(prev => Math.min(prev + 0.1, 3.0));
      setLastPerfectTime(Date.now());
      createParticle(x, y, 'perfect');
      createScreenEffect('combo', `COMBO x${comboMultiplier.toFixed(1)}!`);
    } else if (type === 'good') {
      createParticle(x, y, 'good');
      setComboMultiplier(prev => Math.min(prev + 0.05, 2.0));
    } else if (type === 'miss') {
      // Miss resets combo but doesn't remove life (unless it's critical)
      setComboMultiplier(1);
      setGameStats(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
      createParticle(x, y, 'miss');
    } else {
      createParticle(x, y, 'score');
    }

    // Add score (can be negative for penalties)
    scoreRef.current = Math.max(0, scoreRef.current + points);
    statsRef.current = {
      ...statsRef.current,
      totalActions: statsRef.current.totalActions + 1,
      maxCombo: Math.max(statsRef.current.maxCombo, comboMultiplier),
      perfectActions: type === 'perfect' ? statsRef.current.perfectActions + 1 : statsRef.current.perfectActions
    };

    setGameState(prev => ({
      ...prev,
      score: scoreRef.current, // Score can't go below 0
      combos: type === 'perfect' ? prev.combos + 1 : 0,
      perfectStreak: type === 'perfect' ? prev.perfectStreak + 1 : 0
    }));

    setGameStats(statsRef.current);
  };

  const handleMistake = (x, y) => {
    // 1. Reset Combo
    setComboMultiplier(1);

    // 2. Add mistake stat
    setGameStats(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
    createParticle(x, y, 'miss');
    createScreenEffect('damage', 'LIFE LOST!');

    // 3. Remove Life
    setGameState(prev => {
      const newLives = prev.lives - 1;
      livesRef.current = newLives;

      if (newLives <= 0) {
        // GAME OVER TRIGGER
        // We need to trigger this effect outside or right here
        // Use a timeout to allow render update or just call internal function directly?
        // Calling directly is safer for logic flow
        setTimeout(() => internalEndGame('gameover'), 0);
        return { ...prev, lives: 0 };
      }

      createScreenEffect('damage', 'XXX'); // Visual feedback
      return { ...prev, lives: newLives };
    });
  };

  // Start game
  const startGame = () => {
    hasEndedRef.current = false;
    const finalDuration = typeof duration === 'number' && duration > 0 ? duration : 30;

    // Reset State Completely
    setGameState({
      isActive: true,
      score: 0,
      timeLeft: finalDuration,
      gameStarted: true,
      showInstructions: false,
      combos: 0,
      perfectStreak: 0,
      lives: 3, // RESET LIVES
      difficulty: difficulty,
      gameStatus: 'playing'
    });

    setGameStats({
      totalActions: 0,
      perfectActions: 0,
      mistakes: 0,
      maxCombo: 0
    });

    scoreRef.current = 0;
    livesRef.current = 3;
    statsRef.current = { totalActions: 0, perfectActions: 0, mistakes: 0, maxCombo: 0 };
    timeLeftRef.current = finalDuration;
    setComboMultiplier(1);


    // Start countdown timer
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (!prev.isActive || !prev.gameStarted || prev.gameStatus !== 'playing') return prev;

        const newTimeLeft = prev.timeLeft - 1;
        timeLeftRef.current = newTimeLeft;

        // Timer Expires
        if (newTimeLeft <= 0) {
          // Timer Expires without losing all lives = WIN
          setTimeout(() => internalEndGame('won'), 0);

          return {
            ...prev,
            timeLeft: 0,
            isActive: false
          };
        }

        return {
          ...prev,
          timeLeft: newTimeLeft
        };
      });
    }, 1000);

    // Start game logic
  };

  // End game (Callable from external) -> Forces a WIN usually?
  // Child components call this when objective is met
  const endGame = () => {
    internalEndGame('won');
  };

  // Expose to refs
  React.useImperativeHandle(ref, () => ({
    addPoints, // Handles positive and negative (lives logic inside)
    endGame,   // Triggers Win
    startGame, // Starts/Restarts
    isGameStarted: gameState.gameStatus === 'playing'
  }));

  // Calculate enhanced rewards based on performance
  const calculateEnhancedRewards = () => {
    const score = scoreRef.current;
    const timeLeft = timeLeftRef.current;
    const lives = livesRef.current;
    const { perfectActions, totalActions, maxCombo } = statsRef.current;

    const accuracy = totalActions > 0 ? perfectActions / totalActions : 0;
    const timeBonus = Math.max(0, timeLeft) * 10; // Bonus for speed
    const lifeBonus = lives * 50; // Bonus for lives left
    const comboBonus = maxCombo * 100;

    const baseCredits = Math.max(100, Math.floor(score / 10)); // Min 100 credits for winning
    const bonusCredits = Math.floor(timeBonus + lifeBonus + comboBonus);

    const totalCredits = baseCredits + bonusCredits;

    // Timeline-specific resources
    const timelineResources = {
      past: { coal: Math.floor(score / 50), metal: Math.floor(score / 100), influence: Math.floor(perfectActions / 2) },
      present: { money: Math.floor(score / 2), technology: Math.floor(score / 150), influence: Math.floor(perfectActions / 2) },
      future: { hyperEnergy: Math.floor(score / 80), innovations: Math.floor(score / 200), influence: Math.floor(perfectActions / 2) }
    };

    return {
      credits: totalCredits,
      energy: 15, // Gain energy for successful mission
      stability: Math.floor(accuracy * 20) + 5,
      coinsPerSecond: Math.floor(maxCombo / 2),
      resources: timelineResources[timeline] || {}
    };
  };

  // Reset combo multiplier if time passes
  useEffect(() => {
    const comboTimer = setInterval(() => {
      if (Date.now() - lastPerfectTime > 3000 && gameState.gameStatus === 'playing') {
        setComboMultiplier(1);
      }
    }, 1000);

    return () => clearInterval(comboTimer);
  }, [lastPerfectTime, gameState.gameStatus]);

  // Update particles
  useEffect(() => {
    const particleInterval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 0.02,
        vy: particle.vy + 0.1 // gravity
      })).filter(particle => particle.life > 0));
    }, 16);

    return () => clearInterval(particleInterval);
  }, []);

  // Update effects
  useEffect(() => {
    const effectInterval = setInterval(() => {
      setEffects(prev => prev.map(effect => ({
        ...effect,
        life: effect.life - 0.03
      })).filter(effect => effect.life > 0));
    }, 16);

    return () => clearInterval(effectInterval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    };
  }, []);

  // Timeline-specific styling
  const timelineStyles = {
    past: 'bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900 border-amber-600',
    present: 'bg-gradient-to-br from-blue-900 via-indigo-800 to-cyan-900 border-blue-600',
    future: 'bg-gradient-to-br from-purple-900 via-pink-800 to-violet-900 border-purple-600'
  };

  const difficultyColors = {
    easy: 'border-green-500 shadow-green-500/50',
    medium: 'border-yellow-500 shadow-yellow-500/50',
    hard: 'border-red-500 shadow-red-500/50'
  };

  // Render particles
  const renderParticles = () => (
    <div className="particles-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: `scale(${particle.life})`
          }}
        />
      ))}
    </div>
  );

  // Render screen effects
  const renderEffects = () => (
    <div className="effects-container">
      {effects.map(effect => (
        <div
          key={effect.id}
          className={`screen-effect ${effect.type}`}
          style={{ opacity: effect.life }}
        >
          {effect.message}
        </div>
      ))}
    </div>
  );

  // Instructions screen
  const renderInstructions = () => (
    <div className="instructions-screen">
      <div className="game-title">
        <h2 className="text-4xl font-bold mb-4 holographic">{title}</h2>
        <div className={`difficulty-badge ${difficulty}`}>
          {difficulty.toUpperCase()}
        </div>
      </div>

      <div className="instructions-content">
        <div className="instruction-card">
          <h3 className="text-xl font-semibold mb-3">📋 Instructions</h3>
          <p className="text-lg leading-relaxed">{instructions}</p>
        </div>

        <div className="objective-card">
          <h3 className="text-xl font-semibold mb-3">🎯 Objective</h3>
          <p className="text-lg leading-relaxed">{objective}</p>
        </div>

        <div className="scoring-card">
          <h3 className="text-xl font-semibold mb-3">🏆 Scoring</h3>
          <p className="text-lg leading-relaxed">{scoring}</p>

          <div className="scoring-details">
            <div className="scoring-item">
              <span className="perfect">Perfect Action</span>
              <span>2x points + combo bonus</span>
            </div>

            <div className="scoring-item">
              <span className="good">Good Action</span>
              <span>Base points + combo bonus</span>
            </div>
            <div className="scoring-item">
              <span className="miss">Miss</span>
              <span>-1 LIFE & Reset Combo</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={startGame}
        className="start-game-btn"
      >
        <span>🚀 START MISSION</span>
      </button>
    </div>
  );

  // Game HUD
  const renderHUD = () => (
    <div className="game-hud">
      <div className="hud-left">
        <div className="hud-item">
          <span className="hud-label">Score</span>
          <span className="hud-value">{gameState.score}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Combo</span>
          <span className="hud-value combo">{comboMultiplier > 1 ? `x${comboMultiplier.toFixed(1)}` : '--'}</span>
        </div>
      </div>

      <div className="hud-center">
        <div className="hud-item">
          <span className="hud-label">Time</span>
          <span className={`hud-value ${gameState.timeLeft <= 5 ? 'warning' : ''}`}>
            {gameState.timeLeft}s
          </span>
        </div>
      </div>

      <div className="hud-right">
        <div className="hud-item">
          <span className="hud-label">Lives</span>
          <span className="hud-value" style={{ letterSpacing: '2px' }}>
            {Array(Math.max(0, gameState.lives)).fill('❤️').join('')}
            {Array(Math.max(0, 3 - gameState.lives)).fill('🖤').join('')}
          </span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Streak</span>
          <span className="hud-value">{gameState.perfectStreak}</span>
        </div>
      </div>
    </div>
  );

  // Main game render
  const renderGame = () => (
    <div className="game-container">
      {renderHUD()}
      <div className="game-area">
        {children}
        {renderParticles()}
        {renderEffects()}

        {/* Visual Damage Overlay */}
        {gameState.lives < 3 && (
          <div className="absolute inset-0 pointer-events-none border-4 border-red-500 opacity-20 animate-pulse"></div>
        )}
      </div>
    </div>
  );

  // Return enhanced mini-game interface
  return (
    <div className={`minigame-wrapper ${timelineStyles[timeline]} border-4 ${difficultyColors[difficulty]} shadow-2xl`}>
      <div className="minigame-content">
        {!gameState.gameStarted ? (
          renderInstructions()
        ) : (
          renderGame()
        )}
      </div>

      {/* Game Over Modal */}
      {gameState.gameStatus === 'gameover' && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]" style={{ zIndex: 9999 }}>
          <div className="bg-red-900/90 p-8 rounded-lg text-center border-4 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-md">MISSION FAILED</h2>
            <div className="text-6xl mb-6">☠️</div>
            <p className="mb-8 text-xl text-red-100">All lives lost. Time line unstable.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame} // Retry
                className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded font-bold text-white border border-gray-500"
              >
                🔄 RETRY
              </button>
              <button
                onClick={() => {
                  console.log("Exit Mission clicked", { onClose: !!onClose, onComplete: !!onComplete });
                  // Close game, no rewards
                  if (onClose) {
                    console.log("Calling onClose...");
                    onClose();
                  } else if (onComplete) {
                    console.log("Calling onComplete...");
                    onComplete(timeline, gameId || title, 0, {});
                  } else {
                    console.error("No close handler available!");
                  }
                }}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded font-bold text-white border border-red-400"
              >
                EXIT MISSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Modal (Handled internally here if not relying on parent completely, but parent usually closes it. 
           We can show a success screen here for polish before closing) */}
      {gameState.gameStatus === 'won' && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]" style={{ zIndex: 9999 }}>
          <div className="bg-green-900/90 p-8 rounded-lg text-center border-4 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
            <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-md">MISSION SUCCESS</h2>
            <div className="text-6xl mb-6">🏆</div>
            <div className="text-left bg-black/30 p-4 rounded mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-green-300">Score:</span>
                <span className="text-white font-bold">{gameState.score}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-green-300">Time Bonus:</span>
                <span className="text-white font-bold">{Math.max(0, gameState.timeLeft) * 10}</span>
              </div>
              <div className="flex justify-between border-t border-green-500/50 pt-2 mt-2">
                <span className="text-yellow-300 font-bold">Total Credits:</span>
                <span className="text-yellow-300 font-bold text-xl">+{calculateEnhancedRewards().credits}</span>
              </div>
            </div>

            <button
              onClick={() => {
                // Ensure final close and reward submission
                const rewards = calculateEnhancedRewards();
                if (onComplete) onComplete(timeline, gameId || title, gameState.score, rewards);
                if (onClose) {
                  setTimeout(() => onClose(), 500); // Small delay for UX
                }
              }}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded font-bold text-white border border-green-400 w-full"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

    </div>
  );
});

// Export enhanced game store hook
export const useEnhancedMiniGame = (timeline, gameId, title) => {
  const { submitMiniGameScore } = useGameStore();

  const handleSubmitScore = async (score, additionalData = {}) => {
    try {
      await submitMiniGameScore(timeline, gameId, score, additionalData);
    } catch (error) {
      console.error('Failed to submit mini-game score:', error);
    }
  };

  return {
    submitScore: handleSubmitScore,
    gameId,
    title
  };
};
