import { Activity, Clock, Zap, TrendingUp, Shield, Timer } from 'lucide-react';
import { useFlow } from '../context/FlowContext';

const LiveDashboard = () => {
  const { flowState, metrics } = useFlow();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (seconds) => {
    return Math.floor(seconds / 60);
  };

  const cards = [
    {
      title: 'Flow Score',
      value: metrics.flowScore,
      unit: '%',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      showProgress: true,
    },
    {
      title: 'Session Duration',
      value: formatTime(metrics.sessionDuration),
      unit: '',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      showProgress: false,
    },
    {
      title: 'Flow Duration',
      value: formatTime(metrics.flowDuration),
      unit: '',
      icon: Timer,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      showProgress: false,
    },
    {
      title: 'Typing Cadence',
      value: metrics.typingCadence,
      unit: ' wpm',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      showProgress: false,
    },
    {
      title: 'Active Ratio',
      value: metrics.activeRatio,
      unit: '%',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      showProgress: false,
    },
    {
      title: 'Distractions Blocked',
      value: metrics.blockedCount,
      unit: '',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      showProgress: false,
    },
  ];

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>

            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">
                {card.value}
                <span className="text-lg text-gray-500">{card.unit}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">{card.title}</div>
            </div>

            {card.showProgress && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-linear-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${card.value}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {flowState === 'FLOW' && (
        <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white animate-pulse">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🌊</div>
            <div>
              <div className="text-xl font-bold">Flow State Active</div>
              <div className="text-purple-100">
                You've been in deep focus for {formatMinutes(metrics.flowDuration)} minutes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDashboard;
