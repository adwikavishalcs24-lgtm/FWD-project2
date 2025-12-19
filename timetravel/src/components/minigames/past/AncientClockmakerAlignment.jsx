
import React, { useState, useEffect } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const AncientClockmakerAlignment = ({
  title = "Ancient Clockmaker",
  timeline = "past",
  difficulty = "medium"
}) => {
  const [gears, setGears] = useState([
    { id: 1, angle: 0, speed: 0, targetSpeed: 2, color: '#F59E0B', size: 100 },
    { id: 2, angle: 45, speed: 0, targetSpeed: -1.5, color: '#6366F1', size: 80 },
    { id: 3, angle: 90, speed: 0, targetSpeed: 1, color: '#10B981', size: 120 }
  ]);
  
  const [aligned, setAligned] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGears(prev => prev.map(gear => ({
        ...gear,
        angle: (gear.angle + gear.speed) % 360
      })));
      
      // Check alignment
      // Logic: If all gears are spinning at their target speeds
      const isAligned = gears.every(g => Math.abs(g.speed - g.targetSpeed) < 0.1);
      setAligned(isAligned);
      
    }, 16);
    return () => clearInterval(interval);
  }, [gears]);

  const adjustSpeed = (id, amount) => {
    setGears(prev => prev.map(gear => 
        gear.id === id ? { ...gear, speed: gear.speed + amount } : gear
    ));
  };

  const renderGear = (gear) => (
    <div key={gear.id} className="flex flex-col items-center gap-4">
        <div 
            className="relative transition-transform duration-75"
            style={{ 
                width: gear.size, 
                height: gear.size,
                transform: `rotate(${gear.angle}deg)`
            }}
        >
             {/* Gear SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <path 
                    d="M50 0 L55 10 L65 5 L70 15 L80 10 L82 22 L92 20 L90 32 L100 35 L95 45 L100 55 L90 58 L92 70 L82 68 L80 80 L70 75 L65 85 L55 80 L50 90 L45 80 L35 85 L30 75 L20 80 L18 68 L8 70 L10 58 L0 55 L5 45 L0 35 L10 32 L8 20 L18 22 L20 10 L30 15 L35 5 L45 10 Z" 
                    fill={gear.color}
                    stroke="#1F2937"
                    strokeWidth="2"
                />
                <circle cx="50" cy="50" r="15" fill="#374151" />
                <rect x="45" y="45" width="10" height="10" fill="#D1D5DB" />
            </svg>
            
            {/* Speed Indicator overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{transform: `rotate(-${gear.angle}deg)`}}>
                <span className="bg-black/70 text-white text-xs px-1 rounded font-mono">
                    {gear.speed.toFixed(1)}
                </span>
            </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
            <button 
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center font-bold text-white border-b-2 border-gray-900 active:border-b-0 active:translate-y-1"
                onClick={() => adjustSpeed(gear.id, -0.5)}
            >
                -
            </button>
            <div className={`px-2 py-1 rounded text-xs font-bold flex items-center ${
                Math.abs(gear.speed - gear.targetSpeed) < 0.1 ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400'
            }`}>
                Target: {gear.targetSpeed}
            </div>
            <button 
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center font-bold text-white border-b-2 border-gray-900 active:border-b-0 active:translate-y-1"
                onClick={() => adjustSpeed(gear.id, 0.5)}
            >
                +
            </button>
        </div>
    </div>
  );

  return (
    <MiniGameBase
      title={title}
      timeline={timeline}
      instructions="Adjust the speed of each gear to match its Target Speed. When all gears are synchronized, the mechanism activates."
      objective="Synchronize all gears."
      scoring="Hold synchronization to accumulate points."
      duration={60}
      difficulty={difficulty}
    >
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className={`mb-8 px-6 py-2 rounded-full font-bold text-xl border-2 transition-colors duration-500 ${
            aligned 
            ? 'bg-green-900/50 border-green-500 text-green-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
            : 'bg-gray-900/50 border-gray-700 text-gray-500'
        }`}>
            {aligned ? "⚙️ MECHANISM SYNCHRONIZED" : "⚠️ GEARS MISALIGNED"}
        </div>

        <div className="flex flex-wrap justify-center gap-12">
            {gears.map(renderGear)}
        </div>
      </div>
    </MiniGameBase>
  );
};

