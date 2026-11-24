import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { createDatabase } from '../../src/db/prisma.js';
import { createApp } from '../../src/app.js';
import { createUserService } from '../../src/modules/users/service.js';
import { assertLocalDatabase } from '../../../scripts/database-target.js';

test('dedicated test database has migrations and the API can query it', async () => {
  const url = assertLocalDatabase(process.env.DATABASE_URL, 'typeflow_test');
  const database = createDatabase(url);
  try {
    const [identity] = await database.$queryRaw`SELECT current_database() AS name`;
    assert.equal(identity.name, 'typeflow_test');
    assert.equal(typeof await database.user.count(), 'number');
    const app = createApp({ database, clientUrl: 'http://localhost:5173' });
    await request(app).get('/health/ready').expect(200, { status: 'ready' });
  } finally {
    await database.$disconnect();
  }
});

test('typing sessions retain their captured settings version', async () => {
  const url = assertLocalDatabase(process.env.DATABASE_URL, 'typeflow_test');
  const database = createDatabase(url);
  const userId = randomUUID();
  const sessionId = randomUUID();
  const settingsId = `settings-fixture-${randomUUID()}`;

  try {
    await database.user.create({
      data: {
        id: userId,
        email: `settings-${userId}@example.test`,
        passwordHash: 'test-only-hash',
      },
    });
    await database.settingVersion.create({
      data: {
        id: settingsId,
        values: { fixture: true },
      },
    });
    await database.typingSession.create({
      data: {
        id: sessionId,
        userId,
        text: 'asdf',
        rules: { fixture: true },
        settingsId,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    const session = await database.typingSession.findUnique({
      where: { id: sessionId },
      include: { settings: true },
    });

    assert.equal(session.settings.id, settingsId);
    await assert.rejects(
      database.settingVersion.delete({ where: { id: settingsId } }),
      { code: 'P2003' },
    );
  } finally {
    // Remove only the rows created by this isolated integration fixture.
    await database.typingSession.deleteMany({ where: { id: sessionId } });
    await database.user.deleteMany({ where: { id: userId } });
    await database.settingVersion.deleteMany({ where: { id: settingsId } });
    await database.$disconnect();
  }
});

test('account deletion anonymizes discussion threads needed by replies and removes authored forum text', async () => {
  const url = assertLocalDatabase(process.env.DATABASE_URL, 'typeflow_test');
  const database = createDatabase(url);
  const authorId = randomUUID();
  const replierId = randomUUID();
  const retainedThreadId = randomUUID();
  const emptyThreadId = randomUUID();
  const otherThreadId = randomUUID();
  const passwordHash = await bcrypt.hash('fixture-password', 4);

  try {
    await database.user.createMany({
      data: [
        {
          id: authorId,
          email: `forum-author-${authorId}@example.test`,
          passwordHash,
        },
        {
          id: replierId,
          email: `forum-replier-${replierId}@example.test`,
          passwordHash,
        },
      ],
    });
    await database.forumThread.createMany({
      data: [
        { id: retainedThreadId, userId: authorId, title: 'Private author title' },
        { id: emptyThreadId, userId: authorId, title: 'Thread with no replies' },
        { id: otherThreadId, userId: replierId, title: 'Another discussion' },
      ],
    });
    await database.forumPost.createMany({
      data: [
        {
          threadId: retainedThreadId,
          userId: authorId,
          content: 'Private original post',
        },
        {
          threadId: retainedThreadId,
          userId: replierId,
          content: 'Reply that must remain',
        },
        {
          threadId: otherThreadId,
          userId: authorId,
          content: 'Private reply in another thread',
        },
      ],
    });

    const service = createUserService({
      database,
      config: {},
      sendMail: async () => {},
    });
    await service.remove(
      { id: authorId, role: 'STUDENT', passwordHash },
      { password: 'fixture-password' },
    );

    const retainedThread = await database.forumThread.findUnique({
      where: { id: retainedThreadId },
      include: { posts: true },
    });
    assert.equal(retainedThread.userId, null);
    assert.equal(retainedThread.title, null);
    assert.deepEqual(
      retainedThread.posts.map(post => post.content),
      ['Reply that must remain'],
    );
    assert.equal(
      await database.forumThread.findUnique({ where: { id: emptyThreadId } }),
      null,
    );
    assert.equal(
      await database.forumPost.count({ where: { userId: authorId } }),
      0,
    );
    assert.equal(await database.user.findUnique({ where: { id: authorId } }), null);
  } finally {
    await database.forumThread.deleteMany({
      where: { id: { in: [retainedThreadId, emptyThreadId, otherThreadId] } },
    });
    await database.user.deleteMany({
      where: { id: { in: [authorId, replierId] } },
    });
    await database.$disconnect();
  }
});
