import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '../components/TopNavBar';
import { Portal, ParticleBackground, TimelineRipple } from '../components/Effects';
import { NeonButton, StabilityRing, EraCard, EventModal, HUDStat, UpgradeCard } from '../components/UI';
import { useGameStore } from '../store/gameStore';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    username,
    credits,
    energy,
    maxEnergy,
    stability,
    eventActive,
    currentEvent,
    closeEvent,
    addCredits,
    showEvent,
    refreshGameState,
  } = useGameStore();

  const [activeNewsIndex, setActiveNewsIndex] = useState(0);

  // Refresh game state when dashboard mounts
  useEffect(() => {
    const refresh = async () => {
      await refreshGameState();
    };
    refresh();
  }, []);

  const newsItems = [
    { icon: '⚠️', title: 'Temporal Anomaly Detected', desc: '1890s timeline showing instability' },
    { icon: '🤖', title: 'AI Unrest Escalating', desc: 'Future: AI conflicts spreading' },
    { icon: '⚡', title: 'Power Grid Critical', desc: 'Energy reserves at 45%' },
    { icon: '🌍', title: 'Historical Distortion', desc: 'WWI timeline branch diverging' },
  ];

  const upgrades = [
    {
      id: 1,
      title: 'Temporal Shield',
      description: 'Increases stability resistance',
      cost: 1000,
      effect: '+15% Stability',
    },
    {
      id: 2,
      title: 'Chrono Accelerator',
      description: 'Speed up era transitions',
      cost: 1500,
      effect: '+25% Speed',
    },
    {
      id: 3,
      title: 'Energy Amplifier',
      description: 'Boost energy regeneration',
      cost: 2000,
      effect: '+50 Energy/min',
    },
  ];

  useEffect(() => {
    const newsInterval = setInterval(() => {
      setActiveNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(newsInterval);
  }, [newsItems.length]);

  const handleEraClick = (era) => {
    navigate(`/${era}`);
  };

  const handleRandomEvent = () => {
    const events = [
      {
        title: 'Paradox Detected!',
        description: 'A temporal paradox has emerged in the present timeline.',
        effect: 'Stability: -10%',
        type: 'negative',
      },
      {
        title: 'Timeline Secured!',
        description: 'Successfully restored a historical event to stability.',
        effect: 'Credits: +500 gained',
        type: 'positive',
      },
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    showEvent(randomEvent);
  };

  const handleUpgrade = async (upgradeId) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (credits >= upgrade.cost) {
      const { executeBuildAction, refreshGameState } = useGameStore.getState();
      const action = {
        title: upgrade.title,
        cost: upgrade.cost,
        effect: upgrade.effect
      };

      const success = await executeBuildAction(action);
      if (success) {
        await refreshGameState();
        handleRandomEvent();
      }
    } else {
      alert("Not enough credits!");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-dark via-darkAlt to-dark overflow-hidden">
      <ParticleBackground />

      {/* Background decorative elements */}
      <motion.div
        className="fixed top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <TopNavBar currentTab="dashboard" />

      <EventModal
        event={currentEvent}
        isOpen={eventActive}
        onContinue={closeEvent}
      />

      {/* Main Content */}
      <div className="relative z-10 px-4 md:px-8 py-8">
        {/* Hero Section - Portal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center mb-12 gap-6"
        >
          <div>
            <Portal onClick={() => handleRandomEvent()} />
          </div>

          {/* Timeline Stability Indicator */}
          <div className="flex items-center gap-8">
            <div>
              <StabilityRing stability={stability} />
            </div>
            <div className="glass p-6 rounded-lg max-w-xs">
              <h3 className="font-title text-accent text-lg mb-3">Timeline Status</h3>
              <TimelineRipple active={true} />
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                Current timeline stability at critical levels. Temporal fluctuations detected across multiple eras.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT PANEL - Era Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="font-title text-accent text-2xl">Era Summary</h2>

            <EraCard
              era="past"
              title="THE PAST"
              description="Restore historical events. Gather artifacts and influence."
              icon="🕰️"
              onClick={() => handleEraClick('past')}
            />

            <EraCard
              era="present"
              title="THE PRESENT"
              description="Manage current timeline. Balance resources and technology."
              icon="🌍"
              onClick={() => handleEraClick('present')}
            />

            <EraCard
              era="future"
              title="THE FUTURE"
              description="Shape tomorrow. Control innovations and evolution."
              icon="🚀"
              onClick={() => handleEraClick('future')}
            />
          </motion.div>

          {/* CENTRAL - News Feed & Portal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="font-title text-accent text-2xl">News Feed</h2>

            <div className="glass-strong p-6 rounded-lg space-y-4 max-h-96 overflow-y-auto neon-glow-accent">
              {newsItems.map((news, idx) => (
                <motion.div
                  key={idx}
                  animate={{ opacity: activeNewsIndex === idx ? 1 : 0.5 }}
                  transition={{ duration: 0.5 }}
                  className={`p-3 rounded border-l-4 ${activeNewsIndex === idx
                      ? 'border-accent bg-accent/10'
                      : 'border-primary/30 bg-primary/5'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{news.icon}</span>
                    <div>
                      <h4 className="font-title text-primary text-sm">{news.title}</h4>
                      <p className="text-xs text-gray-400">{news.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2 justify-center">
              {newsItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveNewsIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${activeNewsIndex === idx ? 'bg-accent w-6' : 'bg-gray-600'
                    }`}
                />
              ))}
            </div>
          </motion.div>

          {/* RIGHT PANEL - Upgrades */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="font-title text-accent text-2xl">Shop</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {upgrades.map((upgrade) => (
                <UpgradeCard
                  key={upgrade.id}
                  title={upgrade.title}
                  description={upgrade.description}
                  cost={upgrade.cost}
                  effect={upgrade.effect}
                  onPurchase={() => handleUpgrade(upgrade.id)}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* BOTTOM PANEL - Resources & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong p-6 rounded-lg neon-glow-accent"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <HUDStat label="Credits" value={credits} icon="💰" color="secondary" />
            <HUDStat label="Energy" value={`${energy}/${maxEnergy}`} icon="⚡" color="accent" />
            <HUDStat label="Stability" value={`${stability}%`} icon="🛡️" color="success" />
            <HUDStat label="Agent" value={username} icon="🕵️" color="primary" />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <NeonButton
              variant="accent"
              size="lg"
              onClick={() => navigate('/missions')}
            >
              📋 MISSIONS
            </NeonButton>
            <NeonButton
              variant="primary"
              size="lg"
              onClick={() => addCredits(1000)}
            >
              💾 SAVE PROGRESS
            </NeonButton>
            <NeonButton
              variant="secondary"
              size="lg"
              onClick={() => handleRandomEvent()}
            >
              🔄 SYNC TIMELINE
            </NeonButton>
            <NeonButton
              variant="outline"
              size="lg"
              onClick={() => navigate('/leaderboard')}
            >
              🏆 LEADERBOARD
            </NeonButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
