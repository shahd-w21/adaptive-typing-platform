// FE-18 protected user directory; uses the explicit development fixture boundary
// until the reviewed admin user-management API and audit contract are implemented.
import { useState } from 'react';
import { ConfirmDialog } from '../../../components/ConfirmDialog.jsx';
import { EmptyState } from '../../../components/EmptyState.jsx';
import { ErrorMessage } from '../../../components/ErrorMessage.jsx';
import { Loading } from '../../../components/Loading.jsx';
import { Dialog } from '../../../components/ui/Dialog.jsx';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { useAdminUsers } from '../hooks/useAdmin.js';

function validateCreateAdmin(values) {
  if (!values.name.trim()) {
    return 'adminUsers.nameRequired';
  }
  if (!values.email.trim()) {
    return 'adminUsers.emailRequired';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    return 'adminUsers.emailInvalid';
  }
  return '';
}

/**
 * Render protected account search, pagination and confirmed account mutations.
 *
 * @returns {React.ReactNode} The admin user-management interface.
 */
export function UserManagement() {
  const { t, isRTL } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createValues, setCreateValues] = useState({ name: '', email: '' });
  const [createValidationError, setCreateValidationError] = useState('');
  const users = useAdminUsers({
    search,
    page,
    pageSize: 5,
  });
  const list = users.list;
  const data = list.data;

  function closeConfirmation() {
    if (users.deactivate.isPending || users.deleteUser.isPending) {
      return;
    }
    setConfirmAction(null);
  }

  async function confirmMutation() {
    if (!confirmAction) {
      return;
    }
    try {
      if (confirmAction.kind === 'deactivate') {
        await users.deactivate.mutateAsync(confirmAction.user.id);
      } else {
        await users.deleteUser.mutateAsync(confirmAction.user.id);
      }
      setConfirmAction(null);
    } catch {
      // Keep the record visible and the dialog open so the caller can retry.
    }
  }

  async function submitCreate(event) {
    event.preventDefault();
    const validationError = validateCreateAdmin(createValues);
    setCreateValidationError(validationError);
    if (validationError) {
      return;
    }
    try {
      await users.createAdmin.mutateAsync({
        name: createValues.name.trim(),
        email: createValues.email.trim(),
      });
      users.createAdmin.reset();
      setCreateOpen(false);
      setCreateValues({ name: '', email: '' });
      setPage(1);
    } catch {
      // Retain entered values and expose the mutation error for explicit retry.
    }
  }

  const confirmationPending =
    confirmAction?.kind === 'deactivate'
      ? users.deactivate.isPending
      : users.deleteUser.isPending;
  const confirmationError =
    confirmAction?.kind === 'deactivate'
      ? users.deactivate.error
      : users.deleteUser.error;

  return (
    <section
      aria-labelledby="admin-user-directory-title"
      className="min-w-0"
    >
      {users.source === 'fixture' && (
        <p role="status" className="mb-4 rounded-control bg-warning-soft p-3 text-sm text-warning-text">
          {t('common.adminFixtureNotice')}
        </p>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-96">
          <label htmlFor="admin-user-search" className="mb-1.5 block text-sm font-bold">
            {t('adminUsers.searchLabel')}
          </label>
          <input
            id="admin-user-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={t('adminUsers.searchPlaceholder')}
            className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            users.createAdmin.reset();
            setCreateValidationError('');
            setCreateOpen(true);
          }}
          className="min-h-11 rounded-full bg-action-primary px-5 py-2 font-bold text-action-foreground hover:bg-action-hover"
        >
          {t('adminUsers.createAdmin')}
        </button>
      </div>

      {list.isPending ? (
        <Loading />
      ) : list.isError ? (
        <ErrorMessage
          error={list.error}
          onRetry={() => list.refetch()}
          retrying={list.isFetching}
        />
      ) : !data?.items.length ? (
        <EmptyState
          title={t('adminUsers.noUsers')}
          description={t('adminUsers.noUsersHelp')}
        />
      ) : (
        <>
          <div
            role="region"
            aria-label={t('navigation.userDirectory')}
            tabIndex={0}
            className="max-w-full overflow-x-auto rounded-control border border-border-subtle"
          >
            <table className={`w-full border-collapse ${isRTL ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="border-b-2 border-b-border-subtle text-[13px] text-muted">
                  <th className="px-3 py-2.5">{t('adminUsers.name')}</th>
                  <th className="px-3 py-2.5">{t('adminUsers.email')}</th>
                  <th className="px-3 py-2.5">{t('adminUsers.role')}</th>
                  <th className="px-3 py-2.5">{t('adminUsers.status')}</th>
                  <th className="px-3 py-2.5">{t('adminUsers.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => (
                  <tr key={user.id} className="border-b border-b-border-subtle text-sm last:border-b-0">
                    <td className="min-w-36 p-3 font-bold">{user.name}</td>
                    <td className="min-w-44 p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={[
                        'rounded-full px-2 py-0.5 text-xs font-bold',
                        user.role === 'admin'
                          ? 'bg-learning-soft text-learning-strong'
                          : 'bg-subtle text-ink',
                      ].join(' ')}>
                        {t(`adminUsers.roles.${user.role}`)}
                      </span>
                    </td>
                    <td className={[
                      'p-3',
                      user.isActive ? 'text-success-text' : 'text-muted',
                    ].join(' ')}>
                      {t(user.isActive ? 'adminUsers.active' : 'adminUsers.inactive')}
                    </td>
                    <td className="min-w-52 p-3">
                      {user.isLastActiveAdmin ? (
                        <span className="text-xs italic text-muted">
                          {t('adminUsers.lastAdminProtected')}
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user.isActive && (
                            <button
                              type="button"
                              onClick={() => setConfirmAction({ kind: 'deactivate', user })}
                              className="min-h-11 rounded-full border border-border-control px-3 py-1 text-sm font-bold text-warning-text"
                            >
                              {t('adminUsers.deactivate')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setConfirmAction({ kind: 'delete', user })}
                            className="min-h-11 rounded-full border border-error-text px-3 py-1 text-sm font-bold text-error-text"
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <nav
              aria-label={t('adminUsers.pagination')}
              className="mt-4 flex flex-wrap items-center justify-end gap-3"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="min-h-11 rounded-full border border-border-control px-4 font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('common.back')}
              </button>
              <span className="text-sm text-muted">
                {t('adminUsers.page', { page: data.page, total: data.totalPages })}
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((current) => Math.min(data.totalPages, current + 1))}
                className="min-h-11 rounded-full border border-border-control px-4 font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('common.continue')}
              </button>
            </nav>
          )}
        </>
      )}

      {confirmAction && (
        <ConfirmDialog
          open
          title={t(
            confirmAction.kind === 'deactivate'
              ? 'adminUsers.confirmDeactivateTitle'
              : 'adminUsers.confirmDeleteTitle',
          )}
          description={t(
            confirmAction.kind === 'deactivate'
              ? 'adminUsers.confirmDeactivate'
              : 'adminUsers.confirmDelete',
            { name: confirmAction.user.name },
          )}
          confirmLabel={t(
            confirmAction.kind === 'deactivate'
              ? 'adminUsers.deactivate'
              : 'common.delete',
          )}
          cancelLabel={t('common.cancel')}
          destructive
          pending={confirmationPending}
          error={confirmationError}
          onCancel={closeConfirmation}
          onConfirm={confirmMutation}
        />
      )}

      {createOpen && (
        <Dialog
          open
          onClose={() => {
            if (!users.createAdmin.isPending) {
              setCreateOpen(false);
              setCreateValidationError('');
            }
          }}
          dismissible={!users.createAdmin.isPending}
          labelledBy="create-admin-title"
          className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-dialog p-6"
        >
          <h2 id="create-admin-title" className="mb-5 font-display text-xl font-bold">
            {t('adminUsers.createTitle')}
          </h2>
          <form onSubmit={submitCreate} className="flex flex-col gap-4">
            <div>
              <label htmlFor="create-admin-name" className="mb-1.5 block text-sm font-bold">
                {t('adminUsers.name')}
              </label>
              <input
                id="create-admin-name"
                value={createValues.name}
                onChange={(event) => setCreateValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))}
                maxLength={100}
                className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="create-admin-email" className="mb-1.5 block text-sm font-bold">
                {t('adminUsers.email')}
              </label>
              <input
                id="create-admin-email"
                type="email"
                value={createValues.email}
                onChange={(event) => setCreateValues((current) => ({
                  ...current,
                  email: event.target.value,
                }))}
                maxLength={254}
                className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none"
              />
            </div>
            {(createValidationError || users.createAdmin.error) && (
              <ErrorMessage
                error={
                  users.createAdmin.error
                    ? users.createAdmin.error
                    : { code: 'INVALID_REQUEST' }
                }
                title={createValidationError ? t(createValidationError) : undefined}
                message={createValidationError ? t(createValidationError) : undefined}
              />
            )}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={users.createAdmin.isPending}
                onClick={() => setCreateOpen(false)}
                className="min-h-11 rounded-full border border-border-control px-5 py-2 font-bold"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={users.createAdmin.isPending}
                className="min-h-11 rounded-full bg-action-primary px-5 py-2 font-bold text-action-foreground disabled:cursor-wait"
              >
                {users.createAdmin.isPending ? t('common.saving') : t('adminUsers.createAdmin')}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </section>
  );
}
