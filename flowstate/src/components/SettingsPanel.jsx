import { Settings, Moon, Sun, Volume2, VolumeX, Keyboard } from 'lucide-react';
import { useState } from 'react';

/**
 * SettingsPanel - Customization panel for user preferences
 * Includes theme, sound, and notification settings
 */
const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light',
    soundEnabled: true,
    notificationsEnabled: true,
    flowThreshold: 75,
    breakReminders: true,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6 text-gray-700" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Panel */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Settings</h3>

            {/* Theme Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-gray-700" /> : <Sun className="w-5 h-5 text-gray-700" />}
                  <span className="font-medium text-gray-900">Theme</span>
                </div>
                <button
                  onClick={() => handleSettingChange('theme', settings.theme === 'light' ? 'dark' : 'light')}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'} relative`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-gray-700" /> : <VolumeX className="w-5 h-5 text-gray-700" />}
                  <span className="font-medium text-gray-900">Sounds</span>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.soundEnabled ? 'bg-purple-600' : 'bg-gray-300'} relative`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-gray-700" />
                  <span className="font-medium text-gray-900">Notifications</span>
                </div>
                <button
                  onClick={() => handleSettingChange('notificationsEnabled', !settings.notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-purple-600' : 'bg-gray-300'} relative`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>

              {/* Flow Threshold Slider */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="font-medium text-gray-900 block mb-2">
                  Flow Threshold: {settings.flowThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={settings.flowThreshold}
                  onChange={(e) => handleSettingChange('flowThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-6 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPanel;
