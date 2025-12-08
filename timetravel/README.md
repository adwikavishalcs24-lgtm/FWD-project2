# ChronoCorp - Time Travel Tycoon

A futuristic time-travel game UI built with React, Framer Motion, and Tailwind CSS.

## 🚀 Features

### Visual Theme
- **Color Palette**: Deep Purple (#9C27B0), Electric Blue (#00E5FF), Amber Gold (#FFC107)
- **Effects**: Neon glow, glassmorphism, holographic text, animated gradients
- **Fonts**: Orbitron/Audiowide for titles, Poppins/Inter for body text

### Pages Implemented
- ⏰ **Intro Screen** - Cinematic introduction with story
- 🎮 **Dashboard** - Main hub with portal selector and upgrades
- 🕰️ **Past Era** - Historical timeline management
- 🌍 **Present Era** - Current timeline control
- 🚀 **Future Era** - Tomorrow's technology shaping
- 📋 **Missions** - Mission tracker and rewards
- 🏆 **Leaderboard** - Global rankings and scores
- ⚙️ **Settings** - Profile and game configuration
- 💥 **Collapse Screen** - Game over scenario
- 👑 **Ending Screen** - Victory/Chronarch achievement

### Components
- **NeonButton** - Glowing animated buttons with variants
- **Portal** - Interactive time portal with rotating rings
- **StabilityRing** - Circular progress indicator
- **UpgradeCard** - Shop item display
- **MissionCard** - Mission tracker
- **EraCard** - Era selection cards
- **TopNavBar** - Navigation hub with HUD stats
- **EventModal** - Story event notifications
- **Particle Effects** - Floating stars background
- **Portal Effects** - Light tunnel animations

### Animations
- Page transitions with Framer Motion
- Portal hover pulse and rotation
- Button glow surge effects
- Currency gain sparkles
- Stability loss screen shake
- Timeline ripple effects
- Smooth particle drifting

## 📦 Tech Stack

- **React 18** - UI framework
- **React Router DOM v6** - Navigation
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **PostCSS** - CSS processing

## 🛠️ Installation

```bash
cd timetravel
npm install
```

## ▶️ Running the Project

```bash
npm start
```

The app will run on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── UI.jsx              # Reusable UI components
│   ├── Effects.jsx         # Visual effects
│   ├── TopNavBar.jsx       # Navigation bar
│   └── index.js            # Component exports
├── pages/
│   ├── IntroScreen.jsx     # Landing page
│   ├── Dashboard.jsx       # Main dashboard
│   ├── EraScreens.jsx      # Past/Present/Future screens
│   ├── UtilityPages.jsx    # Missions/Leaderboard/Settings
│   ├── SpecialScreens.jsx  # Collapse/Ending screens
│   └── index.js            # Page exports
├── store/
│   └── gameStore.js        # Zustand state management
├── styles/
│   └── global.css          # Global styles and animations
├── App.jsx                 # Router configuration
└── index.js                # React entry point
```

## 🎮 Game Mechanics

### State Management
- Player resources (credits, energy, stability)
- Current location tracking
- Mission and upgrade tracking
- Leaderboard scores
- Game state (active, paused, game over)

### Actions Available
- Travel between eras
- Purchase upgrades
- Accept and complete missions
- Manage timeline stability
- View leaderboard rankings
- Save/sync progress

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color palette:
```javascript
colors: {
  primary: '#9C27B0',     // Deep Purple
  accent: '#00E5FF',      // Electric Blue
  secondary: '#FFC107',   // Amber Gold
}
```

### Animations
Modify animation durations and effects in:
- `tailwind.config.js` - Keyframes and animations
- Component files - Framer Motion `animate` props
- `src/styles/global.css` - Global CSS animations

## 📱 Responsive Design

The UI is fully responsive with:
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly buttons
- Collapsible navigation

## 🚀 Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

## 🎯 Future Enhancements

- Backend API integration
- Persistent user data
- Multiplayer leaderboards
- Social features
- In-game sound effects
- Mobile app version
- Advanced AI opponents

## 📄 License

This project is part of the FWD-Project initiative.

---

**Fix the Past. Protect the Present. Rewrite the Future.** ⏰
