// Mirrors the current starter curriculum, not a new course contract.
export const keyGroups = [
  { id: 1, name: 'Home row', keys: 'asdfjkl;', prerequisiteId: null, isActive: true },
  { id: 2, name: 'Index reach', keys: 'gh', prerequisiteId: 1, isActive: true },
  { id: 3, name: 'Top row', keys: 'qwertyuiop', prerequisiteId: 2, isActive: true },
  { id: 4, name: 'Bottom row', keys: 'zxcvbnm,./', prerequisiteId: 3, isActive: true },
];

export const newStudentKeys = keyGroups.flatMap(group => [...group.keys].map(key => ({
  key,
  status: group.prerequisiteId === null ? 'in_progress' : 'locked',
  accuracy: null,
  avgMs: null,
  attempts: 0,
  latencySamples: 0,
  sessions: 0,
}))).sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

export const keyStats = newStudentKeys.map(item => item.status === 'locked' ? { ...item } : {
  ...item,
  accuracy: 100,
  // A and J follow spaces, so this attempt supplies no latency evidence for them.
  avgMs: ['a', 'j'].includes(item.key) ? null : 600,
  attempts: 2,
  latencySamples: ['a', 'j'].includes(item.key) ? 0 : 2,
  sessions: 1,
});
