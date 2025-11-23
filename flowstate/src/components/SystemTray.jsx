import { useFlow } from '../context/FlowContext';

const SystemTray = () => {
  const { flowState } = useFlow();

  const getStatusConfig = (state) => {
    switch (state) {
      case 'IDLE':
        return {
          label: 'IDLE',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          dotColor: 'bg-gray-400',
        };
      case 'MONITORING':
        return {
          label: 'MONITORING',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          dotColor: 'bg-blue-500',
        };
      case 'FLOW':
        return {
          label: 'FLOW',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-600',
          dotColor: 'bg-purple-500',
        };
      default:
        return {
          label: 'IDLE',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          dotColor: 'bg-gray-400',
        };
    }
  };

  const status = getStatusConfig(flowState);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          FlowState AI
        </div>
      </div>

      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bgColor}`}
      >
        <div className={`w-2 h-2 rounded-full ${status.dotColor} animate-pulse`}></div>
        <span className={`text-sm font-semibold ${status.textColor}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
};

export default SystemTray;
