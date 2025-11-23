import { useFlow } from '../context/FlowContext';

/**
 * NavbarStatusBar - Top navigation bar with app title and status badge
 * Displays current flow state with color-coded indicators
 */
const NavbarStatusBar = () => {
  const { flowState } = useFlow();

  // Status configuration with colors and styles for dark theme
  const statusConfig = {
    IDLE: {
      label: 'IDLE',
      dotColor: 'bg-gray-400',
      textColor: 'text-gray-300',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
    },
    MONITORING: {
      label: 'MONITORING',
      dotColor: 'bg-blue-400',
      textColor: 'text-blue-300 neon-blue',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    FLOW: {
      label: 'FLOW',
      dotColor: 'bg-purple-400',
      textColor: 'text-purple-300 neon-pink',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/50',
    },
  };

  const status = statusConfig[flowState] || statusConfig.IDLE;

  return (
    <nav className="sticky top-0 z-50 glass-card-dark backdrop-blur-2xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* App Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 glow-pulse">
              <span className="text-white text-2xl font-bold neon-pink">F</span>
              {/* Pulse Ring */}
              <div className="absolute inset-0 bg-purple-500/30 rounded-xl pulse-ring"></div>
            </div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent neon-pink">
              FlowState AI
            </h1>
          </div>

          {/* Status Badge */}
          <div
            className={`relative flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-xl transition-all duration-300 ${status.bgColor} ${status.borderColor} ${
              flowState === 'FLOW' ? 'shadow-2xl shadow-purple-500/50 glow-pulse' : 'shadow-lg'
            }`}
          >
            {/* Holographic background on FLOW */}
            {flowState === 'FLOW' && (
              <div className="absolute inset-0 holographic opacity-20 rounded-full"></div>
            )}
            
            <div className={`relative w-2.5 h-2.5 rounded-full ${status.dotColor} animate-pulse`}>
              {/* Glow ring */}
              <div className={`absolute inset-0 ${status.dotColor} rounded-full blur-sm animate-ping`}></div>
            </div>
            <span className={`relative text-sm font-bold tracking-wider ${status.textColor}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarStatusBar;
