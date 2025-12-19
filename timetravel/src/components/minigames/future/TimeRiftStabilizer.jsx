
import React, { useState, useEffect, useRef, useContext } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const TimeRiftStabilizer = ({
  title = "Time Rift Stabilizer",
  timeline = "future",
  difficulty = "hard"
}) => {
  const [riftStability, setRiftStability] = useState(50);
  const [frequencies, setFrequencies] = useState([
    { id: 1, val: 50, target: 50, color: 'cyan' },
    { id: 2, val: 50, target: 50, color: 'purple' },
    { id: 3, val: 50, target: 50, color: 'pink' }
  ]);
  const [resonance, setResonance] = useState(0);
  
  const gameLoopRef = useRef();
  const adjustIntervals = useRef({});

  // Drift mechanics
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      // Drift targets randomly
      setFrequencies(prev => prev.map(f => {
        // Randomly drift target
        let newTarget = f.target;
        if (Math.random() < 0.1) {
          newTarget = Math.max(10, Math.min(90, f.target + (Math.random() - 0.5) * 30));
        }
        return { ...f, target: newTarget };
      }));

      // Calculate resonance
      setFrequencies(currentFreqs => {
        const totalDiff = currentFreqs.reduce((acc, f) => acc + Math.abs(f.val - f.target), 0);
        const newResonance = Math.max(0, 100 - (totalDiff / 3));
        setResonance(newResonance);
        
        // Update stability based on resonance
        setRiftStability(prev => {
            const change = newResonance > 80 ? 0.5 : newResonance < 40 ? -0.5 : -0.1;
            return Math.max(0, Math.min(100, prev + change));
        });
        
        return currentFreqs;
      });

    }, 100);

    return () => {
      clearInterval(gameLoopRef.current);
      Object.values(adjustIntervals.current).forEach(interval => clearInterval(interval));
      adjustIntervals.current = {};
    };
  }, []);

  const adjustFrequency = (id, delta) => {
    setFrequencies(prev => prev.map(f => 
        f.id === id ? { ...f, val: Math.max(0, Math.min(100, f.val + delta)) } : f
    ));
  };

  const startAdjusting = (id, delta) => {
    if (adjustIntervals.current[id]) return;
    adjustIntervals.current[id] = setInterval(() => {
      adjustFrequency(id, delta);
    }, 50); // Adjust every 50ms
  };

  const stopAdjusting = (id) => {
    if (adjustIntervals.current[id]) {
      clearInterval(adjustIntervals.current[id]);
      delete adjustIntervals.current[id];
    }
  };

  return (
    <MiniGameBase
      title={title}
      timeline={timeline}
      instructions="Align the Containment Fields with the Flux Targets to stabilize the Time Rift."
      objective="Maintain Rift Stability."
      scoring="Score based on Resonance percentage."
      duration={60}
      difficulty={difficulty}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Rift Visual */}
        <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
            {/* Swirling Vortex */}
            <div 
                className={`absolute inset-0 rounded-full border-4 border-dashed border-opacity-50 transition-all duration-1000
                    ${riftStability < 30 ? 'border-red-500 animate-spin-fast' : 'border-cyan-500 animate-spin-slow'}`}
            ></div>
            
            <div 
                className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-900 to-black opacity-80 blur-md animate-pulse"
                style={{ transform: `scale(${0.5 + (resonance / 200)})` }}
            ></div>

            <div className="z-10 text-center">
                <div className="text-xs uppercase tracking-widest text-gray-400">Rift Stability</div>
                <div className={`text-4xl font-bold ${riftStability < 30 ? 'text-red-500' : 'text-cyan-400'}`}>
                    {Math.round(riftStability)}%
                </div>
            </div>
        </div>

        {/* Frequency Sliders */}
        <div className="w-full max-w-md space-y-6 bg-black/40 p-6 rounded-xl border border-gray-700">
            {frequencies.map(freq => (
                <div key={freq.id} className="relative pt-6">
                    {/* Target Marker */}
                    <div 
                        className="absolute top-2 w-4 h-4 border-2 border-white rotate-45 transform -translate-x-1/2 transition-all duration-500 z-10"
                        style={{ left: `${freq.target}%`, borderColor: freq.color }}
                    ></div>
                    
                    {/* Track */}
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                        <div 
                            className="h-full transition-all duration-75"
                            style={{ 
                                width: `${freq.val}%`, 
                                backgroundColor: freq.color,
                                boxShadow: `0 0 10px ${freq.color}`
                            }}
                        ></div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-between items-center">
                         <button 
                            className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 hover:bg-gray-700 active:bg-gray-600 text-white font-bold"
                            onMouseDown={() => startAdjusting(freq.id, -5)}
                            onMouseUp={() => stopAdjusting(freq.id)}
                            onMouseLeave={() => stopAdjusting(freq.id)}
                        >
                            {'<'}
                        </button>
                         <div className="text-xs uppercase font-bold text-gray-400">Field {freq.id}</div>
                         <button 
                            className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 hover:bg-gray-700 active:bg-gray-600 text-white font-bold"
                            onMouseDown={() => startAdjusting(freq.id, 5)}
                            onMouseUp={() => stopAdjusting(freq.id)}
                            onMouseLeave={() => stopAdjusting(freq.id)}
                        >
                            {'>'}
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* Resonance Status */}
        <div className="mt-4 w-full max-w-md">
            <div className="flex justify-between text-xs text-gray-400 uppercase mb-1">
                <span>Total Resonance</span>
                <span>{Math.round(resonance)}%</span>
            </div>
            <div className="h-1 w-full bg-gray-800 rounded-full">
                <div 
                    className={`h-full rounded-full transition-all duration-300 ${resonance > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${resonance}%` }}
                ></div>
            </div>
        </div>

      </div>
    </MiniGameBase>
  );
};

