// Mini-games index file for easy imports
// All mini-games organized by timeline

// Past Timeline Games (Industrial Revolution)
export { BlacksmithForgeSimulator } from './past/BlacksmithForgeSimulator';
export { SteamEnginePressureControl } from './past/SteamEnginePressureControl';
export { AncientClockmakerAlignment } from './past/AncientClockmakerAlignment';
export { TelegraphMorseDecoder } from './past/TelegraphMorseDecoder';

// Present Timeline Games (Modern Era)
// src/components/minigames/index.js
export { EnhancedTrafficSignalController } from './present/TrafficSignalController';
export { StockMarketDecisionGame } from './present/StockMarketDecisionGame';
export { EnergyGridBalancer } from './present/EnergyGridBalancer';

// Future Timeline Games (Sci-Fi Era)
export { TimeRiftStabilizer } from './future/TimeRiftStabilizer';
export { AIDefenseMatrix } from './future/AIDefenseMatrix';
export { FusionReactorControl } from './future/FusionReactorControl';

// Mini-game metadata for UI
export const miniGameMetadata = {
  past: [
    {
      id: 'blacksmith',
      name: 'Blacksmith Forge Simulator',
      component: 'BlacksmithForgeSimulator',
      description: 'Master the art of temperature control and timing',
      difficulty: 'medium',
      icon: '🔨',
      category: 'Craftsmanship'
    },
    {
      id: 'steam',
      name: 'Steam Engine Pressure Control',
      component: 'SteamEnginePressureControl',
      description: 'Manage steam pressure to prevent explosions',
      difficulty: 'hard',
      icon: '⚙️',
      category: 'Engineering'
    },
    {
      id: 'clockmaker',
      name: 'Ancient Clockmaker Alignment',
      component: 'AncientClockmakerAlignment',
      description: 'Align gears for precise mechanical operation',
      difficulty: 'medium',
      icon: '⚙️',
      category: 'Precision'
    },
    {
      id: 'telegraph',
      name: 'Telegraph Morse Decoder',
      component: 'TelegraphMorseDecoder',
      description: 'Decode incoming Morse code messages',
      difficulty: 'easy',
      icon: '📡',
      category: 'Communication'
    }
  ],
  present: [
    {
      id: 'traffic',
      name: 'Traffic Signal Controller',
      component: 'TrafficSignalController',
      description: 'Manage urban traffic flow and prevent accidents',
      difficulty: 'medium',
      icon: '🚦',
      category: 'Urban Management'
    },
    {
      id: 'stock',
      name: 'Stock Market Decision Game',
      component: 'StockMarketDecisionGame',
      description: 'Predict stock movements and maximize profits',
      difficulty: 'hard',
      icon: '📈',
      category: 'Finance'
    },
    {
      id: 'grid',
      name: 'Energy Grid Balancer',
      component: 'EnergyGridBalancer',
      description: 'Balance power generation with grid demand',
      difficulty: 'medium',
      icon: '⚡',
      category: 'Infrastructure'
    }
  ],
  future: [
    {
      id: 'rift',
      name: 'Time Rift Stabilizer',
      component: 'TimeRiftStabilizer',
      description: 'Stabilize temporal anomalies in the timeline',
      difficulty: 'hard',
      icon: '🌀',
      category: 'Temporal Control'
    },
    {
      id: 'defense',
      name: 'AI Defense Matrix',
      component: 'AIDefenseMatrix',
      description: 'Defend against rogue AI nodes',
      difficulty: 'hard',
      icon: '🤖',
      category: 'Cybersecurity'
    },
    {
      id: 'reactor',
      name: 'Fusion Reactor Control',
      component: 'FusionReactorControl',
      description: 'Control fusion reactors to prevent meltdowns',
      difficulty: 'hard',
      icon: '⚛️',
      category: 'Nuclear Engineering'
    }
  ]
};

// Helper function to get mini-game component by ID
export const getMiniGameComponent = (timeline, gameId) => {
  const timelineGames = miniGameMetadata[timeline];
  if (!timelineGames) return null;
  
  const gameMeta = timelineGames.find(game => game.id === gameId);
  if (!gameMeta) return null;
  
  // Dynamic import to avoid circular dependencies
  switch (gameMeta.component) {
    case 'BlacksmithForgeSimulator':
      return require('./past/BlacksmithForgeSimulator').BlacksmithForgeSimulator;
    case 'SteamEnginePressureControl':
      return require('./past/SteamEnginePressureControl').SteamEnginePressureControl;
    case 'AncientClockmakerAlignment':
      return require('./past/AncientClockmakerAlignment').AncientClockmakerAlignment;
    case 'TelegraphMorseDecoder':
      return require('./past/TelegraphMorseDecoder').TelegraphMorseDecoder;
    case 'TrafficSignalController':
      return require('./present/TrafficSignalController').TrafficSignalController;
    case 'StockMarketDecisionGame':
      return require('./present/StockMarketDecisionGame').StockMarketDecisionGame;
    case 'EnergyGridBalancer':
      return require('./present/EnergyGridBalancer').EnergyGridBalancer;
    case 'TimeRiftStabilizer':
      return require('./future/TimeRiftStabilizer').TimeRiftStabilizer;
    case 'AIDefenseMatrix':
      return require('./future/AIDefenseMatrix').AIDefenseMatrix;
    case 'FusionReactorControl':
      return require('./future/FusionReactorControl').FusionReactorControl;
    default:
      return null;
  }
};

