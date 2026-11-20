// Browser and unit-test fixtures. These values are never used as runtime application data.
import { calculateMetrics } from '@typeflow/shared';

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
  preferences: {
    themePreference: 'system',
    uiLocale: 'en',
  },
};

export const newStudentUser = {
  ...studentUser,
  id: '10000000-0000-4000-8000-000000000002',
  email: 'omar@example.test',
  name: 'Omar Ali',
  xp: 0,
  streak: 0,
  preferences: {
    themePreference: 'dark',
    uiLocale: 'ar',
  },
};

export const sessionAssignment = {
  sessionId: '20000000-0000-4000-8000-000000000001',
  mode: 'practice',
  text: 'asdf jkl; asdf jkl;',
  source: 'fallback',
  issuedAt: '2026-10-19T09:00:00.000Z',
  expiresAt: '2026-10-19T10:00:00.000Z',
  rules: {
    pauseAllowed: true,
    eventVersion: 1,
    settingsVersion: 'teammate-migration-v1',
    targetWpm: studentUser.targetWpm,
  },
};

export const sessionSubmission = {
  events: [...sessionAssignment.text].map((char, seq) => ({
    seq,
    type: 'insert',
    t: seq * 600,
    char,
  })),
  finishTimeMs: (sessionAssignment.text.length - 1) * 600,
};

export const sessionResult = {
  sessionId: sessionAssignment.sessionId,
  status: 'completed',
  metrics: calculateMetrics({
    inserts: sessionAssignment.text.length,
    correctInserts: sessionAssignment.text.length,
    bufferLength: sessionAssignment.text.length,
    finalCorrect: sessionAssignment.text.length,
    activeDurationMs: sessionSubmission.finishTimeMs,
  }),
  passed: true,
  rewards: [{
    id: `xp:${sessionAssignment.sessionId}`,
    type: 'xp',
    amount: 19,
  }],
  xpEarned: 19,
  xp: studentUser.xp,
  level: studentUser.level,
  leveledUp: false,
  streak: studentUser.streak,
  masteredKeys: [],
  unlockedKeys: [],
  problemKeys: [],
  certificate: null,
};

export const completedSessions = [{
  id: sessionAssignment.sessionId,
  mode: 'practice',
  netWpm: sessionResult.metrics.netWpm,
  grossWpm: sessionResult.metrics.grossWpm,
  rawAccuracy: sessionResult.metrics.rawAccuracy,
  finalAccuracy: sessionResult.metrics.finalAccuracy,
  durationMs: sessionResult.metrics.activeDurationMs,
  xpEarned: sessionResult.xpEarned,
  completedAt: '2026-10-19T09:00:10.800Z',
}];

export const sessionHistoryResponse = {
  sessions: completedSessions.map(({ id, mode, netWpm, rawAccuracy, completedAt }) => ({
    id,
    mode,
    status: 'completed',
    netWpm,
    rawAccuracy,
    completedAt,
  })),
};

export const keyGroups = [
  { id: 1, name: 'Home row', keys: 'asdfjkl;', prerequisiteId: null, isActive: true },
  { id: 2, name: 'Index reach', keys: 'gh', prerequisiteId: 1, isActive: true },
  { id: 3, name: 'Top row', keys: 'qwertyuiop', prerequisiteId: 2, isActive: true },
  { id: 4, name: 'Bottom row', keys: 'zxcvbnm,./', prerequisiteId: 3, isActive: true },
];

export const keyStats = keyGroups
  .flatMap(group => [...group.keys].map(key => ({
    key,
    status: group.prerequisiteId === null ? 'in_progress' : 'locked',
    accuracy: group.prerequisiteId === null ? 100 : null,
    avgMs: group.prerequisiteId === null ? 600 : null,
    attempts: group.prerequisiteId === null ? 2 : 0,
    latencySamples: group.prerequisiteId === null ? 2 : 0,
    sessions: group.prerequisiteId === null ? 1 : 0,
  })))
  .sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

export const pathResponse = {
  groups: keyGroups,
  keys: keyStats,
  recommendation: {
    activity: 'practice',
    reason: 'Collect more evidence for: a j',
  },
};

export const dashboardResponse = {
  user: {
    name: studentUser.name,
    email: studentUser.email,
    xp: studentUser.xp,
    level: studentUser.level,
  },
  recentSessions: completedSessions,
  streak: studentUser.streak,
  dailyGoal: {
    goalMinutes: studentUser.dailyGoalMinutes,
    minutesToday: 0.18,
    done: false,
  },
  recommendation: {
    activity: 'practice',
    reason: 'Collect more evidence for: a j',
  },
};

export const newStudentDashboardResponse = {
  ...dashboardResponse,
  user: {
    name: newStudentUser.name,
    email: newStudentUser.email,
    xp: 0,
    level: 1,
  },
  recentSessions: [],
  streak: 0,
  dailyGoal: {
    goalMinutes: newStudentUser.dailyGoalMinutes,
    minutesToday: 0,
    done: false,
  },
  recommendation: {
    activity: 'placement',
    reason: 'Find your starting level, or skip it and start at the home row.',
  },
};
