import React, { useState, useEffect } from 'react';
import { demoUser } from '../demoData';
import { Save, User, Sliders, Shield, Bell, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  // State for all settings
  const [settings, setSettings] = useState(() => {
    // Load from localStorage or use demo defaults
    const saved = localStorage.getItem('demoSettings');
    return saved ? JSON.parse(saved) : {
      // Personal Details
      username: demoUser.name,
      email: demoUser.email,
      timezone: 'UTC',
      
      // Flow Thresholds
      flowScoreThreshold: 70,
      staminaThreshold: 60,
      typingCadenceMin: 50,
      typingCadenceMax: 110,
      
      // Distraction Blocking
      blockingEnabled: true,
      blockSocialMedia: true,
      blockVideo: true,
      blockMessaging: false,
      blockGaming: true,
      customBlockedSites: '',
      
      // Notifications
      sessionStartNotification: true,
      flowStateNotification: true,
      distractionAlert: true,
      dailyReport: true,
      weeklyReport: true,
    };
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        // Demo mode: settings are already loaded from localStorage in useState
        // No API call needed
      } catch (err) {
        console.error('Failed to load demo settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input changes
  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  // Save settings to localStorage
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Demo mode: save to localStorage
      localStorage.setItem('demoSettings', JSON.stringify(settings));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200/70">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden pb-24 md:pb-8">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]"></div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400 mb-2">
              Settings
            </h1>
            <p className="text-purple-200/70 text-base md:text-lg">
              Customize your FlowState experience
            </p>
          </div>

          {/* Status Banners */}
          {error && (
            <div className="mb-6 glass-card p-4 rounded-xl border border-red-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 glass-card p-4 rounded-xl border border-green-500/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm">Settings saved successfully!</span>
            </div>
          )}

          {/* Settings Sections */}
          <div className="space-y-6">
            
            {/* Personal Details */}
            <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Personal Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-purple-200/70 text-sm mb-2">Username</label>
                  <input
                    type="text"
                    value={settings.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/40 outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-purple-200/70 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/40 outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-purple-200/70 text-sm mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-xl text-white outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Kolkata">India</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Flow Thresholds */}
            <div className="glass-card p-6 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center gap-3 mb-6">
                <Sliders className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Flow Thresholds</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-purple-200/70 text-sm">Flow Score Threshold</label>
                    <span className="text-cyan-400 font-bold">{settings.flowScoreThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={settings.flowScoreThreshold}
                    onChange={(e) => handleChange('flowScoreThreshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <p className="text-purple-300/50 text-xs mt-1">Minimum score to enter flow state</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-purple-200/70 text-sm">Stamina Threshold</label>
                    <span className="text-cyan-400 font-bold">{settings.staminaThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={settings.staminaThreshold}
                    onChange={(e) => handleChange('staminaThreshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <p className="text-purple-300/50 text-xs mt-1">Target stamina for sustained focus</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-200/70 text-sm mb-2">Min Typing Speed (WPM)</label>
                    <input
                      type="number"
                      min="30"
                      max="150"
                      value={settings.typingCadenceMin}
                      onChange={(e) => handleChange('typingCadenceMin', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-xl text-white outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-purple-200/70 text-sm mb-2">Max Typing Speed (WPM)</label>
                    <input
                      type="number"
                      min="30"
                      max="150"
                      value={settings.typingCadenceMax}
                      onChange={(e) => handleChange('typingCadenceMax', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-xl text-white outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Distraction Blocking */}
            <div className="glass-card p-6 rounded-2xl border border-pink-500/30">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-pink-400" />
                <h2 className="text-2xl font-bold text-white">Distraction Blocking</h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                  <span className="text-purple-200">Enable Blocking</span>
                  <input
                    type="checkbox"
                    checked={settings.blockingEnabled}
                    onChange={(e) => handleChange('blockingEnabled', e.target.checked)}
                    className="w-5 h-5 accent-pink-400"
                  />
                </label>

                <div className={`space-y-3 ${!settings.blockingEnabled && 'opacity-50 pointer-events-none'}`}>
                  <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                    <span className="text-purple-200">Block Social Media</span>
                    <input
                      type="checkbox"
                      checked={settings.blockSocialMedia}
                      onChange={(e) => handleChange('blockSocialMedia', e.target.checked)}
                      className="w-5 h-5 accent-pink-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                    <span className="text-purple-200">Block Video Sites</span>
                    <input
                      type="checkbox"
                      checked={settings.blockVideo}
                      onChange={(e) => handleChange('blockVideo', e.target.checked)}
                      className="w-5 h-5 accent-pink-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                    <span className="text-purple-200">Block Messaging Apps</span>
                    <input
                      type="checkbox"
                      checked={settings.blockMessaging}
                      onChange={(e) => handleChange('blockMessaging', e.target.checked)}
                      className="w-5 h-5 accent-pink-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                    <span className="text-purple-200">Block Gaming Sites</span>
                    <input
                      type="checkbox"
                      checked={settings.blockGaming}
                      onChange={(e) => handleChange('blockGaming', e.target.checked)}
                      className="w-5 h-5 accent-pink-400"
                    />
                  </label>

                  <div>
                    <label className="block text-purple-200/70 text-sm mb-2">Custom Blocked Sites (comma-separated)</label>
                    <textarea
                      value={settings.customBlockedSites}
                      onChange={(e) => handleChange('customBlockedSites', e.target.value)}
                      placeholder="reddit.com, news.ycombinator.com, twitter.com"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-pink-500/30 rounded-xl text-white placeholder-purple-400/40 outline-none focus:border-pink-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-card p-6 rounded-2xl border border-green-500/30">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                  <div>
                    <div className="text-purple-200">Session Start</div>
                    <div className="text-purple-300/50 text-xs">Notify when you start a new session</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sessionStartNotification}
                    onChange={(e) => handleChange('sessionStartNotification', e.target.checked)}
                    className="w-5 h-5 accent-green-400"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                  <div>
                    <div className="text-purple-200">Flow State Entered</div>
                    <div className="text-purple-300/50 text-xs">Alert when you enter flow state</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.flowStateNotification}
                    onChange={(e) => handleChange('flowStateNotification', e.target.checked)}
                    className="w-5 h-5 accent-green-400"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                  <div>
                    <div className="text-purple-200">Distraction Alerts</div>
                    <div className="text-purple-300/50 text-xs">Warn when distraction sites are blocked</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.distractionAlert}
                    onChange={(e) => handleChange('distractionAlert', e.target.checked)}
                    className="w-5 h-5 accent-green-400"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                  <div>
                    <div className="text-purple-200">Daily Report</div>
                    <div className="text-purple-300/50 text-xs">Email daily summary at end of day</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dailyReport}
                    onChange={(e) => handleChange('dailyReport', e.target.checked)}
                    className="w-5 h-5 accent-green-400"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl cursor-pointer hover:bg-gray-900/50 transition-colors">
                  <div>
                    <div className="text-purple-200">Weekly Report</div>
                    <div className="text-purple-300/50 text-xs">Email comprehensive weekly analysis</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.weeklyReport}
                    onChange={(e) => handleChange('weeklyReport', e.target.checked)}
                    className="w-5 h-5 accent-green-400"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-bold text-lg transition-all disabled:cursor-not-allowed flex items-center gap-3"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
