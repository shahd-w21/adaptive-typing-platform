// Teammate's weighted key drills, with explicit randomness and output validation.
export function keyWeight(row, targetWpm) {
  if (row.accuracy === null || row.avgMs === null) return 4;
  const target = 60000 / (5 * targetWpm);
  const weakness = 0.5 * Math.min(2, Math.max(0, (row.avgMs - target) / target))
    + 0.5 * Math.min(3, Math.max(0, ((100 - row.accuracy) / 100) / 0.03));
  return (1 + weakness) * (row.status === 'mastered' ? 0.5 : 1);
}

/**
 * Generates a restricted weighted passage, explicit focus drills and one
 * coverage run of every key supplied by the caller.
 * @param {Array<{key: string, weight: number}>} keys Only keys eligible in this session.
 * @param {() => number} random Explicit random source in [0, 1).
 * @param {number} wordCount Number of weighted fallback words to generate.
 * @param {{focusKeys?: string[]}} options Unique eligible keys to repeat at least three times.
 * @returns {string} Space-separated text containing no key outside the eligible set.
 * @throws {Error} If the eligible or focus alphabets are invalid.
 */
export function generatePracticeText(keys, random, wordCount = 20, { focusKeys = [] } = {}) {
  if (!keys.length || keys.some(item => item.key.length !== 1 || item.weight <= 0 || !Number.isFinite(item.weight))) throw new Error('No valid unlocked keys');
  const allowedKeys = new Set(keys.map(item => item.key));
  if (focusKeys.some(key => !allowedKeys.has(key)) || new Set(focusKeys).size !== focusKeys.length) {
    throw new Error('Focus keys must be unique members of the allowed alphabet');
  }
  const total = keys.reduce((sum, item) => sum + item.weight, 0);
  const pick = () => {
    let remaining = random() * total;
    for (const item of keys) { remaining -= item.weight; if (remaining <= 0) return item.key; }
    return keys.at(-1).key;
  };
  const words = Array.from({ length: wordCount }, () => Array.from({ length: 3 + Math.floor(random() * 3) }, pick).join(''));
  // Focus drills guarantee useful repetition while the coverage word exposes
  // every currently unlocked key during each assignment.
  words.push(...focusKeys.map(key => key.repeat(3)));
  words.push(keys.map(item => item.key).join(''));
  const text = words.join(' ');
  const allowed = new Set([...allowedKeys, ' ']);
  if ([...text].some(char => !allowed.has(char))) throw new Error('Fallback contains locked characters');
  return text;
}

/**
 * Selects a small focus set with exploration and due-review slots before filling
 * the remaining slots by the same weakness weight used for text generation.
 * @param {Array<object>} keys Per-user keys already eligible for this assignment.
 * @param {number} targetWpm Captured learner target used for latency weakness.
 * @param {Array<object>} dueReviews Mastered keys whose captured review date is due.
 * @param {number} limit Maximum selected focus keys, normally four.
 * @returns {string[]} Unique key characters to reinforce in the assignment.
 */
export function selectPracticeFocus(keys, targetWpm, dueReviews = [], limit = 4) {
  const capacity = Math.max(1, Math.min(5, limit));
  const active = keys.filter(row => row.status === 'in_progress');
  const selected = [];
  const addKey = key => {
    if (selected.length < capacity && !selected.includes(key)) selected.push(key);
  };

  const leastSampled = [...active].sort((left, right) =>
    (left.attempts ?? 0) - (right.attempts ?? 0)
    || (left.latencySamples ?? 0) - (right.latencySamples ?? 0)
    || left.key.localeCompare(right.key));
  if (leastSampled.length) addKey(leastSampled[0].key);

  const mostOverdue = [...dueReviews].sort((left, right) =>
    (left.nextReviewAt?.getTime?.() ?? Date.parse(left.nextReviewAt ?? ''))
      - (right.nextReviewAt?.getTime?.() ?? Date.parse(right.nextReviewAt ?? ''))
    || left.key.localeCompare(right.key));
  if (mostOverdue.length) addKey(mostOverdue[0].key);

  const weakest = [...active].sort((left, right) =>
    keyWeight(right, targetWpm) - keyWeight(left, targetWpm)
    || (left.attempts ?? 0) - (right.attempts ?? 0)
    || left.key.localeCompare(right.key));
  for (const row of weakest) {
    if (selected.length >= capacity) break;
    addKey(row.key);
  }

  return selected;
}
