export function publicUser(user) {
  return {
    id: user.id, email: user.email, name: user.name, role: user.role.toLowerCase(),
    timezone: user.timezone, targetWpm: user.targetWpm, dailyGoalMinutes: user.dailyGoalMinutes,
    largeText: user.largeText, reducedPressure: user.reducedPressure,
    xp: user.xp, level: user.level, streak: user.streak,
    preferences: { themePreference: user.themePreference, uiLocale: user.uiLocale },
  };
}
