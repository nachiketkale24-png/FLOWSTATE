import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FlowProvider } from './context/FlowContext';
import { NotificationProvider } from './components/NotificationProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { APP_CONFIG } from './config/appConfig';

import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AssistantPage from './pages/AssistantPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AchievementsPage from './pages/AchievementsPage';
import GoalsPage from './pages/GoalsPage';
import DebugPage from './pages/DebugPage';

/**
 * Root App with Authentication and Routing
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            {/* Demo Mode Badge */}
            {APP_CONFIG.DEMO_MODE && (
              <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                🎮 Demo Mode
              </div>
            )}

            <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <HomePage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/auth"
            element={
              <PublicOnlyRoute>
                <AuthPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Routes - Require Authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <FlowProvider>
                  <div className="flex">
                    <Navigation />
                    <div className="flex-1 md:ml-20">
                      <DashboardPage />
                    </div>
                  </div>
                </FlowProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <FlowProvider>
                  <div className="flex">
                    <Navigation />
                    <div className="flex-1 md:ml-20">
                      <AnalyticsPage />
                    </div>
                  </div>
                </FlowProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <FlowProvider>
                  <div className="flex">
                    <Navigation />
                    <div className="flex-1 md:ml-20">
                      <AssistantPage />
                    </div>
                  </div>
                </FlowProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <FlowProvider>
                  <div className="flex">
                    <Navigation />
                    <div className="flex-1 md:ml-20">
                      <HistoryPage />
                    </div>
                  </div>
                </FlowProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <FlowProvider>
                  <div className="flex">
                    <Navigation />
                    <div className="flex-1 md:ml-20">
                      <ReportsPage />
                    </div>
                  </div>
                </FlowProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <FlowProvider>
                  <div className="flex">
                    <Navigation />
                    <div className="flex-1 md:ml-20">
                      <SettingsPage />
                    </div>
                  </div>
                </FlowProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <FlowProvider>
                  <div className="flex">
                    <Navigation />
                    <div className="flex-1 md:ml-20">
                      <AchievementsPage />
                    </div>
                  </div>
                </FlowProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <FlowProvider>
                  <div className="flex">
                    <Navigation />
                    <div className="flex-1 md:ml-20">
                      <GoalsPage />
                    </div>
                  </div>
                </FlowProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/debug"
            element={
              <ProtectedRoute>
                <FlowProvider>
                  <div className="flex">
                    <Navigation />
                    <div className="flex-1 md:ml-20">
                      <DebugPage />
                    </div>
                  </div>
                </FlowProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
