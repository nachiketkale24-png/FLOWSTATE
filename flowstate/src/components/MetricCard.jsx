/**
 * MetricCard - ULTIMATE version with ALL visual effects combined
 * Features: Glass morphism, 3D float, neon glow, holographic borders, pulse animations
 */
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'purple',
  showProgress = false,
  index = 0 
}) => {
  // Color variants with neon and holographic effects
  const colorVariants = {
    purple: {
      iconBg: 'bg-purple-500/20 backdrop-blur-xl',
      iconColor: 'text-purple-400 neon-pink',
      progressBg: 'bg-linear-to-r from-purple-500 via-pink-500 to-purple-600',
      borderHover: 'hover:border-purple-400/50',
      glowColor: 'hover:shadow-purple-500/50',
      ringColor: 'bg-purple-500/30',
    },
    blue: {
      iconBg: 'bg-blue-500/20 backdrop-blur-xl',
      iconColor: 'text-blue-400 neon-blue',
      progressBg: 'bg-linear-to-r from-blue-500 via-cyan-500 to-blue-600',
      borderHover: 'hover:border-blue-400/50',
      glowColor: 'hover:shadow-blue-500/50',
      ringColor: 'bg-blue-500/30',
    },
    green: {
      iconBg: 'bg-green-500/20 backdrop-blur-xl',
      iconColor: 'text-green-400',
      progressBg: 'bg-linear-to-r from-green-500 via-emerald-500 to-green-600',
      borderHover: 'hover:border-green-400/50',
      glowColor: 'hover:shadow-green-500/50',
      ringColor: 'bg-green-500/30',
    },
    red: {
      iconBg: 'bg-red-500/20 backdrop-blur-xl',
      iconColor: 'text-red-400',
      progressBg: 'bg-linear-to-r from-red-500 via-rose-500 to-red-600',
      borderHover: 'hover:border-red-400/50',
      glowColor: 'hover:shadow-red-500/50',
      ringColor: 'bg-red-500/30',
    },
    yellow: {
      iconBg: 'bg-yellow-500/20 backdrop-blur-xl',
      iconColor: 'text-yellow-400',
      progressBg: 'bg-linear-to-r from-yellow-500 via-orange-500 to-yellow-600',
      borderHover: 'hover:border-yellow-400/50',
      glowColor: 'hover:shadow-yellow-500/50',
      ringColor: 'bg-yellow-500/30',
    },
    orange: {
      iconBg: 'bg-orange-500/20 backdrop-blur-xl',
      iconColor: 'text-orange-400',
      progressBg: 'bg-linear-to-r from-orange-500 via-red-500 to-orange-600',
      borderHover: 'hover:border-orange-400/50',
      glowColor: 'hover:shadow-orange-500/50',
      ringColor: 'bg-orange-500/30',
    },
    cyan: {
      iconBg: 'bg-cyan-500/20 backdrop-blur-xl',
      iconColor: 'text-cyan-400',
      progressBg: 'bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-600',
      borderHover: 'hover:border-cyan-400/50',
      glowColor: 'hover:shadow-cyan-500/50',
      ringColor: 'bg-cyan-500/30',
    },
    indigo: {
      iconBg: 'bg-indigo-500/20 backdrop-blur-xl',
      iconColor: 'text-indigo-400',
      progressBg: 'bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-600',
      borderHover: 'hover:border-indigo-400/50',
      glowColor: 'hover:shadow-indigo-500/50',
      ringColor: 'bg-indigo-500/30',
    },
  };

  const theme = colorVariants[color] || colorVariants.purple;

  return (
    <div 
      className={`group relative glass-card rounded-2xl border border-white/20 shadow-xl ${theme.glowColor} ${theme.borderHover} hover:shadow-2xl transition-all duration-500 p-6 transform-3d float-animation hover:scale-105 hover:-translate-y-2 stagger-animation overflow-hidden`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Holographic Background Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 holographic rounded-2xl"></div>
      
      {/* Pulse Rings on Hover */}
      <div className={`absolute inset-0 ${theme.ringColor} rounded-2xl opacity-0 group-hover:opacity-100 pulse-ring`}></div>
      <div className={`absolute inset-0 ${theme.ringColor} rounded-2xl opacity-0 group-hover:opacity-100 pulse-ring`} style={{ animationDelay: '0.3s' }}></div>

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

      {/* Icon Section with 3D Float */}
      <div className="relative flex items-start justify-between mb-6">
        <div className={`relative p-4 rounded-xl ${theme.iconBg} border border-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          {/* Neon Glow Ring Behind Icon */}
          <div className={`absolute inset-0 ${theme.ringColor} rounded-xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300`}></div>
          {Icon && <Icon className={`relative w-7 h-7 ${theme.iconColor} drop-shadow-lg`} />}
        </div>
      </div>

      {/* Value Section with Animated Counter */}
      <div className="relative space-y-2 mb-4">
        <div className="text-4xl font-bold text-white tracking-tight drop-shadow-lg glow-pulse">
          {value}
        </div>
        <div className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-white/60 italic">
            {subtitle}
          </div>
        )}
      </div>

      {/* Progress Bar with Liquid Gradient */}
      {showProgress && typeof value === 'number' && (
        <div className="relative w-full bg-white/10 backdrop-blur-sm rounded-full h-2.5 overflow-hidden border border-white/20">
          {/* Animated Shimmer Effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-[wave_2s_ease-in-out_infinite]"></div>
          
          {/* Progress Fill */}
          <div
            className={`relative ${theme.progressBg} h-2.5 rounded-full transition-all duration-700 ease-out shadow-lg`}
            style={{ width: `${Math.min(100, Math.max(0, isNaN(value) ? 0 : value))}%` }}
          >
            {/* Glowing Edge */}
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-sm"></div>
          </div>
        </div>
      )}

      {/* Bottom Accent Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${theme.progressBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
};

export default MetricCard;
