import { access, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';

export async function setupEnvironment(root = new URL('../', import.meta.url), log = console.log) {
  let compose = {};
  try {
    compose = dotenv.parse(await readFile(new URL('.env', root), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const port = process.env.TYPEFLOW_DB_PORT ?? compose.TYPEFLOW_DB_PORT ?? '5432';
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new Error('TYPEFLOW_DB_PORT must be a port between 1 and 65535');
  }
  for (const workspace of ['client', 'server']) {
    const destination = new URL(`${workspace}/.env`, root);
    try {
      await access(destination);
      log(`Kept existing ${workspace}/.env`);
      continue;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    let example;
    try {
      example = await readFile(new URL(`${workspace}/.env.example`, root), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      throw new Error(`Missing ${workspace}/.env.example. Restore the tracked template, then rerun npm run setup:env.`, { cause: error });
    }
    if (workspace === 'server') {
      example = example.replace('replace-with-a-generated-local-secret', randomBytes(32).toString('hex'));
      example = example.replaceAll('@localhost:5432/', `@localhost:${port}/`);
    }
    try {
      await writeFile(destination, example, { flag: 'wx' });
      log(`Created ${workspace}/.env`);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      log(`Kept existing ${workspace}/.env`);
    }
  }
}

if (import.meta.main) {
  try {
    await setupEnvironment();
  } catch (error) {
    console.error(`Environment setup failed: ${error.message}`);
    process.exitCode = 1;
  }
}
