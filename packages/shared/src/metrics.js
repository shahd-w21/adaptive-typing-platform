export function calculateMetrics({ inserts, correctInserts, bufferLength, finalCorrect, activeDurationMs }) {
  const minutes = activeDurationMs / 60000;
  const grossWpm = minutes > 0 ? bufferLength / 5 / minutes : null;
  return {
    grossWpm,
    netWpm: minutes > 0 ? Math.max(0, grossWpm - (bufferLength - finalCorrect) / minutes) : null,
    rawAccuracy: inserts > 0 ? 100 * correctInserts / inserts : null,
    finalAccuracy: bufferLength > 0 ? 100 * finalCorrect / bufferLength : null,
    activeDurationMs,
  };
}
