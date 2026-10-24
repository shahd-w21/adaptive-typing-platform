// Localized forum discovery controls; the hook owns query criteria and pagination.
import { useId } from 'react';
import { useTranslation } from '../../../i18n/useTranslation.js';

const controlClass = 'min-h-11 w-full min-w-0 rounded-control border-2 border-border-control bg-surface px-3 py-2 text-ink focus:border-focus-ring disabled:opacity-60';

/** Keep search and combined filters reachable on phones/RTL, including during failed reads. */
export function ForumFilters({ forum }) {
  const { t } = useTranslation();
  const id = useId();
  const { search, category, answerStatus } = forum.listOptions;
  const pending = forum.mutation.isPending;
  const canClear = search !== '' || category !== 'all' || answerStatus !== 'all';

  return (
    <form
      role="search"
      aria-label={t('forum.searchAndFilter')}
      onSubmit={event => event.preventDefault()}
      className="mb-5 min-w-0 rounded-card border border-border-subtle bg-surface p-4"
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <label htmlFor={`${id}-search`} className="mb-1.5 block font-bold">
            {t('forum.searchDiscussions')}
          </label>
          <input
            id={`${id}-search`}
            type="search"
            dir="auto"
            value={search}
            onChange={event => forum.updateFilters({ search: event.target.value })}
            placeholder={t('forum.searchPlaceholder')}
            aria-describedby={`${id}-help`}
            disabled={pending}
            className={controlClass}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-category`} className="mb-1.5 block font-bold">
            {t('forum.category')}
          </label>
          <select
            id={`${id}-category`}
            value={category}
            onChange={event => forum.updateFilters({ category: event.target.value })}
            disabled={pending}
            className={controlClass}
          >
            <option value="all">{t('forum.allCategories')}</option>
            {['technique', 'adaptive', 'hardware', 'general'].map(value => (
              <option key={value} value={value}>{t(`forum.categories.${value}`)}</option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-status`} className="mb-1.5 block font-bold">
            {t('forum.answerStatus')}
          </label>
          <select
            id={`${id}-status`}
            value={answerStatus}
            onChange={event => forum.updateFilters({ answerStatus: event.target.value })}
            disabled={pending}
            className={controlClass}
          >
            <option value="all">{t('forum.allStatuses')}</option>
            <option value="accepted">{t('forum.withAcceptedAnswer')}</option>
            <option value="unaccepted">{t('forum.withoutAcceptedAnswer')}</option>
          </select>
        </div>
      </div>
      <p id={`${id}-help`} className="mt-3 text-sm text-muted">{t('forum.searchHelp')}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {forum.list.data && !forum.list.isFetching && !forum.list.isError && (
          <p role="status" className="text-sm text-muted">
            {t('forum.resultCount', { count: forum.list.data.totalItems })}
          </p>
        )}
        <button
          type="button"
          onClick={forum.clearFilters}
          disabled={pending || !canClear}
          className="min-h-11 rounded-full border border-border-control px-4 py-2 font-bold disabled:opacity-60"
        >
          {t('forum.clearFilters')}
        </button>
      </div>
    </form>
  );
}
