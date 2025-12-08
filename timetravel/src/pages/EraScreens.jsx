import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '../components/TopNavBar';
import { ParticleBackground } from '../components/Effects';
import { NeonButton, HUDStat, MissionCard } from '../components/UI';
import { useGameStore } from '../store/gameStore';

const EraScreen = ({ era, title, icon, bgGradient, missions, buildActions }) => {
  const navigate = useNavigate();
  const { credits, energy } = useGameStore();
  const [selectedAction, setSelectedAction] = useState(null);

  return (
    <div className={`relative min-h-screen overflow-hidden ${bgGradient}`}>
      <ParticleBackground />

      <TopNavBar currentTab={era} />

      {/* Main Content */}
      <div className="relative z-10 px-4 md:px-8 py-8">
        {/* Era Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="text-6xl mb-4">{icon}</div>
          <h1 className="font-title text-5xl text-accent mb-2">{title}</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">{era === 'past' ? 'Travel back in time and restore historical stability' : era === 'present' ? 'Manage the current timeline and contemporary challenges' : 'Shape the future and control technological evolution'}</p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT: Build Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="font-title text-primary text-2xl">Build Actions</h2>
            <div className="space-y-3">
              {buildActions.map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAction(action)}
                  className={`glass p-4 rounded-lg text-left w-full border-l-4 transition-all ${
                    selectedAction?.id === action.id
                      ? 'border-accent bg-accent/10 neon-glow-accent'
                      : 'border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-title text-accent text-lg">{action.icon} {action.title}</h3>
                    <span className="text-secondary font-bold">{action.cost}₵</span>
                  </div>
                  <p className="text-xs text-gray-400">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* CENTER: Action Details & Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="font-title text-accent text-2xl">Resources & Status</h2>

            <div className="glass-strong p-6 rounded-lg neon-glow-accent space-y-4">
              {selectedAction && (
                <>
                  <div>
                    <h3 className="font-title text-primary text-xl mb-2">{selectedAction.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{selectedAction.description}</p>
                  </div>
                  <div className="p-3 bg-success/10 border border-success/30 rounded">
                    <p className="text-success text-sm font-bold">Effect: {selectedAction.effect}</p>
                  </div>
                  <NeonButton
                    variant="accent"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setSelectedAction(null);
                    }}
                  >
                    EXECUTE ACTION
                  </NeonButton>
                </>
              )}

              {!selectedAction && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Select an action to view details</p>
                </div>
              )}
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-2 gap-3">
              <HUDStat
                label={era === 'past' ? 'Artifacts' : era === 'present' ? 'Technology' : 'Innovations'}
                value={Math.floor(Math.random() * 100)}
                icon={era === 'past' ? '🏺' : era === 'present' ? '⚙️' : '🔬'}
              />
              <HUDStat
                label="Influence"
                value={Math.floor(Math.random() * 100)}
                icon="💫"
              />
            </div>
          </motion.div>

          {/* RIGHT: Missions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="font-title text-primary text-2xl">Active Missions</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  title={mission.title}
                  description={mission.description}
                  reward={mission.reward}
                  onAccept={() => {}}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Return Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4 mb-8"
        >
          <NeonButton
            variant="outline"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            🏠 RETURN TO DASHBOARD
          </NeonButton>
          <NeonButton
            variant="primary"
            size="lg"
            onClick={() => navigate(`/${era === 'past' ? 'present' : era === 'present' ? 'future' : 'past'}`)}
          >
            ⏩ NEXT ERA
          </NeonButton>
        </motion.div>

        {/* Bottom Stats */}
        <div className="glass-strong p-6 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HUDStat label="Credits" value={credits} icon="💰" color="secondary" />
            <HUDStat label="Energy" value={energy} icon="⚡" color="accent" />
            <HUDStat label="Timeline Age" value={`${Math.floor(Math.random() * 100)}y`} icon="📅" />
            <HUDStat label="Anomalies" value={Math.floor(Math.random() * 10)} icon="⚠️" color="danger" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PastScreen = () => {
  const missions = [
    { id: 1, title: 'Save the Timeline', description: 'Restore 1890s stability', reward: 500 },
    { id: 2, title: 'Collect Artifacts', description: 'Gather 5 historical artifacts', reward: 750 },
    { id: 3, title: 'Fix Paradox', description: 'Resolve a major temporal paradox', reward: 1000 },
  ];

  const buildActions = [
    { id: 1, icon: '🏛️', title: 'Stabilize Monument', description: 'Restore a historical site', cost: 500, effect: '+100 Stability' },
    { id: 2, icon: '📖', title: 'Archive Knowledge', description: 'Preserve historical records', cost: 300, effect: '+50 Artifacts' },
    { id: 3, icon: '⚔️', title: 'Resolve Conflict', description: 'End a historical war', cost: 800, effect: '+200 Influence' },
  ];

  return (
    <EraScreen
      era="past"
      title="THE PAST"
      icon="🕰️"
      bgGradient="bg-gradient-to-br from-amber-950 via-dark to-dark"
      missions={missions}
      buildActions={buildActions}
    />
  );
};

export const PresentScreen = () => {
  const missions = [
    { id: 1, title: 'Balance Systems', description: 'Restore current timeline balance', reward: 600 },
    { id: 2, title: 'Deploy Technology', description: 'Install 3 advanced systems', reward: 800 },
    { id: 3, title: 'Handle Crisis', description: 'Resolve an urgent temporal event', reward: 1200 },
  ];

  const buildActions = [
    { id: 1, icon: '⚙️', title: 'Build Infrastructure', description: 'Construct a timeline hub', cost: 600, effect: '+150 Technology' },
    { id: 2, icon: '🔬', title: 'Research Tech', description: 'Advance current science', cost: 400, effect: '+100 Innovation' },
    { id: 3, icon: '🏢', title: 'Expand Network', description: 'Build communication network', cost: 700, effect: '+250 Influence' },
  ];

  return (
    <EraScreen
      era="present"
      title="THE PRESENT"
      icon="🌍"
      bgGradient="bg-gradient-to-br from-blue-950 via-dark to-dark"
      missions={missions}
      buildActions={buildActions}
    />
  );
};

export const FutureScreen = () => {
  const missions = [
    { id: 1, title: 'Design Future', description: 'Shape the timeline to 2150', reward: 700 },
    { id: 2, title: 'Unlock Innovations', description: 'Discover 4 future technologies', reward: 900 },
    { id: 3, title: 'Prevent Collapse', description: 'Stop a catastrophic event', reward: 1500 },
  ];

  const buildActions = [
    { id: 1, icon: '🚀', title: 'Launch Innovation', description: 'Introduce future technology', cost: 800, effect: '+200 Innovation' },
    { id: 2, icon: '🤖', title: 'AI Integration', description: 'Integrate artificial intelligence', cost: 1000, effect: '+300 Technology' },
    { id: 3, icon: '🌌', title: 'Expand Horizons', description: 'Open new timeline branches', cost: 1200, effect: '+500 Influence' },
  ];

  return (
    <EraScreen
      era="future"
      title="THE FUTURE"
      icon="🚀"
      bgGradient="bg-gradient-to-br from-purple-950 via-dark to-dark"
      missions={missions}
      buildActions={buildActions}
    />
  );
};
