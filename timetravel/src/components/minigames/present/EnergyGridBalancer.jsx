
import React, { useState, useEffect, useRef } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const EnergyGridBalancer = ({
  title = "Grid Operator",
  timeline = "present",
  difficulty = "medium"
}) => {
  const [demand, setDemand] = useState(500);
  const [supply, setSupply] = useState(500);
  const [sources, setSources] = useState([
    { id: 'solar', name: 'Solar', output: 100, max: 200, color: 'text-yellow-400', bg: 'bg-yellow-500' },
    { id: 'wind', name: 'Wind', output: 150, max: 250, color: 'text-blue-400', bg: 'bg-blue-500' },
    { id: 'nuclear', name: 'Nuclear', output: 250, max: 400, color: 'text-green-400', bg: 'bg-green-500' },
  ]);
  const [blackouts, setBlackouts] = useState(0);
  const gameRef = useRef(null);

  useEffect(() => {
    // Fluctuating demand
    const interval = setInterval(() => {
      setDemand(prev => {
        const change = (Math.random() - 0.5) * 50;
        return Math.max(200, Math.min(800, prev + change));
      });

      // Check grid status
      setSupply(currentSupply => {
        // We calculate supply from sources state effectively inside setting functions 
        // but here we are in interval closure. Better to recalculate supply outside based on sources.
        // However, let's keep logic simple: update derived state
        return sources.reduce((acc, src) => acc + src.output, 0);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sources]); // Re-run when sources change? No, this restarts interval. 
  // Better design: Use a single game tick for updates

  useEffect(() => {
    const loop = setInterval(() => {
      // Calculate current supply inside loop
      const currentSupply = sources.reduce((acc, src) => acc + src.output, 0);
      setSupply(currentSupply);

      const diff = Math.abs(currentSupply - demand);

      if (diff > 100) {
        setBlackouts(prev => prev + 1);
        if (gameRef.current?.isGameStarted) {
          gameRef.current.addPoints(-10, 300, 300, 'miss'); // Penalty
        }
      } else {
        // Good State
        if (gameRef.current?.isGameStarted) {
          if (diff < 20) {
            gameRef.current.addPoints(20, 300, 100, 'perfect'); // Perfect Balance
          } else if (diff < 50) {
            gameRef.current.addPoints(5, 300, 100, 'score');
          }
        }
      }

    }, 1000);
    return () => clearInterval(loop);
  }, [demand, sources]);


  const adjustOutput = (id, value) => {
    if (!gameRef.current?.isGameStarted) return;
    setSources(prev => prev.map(src => {
      if (src.id === id) {
        return { ...src, output: parseInt(value) };
      }
      return src;
    }));
  };

  const getGridHealth = () => {
    const diff = Math.abs(supply - demand);
    if (diff < 20) return { status: 'OPTIMAL', color: 'text-green-500' };
    if (diff < 50) return { status: 'STABLE', color: 'text-blue-500' };
    if (diff < 100) return { status: 'UNSTABLE', color: 'text-orange-500' };
    return { status: 'CRITICAL', color: 'text-red-500' };
  };

  const health = getGridHealth();

  return (
    <MiniGameBase
      ref={gameRef}
      title={title}
      timeline={timeline}
      instructions="Match the Total Supply to the Grid Demand. Adjust power sources to keep the grid stable."
      objective="Maintain Grid Stability."
      scoring="Points awarded for time spent in Optimal state."
      duration={60}
      difficulty={difficulty}
    >
      <div className="w-full h-full flex flex-col p-4">

        {/* Main Meters */}
        <div className="flex justify-around items-center mb-8 bg-gray-900 p-6 rounded-xl border border-gray-700">
          <div className="text-center">
            <div className="text-gray-400 mb-1">Grid Demand</div>
            <div className="text-4xl font-bold text-white">{Math.round(demand)} MW</div>
          </div>

          <div className="text-center px-8">
            <div className={`text-2xl font-bold ${health.color}`}>{health.status}</div>
            <div className="text-xs text-gray-500">Grid Status</div>
          </div>

          <div className="text-center">
            <div className="text-gray-400 mb-1">Total Supply</div>
            <div className={`text-4xl font-bold ${Math.abs(supply - demand) < 50 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.round(supply)} MW
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          {sources.map(src => (
            <div key={src.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className={`font-bold ${src.color}`}>{src.name} Power</span>
                <span className="font-mono text-white">{src.output} MW</span>
              </div>
              <input
                type="range"
                min="0"
                max={src.max}
                value={src.output}
                onChange={(e) => adjustOutput(src.id, e.target.value)}
                className={`w-full h-4 rounded-lg appearance-none cursor-pointer ${src.bg} opacity-70 hover:opacity-100 transition-opacity`}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 MW</span>
                <span>{src.max} MW</span>
              </div>
            </div>
          ))}
        </div>

        {/* Blackout Counter */}
        <div className="mt-8 text-center">
          <span className="text-red-500 font-bold">Grid Failures: {blackouts}</span>
        </div>

      </div>
    </MiniGameBase>
  );
};
