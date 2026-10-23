/**
 * Exposes approved timed-test choices while assessment APIs remain unavailable.
 */
import { useState } from 'react';

const TIMED_TEST_DURATIONS = Object.freeze([1, 3, 5]);

/** Keep SRS duration choices visible without inventing a client test assignment. */
export function useTests() {
  const [selectedDuration, setSelectedDuration] = useState(3);

  return {
    timedDurations: TIMED_TEST_DURATIONS,
    selectedDuration,
    selectDuration: setSelectedDuration,
    timedAvailable: false,
    certifiedAvailable: false,
  };
}
