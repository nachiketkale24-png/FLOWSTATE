import React from 'react';
import { useFlow } from '../context/FlowContext';
import { Brain, Gauge, AlertTriangle, Activity, TrendingUp, Zap } from 'lucide-react';
import WebcamControls from './WebcamControls';

export default function AIDetectionPanel() {
  const { metrics, flowState } = useFlow();

  // Calculate risk level based on focus stability
  const getRiskLevel = () => {
    const score = metrics.focusStabilityScore;
    if (score >= 80) return { level: 'Low', color: 'green', bg: 'bg-green-500/20', border: 'border-green-400/50', icon: '✓' };
    if (score >= 60) return { level: 'Medium', color: 'yellow', bg: 'bg-yellow-500/20', border: 'border-yellow-400/50', icon: '⚠' };
    return { level: 'High', color: 'red', bg: 'bg-red-500/20', border: 'border-red-400/50', icon: '⚠' };
  };

  // Calculate fatigue status
  const getFatigueStatus = () => {
    const score = metrics.fatigueScore;
    if (score < 30) return { label: 'Fresh', color: 'text-green-400', bg: 'bg-green-500' };
    if (score < 60) return { label: 'Warming Up', color: 'text-yellow-400', bg: 'bg-yellow-500' };
    return { label: 'Tired', color: 'text-red-400', bg: 'bg-red-500' };
  };

  // Get stability badge
  const getStabilityBadge = () => {
    const score = metrics.focusStabilityScore;
    if (score >= 80) return { label: 'Stable', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-400/50' };
    if (score >= 50) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-400/50' };
    return { label: 'Fragile', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-400/50' };
  };

  // Format distraction reason
  const getDistractionText = () => {
    if (!metrics.lastDistractionReason) return 'No distractions detected';
    
    const reasons = {
      'window-blur': 'Window lost focus',
      'idle': 'Extended idle time',
      'tab-switching': 'Frequent tab switching',
      'low-activity': 'Low activity detected',
      'erratic-activity': 'Erratic activity pattern',
    };

    return `Last: ${reasons[metrics.lastDistractionReason] || metrics.lastDistractionReason}`;
  };

  const riskLevel = getRiskLevel();
  const fatigueStatus = getFatigueStatus();
  const stabilityBadge = getStabilityBadge();
  const isDeepFlow = metrics.focusStabilityScore >= 85 && flowState === 'FLOW';
  const isHighRisk = riskLevel.level === 'High';

  return (
    <div 
      className={`glass-card p-6 rounded-2xl border transition-all duration-500 animate-fade-in ${
        isHighRisk 
          ? 'border-red-400/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse-glow' 
          : 'border-purple-500/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-400/50">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              AI Attention Monitor
              {isDeepFlow && (
                <span className="px-3 py-1 bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-full text-xs font-bold text-green-400 animate-pulse-subtle flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Deep Flow Detected
                </span>
              )}
            </h2>
            <p className="text-purple-200/70 text-sm">Real-time distraction & fatigue detection</p>
          </div>
        </div>

        {/* Distraction Counter Badge */}
        <div className="px-4 py-2 bg-orange-500/10 border border-orange-400/50 rounded-xl">
          <div className="text-xs text-orange-300/70">Today</div>
          <div className="text-2xl font-bold text-orange-400">{metrics.distractionEvents}</div>
          <div className="text-xs text-orange-300/70">Distractions</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Focus Stability */}
        <div className="glass-card p-4 rounded-xl border border-purple-500/30 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-5 h-5 text-purple-400" />
            <span className="text-purple-200/70 text-sm font-semibold">Focus Stability</span>
          </div>
          
          <div className="flex items-end gap-2 mb-3">
            <div className="text-4xl font-black text-white">
              {metrics.focusStabilityScore}
            </div>
            <div className="text-purple-300/60 text-lg mb-1">/100</div>
          </div>

          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${stabilityBadge.color} ${stabilityBadge.bg} ${stabilityBadge.border}`}>
            {stabilityBadge.label}
          </div>
        </div>

        {/* 2. Fatigue Score */}
        <div className="glass-card p-4 rounded-xl border border-cyan-500/30 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="text-purple-200/70 text-sm font-semibold">Fatigue Score</span>
          </div>

          <div className="mb-3">
            <div className="text-4xl font-black text-cyan-400">
              {isNaN(metrics.fatigueScore) ? '0' : Math.round(metrics.fatigueScore)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-900/50 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${fatigueStatus.bg}`}
              style={{ width: `${Math.min(isNaN(metrics.fatigueScore) ? 0 : metrics.fatigueScore, 100)}%` }}
            ></div>
          </div>

          <div className={`text-xs font-semibold ${fatigueStatus.color}`}>
            {fatigueStatus.label}
          </div>
        </div>

        {/* 3. Distraction Risk */}
        <div className={`glass-card p-4 rounded-xl border transition-all hover:scale-[1.02] ${riskLevel.border}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className={`w-5 h-5 text-${riskLevel.color}-400`} />
            <span className="text-purple-200/70 text-sm font-semibold">Distraction Risk</span>
          </div>

          <div className="mb-3">
            <div className={`text-4xl font-black text-${riskLevel.color}-400`}>
              {riskLevel.icon}
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${riskLevel.bg} ${riskLevel.border}`}>
            <div className={`w-2 h-2 rounded-full bg-${riskLevel.color}-400 ${isHighRisk ? 'animate-pulse' : ''}`}></div>
            <span className={`text-sm font-bold text-${riskLevel.color}-400`}>
              {riskLevel.level} Risk
            </span>
          </div>
        </div>

        {/* 4. Last Distraction */}
        <div className="glass-card p-4 rounded-xl border border-pink-500/30 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-pink-400" />
            <span className="text-purple-200/70 text-sm font-semibold">Last Distraction</span>
          </div>

          <div className="mb-3">
            <div className="text-lg font-bold text-pink-400 line-clamp-2">
              {getDistractionText()}
            </div>
          </div>

          {metrics.lastDistractionReason ? (
            <div className="flex items-center gap-2 text-xs text-purple-300/60">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
              <span>Active monitoring</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-green-300/60">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              <span>All clear</span>
            </div>
          )}
        </div>
      </div>

      {/* Webcam AI Controls */}
      <div className="mt-6">
        <WebcamControls />
      </div>

      {/* Real-time Indicator */}
      {flowState !== 'IDLE' && (
        <div className="mt-4 pt-4 border-t border-purple-500/20 flex items-center justify-center gap-2 text-xs text-purple-300/60">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span>AI monitoring active • Real-time analysis</span>
        </div>
      )}
    </div>
  );
}
