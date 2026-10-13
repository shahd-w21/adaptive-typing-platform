// Chooses the next activity and explains why (SYS-22).
function recommendNext({ placementDone, completedSessions, keys }) {
  if (!placementDone && completedSessions === 0) {
    return {
      activity: "placement",
      reason: "Find your starting level, or skip it and start at the home row.",
    };
  }

  const active = keys.filter((k) => k.status === "in_progress");
  if (active.length === 0) {
    return { activity: "timed", reason: "You have mastered every key. Try a timed test." };
  }

  const practiced = active.filter((k) => k.accuracy !== null);
  if (practiced.length === 0) {
    return {
      activity: "practice",
      reason: `Start practicing your new keys: ${active.map((k) => k.key_char).join(" ")}`,
    };
  }

  // Weakest key: lowest accuracy, then slowest
  practiced.sort(
    (a, b) => Number(a.accuracy) - Number(b.accuracy) || Number(b.avg_ms) - Number(a.avg_ms)
  );
  const weakest = practiced[0];
  return {
    activity: "practice",
    reason: `Your weakest key right now is "${weakest.key_char}" (${Math.round(Number(weakest.accuracy))}% accuracy).`,
    weakest_key: weakest.key_char,
  };
}

module.exports = { recommendNext };