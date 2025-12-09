/**
 * TIME MACHINE UPGRADE DATA
 * Complete upgrade tree with categories, effects, and requirements
 */

export const timeMachineUpgrades = [
  // ========== CORE STABILITY SYSTEMS ==========
  {
    id: 'core_stabilizer_1',
    name: 'Temporal Stabilizer Mk I',
    category: 'core',
    cost: 500,
    description: 'Basic temporal field stabilization. Reduces timeline fluctuations and prevents minor paradoxes from cascading.',
    icon: '🔷',
    color: '#00E5FF',
    effects: {
      stability: 10,
      paradoxReduction: 5,
      energyMax: 0,
      cooldown: 0,
    },
    requirements: [],
    rarity: 'common',
  },
  {
    id: 'core_dampener',
    name: 'Quantum Dampeners',
    category: 'core',
    cost: 1200,
    description: 'Advanced quantum field dampening technology. Absorbs temporal shockwaves and stabilizes quantum entanglement.',
    icon: '💎',
    color: '#9C27B0',
    effects: {
      stability: 15,
      paradoxReduction: 10,
      energyMax: 50,
      cooldown: 0,
    },
    requirements: ['core_stabilizer_1'],
    rarity: 'rare',
  },
  {
    id: 'core_entropy',
    name: 'Entropy Regulator',
    category: 'core',
    cost: 2500,
    description: 'Manipulates entropy at the quantum level. Prevents timeline decay and maintains causal consistency across jumps.',
    icon: '⚛️',
    color: '#00FF99',
    effects: {
      stability: 20,
      paradoxReduction: 15,
      energyMax: 100,
      cooldown: -5,
    },
    requirements: ['core_dampener'],
    rarity: 'epic',
  },

  // ========== ENERGY & REACTOR SYSTEMS ==========
  {
    id: 'energy_steam',
    name: 'Steam Cell Reactor',
    category: 'energy',
    cost: 800,
    description: 'Victorian-era inspired steam-powered energy cells. Provides reliable baseline power with steampunk aesthetics.',
    icon: '⚙️',
    color: '#FFC107',
    effects: {
      stability: 0,
      paradoxReduction: 0,
      energyMax: 200,
      cooldown: 0,
    },
    requirements: [],
    rarity: 'common',
  },
  {
    id: 'energy_biofusion',
    name: 'Bio-Fusion Converter',
    category: 'energy',
    cost: 1800,
    description: 'Converts organic matter into pure temporal energy. Highly efficient but requires careful calibration.',
    icon: '🧬',
    color: '#00FF99',
    effects: {
      stability: 5,
      paradoxReduction: 0,
      energyMax: 400,
      cooldown: -3,
    },
    requirements: ['energy_steam'],
    rarity: 'rare',
  },
  {
    id: 'energy_singularity',
    name: 'Singularity Core',
    category: 'energy',
    cost: 4000,
    description: 'Harnesses the power of a contained micro-singularity. Provides near-infinite energy but destabilizes spacetime.',
    icon: '🌌',
    color: '#9C27B0',
    effects: {
      stability: -10,
      paradoxReduction: 0,
      energyMax: 1000,
      cooldown: -10,
    },
    requirements: ['energy_biofusion'],
    rarity: 'legendary',
  },

  // ========== NAVIGATION SYSTEMS ==========
  {
    id: 'nav_compass',
    name: 'Chrono-Compass',
    category: 'navigation',
    cost: 600,
    description: 'Steampunk-style temporal navigation device. Points toward stable timeline branches with brass precision.',
    icon: '🧭',
    color: '#FFC107',
    effects: {
      stability: 5,
      paradoxReduction: 5,
      energyMax: 0,
      cooldown: -2,
    },
    requirements: [],
    rarity: 'common',
  },
  {
    id: 'nav_lens',
    name: 'Temporal Lens v2',
    category: 'navigation',
    cost: 1500,
    description: 'Advanced optical system for viewing multiple timeline branches simultaneously. Increases jump accuracy.',
    icon: '🔭',
    color: '#00E5FF',
    effects: {
      stability: 10,
      paradoxReduction: 10,
      energyMax: 0,
      cooldown: -5,
    },
    requirements: ['nav_compass'],
    rarity: 'rare',
  },
  {
    id: 'nav_anchor',
    name: 'Reality Anchor',
    category: 'navigation',
    cost: 3000,
    description: 'Locks the machine to a specific point in spacetime. Prevents drift and ensures precise temporal coordinates.',
    icon: '⚓',
    color: '#9C27B0',
    effects: {
      stability: 25,
      paradoxReduction: 20,
      energyMax: 0,
      cooldown: 0,
    },
    requirements: ['nav_lens'],
    rarity: 'epic',
  },

  // ========== DEFENSE & SURVIVAL ==========
  {
    id: 'defense_shield',
    name: 'Paradox Shield Generator',
    category: 'defense',
    cost: 1000,
    description: 'Generates a protective field against paradox waves. Essential for surviving timeline collapses.',
    icon: '🛡️',
    color: '#00FF99',
    effects: {
      stability: 15,
      paradoxReduction: 25,
      energyMax: 0,
      cooldown: 0,
    },
    requirements: [],
    rarity: 'rare',
  },
  {
    id: 'defense_firewall',
    name: 'Quantum Firewall',
    category: 'defense',
    cost: 2200,
    description: 'Cyberpunk-inspired digital defense system. Blocks hostile temporal intrusions and AI attacks.',
    icon: '🔥',
    color: '#FF3B3B',
    effects: {
      stability: 10,
      paradoxReduction: 30,
      energyMax: 100,
      cooldown: 0,
    },
    requirements: ['defense_shield'],
    rarity: 'epic',
  },
  {
    id: 'defense_nexus',
    name: 'Nexus Reinforcement Plate',
    category: 'defense',
    cost: 3500,
    description: 'Reinforced temporal armor plating. Protects the machine core from catastrophic timeline events.',
    icon: '🔰',
    color: '#9C27B0',
    effects: {
      stability: 20,
      paradoxReduction: 35,
      energyMax: 200,
      cooldown: 0,
    },
    requirements: ['defense_firewall'],
    rarity: 'legendary',
  },

  // ========== TRAVEL SYSTEMS ==========
  {
    id: 'travel_warp',
    name: 'Warp Coil Amplifier',
    category: 'travel',
    cost: 1100,
    description: 'Amplifies the temporal warp field. Reduces travel time between eras significantly.',
    icon: '🌀',
    color: '#00E5FF',
    effects: {
      stability: 0,
      paradoxReduction: 0,
      energyMax: 100,
      cooldown: -8,
    },
    requirements: [],
    rarity: 'rare',
  },
  {
    id: 'travel_phase',
    name: 'Dimensional Phase Booster',
    category: 'travel',
    cost: 2000,
    description: 'Allows phasing through dimensional barriers. Enables access to alternate timeline branches.',
    icon: '🌈',
    color: '#9C27B0',
    effects: {
      stability: 5,
      paradoxReduction: 5,
      energyMax: 150,
      cooldown: -12,
    },
    requirements: ['travel_warp'],
    rarity: 'epic',
  },
  {
    id: 'travel_zerolag',
    name: 'Zero-Lag Jump Engine',
    category: 'travel',
    cost: 4500,
    description: 'Instantaneous temporal displacement. Eliminates all cooldown between jumps. Highly unstable.',
    icon: '⚡',
    color: '#FFC107',
    effects: {
      stability: -15,
      paradoxReduction: 0,
      energyMax: 300,
      cooldown: -20,
    },
    requirements: ['travel_phase'],
    rarity: 'legendary',
  },

  // ========== GOD-TIER UPGRADES ==========
  {
    id: 'god_chronarch',
    name: 'Chronarch Protocol',
    category: 'godtier',
    cost: 10000,
    description: 'Ascend to Chronarch status. Grants mastery over time itself. Unlocks reality manipulation capabilities.',
    icon: '👑',
    color: '#FFD700',
    effects: {
      stability: 50,
      paradoxReduction: 50,
      energyMax: 500,
      cooldown: -15,
    },
    requirements: ['core_entropy', 'nav_anchor', 'defense_nexus'],
    rarity: 'mythic',
  },
  {
    id: 'god_omega',
    name: 'Omega Paradox Engine',
    category: 'godtier',
    cost: 15000,
    description: 'Harness paradoxes as fuel. Converts timeline instability into raw power. Reality becomes your playground.',
    icon: '♾️',
    color: '#FF00FF',
    effects: {
      stability: 30,
      paradoxReduction: 100,
      energyMax: 1000,
      cooldown: -25,
    },
    requirements: ['god_chronarch', 'energy_singularity'],
    rarity: 'mythic',
  },
  {
    id: 'god_mkx',
    name: 'Time Machine Mk X',
    category: 'godtier',
    cost: 25000,
    description: 'The ultimate temporal machine. Transcends time and space. You are no longer bound by causality.',
    icon: '🌟',
    color: '#FFFFFF',
    effects: {
      stability: 100,
      paradoxReduction: 100,
      energyMax: 2000,
      cooldown: -30,
    },
    requirements: ['god_omega', 'travel_zerolag'],
    rarity: 'mythic',
  },
];

