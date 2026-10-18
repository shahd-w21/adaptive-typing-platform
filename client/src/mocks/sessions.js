import { calculateMetrics } from '@typeflow/shared';
import { studentUser } from './users.js';

// Fixed dates and timings keep previews reproducible. Text uses only home-row keys.
export const sessionStartRequest = { mode: 'practice' };

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

// A complete, replayable perfect attempt; the first insert occurs at zero.
export const sessionSubmission = {
  events: [...sessionAssignment.text].map((char, seq) => ({
    seq, type: 'insert', t: seq * 600, char,
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
  rewards: [{ id: `xp:${sessionAssignment.sessionId}`, type: 'xp', amount: 19 }],
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

// Path/dashboard/progress include more history fields than GET /sessions.
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
    id, mode, status: 'completed', netWpm, rawAccuracy, completedAt,
  })),
};

export const emptySessionHistoryResponse = { sessions: [] };
