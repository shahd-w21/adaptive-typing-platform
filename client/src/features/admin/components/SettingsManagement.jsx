// FE-23 versioned learning-settings form for future sessions only.
import { useState } from 'react';
import { ConfirmDialog } from '../../../components/ConfirmDialog.jsx';
import { ErrorMessage } from '../../../components/ErrorMessage.jsx';
import { Loading } from '../../../components/Loading.jsx';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { useAdminSettings } from '../hooks/useAdmin.js';

/**
 * Renders validated immutable learning-policy settings and version activation.
 *
 * @returns {React.ReactNode}
 */
export function SettingsManagement() {
  const { t } = useTranslation();
  const settings = useAdminSettings();
  const [rawAccuracyGate, setRawAccuracyGate] = useState(null);
  const [reductionBoundary, setReductionBoundary] = useState(null);
  const [latencyCutoff, setLatencyCutoff] = useState(null);
  const [expectedVersion, setExpectedVersion] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  function buildInput() {
    const data = settings.settings.data;
    return {
      currentVersion: data?.currentVersion || expectedVersion || 'v1.2.0',
      rawAccuracyGatePercent: Number(
        rawAccuracyGate ?? data?.rawAccuracyGatePercent ?? 95,
      ),
      difficultyReductionPercent: Number(
        reductionBoundary ?? data?.difficultyReductionPercent ?? 90,
      ),
      initialLatencyCutoffMs: Number(
        latencyCutoff ?? data?.initialLatencyCutoffMs ?? 2000,
      ),
      expectedCurrentVersion:
        expectedVersion ?? data?.currentVersion ?? 'v1.2.0',
    };
  }

  function validateFields() {
    const data = settings.settings.data;
    const gate = Number(
      rawAccuracyGate ?? data?.rawAccuracyGatePercent ?? 95,
    );
    const reduction = Number(
      reductionBoundary ?? data?.difficultyReductionPercent ?? 90,
    );
    const cutoff = Number(
      latencyCutoff ?? data?.initialLatencyCutoffMs ?? 2000,
    );
    const version =
      expectedVersion ?? data?.currentVersion ?? 'v1.2.0';
    if (!Number.isInteger(gate) || gate < 80 || gate > 99) {
      return t('adminSettings.validationGate');
    }
    if (!Number.isInteger(reduction) || reduction < 70 || reduction > 94) {
      return t('adminSettings.validationReduction');
    }
    if (reduction >= gate) {
      return t('adminSettings.validationOrder');
    }
    if (!Number.isInteger(cutoff) || cutoff < 500 || cutoff > 5000) {
      return t('adminSettings.validationLatency');
    }
    if (!/^v\d+\.\d+\.\d+$/.test(version)) {
      return t('adminSettings.validationVersion');
    }
    return '';
  }

  function openConfirmation() {
    const error = validateFields();
    setValidationError(error);
    if (!error) {
      setConfirmOpen(true);
    }
  }

  async function activateSettings() {
    try {
      await settings.activate.mutateAsync(buildInput());
      setConfirmOpen(false);
      setValidationError('');
    } catch {
      // Keep the confirmation open and expose the mutation error for retry.
    }
  }

  if (settings.settings.isPending) {
    return <Loading />;
  }
  if (settings.settings.isError) {
    return (
      <ErrorMessage
        error={settings.settings.error}
        onRetry={() => settings.settings.refetch()}
        retrying={settings.settings.isFetching}
      />
    );
  }

  return (
    <section
      aria-labelledby="admin-settings-title"
      className="max-w-160 min-w-0"
    >
      {settings.source === 'fixture' && (
        <p role="status" className="mb-5 rounded-control bg-warning-soft p-3 text-sm text-warning-text">
          {t('common.adminFixtureNotice')}
        </p>
      )}

      <h2 id="admin-settings-title" className="mb-2 font-display text-xl font-bold">
        {t('adminSettings.title')}
      </h2>
      <p className="mb-5 text-sm text-muted">
        {t('adminSettings.futureOnly')}
      </p>

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="accuracy-gate" className="mb-1.5 block text-sm font-bold">
            {t('adminSettings.accuracyGate')}
          </label>
          <input
            id="accuracy-gate"
            type="number"
            min="80"
            max="99"
            value={rawAccuracyGate ?? settings.settings.data?.rawAccuracyGatePercent ?? 95}
            onChange={(event) => setRawAccuracyGate(event.target.value)}
            className="h-12 w-32 rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="difficulty-reduction" className="mb-1.5 block text-sm font-bold">
            {t('adminSettings.reductionBoundary')}
          </label>
          <input
            id="difficulty-reduction"
            type="number"
            min="70"
            max="94"
            value={reductionBoundary ?? settings.settings.data?.difficultyReductionPercent ?? 90}
            onChange={(event) => setReductionBoundary(event.target.value)}
            className="h-12 w-32 rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="latency-cutoff" className="mb-1.5 block text-sm font-bold">
            {t('adminSettings.latencyCutoff')}
          </label>
          <input
            id="latency-cutoff"
            type="number"
            min="500"
            max="5000"
            step="100"
            value={latencyCutoff ?? settings.settings.data?.initialLatencyCutoffMs ?? 2000}
            onChange={(event) => setLatencyCutoff(event.target.value)}
            className="h-12 w-40 rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="expected-version" className="mb-1.5 block text-sm font-bold">
            {t('adminSettings.expectedVersion')}
          </label>
          <input
            id="expected-version"
            value={expectedVersion ?? settings.settings.data?.currentVersion ?? 'v1.2.0'}
            onChange={(event) => setExpectedVersion(event.target.value)}
            className="h-12 w-40 rounded-control border-2 border-border-control bg-surface px-4 text-ink focus:border-focus-ring focus:outline-none"
          />
          <p className="mt-2 text-xs text-muted">
            {t('adminSettings.conflictHelp')}
          </p>
        </div>

        {validationError && (
          <ErrorMessage
            error={{ code: 'INVALID_REQUEST' }}
            title={validationError}
            message={validationError}
          />
        )}

        {settings.activate.error && (
          <ErrorMessage
            error={settings.activate.error}
            onRetry={activateSettings}
            retrying={settings.activate.isPending}
          />
        )}

        <button
          type="button"
          onClick={openConfirmation}
          disabled={settings.activate.isPending}
          className="min-h-11 self-start rounded-full bg-action-primary px-5 py-2 font-bold text-action-foreground hover:bg-action-hover disabled:cursor-wait"
        >
          {t('adminSettings.activate')}
        </button>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          open
          title={t('adminSettings.confirmTitle')}
          description={t('adminSettings.confirmDescription')}
          confirmLabel={t('adminSettings.activate')}
          cancelLabel={t('common.cancel')}
          pending={settings.activate.isPending}
          error={settings.activate.error}
          onCancel={() => {
            if (!settings.activate.isPending) {
              setConfirmOpen(false);
            }
          }}
          onConfirm={activateSettings}
        />
      )}
    </section>
  );
}
