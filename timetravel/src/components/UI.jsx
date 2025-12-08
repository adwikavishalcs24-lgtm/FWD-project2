import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const NeonButton = ({ 
  children, 
  onClick, 
  to, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  ...props 
}) => {
  const navigate = useNavigate();
  
  const variants = {
    primary: 'bg-primary hover:bg-purple-600 neon-glow',
    accent: 'bg-accent hover:bg-cyan-400 neon-glow-accent text-dark',
    secondary: 'bg-secondary hover:bg-yellow-500 text-dark',
    danger: 'bg-danger hover:bg-red-500 neon-glow-danger',
    success: 'bg-success hover:bg-green-400 text-dark',
    outline: 'border-2 border-accent text-accent hover:bg-accent hover:text-dark neon-glow-accent',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
    xl: 'px-10 py-4 text-xl',
  };

  const handleClick = () => {
    if (to) navigate(to);
    if (onClick) onClick();
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={handleClick}
      disabled={disabled}
      className={`
        font-title font-bold rounded-lg transition-all duration-200
        ${sizes[size]}
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const HUDStat = ({ label, value, icon, color = 'accent' }) => {
  const colorClasses = {
    accent: 'text-accent',
    primary: 'text-primary',
    success: 'text-success',
    danger: 'text-danger',
  };

  return (
    <div className="glass px-4 py-3 rounded-lg flex items-center gap-3">
      {icon && <span className={`text-xl ${colorClasses[color]}`}>{icon}</span>}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold ${colorClasses[color]}`}>{value}</p>
      </div>
    </div>
  );
};

export const UpgradeCard = ({ 
  title, 
  description, 
  cost, 
  effect, 
  isPurchased = false,
  onPurchase,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={!isPurchased ? { scale: 1.02 } : {}}
      className={`glass p-4 rounded-lg neon-glow border border-primary/30 ${className}`}
    >
      <h3 className="font-title text-accent text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-300 mb-3">{description}</p>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs">
          <p className="text-gray-400">Effect</p>
          <p className="text-success">{effect}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">Cost</p>
          <p className="text-secondary text-lg font-bold">{cost}₵</p>
        </div>
      </div>
      <NeonButton
        variant={isPurchased ? 'outline' : 'accent'}
        size="sm"
        onClick={onPurchase}
        disabled={isPurchased}
        className="w-full"
      >
        {isPurchased ? 'PURCHASED' : 'ACQUIRE'}
      </NeonButton>
    </motion.div>
  );
};

export const MissionCard = ({ 
  title, 
  description, 
  reward, 
  isComplete = false,
  onAccept,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={!isComplete ? { scale: 1.02 } : {}}
      className={`glass p-4 rounded-lg border border-accent/30 ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-title text-primary text-base">{title}</h3>
        {isComplete && <span className="text-success text-xs font-bold">✓ COMPLETE</span>}
      </div>
      <p className="text-sm text-gray-300 mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-secondary text-sm">Reward: {reward}₵</span>
        {!isComplete && (
          <NeonButton
            variant="accent"
            size="sm"
            onClick={onAccept}
          >
            ACCEPT
          </NeonButton>
        )}
      </div>
    </motion.div>
  );
};

export const EraCard = ({ 
  era, 
  title, 
  description, 
  icon, 
  color = 'primary',
  onClick,
  className = '',
}) => {
  const colorMap = {
    past: 'from-amber-900 to-amber-700',
    present: 'from-blue-900 to-blue-700',
    future: 'from-purple-900 to-purple-700',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`glass p-6 rounded-lg text-left border border-${color}/30 overflow-hidden group relative ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[era]} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Era</p>
      <h3 className="font-title text-2xl text-accent mb-2">{title}</h3>
      <p className="text-sm text-gray-300 mb-4">{description}</p>
      <div className="text-2xl">{icon}</div>
    </motion.button>
  );
};

export const StabilityRing = ({ stability, maxStability = 100, size = 'lg' }) => {
  const percentage = (stability / maxStability) * 100;
  const radius = size === 'lg' ? 45 : 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 70) return 'url(#successGradient)';
    if (percentage >= 40) return 'url(#warningGradient)';
    return 'url(#dangerGradient)';
  };

  return (
    <div className={`flex flex-col items-center justify-center ${size === 'lg' ? 'gap-4' : 'gap-2'}`}>
      <svg width={size === 'lg' ? 120 : 80} height={size === 'lg' ? 120 : 80} className="transform -rotate-90">
        <defs>
          <linearGradient id="successGradient" x1="0%" y1="0%">
            <stop offset="0%" stopColor="#00FF99" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <linearGradient id="warningGradient" x1="0%" y1="0%">
            <stop offset="0%" stopColor="#FFC107" />
            <stop offset="100%" stopColor="#FF9800" />
          </linearGradient>
          <linearGradient id="dangerGradient" x1="0%" y1="0%">
            <stop offset="0%" stopColor="#FF3B3B" />
            <stop offset="100%" stopColor="#FF1744" />
          </linearGradient>
        </defs>
        <circle
          cx={size === 'lg' ? 60 : 40}
          cy={size === 'lg' ? 60 : 40}
          r={radius}
          fill="none"
          stroke="rgba(0, 229, 255, 0.1)"
          strokeWidth="3"
        />
        <circle
          cx={size === 'lg' ? 60 : 40}
          cy={size === 'lg' ? 60 : 40}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="text-center">
        <p className={size === 'lg' ? 'text-xl font-bold text-accent' : 'text-sm font-bold text-accent'}>
          {Math.round(percentage)}%
        </p>
        <p className={`text-xs text-gray-400 uppercase tracking-wider`}>Stability</p>
      </div>
    </div>
  );
};

export const EventModal = ({ event, onContinue, isOpen = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="glass-strong p-8 rounded-lg max-w-md neon-glow-accent"
      >
        <h2 className="font-title text-2xl text-accent mb-4">{event?.title}</h2>
        <p className="text-gray-300 mb-6">{event?.description}</p>
        <div className={`p-3 rounded mb-6 ${
          event?.type === 'positive' ? 'bg-success/20 border border-success/50' : 'bg-danger/20 border border-danger/50'
        }`}>
          <p className={event?.type === 'positive' ? 'text-success' : 'text-danger'}>
            {event?.effect}
          </p>
        </div>
        <NeonButton
          variant="accent"
          size="lg"
          onClick={onContinue}
          className="w-full"
        >
          CONTINUE
        </NeonButton>
      </motion.div>
    </motion.div>
  );
};
