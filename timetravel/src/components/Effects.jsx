import React from 'react';
import { motion } from 'framer-motion';

export const Portal = ({ onClick, style = {} }) => {
  return (
    <motion.div
      onClick={onClick}
      className="relative w-64 h-64 cursor-pointer"
      style={style}
      whileHover={{ scale: 1.1 }}
    >
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #9C27B0, #00E5FF, #FFC107, #9C27B0)',
          boxShadow: '0 0 40px rgba(156, 39, 176, 0.8), 0 0 80px rgba(0, 229, 255, 0.6)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Middle glow ring */}
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4), rgba(0, 229, 255, 0.4))',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(0, 229, 255, 0.3)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner portal effect */}
      <motion.div
        className="absolute inset-8 rounded-full overflow-hidden"
        style={{
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.2), rgba(156, 39, 176, 0.1))',
          boxShadow: 'inset 0 0 30px rgba(0, 229, 255, 0.3)',
        }}
      >
        {/* Particle effect inside portal */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full"
            animate={{
              x: Math.cos((i / 6) * Math.PI * 2) * 40,
              y: Math.sin((i / 6) * Math.PI * 2) * 40,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: (i / 6) * 3,
            }}
            style={{
              left: '50%',
              top: '50%',
              marginLeft: '-4px',
              marginTop: '-4px',
            }}
          />
        ))}
      </motion.div>

      {/* Center glow */}
      <motion.div
        className="absolute inset-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.5), transparent)',
          filter: 'blur(2px)',
        }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-accent"
        animate={{ scale: [1, 1.3], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ boxShadow: '0 0 20px rgba(0, 229, 255, 0.5)' }}
      />
    </motion.div>
  );
};

export const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -window.innerHeight],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export const GlitchEffect = ({ children, active = false }) => {
  return (
    <motion.div
      animate={active ? { x: [0, -2, 2, -2, 0] } : {}}
      transition={{ duration: 0.2, repeat: active ? Infinity : 0 }}
      className={active ? 'text-danger' : ''}
    >
      {children}
    </motion.div>
  );
};

export const TimelineRipple = ({ active = true }) => {
  return (
    <div className="relative w-full h-2 overflow-hidden rounded-full bg-dark/50 border border-accent/20">
      <motion.div
        className="absolute h-full bg-gradient-to-r from-transparent via-accent to-transparent"
        initial={{ x: '-100%' }}
        animate={active ? { x: '100%' } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: '30%' }}
      />
    </div>
  );
};

export const HolographicText = ({ children, className = '' }) => {
  return (
    <motion.span
      className={`holographic ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
};
