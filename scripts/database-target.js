export function assertLocalDatabase(connectionString, name) {
  let url;
  try { url = new URL(connectionString); } catch { throw new Error('A valid database URL is required'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)
      || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      || decodeURIComponent(url.pathname) !== `/${name}`) {
    throw new Error(`This local command requires a loopback PostgreSQL database named ${name}`);
  }
  return connectionString;
}
