import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

for (const workspace of ['client', 'server']) {
  const destination = new URL(`../${workspace}/.env`, import.meta.url);
  const example = await readFile(new URL(`../${workspace}/.env.example`, import.meta.url), 'utf8');
  try {
    await writeFile(destination, example.replace('replace-with-a-generated-local-secret', randomBytes(32).toString('hex')), { flag: 'wx' });
    console.log(`Created ${workspace}/.env`);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    console.log(`Kept existing ${workspace}/.env`);
  }
}
