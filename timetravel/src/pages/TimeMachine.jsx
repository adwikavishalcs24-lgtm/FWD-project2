import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopNavBar } from '../components/TopNavBar';
import { ParticleBackground } from '../components/Effects';
import { NeonButton } from '../components/UI';
import { useGameStore } from '../store/gameStore';
import { timeMachineUpgrades } from '../data/timeMachineData';

export const TimeMachine = () => {
  const { credits, addCredits, purchasedUpgrades, purchaseUpgrade } = useGameStore();
  const [selectedUpgrade, setSelectedUpgrade] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'ALL SYSTEMS', icon: '⚙️' },
    { id: 'core', name: 'CORE', icon: '🔷' },
    { id: 'energy', name: 'ENERGY', icon: '⚡' },
    { id: 'navigation', name: 'NAV', icon: '🧭' },
    { id: 'defense', name: 'DEFENSE', icon: '🛡️' },
    { id: 'travel', name: 'TRAVEL', icon: '🚀' },
    { id: 'godtier', name: 'GOD-TIER', icon: '👑' },
  ];

  const getUpgradeStatus = (upgrade) => {
    if (purchasedUpgrades?.includes(upgrade.id)) return 'purchased';
    const reqsMet = upgrade.requirements.every(req => purchasedUpgrades?.includes(req));
    if (!reqsMet) return 'locked';
    return 'unlocked';
  };

  const canPurchase = (upgrade) => {
    const status = getUpgradeStatus(upgrade);
    return status === 'unlocked' && credits >= upgrade.cost;
  };

  const handlePurchase = async (upgrade) => {
    if (canPurchase(upgrade)) {
      const success = await purchaseUpgrade(upgrade.id, upgrade.cost);
      if (success) {
        setSelectedUpgrade(null);
      }
    }
  };

  const filteredUpgrades = activeCategory === 'all'
    ? timeMachineUpgrades
    : timeMachineUpgrades.filter(u => u.category === activeCategory);

  const machineStats = {
    stability: 75 + (purchasedUpgrades?.length || 0) * 5,
    energy: 1000 + (purchasedUpgrades?.length || 0) * 100,
    accuracy: 60 + (purchasedUpgrades?.length || 0) * 3,
    cooldown: Math.max(10, 60 - (purchasedUpgrades?.length || 0) * 2),
    paradoxResist: 40 + (purchasedUpgrades?.length || 0) * 4,
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-dark via-darkAlt to-dark overflow-hidden">
      <ParticleBackground />

      {/* Animated background elements */}
      <motion.div
        className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, delay: 1 }}
      />

      <TopNavBar currentTab="timemachine" />

      <div className="relative z-10 px-4 md:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-title text-5xl md:text-6xl holographic mb-3">
            TIME MACHINE
          </h1>
          <p className="text-accent text-sm tracking-widest">TEMPORAL CIRCUIT UPGRADE MATRIX</p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-title text-sm transition-all ${activeCategory === cat.id
                  ? 'bg-accent text-dark neon-glow-accent'
                  : 'glass text-gray-400 hover:text-accent'
                }`}
            >
              {cat.icon} {cat.name}
            </motion.button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT PANEL - Upgrade Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="glass-strong p-6 rounded-lg neon-glow-accent">
              <h2 className="font-title text-accent text-xl mb-4 flex items-center gap-2">
                <span>📋</span> UPGRADE INFO
              </h2>

              <AnimatePresence mode="wait">
                {selectedUpgrade ? (
                  <motion.div
                    key={selectedUpgrade.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`text-6xl p-4 rounded-full ${getUpgradeStatus(selectedUpgrade) === 'purchased'
                            ? 'bg-success/20 neon-glow-success'
                            : getUpgradeStatus(selectedUpgrade) === 'unlocked'
                              ? 'bg-accent/20 neon-glow-accent'
                              : 'bg-gray-700/20'
                          }`}
                      >
                        {selectedUpgrade.icon}
                      </motion.div>
                    </div>

                    {/* Name & Category */}
                    <div className="text-center">
                      <h3 className="font-title text-2xl text-primary mb-1">
                        {selectedUpgrade.name}
                      </h3>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        {selectedUpgrade.category}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="glass p-4 rounded">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {selectedUpgrade.description}
                      </p>
                    </div>

                    {/* Effects */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Effects</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedUpgrade.effects).map(([key, value]) => (
                          value !== 0 && (
                            <div key={key} className="glass p-2 rounded text-center">
                              <p className="text-xs text-gray-400 capitalize">{key}</p>
                              <p className="text-success font-bold">
                                {value > 0 ? '+' : ''}{value}
                                {key.includes('Reduction') || key.includes('Resist') ? '%' : ''}
                              </p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="glass p-4 rounded flex items-center justify-between">
                      <span className="text-gray-400">Cost</span>
                      <span className="text-secondary text-2xl font-bold">
                        {selectedUpgrade.cost}₵
                      </span>
                    </div>

                    {/* Requirements */}
                    {selectedUpgrade.requirements.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Requirements</p>
                        <div className="space-y-1">
                          {selectedUpgrade.requirements.map((reqId) => {
                            const reqUpgrade = timeMachineUpgrades.find(u => u.id === reqId);
                            const isMet = purchasedUpgrades?.includes(reqId);
                            return (
                              <div
                                key={reqId}
                                className={`text-xs p-2 rounded ${isMet ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                                  }`}
                              >
                                {isMet ? '✓' : '✗'} {reqUpgrade?.name || reqId}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Purchase Button */}
                    <NeonButton
                      variant={
                        getUpgradeStatus(selectedUpgrade) === 'purchased'
                          ? 'success'
                          : canPurchase(selectedUpgrade)
                            ? 'accent'
                            : 'outline'
                      }
                      size="lg"
                      onClick={() => handlePurchase(selectedUpgrade)}
                      disabled={!canPurchase(selectedUpgrade)}
                      className="w-full"
                    >
                      {getUpgradeStatus(selectedUpgrade) === 'purchased'
                        ? '✓ INSTALLED'
                        : getUpgradeStatus(selectedUpgrade) === 'locked'
                          ? '🔒 LOCKED'
                          : credits >= selectedUpgrade.cost
                            ? '⚡ INSTALL'
                            : '💰 INSUFFICIENT CREDITS'}
                    </NeonButton>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4 opacity-30">⚙️</div>
                    <p className="text-gray-500">Select an upgrade node to view details</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* CENTER - Time Machine Visual & Upgrade Tree */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Central Time Machine */}
            <div className="glass-strong p-8 rounded-lg neon-glow relative overflow-hidden">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 opacity-10"
                style={{
                  background: 'conic-gradient(from 0deg, #9C27B0, #00E5FF, #FFC107, #9C27B0)',
                }}
              />

              <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotateY: [0, 360],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="text-9xl mb-4"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  ⏰
                </motion.div>

                <h3 className="font-title text-3xl holographic mb-2">CHRONOS MK-VII</h3>
                <p className="text-xs text-gray-400 tracking-widest">TEMPORAL DISPLACEMENT ENGINE</p>

                <div className="mt-6 grid grid-cols-3 gap-3 w-full">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="glass p-2 rounded text-center"
                  >
                    <p className="text-xs text-gray-400">POWER</p>
                    <p className="text-accent font-bold">{machineStats.energy}</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="glass p-2 rounded text-center"
                  >
                    <p className="text-xs text-gray-400">STABLE</p>
                    <p className="text-success font-bold">{machineStats.stability}%</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="glass p-2 rounded text-center"
                  >
                    <p className="text-xs text-gray-400">ACCURACY</p>
                    <p className="text-primary font-bold">{machineStats.accuracy}%</p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Upgrade Grid */}
            <div className="glass-strong p-6 rounded-lg neon-glow-accent max-h-[500px] overflow-y-auto">
              <h3 className="font-title text-accent text-lg mb-4">UPGRADE NODES</h3>
              <div className="grid grid-cols-3 gap-3">
                {filteredUpgrades.map((upgrade, idx) => {
                  const status = getUpgradeStatus(upgrade);
                  return (
                    <motion.button
                      key={upgrade.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onHoverStart={() => setHoveredNode(upgrade.id)}
                      onHoverEnd={() => setHoveredNode(null)}
                      onClick={() => setSelectedUpgrade(upgrade)}
                      className={`relative p-4 rounded-lg transition-all ${status === 'purchased'
                          ? 'bg-success/20 neon-glow-success border-2 border-success'
                          : status === 'unlocked'
                            ? 'bg-accent/20 neon-glow-accent border-2 border-accent'
                            : 'bg-gray-800/30 border-2 border-gray-700'
                        } ${selectedUpgrade?.id === upgrade.id ? 'ring-4 ring-secondary' : ''}`}
                    >
                      {/* Glitch effect for locked */}
                      {status === 'locked' && (
                        <motion.div
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent"
                        />
                      )}

                      {/* Pulse for unlocked */}
                      {status === 'unlocked' && hoveredNode === upgrade.id && (
                        <motion.div
                          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute inset-0 bg-accent rounded-lg"
                        />
                      )}

                      <div className="relative z-10 text-center">
                        <div className="text-3xl mb-1">{upgrade.icon}</div>
                        <p className="text-xs font-title text-gray-300">{upgrade.name.split(' ')[0]}</p>
                        {status === 'purchased' && (
                          <div className="absolute -top-1 -right-1 text-success text-xs">✓</div>
                        )}
                        {status === 'locked' && (
                          <div className="absolute -top-1 -right-1 text-gray-500 text-xs">🔒</div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* RIGHT PANEL - Machine Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="glass-strong p-6 rounded-lg neon-glow">
              <h2 className="font-title text-primary text-xl mb-4 flex items-center gap-2">
                <span>📊</span> MACHINE STATS
              </h2>

              <div className="space-y-4">
                {/* Stability */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Temporal Stability</span>
                    <span className="text-success font-bold">{machineStats.stability}%</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${machineStats.stability}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-success to-accent neon-glow-success"
                    />
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Energy Capacity</span>
                    <span className="text-accent font-bold">{machineStats.energy}</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (machineStats.energy / 2000) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-full bg-gradient-to-r from-accent to-primary neon-glow-accent"
                    />
                  </div>
                </div>

                {/* Accuracy */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Jump Accuracy</span>
                    <span className="text-primary font-bold">{machineStats.accuracy}%</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${machineStats.accuracy}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full bg-gradient-to-r from-primary to-secondary neon-glow"
                    />
                  </div>
                </div>

                {/* Cooldown */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Travel Cooldown</span>
                    <span className="text-secondary font-bold">{machineStats.cooldown}s</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${100 - (machineStats.cooldown / 60) * 100}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-secondary to-danger"
                    />
                  </div>
                </div>

                {/* Paradox Resistance */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Paradox Resistance</span>
                    <span className="text-success font-bold">{machineStats.paradoxResist}%</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${machineStats.paradoxResist}%` }}
                      transition={{ duration: 1, delay: 0.9 }}
                      className="h-full bg-gradient-to-r from-success to-accent neon-glow-success"
                    />
                  </div>
                </div>
              </div>

              {/* Circular Stability Ring */}
              <div className="mt-6 flex justify-center">
                <div className="relative">
                  <svg width="150" height="150" className="transform -rotate-90">
                    <defs>
                      <linearGradient id="ringGradient" x1="0%" y1="0%">
                        <stop offset="0%" stopColor="#00FF99" />
                        <stop offset="50%" stopColor="#00E5FF" />
                        <stop offset="100%" stopColor="#9C27B0" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="75"
                      cy="75"
                      r="60"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="75"
                      cy="75"
                      r="60"
                      fill="none"
                      stroke="url(#ringGradient)"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 60}
                      initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                      animate={{
                        strokeDashoffset: 2 * Math.PI * 60 * (1 - machineStats.stability / 100),
                      }}
                      transition={{ duration: 2, delay: 1 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-accent">{machineStats.stability}%</p>
                    <p className="text-xs text-gray-400">STABLE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Credits Display */}
            <div className="glass-strong p-6 rounded-lg neon-glow-accent">
              <h3 className="font-title text-accent text-lg mb-3">AVAILABLE CREDITS</h3>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl">💰</span>
                <span className="text-4xl font-bold text-secondary">{credits}₵</span>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                {purchasedUpgrades?.length || 0} / {timeMachineUpgrades.length} upgrades installed
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
