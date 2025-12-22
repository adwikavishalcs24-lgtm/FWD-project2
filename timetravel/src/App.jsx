
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { IntroScreen } from './pages/IntroScreen';
import { Dashboard } from './pages/Dashboard';
import { PastScreen, PresentScreen, FutureScreen } from './pages/EraScreens';
import { MissionsPage, LeaderboardPage, SettingsPage } from './pages/UtilityPages';
import { CollapseScreen, EndingScreen } from './pages/SpecialScreens';
import { TimeMachine } from './pages/TimeMachine';
import './styles/global.css';

// Game routes component
const GameRoutes = () => {
  return (
    <Routes>
      <Route path="/intro" element={<IntroScreen />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/past" element={<PastScreen />} />
      <Route path="/present" element={<PresentScreen />} />
      <Route path="/future" element={<FutureScreen />} />
      <Route path="/timemachine" element={<TimeMachine />} />
      <Route path="/missions" element={<MissionsPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/collapse" element={<CollapseScreen />} />
      <Route path="/ending" element={<EndingScreen />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Loading screen component
const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-spinner large"></div>
        <h2>Initializing Time Machine...</h2>
        <p>Loading your temporal coordinates</p>
      </div>
    </div>
  );
};

function App() {
  const { 
    authLoading, 
    gameLoading,
    initializeAuth 
  } = useGameStore();

  // Initialize authentication on app startup
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    initApp();
  }, [initializeAuth]);

  // Show loading screen while initializing
  if (authLoading || gameLoading) {
    return <LoadingScreen />;
  }

  // Show main game for authenticated users
  return (
    <Router>
      <GameRoutes />
    </Router>
  );
}

export default App;
