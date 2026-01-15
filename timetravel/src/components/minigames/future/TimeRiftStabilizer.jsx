import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const TimeRiftStabilizer = ({
  title = "Time Rift Stabilizer",
  timeline = "future",
  difficulty = "hard",
  onComplete,
  onClose,
  gameId
}) => {
  const [riftStability, setRiftStability] = useState(50);
  const [frequencies, setFrequencies] = useState([
    { id: 1, val: 50, target: 50, color: '#22d3ee' },
    { id: 2, val: 50, target: 50, color: '#a855f7' },
    { id: 3, val: 50, target: 50, color: '#ec4899' }
  ]);
  const [resonance, setResonance] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [riftCollapse, setRiftCollapse] = useState(false);

  const gameLoopRef = useRef(null);
  const adjustIntervals = useRef({});
  const gameRef = useRef(null);

  /* ===================== GAME OVER ===================== */
  const triggerRiftCollapse = () => {
    if (isGameOver) return;

    setIsGameOver(true);
    setRiftCollapse(true);

    clearInterval(gameLoopRef.current);
    Object.values(adjustIntervals.current).forEach(clearInterval);
    adjustIntervals.current = {};

    gameRef.current?.addPoints(-200, 400, 300, 'miss');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: false,
        reason: 'time_rift_collapse'
      });
    }, 2200);
  };

  /* ===================== DRIFT + RESONANCE LOOP ===================== */
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      if (isGameOver) return;

      // Drift targets
      setFrequencies(prev =>
        prev.map(f => {
          if (Math.random() < 0.1) {
            const drift = (Math.random() - 0.5) * 30;
            return {
              ...f,
              target: Math.max(10, Math.min(90, f.target + drift))
            };
          }
          return f;
        })
      );

      // Resonance + stability
      setFrequencies(current => {
        const totalDiff = current.reduce(
          (acc, f) => acc + Math.abs(f.val - f.target),
          0
        );

        const newResonance = Math.max(0, 100 - totalDiff / 3);
        setResonance(newResonance);

        setRiftStability(prev => {
          let next =
            newResonance > 80 ? prev + 0.6 :
            newResonance < 40 ? prev - 0.7 :
            prev - 0.15;

          next = Math.max(0, Math.min(100, next));
          if (next <= 0) triggerRiftCollapse();
          return next;
        });

        if (gameRef.current?.isGameStarted && Math.random() < 0.2) {
          if (newResonance > 90) {
            gameRef.current.addPoints(20, 300, 200, 'perfect');
          } else if (newResonance > 70) {
            gameRef.current.addPoints(5, 300, 200, 'good');
          }
        }

        return current;
      });
    }, 100);

    return () => {
      clearInterval(gameLoopRef.current);
      Object.values(adjustIntervals.current).forEach(clearInterval);
    };
  }, [isGameOver]);

  /* ===================== FREQUENCY CONTROL ===================== */
  const adjustFrequency = (id, delta) => {
    setFrequencies(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, val: Math.max(0, Math.min(100, f.val + delta)) }
          : f
      )
    );
  };

  const startAdjusting = (id, delta) => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;
    if (adjustIntervals.current[id]) return;

    adjustIntervals.current[id] = setInterval(() => {
      adjustFrequency(id, delta);
    }, 50);
  };

  const stopAdjusting = id => {
    if (adjustIntervals.current[id]) {
      clearInterval(adjustIntervals.current[id]);
      delete adjustIntervals.current[id];
    }
  };

  /* ===================== UI ===================== */
  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Align containment frequencies with drifting flux targets to stabilize the Time Rift."
      objective="Maintain Rift Stability above 0%."
      scoring="Higher resonance yields higher scores."
      duration={60}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden">

        {/* ===== RIFT COLLAPSE CINEMATIC ===== */}
        {riftCollapse && (
          <>
            <div className="absolute inset-0 bg-purple-700 opacity-40 animate-ping z-40" />
            <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl font-extrabold text-purple-400 animate-pulse mb-4">
                🕳️ TIME RIFT COLLAPSE
              </h1>
              <p className="text-gray-300 max-w-md mb-6">
                Temporal resonance lost. Reality destabilized.
                The timeline has fractured.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-700"
              >
                Seal Timeline
              </button>
            </div>
          </>
        )}

        {/* ===== RIFT VISUAL ===== */}
        <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full border-4 border-dashed border-opacity-50
              ${riftStability < 30 ? 'border-red-500 animate-spin-fast' : 'border-cyan-500 animate-spin-slow'}`}
          />
          <div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-900 to-black blur-md opacity-80"
            style={{ transform: `scale(${0.5 + resonance / 200})` }}
          />
          <div className="z-10 text-center">
            <div className="text-xs uppercase tracking-widest text-gray-400">
              Rift Stability
            </div>
            <div className={`text-4xl font-bold ${riftStability < 30 ? 'text-red-500' : 'text-cyan-400'}`}>
              {Math.round(riftStability)}%
            </div>
          </div>
        </div>

        {/* ===== FREQUENCIES ===== */}
        <div className="w-full max-w-md space-y-6 bg-black/40 p-6 rounded-xl border border-gray-700">
          {frequencies.map(freq => (
            <div key={freq.id} className="relative pt-6">
              <div
                className="absolute top-2 w-4 h-4 border-2 rotate-45 -translate-x-1/2"
                style={{ left: `${freq.target}%`, borderColor: freq.color }}
              />
              <div className="h-2 bg-gray-800 rounded-full mb-2">
                <div
                  className="h-full transition-all duration-75"
                  style={{
                    width: `${freq.val}%`,
                    backgroundColor: freq.color,
                    boxShadow: `0 0 10px ${freq.color}`
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <button
                  disabled={isGameOver}
                  onMouseDown={() => startAdjusting(freq.id, -5)}
                  onMouseUp={() => stopAdjusting(freq.id)}
                  onMouseLeave={() => stopAdjusting(freq.id)}
                  className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 text-white"
                >
                  {'<'}
                </button>
                <span className="text-xs font-bold text-gray-400">
                  Field {freq.id}
                </span>
                <button
                  disabled={isGameOver}
                  onMouseDown={() => startAdjusting(freq.id, 5)}
                  onMouseUp={() => stopAdjusting(freq.id)}
                  onMouseLeave={() => stopAdjusting(freq.id)}
                  className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 text-white"
                >
                  {'>'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ===== RESONANCE BAR ===== */}
        <div className="mt-4 w-full max-w-md">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Total Resonance</span>
            <span>{Math.round(resonance)}%</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-300
                ${resonance > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${resonance}%` }}
            />
          </div>
        </div>

      </div>
    </MiniGameBase>
  );
};
