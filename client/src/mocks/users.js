// Synthetic public DTOs only. These are not accounts or authentication credentials.
export const studentUser = {
  id: '10000000-0000-4000-8000-000000000001',
  email: 'layla@example.test',
  name: 'Layla Hassan',
  role: 'student',
  timezone: 'Africa/Cairo',
  targetWpm: 40,
  dailyGoalMinutes: 10,
  largeText: false,
  reducedPressure: false,
  xp: 19,
  level: 1,
  streak: 1,
  preferences: { themePreference: 'system', uiLocale: 'en' },
};

export const newStudentUser = {
  ...studentUser,
  id: '10000000-0000-4000-8000-000000000002',
  email: 'omar@example.test',
  name: 'Omar Ali',
  xp: 0,
  streak: 0,
  preferences: { themePreference: 'dark', uiLocale: 'ar' },
};

export const adminUser = {
  ...newStudentUser,
  id: '10000000-0000-4000-8000-000000000003',
  email: 'admin@example.test',
  name: 'Demo Admin',
  role: 'admin',
  preferences: { themePreference: 'light', uiLocale: 'en' },
};

// GET /users/me. Auth cookies and CSRF tokens have no mock bypass.
export const profileResponse = { user: studentUser };
