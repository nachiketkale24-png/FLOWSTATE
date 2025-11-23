import { Trophy, Clock, Shield, TrendingUp, BarChart3, Lightbulb, Sparkles, Brain, Target } from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { generateInsights } from '../ai/insightsAgent';

/**
 * SessionSummary - Beautiful session end modal with AI-generated insights
 * Displays comprehensive session metrics + insights from backend API
 */
const SessionSummary = () => {
  const { 
    showSummary, 
    metrics, 
    sessionInsights, 
    startSession,
    completedGoalsThisSession = [],
    progressedGoalsThisSession = []
  } = useFlow();

  if (!showSummary) return null;

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Use backend insights if available, otherwise use local AI insights
  const insights = sessionInsights && sessionInsights.length > 0
    ? sessionInsights
    : generateInsights({
        sessionDuration: metrics.sessionDuration,
        flowDuration: metrics.flowDuration,
        staminaScore: metrics.staminaScore,
      });

  // Stats configuration for 2-column grid
  const statsConfig = [
    {
      icon: Clock,
      label: 'Total Session Time',
      value: formatTime(metrics.sessionDuration),
      color: 'blue',
    },
    {
      icon: Trophy,
      label: 'Flow Time',
      value: formatTime(metrics.flowDuration),
      color: 'purple',
    },
    {
      icon: Shield,
      label: 'Distractions Blocked',
      value: metrics.blockedCount,
      color: 'red',
    },
    {
      icon: TrendingUp,
      label: 'Final Flow Score',
      value: `${metrics.flowScore}%`,
      color: 'green',
    },
    {
      icon: BarChart3,
      label: 'Fatigue Level',
      value: `${metrics.fatigueScore}%`,
      color: 'orange',
    },
    {
      icon: Brain,
      label: 'Focus Stamina',
      value: `${metrics.staminaScore}% (${metrics.staminaTrend})`,
      color: 'cyan',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
        {/* Header */}
        <div className="text-center px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
            <Trophy className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Session Complete!
          </h2>
          <p className="text-gray-600">
            Here's how you performed
          </p>
        </div>

        {/* Stats Grid */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {statsConfig.map((stat, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-0.5">
                      {stat.label}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Goal Progress Section */}
          {(completedGoalsThisSession.length > 0 || progressedGoalsThisSession.length > 0) && (
            <div className="bg-linear-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Target className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">
                    Goal Progress
                  </h3>
                  
                  {completedGoalsThisSession.length > 0 && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">
                          {completedGoalsThisSession.length} {completedGoalsThisSession.length === 1 ? 'Goal' : 'Goals'} Completed!
                        </span>
                      </div>
                      <div className="space-y-2">
                        {completedGoalsThisSession.map((goal, index) => (
                          <div key={index} className="text-sm text-green-800 flex items-center gap-2">
                            <span className="text-lg">🏆</span>
                            <span>{goal.title} — {goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {progressedGoalsThisSession.length > 0 && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-cyan-600" />
                        <span className="font-semibold text-gray-900">
                          Progress on {progressedGoalsThisSession.length} {progressedGoalsThisSession.length === 1 ? 'Goal' : 'Goals'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {progressedGoalsThisSession.map((goal, index) => (
                          <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span>{goal.title} — {goal.currentValue}/{goal.targetValue} {goal.unit} ({goal.percentComplete}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Insights Box */}
          <div className="bg-linear-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">
                  {sessionInsights && sessionInsights.length > 0 
                    ? 'AI Insights from Backend' 
                    : 'AI Insights & Suggestions'}
                </h3>
                <div className="space-y-3">
                  {insights.map((insightText, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-3"
                    >
                      <span className="text-2xl shrink-0">
                        {index === 0 ? '🧠' : index === 1 ? '📊' : '⚡'}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed pt-1">
                        {insightText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={startSession}
            className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
