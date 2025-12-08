import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { IntroScreen } from './pages/IntroScreen';
import { Dashboard } from './pages/Dashboard';
import { PastScreen, PresentScreen, FutureScreen } from './pages/EraScreens';
import { MissionsPage, LeaderboardPage, SettingsPage } from './pages/UtilityPages';
import { CollapseScreen, EndingScreen } from './pages/SpecialScreens';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/intro" element={<IntroScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/past" element={<PastScreen />} />
        <Route path="/present" element={<PresentScreen />} />
        <Route path="/future" element={<FutureScreen />} />
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/collapse" element={<CollapseScreen />} />
        <Route path="/ending" element={<EndingScreen />} />
        <Route path="/" element={<Navigate to="/intro" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
