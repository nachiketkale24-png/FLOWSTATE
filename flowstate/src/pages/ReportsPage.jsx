import React, { useState, useEffect, useMemo } from 'react';
import { useFlow } from '../context/FlowContext';
import { demoAnalytics } from '../demoData';
import { FileText, Download, TrendingUp, TrendingDown, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function ReportsPage() {
  const { metrics } = useFlow();

  // State
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Fetch weekly stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use demo data for offline mode
        setWeeklyStats({
          totalSessions: demoAnalytics.productivityMetrics.totalSessions,
          avgFlowTimePerSession: demoAnalytics.productivityMetrics.avgSessionLength,
          avgFlowScore: demoAnalytics.productivityMetrics.avgFlowScore,
          weeklyBreakdown: demoAnalytics.weeklyFlowTime,
        });
      } catch (err) {
        console.error('Failed to load demo stats:', err);
        setError('Failed to load report data');
        // Use mock data as final fallback
        setWeeklyStats(generateMockStats());
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Mock stats generator
  const generateMockStats = () => ({
    totalSessions: 12,
    avgFlowTimePerSession: 45,
    avgFlowScore: 78,
    totalDistractionsResisted: 156,
    totalFlowTime: 540,
    peakProductivityDay: 'Thursday',
    mostProductiveHour: '2-4 PM',
    weeklyBreakdown: [
      { day: 'Mon', flowMinutes: 85 },
      { day: 'Tue', flowMinutes: 120 },
      { day: 'Wed', flowMinutes: 95 },
      { day: 'Thu', flowMinutes: 140 },
      { day: 'Fri', flowMinutes: 110 },
      { day: 'Sat', flowMinutes: 75 },
      { day: 'Sun', flowMinutes: 60 },
    ],
  });

  // Calculate trends
  const trends = useMemo(() => {
    if (!weeklyStats) return null;
    
    return {
      flowDurationChange: 18,
      distractionChange: -12,
      flowScoreChange: 5,
      staminaChange: 8,
    };
  }, [weeklyStats]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    if (!weeklyStats) return [];
    
    const recs = [];
    
    recs.push({
      icon: '🕐',
      title: 'Protect Your Peak Hours',
      description: `Block out ${weeklyStats.mostProductiveHour} for deep work. This is when you achieve your highest flow scores.`,
      priority: 'high',
    });

    if (metrics.distractionEvents > 5) {
      recs.push({
        icon: '🚫',
        title: 'Minimize Distractions',
        description: "Don't check social media or messaging apps in the first 30 minutes of your session.",
        priority: 'high',
      });
    }

    recs.push({
      icon: '🎯',
      title: 'Consistent Schedule',
      description: `${weeklyStats.peakProductivityDay} is your most productive day. Try to schedule your hardest tasks then.`,
      priority: 'medium',
    });

    if (weeklyStats.avgFlowScore < 70) {
      recs.push({
        icon: '💪',
        title: 'Build Flow Stamina',
        description: 'Start with 25-minute focused sessions and gradually increase. Your stamina improves with consistency.',
        priority: 'high',
      });
    }

    recs.push({
      icon: '📊',
      title: 'Track Progress Weekly',
      description: 'Review your weekly report every Friday to identify patterns and adjust your strategy.',
      priority: 'medium',
    });

    return recs;
  }, [weeklyStats, metrics]);

  // Generate PDF report
  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);
    setReportGenerated(false);

    try {
      const response = await apiRequest(ENDPOINTS.ANALYTICS_REPORT || '/api/analytics/report', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'demo-user',
          weeklyStats,
          trends,
          recommendations,
        }),
      });

      if (response.success) {
        setReportGenerated(true);
        
        // If backend returns PDF URL or blob, download it
        if (response.data.reportUrl) {
          window.open(response.data.reportUrl, '_blank');
        } else if (response.data.pdfBlob) {
          // Handle blob download
          const blob = new Blob([response.data.pdfBlob], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `FlowState_Report_${new Date().toISOString().split('T')[0]}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          // Fallback: Generate simple HTML report
          generateHTMLReport();
        }
      } else {
        throw new Error(response.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Report generation failed:', err);
      setError('Backend unavailable - generating local report');
      // Fallback to local generation
      generateHTMLReport();
    } finally {
      setGenerating(false);
    }
  };

  // Fallback HTML report generator
  const generateHTMLReport = () => {
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FlowState Weekly Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #1a1a2e; color: #fff; }
          .header { text-align: center; margin-bottom: 40px; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
          .stat-card { background: #16213e; padding: 20px; border-radius: 10px; }
          .recommendations { margin-top: 40px; }
          .rec-item { background: #16213e; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FlowState Weekly Report</h1>
          <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <h3>Total Sessions</h3>
            <p style="font-size: 32px; font-weight: bold;">${weeklyStats?.totalSessions || 0}</p>
          </div>
          <div class="stat-card">
            <h3>Avg Flow Score</h3>
            <p style="font-size: 32px; font-weight: bold;">${weeklyStats?.avgFlowScore || 0}</p>
          </div>
          <div class="stat-card">
            <h3>Total Flow Time</h3>
            <p style="font-size: 32px; font-weight: bold;">${Math.floor((weeklyStats?.totalFlowTime || 0) / 60)}h</p>
          </div>
        </div>
        
        <div class="recommendations">
          <h2>Personalized Recommendations</h2>
          ${recommendations.map(rec => `
            <div class="rec-item">
              <h3>${rec.icon} ${rec.title}</h3>
              <p>${rec.description}</p>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FlowState_Report_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    setReportGenerated(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200/70">Loading report data...</p>
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 mb-2">
              Weekly Report
            </h1>
            <p className="text-purple-200/70 text-base md:text-lg">
              {error ? 'Using demo data - connect backend for real reports' : 'Your comprehensive productivity analysis'}
            </p>
          </div>

          {/* Error/Success Banners */}
          {error && (
            <div className="mb-6 glass-card p-4 rounded-xl border border-red-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {reportGenerated && (
            <div className="mb-6 glass-card p-4 rounded-xl border border-green-500/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm">Report generated successfully!</span>
            </div>
          )}

          {/* Generate Report Button */}
          <div className="mb-8">
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full md:w-auto px-8 py-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-bold text-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generate PDF Report
                  <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Weekly Overview */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Weekly Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-xl border border-purple-500/30">
                <div className="text-purple-300/70 text-sm mb-1">Total Sessions</div>
                <div className="text-3xl font-bold text-white">{weeklyStats?.totalSessions || 0}</div>
              </div>

              <div className="glass-card p-4 rounded-xl border border-cyan-500/30">
                <div className="text-purple-300/70 text-sm mb-1">Avg Flow Time</div>
                <div className="text-3xl font-bold text-cyan-400">{weeklyStats?.avgFlowTimePerSession || 0}m</div>
              </div>

              <div className="glass-card p-4 rounded-xl border border-pink-500/30">
                <div className="text-purple-300/70 text-sm mb-1">Avg Flow Score</div>
                <div className="text-3xl font-bold text-pink-400">{weeklyStats?.avgFlowScore || 0}</div>
              </div>

              <div className="glass-card p-4 rounded-xl border border-green-500/30">
                <div className="text-purple-300/70 text-sm mb-1">Distractions Blocked</div>
                <div className="text-3xl font-bold text-green-400">{weeklyStats?.totalDistractionsResisted || 0}</div>
              </div>
            </div>
          </div>

          {/* Performance Trends */}
          {trends && (
            <div className="glass-card p-6 rounded-2xl border border-purple-500/30 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Performance Trends</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-xl">
                  <div>
                    <div className="text-purple-200/70 text-sm mb-1">Flow Duration</div>
                    <div className="text-2xl font-bold text-white">vs Last Week</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trends.flowDurationChange > 0 ? (
                      <>
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">+{trends.flowDurationChange}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-6 h-6 text-red-400" />
                        <span className="text-2xl font-bold text-red-400">{trends.flowDurationChange}%</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-cyan-500/10 rounded-xl">
                  <div>
                    <div className="text-purple-200/70 text-sm mb-1">Distraction Rate</div>
                    <div className="text-2xl font-bold text-white">vs Last Week</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trends.distractionChange < 0 ? (
                      <>
                        <TrendingDown className="w-6 h-6 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">{trends.distractionChange}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-6 h-6 text-red-400" />
                        <span className="text-2xl font-bold text-red-400">+{trends.distractionChange}%</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-pink-500/10 rounded-xl">
                  <div>
                    <div className="text-purple-200/70 text-sm mb-1">Flow Score</div>
                    <div className="text-2xl font-bold text-white">vs Last Week</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trends.flowScoreChange > 0 ? (
                      <>
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">+{trends.flowScoreChange}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-6 h-6 text-red-400" />
                        <span className="text-2xl font-bold text-red-400">{trends.flowScoreChange}%</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl">
                  <div>
                    <div className="text-purple-200/70 text-sm mb-1">Stamina</div>
                    <div className="text-2xl font-bold text-white">vs Last Week</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trends.staminaChange > 0 ? (
                      <>
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">+{trends.staminaChange}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-6 h-6 text-red-400" />
                        <span className="text-2xl font-bold text-red-400">{trends.staminaChange}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personalized Recommendations */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">Personalized Recommendations</h2>
            
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                    rec.priority === 'high'
                      ? 'bg-pink-500/10 border-pink-500/30'
                      : 'bg-purple-500/10 border-purple-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{rec.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                        {rec.priority === 'high' && (
                          <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs font-bold rounded-full border border-pink-500/50">
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <p className="text-purple-200/70 text-sm">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
