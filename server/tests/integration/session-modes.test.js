import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { createDatabase } from '../../src/db/prisma.js';
import { createSessionService } from '../../src/modules/sessions/service.js';
import { createPathService } from '../../src/modules/path/service.js';
import { seedStarter } from '../../src/modules/settings/starter.js';
import { assertLocalDatabase } from '../../../scripts/database-target.js';
import { sessionAssignmentSchema } from '@typeflow/shared';

const appConfig = {
  JWT_SECRET: 'test-only-session-modes-secret-longer-than-32',
  NODE_ENV: 'test',
  CLIENT_URL: 'http://localhost:5173',
};

/** Keep the BE-04 lifecycle checks on the guarded PostgreSQL test database. */
test('practice lifecycle captures policy, fences restart/deadlines, and deduplicates concurrent retries', async () => {
  const database = createDatabase(
    assertLocalDatabase(process.env.DATABASE_URL, 'typeflow_test'),
  );
  const userId = randomUUID();
  const assessmentOnlyUserId = randomUUID();
  let instant = new Date();

  try {
    await seedStarter(database);
    const user = await database.user.create({
      data: {
        id: userId,
        email: `session-modes-${userId}@example.test`,
        passwordHash: await bcrypt.hash('StrongPass123', 4),
        emailVerifiedAt: new Date(),
        timezone: 'Africa/Cairo',
        targetWpm: 40,
      },
    });
    const assessmentOnlyUser = await database.user.create({
      data: {
        id: assessmentOnlyUserId,
        email: `session-modes-assessment-${assessmentOnlyUserId}@example.test`,
        passwordHash: await bcrypt.hash('StrongPass123', 4),
        emailVerifiedAt: new Date(),
      },
    });
    await database.user.update({
      where: { id: userId },
      data: { targetWpm: 52, timezone: 'America/New_York' },
    });
    const service = createSessionService({
      database,
      now: () => instant,
      random: () => 0.1,
    });
    const app = createApp({
      database,
      clientUrl: appConfig.CLIENT_URL,
      config: appConfig,
      now: () => instant,
      random: () => 0.1,
      sendMail: async () => {},
    });
    const agent = request.agent(app);
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'StrongPass123' })
      .expect(200);

    const placementStart = await agent
      .post('/api/v1/sessions')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ mode: 'placement' })
      .expect(201);
    sessionAssignmentSchema.parse(placementStart.body);
    assert.equal(placementStart.body.mode, 'placement');
    assert.ok([...'abcdefghijklmnopqrstuvwxyz'].every(key => placementStart.body.text.includes(key)));
    assert.equal(placementStart.body.rules.pauseAllowed, false);
    const placementSubmission = {
      events: [...placementStart.body.text].map((char, seq) => ({
        seq,
        type: 'insert',
        char,
        t: seq * 200,
      })),
      finishTimeMs: (placementStart.body.text.length - 1) * 200,
    };
    instant = new Date(instant.getTime() + placementSubmission.finishTimeMs + 1_000);
    const placementStartResult = await agent
      .post(`/api/v1/sessions/${placementStart.body.sessionId}/submit`)
      .set('X-CSRF-Token', login.body.csrfToken)
      .send(placementSubmission)
      .expect(200);
    assert.equal(placementStartResult.body.xpEarned, 0);
    assert.deepEqual(placementStartResult.body.masteredKeys, []);
    assert.ok(placementStartResult.body.unlockedKeys.includes('g'));
    assert.equal(
      (await database.keyStat.findUnique({
        where: { userId_key: { userId, key: 'a' } },
      })).status,
      'in_progress',
    );
    assert.equal(
      (await database.user.findUnique({ where: { id: userId } })).placementDone,
      true,
    );
    const repeatedPlacement = await agent
      .post('/api/v1/sessions')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ mode: 'placement' })
      .expect(409);
    assert.equal(repeatedPlacement.body.error.code, 'PLACEMENT_UNAVAILABLE');

    const lessonStart = await agent
      .post('/api/v1/sessions')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ mode: 'lesson' })
      .expect(201);
    sessionAssignmentSchema.parse(lessonStart.body);
    assert.equal(lessonStart.body.mode, 'lesson');
    assert.equal(lessonStart.body.rules.lessonGroupId, 1);
    assert.equal(lessonStart.body.rules.pauseAllowed, true);
    await agent.post(`/api/v1/sessions/${lessonStart.body.sessionId}/abandon`)
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({})
      .expect(200);

    const noReview = await agent
      .post('/api/v1/sessions')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ mode: 'review' })
      .expect(409);
    assert.equal(noReview.body.error.code, 'NO_REVIEWS_DUE');

    const invalidTimedStart = await agent
      .post('/api/v1/sessions')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ mode: 'timed', durationSeconds: 90 })
      .expect(400);
    assert.equal(invalidTimedStart.body.error.code, 'INVALID_REQUEST');
    const timedStarts = [];
    for (const durationSeconds of [60, 180, 300]) {
      const timedStart = await agent
        .post('/api/v1/sessions')
        .set('X-CSRF-Token', login.body.csrfToken)
        .send({ mode: 'timed', durationSeconds })
        .expect(201);
      sessionAssignmentSchema.parse(timedStart.body);
      assert.equal(timedStart.body.mode, 'timed');
      assert.equal(timedStart.body.rules.durationMs, durationSeconds * 1000);
      assert.ok(timedStart.body.text.length >= Math.ceil(durationSeconds / 60 * 250 * 5 * 1.15));
      assert.equal(timedStart.body.rules.pauseAllowed, false);
      timedStarts.push(timedStart);
      await agent.post(`/api/v1/sessions/${timedStart.body.sessionId}/abandon`)
        .set('X-CSRF-Token', login.body.csrfToken)
        .send({})
        .expect(200);
    }

    const certifiedStart = await agent
      .post('/api/v1/sessions')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ mode: 'certified' })
      .expect(201);
    sessionAssignmentSchema.parse(certifiedStart.body);
    assert.equal(certifiedStart.body.mode, 'certified');
    assert.equal(certifiedStart.body.rules.durationMs, 180_000);
    assert.equal(certifiedStart.body.rules.certifiedMinNetWpm, 30);
    assert.equal(certifiedStart.body.rules.certifiedMinRawAccuracy, 95);
    assert.equal(certifiedStart.body.rules.pauseAllowed, false);
    const certifiedText = certifiedStart.body.text.slice(0, 450);
    const certifiedSubmission = {
      events: [...certifiedText].map((char, seq) => ({
        seq,
        type: 'insert',
        char,
        t: seq * 400,
      })),
      finishTimeMs: certifiedStart.body.rules.durationMs,
    };
    instant = new Date(instant.getTime() + certifiedStart.body.rules.durationMs + 1_000);
    const certifiedStartResult = await service.submit(
      userId,
      certifiedStart.body.sessionId,
      certifiedSubmission,
    );
    assert.equal(certifiedStartResult.metrics.netWpm, 30);
    assert.equal(certifiedStartResult.metrics.rawAccuracy, 100);
    assert.equal(certifiedStartResult.passed, true);
    assert.equal(certifiedStartResult.certificate, null);

    assert.equal(
      await database.typingSession.count({ where: { userId } }),
      6,
    );

    const firstAssignment = await service.start(user);
    const firstRecord = await database.typingSession.findUnique({
      where: { id: firstAssignment.sessionId },
    });
    assert.equal(firstRecord.rules.targetWpm, 52);
    assert.equal(firstRecord.rules.timezone, 'America/New_York');
    assert.equal(firstRecord.settingsId, firstAssignment.rules.settingsVersion);
    assert.equal(firstRecord.rules.scoringVersion, firstAssignment.rules.scoringVersion);
    assert.equal(firstAssignment.rules.scoringVersion, 'replay-v1');
    assert.equal(firstAssignment.rules.modePolicyVersion, 'session-modes-v1');
    assert.ok(firstAssignment.rules.focusKeys.length > 0);
    assert.ok(firstAssignment.rules.focusKeys.length <= 5);
    for (const key of firstAssignment.rules.focusKeys) {
      assert.ok([...firstAssignment.text].filter(char => char === key).length >= 3);
    }
    const unlockedCurriculum = await database.keyStat.findMany({
      where: { userId, status: { in: ['in_progress', 'mastered'] } },
      select: { key: true },
    });
    for (const { key } of unlockedCurriculum) {
      assert.ok(firstAssignment.text.includes(key));
    }
    assert.equal(firstRecord.engineVersion, 'teammate-migration-v1');
    assert.equal(
      firstRecord.expiresAt.getTime() - firstRecord.startedAt.getTime(),
      firstRecord.rules.sessionExpiryMs,
    );

    assert.deepEqual(
      await service.abandon(userId, firstAssignment.sessionId),
      { status: 'abandoned' },
    );
    instant = new Date(instant.getTime() + 1);
    const restartedAssignment = await service.start(user);
    assert.notEqual(restartedAssignment.sessionId, firstAssignment.sessionId);
    assert.equal(
      (await database.typingSession.findUnique({
        where: { id: firstAssignment.sessionId },
      })).status,
      'abandoned',
    );
    assert.equal(
      (await database.typingSession.findUnique({
        where: { id: restartedAssignment.sessionId },
      })).status,
      'created',
    );
    const restartedHistory = await service.history(userId);
    assert.equal(restartedHistory[0].id, restartedAssignment.sessionId);
    assert.ok(restartedHistory.some(session => session.id === firstAssignment.sessionId));
    for (const assignment of [placementStart, lessonStart, ...timedStarts, certifiedStart]) {
      assert.ok(restartedHistory.some(session => session.id === assignment.body.sessionId));
    }

    instant = new Date(instant.getTime() + 1);
    const expiringAssignment = await service.start(user);
    const expiringRecord = await database.typingSession.findUnique({
      where: { id: expiringAssignment.sessionId },
    });
    instant = new Date(expiringRecord.expiresAt.getTime() + 1);

    await assert.rejects(
      service.abandon(userId, expiringAssignment.sessionId),
      error => error.code === 'SESSION_UNAVAILABLE',
    );
    await assert.rejects(
      service.submit(userId, expiringAssignment.sessionId, {
        events: [...expiringAssignment.text].map((char, seq) => ({
          seq,
          type: 'insert',
          t: seq * 200,
          char,
        })),
        finishTimeMs: (expiringAssignment.text.length - 1) * 200,
      }),
      error => error.code === 'SESSION_UNAVAILABLE',
    );

    const expiredRecord = await database.typingSession.findUnique({
      where: { id: expiringAssignment.sessionId },
    });
    assert.equal(expiredRecord.status, 'created');
    assert.equal(expiredRecord.result, null);
    assert.equal(
      await database.keystrokeLog.count({
        where: { sessionId: expiringAssignment.sessionId },
      }),
      0,
    );

    instant = new Date(instant.getTime() + 1);
    const concurrentAssignment = await service.start(user);
    instant = new Date(instant.getTime() + 60_000);
    const submission = {
      events: [...concurrentAssignment.text].map((char, seq) => ({
        seq,
        type: 'insert',
        t: seq * 200,
        char,
      })),
      finishTimeMs: (concurrentAssignment.text.length - 1) * 200,
    };
    const [firstResult, retryResult] = await Promise.all([
      service.submit(userId, concurrentAssignment.sessionId, submission),
      service.submit(userId, concurrentAssignment.sessionId, submission),
    ]);
    assert.deepEqual(retryResult, firstResult);
    assert.equal(
      await database.keystrokeLog.count({
        where: { sessionId: concurrentAssignment.sessionId },
      }),
      1,
    );
    const savedUser = await database.user.findUnique({
      where: { id: userId },
    });
    assert.equal(savedUser.xp, certifiedStartResult.xp + firstResult.xpEarned);

    const settings = await database.settingVersion.findUnique({
      where: { id: 'teammate-migration-v1' },
    });
    const assessmentRules = {
      ...settings.values,
      targetWpm: 52,
      timezone: 'America/New_York',
      scoringVersion: 'replay-v1',
      durationMs: 60_000,
    };
    await database.keyStat.update({
      where: { userId_key: { userId, key: 'a' } },
      data: {
        status: 'mastered',
        accuracy: 99,
        avgMs: 200,
        attempts: 30,
        latencySamples: 30,
        sessions: 2,
        reviewStage: 0,
        nextReviewAt: new Date(instant.getTime() - 1),
      },
    });
    const reviewStart = await agent
      .post('/api/v1/sessions')
      .set('X-CSRF-Token', login.body.csrfToken)
      .send({ mode: 'review' })
      .expect(201);
    sessionAssignmentSchema.parse(reviewStart.body);
    assert.equal(reviewStart.body.mode, 'review');
    assert.deepEqual(reviewStart.body.rules.reviewKeys, ['a']);
    const reviewSubmission = {
      events: [...reviewStart.body.text].map((char, seq) => ({
        seq,
        type: 'insert',
        char,
        t: seq * 200,
      })),
      finishTimeMs: (reviewStart.body.text.length - 1) * 200,
    };
    const reviewResult = await service.submit(
      userId,
      reviewStart.body.sessionId,
      reviewSubmission,
    );
    assert.equal(reviewResult.passed, true);
    const rescheduledKey = await database.keyStat.findUnique({
      where: { userId_key: { userId, key: 'a' } },
    });
    assert.equal(rescheduledKey.reviewStage, 1);
    assert.equal(
      rescheduledKey.nextReviewAt.getTime(),
      instant.getTime() + 3 * 24 * 60 * 60 * 1000,
    );
    await database.keyStat.update({
      where: { userId_key: { userId, key: 'a' } },
      data: { nextReviewAt: new Date(instant.getTime() - 1) },
    });
    const failedReview = await service.start(user, { mode: 'review' });
    const failedReviewResult = await service.submit(userId, failedReview.sessionId, {
      events: [...failedReview.text].map((char, seq) => ({
        seq,
        type: 'insert',
        char: seq === 2 ? 'x' : char,
        t: seq * 200,
      })),
      finishTimeMs: (failedReview.text.length - 1) * 200,
    });
    assert.equal(failedReviewResult.passed, false);
    const failedReviewKey = await database.keyStat.findUnique({
      where: { userId_key: { userId, key: 'a' } },
    });
    assert.equal(failedReviewKey.status, 'in_progress');
    assert.equal(failedReviewKey.reviewStage, 0);
    assert.equal(failedReviewKey.nextReviewAt, null);

    await database.keyStat.update({
      where: { userId_key: { userId, key: 'a' } },
      data: {
        status: 'mastered',
        reviewStage: 2,
        nextReviewAt: new Date(instant.getTime() - 1),
      },
    });
    const insufficientReview = await database.typingSession.create({
      data: {
        userId,
        mode: 'review',
        text: 'asdfa',
        rules: { ...assessmentRules, reviewKeys: ['a'] },
        settingsId: settings.id,
        startedAt: instant,
        expiresAt: new Date(instant.getTime() + 60_000),
      },
    });
    await service.submit(userId, insufficientReview.id, {
      events: [...'asdfa'].map((char, seq) => ({
        seq,
        type: 'insert',
        char,
        t: seq * 400,
      })),
      finishTimeMs: 1_600,
    });
    const unchangedReviewKey = await database.keyStat.findUnique({
      where: { userId_key: { userId, key: 'a' } },
    });
    assert.equal(unchangedReviewKey.reviewStage, 2);
    assert.equal(
      unchangedReviewKey.nextReviewAt.getTime(),
      instant.getTime() - 1,
    );

    const pathOnlyTimedSession = await database.typingSession.create({
      data: {
        userId: assessmentOnlyUser.id,
        mode: 'timed',
        text: 'timed assessment fixture',
        rules: { fixture: true },
        settingsId: settings.id,
        status: 'completed',
        startedAt: instant,
        expiresAt: new Date(instant.getTime() + 60_000),
        completedAt: instant,
        durationMs: 60_000,
        netWpm: 40,
        rawAccuracy: 100,
      },
    });
    assert.ok(pathOnlyTimedSession);
    const path = await createPathService({ database, now: () => instant })(assessmentOnlyUser);
    assert.equal(path.recommendation.activity, 'placement');
    const keyBeforeAssessment = await database.keyStat.findUnique({
      where: { userId_key: { userId, key: 'a' } },
    });
    const timedSession = await database.typingSession.create({
      data: {
        userId,
        mode: 'timed',
        text: 'abcdefghij',
        rules: assessmentRules,
        settingsId: settings.id,
        startedAt: new Date(instant.getTime() - 60_000),
        expiresAt: new Date(instant.getTime() + 60_000),
      },
    });
    const timedResult = await service.submit(userId, timedSession.id, {
      events: [...'abcde'].map((char, seq) => ({
        seq,
        type: 'insert',
        char,
        t: seq * 200,
      })),
      finishTimeMs: 60_000,
    });
    assert.equal(timedResult.metrics.activeDurationMs, 60_000);
    assert.equal(timedResult.xpEarned, 5);
    assert.deepEqual(timedResult.masteredKeys, []);
    assert.deepEqual(timedResult.unlockedKeys, []);
    assert.equal(
      (await database.keyStat.findUnique({
        where: { userId_key: { userId, key: 'a' } },
      })).attempts,
      keyBeforeAssessment.attempts,
    );

    const placementSession = await database.typingSession.create({
      data: {
        userId,
        mode: 'placement',
        text: 'asdfg',
        rules: assessmentRules,
        settingsId: settings.id,
        startedAt: instant,
        expiresAt: new Date(instant.getTime() + 60_000),
      },
    });
    const userBeforePlacement = await database.user.findUnique({
      where: { id: userId },
    });
    const placementResult = await service.submit(userId, placementSession.id, {
      events: [...'asdfg'].map((char, seq) => ({
        seq,
        type: 'insert',
        char,
        t: seq * 500,
      })),
      finishTimeMs: 2_000,
    });
    assert.equal(placementResult.xpEarned, 0);
    assert.equal(placementResult.xp, userBeforePlacement.xp);
    assert.deepEqual(placementResult.masteredKeys, []);
    assert.deepEqual(placementResult.unlockedKeys, []);
    assert.equal(
      (await database.keyStat.findUnique({
        where: { userId_key: { userId, key: 'a' } },
      })).attempts,
      keyBeforeAssessment.attempts + 1,
    );
    const modeHistory = await service.history(userId);
    assert.ok(modeHistory.some(session => session.id === timedSession.id && session.mode === 'timed'));
    assert.ok(modeHistory.some(session => session.id === placementSession.id && session.mode === 'placement'));
    assert.equal((await service.get(userId, timedSession.id)).status, 'completed');

    const makeSession = (mode, text, startedAt) => database.typingSession.create({
      data: {
        userId,
        mode,
        text,
        rules: assessmentRules,
        settingsId: settings.id,
        startedAt,
        expiresAt: new Date(instant.getTime() + 60_000),
      },
    });
    const learningEvents = [
      { seq: 0, type: 'insert', char: 'a', t: 0 },
      { seq: 1, type: 'pause', t: 500 },
      { seq: 2, type: 'resume', t: 1_500 },
      { seq: 3, type: 'insert', char: 's', t: 2_000 },
      { seq: 4, type: 'insert', char: 'd', t: 2_500 },
      { seq: 5, type: 'insert', char: 'f', t: 3_000 },
      { seq: 6, type: 'insert', char: 'g', t: 3_500 },
    ];
    for (const mode of ['lesson']) {
      const assignment = await makeSession(mode, 'asdfg', new Date(instant.getTime() - 3_500));
      const result = await service.submit(userId, assignment.id, {
        events: learningEvents,
        finishTimeMs: 3_500,
      });
      assert.equal(result.metrics.activeDurationMs, 2_500);
      assert.equal(result.xpEarned, 5);
      assert.ok(result.passed);
    }

    const beforeCertified = await database.keyStat.findUnique({
      where: { userId_key: { userId, key: 'a' } },
    });
    const certified = await makeSession(
      'certified',
      'abcdefghij',
      new Date(instant.getTime() - 60_000),
    );
    const certifiedResult = await service.submit(userId, certified.id, {
      events: [
        { seq: 0, type: 'insert', char: 'a', t: 0 },
        { seq: 1, type: 'focusLost', t: 1_000 },
        { seq: 2, type: 'insert', char: 'b', t: 10_000 },
        { seq: 3, type: 'insert', char: 'c', t: 20_000 },
        { seq: 4, type: 'insert', char: 'd', t: 30_000 },
        { seq: 5, type: 'insert', char: 'e', t: 40_000 },
      ],
      finishTimeMs: 60_000,
    });
    assert.equal(certifiedResult.metrics.activeDurationMs, 60_000);
    assert.equal(certifiedResult.xpEarned, 5);
    assert.deepEqual(certifiedResult.masteredKeys, []);
    assert.ok(
      (await database.keystrokeLog.findUnique({ where: { sessionId: certified.id } }))
        .events.some(event => event.type === 'focusLost'),
    );
    assert.equal(
      (await database.keyStat.findUnique({
        where: { userId_key: { userId, key: 'a' } },
      })).attempts,
      beforeCertified.attempts,
    );

    const terminalRaceAssignment = await service.start(user);
    instant = new Date(instant.getTime() + 60_000);
    const terminalRacePayload = {
      events: [...terminalRaceAssignment.text].map((char, seq) => ({
        seq,
        type: 'insert',
        t: seq * 200,
        char,
      })),
      finishTimeMs: (terminalRaceAssignment.text.length - 1) * 200,
    };
    const terminalRace = await Promise.allSettled([
      service.abandon(userId, terminalRaceAssignment.sessionId),
      service.submit(
        userId,
        terminalRaceAssignment.sessionId,
        terminalRacePayload,
      ),
    ]);
    const winners = terminalRace.filter(result => result.status === 'fulfilled');
    const rejected = terminalRace.find(result => result.status === 'rejected');
    assert.equal(winners.length, 1);
    assert.equal(rejected.reason.code, 'SESSION_UNAVAILABLE');

    const terminalRecord = await database.typingSession.findUnique({
      where: { id: terminalRaceAssignment.sessionId },
    });
    assert.equal(terminalRecord.status, winners[0].value.status);
    assert.equal(
      await database.keystrokeLog.count({
        where: { sessionId: terminalRaceAssignment.sessionId },
      }),
      Number(terminalRecord.status === 'completed'),
    );
  } finally {
    await database.user.deleteMany({
      where: { id: { in: [userId, assessmentOnlyUserId] } },
    });
    await database.$disconnect();
  }
});
