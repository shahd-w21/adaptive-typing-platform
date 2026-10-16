import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:net';
import { setupEnvironment } from '../../../scripts/setup-env.js';
import { checkPort } from '../../../scripts/check-dev-ports.js';

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'typeflow-setup-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = pathToFileURL(`${directory}/`);
  for (const workspace of ['client', 'server']) await mkdir(new URL(`${workspace}/`, root));
  return root;
}

test('fresh checkout creates environments from tracked templates with a unique secret and Compose override', async t => {
  const root = await fixture(t);
  for (const workspace of ['client', 'server']) {
    await writeFile(new URL(`${workspace}/.env.example`, root), await readFile(new URL(`../../../${workspace}/.env.example`, import.meta.url)));
  }
  await writeFile(new URL('.env', root), 'TYPEFLOW_DB_PORT=55432\n');
  const previous = process.env.TYPEFLOW_DB_PORT;
  delete process.env.TYPEFLOW_DB_PORT;
  t.after(() => {
    if (previous === undefined) delete process.env.TYPEFLOW_DB_PORT;
    else process.env.TYPEFLOW_DB_PORT = previous;
  });
  await setupEnvironment(root, () => {});
  const server = await readFile(new URL('server/.env', root), 'utf8');
  assert.match(server, /JWT_SECRET=[a-f0-9]{64}/);
  assert.match(server, /localhost:55432\/typeflow_dev/);
  assert.match(server, /localhost:55432\/typeflow_test/);
  assert.equal(await readFile(new URL('client/.env', root), 'utf8'), 'VITE_API_URL=http://localhost:5000/api/v1\n');
  await setupEnvironment(root, () => {});
  assert.equal(await readFile(new URL('server/.env', root), 'utf8'), server);
});

test('existing environments are preserved even if templates are missing', async t => {
  const root = await fixture(t);
  for (const workspace of ['client', 'server']) await writeFile(new URL(`${workspace}/.env`, root), 'EXISTING=keep\n');
  await setupEnvironment(root, () => {});
  for (const workspace of ['client', 'server']) assert.equal(await readFile(new URL(`${workspace}/.env`, root), 'utf8'), 'EXISTING=keep\n');
});

test('missing template gives an actionable setup error', async t => {
  await assert.rejects(setupEnvironment(await fixture(t), () => {}), /Missing client\/\.env.example/);
});

test('development preflight reports an occupied port without stopping its owner', async t => {
  const owner = createServer();
  await new Promise(resolve => owner.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => owner.close(resolve)));
  await assert.rejects(checkPort(owner.address().port, 'Client'), /Client port .*EADDRINUSE/);
  assert.equal(owner.listening, true);
  await checkPort(0, 'Available ephemeral');
});
