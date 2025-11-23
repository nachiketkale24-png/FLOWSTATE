import { Play, Pause, RotateCcw, Download } from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { useState } from 'react';

/**
 * FloatingActions - Quick action menu for common tasks
 * Provides easy access to session controls
 */
const FloatingActions = () => {
  const { flowState, startSession, endSession, metrics } = useFlow();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStartPause = () => {
    if (flowState === 'IDLE') {
      startSession();
    } else if (flowState === 'MONITORING' || flowState === 'FLOW') {
      endSession();
    }
  };

  const handleReset = () => {
    endSession();
    // Small delay before restarting to ensure clean state
    setTimeout(() => startSession(), 100);
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics,
      flowState,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowstate-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actions = [
    {
      icon: flowState === 'IDLE' ? Play : Pause,
      label: flowState === 'IDLE' ? 'Start' : 'Pause',
      onClick: handleStartPause,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: RotateCcw,
      label: 'Reset',
      onClick: handleReset,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: Download,
      label: 'Export',
      onClick: handleExport,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="mb-4 space-y-3 animate-in slide-in-from-bottom duration-300">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-in slide-in-from-left duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-lg shadow-md">
                {action.label}
              </span>
              <button
                onClick={action.onClick}
                className={`w-12 h-12 ${action.color} rounded-full shadow-lg text-white flex items-center justify-center transition-transform hover:scale-110`}
              >
                <action.icon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 bg-linear-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl text-white flex items-center justify-center transition-transform hover:scale-110 ${isExpanded ? 'rotate-45' : ''}`}
      >
        <span className="text-2xl font-bold">{isExpanded ? '×' : '+'}</span>
      </button>
    </div>
  );
};

export default FloatingActions;
