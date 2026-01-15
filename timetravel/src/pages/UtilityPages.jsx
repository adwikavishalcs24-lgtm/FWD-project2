import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '../components/TopNavBar';
import { ParticleBackground } from '../components/Effects';
import { NeonButton, HUDStat, UpgradeCard } from '../components/UI';
import { useGameStore } from '../store/gameStore';

export const MissionsPage = () => {
  const navigate = useNavigate();
  const { completedMissions, completeMission } = useGameStore();
  const [selectedMission, setSelectedMission] = useState(null);

  const allMissions = [
    {
      id: 1,
      title: 'Timeline Restoration',
      description: 'Restore stability to the 1890s era',
      reward: 1000,
      difficulty: 'Medium',
      requirements: 'Influence: 50',
      era: 'past',
      gameId: 'clockmaker'
    },
    {
      id: 2,
      title: 'Artifact Hunt',
      description: 'Collect 5 artifacts from historical periods',
      reward: 1500,
      difficulty: 'Hard',
      requirements: 'Energy: 200',
      era: 'past',
      gameId: 'blacksmith'
    },
    {
      id: 3,
      title: 'Paradox Resolution',
      description: 'Fix a critical temporal paradox',
      reward: 2000,
      difficulty: 'Extreme',
      requirements: 'Stability: 75%',
      era: 'future',
      gameId: 'rift'
    },
    {
      id: 4,
      title: 'Tech Integration',
      description: 'Deploy future technology in the present',
      reward: 800,
      difficulty: 'Easy',
      requirements: 'Technology: 100',
      era: 'present',
      gameId: 'traffic'
    },
    {
      id: 5,
      title: 'Leaderboard Rush',
      description: 'Reach top 10 in leaderboard rankings',
      reward: 3000,
      difficulty: 'Extreme',
      requirements: 'Score: 50000',
      era: 'future',
      gameId: 'defense'
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-dark via-darkAlt to-dark">
      <ParticleBackground />

      <TopNavBar currentTab="missions" />

      {/* Main Content */}
      <div className="relative z-10 px-4 md:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-title text-5xl text-accent mb-4">📋 MISSIONS</h1>
          <p className="text-gray-300">Complete missions to earn credits and gain influence across the timeline</p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Mission List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-3"
          >
            {allMissions.map((mission) => (
              <motion.button
                key={mission.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedMission(mission)}
                className={`glass p-4 rounded-lg text-left w-full border-l-4 transition-all ${selectedMission?.id === mission.id
                  ? 'border-accent bg-accent/10 neon-glow-accent'
                  : 'border-primary/30'
                  }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-title text-accent text-lg">{mission.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{mission.description}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${mission.difficulty === 'Easy'
                    ? 'bg-success/20 text-success'
                    : mission.difficulty === 'Medium'
                      ? 'bg-secondary/20 text-secondary'
                      : mission.difficulty === 'Hard'
                        ? 'bg-danger/20 text-danger'
                        : 'bg-primary/20 text-primary'
                    }`}>
                    {mission.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-secondary text-sm font-bold">+{mission.reward}₵</span>
                  {completedMissions.includes(mission.id) && (
                    <span className="text-success text-xs">✓ COMPLETED</span>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Mission Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {selectedMission && (
              <div className="glass-strong p-6 rounded-lg neon-glow-accent h-fit sticky top-24">
                <h2 className="font-title text-accent text-2xl mb-4">{selectedMission.title}</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Description</p>
                    <p className="text-gray-300 text-sm">{selectedMission.description}</p>
                  </div>

                  <div className="border-t border-accent/20 pt-4">
                    <p className="text-xs text-gray-400 uppercase">Requirements</p>
                    <p className="text-primary text-sm">{selectedMission.requirements}</p>
                  </div>

                  <div className="border-t border-accent/20 pt-4">
                    <p className="text-xs text-gray-400 uppercase">Difficulty</p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(selectedMission.difficulty === 'Easy' ? 1 : selectedMission.difficulty === 'Medium' ? 2 : selectedMission.difficulty === 'Hard' ? 3 : 5)].map((_, i) => (
                        <div key={i} className="flex-1 h-1 bg-primary rounded-full" />
                      ))}
                    </div>
                  </div>

                  <div className="bg-secondary/20 border border-secondary/50 p-3 rounded">
                    <p className="text-secondary font-bold text-lg">+{selectedMission.reward}₵</p>
                    <p className="text-xs text-gray-400">Mission Reward</p>
                  </div>
                </div>

                <NeonButton
                  variant={completedMissions.includes(selectedMission.id) ? 'outline' : 'accent'}
                  size="lg"
                  className="w-full"
                  disabled={completedMissions.includes(selectedMission.id)}
                  onClick={() => {
                    if (!completedMissions.includes(selectedMission.id) && selectedMission.era) {
                      navigate(`/${selectedMission.era}`, {
                        state: {
                          showGames: true,
                          autoStartGameId: selectedMission.gameId
                        }
                      });
                    }
                  }}
                >
                  {completedMissions.includes(selectedMission.id) ? 'COMPLETED' : 'ACCEPT MISSION'}
                </NeonButton>
              </div>
            )}

            {!selectedMission && (
              <div className="glass-strong p-6 rounded-lg neon-glow-accent h-fit flex items-center justify-center">
                <p className="text-gray-400 text-center">Select a mission to view details</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Back Button */}
        <NeonButton
          variant="outline"
          size="lg"
          onClick={() => navigate('/present', { state: { showGames: true } })}
        >
          🎮 PLAY MINI GAMES
        </NeonButton>
      </div>
    </div>
  );
};

export const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { username, score } = useGameStore();

  const leaderboard = [
    { rank: 1, name: 'Chronarch Prime', score: 125000, era: 'All' },
    { rank: 2, name: 'Timeline Master', score: 98500, era: 'Future' },
    { rank: 3, name: 'Temporal Agent', score: 87200, era: 'Present' },
    { rank: 4, name: 'History Keeper', score: 76500, era: 'Past' },
    { rank: 5, name: username, score: score || 12500, era: 'Present' },
    { rank: 6, name: 'Paradox Solver', score: 45000, era: 'All' },
    { rank: 7, name: 'Era Explorer', score: 32000, era: 'Past' },
    { rank: 8, name: 'Innovation Hub', score: 28500, era: 'Future' },
    { rank: 9, name: 'Stability Expert', score: 22000, era: 'Present' },
    { rank: 10, name: 'Time Traveler', score: 18500, era: 'All' },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-dark via-darkAlt to-dark">
      <ParticleBackground />

      <TopNavBar currentTab="leaderboard" />

      {/* Main Content */}
      <div className="relative z-10 px-4 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-title text-5xl text-accent mb-2">🏆 LEADERBOARD</h1>
          <p className="text-gray-300">Top temporal agents ranked by timeline stability score</p>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-lg overflow-hidden neon-glow-accent mb-8"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent/20">
                <th className="px-6 py-4 text-left font-title text-primary">#</th>
                <th className="px-6 py-4 text-left font-title text-primary">Agent Name</th>
                <th className="px-6 py-4 text-left font-title text-primary">Score</th>
                <th className="px-6 py-4 text-left font-title text-primary">Specialization</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <motion.tr
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`border-b border-accent/10 transition-all ${entry.name === username ? 'bg-accent/10' : 'hover:bg-accent/5'
                    }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 ? (
                        <span className="text-2xl">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="font-title text-primary font-bold text-lg">{entry.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-title text-lg ${entry.name === username ? 'text-accent' : 'text-gray-200'}`}>
                      {entry.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-secondary font-bold text-lg">{entry.score.toLocaleString()}₵</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 text-sm">{entry.era}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Your Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-lg mb-8 border-l-4 border-accent"
        >
          <h2 className="font-title text-primary text-2xl mb-4">YOUR RANKING</h2>
          <div className="grid grid-cols-3 gap-4">
            <HUDStat label="Rank" value="#5" icon="🎖️" />
            <HUDStat label="Score" value={`${(score || 12500).toLocaleString()}₵`} icon="📊" color="secondary" />
            <HUDStat label="Next Rank In" value="8500₵" icon="🔜" color="success" />
          </div>
        </motion.div>

        {/* Back Button */}
        <NeonButton
          variant="outline"
          size="lg"
          onClick={() => navigate('/dashboard')}
        >
          🏠 RETURN TO DASHBOARD
        </NeonButton>
      </div>
    </div>
  );
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { username, setUsername, resetGame } = useGameStore();
  const [inputUsername, setInputUsername] = useState(username);

  const handleResetGame = () => {
    if (window.confirm('Are you sure? This will reset all progress!')) {
      resetGame();
      navigate('/intro');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-dark via-darkAlt to-dark">
      <ParticleBackground />

      <TopNavBar currentTab="settings" />

      {/* Main Content */}
      <div className="relative z-10 px-4 md:px-8 py-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-title text-5xl text-accent mb-2">⚙️ SETTINGS</h1>
          <p className="text-gray-300">Configure your temporal agent experience</p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-strong p-6 rounded-lg neon-glow"
          >
            <h2 className="font-title text-primary text-2xl mb-4">👤 Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 uppercase tracking-wider mb-2">Agent Name</label>
                <input
                  type="text"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  className="w-full glass px-4 py-3 rounded-lg border border-accent/20 focus:border-accent/50 outline-none transition-all text-white"
                />
              </div>
              <NeonButton
                variant="accent"
                size="lg"
                className="w-full"
                onClick={() => setUsername(inputUsername)}
              >
                SAVE PROFILE
              </NeonButton>
            </div>
          </motion.div>

          {/* Audio & Visuals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong p-6 rounded-lg neon-glow-accent"
          >
            <h2 className="font-title text-primary text-2xl mb-4">🎨 Display</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-300">Enable Particle Effects</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-300">Enable Neon Glow</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-300">Enable Animations</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Game */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong p-6 rounded-lg neon-glow-danger"
          >
            <h2 className="font-title text-danger text-2xl mb-4">🎮 Game</h2>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">Resetting the game will erase all progress. This action cannot be undone.</p>
              <NeonButton
                variant="danger"
                size="lg"
                className="w-full"
                onClick={handleResetGame}
              >
                🔄 RESET ALL PROGRESS
              </NeonButton>
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-lg border border-accent/20"
          >
            <h2 className="font-title text-primary text-2xl mb-4">ℹ️ About</h2>
            <div className="space-y-2 text-gray-300 text-sm">
              <p><strong>ChronoCorp Time Travel Tycoon</strong></p>
              <p>Version: 1.0.0</p>
              <p>Engine: React + Framer Motion</p>
              <p className="mt-4 text-gray-400">Fix the past. Protect the present. Rewrite the future.</p>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <NeonButton
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate('/dashboard')}
          >
            🏠 RETURN TO DASHBOARD
          </NeonButton>
        </motion.div>
      </div>
    </div>
  );
};
