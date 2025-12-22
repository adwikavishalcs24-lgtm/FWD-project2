
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const EnhancedTrafficSignalController = ({
  title = "Smart Traffic Control System",
  timeline = "present",
  difficulty = "medium",
  onComplete,
  onClose,
  gameId
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

  // Initialize intersection network
  useEffect(() => {
    const initializeIntersections = () => {
      const intersectionCount = { easy: 4, medium: 6, hard: 9 }[difficulty];
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
  const optimizeTrafficFlow = () => {
    const activeAlgorithm = algorithms.find(a => a.active);
    if (!activeAlgorithm) return;

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

  // Handle emergency vehicle
  const handleEmergencyVehicle = (vehicleId) => {
    setGameState(prev => ({
      ...prev,
      emergencyMode: true,
      emergencyVehicles: [...prev.emergencyVehicles, vehicleId]
    }));

    // Clear all intersections for emergency vehicle
    setTimeout(() => {
      setGameState(prev => ({ ...prev, emergencyMode: false }));
    }, 10000);
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

      // Generate optimization suggestions
      if (gameState.congestionLevel > 15) {
        setOptimizationSuggestions(prev => [...prev.slice(-2), {
          type: 'congestion',
          message: `High congestion detected (${gameState.congestionLevel}%). Consider switching to AI optimization.`,
          timestamp: Date.now()
        }]);
      }
    }, 500);

    return () => clearInterval(gameLoopRef.current);
  }, []);

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
          <svg className="traffic-svg" viewBox="0 0 600 400">
            {/* Background grid */}
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

            {/* Roads */}
            <g className="roads">
              {/* Horizontal roads */}
              <line x1="0" y1="100" x2="600" y2="100" stroke="#555" strokeWidth="8" />
              <line x1="0" y1="200" x2="600" y2="200" stroke="#555" strokeWidth="8" />
              <line x1="0" y1="300" x2="600" y2="300" stroke="#555" strokeWidth="8" />

              {/* Vertical roads */}
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
        <div className="network-controls">
          <div className="control-panel">
            <h4>🎛️ Traffic Control</h4>

            {/* Algorithm selection */}
            <div className="algorithm-selector">
              <label>Active Algorithm:</label>
              <div className="algorithm-buttons">
                {algorithms.map(algorithm => (

                  <button
                    key={algorithm.id}
                    className={`algo-btn ${algorithm.active ? 'active' : ''}`}
                    onClick={() => setAlgorithms(prev =>
                      prev.map(a => ({ ...a, active: a.id === algorithm.id }))
                    )}
                  >
                    <div className="algo-name">{algorithm.name}</div>
                    <div className="algo-efficiency">{algorithm.efficiency}%</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency controls */}
            <div className="emergency-controls">
              <button
                className="emergency-btn"
                onClick={() => setGameState(prev => ({ ...prev, emergencyMode: !prev.emergencyMode }))}
              >
                🚨 Emergency Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrafficStats = () => (
    <div className="traffic-stats">
      <h4>📊 Traffic Statistics</h4>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Congestion Level:</span>
          <span className={`stat-value ${gameState.congestionLevel > 15 ? 'warning' : 'normal'}`}>
            {gameState.congestionLevel}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">System Efficiency:</span>
          <span className={`stat-value ${gameState.systemEfficiency > 70 ? 'success' : 'danger'}`}>
            {gameState.systemEfficiency}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pollution Level:</span>
          <span className={`stat-value ${gameState.pollutionLevel > 50 ? 'warning' : 'normal'}`}>
            {gameState.pollutionLevel}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Speed:</span>
          <span className="stat-value">{trafficStats.averageSpeed} km/h</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Vehicles Processed:</span>
          <span className="stat-value">{trafficStats.vehiclesProcessed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Peak Hour:</span>
          <span className={`stat-value ${trafficStats.peakHour ? 'warning' : 'normal'}`}>
            {trafficStats.peakHour ? 'YES' : 'NO'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderOptimizationPanel = () => (
    <div className="optimization-panel">
      <h4>💡 Optimization Suggestions</h4>
      <div className="suggestions-list">
        {optimizationSuggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-item">
            <span className="suggestion-icon">💡</span>
            <span className="suggestion-text">{suggestion.message}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const instructions = `
    Welcome to the Smart Traffic Control System! Manage traffic flow across multiple intersections to optimize city transportation.
    
    Controls:
    • Click intersection nodes to view detailed information
    • Select different traffic algorithms to optimize flow
    • Activate emergency mode for priority vehicles
    • Monitor real-time traffic statistics and pollution levels
    
    Algorithms:
    • Fixed Timing: Basic timing cycles (70% efficiency)
    • Adaptive Control: Adjusts to traffic conditions (85% efficiency)
    • AI Optimization: Machine learning traffic management (95% efficiency)
    • Predictive Analysis: Uses time/weather data (90% efficiency)
    
    Strategy:
    • Switch algorithms based on traffic conditions
    • Monitor congestion levels and pollution
    • Handle emergency vehicles promptly
    • Balance efficiency with environmental impact
  `;

  const objective = `
    Maintain optimal traffic flow across the city network while minimizing congestion and pollution.
    Process as many vehicles as possible while keeping average wait times low.
    Respond effectively to emergency situations and varying traffic conditions.
    Achieve the highest system efficiency rating possible.
  `;

  const scoring = `
    Points awarded for vehicles processed and system efficiency maintained.
    Bonus points for low congestion and pollution levels.
    Penalty for accidents and excessive wait times.
    Emergency response effectiveness adds bonus multipliers.
    Algorithm optimization increases base efficiency ratings.
    Time-based challenges during peak hours earn extra points.
  `;

  return (
    <MiniGameBase
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions={instructions}
      objective={objective}
      scoring={scoring}
      duration={75}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="traffic-control-container">
        {renderTrafficNetwork()}
        <div className="stats-panels">
          {renderTrafficStats()}
          {renderOptimizationPanel()}
        </div>
      </div>
    </MiniGameBase>
  );
};

