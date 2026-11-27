// Practice typing UI, event capture, accessibility cues and presentation stability.
import { env } from 'node:process';
import { test, expect } from '../support/browser.js';
import { mockPracticeSession } from '../support/typing-session.js';

test('practice renders input feedback and submits ordered events for an official result', async ({
  page,
}) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  const flow = await mockPracticeSession(page, { text: 'aA! b' });
  await flow.openPractice();

  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  await expect(input).toBeFocused();
  const pastePrevented = await input.evaluate((element) => {
    const data = new DataTransfer();
    data.setData('text/plain', 'pasted');
    const event = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: data,
    });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  });
  const dropPrevented = await input.evaluate((element) => {
    const data = new DataTransfer();
    data.setData('text/plain', 'dropped');
    const event = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: data,
    });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(pastePrevented).toBe(true);
  expect(dropPrevented).toBe(true);

  await input.press('b');
  await expect(page.locator('.select-none span').nth(0)).toHaveText('b');
  await expect(page.locator('.select-none span').nth(0)).toHaveClass(
    /text-error-text/,
  );
  await input.press('Backspace');
  await input.press('a');
  await input.press('A');
  await input.press('!');
  await input.press('Space');
  await input.press('b');

  await expect(
    page.getByText('Official performance metrics saved by the server.'),
  ).toBeVisible();
  expect(flow.startBodies).toEqual([{ mode: 'practice' }]);
  expect(flow.submitBodies).toHaveLength(1);
  const payload = flow.submitBodies[0];
  expect(Object.keys(payload).sort()).toEqual(['events', 'finishTimeMs']);
  expect(payload.events.map(({ type, char }) => [type, char ?? null])).toEqual([
    ['insert', 'b'],
    ['backspace', null],
    ['insert', 'a'],
    ['insert', 'A'],
    ['insert', '!'],
    ['insert', ' '],
    ['insert', 'b'],
  ]);
  expect(payload.events.map(({ seq }) => seq)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  expect(payload.events.map(({ t }) => t)).toEqual(
    [...payload.events.map(({ t }) => t)].sort((left, right) => left - right),
  );
  expect(payload.finishTimeMs).toBe(payload.events.at(-1).t);
  await page
    .getByRole('button', { name: 'Return to dashboard' })
    .click();
  await expect(page.getByRole('table')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('practice pause and desktop resizing preserve focus and accepted events', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const flow = await mockPracticeSession(page, { text: 'ab' });
  await flow.openPractice();

  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  await input.press('a');
  await expect(page.getByRole('img', {
    name: 'Illustration of the fingers used for the next English QWERTY key.',
  })).toBeVisible();
  const handGuideToggle = page.getByRole('button', {
    name: 'Hand guide: On',
  });
  await handGuideToggle.click();
  await expect(page.getByRole('img', {
    name: 'Illustration of the fingers used for the next English QWERTY key.',
  })).toHaveCount(0);
  await page.getByRole('button', { name: 'Hand guide: Off' }).click();
  await page.getByRole('button', { name: /Large text:/i }).click();
  await input.focus();
  await page.setViewportSize({ width: 1100, height: 800 });
  await expect(input).toBeFocused();
  await expect(page.locator('.select-none span').nth(0)).toHaveClass(
    /text-success-text/,
  );
  await input.evaluate((element) => element.blur());
  await page.keyboard.press('b');
  await expect(page.locator('.select-none span').nth(1)).toHaveClass(
    /bg-learning-soft/,
  );
  await input.focus();

  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByText('Practice paused')).toBeVisible();
  await input.press('b');
  await page
    .getByRole('button', { name: 'Resume', exact: true })
    .last()
    .click();
  await expect(input).toBeFocused();
  await input.press('b');

  await expect(
    page.getByText('Official performance metrics saved by the server.'),
  ).toBeVisible();
  const events = flow.submitBodies[0].events;
  expect(events.map((event) => event.type)).toEqual([
    'insert',
    'pause',
    'resume',
    'insert',
  ]);
  expect(events.filter((event) => event.type === 'insert').map((event) => event.char))
    .toEqual(['a', 'b']);
});

test('five-minute scripted practice reports observed DOM latency without asserting the target', async ({
  page,
}, testInfo) => {
  test.skip(
    env.TYPEFLOW_RUN_TYPING_PERF !== '1',
    'Set TYPEFLOW_RUN_TYPING_PERF=1 to run the five-minute measurement.',
  );
  test.setTimeout(360_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  const flow = await mockPracticeSession(page, { text: 'a'.repeat(3000) });
  await flow.openPractice();

  await page.evaluate(() => {
    const input = document.querySelector(
      'input[aria-label="Typing input stream"]',
    );
    const passage = document.querySelector('.select-none');
    const stats = {
      accepted: 0,
      displayed: 0,
      pending: [],
      latenciesMs: [],
      startedAt: performance.now(),
    };
    window.__typingPerfStats = stats;
    input.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'a' && !event.repeat) {
          stats.accepted += 1;
          stats.pending.push(performance.now());
        }
      },
      true,
    );
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.target.classList.contains('text-success-text')) {
          const inputAt = stats.pending.shift();
          if (inputAt !== undefined) {
            stats.displayed += 1;
            stats.latenciesMs.push(performance.now() - inputAt);
          }
        }
      }
    }).observe(passage, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class'],
    });
  });

  const durationMs = 5 * 60 * 1000;
  const inputIntervalMs = 200;
  const startedAt = Date.now();
  let nextInputAt = startedAt;
  const input = page.getByRole('textbox', { name: 'Typing input stream' });
  while (Date.now() - startedAt < durationMs) {
    await input.press('a');
    nextInputAt += inputIntervalMs;
    const delay = nextInputAt - Date.now();
    if (delay > 0) {
      await page.waitForTimeout(delay);
    } else {
      nextInputAt = Date.now();
    }
  }
  await page.waitForFunction(
    () => window.__typingPerfStats.pending.length === 0,
  );
  const report = await page.evaluate(() => {
    const { accepted, displayed, latenciesMs, startedAt } =
      window.__typingPerfStats;
    const ordered = [...latenciesMs].sort((left, right) => left - right);
    return {
      accepted,
      displayed,
      durationMs: performance.now() - startedAt,
      p95Ms: ordered[Math.ceil(ordered.length * 0.95) - 1] ?? null,
      maxMs: ordered.at(-1) ?? null,
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      devicePixelRatio: window.devicePixelRatio,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
  });
  console.log(`TYPING_PERF ${JSON.stringify(report)}`);
  testInfo.annotations.push({
    type: 'typing-performance',
    description: JSON.stringify(report),
  });
  expect(report.accepted).toBeGreaterThan(0);
  expect(report.displayed).toBe(report.accepted);
});
