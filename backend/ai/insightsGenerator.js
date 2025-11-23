/**
 * Insights Generator - CommonJS Version
 */

async function generateInsights(sessionData) {
  const {
    sessionDuration = 0,
    flowScore = 0,
    metrics = {},
  } = sessionData;

  const insights = [];
  
  const sessionMinutes = Math.floor(sessionDuration / 60);

  if (flowScore >= 80) {
    insights.push(`🔥 Exceptional performance! Flow score of ${flowScore} shows deep focus.`);
  } else if (flowScore >= 60) {
    insights.push(`✨ Good session with a flow score of ${flowScore}.`);
  } else if (flowScore >= 40) {
    insights.push(`📈 Moderate focus session. Flow score: ${flowScore}.`);
  } else {
    insights.push(`💡 Consider removing distractions to improve focus.`);
  }

  if (sessionMinutes > 60) {
    insights.push(`⏰ Long session (${sessionMinutes}min). Remember to take breaks!`);
  } else if (sessionMinutes < 15) {
    insights.push(`⚡ Short session. Try longer blocks for better flow.`);
  }

  if (metrics.stamina < 30) {
    insights.push(`🔋 Low stamina detected. Take a break before your next session.`);
  }

  if (metrics.attention < 40) {
    insights.push(`👁️ Attention drifting. Try a 5-minute walk or meditation.`);
  }

  return insights;
}

module.exports = {
  generateInsights,
};
