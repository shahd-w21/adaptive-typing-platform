// Teammate's weighted key drills, with explicit randomness and output validation.
export function keyWeight(row, targetWpm) {
  if (row.accuracy === null || row.avgMs === null) return 4;
  const target = 60000 / (5 * targetWpm);
  const weakness = 0.5 * Math.min(2, Math.max(0, (row.avgMs - target) / target))
    + 0.5 * Math.min(3, Math.max(0, ((100 - row.accuracy) / 100) / 0.03));
  return (1 + weakness) * (row.status === 'mastered' ? 0.5 : 1);
}
export function generatePracticeText(keys, random, wordCount = 20) {
  if (!keys.length || keys.some(item => item.key.length !== 1 || item.weight <= 0 || !Number.isFinite(item.weight))) throw new Error('No valid unlocked keys');
  const total = keys.reduce((sum, item) => sum + item.weight, 0);
  const pick = () => {
    let remaining = random() * total;
    for (const item of keys) { remaining -= item.weight; if (remaining <= 0) return item.key; }
    return keys.at(-1).key;
  };
  const text = Array.from({ length: wordCount }, () => Array.from({ length: 3 + Math.floor(random() * 3) }, pick).join('')).join(' ');
  const allowed = new Set([...keys.map(item => item.key), ' ']);
  if ([...text].some(char => !allowed.has(char))) throw new Error('Fallback contains locked characters');
  return text;
}
