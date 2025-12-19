
import React, { useState, useEffect } from 'react';
import { MiniGameBase } from '../EnhancedMiniGameBase';

export const FusionReactorControl = ({
  title = "Fusion Core Manager",
  timeline = "future",
  difficulty = "hard"
}) => {
  const [coreTemp, setCoreTemp] = useState(5000); // Target 5000-6000
  const [containmentField, setContainmentField] = useState(100);
  const [fuelRate, setFuelRate] = useState(50);
  const [coolingRate, setCoolingRate] = useState(50);
  const [energyOutput, setEnergyOutput] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setCoreTemp(prev => {
            const fuelHeat = fuelRate * 10;
            const cooling = coolingRate * 8;
            const fluctuation = (Math.random() - 0.5) * 200;
            return Math.max(1000, prev + fuelHeat - cooling + fluctuation);
        });

        // Containment Logic
        setContainmentField(prev => {
            let damage = 0;
            if (coreTemp > 8000) damage = 2;
            else if (coreTemp > 7000) damage = 0.5;
            
            // Regen if stable
            if (coreTemp > 4500 && coreTemp < 6500) return Math.min(100, prev + 0.2);
            
            return Math.max(0, prev - damage);
        });

        // Output calculation
        if (coreTemp > 4000 && coreTemp < 7000) {
            setEnergyOutput(Math.floor(coreTemp / 100 * (containmentField/100)));
        } else {
            setEnergyOutput(0);
        }

    }, 100);
    return () => clearInterval(interval);
  }, [fuelRate, coolingRate, coreTemp, containmentField]);

  return (
    <MiniGameBase
      title={title}
      timeline={timeline}
      instructions="Balance Fuel Injection and Cooling to keep Core Temp in the optimal range (Green Zone). Don't let Containment fail!"
      objective="Generate maximum Energy Output."
      scoring="+10 pts for every GW generated."
      duration={60}
      difficulty={difficulty}
    >
      <div className="w-full h-full flex flex-col p-4 gap-6">
        
        {/* Core Monitor */}
        <div className="relative h-48 bg-black rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden">
             {/* Plasma Visual */}
             <div 
                className={`absolute rounded-full filter blur-xl transition-all duration-300 opacity-80 mix-blend-screen
                    ${coreTemp > 7000 ? 'bg-red-500 animate-pulse' : 
                      coreTemp < 4000 ? 'bg-blue-500' : 'bg-purple-500'}`}
                style={{
                    width: `${Math.min(200, coreTemp / 30)}px`,
                    height: `${Math.min(200, coreTemp / 30)}px`
                }}
             ></div>
             
             {/* Text Overlay */}
             <div className="z-10 text-center">
                 <div className="text-5xl font-bold font-mono text-white drop-shadow-lg">{Math.round(coreTemp)} K</div>
                 <div className="text-sm text-gray-300">CORE TEMPERATURE</div>
                 {coreTemp > 7000 && <div className="text-red-500 font-bold animate-flash">WARNING: OVERHEATING</div>}
             </div>

             {/* Optimal Zone Marker Overlay */}
             <div className="absolute bottom-2 w-3/4 h-2 bg-gray-800 rounded">
                 <div className="absolute left-1/2 w-1/4 h-full bg-green-500/50 transform -translate-x-1/2"></div>
                 <div 
                    className="absolute h-full w-1 bg-white transition-all duration-75"
                    style={{ left: `${Math.min(100, Math.max(0, (coreTemp-1000)/9000 * 100))}%` }}
                 ></div>
             </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-900 p-4 rounded border border-gray-700">
                 <div className="text-gray-400 text-xs">Containment Field</div>
                 <div className={`text-2xl font-bold ${containmentField < 30 ? 'text-red-500' : 'text-blue-400'}`}>
                     {Math.round(containmentField)}%
                 </div>
                 <div className="w-full bg-gray-800 h-1 mt-2">
                     <div className="h-full bg-blue-500 transition-all" style={{width: `${containmentField}%`}}></div>
                 </div>
             </div>

             <div className="bg-gray-900 p-4 rounded border border-gray-700">
                 <div className="text-gray-400 text-xs">Energy Output</div>
                 <div className="text-2xl font-bold text-yellow-400">
                     {energyOutput} GW
                 </div>
             </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-8 mt-auto">
             <div>
                 <label className="block text-red-400 font-bold mb-2">Fuel Injection Rate</label>
                 <input 
                    type="range" min="0" max="100" value={fuelRate} 
                    onChange={(e) => setFuelRate(parseInt(e.target.value))}
                    className="w-full accent-red-500"
                 />
                 <div className="text-right text-gray-400">{fuelRate}%</div>
             </div>

             <div>
                 <label className="block text-blue-400 font-bold mb-2">Cooling System Power</label>
                 <input 
                    type="range" min="0" max="100" value={coolingRate} 
                    onChange={(e) => setCoolingRate(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                 />
                 <div className="text-right text-gray-400">{coolingRate}%</div>
             </div>
        </div>

      </div>
    </MiniGameBase>
  );
};

