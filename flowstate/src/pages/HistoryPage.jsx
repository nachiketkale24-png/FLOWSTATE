import React, { useState, useEffect } from 'react';
import { useFlow } from '../context/FlowContext';
import { demoSessions } from '../demoData';
import { logger } from '../utils/logger';
import { Calendar, Clock, Zap, Target, TrendingUp, Loader2, AlertCircle, X } from 'lucide-react';

export default function HistoryPage() {
  const { metrics, flowState, sessionDuration } = useFlow();
  
  // State
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        logger.info('HistoryPage', 'Loading demo sessions');
        
        // Use demo sessions for offline mode
        setSessions(demoSessions);
        logger.event('HistoryPage', 'Demo sessions loaded', { count: demoSessions.length });
      } catch (err) {
        logger.error('HistoryPage', 'Failed to load demo sessions', err);
        setError('Failed to load session history');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Mock data generator for fallback
  const generateMockSessions = () => {
    const sessions = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() - i);
      
      const totalDuration = 1800 + Math.floor((i * 300) % 3600);
      const flowTime = Math.floor(totalDuration * (0.5 + (i % 3) * 0.15));
      
      sessions.push({
        id: `mock-${i}`,
        userId: 'demo-user',
        startTime: sessionDate.toISOString(),
        endTime: new Date(sessionDate.getTime() + totalDuration * 1000).toISOString(),
        sessionDuration: totalDuration,
        flowDuration: flowTime,
        flowScore: 60 + (i % 4) * 10,
        staminaScore: 65 + (i % 6) * 5,
        blockedCount: 5 + (i % 8) * 3,
        distractionEvents: 3 + (i % 5) * 2,
        typingCadence: 55 + (i % 5) * 8,
      });
    }
    
    return sessions;
  };

  // Format helpers
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getFlowQuality = (percentage) => {
    if (percentage >= 70) return { 
      label: 'Excellent', 
      color: 'text-green-400', 
      bg: 'bg-green-500/20', 
      border: 'border-green-400/50' 
    };
    if (percentage >= 50) return { 
      label: 'Good', 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/20', 
      border: 'border-cyan-400/50' 
    };
    if (percentage >= 30) return { 
      label: 'Fair', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/20', 
      border: 'border-yellow-400/50' 
    };
    return { 
      label: 'Needs Work', 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/20', 
      border: 'border-orange-400/50' 
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200/70">Loading session history...</p>
        </div>
      </div>
    );
  }

  // Calculate flow percentage for each session
  const sessionsWithPercentage = sessions.map(session => {
    // Handle both timestamp and startTime fields
    const sessionTime = session.timestamp || session.startTime;
    const sessionEnd = session.endTime || new Date(new Date(sessionTime).getTime() + (session.sessionDuration || 0) * 1000).toISOString();
    
    return {
      ...session,
      startTime: sessionTime,
      endTime: sessionEnd,
      flowPercentage: session.sessionDuration > 0 
        ? Math.round((session.flowDuration / session.sessionDuration) * 100)
        : 0
    };
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden pb-24 md:pb-8">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]"></div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400 mb-2">
              Session History
            </h1>
            <p className="text-purple-200/70 text-base md:text-lg">
              {error ? 'Error loading sessions' : `${sessions.length} sessions recorded`}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 glass-card p-4 rounded-xl border border-red-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Current Session Card */}
          {flowState !== 'IDLE' && (
            <div className="glass-card p-6 rounded-2xl border-2 border-green-400/50 bg-green-500/5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🟢</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">Active Session</h3>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-400/50">
                        LIVE
                      </span>
                    </div>
                    <p className="text-purple-200/70 text-sm">Currently in progress</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-purple-500/10 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">{formatDuration(sessionDuration)}</div>
                  <div className="text-xs text-purple-200/60">Duration</div>
                </div>
                <div className="text-center p-3 bg-cyan-500/10 rounded-xl">
                  <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-cyan-400">{metrics.flowScore}</div>
                  <div className="text-xs text-purple-200/60">Flow Score</div>
                </div>
                <div className="text-center p-3 bg-pink-500/10 rounded-xl">
                  <Target className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-pink-400">{metrics.staminaScore}</div>
                  <div className="text-xs text-purple-200/60">Stamina</div>
                </div>
                <div className="text-center p-3 bg-orange-500/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-orange-400">{metrics.blockedCount}</div>
                  <div className="text-xs text-purple-200/60">Blocked</div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 rounded-xl border border-purple-500/30">
              <div className="text-purple-200/70 text-sm mb-1">Total Sessions</div>
              <div className="text-3xl font-bold text-white">{sessions.length}</div>
            </div>
            <div className="glass-card p-4 rounded-xl border border-cyan-500/30">
              <div className="text-purple-200/70 text-sm mb-1">Total Flow Time</div>
              <div className="text-3xl font-bold text-cyan-400">
                {formatDuration(sessions.reduce((sum, s) => sum + (s.flowDuration || 0), 0))}
              </div>
            </div>
            <div className="glass-card p-4 rounded-xl border border-pink-500/30">
              <div className="text-purple-200/70 text-sm mb-1">Avg Flow Score</div>
              <div className="text-3xl font-bold text-pink-400">
                {sessions.length > 0
                  ? Math.round(sessions.reduce((sum, s) => sum + (s.flowScore || 0), 0) / sessions.length)
                  : 0}
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="glass-card rounded-2xl border border-purple-500/30 overflow-hidden">
            {/* Table Header */}
            <div className="bg-purple-500/10 px-6 py-4 border-b border-purple-500/20">
              <h2 className="text-xl font-bold text-white">Past Sessions</h2>
            </div>

            {/* Sessions */}
            <div className="divide-y divide-purple-500/10">
              {sessionsWithPercentage.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-purple-200/70 text-lg">No sessions yet</p>
                  <p className="text-purple-300/50 text-sm mt-2">Start your first session to see it here!</p>
                </div>
              ) : (
                sessionsWithPercentage.map((session) => {
                  const quality = getFlowQuality(session.flowPercentage);
                  
                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="w-full px-6 py-4 hover:bg-purple-500/5 transition-colors text-left group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Date & Time */}
                        <div className="flex items-center gap-3 md:w-48">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-white font-semibold">{formatDate(session.startTime)}</div>
                            <div className="text-purple-300/60 text-xs">{formatTime(session.startTime)}</div>
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 md:w-32">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span className="text-white font-medium">{formatDuration(session.sessionDuration)}</span>
                        </div>

                        {/* Flow Time */}
                        <div className="flex items-center gap-2 md:w-32">
                          <Zap className="w-4 h-4 text-pink-400" />
                          <span className="text-pink-400 font-medium">{formatDuration(session.flowDuration)}</span>
                        </div>

                        {/* Flow Score */}
                        <div className="flex items-center gap-2 md:w-24">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-400 font-bold text-lg">{session.flowScore}</span>
                        </div>

                        {/* Quality Badge */}
                        <div className="flex-1 flex justify-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${quality.color} ${quality.bg} ${quality.border}`}>
                            {quality.label}
                          </span>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:block text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full rounded-2xl border border-purple-500/30 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md px-6 py-4 border-b border-purple-500/20 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Session Details</h3>
                <p className="text-purple-200/70 text-sm">
                  {formatDate(selectedSession.startTime)} at {formatTime(selectedSession.startTime)}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-purple-300" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Quality Badge */}
              <div className="text-center">
                <div className={`inline-block px-6 py-3 rounded-2xl border-2 ${getFlowQuality(selectedSession.flowPercentage).color} ${getFlowQuality(selectedSession.flowPercentage).bg} ${getFlowQuality(selectedSession.flowPercentage).border}`}>
                  <div className="text-4xl font-black mb-1">{selectedSession.flowPercentage}%</div>
                  <div className="text-sm font-semibold">{getFlowQuality(selectedSession.flowPercentage).label} Flow Session</div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-xl border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-200/70 text-sm">Total Duration</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{formatDuration(selectedSession.sessionDuration)}</div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-pink-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-pink-400" />
                    <span className="text-purple-200/70 text-sm">Flow Time</span>
                  </div>
                  <div className="text-3xl font-bold text-pink-400">{formatDuration(selectedSession.flowDuration)}</div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="text-purple-200/70 text-sm">Flow Score</span>
                  </div>
                  <div className="text-3xl font-bold text-cyan-400">{selectedSession.flowScore}</div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-purple-200/70 text-sm">Stamina</span>
                  </div>
                  <div className="text-3xl font-bold text-green-400">{selectedSession.staminaScore}</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="glass-card p-4 rounded-xl border border-purple-500/30">
                <h4 className="text-lg font-bold text-white mb-3">Performance Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200/70">Typing Speed</span>
                    <span className="text-white font-semibold">{selectedSession.typingCadence} WPM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200/70">Distractions Blocked</span>
                    <span className="text-white font-semibold">{selectedSession.blockedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200/70">Distraction Events</span>
                    <span className="text-white font-semibold">{selectedSession.distractionEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200/70">Session ID</span>
                    <span className="text-purple-300/60 text-xs font-mono">{selectedSession.id}</span>
                  </div>
                </div>
              </div>

              {/* Time Range */}
              <div className="glass-card p-4 rounded-xl border border-purple-500/30">
                <h4 className="text-lg font-bold text-white mb-3">Time Range</h4>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-purple-200/70 mb-1">Started</div>
                    <div className="text-white font-semibold">
                      {new Date(selectedSession.startTime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                  <div className="text-purple-400">→</div>
                  <div className="text-right">
                    <div className="text-purple-200/70 mb-1">Ended</div>
                    <div className="text-white font-semibold">
                      {new Date(selectedSession.endTime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
