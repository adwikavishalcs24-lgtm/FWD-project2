import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const SteamEnginePressureControl = ({
  title = "Steam Engine Pressure Control",
  timeline = "past",
  difficulty = "medium",
  onComplete,
  onClose,
  gameId
}) => {
  const [pressure, setPressure] = useState(50);
  const [valves, setValves] = useState([false, false, false]);
  const [steamParticles, setSteamParticles] = useState([]);
  const [shaking, setShaking] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [exploded, setExploded] = useState(false);

  const gameLoopRef = useRef(null);
  const gameRef = useRef(null);
  const ticksSinceScore = useRef(0);

  /* ===================== STEAM ===================== */
  const addSteam = (x, y, count = 1) => {
    const particles = Array.from({ length: count }).map(() => ({
      id: Date.now() + Math.random(),
      x: x + Math.random() * 10 - 5,
      y,
      life: 1
    }));
    setSteamParticles(p => [...p, ...particles]);
  };

  /* ===================== EXPLOSION ===================== */
  const triggerExplosion = () => {
    if (isGameOver) return;

    setIsGameOver(true);
    setExploded(true);
    clearInterval(gameLoopRef.current);

    // Huge steam burst
    for (let i = 0; i < 40; i++) {
      addSteam(50, 60, 1);
    }

    gameRef.current?.addPoints(-200, 400, 300, 'critical');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: false,
        reason: 'boiler_exploded'
      });
    }, 2200);
  };

  /* ===================== GAME LOOP ===================== */
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      if (isGameOver) return;

      setPressure(prev => {
        let change = 0.6;

        const openValves = valves.filter(v => v).length;
        change -= openValves * 0.9;
        change += (Math.random() - 0.5) * 2;

        const next = Math.max(0, Math.min(100, prev + change));

        if (next <= 0 || next >= 100) {
          triggerExplosion();
          return next;
        }

        if (next > 80 || next < 20) {
          setShaking(Math.min(12, Math.abs(next - 50) / 4));
        } else {
          setShaking(0);
        }

        return next;
      });

      setSteamParticles(p =>
        p
          .map(s => ({ ...s, y: s.y - 2, life: s.life - 0.04 }))
          .filter(s => s.life > 0)
      );

      if (gameRef.current?.isGameStarted) {
        ticksSinceScore.current++;

        if (ticksSinceScore.current >= 20) {
          setPressure(p => {
            const dev = Math.abs(p - 50);
            if (dev < 10) gameRef.current.addPoints(20, 300, 300, 'good');
            else if (dev < 25) gameRef.current.addPoints(5, 300, 300, 'score');
            else gameRef.current.addPoints(-10, 300, 300, 'miss');
            return p;
          });
          ticksSinceScore.current = 0;
        }
      }
    }, 50);

    return () => clearInterval(gameLoopRef.current);
  }, [valves, isGameOver]);

  /* ===================== CONTROLS ===================== */
  const toggleValve = index => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;

    setValves(v => {
      const n = [...v];
      n[index] = !n[index];
      return n;
    });

    addSteam(30 + index * 20, 60, 6);
  };

  /* ===================== STATUS ===================== */
  const getStatus = () => {
    if (pressure > 90) return { text: "CRITICAL", color: "text-red-500" };
    if (pressure > 75 || pressure < 25)
      return { text: "WARNING", color: "text-orange-400" };
    return { text: "OPTIMAL", color: "text-green-400" };
  };

  const status = getStatus();

  /* ===================== RENDER ===================== */
  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Maintain pressure between 40–60 PSI. Open valves to release steam."
      objective="Prevent the boiler from exploding."
      scoring="Points awarded every second of stable pressure."
      duration={60}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div
        className="relative w-full h-full flex flex-col items-center justify-center"
        style={{
          transform: `translate(${Math.random() * shaking - shaking / 2}px,
                                ${Math.random() * shaking - shaking / 2}px)`
        }}
      >
        {/* ===== EXPLOSION OVERLAY ===== */}
        {exploded && (
          <div className="absolute inset-0 bg-red-600/40 z-50 flex flex-col items-center justify-center text-center animate-pulse">
            <h1 className="text-5xl font-extrabold text-white mb-4">
              💥 BOILER EXPLOSION
            </h1>
            <p className="text-gray-200 mb-6 max-w-md">
              The pressure exceeded safe limits. The steam engine is destroyed.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-red-700 rounded-lg font-bold text-white"
            >
              Exit Timeline
            </button>
          </div>
        )}

        {/* ===== GAUGE ===== */}
        <div className="relative w-64 h-64 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#1f2937" stroke="#374151" strokeWidth="2" />
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="15"
              stroke="#f87171"
              strokeWidth="3"
              transform={`rotate(${(pressure / 100) * 270 - 135} 50 50)`}
            />
            <circle cx="50" cy="50" r="4" fill="#d1d5db" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-12">
            <div className="text-2xl font-mono text-white">{Math.round(pressure)} PSI</div>
            <div className={`text-xs font-bold ${status.color}`}>{status.text}</div>
          </div>
        </div>

        {/* ===== VALVES ===== */}
        <div className="flex gap-6 relative">
          {valves.map((open, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <button
                disabled={isGameOver}
                onClick={() => toggleValve(i)}
                className={`w-20 h-20 rounded-full border-4 transition-all
                  ${open ? 'bg-red-900 border-red-500 rotate-180' : 'bg-gray-700 border-gray-500'}
                  hover:scale-105`}
              />
              <span className="text-xs text-gray-400">VALVE {i + 1}</span>
            </div>
          ))}

          {/* ===== STEAM ===== */}
          {steamParticles.map(p => (
            <div
              key={p.id}
              className="absolute bg-white rounded-full blur-md pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}px`,
                width: '24px',
                height: '24px',
                opacity: p.life
              }}
            />
          ))}
        </div>
      </div>
    </MiniGameBase>
  );
};
