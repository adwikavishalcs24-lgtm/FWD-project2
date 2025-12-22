
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
  const [valves, setValves] = useState([false, false, false]); // 3 valves
  const [steamParticles, setSteamParticles] = useState([]);
  const [shaking, setShaking] = useState(0);

  const gameLoopRef = useRef();
  const gameRef = useRef(null);
  const ticksSinceScore = useRef(0);

  // Add visual steam particle
  const addSteam = (x, y) => {
    const id = Date.now() + Math.random();
    setSteamParticles(prev => [...prev, { id, x, y, life: 1.0 }]);
  };

  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setPressure(prev => {
        // Base pressure buildup
        let change = 0.5;

        // Valves release pressure
        const openValves = valves.filter(v => v).length;
        change -= openValves * 0.8;

        // Random fluctuations
        change += (Math.random() - 0.5) * 2;

        let newPressure = Math.max(0, Math.min(100, prev + change));

        // Calculate shake intensity based on danger
        if (newPressure > 80 || newPressure < 20) {
          setShaking(Math.min(10, Math.abs(newPressure - 50) / 5));
        } else {
          setShaking(0);
        }

        return newPressure;
      });

      // Update particles
      setSteamParticles(prev => prev.map(p => ({
        ...p,
        y: p.y - 2, // Rise up
        life: p.life - 0.05
      })).filter(p => p.life > 0));

      // Scoring Logic
      if (gameRef.current?.isGameStarted) {
        ticksSinceScore.current += 1;

        // Every 1 second (approx 20 ticks of 50ms)
        if (ticksSinceScore.current >= 20) {
          setPressure(currentPressure => {
            const deviation = Math.abs(currentPressure - 50);
            if (deviation < 10) { // 40-60 PSI
              gameRef.current.addPoints(20, 300, 300, 'good');
            } else if (deviation < 25) { // 25-75 PSI
              gameRef.current.addPoints(5, 300, 300, 'score');
            } else if (deviation > 40) { // <10 or >90
              gameRef.current.addPoints(-10, 300, 300, 'miss');
            }
            return currentPressure;
          });
          ticksSinceScore.current = 0;
        }
      }

    }, 50);

    return () => clearInterval(gameLoopRef.current);
  }, [valves]);

  const toggleValve = (index) => {
    if (!gameRef.current?.isGameStarted) return;
    setValves(prev => {
      const newValves = [...prev];
      newValves[index] = !newValves[index];
      return newValves;
    });
    // Add steam visual burst
    for (let i = 0; i < 5; i++) {
      addSteam(30 + index * 20 + Math.random() * 10, 50);
    }
  };

  const getStatus = () => {
    if (pressure > 90) return { text: "CRITICAL DANGER", color: "text-red-500", status: "danger" };
    if (pressure > 75) return { text: "WARNING: HIGH", color: "text-orange-500", status: "warning" };
    if (pressure < 25) return { text: "WARNING: LOW", color: "text-orange-500", status: "warning" };
    return { text: "OPTIMAL", color: "text-green-500", status: "optimal" };
  };

  const renderGame = () => {
    const status = getStatus();

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4"
        style={{ transform: `translate(${Math.random() * shaking - shaking / 2}px, ${Math.random() * shaking - shaking / 2}px)` }}>

        {/* Main Gauge */}
        <div className="relative w-64 h-64 mb-8">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Gauge Background */}
            <circle cx="50" cy="50" r="45" fill="#1f2937" stroke="#374151" strokeWidth="2" />

            {/* Tick Marks */}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(tick => {
              const angle = (tick / 100) * 270 - 135; // -135 to 135 degrees
              const rad = angle * (Math.PI / 180);
              const x1 = 50 + 35 * Math.cos(rad);
              const y1 = 50 + 35 * Math.sin(rad);
              const x2 = 50 + 40 * Math.cos(rad);
              const y2 = 50 + 40 * Math.sin(rad);
              const isDanger = tick < 20 || tick > 80;
              return (
                <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isDanger ? "#EF4444" : "#9CA3AF"} strokeWidth="2" />
              );
            })}

            {/* Optimal Zone Arc (approximate) */}
            <path d="M 28 78 A 40 40 0 0 1 72 78" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" transform="rotate(0 50 50)" opacity="0.5" />

            {/* Needle */}
            <line
              x1="50" y1="50"
              x2="50" y2="15"
              stroke="#F87171"
              strokeWidth="3"
              transform={`rotate(${(pressure / 100) * 270 - 135} 50 50)`}
              className="transition-transform duration-75 ease-out"
            />
            <circle cx="50" cy="50" r="4" fill="#D1D5DB" />
          </svg>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-8 text-center">
            <div className="text-2xl font-bold font-mono text-white">{Math.round(pressure)} PSI</div>
            <div className={`text-xs font-bold ${status.color} animate-pulse`}>{status.text}</div>
          </div>
        </div>

        {/* Valves Control */}
        <div className="flex gap-6 relative">
          {valves.map((isOpen, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <button
                onClick={() => toggleValve(idx)}
                className={`w-20 h-20 rounded-full border-4 shadow-lg transition-all duration-300 flex items-center justify-center
                            ${isOpen ? 'bg-red-900 border-red-500 rotate-180' : 'bg-gray-700 border-gray-500 rotate-0'}
                            hover:scale-105 active:scale-95`}
              >
                <div className="w-full h-4 bg-gray-400 rounded-full absolute"></div>
                <div className="h-full w-4 bg-gray-400 rounded-full absolute"></div>
                <div className="z-10 w-8 h-8 rounded-full bg-gray-300 shadow-inner"></div>
              </button>
              <span className="text-xs font-bold text-gray-400">VALVE {idx + 1}</span>
              <span className={`text-xs font-bold ${isOpen ? 'text-green-400' : 'text-red-400'}`}>
                {isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          ))}

          {/* Steam Particles Overlay */}
          {steamParticles.map(p => (
            <div
              key={p.id}
              className="absolute bg-white rounded-full blur-sm pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}px`,
                width: '20px',
                height: '20px',
                opacity: p.life * 0.5,
                transform: `scale(${2 - p.life})`
              }}
            />
          ))}
        </div>

      </div>
    );
  };

  const instructions = "Maintain the steam pressure between 40 and 60 PSI. Open valves to release pressure, close them to build it up. Warning: High pressure causes explosions!";
  const objective = "Keep the needle in the Green Zone.";
  const scoring = "Points are awarded every second the pressure is stable.";

  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions={instructions}
      objective={objective}
      scoring={scoring}
      duration={60}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      {renderGame()}
    </MiniGameBase>
  );
};
