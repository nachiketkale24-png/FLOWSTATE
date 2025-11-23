// src/components/WebcamControls.jsx
import React from 'react';
import { Camera, CameraOff, Loader2, AlertTriangle } from 'lucide-react';
import { useFlow } from '../context/FlowContext';

export default function WebcamControls() {
  const { 
    webcamEnabled, 
    webcamStatus, 
    toggleWebcam,
    metrics 
  } = useFlow();

  const getStatusColor = () => {
    if (webcamStatus === 'active') return 'text-green-400';
    if (webcamStatus === 'error') return 'text-red-400';
    if (webcamStatus === 'loading') return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusIcon = () => {
    if (webcamStatus === 'loading') {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (webcamStatus === 'error') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return webcamEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />;
  };

  const getStatusText = () => {
    switch (webcamStatus) {
      case 'active': return 'AI Detection Active';
      case 'loading': return 'Loading Camera...';
      case 'error': return 'Camera Error';
      default: return 'Enable AI Detection';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`${getStatusColor()} transition-colors`}>
            {getStatusIcon()}
          </div>
          <span className="text-sm font-medium text-gray-200">{getStatusText()}</span>
        </div>
        
        <button
          onClick={toggleWebcam}
          disabled={webcamStatus === 'loading'}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            webcamEnabled
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {webcamEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      {webcamEnabled && webcamStatus === 'active' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Attention Score</span>
            <span className={`font-mono ${
              metrics.attentionScore >= 80 ? 'text-green-400' :
              metrics.attentionScore >= 60 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {metrics.attentionScore}%
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.attentionScore >= 80 ? 'bg-green-400' :
                metrics.attentionScore >= 60 ? 'bg-yellow-400' :
                'bg-red-400'
              }`}
              style={{ width: `${metrics.attentionScore}%` }}
            />
          </div>

          {metrics.faceNotDetectedSeconds > 0 && (
            <p className="text-xs text-red-400 mt-2">
              ⚠️ Face not detected for {metrics.faceNotDetectedSeconds}s
            </p>
          )}
          
          {metrics.lookingAwaySeconds > 0 && (
            <p className="text-xs text-yellow-400 mt-1">
              👀 Looking away for {metrics.lookingAwaySeconds}s
            </p>
          )}
        </div>
      )}

      {webcamStatus === 'error' && (
        <p className="text-xs text-red-400 mt-2">
          Unable to access camera. Please check permissions.
        </p>
      )}
    </div>
  );
}
