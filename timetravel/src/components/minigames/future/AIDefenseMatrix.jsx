
import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const AIDefenseMatrix = ({
  title = "AI Defense Network",
  timeline = "future",
  difficulty = "hard"
}) => {
  const [gameState, setGameState] = useState({
    grid: [],
    playerPos: { x: 2, y: 2 },
    viruses: [],
    firewalls: [],
    packets: [],
    integrity: 100,
    threatLevel: 0,
    networkLoad: 0,
    activeNodes: 0,
    securityClearance: 1,
    detectedThreats: []
  });

  const [stats, setStats] = useState({
    threatsNeutralized: 0,
    packetsDelivered: 0,
    uptime: 0,
    efficiency: 100
  });

  const [activeEffects, setActiveEffects] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const gridSize = 5;
  const gameLoopRef = useRef();
  const gameRef = useRef(null);

  // Initialize Grid
  useEffect(() => {
    const initGrid = () => {
      const grid = [];
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          grid.push({
            id: `${x}-${y}`,
            x,
            y,
            type: 'node', // node, core, firewall, corrupted
            status: 'active', // active, inactive, compromised
            load: Math.random() * 30,
            security: Math.floor(Math.random() * 100)
          });
        }
      }

      // Set core
      const centerIndex = Math.floor(grid.length / 2);
      grid[centerIndex].type = 'core';
      grid[centerIndex].security = 100;

      setGameState(prev => ({
        ...prev,
        grid,
        playerPos: { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }
      }));
    };

    initGrid();
  }, [difficulty]);

  // Main game loop
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        const newState = { ...prev };

        // Spawn viruses
        if (Math.random() < (0.05 * (difficulty === 'hard' ? 2 : 1))) {
          const edgeNodes = newState.grid.filter(n =>
            n.x === 0 || n.x === gridSize - 1 || n.y === 0 || n.y === gridSize - 1
          );
          const spawnNode = edgeNodes[Math.floor(Math.random() * edgeNodes.length)];

          if (!newState.viruses.find(v => v.x === spawnNode.x && v.y === spawnNode.y)) {
            newState.viruses.push({
              id: Date.now(),
              x: spawnNode.x,
              y: spawnNode.y,
              type: Math.random() > 0.8 ? 'trojan' : 'malware',
              hp: 100
            });
          }
        }

        // Move viruses towards core
        const coreX = Math.floor(gridSize / 2);
        const coreY = Math.floor(gridSize / 2);

        newState.viruses = newState.viruses.map(v => {
          if (Math.random() > 0.3) return v; // Don't move every tick

          let dx = coreX - v.x;
          let dy = coreY - v.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            v.x += dx > 0 ? 1 : -1;
          } else {
            v.y += dy > 0 ? 1 : -1;
          }

          return v;
        });

        // Check collisions and damage
        newState.viruses.forEach(v => {
          if (v.x === coreX && v.y === coreY) {
            newState.integrity = Math.max(0, newState.integrity - 5);
            if (gameRef.current?.isGameStarted) {
              gameRef.current.addPoints(-50, 400, 300, 'miss');
            }
          }

          // Check firewall collision
          const nodeIndex = v.y * gridSize + v.x;
          if (newState.grid[nodeIndex].type === 'firewall') {
            v.hp -= 20;
          }
        });

        // Remove dead viruses
        const survivingViruses = newState.viruses.filter(v => v.hp > 0);
        if (survivingViruses.length < newState.viruses.length) {
          const killedCount = newState.viruses.length - survivingViruses.length;
          setStats(s => ({ ...s, threatsNeutralized: s.threatsNeutralized + killedCount }));
          if (gameRef.current?.isGameStarted) {
            gameRef.current.addPoints(killedCount * 50, 400, 300, 'score'); // Passive kill
          }
        }
        newState.viruses = survivingViruses;

        // Update stats
        newState.threatLevel = Math.min(100, newState.viruses.length * 10);

        return newState;
      });
    }, 500);

    return () => clearInterval(gameLoopRef.current);
  }, [difficulty]);

  const deployFirewall = (x, y) => {
    if (!gameRef.current?.isGameStarted) return;

    setGameState(prev => {
      const newGrid = [...prev.grid];
      const index = y * gridSize + x;

      if (newGrid[index].type === 'node') { // && prev.activeNodes > 0
        newGrid[index].type = 'firewall';
        // Add particle effect
        setActiveEffects(e => [...e, { x, y, type: 'deploy' }]);
        setTimeout(() => setActiveEffects(e => e.filter(eff => eff.type !== 'deploy')), 1000);
      }

      return { ...prev, grid: newGrid };
    });
  };

  const neutralizeThreat = (virusId) => {
    if (!gameRef.current?.isGameStarted) return;

    setGameState(prev => {
      const newViruses = prev.viruses.filter(v => v.id !== virusId);
      if (newViruses.length < prev.viruses.length) {
        // Success effect
        if (gameRef.current) {
          gameRef.current.addPoints(100, 400, 300, 'perfect'); // Manual kill bonus
        }
        return {
          ...prev,
          viruses: newViruses,
          integrity: Math.min(100, prev.integrity + 1)
        };
      }
      return prev;
    });
    setStats(prev => ({ ...prev, threatsNeutralized: prev.threatsNeutralized + 1 }));
  };

  const renderGrid = () => {
    return (
      <div
        className="grid gap-1 bg-gray-900 p-2 rounded-lg border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: 'fit-content',
          margin: '0 auto'
        }}
      >
        {gameState.grid.map((node) => {
          const isCore = node.type === 'core';
          const isFirewall = node.type === 'firewall';
          const virus = gameState.viruses.find(v => v.x === node.x && v.y === node.y);

          return (
            <div
              key={node.id}
              className={`
                w-16 h-16 flex items-center justify-center relative cursor-pointer transition-all duration-300
                ${isCore ? 'bg-blue-900 border-2 border-blue-400' :
                  isFirewall ? 'bg-green-900 border border-green-500' :
                    'bg-gray-800 border border-gray-700 hover:border-blue-500'}
                ${virus ? 'bg-red-900/50 animate-pulse' : ''}
              `}
              onClick={() => virus ? neutralizeThreat(virus.id) : deployFirewall(node.x, node.y)}
            >
              {isCore && <span className="text-2xl">💠</span>}
              {isFirewall && <span className="text-xl">🛡️</span>}
              {virus && <span className="text-2xl animate-bounce">👾</span>}

              {!isCore && !isFirewall && !virus && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mx-0.5 animate-ping"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const instructions = `
    Protect the Neural Core 💠 from incoming viral threats 👾.
    • Click empty nodes to deploy Firewalls 🛡️.
    • Click viruses directly to manually neutralize them (Manual Override).
    • Maintain System Integrity above 0%.
  `;

  const objective = "Protect the Core from Malware.";
  const scoring = "+50 pts per virus neutralized. +100 pts for high integrity survival.";

  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      instructions={instructions}
      objective={objective}
      scoring={scoring}
      duration={60}
      difficulty={difficulty}
    >
      <div className="flex flex-col items-center h-full">
        {/* HUD */}
        <div className="flex w-full justify-between mb-4 px-4">
          <div className="bg-gray-800 px-4 py-2 rounded border border-blue-500">
            <div className="text-xs text-blue-300 uppercase">System Integrity</div>
            <div className={`text-2xl font-bold font-mono ${gameState.integrity < 30 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
              {Math.round(gameState.integrity)}%
            </div>
          </div>

          <div className="bg-gray-800 px-4 py-2 rounded border border-red-500">
            <div className="text-xs text-red-300 uppercase">Threat Level</div>
            <div className="text-2xl font-bold font-mono text-red-400">
              {gameState.threatLevel}%
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1 flex items-center justify-center relative">
          {renderGrid()}

          {/* Scan Line Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-b from-transparent via-blue-500 to-transparent h-4 w-full animate-[scan_2s_linear_infinite]" />
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex gap-4">
          <div className="text-sm text-gray-400 font-mono">
            Neutralized: <span className="text-white">{stats.threatsNeutralized}</span>
          </div>
        </div>
      </div>
    </MiniGameBase>
  );
};
