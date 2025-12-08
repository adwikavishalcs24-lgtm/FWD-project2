import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { HUDStat } from './UI';

export const TopNavBar = ({ currentTab }) => {
  const { username, credits, energy, maxEnergy } = useGameStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { label: 'Dashboard', path: '/dashboard', id: 'dashboard' },
    { label: 'Upgrades', path: '/upgrades', id: 'upgrades' },
    { label: 'Missions', path: '/missions', id: 'missions' },
    { label: 'Leaderboard', path: '/leaderboard', id: 'leaderboard' },
    { label: 'Settings', path: '/settings', id: 'settings' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong backdrop-blur-xl border-b border-accent/20 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="text-2xl font-title font-bold text-accent drop-shadow-lg">
            ⏰ CHRONO<span className="text-primary">CORP</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-8">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={tab.path}
              className={`font-title text-sm uppercase tracking-wider transition-all duration-200 ${
                currentTab === tab.id
                  ? 'text-accent nav-active'
                  : 'text-gray-400 hover:text-accent'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Right side HUD */}
        <div className="flex items-center gap-3">
          <HUDStat label="Credits" value={credits} icon="💰" color="secondary" />
          <HUDStat label="Energy" value={`${energy}/${maxEnergy}`} icon="⚡" color="accent" />
          <div className="hidden lg:block glass px-4 py-3 rounded-lg">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Agent</p>
            <p className="text-sm font-bold text-primary">{username}</p>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-accent text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-accent/20 px-6 py-4 space-y-3"
        >
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={tab.path}
              className={`block font-title text-sm uppercase tracking-wider transition-all ${
                currentTab === tab.id ? 'text-accent' : 'text-gray-400 hover:text-accent'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
};
