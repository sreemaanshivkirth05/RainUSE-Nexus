/**
 * RainUSE Nexus — Formatting Utilities
 */

/**
 * Format a number with commas.
 * e.g. 1234567 -> "1,234,567"
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '—';
  return num.toLocaleString('en-US');
}

/**
 * Format gallons with appropriate suffix.
 * e.g. 5724510 -> "5.72M gal"
 */
export function formatGallons(gallons) {
  if (gallons === null || gallons === undefined) return '—';
  if (gallons >= 1_000_000) return `${(gallons / 1_000_000).toFixed(2)}M gal`;
  if (gallons >= 1_000) return `${(gallons / 1_000).toFixed(1)}K gal`;
  return `${gallons} gal`;
}

/**
 * Format square feet.
 * e.g. 185000 -> "185,000 sqft"
 */
export function formatSqft(sqft) {
  if (sqft === null || sqft === undefined) return '—';
  return `${formatNumber(Math.round(sqft))} sqft`;
}

/**
 * Format rainfall inches.
 * e.g. 49.8 -> "49.8 in"
 */
export function formatRainfall(inches) {
  if (inches === null || inches === undefined) return '—';
  return `${inches.toFixed(1)} in`;
}

/**
 * Format a score as percentage.
 * e.g. 0.85 -> "85%"
 */
export function formatScorePercent(score) {
  if (score === null || score === undefined) return '—';
  return `${Math.round(score * 100)}%`;
}

/**
 * Get score tier label.
 */
export function getScoreTier(score) {
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 45) return 'Moderate';
  return 'Low';
}

/**
 * Get CSS class for score badge.
 */
export function getScoreClass(score) {
  if (score >= 70) return 'score-high';
  if (score >= 50) return 'score-medium';
  return 'score-low';
}

/**
 * Get CSS class for opportunity badge.
 */
export function getOpportunityClass(type) {
  switch (type) {
    case 'Cooling-Demand-Driven': return 'opp-cooling';
    case 'Rainfall-Driven': return 'opp-rainfall';
    case 'Resilience-Driven': return 'opp-resilience';
    case 'Balanced Opportunity': return 'opp-balanced';
    default: return 'opp-balanced';
  }
}

/**
 * Get icon emoji for opportunity type.
 */
export function getOpportunityIcon(type) {
  switch (type) {
    case 'Cooling-Demand-Driven': return '❄️';
    case 'Rainfall-Driven': return '🌧️';
    case 'Resilience-Driven': return '🛡️';
    case 'Balanced Opportunity': return '⚖️';
    default: return '📊';
  }
}

/**
 * Get color for score bar fill.
 */
export function getScoreColor(score) {
  if (score >= 0.7) return 'bg-emerald-500';
  if (score >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
}

/**
 * Get color for viability score.
 */
export function getViabilityColor(score) {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 45) return 'text-orange-400';
  return 'text-red-400';
}
