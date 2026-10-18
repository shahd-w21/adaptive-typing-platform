import { newStudentUser, studentUser } from './users.js';
import { keyGroups, keyStats, newStudentKeys } from './path.js';
import { completedSessions } from './sessions.js';

// GET /dashboard. Path and progress return their own projections below.
export const dashboardResponse = {
  user: {
    name: studentUser.name, email: studentUser.email,
    xp: studentUser.xp, level: studentUser.level,
  },
  recentSessions: completedSessions.slice(0, 5),
  streak: studentUser.streak,
  dailyGoal: { goalMinutes: studentUser.dailyGoalMinutes, minutesToday: 0.18, done: false },
  recommendation: { activity: 'practice', reason: 'Collect more evidence for: a j' },
};

export const newStudentDashboardResponse = {
  ...dashboardResponse,
  user: {
    name: newStudentUser.name, email: newStudentUser.email,
    xp: newStudentUser.xp, level: newStudentUser.level,
  },
  recentSessions: [],
  streak: 0,
  dailyGoal: { goalMinutes: newStudentUser.dailyGoalMinutes, minutesToday: 0, done: false },
  recommendation: {
    activity: 'placement',
    reason: 'Find your starting level, or skip it and start at the home row.',
  },
};

export const pathResponse = {
  groups: keyGroups, keys: keyStats, recommendation: dashboardResponse.recommendation,
};
export const newStudentPathResponse = {
  groups: keyGroups, keys: newStudentKeys, recommendation: newStudentDashboardResponse.recommendation,
};

export const progressResponse = { sessions: completedSessions, keys: keyStats };
export const emptyProgressResponse = { sessions: [], keys: newStudentKeys };
