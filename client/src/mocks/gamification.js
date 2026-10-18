import { dashboardResponse, newStudentDashboardResponse } from './dashboard.js';

// GET /gamification currently exposes XP, level, streak and daily goal only.
export const gamificationResponse = {
  xp: dashboardResponse.user.xp,
  level: dashboardResponse.user.level,
  streak: dashboardResponse.streak,
  dailyGoal: dashboardResponse.dailyGoal,
};

export const newStudentGamificationResponse = {
  xp: newStudentDashboardResponse.user.xp,
  level: newStudentDashboardResponse.user.level,
  streak: newStudentDashboardResponse.streak,
  dailyGoal: newStudentDashboardResponse.dailyGoal,
};
