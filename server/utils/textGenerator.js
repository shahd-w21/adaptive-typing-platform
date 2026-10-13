// How often a key should appear: weaker keys get a higher weight
function keyWeight(row) {
  const accuracy = row.accuracy === null ? 70 : Number(row.accuracy);
  const avgMs = row.avg_ms === null ? 300 : Number(row.avg_ms);
  let weight = 1 + (100 - accuracy) / 10 + Math.min(avgMs, 900) / 300;
  if (row.status === "mastered") weight *= 0.5; // mastered keys appear less
  return weight;
}

function pickKey(keys, total) {
  let r = Math.random() * total;
  for (const k of keys) {
    r -= k.weight;
    if (r <= 0) return k.key;
  }
  return keys[keys.length - 1].key;
}

// keys: [{ key: "a", weight: 2.5 }, ...] (unlocked keys only)
function generatePracticeText(keys, wordCount = 20) {
  const total = keys.reduce((sum, k) => sum + k.weight, 0);
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    const len = 3 + Math.floor(Math.random() * 3);
    let word = "";
    for (let j = 0; j < len; j++) word += pickKey(keys, total);
    words.push(word);
  }
  return words.join(" ");
}

module.exports = { generatePracticeText, keyWeight };