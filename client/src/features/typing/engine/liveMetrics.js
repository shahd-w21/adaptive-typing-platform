/**
 * TypeFlow Live & Provisional Metrics Calculator
 * Conforms to SRS Section 8.2 & DESIGN.md Section 8.1
 */
import { calculateMetrics } from '@typeflow/shared';

export function computeLiveMetrics({
  totalInserts,
  correctInserts,
  bufferLength,
  finalCorrect,
  activeDurationMs,
}) {
  const metrics = calculateMetrics({
    inserts: totalInserts,
    correctInserts,
    bufferLength,
    finalCorrect,
    activeDurationMs,
  });
  const grossWpm =
    metrics.grossWpm === null ? null : Math.round(metrics.grossWpm);
  const rawAccuracy =
    metrics.rawAccuracy === null
      ? null
      : Math.round(metrics.rawAccuracy * 10) / 10;

  return {
    ...metrics,
    grossWpm,
    rawAccuracy,
    formattedGrossWpm: grossWpm === null ? null : String(grossWpm),
    formattedRawAccuracy:
      rawAccuracy === null ? null : `${Math.round(rawAccuracy)}%`,
  };
}

/** Calculate a display-only fixture result; the server owns official scoring. */
export function computeFixtureResults({
  totalInserts,
  correctInserts,
  buffer,
  assignedText,
  activeDurationMs,
}) {
  const B = buffer.length;

  // Count correct characters in final buffer F
  let F = 0;
  for (let i = 0; i < B; i++) {
    if (buffer[i] === assignedText[i]) {
      F++;
    }
  }
  const U = B - F;
  const metrics = calculateMetrics({
    inserts: totalInserts,
    correctInserts,
    bufferLength: B,
    finalCorrect: F,
    activeDurationMs,
  });

  return {
    netWpm:
      metrics.netWpm === null ? null : Math.round(metrics.netWpm),
    grossWpm:
      metrics.grossWpm === null ? null : Math.round(metrics.grossWpm),
    rawAccuracy:
      metrics.rawAccuracy === null
        ? null
        : Math.round(metrics.rawAccuracy * 10) / 10,
    finalAccuracy:
      metrics.finalAccuracy === null
        ? null
        : Math.round(metrics.finalAccuracy * 10) / 10,
    totalInserts,
    correctInserts,
    uncorrectedErrors: U,
    durationMs: metrics.activeDurationMs,
  };
}
