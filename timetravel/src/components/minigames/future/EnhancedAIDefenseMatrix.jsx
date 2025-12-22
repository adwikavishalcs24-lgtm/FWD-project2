
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
  const [gameState, setGameState] = useState({
    defenseNodes: [],
    rogueNodes: [],
    networkActivity: 0,
    firewallIntegrity: 100,
    systemLoad: 50,
    securityLevel: 1,
    activeProtections: [],
    threatLevel: 1,
    infectedNodes: 0,
    protectionCooldowns: new Map(),
    networkTopology: 'mesh',
    aiAssistance: false
  });

  const [combatSequence, setCombatSequence] = useState([]);
  const [threatLog, setThreatLog] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [neuralNetwork, setNeuralNetwork] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    threatsNeutralized: 0,
    falsePositives: 0,
    responseTime: 0,
    efficiency: 100
  });

  const gameLoopRef = useRef();
  const threatSpawnerRef = useRef();

  // Initialize defense network
  useEffect(() => {
    const initializeNetwork = () => {
      const nodeCount = { easy: 8, medium: 12, hard: 16 }[difficulty];
      const nodes = [];

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          id: i,
          x: (i % 4) * 25 + 12.5,
          y: Math.floor(i / 4) * 25 + 12.5,
          status: 'active', // active, infected, offline, upgrading
          type: ['firewall', 'scanner', 'quarantine', 'analyzer'][Math.floor(Math.random() * 4)],
          power: 100,
          connections: [],
          threatDetection: Math.random() * 100,
          cooldown: 0
        });
      }

      // Create connections between nearby nodes
      nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
          if (i !== j) {
            const distance = Math.sqrt(
              Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
            );
            if (distance < 30 && Math.random() < 0.6) {
              node.connections.push(j);
            }
          }
        });
      });

      setGameState(prev => ({ ...prev, defenseNodes: nodes }));
    };

    initializeNetwork();
  }, [difficulty]);

  // Generate threat
  const generateThreat = useCallback(() => {
    const threatTypes = [
      'data_corruption',
      'memory_injection',
      'network_spoofing',
      'quantum_tunneling',
      'ai_infiltration',
      'system_hijack'
    ];

    const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const severity = Math.floor(1 + Math.random() * gameState.threatLevel);

    const threat = {
      id: Date.now() + Math.random(),
      type: threatType,
      severity,
      targetNode: Math.floor(Math.random() * gameState.defenseNodes.length),
      arrivalTime: Date.now() + (1000 + Math.random() * 3000),
      active: false,
      signature: Math.random().toString(36).substring(7)
    };

    setGameState(prev => ({
      ...prev,
      rogueNodes: [...prev.rogueNodes, threat]
    }));

    setThreatLog(prev => [...prev.slice(-9), {
      timestamp: new Date().toLocaleTimeString(),
      threat: threatType,
      severity: '⚠️'.repeat(severity),
      status: 'DETECTED'
    }]);
  }, [gameState.threatLevel, gameState.defenseNodes.length]);

  // Deploy protection
  const deployProtection = (nodeId, protectionType) => {
    const node = gameState.defenseNodes.find(n => n.id === nodeId);
    if (!node || node.cooldown > 0) return;

    setGameState(prev => {
      const newNodes = prev.defenseNodes.map(n =>
        n.id === nodeId
          ? { ...n, cooldown: 30, status: 'active' }
          : n
      );

      const newProtections = [...prev.activeProtections, {
        id: Date.now() + Math.random(),
        type: protectionType,
        nodeId,
        duration: 20,
        effectiveness: 0.9
      }];

      return {
        ...prev,
        defenseNodes: newNodes,
        activeProtections: newProtections
      };
    });
  };

  // Neutralize threat
  const neutralizeThreat = (threatId) => {
    const threat = gameState.rogueNodes.find(t => t.id === threatId);
    if (!threat) return;

    const nearbyNodes = gameState.defenseNodes.filter(node =>
      node.status === 'active' &&
      Math.sqrt(
        Math.pow(node.x - gameState.defenseNodes[threat.targetNode].x, 2) +
        Math.pow(node.y - gameState.defenseNodes[threat.targetNode].y, 2)
      ) < 40
    );

    if (nearbyNodes.length === 0) return false;

    // Find best response time
    const startTime = Date.now();
    const bestNode = nearbyNodes.reduce((best, node) =>
      node.threatDetection > best.threatDetection ? node : best
    );

    // Calculate effectiveness based on network load and node health
    const networkEfficiency = Math.max(0.1, 1 - (gameState.systemLoad / 200));
    const nodeEfficiency = bestNode.power / 100;
    const threatResistance = 1 - (threat.severity * 0.2);

    const successRate = networkEfficiency * nodeEfficiency * threatResistance;
    const success = Math.random() < successRate;

    setPerformanceMetrics(prev => ({
      ...prev,
      threatsNeutralized: success ? prev.threatsNeutralized + 1 : prev.threatsNeutralized,
      responseTime: Date.now() - startTime,
      efficiency: Math.min(100, prev.efficiency + (success ? 2 : -1))
    }));

    if (success) {
      setGameState(prev => ({
        ...prev,
        rogueNodes: prev.rogueNodes.filter(t => t.id !== threatId),
        systemLoad: Math.max(0, prev.systemLoad - 5)
      }));

      setSystemAlerts(prev => [...prev.slice(-2), {
        type: 'success',
        message: `Threat ${threat.type} neutralized successfully`,
        timestamp: Date.now()
      }]);

      return true;
    } else {
      setGameState(prev => ({
        ...prev,
        firewallIntegrity: Math.max(0, prev.firewallIntegrity - threat.severity * 5),
        systemLoad: Math.min(100, prev.systemLoad + 10)
      }));

      setSystemAlerts(prev => [...prev.slice(-2), {
        type: 'error',
        message: `Failed to neutralize ${threat.type}`,
        timestamp: Date.now()
      }]);

      return false;
    }
  };

  // Main game loop
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        const newState = { ...prev };

        // Update node cooldowns
        newState.defenseNodes = prev.defenseNodes.map(node => ({
          ...node,
          cooldown: Math.max(0, node.cooldown - 1),
          power: Math.min(100, node.power + 0.5)
        }));

        // Update active protections
        newState.activeProtections = prev.activeProtections
          .map(protection => ({
            ...protection,
            duration: protection.duration - 1
          }))
          .filter(protection => protection.duration > 0);

        // Process threats
        const currentTime = Date.now();
        newState.rogueNodes = prev.rogueNodes.map(threat => {
          if (!threat.active && currentTime >= threat.arrivalTime) {
            // Activate threat
            setGameState(current => ({
              ...current,
              infectedNodes: current.infectedNodes + 1,
              firewallIntegrity: Math.max(0, current.firewallIntegrity - threat.severity * 3),
              systemLoad: Math.min(100, current.systemLoad + threat.severity * 2)
            }));

            return { ...threat, active: true };
          }
          return threat;
        });

        // Auto-neutralize active threats if protection is active
        newState.rogueNodes.forEach(threat => {
          if (threat.active) {
            const hasProtection = prev.activeProtections.some(p =>
              Math.abs(p.nodeId - threat.targetNode) < 2
            );
            if (hasProtection && Math.random() < 0.1) {
              neutralizeThreat(threat.id);
            }
          }
        });

        return newState;
      });
    }, 100);

    return () => clearInterval(gameLoopRef.current);
  }, []);

  // Threat spawner
  useEffect(() => {
    threatSpawnerRef.current = setInterval(() => {
      if (Math.random() < 0.3) {
        generateThreat();
      }
    }, 2000);

    return () => clearInterval(threatSpawnerRef.current);
  }, [generateThreat]);

  const renderNetworkVisualization = () => {
    const { defenseNodes, rogueNodes, activeProtections } = gameState;

    return (
      <div className="network-visualization">
        <div className="network-grid">
          <svg className="network-svg" viewBox="0 0 100 100">
            {/* Network connections */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connection lines */}
            {defenseNodes.map(node =>
              node.connections.map(targetId => {
                const targetNode = defenseNodes.find(n => n.id === targetId);
                if (!targetNode) return null;

                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="#00E5FF"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                );
              })
            )}

            {/* Defense nodes */}
            {defenseNodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="3"
                  fill={node.status === 'active' ? '#00ff88' :
                    node.status === 'infected' ? '#ff4444' : '#ffaa00'}
                  stroke="#fff"
                  strokeWidth="0.2"
                  filter="url(#glow)"
                  className="defense-node"
                  onClick={() => deployProtection(node.id, node.type)}
                />

                {/* Node power indicator */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={`${3 + (node.power / 100) * 2}`}
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="0.1"
                  opacity="0.5"
                />

                {/* Cooldown indicator */}
                {node.cooldown > 0 && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="4"
                    fill="none"
                    stroke="#ffaa00"
                    strokeWidth="0.3"
                    strokeDasharray="2 1"
                    className="cooldown-indicator"
                  />
                )}
              </g>
            ))}

            {/* Rogue threats */}
            {rogueNodes.map(threat => {
              const targetNode = defenseNodes.find(n => n.id === threat.targetNode);
              if (!targetNode) return null;

              return (
                <g key={threat.id}>
                  <circle
                    cx={targetNode.x}
                    cy={targetNode.y}
                    r="5"
                    fill="#ff4444"
                    opacity="0.8"
                    className="threat-indicator"
                    onClick={() => neutralizeThreat(threat.id)}
                  />

                  {/* Threat severity rings */}
                  {[...Array(threat.severity)].map((_, i) => (
                    <circle
                      key={i}
                      cx={targetNode.x}
                      cy={targetNode.y}
                      r={`${5 + i * 2}`}
                      fill="none"
                      stroke="#ff4444"
                      strokeWidth="0.2"
                      opacity={0.6 - (i * 0.1)}
                      className="threat-ring"
                    />
                  ))}
                </g>
              );
            })}

            {/* Active protections */}
            {activeProtections.map(protection => {
              const node = defenseNodes.find(n => n.id === protection.nodeId);
              if (!node) return null;

              return (
                <circle
                  key={protection.id}
                  cx={node.x}
                  cy={node.y}
                  r="8"
                  fill="none"
                  stroke="#00ff88"
                  strokeWidth="0.3"
                  opacity="0.7"
                  className="protection-field"
                />
              );
            })}
          </svg>
        </div>

        {/* Network statistics */}
        <div className="network-stats">
          <div className="stat-panel">
            <h4>🛡️ Network Status</h4>
            <div className="stat-grid">
              <div className="stat-item">
                <span>Active Nodes:</span>
                <span className="value">{defenseNodes.filter(n => n.status === 'active').length}</span>
              </div>
              <div className="stat-item">
                <span>Infected Nodes:</span>
                <span className="value danger">{gameState.infectedNodes}</span>
              </div>
              <div className="stat-item">
                <span>Active Threats:</span>
                <span className="value warning">{rogueNodes.length}</span>
              </div>
              <div className="stat-item">
                <span>System Load:</span>
                <span className="value">{gameState.systemLoad}%</span>
              </div>
              <div className="stat-item">
                <span>Firewall:</span>
                <span className="value success">{gameState.firewallIntegrity}%</span>
              </div>
              <div className="stat-item">
                <span>Threat Level:</span>
                <span className="value danger">{gameState.threatLevel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderThreatLog = () => (
    <div className="threat-log">
      <h4>🚨 Threat Detection Log</h4>
      <div className="log-entries">
        {threatLog.map((entry, index) => (
          <div key={index} className="log-entry">
            <span className="timestamp">{entry.timestamp}</span>
            <span className="threat-type">{entry.threat}</span>
            <span className="severity">{entry.severity}</span>
            <span className="status">{entry.status}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSystemAlerts = () => (
    <div className="system-alerts">
      {systemAlerts.map((alert, index) => (
        <div key={index} className={`alert alert-${alert.type}`}>
          <span className="alert-icon">
            {alert.type === 'success' ? '✅' :
              alert.type === 'error' ? '❌' : '⚠️'}
          </span>
          <span className="alert-message">{alert.message}</span>
        </div>
      ))}
    </div>
  );

  const instructions = `
    Welcome to the AI Defense Matrix! You're responsible for protecting the neural network from rogue AI threats.
    
    Controls:
    • Click defense nodes (green circles) to deploy protection
    • Click red threat indicators to neutralize threats directly
    • Monitor system load and firewall integrity
    • Balance node power consumption with threat response
    
    Threat Types:
    • Data Corruption: Spreads through network connections
    • Memory Injection: Targets specific node types
    • Network Spoofing: Masquerades as legitimate traffic
    • AI Infiltration: Highly sophisticated threats
    
    Strategy:
    • Maintain balanced node distribution
    • Upgrade nodes to handle higher threat levels
    • Use network topology advantages
    • Monitor performance metrics for optimization
  `;

  const objective = `
    Protect the neural network from rogue AI threats for as long as possible.
    Neutralize threats before they compromise critical infrastructure.
    Maintain high system efficiency and firewall integrity.
    Progress through threat levels to earn maximum points.
  `;

  const scoring = `
    Each neutralized threat awards points based on severity and response time.
    Maintain high efficiency ratings for bonus multipliers.
    Successfully defend against waves of threats for combo bonuses.
    Perfect network management unlocks advanced protection modes.
    System uptime and low false positive rates earn extra points.
  `;

  return (
    <MiniGameBase
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions={instructions}
      objective={objective}
      scoring={scoring}
      duration={90}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="ai-defense-container">
        {renderSystemAlerts()}
        {renderNetworkVisualization()}
        {renderThreatLog()}
      </div>
    </MiniGameBase>
  );
};

