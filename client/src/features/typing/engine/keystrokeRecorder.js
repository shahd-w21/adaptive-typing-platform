/**
 * TypeFlow Monotonic Keystroke Recorder
 * Conforms to SRS SYS-10, SYS-12, SYS-13
 * Emits ordered monotonic event stream: { seq, type, t, char? }
 */

export class KeystrokeRecorder {
  constructor(options = {}) {
    if (options.now !== undefined && typeof options.now !== 'function') {
      throw new TypeError('The recorder clock must be a function.');
    }

    this.events = [];
    this.sequence = 0;
    this.startTime = null; // Set on first printable insert (t = 0)
    this.activePauses = []; // Valid pause intervals
    this.currentPauseStart = null;
    this.onEvent = options.onEvent || (() => {});
    this.now = options.now || (() => performance.now());
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

    const now = this.now();
    const completedPauseDuration = this.activePauses.reduce(
      (duration, pause) => duration + pause.duration,
      0,
    );
    const currentPauseDuration =
      this.currentPauseStart === null
        ? 0
        : Math.max(0, now - this.currentPauseStart);

    return Math.max(
      0,
      now -
        this.startTime -
        completedPauseDuration -
        currentPauseDuration,
    );
  }

  /** Keep wire timestamps nonnegative and ordered even at equal clock ticks. */
  getEventTime(now) {
    const elapsed = Math.max(0, Math.round(now - this.startTime));
    return Math.max(this.events.at(-1)?.t ?? 0, elapsed);
  }

  recordInsert(char) {
    const now = this.now();
    if (this.startTime === null) {
      this.startTime = now;
    }

    const event = {
      seq: this.sequence++,
      type: 'insert',
      t: this.getEventTime(now),
      char,
    };

    this.events.push(event);
    this.onEvent(event);
    return event;
  }

  recordBackspace() {
    if (this.startTime === null) return null; // Cannot backspace before start

    const now = this.now();
    const event = {
      seq: this.sequence++,
      type: 'backspace',
      t: this.getEventTime(now),
    };

    this.events.push(event);
    this.onEvent(event);
    return event;
  }

  recordPause() {
    if (this.startTime === null || this.currentPauseStart !== null) return null;

    const now = this.now();
    this.currentPauseStart = now;

    const event = {
      seq: this.sequence++,
      type: 'pause',
      t: this.getEventTime(now),
    };

    this.events.push(event);
    this.onEvent(event);
    return event;
  }

  recordResume() {
    if (this.startTime === null || this.currentPauseStart === null) return null;

    const now = this.now();
    const duration = Math.max(0, now - this.currentPauseStart);
    this.activePauses.push({
      start: this.currentPauseStart,
      end: now,
      duration,
    });
    this.currentPauseStart = null;

    const event = {
      seq: this.sequence++,
      type: 'resume',
      t: this.getEventTime(now),
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
