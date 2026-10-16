/**
 * TypeFlow Live & Provisional Metrics Calculator
 * Conforms to SRS Section 8.2 & DESIGN.md Section 8.1
 */

export function computeLiveMetrics({
  totalInserts,
  correctInserts,
  bufferLength,
  activeDurationMs,
}) {
  // If no printable inserts yet or no elapsed time, return provisional defaults
  if (!totalInserts || activeDurationMs <= 0) {
    return {
      grossWpm: 0,
      rawAccuracy: 100,
      formattedGrossWpm: '0',
      formattedRawAccuracy: '100%',
    };
  }

  const activeMinutes = activeDurationMs / 60000;

  // Gross WPM = (Buffer Length / 5) / Active Minutes
  const grossWpm = activeMinutes > 0 ? (bufferLength / 5) / activeMinutes : 0;

  // Raw Accuracy = 100 * (Correct Inserts / Total Inserts)
  const rawAccuracy = totalInserts > 0 ? (100 * correctInserts) / totalInserts : 100;

  return {
    grossWpm: Math.round(grossWpm),
    rawAccuracy: Math.round(rawAccuracy * 10) / 10,
    formattedGrossWpm: String(Math.round(grossWpm)),
    formattedRawAccuracy: `${Math.round(rawAccuracy)}%`,
  };
}

export function computeOfficialResults({
  totalInserts,
  correctInserts,
  buffer,
  assignedText,
  activeDurationMs,
}) {
  const activeMinutes = Math.max(0.001, activeDurationMs / 60000);
  const B = buffer.length;
  
  // Count correct characters in final buffer F
  let F = 0;
  for (let i = 0; i < B; i++) {
    if (buffer[i] === assignedText[i]) {
      F++;
    }
  }
  const U = B - F;

  const grossWpm = (B / 5) / activeMinutes;
  const netWpm = Math.max(0, grossWpm - (U / activeMinutes));
  const rawAccuracy = totalInserts > 0 ? (100 * correctInserts) / totalInserts : 100;
  const finalAccuracy = B > 0 ? (100 * F) / B : 100;

  return {
    netWpm: Math.round(netWpm),
    grossWpm: Math.round(grossWpm),
    rawAccuracy: Math.round(rawAccuracy * 10) / 10,
    finalAccuracy: Math.round(finalAccuracy * 10) / 10,
    totalInserts,
    correctInserts,
    uncorrectedErrors: U,
    durationMs: activeDurationMs,
  };
}
