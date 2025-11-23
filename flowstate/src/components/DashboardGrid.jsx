import { Activity, Clock, Timer, Zap, TrendingUp, Shield, AlertTriangle, Battery, Brain } from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import MetricCard from './MetricCard';

/**
 * DashboardGrid - Main metrics dashboard with 9-card responsive grid
 * Displays real-time flow metrics + AI agent insights
 */
const DashboardGrid = () => {
  const { metrics } = useFlow();

  // Helper function to format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to safely format percentage
  const formatPercentage = (value) => {
    const num = Number(value) || 0;
    return isNaN(num) ? '0' : num.toFixed(0);
  };

  // Metric configuration array (now includes AI agent metrics)
  const metricsConfig = [
    {
      id: 'flow-score',
      title: 'Flow Score',
      value: metrics.flowScore,
      subtitle: 'AI-analyzed focus level',
      icon: Activity,
      color: 'purple',
      showProgress: true,
    },
    {
      id: 'session-duration',
      title: 'Session Duration',
      value: formatTime(metrics.sessionDuration),
      subtitle: 'Total time tracking',
      icon: Clock,
      color: 'blue',
      showProgress: false,
    },
    {
      id: 'flow-duration',
      title: 'Flow Duration',
      value: formatTime(metrics.flowDuration),
      subtitle: 'Time in flow state',
      icon: Timer,
      color: 'green',
      showProgress: false,
    },
    {
      id: 'typing-cadence',
      title: 'Typing Cadence',
      value: `${metrics.typingCadence} wpm`,
      subtitle: 'Words per minute',
      icon: Zap,
      color: 'yellow',
      showProgress: false,
    },
    {
      id: 'active-ratio',
      title: 'Active Ratio',
      value: `${formatPercentage(metrics.activeRatio * 100)}%`,
      subtitle: 'Activity percentage',
      icon: TrendingUp,
      color: 'indigo',
      showProgress: false,
    },
    {
      id: 'distractions-blocked',
      title: 'Distractions Blocked',
      value: metrics.blockedCount,
      subtitle: 'AI-prevented interruptions',
      icon: Shield,
      color: 'red',
      showProgress: false,
    },
    {
      id: 'fatigue-score',
      title: 'Fatigue Level',
      value: formatPercentage(metrics.fatigueScore),
      subtitle: 'Energy depletion risk',
      icon: Battery,
      color: 'orange',
      showProgress: true,
    },
    {
      id: 'distraction-risk',
      title: 'Distraction Risk',
      value: formatPercentage(metrics.distractionRisk),
      subtitle: 'Break probability',
      icon: AlertTriangle,
      color: 'red',
      showProgress: true,
    },
    {
      id: 'stamina-score',
      title: 'Focus Stamina',
      value: formatPercentage(metrics.staminaScore),
      subtitle: `Trending ${metrics.staminaTrend || 'stable'}`,
      icon: Brain,
      color: 'cyan',
      showProgress: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1 neon-pink">
          Live Dashboard
        </h2>
        <p className="text-sm text-gray-400">
          Real-time flow metrics and productivity insights
        </p>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricsConfig.map((metric, index) => (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
            color={metric.color}
            showProgress={metric.showProgress}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid;
