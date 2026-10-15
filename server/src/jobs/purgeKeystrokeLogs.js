export function purgeKeystrokeLogs(database, now = new Date()) {
  return database.keystrokeLog.deleteMany({ where: { expiresAt: { lte: now } } });
}
export function startLogRetention(database) {
  const run = () => purgeKeystrokeLogs(database).catch(() => console.error('Raw-log cleanup failed; the next scheduled run will retry.'));
  void run();
  const timer = setInterval(run, 3600000);
  timer.unref();
  return () => clearInterval(timer);
}
