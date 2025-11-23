// src/pages/DebugPage.jsx - Comprehensive Debug Dashboard

import React, { useState, useEffect } from 'react';
import { useFlow } from '../context/FlowContext';
import { useAuth } from '../hooks/useAuthHook';
import { APP_CONFIG, getModeStatus } from '../config/appConfig';
import { logger } from '../utils/logger';
import { dbClient } from '../services/dbClient';
import { Bug, Server, Database, User, Activity, Settings, RefreshCw, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Status Icon Component - defined outside render
const StatusIcon = ({ status }) => {
  if (status === true) return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (status === false) return <XCircle className="w-4 h-4 text-red-400" />;
  return <AlertCircle className="w-4 h-4 text-yellow-400" />;
};

export default function DebugPage() {
  const { metrics, flowState, currentSessionId } = useFlow();
  const { authUser } = useAuth();
  const [logs, setLogs] = useState(() => logger.getHistory({ limit: 50 })); // Initialize with logs
  const [dbTest, setDbTest] = useState(null);
  const [testRunning, setTestRunning] = useState(false);

  // Subscribe to logs
  useEffect(() => {
    const unsubscribe = logger.subscribe((newLog) => {
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    });
    
    return unsubscribe;
  }, []);

  // Run DB connection test
  const runDBTest = async () => {
    setTestRunning(true);
    const results = {
      firebaseAuth: false,
      firestoreRead: false,
      firestoreWrite: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // Test auth
      results.firebaseAuth = !!authUser;
      
      // Test Firestore read
      try {
        const stats = await dbClient.getUserStats();
        results.firestoreRead = true;
        results.statsData = stats;
      } catch (error) {
        results.firestoreReadError = error.message;
      }

      // Test Firestore write
      try {
        await dbClient.saveSession(null, {
          test: true,
          timestamp: new Date().toISOString(),
        });
        results.firestoreWrite = true;
      } catch (error) {
        results.firestoreWriteError = error.message;
      }
    } catch (error) {
      results.error = error.message;
    }

    setDbTest(results);
    setTestRunning(false);
  };

  const modeStatus = getModeStatus();
  const logStats = logger.getStats();

  const downloadLogs = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message} ${log.data ? JSON.stringify(log.data) : ''}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowstate-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bug className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-black text-white">Debug Dashboard</h1>
              <p className="text-purple-200/70">System diagnostics & logs</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={downloadLogs}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Logs
            </button>
            <button
              onClick={() => logger.clearHistory()}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">System Status</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Version</span>
                <span className="text-purple-400 font-mono">{APP_CONFIG.VERSION}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Demo Mode</span>
                <StatusIcon status={modeStatus.isDemoMode} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Firestore</span>
                <StatusIcon status={modeStatus.isFirestoreEnabled} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Auth</span>
                <StatusIcon status={modeStatus.isAuthEnabled} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">AI Tracking</span>
                <StatusIcon status={modeStatus.isAITrackingEnabled} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Flow State</span>
                <span className={`font-bold ${
                  flowState === 'FLOW' ? 'text-green-400' :
                  flowState === 'MONITORING' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {flowState}
                </span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">User Info</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">UID</span>
                <span className="text-cyan-400 font-mono text-sm truncate max-w-[200px]">
                  {authUser?.uid || 'Not logged in'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Email</span>
                <span className="text-cyan-400 text-sm">
                  {authUser?.email || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Session ID</span>
                <span className="text-cyan-400 font-mono text-sm truncate max-w-[200px]">
                  {currentSessionId || 'No active session'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Auth Token</span>
                <StatusIcon status={!!authUser} />
              </div>
            </div>
          </div>

          {/* DB Test */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-white">Database Test</h2>
              </div>
              
              <button
                onClick={runDBTest}
                disabled={testRunning}
                className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${testRunning ? 'animate-spin' : ''}`} />
                Test
              </button>
            </div>

            {dbTest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Firebase Auth</span>
                  <StatusIcon status={dbTest.firebaseAuth} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Firestore Read</span>
                  <StatusIcon status={dbTest.firestoreRead} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Firestore Write</span>
                  <StatusIcon status={dbTest.firestoreWrite} />
                </div>
                
                <div className="text-xs text-gray-400 mt-4">
                  Tested at: {new Date(dbTest.timestamp).toLocaleString()}
                </div>
                
                {dbTest.error && (
                  <div className="p-2 bg-red-500/20 border border-red-400/50 rounded text-xs text-red-400">
                    {dbTest.error}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Click Test to run diagnostics</p>
            )}
          </div>

          {/* Live Metrics */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-pink-400" />
              <h2 className="text-xl font-bold text-white">Live Metrics</h2>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Flow Score</span>
                <span className="text-pink-400 font-mono">{Math.round(metrics.flowScore)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Session Duration</span>
                <span className="text-pink-400 font-mono">{Math.floor(metrics.sessionDuration / 60)}m</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Typing Cadence</span>
                <span className="text-pink-400 font-mono">{metrics.typingCadence} WPM</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Active Ratio</span>
                <span className="text-pink-400 font-mono">{Math.round(metrics.activeRatio * 100)}%</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Distractions</span>
                <span className="text-pink-400 font-mono">{metrics.distractionEvents}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Attention Score</span>
                <span className="text-pink-400 font-mono">{Math.round(metrics.attentionScore)}</span>
              </div>
            </div>
          </div>

          {/* Log Stats */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Log Statistics</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{logStats.total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{logStats.error || 0}</div>
                <div className="text-xs text-gray-400">Errors</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{logStats.warn || 0}</div>
                <div className="text-xs text-gray-400">Warnings</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{logStats.event || 0}</div>
                <div className="text-xs text-gray-400">Events</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{logStats.info || 0}</div>
                <div className="text-xs text-gray-400">Info</div>
              </div>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Recent Logs (Last 50)</h2>
            
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-xs font-mono ${
                    log.level === 'error' ? 'bg-red-500/10 text-red-400' :
                    log.level === 'warn' ? 'bg-yellow-500/10 text-yellow-400' :
                    log.level === 'event' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`font-bold ${
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warn' ? 'text-yellow-400' :
                      log.level === 'event' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      [{log.category}]
                    </span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                  {log.data && (
                    <div className="mt-1 pl-4 text-gray-500 text-xs">
                      {JSON.stringify(log.data, null, 2)}
                    </div>
                  )}
                </div>
              ))}
              
              {logs.length === 0 && (
                <p className="text-gray-400 text-center py-4">No logs yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
