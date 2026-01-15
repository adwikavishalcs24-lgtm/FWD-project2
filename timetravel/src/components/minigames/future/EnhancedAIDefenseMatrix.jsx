import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const EnhancedAIDefenseMatrix = ({
  title = "AI Defense Matrix",
  timeline = "future",
  difficulty = "medium",
  onComplete,
  onClose,
  gameId
}) => {

  /* ===================== STATE ===================== */
  const [gameState, setGameState] = useState({
    defenseNodes: [],
    rogueNodes: [],
    firewallIntegrity: 100,
    systemLoad: 50,
    infectedNodes: 0,
    activeProtections: [],
    threatLevel: 1
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    threatsNeutralized: 0,
    efficiency: 100
  });

  const [threatLog, setThreatLog] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  const [isGameOver, setIsGameOver] = useState(false);
  const [coreCollapse, setCoreCollapse] = useState(false);

  const gameLoopRef = useRef(null);
  const threatSpawnerRef = useRef(null);

  /* ===================== INIT NETWORK ===================== */
  useEffect(() => {
    const nodeCount = { easy: 8, medium: 12, hard: 16 }[difficulty];
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: i,
        x: (i % 4) * 25 + 12.5,
        y: Math.floor(i / 4) * 25 + 12.5,
        status: 'active',
        power: 100,
        threatDetection: Math.random() * 100,
        cooldown: 0,
        connections: []
      });
    }

    nodes.forEach((node, i) => {
      nodes.forEach((other, j) => {
        if (i !== j) {
          const d = Math.hypot(node.x - other.x, node.y - other.y);
          if (d < 30 && Math.random() < 0.5) node.connections.push(j);
        }
      });
    });

    setGameState(prev => ({
      ...prev,
      defenseNodes: nodes,
      rogueNodes: [],
      firewallIntegrity: 100,
      systemLoad: 50,
      infectedNodes: 0,
      activeProtections: []
    }));
  }, [difficulty]);

  /* ===================== GAME OVER ===================== */
  const triggerCoreCollapse = useCallback(() => {
    if (isGameOver) return;

    setIsGameOver(true);
    setCoreCollapse(true);

    clearInterval(gameLoopRef.current);
    clearInterval(threatSpawnerRef.current);

    setSystemAlerts(prev => [...prev.slice(-2), {
      type: 'error',
      message: 'AI CORE COLLAPSED — NETWORK LOST',
      timestamp: Date.now()
    }]);

    setTimeout(() => {
      onComplete?.({ success: false, reason: 'core_collapse' });
    }, 2200);
  }, [isGameOver, onComplete]);

  /* ===================== THREAT GENERATION ===================== */
  const generateThreat = useCallback(() => {
    if (isGameOver) return;

    const severity = Math.floor(1 + Math.random() * gameState.threatLevel);
    const threat = {
      id: Date.now() + Math.random(),
      severity,
      targetNode: Math.floor(Math.random() * gameState.defenseNodes.length),
      arrivalTime: Date.now() + 1000 + Math.random() * 3000,
      active: false
    };

    setGameState(prev => ({
      ...prev,
      rogueNodes: [...prev.rogueNodes, threat]
    }));

    setThreatLog(prev => [...prev.slice(-9), {
      timestamp: new Date().toLocaleTimeString(),
      threat: 'AI Infiltration',
      severity: '⚠️'.repeat(severity),
      status: 'DETECTED'
    }]);
  }, [gameState.threatLevel, gameState.defenseNodes.length, isGameOver]);

  /* ===================== ACTIONS ===================== */
  const deployProtection = (nodeId) => {
    if (isGameOver) return;

    setGameState(prev => ({
      ...prev,
      activeProtections: [...prev.activeProtections, {
        id: Date.now() + Math.random(),
        nodeId,
        duration: 20
      }]
    }));
  };

  const neutralizeThreat = (threatId) => {
    if (isGameOver) return;

    setGameState(prev => {
      const threat = prev.rogueNodes.find(t => t.id === threatId);
      if (!threat) return prev;

      const success = Math.random() < 0.7;

      if (success) {
        setPerformanceMetrics(p => ({
          ...p,
          threatsNeutralized: p.threatsNeutralized + 1,
          efficiency: Math.min(100, p.efficiency + 2)
        }));

        setSystemAlerts(a => [...a.slice(-2), {
          type: 'success',
          message: 'Threat neutralized successfully',
          timestamp: Date.now()
        }]);

        return {
          ...prev,
          rogueNodes: prev.rogueNodes.filter(t => t.id !== threatId),
          systemLoad: Math.max(0, prev.systemLoad - 5)
        };
      }

      return {
        ...prev,
        firewallIntegrity: Math.max(0, prev.firewallIntegrity - threat.severity * 5),
        systemLoad: Math.min(100, prev.systemLoad + 10)
      };
    });
  };

  /* ===================== GAME LOOP ===================== */
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        if (isGameOver) return prev;

        let next = { ...prev };

        // Cooldowns + decay
        next.defenseNodes = prev.defenseNodes.map(n => ({
          ...n,
          cooldown: Math.max(0, n.cooldown - 1),
          power: Math.min(100, n.power + 0.3)
        }));

        // Activate threats
        const now = Date.now();
        next.rogueNodes = prev.rogueNodes.map(t => {
          if (!t.active && now >= t.arrivalTime) {
            next.infectedNodes += 1;
            next.firewallIntegrity = Math.max(0, next.firewallIntegrity - t.severity * 3);
            next.systemLoad = Math.min(100, next.systemLoad + t.severity * 2);
            return { ...t, active: true };
          }
          return t;
        });

        // Auto-neutralize
        next.rogueNodes.forEach(t => {
          if (t.active && Math.random() < 0.05) neutralizeThreat(t.id);
        });

        // GAME OVER CHECK
        if (
          next.firewallIntegrity <= 0 ||
          next.infectedNodes > next.defenseNodes.length / 2
        ) {
          triggerCoreCollapse();
          return next;
        }

        return next;
      });
    }, 120);

    return () => clearInterval(gameLoopRef.current);
  }, [isGameOver, triggerCoreCollapse]);

  /* ===================== THREAT SPAWNER ===================== */
  useEffect(() => {
    threatSpawnerRef.current = setInterval(() => {
      if (Math.random() < 0.3) generateThreat();
    }, 2000);

    return () => clearInterval(threatSpawnerRef.current);
  }, [generateThreat]);

  /* ===================== CLEANUP ===================== */
  useEffect(() => {
    return () => {
      clearInterval(gameLoopRef.current);
      clearInterval(threatSpawnerRef.current);
    };
  }, []);

  /* ===================== UI ===================== */
  return (
    <MiniGameBase
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Deploy protections and neutralize rogue AI threats before the network collapses."
      objective="Prevent AI Core Collapse."
      scoring="Efficiency, threat neutralization, and survival time determine score."
      duration={90}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative ai-defense-container">

        {/* ===== CORE COLLAPSE CINEMATIC ===== */}
        {coreCollapse && (
          <>
            <div className="absolute inset-0 bg-red-600 opacity-40 animate-ping z-40" />
            <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl font-extrabold text-red-500 animate-pulse mb-4">
                ☢️ AI CORE COLLAPSE
              </h1>
              <p className="text-gray-300 max-w-lg mb-6">
                Rogue intelligence overwhelmed the defense matrix.
                Network consciousness lost.
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
        <div className="flex justify-between px-6 mb-4">
          <div>
            <div>Firewall</div>
            <div className="text-xl">{gameState.firewallIntegrity}%</div>
          </div>
          <div>
            <div>System Load</div>
            <div className="text-xl">{gameState.systemLoad}%</div>
          </div>
          <div>
            <div>Neutralized</div>
            <div className="text-xl">{performanceMetrics.threatsNeutralized}</div>
          </div>
        </div>

        {/* ===== NETWORK VISUAL ===== */}
        <svg viewBox="0 0 100 100" className="w-full h-[420px]">
          {gameState.defenseNodes.map(n =>
            n.connections.map(t => {
              const target = gameState.defenseNodes.find(x => x.id === t);
              if (!target) return null;
              return (
                <line key={`${n.id}-${t}`}
                  x1={n.x} y1={n.y}
                  x2={target.x} y2={target.y}
                  stroke="#00e5ff" opacity="0.3" />
              );
            })
          )}

          {gameState.defenseNodes.map(n => (
            <circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r="3"
              fill="#00ff88"
              onClick={() => deployProtection(n.id)}
            />
          ))}

          {gameState.rogueNodes.map(t => {
            const node = gameState.defenseNodes[t.targetNode];
            return (
              <circle
                key={t.id}
                cx={node?.x}
                cy={node?.y}
                r="6"
                fill="#ff4444"
                onClick={() => neutralizeThreat(t.id)}
              />
            );
          })}
        </svg>

      </div>
    </MiniGameBase>
  );
};
