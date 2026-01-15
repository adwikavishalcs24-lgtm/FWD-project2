import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const AIDefenseMatrix = ({
  title = "AI Defense Network",
  timeline = "future",
  difficulty = "hard",
  onComplete,
  onClose,
  gameId
}) => {
  const gridSize = 5;

  const [gameState, setGameState] = useState({
    grid: [],
    viruses: [],
    integrity: 100,
    threatLevel: 0
  });

  const [stats, setStats] = useState({
    threatsNeutralized: 0
  });

  const [isGameOver, setIsGameOver] = useState(false);
  const [coreBreached, setCoreBreached] = useState(false);

  const gameLoopRef = useRef(null);
  const gameRef = useRef(null);

  /* ================= INITIALIZE GRID ================= */
  useEffect(() => {
    const grid = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        grid.push({
          id: `${x}-${y}`,
          x,
          y,
          type: 'node'
        });
      }
    }

    const center = Math.floor(grid.length / 2);
    grid[center].type = 'core';

    setGameState({
      grid,
      viruses: [],
      integrity: 100,
      threatLevel: 0
    });
  }, [difficulty]);

  /* ================= CORE BREACH ================= */
  const triggerCoreBreach = () => {
    if (isGameOver) return;

    setIsGameOver(true);
    setCoreBreached(true);
    clearInterval(gameLoopRef.current);

    gameRef.current?.addPoints(-200, 400, 300, 'miss');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: false,
        reason: 'core_breach'
      });
    }, 2200);
  };

  /* ================= GAME LOOP ================= */
  useEffect(() => {
    if (isGameOver) return;

    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        let newState = { ...prev };

        /* ---- Spawn Virus ---- */
        if (Math.random() < 0.08) {
          const edges = prev.grid.filter(
            n => n.x === 0 || n.y === 0 || n.x === gridSize - 1 || n.y === gridSize - 1
          );
          const spawn = edges[Math.floor(Math.random() * edges.length)];

          newState.viruses.push({
            id: Date.now() + Math.random(),
            x: spawn.x,
            y: spawn.y,
            hp: 100
          });
        }

        /* ---- Move Viruses ---- */
        const cx = Math.floor(gridSize / 2);
        const cy = Math.floor(gridSize / 2);

        newState.viruses = newState.viruses.map(v => {
          if (Math.random() > 0.6) return v;
          if (v.x !== cx) v.x += v.x < cx ? 1 : -1;
          else if (v.y !== cy) v.y += v.y < cy ? 1 : -1;
          return v;
        });

        /* ---- Damage Core ---- */
        newState.viruses.forEach(v => {
          if (v.x === cx && v.y === cy) {
            newState.integrity -= 6;
            gameRef.current?.addPoints(-40, 400, 300, 'miss');
          }
        });

        /* ---- Check Breach ---- */
        if (newState.integrity <= 0) {
          triggerCoreBreach();
          return newState;
        }

        newState.threatLevel = Math.min(100, newState.viruses.length * 12);
        return newState;
      });
    }, 500);

    return () => clearInterval(gameLoopRef.current);
  }, [isGameOver]);

  /* ================= ACTIONS ================= */
  const deployFirewall = (x, y) => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;

    setGameState(prev => {
      const grid = [...prev.grid];
      const idx = y * gridSize + x;

      if (grid[idx].type === 'node') {
        grid[idx].type = 'firewall';
      }
      return { ...prev, grid };
    });
  };

  const neutralizeThreat = id => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;

    setGameState(prev => {
      const remaining = prev.viruses.filter(v => v.id !== id);
      if (remaining.length < prev.viruses.length) {
        gameRef.current?.addPoints(100, 400, 300, 'perfect');
        setStats(s => ({ ...s, threatsNeutralized: s.threatsNeutralized + 1 }));
      }
      return { ...prev, viruses: remaining };
    });
  };

  /* ================= GRID ================= */
  const renderGrid = () => (
    <div
      className="grid gap-1 bg-gray-900 p-2 rounded-lg border-2 border-blue-500"
      style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
    >
      {gameState.grid.map(node => {
        const virus = gameState.viruses.find(v => v.x === node.x && v.y === node.y);
        const isCore = node.type === 'core';

        return (
          <div
            key={node.id}
            onClick={() =>
              virus ? neutralizeThreat(virus.id) : deployFirewall(node.x, node.y)
            }
            className={`
              w-16 h-16 flex items-center justify-center cursor-pointer relative
              ${isCore ? 'bg-blue-900 border-2 border-blue-400' :
              node.type === 'firewall' ? 'bg-green-900 border border-green-500' :
              'bg-gray-800 border border-gray-700'}
              ${virus ? 'bg-red-900/50 animate-pulse' : ''}
            `}
          >
            {isCore && <span className="text-2xl">💠</span>}
            {node.type === 'firewall' && <span>🛡️</span>}
            {virus && <span className="text-2xl animate-bounce">👾</span>}
          </div>
        );
      })}
    </div>
  );

  /* ================= UI ================= */
  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Defend the Neural Core. Deploy firewalls or manually eliminate threats."
      objective="Prevent a Core Breach."
      scoring="+100 manual kills · Survival bonus"
      duration={60}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative w-full h-full flex flex-col items-center">

        {/* ===== CORE BREACH CINEMATIC ===== */}
        {coreBreached && (
          <>
            <div className="absolute inset-0 bg-red-600 opacity-40 animate-ping z-40" />
            <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
              <h1 className="text-5xl font-extrabold text-red-500 animate-pulse mb-4">
                ☢️ CORE BREACH
              </h1>
              <p className="text-gray-300 mb-6 text-center max-w-md">
                The AI Defense Network has collapsed. Malware overwhelmed the Neural Core.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700"
              >
                Exit Timeline
              </button>
            </div>
          </>
        )}

        {/* ===== HUD ===== */}
        <div className="flex justify-between w-full px-6 mb-4">
          <div className="bg-gray-800 px-4 py-2 rounded border border-blue-500">
            <div className="text-xs text-blue-300">Integrity</div>
            <div className={`text-2xl font-mono ${gameState.integrity < 30 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
              {Math.max(0, Math.round(gameState.integrity))}%
            </div>
          </div>

          <div className="bg-gray-800 px-4 py-2 rounded border border-red-500">
            <div className="text-xs text-red-300">Threat Level</div>
            <div className="text-2xl font-mono text-red-400">
              {gameState.threatLevel}%
            </div>
          </div>
        </div>

        {/* ===== GRID ===== */}
        <div className="flex-1 flex items-center justify-center">
          {renderGrid()}
        </div>

        {/* ===== STATS ===== */}
        <div className="mt-4 text-sm text-gray-400 font-mono">
          Neutralized: <span className="text-white">{stats.threatsNeutralized}</span>
        </div>
      </div>
    </MiniGameBase>
  );
};
