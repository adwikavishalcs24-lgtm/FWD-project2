import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const BlacksmithForgeSimulator = ({
  title = "Master Blacksmith's Forge",
  timeline = "past",
  difficulty = "medium",
  onComplete,
  onClose,
  gameId
}) => {
  const [gameState, setGameState] = useState({
    temperature: 20,
    isHammering: false,
    forgeLevel: 1,
    forgeParticles: [],
    heatZones: {
      cold: { min: 0, max: 30, color: '#3B82F6' },
      warm: { min: 31, max: 50, color: '#F59E0B' },
      perfect: { min: 51, max: 70, color: '#10B981' },
      hot: { min: 71, max: 85, color: '#EF4444' },
      critical: { min: 86, max: 100, color: '#DC2626' }
    }
  });

  const [comboStreak, setComboStreak] = useState(0);
  const [forgeEfficiency, setForgeEfficiency] = useState(100);
  const [perfectCount, setPerfectCount] = useState(0);
  const [metalInventory, setMetalInventory] = useState([]);

  const [isGameOver, setIsGameOver] = useState(false);
  const [success, setSuccess] = useState(false);

  const gameLoopRef = useRef(null);
  const gameRef = useRef(null);

  /* ===================== UTILS ===================== */
  const getTemperatureZone = temp => {
    for (const [zone, z] of Object.entries(gameState.heatZones)) {
      if (temp >= z.min && temp <= z.max) return zone;
    }
    return 'cold';
  };

  const getTemperatureColor = temp =>
    gameState.heatZones[getTemperatureZone(temp)]?.color || '#3B82F6';

  const addParticle = (x, y) => {
    setGameState(prev => ({
      ...prev,
      forgeParticles: [
        ...prev.forgeParticles,
        {
          id: Date.now() + Math.random(),
          x,
          y,
          life: 1,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2,
          color: getTemperatureColor(prev.temperature)
        }
      ]
    }));
  };

  /* ===================== END STATES ===================== */
  const triggerSuccess = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    setSuccess(true);
    clearInterval(gameLoopRef.current);

    gameRef.current?.addPoints(250, 400, 300, 'perfect');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: true,
        reason: 'masterpiece_forged'
      });
    }, 2200);
  };

  const triggerFailure = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    setSuccess(false);
    clearInterval(gameLoopRef.current);

    gameRef.current?.addPoints(-150, 400, 300, 'miss');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: false,
        reason: 'forge_ruined'
      });
    }, 2200);
  };

  /* ===================== HAMMER ===================== */
  const handleHammerStrike = e => {
    if (!gameRef.current?.isGameStarted || isGameOver) return;

    const zone = getTemperatureZone(gameState.temperature);
    const x = e?.nativeEvent?.offsetX ?? 150;
    const y = e?.nativeEvent?.offsetY ?? 150;

    setGameState(p => ({ ...p, isHammering: true }));
    setTimeout(() => setGameState(p => ({ ...p, isHammering: false })), 120);

    addParticle(x + 40, y + 30);

    let points = 0;
    let type = 'miss';

    if (zone === 'perfect') {
      points = 100 + comboStreak * 10;
      type = 'perfect';
      setComboStreak(c => c + 1);
      setPerfectCount(c => {
        const next = c + 1;
        if (next >= 8) triggerSuccess();
        return next;
      });
      setMetalInventory(m => [{ type: 'Masterwork', quality: 'rare' }, ...m.slice(0, 3)]);
    } 
    else if (zone === 'warm' || zone === 'hot') {
      points = 50;
      type = 'good';
      setComboStreak(0);
    } 
    else if (zone === 'critical') {
      points = -50;
      type = 'miss';
      setComboStreak(0);
      setForgeEfficiency(e => {
        const next = Math.max(0, e - 15);
        if (next <= 0) triggerFailure();
        return next;
      });
    } 
    else {
      setComboStreak(0);
    }

    gameRef.current?.addPoints(points, x, y, type);
  };

  /* ===================== LOOP ===================== */
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      if (isGameOver) return;

      setGameState(prev => {
        const cooled = Math.max(10, prev.temperature - 0.4);

        const particles = prev.forgeParticles
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.04
          }))
          .filter(p => p.life > 0);

        return { ...prev, temperature: cooled, forgeParticles: particles };
      });
    }, 50);

    return () => clearInterval(gameLoopRef.current);
  }, [isGameOver]);

  const zone = getTemperatureZone(gameState.temperature);
  const zoneColor = getTemperatureColor(gameState.temperature);

  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Control the forge temperature and strike at perfect heat to craft a masterpiece."
      objective="Forge high-quality items without destroying the forge."
      scoring="Perfect: +100 · Good: +50 · Overheat: −50"
      duration={60}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative w-full h-full p-4">

        {/* ===== END OVERLAY ===== */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center text-center">
            <h1 className={`text-5xl font-extrabold mb-4 animate-pulse ${success ? 'text-green-400' : 'text-red-500'}`}>
              {success ? '⚒️ MASTERPIECE FORGED' : '🔥 FORGE DESTROYED'}
            </h1>
            <p className="text-gray-300 mb-6 max-w-md">
              {success
                ? 'The blade sings with perfection. Your name will be remembered.'
                : 'The forge collapses under reckless heat.'}
            </p>
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-bold ${success ? 'bg-green-600' : 'bg-red-600'}`}
            >
              Exit Timeline
            </button>
          </div>
        )}

        {/* ===== FORGE UI ===== */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Temperature Panel */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="text-center text-4xl font-mono mb-2" style={{ color: zoneColor }}>
              {Math.round(gameState.temperature)}°C
            </div>

            <div className="h-6 bg-gray-800 rounded-full overflow-hidden mb-2">
              <div className="h-full transition-all" style={{ width: `${gameState.temperature}%`, background: zoneColor }} />
            </div>

            <div className="text-center text-sm uppercase text-gray-400 mb-4">
              Zone: <span style={{ color: zoneColor }}>{zone}</span>
            </div>

            <div className="flex gap-4">
              <button
                disabled={isGameOver}
                onClick={() => setGameState(p => ({ ...p, temperature: Math.min(100, p.temperature + 15) }))}
                className="flex-1 py-3 bg-red-600 rounded font-bold text-white"
              >
                Stoke Fire
              </button>
              <button
                disabled={isGameOver}
                onClick={() => setGameState(p => ({ ...p, temperature: Math.max(0, p.temperature - 10) }))}
                className="flex-1 py-3 bg-blue-600 rounded font-bold text-white"
              >
                Cool Down
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-300">
              Efficiency: <span className={forgeEfficiency > 40 ? 'text-green-400' : 'text-red-400'}>
                {forgeEfficiency}%
              </span>
            </div>
          </div>

          {/* Anvil */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 relative overflow-hidden">
            {gameState.forgeParticles.map(p => (
              <div
                key={p.id}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: p.x,
                  top: p.y,
                  background: p.color,
                  opacity: p.life
                }}
              />
            ))}

            <button
              disabled={isGameOver}
              onClick={handleHammerStrike}
              className={`w-full h-64 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center transition-all
                ${gameState.isHammering ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              <div className="text-6xl mb-4">{gameState.isHammering ? '💥' : '🔨'}</div>
              <div className="font-bold text-white">STRIKE</div>
              {zone === 'perfect' && (
                <div className="absolute top-4 right-4 text-green-400 font-bold animate-pulse">
                  PERFECT HEAT
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Inventory */}
        <div className="mt-6">
          <div className="text-gray-400 mb-2">Recent Forgings</div>
          <div className="flex gap-4">
            {metalInventory.map((m, i) => (
              <div key={i} className="bg-black/40 px-4 py-2 rounded border border-purple-500">
                {m.type}
              </div>
            ))}
          </div>
        </div>

      </div>
    </MiniGameBase>
  );
};
