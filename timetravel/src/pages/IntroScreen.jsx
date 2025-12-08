import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NeonButton } from '../components/UI';
import { ParticleBackground, HolographicText } from '../components/Effects';
import { useGameStore } from '../store/gameStore';

export const IntroScreen = () => {
  const navigate = useNavigate();
  const resetGame = useGameStore((state) => state.resetGame);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-dark via-darkAlt to-dark flex items-center justify-center">
      <ParticleBackground />

      {/* Animated background gradients */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-6 max-w-2xl"
      >
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-8 text-7xl font-title font-bold drop-shadow-lg"
        >
          <span className="text-accent">⏰</span> <span className="text-primary">CHRONO</span><span className="text-accent">CORP</span>
        </motion.div>

        {/* Tagline with glitch effect */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-4xl md:text-5xl font-title font-bold mb-6 leading-tight"
        >
          <HolographicText className="text-5xl md:text-6xl">
            FIX THE PAST
          </HolographicText>
          <div className="mt-2 text-accent">PROTECT THE PRESENT</div>
          <div className="mt-2 text-primary">REWRITE THE FUTURE</div>
        </motion.h1>

        {/* Story text fade in */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-lg text-gray-300 mb-12 max-w-xl mx-auto leading-relaxed"
        >
          The timeline is collapsing. Paradoxes are multiplying. As the newly appointed Temporal Agent,
          you must navigate the corridors of time itself to restore balance to reality.
        </motion.p>

        {/* Animated divider */}
        <motion.div
          className="h-1 w-24 mx-auto mb-12 bg-gradient-to-r from-transparent via-accent to-transparent"
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <NeonButton
            variant="accent"
            size="xl"
            onClick={() => navigate('/dashboard')}
            className="font-bold uppercase tracking-widest"
          >
            ⚡ ENTER CHRONOCORP
          </NeonButton>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mt-12 text-accent/50 text-sm font-title"
        >
          ▼ INITIALIZING TEMPORAL SYSTEMS ▼
        </motion.div>
      </motion.div>

      {/* Corner decorations */}
      <motion.div
        className="absolute top-10 right-10 text-4xl opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        ⚙️
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-10 text-4xl opacity-30"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        ⚙️
      </motion.div>
    </div>
  );
};
