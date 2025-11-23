import { Shield, X } from 'lucide-react';
import { useFlow } from '../context/FlowContext';

/**
 * BlockOverlay - Apple-style modal for distraction blocking
 * Full-screen overlay with elegant animations and clear action buttons
 */
const BlockOverlay = () => {
  const { showBlockOverlay, setShowBlockOverlay, blockedSite, metrics } = useFlow();

  if (!showBlockOverlay) return null;

  const flowMinutes = Math.floor(metrics.flowDuration / 60);

  const handleReturnToFlow = () => {
    setShowBlockOverlay(false);
  };

  const handleTakeBreak = () => {
    setShowBlockOverlay(false);
    // Break mode logic can be added here
  };

  const handleOverride = () => {
    setShowBlockOverlay(false);
    // Override tracking logic can be added here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleReturnToFlow}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleReturnToFlow}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Shield className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            You're in Flow
          </h2>
          
          <p className="text-gray-600 text-base leading-relaxed">
            You've been focused for{' '}
            <span className="font-semibold text-purple-600">
              {flowMinutes} {flowMinutes === 1 ? 'minute' : 'minutes'}
            </span>
          </p>

          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
            <p className="text-red-800 text-sm font-medium">
              Opening{' '}
              <span className="font-bold">
                {blockedSite || 'this site'}
              </span>
              {' '}will break your flow
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary: Return to Flow */}
          <button
            onClick={handleReturnToFlow}
            className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            ✓ Return to Flow
          </button>

          {/* Secondary: Take a Break */}
          <button
            onClick={handleTakeBreak}
            className="w-full bg-blue-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg hover:bg-blue-600 hover:scale-[1.02] transition-all duration-200"
          >
            Take a Break
          </button>

          {/* Tertiary: Override */}
          <button
            onClick={handleOverride}
            className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
          >
            Override (Not Recommended)
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockOverlay;
