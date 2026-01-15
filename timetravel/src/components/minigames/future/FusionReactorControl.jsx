import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const FusionReactorControl = ({
  title = "Fusion Core Manager",
  timeline = "future",
  difficulty = "hard",
  onComplete,
  onClose,
  gameId
}) => {
  const [coreTemp, setCoreTemp] = useState(5000); // Optimal: 4500–6500
  const [containmentField, setContainmentField] = useState(100);
  const [fuelRate, setFuelRate] = useState(50);
  const [coolingRate, setCoolingRate] = useState(50);
  const [energyOutput, setEnergyOutput] = useState(0);

  const [isGameOver, setIsGameOver] = useState(false);
  const [meltdown, setMeltdown] = useState(false);

  const gameRef = useRef(null);
  const tickRef = useRef(0);
  const loopRef = useRef(null);

  /* ===================== GAME OVER ===================== */
  const triggerMeltdown = () => {
    if (isGameOver) return;

    setIsGameOver(true);
    setMeltdown(true);
    clearInterval(loopRef.current);

    // Heavy penalty
    gameRef.current?.addPoints(-200, 400, 300, 'miss');

    setTimeout(() => {
      gameRef.current?.endGame({
        success: false,
        reason: 'fusion_meltdown'
      });
    }, 2200);
  };

  /* ===================== CORE LOOP ===================== */
  useEffect(() => {
    loopRef.current = setInterval(() => {
      if (isGameOver) return;

      setCoreTemp(prev => {
        const fuelHeat = fuelRate * 10;
        const cooling = coolingRate * 8;
        const fluctuation = (Math.random() - 0.5) * 200;
        return Math.max(1000, prev + fuelHeat - cooling + fluctuation);
      });

      setContainmentField(prev => {
        let damage = 0;

        if (coreTemp > 8500) damage = 3;
        else if (coreTemp > 7500) damage = 1;

        if (coreTemp > 4500 && coreTemp < 6500) {
          return Math.min(100, prev + 0.25);
        }

        const next = Math.max(0, prev - damage);
        if (next <= 0) triggerMeltdown();
        return next;
      });

      // Energy + scoring
      if (coreTemp > 4000 && coreTemp < 7000 && containmentField > 0) {
        const output = Math.floor((coreTemp / 100) * (containmentField / 100));
        setEnergyOutput(output);

        if (gameRef.current?.isGameStarted) {
          tickRef.current++;
          if (tickRef.current >= 10) {
            gameRef.current.addPoints(output, 300, 300, 'score');
            if (output > 60) {
              gameRef.current.addPoints(15, 300, 300, 'good');
            }
            tickRef.current = 0;
          }
        }
      } else {
        setEnergyOutput(0);
        if (gameRef.current?.isGameStarted && coreTemp > 8000) {
          tickRef.current++;
          if (tickRef.current >= 10) {
            gameRef.current.addPoints(-25, 300, 300, 'miss');
            tickRef.current = 0;
          }
        }
      }
    }, 100);

    return () => clearInterval(loopRef.current);
  }, [fuelRate, coolingRate, coreTemp, containmentField, isGameOver]);

  /* ===================== UI ===================== */
  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      gameId={gameId}
      instructions="Balance Fuel Injection and Cooling to keep the fusion core stable. Prevent containment failure."
      objective="Maintain optimal temperature and maximize energy output."
      scoring="Points scale with energy output and reactor stability."
      duration={60}
      difficulty={difficulty}
      onComplete={onComplete}
      onClose={onClose}
    >
      <div className="relative w-full h-full flex flex-col p-4 gap-6">

        {/* ===== MELTDOWN CINEMATIC ===== */}
        {meltdown && (
          <>
            <div className="absolute inset-0 bg-red-600 opacity-40 animate-ping z-40" />
            <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl font-extrabold text-red-500 animate-pulse mb-4">
                ☢️ FUSION MELTDOWN
              </h1>
              <p className="text-gray-300 max-w-md mb-6">
                Containment field failure. Plasma destabilized.
                Reactor integrity lost.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-700"
              >
                Abort Mission
              </button>
            </div>
          </>
        )}

        {/* ===== CORE MONITOR ===== */}
        <div className="relative h-48 bg-black rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden">
          <div
            className={`absolute rounded-full blur-xl transition-all duration-300 opacity-80
              ${coreTemp > 7000 ? 'bg-red-500 animate-pulse' :
              coreTemp < 4000 ? 'bg-blue-500' : 'bg-purple-500'}`}
            style={{
              width: `${Math.min(220, coreTemp / 28)}px`,
              height: `${Math.min(220, coreTemp / 28)}px`
            }}
          />

          <div className="z-10 text-center">
            <div className="text-5xl font-bold font-mono text-white">
              {Math.round(coreTemp)} K
            </div>
            <div className="text-sm text-gray-300">CORE TEMPERATURE</div>
            {coreTemp > 7500 && (
              <div className="text-red-500 font-bold animate-pulse">
                ⚠ CRITICAL OVERHEAT
              </div>
            )}
          </div>

          <div className="absolute bottom-2 w-3/4 h-2 bg-gray-800 rounded">
            <div className="absolute left-1/2 w-1/4 h-full bg-green-500/50 -translate-x-1/2" />
            <div
              className="absolute h-full w-1 bg-white transition-all duration-75"
              style={{
                left: `${Math.min(100, Math.max(0, (coreTemp - 1000) / 9000 * 100))}%`
              }}
            />
          </div>
        </div>

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <div className="text-gray-400 text-xs">Containment Field</div>
            <div className={`text-2xl font-bold ${containmentField < 30 ? 'text-red-500' : 'text-blue-400'}`}>
              {Math.round(containmentField)}%
            </div>
            <div className="w-full bg-gray-800 h-1 mt-2">
              <div className="h-full bg-blue-500" style={{ width: `${containmentField}%` }} />
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <div className="text-gray-400 text-xs">Energy Output</div>
            <div className="text-2xl font-bold text-yellow-400">
              {energyOutput} GW
            </div>
          </div>
        </div>

        {/* ===== CONTROLS ===== */}
        <div className="grid grid-cols-2 gap-8 mt-auto">
          <div>
            <label className="block text-red-400 font-bold mb-2">Fuel Injection</label>
            <input
              type="range"
              min="0"
              max="100"
              value={fuelRate}
              disabled={isGameOver}
              onChange={e => setFuelRate(+e.target.value)}
              className="w-full accent-red-500"
            />
            <div className="text-right text-gray-400">{fuelRate}%</div>
          </div>

          <div>
            <label className="block text-blue-400 font-bold mb-2">Cooling Power</label>
            <input
              type="range"
              min="0"
              max="100"
              value={coolingRate}
              disabled={isGameOver}
              onChange={e => setCoolingRate(+e.target.value)}
              className="w-full accent-blue-500"
            />
            <div className="text-right text-gray-400">{coolingRate}%</div>
          </div>
        </div>

      </div>
    </MiniGameBase>
  );
};
