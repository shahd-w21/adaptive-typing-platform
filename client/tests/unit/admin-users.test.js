// Unit checks for the FE-18 development-only user-management boundary.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminUsersApi } from '../../src/api/admin.js';

const admin = {
  id: '10000000-0000-4000-8000-000000000099',
  role: 'admin',
};

test('admin user fixture validates search, pagination and public DTO fields', async () => {
  const api = createAdminUsersApi(admin, {
    mode: 'fixture',
    csrfToken: 'a'.repeat(64),
  });

  const firstPage = await api.list({ search: '', page: 1, pageSize: 2 });
  assert.equal(firstPage.items.length, 2);
  assert.equal(firstPage.page, 1);
  assert.equal(firstPage.totalPages, 3);
  assert.equal(firstPage.items.every((item) => !('password' in item)), true);

  const search = await api.list({ search: 'Layla', page: 1, pageSize: 5 });
  assert.equal(search.totalItems, 1);
  assert.equal(search.items[0].email, 'layla@example.test');
});

test('admin user fixture protects the only active admin and removes another account', async () => {
  const api = createAdminUsersApi(admin, {
    mode: 'fixture',
    csrfToken: 'a'.repeat(64),
  });

  await api.deactivate('10000000-0000-4000-8000-000000000001');
  await assert.rejects(
    () => api.deactivate('10000000-0000-4000-8000-000000000004'),
  );

  const deactivated = await api.deactivate(
    '10000000-0000-4000-8000-000000000003',
  );
  assert.equal(deactivated.isActive, false);

  const deleted = await api.delete(
    '10000000-0000-4000-8000-000000000003',
  );
  assert.equal(deleted.deleted, true);
});

test('admin user fixture leaves records unchanged after a failed write and succeeds on retry', async () => {
  const api = createAdminUsersApi(admin, {
    mode: 'fixture',
    csrfToken: 'a'.repeat(64),
  });

  await assert.rejects(
    () => api.deactivate('10000000-0000-4000-8000-000000000005'),
  );
  const unchanged = await api.list({
    search: 'Mina',
    page: 1,
    pageSize: 5,
  });
  assert.equal(unchanged.items[0].isActive, true);

  const retried = await api.deactivate(
    '10000000-0000-4000-8000-000000000005',
  );
  assert.equal(retried.isActive, false);
});

test('admin user fixture requires CSRF and creates only an admin public DTO', async () => {
  const api = createAdminUsersApi(admin, {
    mode: 'fixture',
    csrfToken: null,
  });

  await assert.rejects(
    () => api.createAdmin({
      name: 'Nora Admin',
      email: 'nora@example.test',
    }),
  );

  const protectedApi = createAdminUsersApi(admin, {
    mode: 'fixture',
    csrfToken: 'a'.repeat(64),
  });
  const created = await protectedApi.createAdmin({
    name: 'Nora Admin',
    email: 'nora@example.test',
  });
  assert.equal(created.role, 'admin');
  assert.equal(created.isActive, true);
  assert.equal('password' in created, false);
});

test('admin user production boundary fails closed', async () => {
  const api = createAdminUsersApi(admin, { mode: 'unavailable' });
  await assert.rejects(
    () => api.list({ search: '', page: 1, pageSize: 5 }),
    (error) => error.code === 'FEATURE_UNAVAILABLE',
  );
});
