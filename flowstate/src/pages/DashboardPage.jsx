import React, { useEffect } from 'react';
import { useFlow } from '../context/FlowContext';

import NavbarStatusBar from '../components/NavbarStatusBar';
import DashboardGrid from '../components/DashboardGrid';
import FlowBanner from '../components/FlowBanner';
import BlockOverlay from '../components/BlockOverlay';
import SessionSummary from '../components/SessionSummary';
import SettingsPanel from '../components/SettingsPanel';
import QuickStats from '../components/QuickStats';
import FloatingActions from '../components/FloatingActions';
import AIDetectionPanel from '../components/AIDetectionPanel';
import AchievementsWidget from '../components/AchievementsWidget';
import GoalsWidget from '../components/GoalsWidget';
import DebugButton from '../components/DebugButton';

export default function DashboardPage() {
  const { startSession } = useFlow();

  // Start session automatically for demo
  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Content */}
      <div className="relative z-10">
        <NavbarStatusBar />
        <main>
          <QuickStats />
          <DashboardGrid />
          <div className="px-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AchievementsWidget />
            <GoalsWidget />
          </div>
          <div className="px-6 mt-6">
            <AIDetectionPanel />
          </div>
          <FlowBanner />
        </main>

        {/* Overlays */}
        <BlockOverlay />
        <SessionSummary />
        <FloatingActions />
        <SettingsPanel />
        <DebugButton />
      </div>
    </div>
  );
}
