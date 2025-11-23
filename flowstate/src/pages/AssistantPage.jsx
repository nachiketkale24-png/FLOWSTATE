import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, TrendingUp, Clock, Zap, AlertCircle } from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { demoAnalytics, demoSessions, getDemoAssistantResponse, DEMO_MODE } from '../demoData';
import { logger } from '../utils/logger';

export default function AssistantPage() {
  const { 
    metrics, 
    sessionDuration, 
    flowState,
  } = useFlow();

  const [todayStats, setTodayStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "👋 Hey there! I'm your FlowState AI assistant. I can help you optimize your productivity, analyze your focus patterns, and give personalized recommendations. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load real data on mount
  useEffect(() => {
    loadTodayStats();
    loadRecentSessions();
  }, []);

  const loadTodayStats = async () => {
    try {
      logger.info('AssistantPage', 'Loading demo user stats');
      
      // Use demo analytics for offline mode
      const stats = {
        totalSessions: demoAnalytics.productivityMetrics.totalSessions,
        avgFlowScore: demoAnalytics.productivityMetrics.avgFlowScore,
        totalTime: demoAnalytics.productivityMetrics.totalFlowTime * 60, // convert to seconds
        currentStreak: demoAnalytics.productivityMetrics.currentStreak
      };
      
      setTodayStats(stats);
      logger.event('AssistantPage', 'Demo stats loaded', stats);
    } catch (error) {
      logger.error('AssistantPage', 'Failed to load demo stats', error);
      setTodayStats({ totalSessions: 0, avgFlowScore: 0, totalTime: 0, currentStreak: 0 });
    }
  };

  const loadRecentSessions = async () => {
    try {
      logger.info('AssistantPage', 'Loading demo recent sessions');
      
      // Use demo sessions for offline mode
      const sessions = demoSessions.slice(-3); // Last 3 sessions
      setRecentSessions(sessions);
      logger.event('AssistantPage', 'Demo recent sessions loaded', { count: sessions.length });
    } catch (error) {
      logger.error('AssistantPage', 'Failed to load demo sessions', error);
      setRecentSessions([]);
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Calculate session stats from real data
  const isActive = flowState !== 'IDLE';
  const totalSessions = todayStats?.totalSessions || 0;
  const avgFlowScore = Math.round(todayStats?.avgFlowScore || metrics.flowScore || 0);
  const totalMinutes = Math.round((todayStats?.totalTime || sessionDuration) / 60);
  const bestFlowScore = recentSessions.length > 0 
    ? Math.max(...recentSessions.map(s => s.flowScore || 0)) 
    : metrics.flowScore;

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    logger.event('AssistantPage', 'User sent message', { message: inputValue.trim() });

    try {
      // Use demo assistant response for offline mode
      const response = getDemoAssistantResponse(userMessage.content);

      // Simulate typing animation
      await new Promise(resolve => setTimeout(resolve, 800));

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        suggestions: [], // Demo mode doesn't have suggestions
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      logger.event('AssistantPage', 'Demo AI response provided');
    } catch (err) {
      logger.error('AssistantPage', 'Demo chat error', err);
      setError('Demo mode: Using offline responses.');
      
      // Fallback local response
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm running in demo mode! Ask me about your flow scores, productivity tips, or session analytics.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    "How's my flow today?",
    "Tips to improve focus",
    "Analyze my session",
    "Best time to work",
  ];

  const handleQuickAction = (action) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]"></div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8 h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-cyan-400 mb-2">
              AI Assistant
            </h1>
            <p className="text-purple-200/70 text-sm md:text-base">
              Your personal productivity coach powered by AI
            </p>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-0">
            {/* Left Sidebar - Session Stats */}
            <div className="lg:col-span-1 space-y-4">
              {/* Current Status */}
              <div className="glass-card p-4 rounded-xl border border-purple-500/30">
                <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Current Session
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-purple-300/60 mb-1">Status</div>
                    <div className={`text-sm font-bold ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                      {isActive ? '🟢 Active' : '⚫ Idle'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-300/60 mb-1">Flow Score</div>
                    <div className="text-2xl font-black text-cyan-400">
                      {metrics.flowScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-300/60 mb-1">Duration</div>
                    <div className="text-sm font-semibold text-white">
                      {totalMinutes}m
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-300/60 mb-1">Flow State</div>
                    <div className="text-sm font-semibold text-purple-300">
                      {flowState}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Stats */}
              <div className="glass-card p-4 rounded-xl border border-purple-500/30">
                <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Overall Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300/60">Total Sessions</span>
                    <span className="text-sm font-bold text-white">{totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300/60">Avg Flow Score</span>
                    <span className="text-sm font-bold text-cyan-400">{avgFlowScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300/60">Best Streak</span>
                    <span className="text-sm font-bold text-green-400">{bestFlowScore}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-4 rounded-xl border border-purple-500/30 hidden lg:block">
                <h3 className="text-sm font-semibold text-purple-300 mb-3">Quick Ask</h3>
                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action)}
                      className="w-full text-left px-3 py-2 text-xs bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-purple-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3 glass-card rounded-xl border border-purple-500/30 flex flex-col min-h-0">
              {/* Error Banner */}
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-300">{error}</span>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'assistant' 
                        ? 'bg-linear-to-br from-purple-500 to-cyan-500' 
                        : 'bg-linear-to-br from-pink-500 to-orange-500'
                    }`}>
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                      <div className={`inline-block max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl ${
                        message.role === 'assistant'
                          ? 'bg-purple-500/10 border border-purple-500/20'
                          : 'bg-cyan-500/10 border border-cyan-500/20'
                      }`}>
                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        
                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-purple-500/20 space-y-2">
                            <p className="text-xs text-purple-300/60 font-semibold">Suggestions:</p>
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleQuickAction(suggestion)}
                                className="block w-full text-left px-3 py-1.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-purple-200 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-purple-300/40 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-purple-500/20">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your productivity..."
                    disabled={isTyping}
                    className="flex-1 bg-gray-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-400/40 outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="px-4 py-3 bg-linear-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden md:inline">Send</span>
                  </button>
                </div>

                {/* Mobile Quick Actions */}
                <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden pb-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action)}
                      className="shrink-0 px-3 py-1.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-purple-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
