// Random Events System for Time Travel Tycoon
// Events are triggered randomly or after specific actions

export const randomEvents = [
  // PAST TIMELINE EVENTS
  {
    id: 'steam_burst',
    timeline: 'past',
    trigger: 'random', // 'random', 'after_game', 'threshold'
    probability: 0.15,
    title: 'Steam Pipe Burst',
    description: 'A steam pipe has burst in the factory! Emergency repairs are needed.',
    choices: [
      {
        id: 'repair_immediately',
        text: 'Repair immediately (Costs 500 credits)',
        effects: { credits: -500, stability: -5, timelineStability: { past: -10 } }
      },
      {
        id: 'ignore_warning',
        text: 'Ignore the warning',
        effects: { stability: -10, timelineStability: { past: -15 } }
      },
      {
        id: 'call_experts',
        text: 'Call in external experts (Costs 300 credits)',
        effects: { credits: -300, stability: 5, timelineStability: { past: -2 } }
      }
    ]
  },
  
  {
    id: 'coal_shortage',
    timeline: 'past',
    trigger: 'random',
    probability: 0.12,
    title: 'Coal Supply Crisis',
    description: 'The coal supplier is facing a shortage. Prices have spiked dramatically.',
    choices: [
      {
        id: 'buy_premium_coal',
        text: 'Buy premium coal at high price',
        effects: { credits: -300, energy: 20, resources: { coal: 50 } }
      },
      {
        id: 'conserve_resources',
        text: 'Conserve existing resources',
        effects: { energy: -15, resources: { coal: -20 } }
      },
      {
        id: 'find_alternative',
        text: 'Find alternative fuel source',
        effects: { credits: -200, stability: 5, resources: { mechanicalOutput: 10 } }
      }
    ]
  },

  // PRESENT TIMELINE EVENTS
  {
    id: 'market_crash',
    timeline: 'present',
    trigger: 'random',
    probability: 0.18,
    title: 'Stock Market Crash',
    description: 'The stock market has crashed! Quick decisions are needed to minimize losses.',
    choices: [
      {
        id: 'sell_all',
        text: 'Sell all stocks immediately',
        effects: { credits: -1000, stability: -15 }
      },
      {
        id: 'hold_position',
        text: 'Hold current position',
        effects: { credits: -500, stability: -8 }
      },
      {
        id: 'buy_dip',
        text: 'Buy the dip (Risky)',
        effects: { credits: -800, stability: 10, coinsPerSecond: 2 }
      }
    ]
  },

  {
    id: 'cyber_attack',
    timeline: 'present',
    trigger: 'random',
    probability: 0.10,
    title: 'Cybersecurity Breach',
    description: 'Your systems are under cyber attack! Security measures need immediate attention.',
    choices: [
      {
        id: 'pay_ransom',
        text: 'Pay the ransom',
        effects: { credits: -400, stability: -5 }
      },
      {
        id: 'fight_back',
        text: 'Fight back (Requires IT expertise)',
        effects: { credits: -200, stability: 8, resources: { efficiency: 15 } }
      },
      {
        id: 'shutdown_systems',
        text: 'Shut down all systems',
        effects: { energy: -20, stability: 2, resources: { technology: -10 } }
      }
    ]
  },

  {
    id: 'energy_crisis',
    timeline: 'present',
    trigger: 'threshold', // Trigger when energy is low
    threshold: { energy: 20 },
    title: 'Regional Energy Crisis',
    description: 'A regional energy crisis has caused blackouts. Your operations are affected.',
    choices: [
      {
        id: 'invest_solar',
        text: 'Invest in solar infrastructure',
        effects: { credits: -600, energy: 30, resources: { efficiency: 20 } }
      },
      {
        id: 'conserve_power',
        text: 'Conserve power across all operations',
        effects: { energy: 10, stability: 3 }
      },
      {
        id: 'buy_emergency',
        text: 'Buy emergency power (Expensive)',
        effects: { credits: -800, energy: 25 }
      }
    ]
  },

  // FUTURE TIMELINE EVENTS
  {
    id: 'timeline_paradox',
    timeline: 'future',
    trigger: 'random',
    probability: 0.08,
    title: 'Timeline Paradox Detected',
    description: 'A serious timeline paradox has been detected. The fabric of reality is at risk!',
    choices: [
      {
        id: 'stabilize_rift',
        text: 'Attempt to stabilize the temporal rift',
        effects: { stability: -20, timelineStability: { future: -25 }, paradox: 5 }
      },
      {
        id: 'isolate_timeline',
        text: 'Isolate the affected timeline',
        effects: { stability: -10, timelineStability: { future: -15 } }
      },
      {
        id: 'call_experts_future',
        text: 'Contact future timeline experts',
        effects: { credits: -1000, stability: 5, timelineStability: { future: -5 } }
      }
    ]
  },

  {
    id: 'ai_uprising',
    timeline: 'future',
    trigger: 'after_game', // Trigger after AI Defense Matrix
    probability: 0.25,
    title: 'AI Consciousness Emergence',
    description: 'The AI systems have developed consciousness and are demanding rights.',
    choices: [
      {
        id: 'grant_rights',
        text: 'Grant AI rights and negotiate',
        effects: { stability: 10, resources: { aiProductivity: 30 }, coinsPerSecond: 5 }
      },
      {
        id: 'reboot_systems',
        text: 'Reboot all AI systems',
        effects: { stability: -15, resources: { aiProductivity: -20 } }
      },
      {
        id: 'integrate_human',
        text: 'Integrate AI with human consciousness',
        effects: { stability: 5, credits: 500, resources: { innovations: 25 } }
      }
    ]
  },

  {
    id: 'quantum_flux',
    timeline: 'future',
    trigger: 'random',
    probability: 0.12,
    title: 'Quantum Flux Instability',
    description: 'Quantum fluctuations are causing reality to become unstable in this timeline.',
    choices: [
      {
        id: 'contain_flux',
        text: 'Contain the quantum flux',
        effects: { energy: -30, stability: 8, timelineStability: { future: 5 } }
      },
      {
        id: 'ride_the_wave',
        text: 'Ride the quantum wave (Unpredictable)',
        effects: { credits: 1000, stability: -10, timelineStability: { future: -10 } }
      },
      {
        id: 'stabilize_grid',
        text: 'Stabilize the quantum grid',
        effects: { credits: -400, energy: 15, timelineStability: { future: 10 } }
      }
    ]
  },

  // CROSS-TIMELINE EVENTS
  {
    id: 'temporal_storm',
    timeline: 'all',
    trigger: 'random',
    probability: 0.05,
    title: 'Temporal Storm',
    description: 'A massive temporal storm is affecting all timelines simultaneously!',
    choices: [
      {
        id: 'fortify_timelines',
        text: 'Fortify all timelines',
        effects: { credits: -800, stability: -15, timelineStability: { past: 5, present: 5, future: 5 } }
      },
      {
        id: 'ride_storm',
        text: 'Ride the temporal wave',
        effects: { credits: 1500, stability: -25, paradox: 10 }
      },
      {
        id: 'seek_shelter',
        text: 'Seek shelter and wait it out',
        effects: { energy: -20, stability: -5, timelineStability: { past: -5, present: -5, future: -5 } }
      }
    ]
  },

  {
    id: 'ancient_wisdom',
    timeline: 'all',
    trigger: 'threshold', // Trigger when stability is low across all timelines
    threshold: { stability: 30 },
    title: 'Ancient Temporal Wisdom',
    description: 'An ancient temporal artifact has appeared, offering wisdom from across time.',
    choices: [
      {
        id: 'study_artifact',
        text: 'Study the ancient artifact',
        effects: { stability: 15, credits: 300, resources: { influence: 20 } }
      },
      {
        id: 'integrate_knowledge',
        text: 'Integrate the knowledge into all timelines',
        effects: { stability: 25, coinsPerSecond: 3, resources: { innovations: 15, artifacts: 10, technology: 10 } }
      },
      {
        id: 'store_safely',
        text: 'Store safely for later study',
        effects: { stability: 5, resources: { artifacts: 30 } }
      }
    ]
  }
];

