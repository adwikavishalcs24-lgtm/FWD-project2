import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const EnergyGridBalancer = ({
  title = "Grid Operator",
  timeline = "present",
  difficulty = "medium",
  onComplete,
  onClose,
  gameId
}) => {
  const [demand, setDemand] = useState(500);
  const [sources, setSources] = useState([
    { id: 'solar', name: 'Solar', output: 100, max: 200, color: 'text-yellow-400', bg: 'bg-yellow-500' },
    { id: 'wind', name: 'Wind', output: 150, max: 250, color: 'text-blue-400', bg: 'bg-blue-500' },
    { id: 'nuclear', name: 'Nuclear', output: 250, max: 400, color: 'text-green-400', bg: 'bg-green-500' },
  ]);

  const [supply, setSupply] = useState(500);
  const [blackouts, setBlackouts] = useState(0);
  const [optimalTime, setOptimalTime] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  const gameRef = useRef(null);
  const loopRef = useRef(null);

  /* ===================== HELPERS ===================== */
  const calculateSupply = srcs =>
    srcs.reduce((acc, s) => acc + s.output, 0);

  const getGridHealth = (s, d) => {
    const diff = Math.abs(s - d);
    if (diff < 20) return { status: 'OPTIMAL', color: 'text-green-500' };
    if (diff < 50) return { status: 'STABLE', color: 'text-blue-500' };
    if (diff < 100) return { status: 'UNSTABLE', color: 'text-orange-500' };
    return { status: 'CRITICAL', color: 'text-red-500' };
  };

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
        reason: 'grid_stabilized'
      });
    }, 2200);
  };

  const triggerFailure = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    setSuccess(false);
    clearInterval(loopRef.current);

    gameRef.current?.addPoints(-150, 400, 300, 'critical');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: false,
        reason: 'grid_collapse'
      });
    }, 2200);
  };

  /* ===================== MAIN LOOP ===================== */
  useEffect(() => {
    loopRef.current = setInterval(() => {
      if (isGameOver) return;

      // Demand fluctuation
      setDemand(prev => {
        const delta = (Math.random() - 0.5) * 60;
        return Math.max(200, Math.min(800, prev + delta));
      });

      // Supply recalculation
      const currentSupply = calculateSupply(sources);
      setSupply(currentSupply);

      const diff = Math.abs(currentSupply - demand);

      if (diff < 20) {
        // Optimal
        setOptimalTime(t => {
          const next = t + 1;
          if (gameRef.current?.isGameStarted) {
            gameRef.current.addPoints(20, 300, 120, 'perfect');
          }
          if (next >= 10) triggerSuccess(); // 10 seconds perfect
          return next;
        });
      } else {
        setOptimalTime(0);

        if (diff < 50 && gameRef.current?.isGameStarted) {
          gameRef.current.addPoints(5, 300, 120, 'score');
        }

        if (diff > 100) {
          setBlackouts(b => {
            const next = b + 1;
            if (gameRef.current?.isGameStarted) {
              gameRef.current.addPoints(-10, 300, 120, 'miss');
            }
            if (next >= 5) triggerFailure(); // too many failures
            return next;
          });
        }
      }
    }, 1000);

    return () => clearInterval(loopRef.current);
  }, [sources, demand, isGameOver]); // intentional: sources & demand affect balance

  /* ===================== CONTROLS ===================== */
  const adjustOutput = (id, value) => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;
    setSources(prev =>
      prev.map(src =>
        src.id === id ? { ...src, output: parseInt(value, 10) } : src
      )
    );
  };

  const health = getGridHealth(supply, demand);

  /* ===================== RENDER ===================== */
  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Match total supply to fluctuating grid demand."
      objective="Maintain grid stability."
      scoring="Perfect balance yields maximum points."
      duration={60}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative w-full h-full flex flex-col p-4">

        {/* ===== END OVERLAY ===== */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center text-center">
            <h1
              className={`text-5xl font-extrabold mb-4 animate-pulse ${
                success ? 'text-green-400' : 'text-red-500'
              }`}
            >
              {success ? '⚡ GRID STABILIZED' : '🚨 GRID COLLAPSE'}
            </h1>
            <p className="text-gray-300 mb-6 max-w-md">
              {success
                ? 'The power grid hums in perfect balance.'
                : 'Cascading failures plunge the grid into darkness.'}
            </p>
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-bold ${
                success ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              Exit Control Room
            </button>
          </div>
        )}

        {/* ===== METERS ===== */}
        <div className="flex justify-around items-center mb-8 bg-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="text-center">
            <div className="text-gray-400 mb-1">Grid Demand</div>
            <div className="text-4xl font-bold text-white">{Math.round(demand)} MW</div>
          </div>

          <div className="text-center px-8">
            <div className={`text-2xl font-bold ${health.color}`}>{health.status}</div>
            <div className="text-xs text-gray-500">Grid Status</div>
          </div>

          <div className="text-center">
            <div className="text-gray-400 mb-1">Total Supply</div>
            <div className="text-4xl font-bold text-white">{Math.round(supply)} MW</div>
          </div>
        </div>

        {/* ===== CONTROLS ===== */}
        <div className="space-y-6">
          {sources.map(src => (
            <div key={src.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className={`font-bold ${src.color}`}>{src.name}</span>
                <span className="font-mono text-white">{src.output} MW</span>
              </div>
              <input
                type="range"
                min="0"
                max={src.max}
                value={src.output}
                disabled={isGameOver}
                onChange={e => adjustOutput(src.id, e.target.value)}
                className={`w-full h-3 rounded-lg appearance-none cursor-pointer ${src.bg}`}
              />
            </div>
          ))}
        </div>

        {/* ===== BLACKOUTS ===== */}
        <div className="mt-8 text-center text-red-400 font-bold">
          Grid Failures: {blackouts} / 5
        </div>

      </div>
    </MiniGameBase>
  );
};
