import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const EnhancedTrafficSignalController = ({
  title = "Smart Traffic Control System",
  timeline = "present",
  difficulty = "medium",
  onComplete,
  onClose,
  gameId
}) => {
  /* ===================== STATE ===================== */
  const [intersections, setIntersections] = useState([]);
  const [algorithm, setAlgorithm] = useState('fixed');

  const [stats, setStats] = useState({
    congestion: 0,
    pollution: 0,
    efficiency: 100,
    processed: 0,
    accidents: 0
  });

  const [isGameOver, setIsGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  const gameRef = useRef(null);
  const loopRef = useRef(null);
  const spawnRef = useRef(null);

  /* ===================== INIT ===================== */
  useEffect(() => {
    const count = { easy: 4, medium: 6, hard: 9 }[difficulty];

    const grid = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: 100 + (i % 3) * 200,
      y: 100 + Math.floor(i / 3) * 200,
      queues: { north: 0, south: 0, east: 0, west: 0 },
      nsGreen: true,
      timer: 30
    }));

    setIntersections(grid);
  }, [difficulty]);

  /* ===================== HELPERS ===================== */
  const congestionOf = i =>
    Object.values(i.queues).reduce((a, b) => a + b, 0);

  const processRate = () => {
    switch (algorithm) {
      case 'adaptive': return 2;
      case 'ai': return 3;
      case 'predictive': return 2.5;
      default: return 1;
    }
  };

  /* ===================== GAME END ===================== */
  const endGame = win => {
    if (isGameOver) return;
    setIsGameOver(true);
    setSuccess(win);
    clearInterval(loopRef.current);
    clearInterval(spawnRef.current);

    gameRef.current?.endGame({
      success: win,
      reason: win ? 'traffic_optimized' : 'gridlock'
    });
  };

  /* ===================== VEHICLE SPAWN ===================== */
  useEffect(() => {
    spawnRef.current = setInterval(() => {
      setIntersections(prev =>
        prev.map(i => {
          const dir = ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)];
          return {
            ...i,
            queues: { ...i.queues, [dir]: i.queues[dir] + 1 }
          };
        })
      );
    }, 1500);

    return () => clearInterval(spawnRef.current);
  }, []);

  /* ===================== MAIN LOOP ===================== */
  useEffect(() => {
    loopRef.current = setInterval(() => {
      if (isGameOver) return;

      setIntersections(prev =>
        prev.map(i => {
          const rate = processRate();

          const canMoveNS = i.nsGreen;
          const updatedQueues = { ...i.queues };

          if (canMoveNS) {
            updatedQueues.north = Math.max(0, updatedQueues.north - rate);
            updatedQueues.south = Math.max(0, updatedQueues.south - rate);
          } else {
            updatedQueues.east = Math.max(0, updatedQueues.east - rate);
            updatedQueues.west = Math.max(0, updatedQueues.west - rate);
          }

          return {
            ...i,
            queues: updatedQueues,
            timer: i.timer - 1 <= 0 ? 30 : i.timer - 1,
            nsGreen: i.timer - 1 <= 0 ? !i.nsGreen : i.nsGreen
          };
        })
      );

      setStats(prev => {
        const totalCongestion = intersections.reduce(
          (a, i) => a + congestionOf(i), 0
        );

        const pollution = Math.min(100, totalCongestion * 2);
        const efficiency = Math.max(0, 100 - totalCongestion);

        if (gameRef.current?.isGameStarted) {
          if (totalCongestion < 10)
            gameRef.current.addPoints(15, 300, 150, 'perfect');
          else if (totalCongestion < 20)
            gameRef.current.addPoints(5, 300, 150, 'score');
          else
            gameRef.current.addPoints(-5, 300, 150, 'miss');
        }

        if (totalCongestion > 50) endGame(false);

        return {
          congestion: totalCongestion,
          pollution,
          efficiency,
          processed: prev.processed + Math.floor(processRate()),
          accidents: prev.accidents
        };
      });

    }, 1000);

    return () => clearInterval(loopRef.current);
  }, [algorithm, intersections, isGameOver]);

  /* ===================== SUCCESS ===================== */
  useEffect(() => {
    if (stats.efficiency > 85 && stats.processed > 150) {
      endGame(true);
    }
  }, [stats]);

  /* ===================== RENDER ===================== */
  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Manage traffic lights and algorithms to prevent congestion."
      objective="Maintain traffic efficiency above 85%."
      scoring="Low congestion earns more points."
      duration={75}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative w-full h-full p-4">

        {/* END SCREEN */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
            <h1 className={`text-5xl font-bold mb-4 ${success ? 'text-green-400' : 'text-red-500'}`}>
              {success ? '🚦 CITY FLOW OPTIMIZED' : '🚧 GRIDLOCK'}
            </h1>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 rounded-lg text-white"
            >
              Exit Control Room
            </button>
          </div>
        )}

        {/* NETWORK */}
        <svg viewBox="0 0 600 400" className="w-full h-[60%] bg-gray-900 rounded-xl">
          {intersections.map(i => (
            <g key={i.id}>
              <circle cx={i.x} cy={i.y} r="18" fill="#222" stroke="#fff" />
              <text
                x={i.x}
                y={i.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
              >
                {congestionOf(i)}
              </text>
            </g>
          ))}
        </svg>

        {/* CONTROLS */}
        <div className="mt-6 flex gap-4 justify-center">
          {['fixed', 'adaptive', 'ai', 'predictive'].map(a => (
            <button
              key={a}
              onClick={() => setAlgorithm(a)}
              className={`px-4 py-2 rounded ${
                algorithm === a ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              {a.toUpperCase()}
            </button>
          ))}
        </div>

        {/* STATS */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>🚗 Congestion: {stats.congestion}</div>
          <div>🌫 Pollution: {stats.pollution}%</div>
          <div>⚙ Efficiency: {stats.efficiency}%</div>
        </div>

      </div>
    </MiniGameBase>
  );
};