export const getUpgradesByCategory = (category) => {
  if (category === 'all') return timeMachineUpgrades;
  return timeMachineUpgrades.filter(u => u.category === category);
};

export const getUpgradeById = (id) => {
  return timeMachineUpgrades.find(u => u.id === id);
};

export const areRequirementsMet = (upgradeId, purchasedUpgrades) => {
  const upgrade = getUpgradeById(upgradeId);
  if (!upgrade) return false;
  return upgrade.requirements.every(reqId => purchasedUpgrades.includes(reqId));
};

export const calculateMachineStats = (purchasedUpgrades) => {
  const baseStats = {
    stability: 50,
    energyMax: 1000,
    paradoxReduction: 0,
    cooldown: 60,
  };

  purchasedUpgrades.forEach(upgradeId => {
    const upgrade = getUpgradeById(upgradeId);
    if (upgrade) {
      baseStats.stability += upgrade.effects.stability;
      baseStats.energyMax += upgrade.effects.energyMax;
      baseStats.paradoxReduction += upgrade.effects.paradoxReduction;
      baseStats.cooldown += upgrade.effects.cooldown;
    }
  });

  baseStats.stability = Math.max(0, Math.min(100, baseStats.stability));
  baseStats.cooldown = Math.max(5, baseStats.cooldown);

  return baseStats;
};
