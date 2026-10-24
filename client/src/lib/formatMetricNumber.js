/** Display-only metric formatting shared by result cards and session history. */
const metricNumberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  useGrouping: false,
});

/** Return Western digits with at most two decimals, or null for unavailable evidence.
 * Never use this display string for scoring, thresholds or saved API values.
 */
export function formatMetricNumber(value) {
  return Number.isFinite(value) ? metricNumberFormatter.format(value) : null;
}