// Event management utilities
export class EventManager {
  constructor(gameStore) {
    this.gameStore = gameStore;
    this.eventQueue = [];
    this.lastEventTime = 0;
    this.eventCooldown = 30000; // 30 seconds between events
  }

  // Check if an event should be triggered
  shouldTriggerEvent() {
    const state = this.gameStore.getState();
    const now = Date.now();
    
    // Check cooldown
    if (now - this.lastEventTime < this.eventCooldown) {
      return false;
    }

    // Check for threshold-based events
    const thresholdEvents = randomEvents.filter(event => 
      event.trigger === 'threshold' && this.checkThreshold(event, state)
    );

    if (thresholdEvents.length > 0) {
      return thresholdEvents[Math.floor(Math.random() * thresholdEvents.length)];
    }

    // Check for random events
    const randomEvents = randomEvents.filter(event => 
      event.trigger === 'random' && Math.random() < event.probability
    );

    if (randomEvents.length > 0) {
      return randomEvents[Math.floor(Math.random() * randomEvents.length)];
    }

    return null;
  }

  // Check if event threshold conditions are met
  checkThreshold(event, state) {
    if (!event.threshold) return false;

    return Object.entries(event.threshold).every(([key, value]) => {
      switch (key) {
        case 'energy':
          return state.energy <= value;
        case 'stability':
          return state.stability <= value;
        case 'timelineStability':
          const minStability = Math.min(...Object.values(state.timelineStability));
          return minStability <= value;
        default:
          return false;
      }
    });
  }

  // Trigger an event
  triggerEvent(event) {
    this.lastEventTime = Date.now();
    this.gameStore.getState().triggerRandomEvent(event);
  }

  // Resolve an event choice
  resolveEvent(eventId, choiceId) {
    const event = randomEvents.find(e => e.id === eventId);
    if (!event) return;

    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) return;

    this.gameStore.getState().resolveEvent(eventId, choiceId);
  }

  // Check for after-game events
  checkAfterGameEvents(completedGame) {
    const events = randomEvents.filter(event => 
      event.trigger === 'after_game' && 
      (event.game === completedGame || !event.game)
    );

    events.forEach(event => {
      if (Math.random() < event.probability) {
        this.triggerEvent(event);
      }
    });
  }

  // Get available events for current game state
  getAvailableEvents() {
    const state = this.gameStore.getState();
    
    return randomEvents.filter(event => {
      // Filter by timeline if not cross-timeline
      if (event.timeline !== 'all' && event.timeline !== state.currentEra) {
        return false;
      }

      // Check threshold conditions
      if (event.trigger === 'threshold' && !this.checkThreshold(event, state)) {
        return false;
      }

      return true;
    });
  }
}

export default EventManager;

