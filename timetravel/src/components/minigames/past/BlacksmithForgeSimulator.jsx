
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const BlacksmithForgeSimulator = ({
  title = "Master Blacksmith's Forge",
  timeline = "past",
  difficulty = "medium"
}) => {
  const [gameState, setGameState] = useState({
    temperature: 20,
    isHammering: false,
    forgeLevel: 1,
    metalPieces: [],
    perfectSequence: 0,
    currentMold: null,
    hammerPower: 50,
    forgeParticles: [],
    heatZones: {
      cold: { min: 0, max: 30, color: '#3B82F6' },
      warm: { min: 31, max: 50, color: '#F59E0B' },
      perfect: { min: 51, max: 70, color: '#10B981' },
      hot: { min: 71, max: 85, color: '#EF4444' },
      critical: { min: 86, max: 100, color: '#DC2626' }
    }
  });

  const [forgeSequence, setForgeSequence] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [comboStreak, setComboStreak] = useState(0);
  const [lastAction, setLastAction] = useState({ type: null, timestamp: 0 });
  const [forgeEfficiency, setForgeEfficiency] = useState(100);
  const [metalInventory, setMetalInventory] = useState([
    { type: 'Iron', quantity: 5, quality: 'common' },
    { type: 'Steel', quantity: 3, quality: 'uncommon' },
    { type: 'Mithril', quantity: 1, quality: 'rare' }
  ]);

  const gameLoopRef = useRef();
  const gameRef = useRef(null);

  // Enhanced game mechanics
  const addForgeParticle = (x, y, type = 'heat') => {
    const particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      type,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1,
      color: getTemperatureColor(gameState.temperature)
    };

    setGameState(prev => ({
      ...prev,
      forgeParticles: [...prev.forgeParticles, particle]
    }));
  };

  const getTemperatureColor = (temp) => {
    if (temp < 30) return '#3B82F6';
    if (temp < 50) return '#F59E0B';
    if (temp < 70) return '#10B981';
    if (temp < 85) return '#EF4444';
    return '#DC2626';
  };

  const getTemperatureZone = (temp) => {
    for (const [zone, data] of Object.entries(gameState.heatZones)) {
      if (temp >= data.min && temp <= data.max) {
        return zone;
      }
    }
    return 'cold';
  };

  const handleHammerStrike = (event) => {
    if (!gameRef.current?.isGameStarted) return;

    // Prevent default to stop double firing on some devices
    if (event) event.preventDefault();

    // Simulate strike location if event is generic
    const x = event ? (event.nativeEvent.offsetX || 100) : 100;
    const y = event ? (event.nativeEvent.offsetY || 100) : 100;

    setGameState(prev => ({ ...prev, isHammering: true }));
    setTimeout(() => setGameState(prev => ({ ...prev, isHammering: false })), 150);

    addForgeParticle(x + 50, y + 30, 'strike');

    const zone = getTemperatureZone(gameState.temperature);
    const now = Date.now();
    const timeSinceLastAction = now - lastAction.timestamp;

    let points = 0;
    let actionType = 'miss';

    if (zone === 'perfect') {
      points = 100 + (comboStreak * 10);
      actionType = 'perfect';
      setComboStreak(prev => prev + 1);
      if (Math.random() > 0.8) addAchievement('perfect_strike', 'Perfect Strike!');
    } else if (zone === 'hot' || zone === 'warm') {
      points = 50 + Math.floor(comboStreak * 5);
      actionType = 'good';
      setComboStreak(0);
    } else if (zone === 'critical') {
      points = -50;
      actionType = 'miss';
      setForgeEfficiency(prev => Math.max(0, prev - 10));
      addAchievement('disaster', 'Forge Disaster!');
    } else {
      actionType = 'miss';
      points = 0;
      setComboStreak(0);
    }

    setLastAction({ type: actionType, timestamp: now });

    // Create metal piece on success
    if (actionType === 'perfect' || actionType === 'good') {
      const newPiece = createMetalPiece();
      setMetalInventory(prev => [newPiece, ...prev.slice(0, 4)]);
    }

    if (gameRef.current) {
      gameRef.current.addPoints(points, x, y, actionType);
    }

    return { points, actionType, x, y };
  };

  const addAchievement = (id, title) => {
    if (!achievements.find(a => a.id === id)) {
      setAchievements(prev => [...prev, { id, title, timestamp: Date.now() }]);
    }
  };

  const createMetalPiece = () => {
    const quality_weights = {
      easy: { common: 80, uncommon: 18, rare: 2 },
      medium: { common: 60, uncommon: 30, rare: 10 },
      hard: { common: 40, uncommon: 40, rare: 20 }
    };

    const weights = quality_weights[difficulty] || quality_weights['medium'];
    const rand = Math.random() * 100;

    let quality = 'common';
    if (rand < weights.rare) quality = 'rare';
    else if (rand < weights.rare + weights.uncommon) quality = 'uncommon';

    const metal_types = ['Iron', 'Steel', 'Mithril', 'Adamantite', 'Orichalcum'];
    const metal_type = metal_types[Math.floor(Math.random() * metal_types.length)];

    return {
      type: metal_type,
      quantity: 1,
      quality,
    };
  };

  // Main game loop
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        // Natural cooling
        let newTemp = Math.max(10, prev.temperature - 0.5);

        // Temperature fluctuations
        if (Math.random() < 0.3) {
          newTemp += (Math.random() - 0.5) * 2;
        }

        newTemp = Math.max(0, Math.min(100, newTemp));

        // Update particles
        const updatedParticles = prev.forgeParticles
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.05,
            vy: p.vy + 0.1
          }))
          .filter(p => p.life > 0);

        return {
          ...prev,
          temperature: newTemp,
          forgeParticles: updatedParticles
        };
      });
    }, 50);

    return () => clearInterval(gameLoopRef.current);
  }, []);

  const renderForge = () => {
    const zone = getTemperatureZone(gameState.temperature);
    const zone_color = gameState.heatZones[zone]?.color || '#3B82F6';

    return (
      <div className="forge-container w-full max-w-4xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Temperature Control */}
          <div className="flex-1 bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-amber-500">🔥 Forge Temperature</h3>

            <div className="mb-6 relative">
              <div className="text-4xl font-mono text-center mb-2 font-bold" style={{ color: zone_color }}>
                {Math.round(gameState.temperature)}°C
              </div>
              <div className="h-8 bg-gray-800 rounded-full overflow-hidden border border-gray-600 relative">
                {/* Zones Background */}
                <div className="absolute inset-0 flex">
                  <div style={{ width: '30%', background: '#3B82F6', opacity: 0.3 }}></div>
                  <div style={{ width: '20%', background: '#F59E0B', opacity: 0.3 }}></div>
                  <div style={{ width: '20%', background: '#10B981', opacity: 0.6 }}></div>
                  <div style={{ width: '15%', background: '#EF4444', opacity: 0.3 }}></div>
                  <div style={{ width: '15%', background: '#DC2626', opacity: 0.3 }}></div>
                </div>
                <div
                  className="h-full transition-all duration-300 relative z-10"
                  style={{
                    width: `${gameState.temperature}%`,
                    backgroundColor: zone_color,
                    boxShadow: `0 0 10px ${zone_color}`
                  }}
                />
              </div>
              <div className="text-center mt-2 font-bold uppercase tracking-widest text-sm text-gray-400">
                Current Zone: <span style={{ color: zone_color }}>{zone}</span>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-bold text-white shadow-lg hover:from-red-500 hover:to-orange-500 active:scale-95 transition-all"
                onClick={() => setGameState(prev => ({ ...prev, temperature: Math.min(100, prev.temperature + 15) }))}
              >
                STOKE FIRE (+15°)
              </button>
              <button
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold text-white shadow-lg hover:from-blue-500 hover:to-cyan-500 active:scale-95 transition-all"
                onClick={() => setGameState(prev => ({ ...prev, temperature: Math.max(0, prev.temperature - 10) }))}
              >
                COOL DOWN (-10°)
              </button>
            </div>

            <div className="bg-black/40 rounded p-4 text-sm text-gray-300">
              <div className="flex justify-between mb-1">
                <span>Forge Level:</span>
                <span className="text-amber-400 font-bold">{gameState.forgeLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>Efficiency:</span>
                <span className={forgeEfficiency > 80 ? "text-green-400" : "text-red-400"}>{forgeEfficiency}%</span>
              </div>
            </div>
          </div>

          {/* Anvil Area */}
          <div className="flex-1 bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl relative overflow-hidden">
            {/* Particles Overlay */}
            {gameState.forgeParticles.map(particle => (
              <div
                key={particle.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: '8px',
                  height: '8px',
                  backgroundColor: particle.color,
                  opacity: particle.life,
                  transform: `scale(${particle.life})`
                }}
              />
            ))}

            <h3 className="text-xl font-bold mb-4 text-gray-300">⚒️ Anvil Station</h3>

            <div className="h-64 flex items-center justify-center relative">
              <button
                className={`w-full h-full rounded-xl transition-all transform active:scale-95 flex flex-col items-center justify-center group ${gameState.isHammering ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-750'
                  } border-2 border-dashed border-gray-600`}
                onClick={handleHammerStrike}
              >
                <div className="text-6xl mb-4 transition-transform group-hover:scale-110">
                  {gameState.isHammering ? '💥' : '🔨'}
                </div>
                <div className="text-lg font-bold text-gray-400 group-hover:text-white">
                  CLICK TO STRIKE
                </div>
                {zone === 'perfect' && (
                  <div className="absolute top-4 right-4 text-green-400 font-bold animate-pulse">
                    PERFECT HEAT!
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="mt-6 bg-gray-900 rounded-xl p-4 border border-gray-700">
          <h4 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">💎 Recent Forged Items</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metalInventory.map((metal, index) => (
              <div key={index} className={`bg-black/30 p-3 rounded-lg border ${metal.quality === 'rare' ? 'border-purple-500' :
                  metal.quality === 'uncommon' ? 'border-blue-500' : 'border-gray-600'
                }`}>
                <div className="text-xs text-gray-500 uppercase">{metal.quality}</div>
                <div className="font-bold text-gray-200">{metal.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const instructions = `
    Welcome to the Master Blacksmith's Forge!
    1. Control the temperature using "Stoke Fire" and "Cool Down".
    2. Keep the temperature bar in the GREEN ZONE (51-70°C).
    3. Strike the anvil when the heat is perfect to forge high-quality items.
    4. Avoid the RED ZONE to prevent overheating and disasters!
  `;

  const objective = "Forge as many high-quality items as possible by striking at the perfect temperature.";
  const scoring = "Perfect Strike (Green Zone): +100 pts. Good Strike (Yellow): +50 pts. Overheat: -50 pts.";

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
      {renderForge()}
    </MiniGameBase>
  );
};
