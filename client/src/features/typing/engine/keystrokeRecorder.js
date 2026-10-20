/**
 * TypeFlow Monotonic Keystroke Recorder
 * Conforms to SRS SYS-10, SYS-12, SYS-13
 * Emits ordered monotonic event stream: { seq, type, t, char? }
 */

export class KeystrokeRecorder {
  constructor(options = {}) {
    this.events = [];
    this.sequence = 0;
    this.startTime = null; // Set on first printable insert (t = 0)
    this.activePauses = []; // Valid pause intervals
    this.currentPauseStart = null;
    this.onEvent = options.onEvent || (() => {});
  }

  reset() {
    this.events = [];
    this.sequence = 0;
    this.startTime = null;
    this.activePauses = [];
    this.currentPauseStart = null;
  }

  getElapsedMs() {
    if (this.startTime === null) return 0;
    return Math.max(0, performance.now() - this.startTime);
  }

  recordInsert(char) {
    const now = performance.now();
    if (this.startTime === null) {
      this.startTime = now;
    }

    const event = {
      seq: this.sequence++,
      type: 'insert',
      t: Math.round(now - this.startTime),
      char,
    };

    this.events.push(event);
    this.onEvent(event);
    return event;
  }

  recordBackspace() {
    if (this.startTime === null) return null; // Cannot backspace before start

    const now = performance.now();
    const event = {
      seq: this.sequence++,
      type: 'backspace',
      t: Math.round(now - this.startTime),
    };

    this.events.push(event);
    this.onEvent(event);
    return event;
  }

  recordPause() {
    if (this.startTime === null || this.currentPauseStart !== null) return null;

    const now = performance.now();
    this.currentPauseStart = now;

    const event = {
      seq: this.sequence++,
      type: 'pause',
      t: Math.round(now - this.startTime),
    };

    this.events.push(event);
    this.onEvent(event);
    return event;
  }

  recordResume() {
    if (this.startTime === null || this.currentPauseStart === null) return null;

    const now = performance.now();
    this.activePauses.push({
      start: this.currentPauseStart,
      end: now,
      duration: now - this.currentPauseStart,
    });
    this.currentPauseStart = null;

    const event = {
      seq: this.sequence++,
      type: 'resume',
      t: Math.round(now - this.startTime),
    };

    this.events.push(event);
    this.onEvent(event);
    return event;
  }

  getSubmissionPayload(sessionId) {
    return {
      sessionId,
      events: [...this.events],
      finishTime: this.events.at(-1)?.t ?? 0,
      clientEventCount: this.events.length,
    };
  }
}
