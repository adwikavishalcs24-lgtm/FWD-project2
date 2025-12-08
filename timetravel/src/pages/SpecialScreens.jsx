import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NeonButton } from '../components/UI';
import { GlitchEffect } from '../components/Effects';
import { useGameStore } from '../store/gameStore';

export const CollapseScreen = () => {
  const navigate = useNavigate();
  const { resetGame } = useGameStore();

  useEffect(() => {
    const timer = setTimeout(() => {}, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-dark to-danger/20 flex items-center justify-center">
      {/* Animated background glitch */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, #0A0A12 0%, #101025 100%)',
            'linear-gradient(135deg, #0A0A12 0%, #FF3B3B22 100%)',
            'linear-gradient(135deg, #0A0A12 0%, #101025 100%)',
          ],
        }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />

      {/* Shake effect */}
      <motion.div
        animate={{ x: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.4, repeat: Infinity }}
        className="relative z-10 text-center px-6"
      >
        {/* Glitch text */}
        <motion.div
          animate={{
            textShadow: [
              '0 0 20px rgba(255, 59, 59, 0.5)',
              '0 0 40px rgba(255, 59, 59, 1)',
              '0 0 20px rgba(255, 59, 59, 0.5)',
            ],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-8xl font-title font-bold text-danger mb-8 drop-shadow-lg"
        >
          ⚠️
        </motion.div>

        <GlitchEffect active={true}>
          <h1 className="text-6xl font-title font-bold text-danger mb-4">
            TIMELINE COLLAPSE
          </h1>
        </GlitchEffect>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl text-gray-300 mb-8 max-w-xl mx-auto"
        >
          The temporal fabric has fractured beyond recovery.
        </motion.p>

        <motion.p
          className="text-lg text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          Your attempts to restore balance have failed. The timeline collapses into chaos.
        </motion.p>

        {/* Restart Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <NeonButton
            variant="danger"
            size="xl"
            onClick={() => {
              resetGame();
              navigate('/intro');
            }}
            className="font-bold uppercase tracking-widest"
          >
            🔄 RESTART TIMELINE
          </NeonButton>
        </motion.div>

        {/* Glitch artifacts */}
        <motion.div
          className="mt-12 space-y-2 text-danger/50 font-title text-sm"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <p>ERROR: TEMPORAL_PARADOX_UNRESOLVED</p>
          <p>STATUS: TIMELINE_INTEGRITY_CRITICAL</p>
          <p>SYSTEM: CASCADING_FAILURE</p>
        </motion.div>
      </motion.div>

      {/* Shattered glass effect overlays */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border-2 border-danger/30"
          style={{
            width: Math.random() * 200 + 100,
            height: Math.random() * 200 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            rotate: 360,
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

export const EndingScreen = () => {
  const navigate = useNavigate();
  const { resetGame } = useGameStore();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-dark via-darkAlt to-primary/10 flex items-center justify-center">
      {/* Holographic background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle, rgba(156, 39, 176, 0.1), transparent)',
            'radial-gradient(circle, rgba(0, 229, 255, 0.1), transparent)',
            'radial-gradient(circle, rgba(156, 39, 176, 0.1), transparent)',
          ],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Particles around text */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full"
            animate={{
              x: Math.cos((i / 20) * Math.PI * 2) * 200,
              y: Math.sin((i / 20) * Math.PI * 2) * 200,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: (i / 20) * 3,
            }}
            style={{
              left: '50%',
              top: '50%',
              marginLeft: '-2px',
              marginTop: '-2px',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-6 max-w-2xl"
      >
        {/* Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-8xl mb-8"
        >
          👑
        </motion.div>

        {/* Main text with distortion effect */}
        <motion.h1
          className="font-title text-7xl font-bold mb-4 leading-tight"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            y: [0, -10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            background: 'linear-gradient(45deg, #9C27B0, #00E5FF, #FFC107)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(156, 39, 176, 0.5))',
          }}
        >
          YOU ARE THE
        </motion.h1>

        <motion.h2
          className="font-title text-8xl font-bold text-accent drop-shadow-lg mb-8"
          animate={{
            scale: [1, 1.05, 1],
            textShadow: [
              '0 0 20px rgba(0, 229, 255, 0.5)',
              '0 0 40px rgba(0, 229, 255, 1)',
              '0 0 20px rgba(0, 229, 255, 0.5)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          CHRONARCH
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl text-gray-300 mb-4 max-w-xl mx-auto leading-relaxed"
        >
          You have mastered the flow of time itself and restored balance to all timelines.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-lg text-primary mb-12 max-w-xl mx-auto"
        >
          The past is secure. The present thrives. The future awaits your will.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-3 gap-4 mb-12 max-w-sm mx-auto"
        >
          <div className="glass p-4 rounded-lg neon-glow text-center">
            <p className="text-accent text-2xl font-bold">∞</p>
            <p className="text-xs text-gray-400">TIMELINES SAVED</p>
          </div>
          <div className="glass p-4 rounded-lg neon-glow-accent text-center">
            <p className="text-secondary text-2xl font-bold">100%</p>
            <p className="text-xs text-gray-400">TIMELINE STABILITY</p>
          </div>
          <div className="glass p-4 rounded-lg neon-glow-success text-center">
            <p className="text-success text-2xl font-bold">👑</p>
            <p className="text-xs text-gray-400">RANK: CHRONARCH</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <NeonButton
            variant="accent"
            size="lg"
            onClick={() => {
              resetGame();
              navigate('/intro');
            }}
            className="font-bold uppercase"
          >
            ⏮️ RESTART UNIVERSE
          </NeonButton>
          <NeonButton
            variant="outline"
            size="lg"
            onClick={() => navigate('/leaderboard')}
            className="font-bold uppercase"
          >
            🏆 VIEW RANKINGS
          </NeonButton>
        </motion.div>

        {/* Cosmic animation */}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mt-12 text-accent/30 font-title text-sm"
        >
          ✦ THE TIMELINE IS YOURS TO COMMAND ✦
        </motion.div>
      </motion.div>

      {/* Animated rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border-2 border-accent/20 rounded-full"
          style={{
            width: (i + 1) * 200,
            height: (i + 1) * 200,
            left: '50%',
            top: '50%',
            marginLeft: -((i + 1) * 100),
            marginTop: -((i + 1) * 100),
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: (i + 1) * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};
