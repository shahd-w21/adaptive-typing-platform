// Migrated from the teammate's scoreSession: replay stays pure and server-owned.
import { calculateMetrics } from '@typeflow/shared';

export function replay(text, events, finishTimeMs, { latencyCutoffMs = 2000 } = {}) {
  const buffer = [];
  const keyStats = {};
  let inserts = 0, correctInserts = 0, previous = null, pausedAt = null, pausedMs = 0;
  if (events[0]?.type !== 'insert' || events[0].t !== 0) throw new Error('The first event must be an insert at zero');
  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    if (event.seq !== index || (index && event.t < events[index - 1].t)) throw new Error('Events must be ordered');
    if (buffer.length === text.length) throw new Error('Events follow passage completion');
    if (event.type === 'pause') {
      if (pausedAt !== null) throw new Error('Already paused');
      pausedAt = event.t; previous = null; continue;
    }
    if (event.type === 'resume') {
      if (pausedAt === null) throw new Error('Not paused');
      pausedMs += event.t - pausedAt; pausedAt = null; previous = null; continue;
    }
    if (pausedAt !== null) throw new Error('Input while paused');
    if (event.type === 'backspace') { buffer.pop(); previous = null; continue; }
    const position = buffer.length;
    const expected = text[position];
    const correct = event.char === expected;
    inserts++; if (correct) correctInserts++;
    const stat = keyStats[expected] ??= { attempts: 0, errors: 0, totalMs: 0, timed: 0 };
    stat.attempts++; if (!correct) stat.errors++;
    const delta = previous ? event.t - previous.t : null;
    if (correct && previous?.correct && previous.position + 1 === position && expected !== ' ' && previous.char !== ' '
        && delta > 0 && delta <= latencyCutoffMs) { stat.totalMs += delta; stat.timed++; }
    previous = { correct, position, t: event.t, char: event.char };
    buffer.push(event.char);
  }
  if (buffer.length !== text.length || pausedAt !== null) throw new Error('Exercise not finished');
  if (finishTimeMs !== events.at(-1).t) throw new Error('Practice finish must match the completing insert');
  const durationMs = finishTimeMs - pausedMs;
  const finalCorrect = buffer.reduce((sum, char, index) => sum + Number(char === text[index]), 0);
  return { metrics: calculateMetrics({ inserts, correctInserts, bufferLength: buffer.length, finalCorrect, activeDurationMs: durationMs }),
    keyStats, inserts, finalCorrect };
}
