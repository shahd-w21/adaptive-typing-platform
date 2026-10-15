export function localDate(date, timezone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function previousDate(day) { return new Date(Date.parse(`${day}T00:00:00Z`) - 86400000).toISOString().slice(0, 10); }
export function nextStreak(user, today) {
  if (user.lastPracticeDate === today) return user.streak;
  return user.lastPracticeDate === previousDate(today) ? user.streak + 1 : 1;
}
export function rewards(score, user, rules, now) {
  const xpEarned = score.metrics.activeDurationMs >= rules.minimumRewardMs ? Math.floor(score.finalCorrect * score.metrics.rawAccuracy / 100) : 0;
  const xp = user.xp + xpEarned;
  const today = localDate(now, user.timezone);
  return { xpEarned, xp, level: Math.floor(xp / rules.xpPerLevel) + 1, streak: xpEarned ? nextStreak(user, today) : user.streak, today };
}
