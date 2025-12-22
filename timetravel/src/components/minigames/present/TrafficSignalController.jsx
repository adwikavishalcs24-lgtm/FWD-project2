
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const TrafficSignalController = ({
  title = "Smart Traffic Control System",
  timeline = "present",
  difficulty = "medium"
}) => {
  const [gameState, setGameState] = useState({
    intersections: [],
    trafficFlow: new Map(),
    emergencyVehicles: [],
    congestionLevel: 0,
    averageWaitTime: 0,
    pollutionLevel: 0,
    systemEfficiency: 100,
    activeAlgorithms: [],
    weather: 'clear', // clear, rain, snow, fog
    timeOfDay: 'morning', // morning, afternoon, evening, night
    trafficLights: [],
    vehicleSpawnRate: 1.0,
    emergencyMode: false
  });

  const [trafficStats, setTrafficStats] = useState({
    vehiclesProcessed: 0,
    accidents: 0,
    emergencyResponse: 0,
    averageSpeed: 0,
    peakHour: false,
    trafficDensity: 0
  });

  const [algorithms, setAlgorithms] = useState([
    { id: 'fixed', name: 'Fixed Timing', active: false, efficiency: 70 },
    { id: 'adaptive', name: 'Adaptive Control', active: false, efficiency: 85 },
    { id: 'ai', name: 'AI Optimization', active: false, efficiency: 95 },
    { id: 'predictive', name: 'Predictive Analysis', active: false, efficiency: 90 }
  ]);

  const [alerts, setAlerts] = useState([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);

  const gameLoopRef = useRef();
  const trafficSpawnerRef = useRef();
  const gameRef = useRef(null);
  const scoreTickerRef = useRef(0);

  // Initialize intersection network
  useEffect(() => {
    const initializeIntersections = () => {
      const intersectionCount = { easy: 4, medium: 6, hard: 9 }[difficulty] || 6;
      const intersections = [];

      for (let i = 0; i < intersectionCount; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;

        intersections.push({
          id: i,
          x: col * 200 + 100,
          y: row * 200 + 100,
          trafficLight: {
            north: { state: 'green', timer: 30, direction: 'north-south' },
            south: { state: 'green', timer: 30, direction: 'north-south' },
            east: { state: 'red', timer: 25, direction: 'east-west' },
            west: { state: 'red', timer: 25, direction: 'east-west' }
          },
          queue: {
            north: [],
            south: [],
            east: [],
            west: []
          },
          congestion: 0,
          priority: row === 1 && col === 1 ? 'high' : 'normal'
        });
      }

      setGameState(prev => ({ ...prev, intersections, trafficLights: intersections.map(i => i.trafficLight) }));
    };

    initializeIntersections();
  }, [difficulty]);

  // Generate vehicle
  const generateVehicle = useCallback(() => {
    if (Math.random() > gameState.vehicleSpawnRate * (trafficStats.peakHour ? 1.5 : 1.0)) return;

    const directions = ['north', 'south', 'east', 'west'];
    const startDirection = directions[Math.floor(Math.random() * directions.length)];
    const targetIntersection = Math.floor(Math.random() * gameState.intersections.length);

    const vehicle = {
      id: Date.now() + Math.random(),
      type: Math.random() < 0.1 ? 'emergency' : Math.random() < 0.2 ? 'truck' : 'car',
      direction: startDirection,
      targetIntersection,
      speed: 1,
      waitTime: 0,
      route: generateRoute(startDirection, targetIntersection),
      priority: Math.random() < 0.05 ? 'high' : 'normal'
    };

    setGameState(prev => ({
      ...prev,
      trafficFlow: new Map(prev.trafficFlow.set(vehicle.id, vehicle))
    }));
  }, [gameState.intersections.length, gameState.vehicleSpawnRate, trafficStats.peakHour]);

  const generateRoute = (startDirection, targetIntersection) => {
    // Simple routing algorithm - in a real implementation this would be more sophisticated
    const routes = {
      north: ['north', 'east', 'south', 'west'],
      south: ['south', 'west', 'north', 'east'],
      east: ['east', 'south', 'west', 'north'],
      west: ['west', 'north', 'east', 'south']
    };

    return routes[startDirection] || ['north'];
  };

  // Process intersection
  const processIntersection = (intersection) => {
    const updatedIntersection = { ...intersection };
    let totalWaitTime = 0;
    let processedVehicles = 0;

    // Update traffic light timers
    Object.keys(updatedIntersection.trafficLight).forEach(direction => {
      const light = updatedIntersection.trafficLight[direction];
      light.timer = Math.max(0, light.timer - 1);

      if (light.timer === 0) {
        // Switch light
        if (light.direction === 'north-south') {
          // North-South lights
          updatedIntersection.trafficLight.north.state =
            updatedIntersection.trafficLight.north.state === 'green' ? 'red' : 'green';
          updatedIntersection.trafficLight.south.state =
            updatedIntersection.trafficLight.south.state === 'green' ? 'red' : 'green';
          updatedIntersection.trafficLight.north.timer = 30;
          updatedIntersection.trafficLight.south.timer = 30;
        } else {
          // East-West lights
          updatedIntersection.trafficLight.east.state =
            updatedIntersection.trafficLight.east.state === 'green' ? 'red' : 'green';
          updatedIntersection.trafficLight.west.state =
            updatedIntersection.trafficLight.west.state === 'green' ? 'red' : 'green';
          updatedIntersection.trafficLight.east.timer = 25;
          updatedIntersection.trafficLight.west.timer = 25;
        }
      }
    });

    // Process vehicle queues
    Object.keys(updatedIntersection.queue).forEach(direction => {
      const queue = updatedIntersection.queue[direction];
      const light = updatedIntersection.trafficLight[direction];

      if (light.state === 'green' && queue.length > 0) {
        // Allow vehicles to pass
        const vehiclesToPass = Math.min(3, queue.length);
        for (let i = 0; i < vehiclesToPass; i++) {
          const vehicle = queue.shift();
          totalWaitTime += vehicle.waitTime;
          processedVehicles++;
        }
      }
    });

    updatedIntersection.congestion = updatedIntersection.queue.north.length +
      updatedIntersection.queue.south.length +
      updatedIntersection.queue.east.length +
      updatedIntersection.queue.west.length;

    return {
      intersection: updatedIntersection,
      stats: { totalWaitTime, processedVehicles }
    };
  };

  // Optimize traffic flow
  const optimizeTrafficFlow = (activeAlgorithmId) => {
    const activeAlgorithm = algorithms.find(a => a.id === activeAlgorithmId);
    if (!activeAlgorithm || !activeAlgorithm.active) return;

    setGameState(prev => {
      const optimizedIntersections = prev.intersections.map(intersection => {
        const newIntersection = { ...intersection };

        switch (activeAlgorithm.id) {
          case 'adaptive':
            // Adjust timing based on congestion
            const totalCongestion = newIntersection.congestion;
            if (totalCongestion > 10) {
              // Extend green time for congested directions
              Object.keys(newIntersection.trafficLight).forEach(direction => {
                const light = newIntersection.trafficLight[direction];
                if (light.state === 'green' && newIntersection.queue[direction].length > 3) {
                  light.timer += 5;
                }
              });
            }
            break;

          case 'ai':
            // AI optimization based on predicted traffic
            const peakHourMultiplier = trafficStats.peakHour ? 1.3 : 1.0;
            Object.keys(newIntersection.trafficLight).forEach(direction => {
              const light = newIntersection.trafficLight[direction];
              const queueLength = newIntersection.queue[direction].length;

              if (queueLength > 5) {
                light.timer = Math.min(45, light.timer + Math.floor(queueLength * 0.5 * peakHourMultiplier));
              } else if (queueLength < 2 && light.timer > 15) {
                light.timer = Math.max(15, light.timer - 2);
              }
            });
            break;

          case 'predictive':
            // Predictive optimization based on time and weather
            const timeMultiplier = {
              morning: 1.2,
              afternoon: 1.5,
              evening: 1.8,
              night: 0.8
            }[prev.timeOfDay];

            const weatherMultiplier = {
              clear: 1.0,
              rain: 1.3,
              snow: 1.6,
              fog: 1.4
            }[prev.weather];

            Object.keys(newIntersection.trafficLight).forEach(direction => {
              const light = newIntersection.trafficLight[direction];
              light.timer = Math.floor(light.timer * timeMultiplier * weatherMultiplier);
            });
            break;
        }

        return newIntersection;
      });

      return { ...prev, intersections: optimizedIntersections };
    });
  };

  const handleOptimizationChange = (algoId) => {
    if (!gameRef.current?.isGameStarted) return;
    setAlgorithms(prev => prev.map(a => ({ ...a, active: a.id === algoId })));
    // Trigger instant optimization
    optimizeTrafficFlow(algoId);
  };

  // Handle emergency vehicle
  const handleEmergencyVehicle = () => {
    if (!gameRef.current?.isGameStarted) return;
    setGameState(prev => ({
      ...prev,
      emergencyMode: !prev.emergencyMode,
      emergencyVehicles: !prev.emergencyMode ? [...prev.emergencyVehicles, 'EMG-' + Date.now()] : prev.emergencyVehicles
    }));
  };

  // Main game loop
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        const newState = { ...prev };

        // Update intersections
        const updatedIntersections = prev.intersections.map(intersection => {
          const { intersection: processedIntersection } = processIntersection(intersection);
          return processedIntersection;
        });

        newState.intersections = updatedIntersections;

        // Update congestion and pollution
        const totalCongestion = updatedIntersections.reduce((sum, i) => sum + i.congestion, 0);
        newState.congestionLevel = Math.floor(totalCongestion / updatedIntersections.length);
        newState.pollutionLevel = Math.min(100, newState.congestionLevel * 2);
        newState.systemEfficiency = Math.max(0, 100 - newState.congestionLevel);

        // Scoring Logic Check
        if (gameRef.current?.isGameStarted) {
          scoreTickerRef.current += 1;
          if (scoreTickerRef.current >= 4) { // Every 2 seconds approx (500ms * 4)
            if (newState.systemEfficiency > 80) {
              gameRef.current.addPoints(50, 300, 200, 'good'); // Good efficiency
            } else if (newState.congestionLevel < 20) {
              gameRef.current.addPoints(20, 300, 200, 'score');
            } else if (newState.congestionLevel > 80) {
              gameRef.current.addPoints(-20, 300, 200, 'miss'); // Penalty
            }
            scoreTickerRef.current = 0;
          }
        }

        return newState;
      });

      // Update traffic stats
      setTrafficStats(prev => ({
        ...prev,
        averageSpeed: Math.max(0, 50 - gameState.congestionLevel),
        trafficDensity: gameState.congestionLevel,
        peakHour: new Date().getHours() >= 7 && new Date().getHours() <= 9 ||
          new Date().getHours() >= 17 && new Date().getHours() <= 19
      }));

    }, 500);

    return () => clearInterval(gameLoopRef.current);
  }, []); // Note: gameState in dependency would cause re-renders of interval, but functional update handles it.

  // Traffic spawner
  useEffect(() => {
    trafficSpawnerRef.current = setInterval(() => {
      generateVehicle();
    }, 2000);

    return () => clearInterval(trafficSpawnerRef.current);
  }, [generateVehicle]);

  const renderTrafficNetwork = () => {
    const { intersections, emergencyMode } = gameState;

    return (
      <div className="traffic-network">
        <div className="network-container">
          <svg className="traffic-svg w-full h-full" viewBox="0 0 600 400">
            {/* Background grid + Roads Omitted for brevity in edit, but included in layout... 
                Wait, I need to include them to keep the file valid. 
            */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#333" strokeWidth="0.5" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="600" height="400" fill="url(#grid)" />
            <g className="roads">
              <line x1="0" y1="100" x2="600" y2="100" stroke="#555" strokeWidth="8" />
              <line x1="0" y1="200" x2="600" y2="200" stroke="#555" strokeWidth="8" />
              <line x1="0" y1="300" x2="600" y2="300" stroke="#555" strokeWidth="8" />
              <line x1="100" y1="0" x2="100" y2="400" stroke="#555" strokeWidth="8" />
              <line x1="300" y1="0" x2="300" y2="400" stroke="#555" strokeWidth="8" />
              <line x1="500" y1="0" x2="500" y2="400" stroke="#555" strokeWidth="8" />
            </g>
            {/* Intersections */}
            {intersections.map(intersection => (
              <g key={intersection.id}>
                {/* Intersection circle */}
                <circle
                  cx={intersection.x}
                  cy={intersection.y}
                  r="15"
                  fill={emergencyMode ? "#ff4444" : "#333"}
                  stroke="#fff"
                  strokeWidth="2"
                  filter="url(#glow)"
                  className="intersection-node"
                />

                {/* Traffic lights */}
                {Object.entries(intersection.trafficLight).map(([direction, light]) => {
                  const positions = {
                    north: { x: intersection.x, y: intersection.y - 25 },
                    south: { x: intersection.x, y: intersection.y + 25 },
                    east: { x: intersection.x + 25, y: intersection.y },
                    west: { x: intersection.x - 25, y: intersection.y }
                  };

                  const pos = positions[direction];
                  if (!pos) return null;

                  return (
                    <g key={direction}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="8"
                        fill={light.state === 'green' ? '#00ff44' :
                          light.state === 'yellow' ? '#ffaa00' : '#ff4444'}
                        stroke="#fff"
                        strokeWidth="1"
                        className="traffic-light"
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 3}
                        textAnchor="middle"
                        fontSize="8"
                        fill="white"
                        fontWeight="bold"
                      >
                        {light.timer}
                      </text>
                    </g>
                  );
                })}

                {/* Congestion indicator */}
                {intersection.congestion > 5 && (
                  <circle
                    cx={intersection.x}
                    cy={intersection.y}
                    r={`${15 + intersection.congestion * 2}`}
                    fill="none"
                    stroke="#ff4444"
                    strokeWidth="2"
                    opacity="0.6"
                    className="congestion-ring"
                  />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Network controls */}
        <div className="network-controls p-4">
          <div className="control-panel bg-gray-900 p-4 rounded-lg">
            <h4 className="text-lg font-bold mb-4">🎛️ Traffic Control</h4>

            {/* Algorithm selection */}
            <div className="algorithm-selector mb-4">
              <label className="block text-sm text-gray-400 mb-2">Active Algorithm:</label>
              <div className="grid grid-cols-2 gap-2">
                {algorithms.map(algorithm => (
                  <button
                    key={algorithm.id}
                    className={`p-2 rounded text-sm transition-colors ${algorithm.active ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    onClick={() => handleOptimizationChange(algorithm.id)}
                  >
                    <div className="font-bold">{algorithm.name}</div>
                    <div className="text-xs opacity-75">{algorithm.efficiency}% Eff.</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency controls */}
            <div className="emergency-controls">
              <button
                className={`w-full p-3 rounded font-bold transition-all ${emergencyMode ? 'bg-red-600 animate-pulse' : 'bg-red-900 hover:bg-red-800'}`}
                onClick={handleEmergencyVehicle}
              >
                🚨 {emergencyMode ? 'EMERGENCY ACTIVE' : 'ACTIVATE EMERGENCY MODE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrafficStats = () => (
    <div className="traffic-stats bg-gray-900 p-4 rounded-lg mb-4">
      <h4 className="font-bold mb-3 border-b border-gray-700 pb-2">📊 Traffic Statistics</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="stat-item">
          <span className="text-gray-400">Congestion:</span>
          <span className={`float-right font-bold ${gameState.congestionLevel > 15 ? 'text-red-400' : 'text-green-400'}`}>
            {gameState.congestionLevel}%
          </span>
        </div>
        <div className="stat-item">
          <span className="text-gray-400">Efficiency:</span>
          <span className={`float-right font-bold ${gameState.systemEfficiency > 70 ? 'text-green-400' : 'text-red-400'}`}>
            {gameState.systemEfficiency}%
          </span>
        </div>
        <div className="stat-item">
          <span className="text-gray-400">Pollution:</span>
          <span className={`float-right font-bold ${gameState.pollutionLevel > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
            {gameState.pollutionLevel}%
          </span>
        </div>
        <div className="stat-item">
          <span className="text-gray-400">Avg Speed:</span>
          <span className="float-right font-bold text-blue-400">{trafficStats.averageSpeed} km/h</span>
        </div>
        <div className="stat-item">
          <span className="text-gray-400">Processed:</span>
          <span className="float-right font-bold text-white">{trafficStats.vehiclesProcessed}</span>
        </div>
        <div className="stat-item">
          <span className="text-gray-400">Peak Hour:</span>
          <span className={`float-right font-bold ${trafficStats.peakHour ? 'text-orange-400' : 'text-gray-500'}`}>
            {trafficStats.peakHour ? 'YES' : 'NO'}
          </span>
        </div>
      </div>
    </div>
  );

  const instructions = `
    Welcome to the Smart Traffic Control System!
    • Monitor congestion levels across the city grid.
    • Select the best traffic algorithm for current conditions.
    • Use Emergency Mode to clear paths for critical vehicles.
    • Keep efficiency high and pollution low!
  `;

  const objective = "Optimize traffic flow and maintain high system efficiency.";
  const scoring = "Efficiency > 90%: +100 pts. Congestion < 10%: +50 pts.";

  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      instructions={instructions}
      objective={objective}
      scoring={scoring}
      duration={75}
      difficulty={difficulty}
    >
      <div className="traffic-control-container flex flex-col h-full overflow-y-auto">
        {renderTrafficNetwork()}
        <div className="stats-panels p-4 pt-0">
          {renderTrafficStats()}
        </div>
      </div>
    </MiniGameBase>
  );
};
