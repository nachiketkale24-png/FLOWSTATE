import { useFlow } from '../context/FlowContext';

/**
 * FlowBanner - Animated banner displayed when user enters flow state
 * Shows elegant gradient with pulse animation and focus duration
 */
const FlowBanner = () => {
  const { flowState, metrics } = useFlow();

  // Only render when in FLOW state
  if (flowState !== 'FLOW') return null;

  // Calculate flow duration in minutes
  const flowMinutes = Math.floor(metrics.flowDuration / 60);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-8">
      <div className="relative overflow-hidden glass-card rounded-3xl shadow-2xl shadow-purple-500/50 glow-pulse">
        {/* Holographic animated background */}
        <div className="absolute inset-0 holographic opacity-30"></div>
        
        {/* Flowing wave effect */}
        <div className="absolute inset-0 bg-linear-to-r from-purple-600/0 via-pink-500/20 to-blue-600/0 animate-[wave_3s_ease-in-out_infinite]"></div>
        
        {/* Pulse Rings */}
        <div className="absolute inset-0 bg-purple-500/20 pulse-ring"></div>
        <div className="absolute inset-0 bg-pink-500/20 pulse-ring" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute inset-0 bg-blue-500/20 pulse-ring" style={{ animationDelay: '1s' }}></div>
        
        {/* Content */}
        <div className="relative px-8 py-6">
          <div className="flex items-center gap-4">
            {/* Wave Icon */}
            <div className="text-6xl animate-bounce float-animation">
              🌊
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white mb-1 drop-shadow-2xl neon-pink">
                Flow State Active
              </h3>
              <p className="text-purple-100 text-sm font-medium">
                You've been in deep focus for{' '}
                <span className="font-bold text-white neon-blue">
                  {flowMinutes} {flowMinutes === 1 ? 'minute' : 'minutes'}
                </span>
              </p>
            </div>

            {/* Floating particles with 3D effect */}
            <div className="hidden md:flex items-center gap-4">
              <div className="w-4 h-4 bg-white/50 rounded-full animate-ping float-animation"></div>
              <div className="w-3 h-3 bg-pink-400/60 rounded-full animate-pulse float-animation" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-5 h-5 bg-blue-400/40 rounded-full animate-ping float-animation" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
        </div>

        {/* Bottom holographic accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 holographic"></div>
      </div>
    </div>
  );
};

export default FlowBanner;
