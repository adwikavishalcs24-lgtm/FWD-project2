import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const AncientClockmakerAlignment = ({
  title = "Ancient Clockmaker",
  timeline = "past",
  difficulty = "medium",
  onComplete,
  onClose,
  gameId
}) => {
  const [gears, setGears] = useState([
    { id: 1, angle: 0, speed: 0, targetSpeed: 2, color: '#F59E0B', size: 100 },
    { id: 2, angle: 45, speed: 0, targetSpeed: -1.5, color: '#6366F1', size: 80 },
    { id: 3, angle: 90, speed: 0, targetSpeed: 1, color: '#10B981', size: 120 }
  ]);

  const [aligned, setAligned] = useState(false);
  const [syncTime, setSyncTime] = useState(0);       // seconds aligned
  const [desyncTime, setDesyncTime] = useState(0);   // seconds misaligned
  const [isGameOver, setIsGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  const gameRef = useRef(null);
  const loopRef = useRef(null);
  const scoreTickRef = useRef(0);

  /* ===================== CORE LOOP ===================== */
  useEffect(() => {
    loopRef.current = setInterval(() => {
      if (isGameOver) return;

      setGears(prev =>
        prev.map(g => ({
          ...g,
          angle: (g.angle + g.speed) % 360
        }))
      );
    }, 16);

    return () => clearInterval(loopRef.current);
  }, [isGameOver]);

  /* ===================== ALIGNMENT + SCORING ===================== */
  useEffect(() => {
    if (isGameOver) return;

    const isAlignedNow = gears.every(
      g => Math.abs(g.speed - g.targetSpeed) < 0.1
    );

    setAligned(isAlignedNow);

    // Track alignment time
    if (isAlignedNow) {
      setSyncTime(t => t + 0.016);
      setDesyncTime(0);
    } else {
      setDesyncTime(t => t + 0.016);
      setSyncTime(0);
    }

    // Scoring: once per second of alignment
    if (isAlignedNow && gameRef.current?.isGameStarted) {
      scoreTickRef.current += 1;
      if (scoreTickRef.current >= 60) {
        gameRef.current.addPoints(10, 120, 120, 'good');
        scoreTickRef.current = 0;
      }
    } else {
      scoreTickRef.current = 0;
    }

    // WIN: hold sync for 5 seconds
    if (syncTime >= 5) {
      triggerSuccess();
    }

    // FAIL: stay misaligned too long
    if (desyncTime >= 8) {
      triggerFailure();
    }
  }, [gears]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ===================== END STATES ===================== */
  const triggerSuccess = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    setSuccess(true);
    clearInterval(loopRef.current);

    gameRef.current?.addPoints(200, 400, 300, 'perfect');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: true,
        reason: 'mechanism_restored'
      });
    }, 2200);
  };

  const triggerFailure = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    setSuccess(false);
    clearInterval(loopRef.current);

    gameRef.current?.addPoints(-100, 400, 300, 'miss');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: false,
        reason: 'mechanism_jammed'
      });
    }, 2200);
  };

  /* ===================== CONTROLS ===================== */
  const adjustSpeed = (id, amount) => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;
    setGears(prev =>
      prev.map(g =>
        g.id === id ? { ...g, speed: g.speed + amount } : g
      )
    );
  };

  /* ===================== RENDER ===================== */
  const renderGear = gear => (
    <div key={gear.id} className="flex flex-col items-center gap-4">
      <div
        className="relative transition-transform duration-75"
        style={{
          width: gear.size,
          height: gear.size,
          transform: `rotate(${gear.angle}deg)`
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <path
            d="M50 0 L55 10 L65 5 L70 15 L80 10 L82 22 L92 20 L90 32 L100 35 L95 45 L100 55 L90 58 L92 70 L82 68 L80 80 L70 75 L65 85 L55 80 L50 90 L45 80 L35 85 L30 75 L20 80 L18 68 L8 70 L10 58 L0 55 L5 45 L0 35 L10 32 L8 20 L18 22 L20 10 L30 15 L35 5 L45 10 Z"
            fill={gear.color}
            stroke="#1F2937"
            strokeWidth="2"
          />
          <circle cx="50" cy="50" r="15" fill="#374151" />
          <rect x="45" y="45" width="10" height="10" fill="#D1D5DB" />
        </svg>

        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: `rotate(-${gear.angle}deg)` }}
        >
          <span className="bg-black/70 text-white text-xs px-1 rounded font-mono">
            {gear.speed.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          disabled={isGameOver}
          onClick={() => adjustSpeed(gear.id, -0.5)}
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold"
        >
          −
        </button>

        <div
          className={`px-2 py-1 rounded text-xs font-bold ${
            Math.abs(gear.speed - gear.targetSpeed) < 0.1
              ? 'bg-green-900 text-green-400'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Target: {gear.targetSpeed}
        </div>

        <button
          disabled={isGameOver}
          onClick={() => adjustSpeed(gear.id, 0.5)}
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Adjust each gear’s speed to match its target. Hold synchronization to restore the ancient mechanism."
      objective="Synchronize all gears."
      scoring="Sustained alignment yields points."
      duration={60}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">

        {/* ===== CINEMATIC OVERLAY ===== */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-center">
            <h1
              className={`text-5xl font-extrabold mb-4 animate-pulse ${
                success ? 'text-green-400' : 'text-red-500'
              }`}
            >
              {success ? '⚙️ MECHANISM RESTORED' : '⛓️ MECHANISM JAMMED'}
            </h1>
            <p className="text-gray-300 mb-6 max-w-md">
              {success
                ? 'The ancient clockwork hums back to life, time flows once more.'
                : 'The gears grind to a halt. The mechanism is lost to time.'}
            </p>
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-bold ${
                success
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Exit Timeline
            </button>
          </div>
        )}

        <div
          className={`mb-8 px-6 py-2 rounded-full font-bold text-xl border-2 transition-colors duration-500 ${
            aligned
              ? 'bg-green-900/50 border-green-500 text-green-400'
              : 'bg-gray-900/50 border-gray-700 text-gray-500'
          }`}
        >
          {aligned ? '⚙️ SYNCHRONIZED' : '⚠️ MISALIGNED'}
        </div>

        <div className="flex flex-wrap justify-center gap-12">
          {gears.map(renderGear)}
        </div>
      </div>
    </MiniGameBase>
  );
};
