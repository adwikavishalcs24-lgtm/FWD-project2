module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9C27B0',
        accent: '#00E5FF',
        secondary: '#FFC107',
        dark: '#0A0A12',
        darkAlt: '#101025',
        success: '#00FF99',
        danger: '#FF3B3B',
      },
      fontFamily: {
        title: ['Orbitron', 'Audiowide', 'sans-serif'],
        body: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(156, 39, 176, 0.6)',
        'glow-accent': '0 0 20px rgba(0, 229, 255, 0.6)',
        'glow-danger': '0 0 20px rgba(255, 59, 59, 0.6)',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(156, 39, 176, 0.6)' },
          '50%': { boxShadow: '0 0 40px rgba(156, 39, 176, 1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
        drift: 'drift 3s ease-in-out infinite',
        shake: 'shake 0.5s',
        bounce: 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
