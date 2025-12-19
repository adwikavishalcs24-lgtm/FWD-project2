
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const EnhancedBlacksmithForgeSimulator = ({
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
  const hammerSoundRef = useRef(null);

  // Enhanced game mechanics
  const generateForgeSequence = useCallback(() => {
    const difficulty_multiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty];
    const sequenceLength = Math.floor(3 + Math.random() * 3 * difficulty_multiplier);
    
    return Array.from({ length: sequenceLength }, (_, i) => ({
      id: i,
      targetTemp: Math.floor(40 + Math.random() * 40),
      duration: Math.floor(100 + Math.random() * 50),
      complexity: Math.floor(1 + Math.random() * 3)
    }));
  }, [difficulty]);

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
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setGameState(prev => ({ ...prev, isHammering: true }));
    setTimeout(() => setGameState(prev => ({ ...prev, isHammering: false })), 150);
    
    addForgeParticle(x + 50, y + 30, 'strike');
    
    const zone = getTemperatureZone(gameState.temperature);
    const now = Date.now();
    const timeSinceLastAction = now - lastAction.timestamp;
    
    let points = 0;
    let actionType = 'miss';
    
    if (zone === 'perfect' && timeSinceLastAction < 2000) {
      points = 10 + (comboStreak * 2);
      actionType = 'perfect';
      setComboStreak(prev => prev + 1);
      addAchievement('perfect_strike', 'Perfect Strike!');
    } else if (zone === 'hot' || zone === 'warm') {
      points = 5 + Math.floor(comboStreak * 0.5);
      actionType = 'good';
      setComboStreak(0);
    } else if (zone === 'critical') {
      points = -5;
      actionType = 'overheat';
      setForgeEfficiency(prev => Math.max(0, prev - 10));
      addAchievement('disaster', 'Forge Disaster!');
    } else {
      actionType = 'miss';
      setComboStreak(0);
    }
    
    setLastAction({ type: actionType, timestamp: now });
    
    // Visual feedback
    if (actionType === 'perfect') {
      addForgeParticle(x, y, 'perfect');
      playHammerSound('perfect');
    } else if (actionType === 'overheat') {
      addForgeParticle(x, y, 'disaster');
      playHammerSound('disaster');
    }
    
    return { points, actionType, x, y };
  };

  const playHammerSound = (type) => {
    // Placeholder for sound effects
    console.log(`Playing ${type} hammer sound`);
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
    
    const weights = quality_weights[difficulty];
    const rand = Math.random() * 100;
    
    let quality = 'common';
    if (rand < weights.rare) quality = 'rare';
    else if (rand < weights.rare + weights.uncommon) quality = 'uncommon';
    
    const metal_types = ['Iron', 'Steel', 'Mithril', 'Adamantite', 'Orichalcum'];
    const metal_type = metal_types[Math.floor(Math.random() * metal_types.length)];
    
    return {
      id: Date.now() + Math.random(),
      type: metal_type,
      quality,
      temperature: gameState.temperature,
      perfection: Math.abs(gameState.temperature - 60) < 10 ? 'perfect' : 'good',
      forged_at: new Date().toLocaleTimeString()
    };
  };

  // Main game loop
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        // Natural cooling
        let newTemp = Math.max(10, prev.temperature - 1);
        
        // Temperature fluctuations
        if (Math.random() < 0.3) {
          newTemp += Math.floor((Math.random() - 0.5) * 6);
        }
        
        // Auto-heat if forge level is high
        if (prev.forgeLevel > 1 && Math.random() < 0.2) {
          newTemp += prev.forgeLevel * 0.5;
        }
        
        newTemp = Math.max(0, Math.min(100, newTemp));
        
        // Update particles
        const updatedParticles = prev.forgeParticles
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02,
            vy: p.vy + 0.1
          }))
          .filter(p => p.life > 0);
        
        return {
          ...prev,
          temperature: newTemp,
          forgeParticles: updatedParticles
        };
      });
    }, 100);

    return () => clearInterval(gameLoopRef.current);
  }, []);

  const renderForge = () => {
    const zone = getTemperatureZone(gameState.temperature);
    const zone_color = gameState.heatZones[zone]?.color || '#3B82F6';
    
    return (
      <div className="forge-container">
        <div className="forge-interface">
          {/* Temperature Control */}
          <div className="temp-control-panel">
            <h3>🔥 Forge Temperature Control</h3>
            <div className="temp-display-enhanced">
              <div className="temp-number">{Math.round(gameState.temperature)}°C</div>
              <div className="temp-bar-container">
                <div 
                  className="temp-bar-fill"
                  style={{ 
                    width: `${gameState.temperature}%`,
                    backgroundColor: zone_color
                  }}
                />
                <div className="temp-zones">
                  {Object.entries(gameState.heatZones).map(([zoneName, data]) => (
                    <div 
                      key={zoneName}
                      className={`temp-zone ${zoneName} ${zone === zoneName ? 'active' : ''}`}
                      style={{ 
                        left: `${data.min}%`,
                        width: `${data.max - data.min}%`,
                        backgroundColor: data.color
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="temp-zone-label">{zone.toUpperCase()}</div>
            </div>
            
            {/* Heat Controls */}
            <div className="heat-controls">
              <button 
                className="heat-btn increase"
                onClick={() => setGameState(prev => ({ ...prev, temperature: Math.min(100, prev.temperature + 5) }))}
              >
                + Increase Heat
              </button>
              <button 
                className="heat-btn decrease"
                onClick={() => setGameState(prev => ({ ...prev, temperature: Math.max(0, prev.temperature - 5) }))}
              >
                - Cool Down
              </button>
              <div className="forge-level">
                Forge Level: {gameState.forgeLevel}
                <button onClick={() => setGameState(prev => ({ ...prev, forgeLevel: prev.forgeLevel + 1 }))}>
                  Upgrade
                </button>
              </div>
            </div>
          </div>

          {/* Anvil Area */}
          <div className="anvil-area">
            <div className="anvil-container">
              <div className="anvil-base">
                <div className="anvil-face" />
                <div className="anvil-horn" />
              </div>
              
              {/* Hammer Strike Area */}
              <button
                className={`hammer-strike-area ${gameState.isHammering ? 'hammering' : ''}`}
                onClick={handleHammerStrike}
                onMouseDown={() => setGameState(prev => ({ ...prev, isHammering: true }))}
                onMouseUp={() => setGameState(prev => ({ ...prev, isHammering: false }))}
              >
                <div className="hammer-emoji">🔨</div>
                <div className="strike-zone">
                  {forgeSequence.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`forge-step ${index === 0 ? 'current' : ''}`}
                      style={{ 
                        left: `${index * 20}px`,
                        backgroundColor: getTemperatureColor(step.targetTemp)
                      }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Forge Particles */}
        <div className="forge-particles">
          {gameState.forgeParticles.map(particle => (
            <div
              key={particle.id}
              className="forge-particle"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                backgroundColor: particle.color,
                opacity: particle.life,
                transform: `scale(${particle.life})`
              }}
            />
          ))}
        </div>

        {/* Game Stats */}
        <div className="forge-stats">
          <div className="stat-item">
            <span className="stat-label">Combo Streak:</span>
            <span className="stat-value combo">{comboStreak}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Efficiency:</span>
            <span className="stat-value">{forgeEfficiency}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Metal Pieces:</span>
            <span className="stat-value">{gameState.metalPieces.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Perfect Strikes:</span>
            <span className="stat-value perfect">{achievements.filter(a => a.id === 'perfect_strike').length}</span>
          </div>
        </div>

        {/* Metal Inventory */}
        <div className="metal-inventory">
          <h4>💎 Forged Metal Inventory</h4>
          <div className="inventory-grid">
            {metalInventory.map((metal, index) => (
              <div key={index} className={`metal-item ${metal.quality}`}>
                <div className="metal-icon">
                  {metal.type === 'Iron' && '⛓️'}
                  {metal.type === 'Steel' && '⚔️'}
                  {metal.type === 'Mithril' && '💠'}
                  {metal.type === 'Adamantite' && '💎'}
                  {metal.type === 'Orichalcum' && '🔮'}
                </div>
                <div className="metal-info">
                  <div className="metal-name">{metal.type}</div>
                  <div className="metal-quantity">x{metal.quantity}</div>
                  <div className="metal-quality">{metal.quality}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="achievements-panel">
            <h4>🏆 Achievements</h4>
            <div className="achievements-list">
              {achievements.map(achievement => (
                <div key={achievement.id} className="achievement-item">
                  <span className="achievement-icon">🏆</span>
                  <span className="achievement-text">{achievement.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const instructions = `
    Welcome to the Master Blacksmith's Forge! Your goal is to create perfect metal pieces by striking at the right temperature.
    
    Controls:
    • Use heat controls to manage forge temperature
    • Strike the anvil when temperature is in the GREEN zone for perfect results
    • Build combo streaks for bonus points
    • Avoid the RED zone - it causes disasters!
    
    Tips:
    • Perfect temperature range is 51-70°C
    • Higher forge levels provide better temperature control
    • Combo streaks multiply your score
    • Each metal piece has different properties
  `;

  const objective = `
    Create as many high-quality metal pieces as possible within the time limit.
    Strike when the temperature is in the perfect zone to earn maximum points and build combos.
    Manage temperature carefully to avoid disasters and maintain high efficiency.
  `;

  const scoring = `
    Perfect strikes in the green zone award 10+ points with combo multipliers.
    Good strikes in yellow zones award 5+ points.
    Overheating in the red zone causes penalties and reduces efficiency.
    Build combo streaks for exponential score increases.
    Create rare metal pieces for bonus points.
  `;

  return (
    <MiniGameBase
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

