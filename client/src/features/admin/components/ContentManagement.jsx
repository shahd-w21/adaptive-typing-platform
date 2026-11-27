// FE-23 development content-authoring boundary for word lists, themes and key groups.
import { useState } from 'react';
import { ConfirmDialog } from '../../../components/ConfirmDialog.jsx';
import { ErrorMessage } from '../../../components/ErrorMessage.jsx';
import { Loading } from '../../../components/Loading.jsx';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { useAdminContent } from '../hooks/useAdmin.js';

function parseLineList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Renders the draft content forms and validation preview for FE-23.
 *
 * @returns {React.ReactNode}
 */
export function ContentManagement() {
  const { t } = useTranslation();
  const content = useAdminContent();
  const [words, setWords] = useState(null);
  const [blockedWords, setBlockedWords] = useState(null);
  const [themeLabel, setThemeLabel] = useState(null);
  const [keys, setKeys] = useState(null);
  const [prerequisites, setPrerequisites] = useState(null);
  const [validationPreview, setValidationPreview] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function buildInput() {
    const draft = content.content.data;
    return {
      version: draft?.version || 'v1.2.0',
      words: parseLineList(
        words ?? draft?.wordLists[0]?.words.join(', ') ?? '',
      ),
      blockedWords: parseLineList(
        blockedWords ?? draft?.blockedWords.words.join(', ') ?? '',
      ),
      themeLabel: (
        themeLabel ?? draft?.themes[0]?.label ?? ''
      ).trim(),
      keys: parseLineList(
        keys ?? draft?.keyGroups[0]?.keys.join(', ') ?? '',
      ).map((item) => item.toLowerCase()),
      prerequisites: parseLineList(
        prerequisites
          ?? draft?.keyGroups[0]?.prerequisiteGroupIds.join(', ')
          ?? '',
      ),
      source: 'team-authored',
    };
  }

  async function validateDraft() {
    setValidationPreview(null);
    try {
      const result = await content.validate.mutateAsync(buildInput());
      setValidationPreview(result);
    } catch {
      // The mutation retains the safe error for explicit retry.
    }
  }

  async function activateDraft() {
    try {
      await content.activate.mutateAsync(buildInput());
      setConfirmOpen(false);
      setValidationPreview(null);
    } catch {
      // Keep the confirmation open and show the mutation error for retry.
    }
  }

  if (content.content.isPending) {
    return <Loading />;
  }
  if (content.content.isError) {
    return (
      <ErrorMessage
        error={content.content.error}
        onRetry={() => content.content.refetch()}
        retrying={content.content.isFetching}
      />
    );
  }

  return (
    <section aria-labelledby="admin-content-title" className="min-w-0">
      {content.source === 'fixture' && (
        <p role="status" className="mb-5 rounded-control bg-warning-soft p-3 text-sm text-warning-text">
          {t('common.adminFixtureNotice')}
        </p>
      )}

      <h2 id="admin-content-title" className="mb-2 font-display text-xl font-bold">
        {t('adminContent.title')}
      </h2>
      <p className="mb-5 text-sm text-muted">
        {t('adminContent.description')}
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="admin-word-list" className="mb-1.5 block text-sm font-bold">
              {t('adminContent.wordLists')}
            </label>
            <textarea
              id="admin-word-list"
              value={words ?? content.content.data?.wordLists[0]?.words.join(', ') ?? ''}
              onChange={(event) => setWords(event.target.value)}
              rows={5}
              className="w-full rounded-control border-2 border-border-control bg-surface p-3 text-ink focus:border-focus-ring focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-blocked-words" className="mb-1.5 block text-sm font-bold">
              {t('adminContent.blockedWords')}
            </label>
            <textarea
              id="admin-blocked-words"
              value={blockedWords ?? content.content.data?.blockedWords.words.join(', ') ?? ''}
              onChange={(event) => setBlockedWords(event.target.value)}
              rows={3}
              className="w-full rounded-control border-2 border-border-control bg-surface p-3 text-ink focus:border-focus-ring focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-theme-label" className="mb-1.5 block text-sm font-bold">
              {t('adminContent.themeLabel')}
            </label>
            <input
              id="admin-theme-label"
              value={themeLabel ?? content.content.data?.themes[0]?.label ?? ''}
              onChange={(event) => setThemeLabel(event.target.value)}
              maxLength={100}
              className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none"
            />
            <p className="mt-2 text-xs text-muted">
              {t('adminContent.themeAppearanceNote')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="admin-key-group" className="mb-1.5 block text-sm font-bold">
              {t('adminContent.keyGroup')}
            </label>
            <textarea
              id="admin-key-group"
              value={keys ?? content.content.data?.keyGroups[0]?.keys.join(', ') ?? ''}
              onChange={(event) => setKeys(event.target.value)}
              rows={3}
              className="w-full rounded-control border-2 border-border-control bg-surface p-3 text-ink focus:border-focus-ring focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-prerequisites" className="mb-1.5 block text-sm font-bold">
              {t('adminContent.prerequisites')}
            </label>
            <input
              id="admin-prerequisites"
              value={prerequisites ?? content.content.data?.keyGroups[0]?.prerequisiteGroupIds.join(', ') ?? ''}
              onChange={(event) => setPrerequisites(event.target.value)}
              placeholder={t('adminContent.prerequisitesPlaceholder')}
              className="h-12 w-full rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none"
            />
          </div>

          {validationPreview && (
            <section
              role={validationPreview.valid ? 'status' : 'alert'}
              aria-label={t('adminContent.validationPreview')}
              className={[
                'rounded-card border p-4',
                validationPreview.valid
                  ? 'border-success-accent bg-success-soft'
                  : 'border-error-text/40 bg-error-soft',
              ].join(' ')}
            >
              <h3 className="mb-2 font-bold">
                {validationPreview.valid
                  ? t('adminContent.validationPassed')
                  : t('adminContent.validationFailed')}
              </h3>
              {validationPreview.errors.length > 0 && (
                <ul className="mb-3 list-disc ps-5 text-sm">
                  {validationPreview.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
              {validationPreview.valid && (
                <div className="grid gap-3 text-sm">
                  <p>
                    <strong>{t('adminContent.beginnerPreview')}:</strong>{' '}
                    {validationPreview.preview.beginner}
                  </p>
                  <p>
                    <strong>{t('adminContent.advancedPreview')}:</strong>{' '}
                    {validationPreview.preview.advanced}
                  </p>
                </div>
              )}
            </section>
          )}

          {(content.validate.error || content.activate.error) && (
            <ErrorMessage
              error={content.validate.error || content.activate.error}
              onRetry={
                content.validate.error
                  ? validateDraft
                  : activateDraft
              }
              retrying={content.validate.isPending || content.activate.isPending}
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={validateDraft}
          disabled={content.validate.isPending}
          className="min-h-11 rounded-full border border-border-control bg-surface px-5 py-2 font-bold"
        >
          {content.validate.isPending
            ? t('common.saving')
            : t('adminContent.validate')}
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={!validationPreview?.valid || content.activate.isPending}
          className="min-h-11 rounded-full bg-action-primary px-5 py-2 font-bold text-action-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('adminContent.activate')}
        </button>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          open
          title={t('adminContent.confirmTitle')}
          description={t('adminContent.confirmDescription')}
          confirmLabel={t('adminContent.activate')}
          cancelLabel={t('common.cancel')}
          destructive
          pending={content.activate.isPending}
          error={content.activate.error}
          onCancel={() => {
            if (!content.activate.isPending) {
              setConfirmOpen(false);
            }
          }}
          onConfirm={activateDraft}
        />
      )}
    </section>
  );
}
