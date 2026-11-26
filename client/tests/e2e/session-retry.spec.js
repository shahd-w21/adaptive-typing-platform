// Browser coverage for uncertain submissions, retries, conflicts and expiry.
import { test, expect } from '../support/browser.js';
import { mockPracticeSession } from '../support/typing-session.js';

async function completeAssignedText(page, text) {
  await page
    .getByRole('textbox', { name: 'Typing input stream' })
    .pressSequentially(text);
}

test('a committed response lost in transit is recovered without a second submit', async ({
  page,
}) => {
  const flow = await mockPracticeSession(page, {
    submitBehavior: 'commit-then-drop',
  });
  await flow.openPractice();
  await completeAssignedText(page, flow.assignment.text);

  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(
    page.getByText('Official performance metrics saved by the server.'),
  ).toBeVisible();
  expect(flow.submitBodies).toHaveLength(1);
});

test('a retry after a pre-commit lost response resends the frozen body identically', async ({
  page,
}) => {
  const flow = await mockPracticeSession(page, {
    submitBehavior: 'drop-then-success',
  });
  await flow.openPractice();
  await completeAssignedText(page, flow.assignment.text);

  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(
    page.getByText('Official performance metrics saved by the server.'),
  ).toBeVisible();
  expect(flow.submitBodies).toHaveLength(2);
  expect(flow.submitBodies[1]).toEqual(flow.submitBodies[0]);
});

test('a conflicting retry remains an error and is not offered again', async ({
  page,
}) => {
  const flow = await mockPracticeSession(page, {
    submitBehavior: 'drop-then-conflict',
  });
  await flow.openPractice();
  await completeAssignedText(page, flow.assignment.text);

  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toHaveCount(0);
  expect(flow.submitBodies).toHaveLength(2);
  expect(flow.submitBodies[1]).toEqual(flow.submitBodies[0]);
});

test('an assignment that expires before retry is not resubmitted', async ({
  page,
}) => {
  const flow = await mockPracticeSession(page, {
    submitBehavior: 'drop-then-expire',
  });
  await flow.openPractice();
  await completeAssignedText(page, flow.assignment.text);

  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toHaveCount(0);
  expect(flow.submitBodies).toHaveLength(1);
});
