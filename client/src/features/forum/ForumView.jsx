// Existing community screen extended with draft DTO-backed reading and participation flows.
import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Dialog } from '../../components/ui/Dialog.jsx';
import { CheckIcon } from '../../components/ui/Icons.jsx';
import { Loading } from '../../components/Loading.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorMessage } from '../../components/ErrorMessage.jsx';
import { useTranslation } from '../../i18n/useTranslation.js';
import { useForum } from './hooks/useForum.js';
import { ForumForm } from './components/ForumForm.jsx';
import {
  ForumPagination,
  ForumThread,
  UnavailablePost,
} from './components/ForumThread.jsx';

/** Preserve the existing list/new-discussion entry point; reuse shared states and dialogs. */
export function ForumView({ api }) {
  const { t } = useTranslation();
  const forum = useForum(api);
  const dialogTitleId = useId();
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [notice, setNotice] = useState('');
  const acceptedAttempt = useRef(null);
  const viewRef = useRef(null);
  const {
    list,
    detail,
    mutation,
    selection,
  } = forum;
  const pending = mutation.isPending;
  const thread = detail.data;

  useEffect(() => {
    if (notice && !showNewThreadModal && !reportPostId && !detail.isPending) {
      // Successful actions may remove their opener (report/accept). Return keyboard
      // focus to the discussion instead of leaving it on an inert/removed control.
      viewRef.current?.querySelector('h2[tabindex="-1"]')?.focus({ preventScroll: true });
    }
  }, [notice, showNewThreadModal, reportPostId, detail.isPending]);

  /** Open a fresh form/error boundary without discarding another pending operation. */
  function openCreate() {
    mutation.reset();
    setNotice('');
    setShowNewThreadModal(true);
  }

  /** Reporting never hides a post locally; only a future server DTO decides visibility. */
  function openReport(postId) {
    mutation.reset();
    setNotice('');
    setReportPostId(postId);
  }

  /** Retry a failed accepted-answer selection using the same operation ID. */
  async function acceptAnswer(replyId) {
    const target = `${selection.threadId}/${replyId}`;
    if (acceptedAttempt.current?.target !== target) {
      acceptedAttempt.current = {
        target,
        requestId: crypto.randomUUID(),
      };
    }
    setNotice('');
    const saved = await forum.perform('accept', {
      threadId: selection.threadId,
      replyId,
      requestId: acceptedAttempt.current.requestId,
    });
    if (saved) {
      acceptedAttempt.current = null;
      setNotice('forum.acceptedSaved');
    }
  }

  return (
    <div ref={viewRef} className="mx-auto my-0 max-w-240 min-w-0 wrap-anywhere" data-forum>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="mb-1 font-display text-[32px] font-bold leading-[44px] rtl:font-arabic max-md:text-[24px] max-md:leading-[32px]">{t('forum.title')}</h1>
          <p className="text-base leading-[26px] text-muted">{t('forum.description')}</p>
        </div>
        {!list.isError && list.data?.permissions?.canCreateThread === true && (
          <button type="button" disabled={pending} onClick={openCreate} className="min-h-11 rounded-full bg-action-primary px-5 py-2 text-sm font-bold text-action-foreground shadow-primary hover:bg-action-hover disabled:opacity-60">{t('forum.newDiscussion')}</button>
        )}
      </div>

      {forum.source === 'development-fixture' && <p role="note" className="mb-5 rounded-control border border-warning-accent/40 bg-warning-soft p-3 text-sm text-warning-text">{t('forum.fixtureNotice')}</p>}
      {notice && <p role="status" className="mb-5 rounded-control bg-success-soft p-3 text-success-text">{t(notice)}</p>}

      {selection.threadId ? (
        <>
          <button type="button" disabled={pending} onClick={() => {
            forum.openThread(null);
            setNotice('');
          }} className="mb-5 min-h-11 rounded-full border border-border-control px-5 py-2 font-bold disabled:opacity-60">{t('forum.backToThreads')}</button>
          {detail.isPending ? <Loading /> : detail.isError ? (
            <ErrorMessage error={detail.error} onRetry={() => detail.refetch()} retrying={detail.isFetching} />
          ) : thread && (
            <>
              {mutation.variables?.method === 'accept' && mutation.isError && (
                <div className="mb-5">
                  <ErrorMessage error={mutation.error} onRetry={() => acceptAnswer(mutation.variables.input.replyId)} retrying={pending} />
                </div>
              )}
              <ForumThread key={thread.id} thread={thread} forum={forum} onReport={openReport} onAccepted={acceptAnswer} onReply={() => setNotice('forum.replySaved')} />
            </>
          )}
        </>
      ) : list.isPending ? <Loading /> : list.isError ? (
        <ErrorMessage error={list.error} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : (
        <>
          {list.data?.permissions?.canCreateThread !== true && <p className="mb-4 text-muted">{t('forum.readOnly')}</p>}
          {!list.data?.items.length ? <EmptyState title={t('forum.noThreads')} description={t('forum.noThreadsHelp')} /> : (
            <div className="flex flex-col gap-3.5">
              {list.data.items.map(item => item.status !== 'visible' ? (
                <UnavailablePost key={item.id} status={item.status} />
              ) : (
                <article key={item.id} className="min-w-0 rounded-card border border-border-subtle bg-surface p-5 shadow-card hover:border-border-control">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-subtle px-2 py-0.5 text-xs font-bold">{t(`forum.categories.${item.category}`)}</span>
                    {item.acceptedReplyId && <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success-text"><CheckIcon size={12} />{t('forum.accepted')}</span>}
                  </div>
                  <h2 className="mb-1 font-display text-base font-bold leading-[30px]">
                    <button type="button" dir="auto" onClick={() => {
                      forum.openThread(item.id);
                      setNotice('');
                    }} className="min-h-11 max-w-full cursor-pointer text-start text-action-link underline-offset-4 hover:underline wrap-anywhere">{item.title}</button>
                  </h2>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                    <p>{t('forum.by')} <bdi>{item.author}</bdi></p>
                    <p>{t('forum.replyCount', { count: item.replyCount })}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
          {list.data && <ForumPagination page={list.data.page} totalPages={list.data.totalPages} onPage={forum.setListPage} disabled={pending || list.isFetching} label={t('forum.threadPages')} />}
        </>
      )}

      {showNewThreadModal && (
        <Dialog open onClose={() => setShowNewThreadModal(false)} dismissible={!pending} labelledBy={dialogTitleId} className="m-auto w-[calc(100%_-_2rem)] max-w-130 rounded-dialog p-5 sm:p-6">
          <h2 id={dialogTitleId} className="mb-4 font-display text-xl font-bold">{t('forum.createTitle')}</h2>
          <ForumForm mode="create" forum={forum} onCancel={() => setShowNewThreadModal(false)} onSuccess={() => {
            setShowNewThreadModal(false);
            setNotice('forum.threadSaved');
          }} />
        </Dialog>
      )}
      {reportPostId && (
        <Dialog open onClose={() => setReportPostId(null)} dismissible={!pending} labelledBy={dialogTitleId} className="m-auto w-[calc(100%_-_2rem)] max-w-130 rounded-dialog p-5 sm:p-6">
          <h2 id={dialogTitleId} className="mb-4 font-display text-xl font-bold">{t('forum.reportTitle')}</h2>
          <ForumForm mode="report" forum={forum} threadId={selection.threadId} postId={reportPostId} onCancel={() => setReportPostId(null)} onSuccess={() => {
            setReportPostId(null);
            setNotice('forum.reportSaved');
          }} />
        </Dialog>
      )}
    </div>
  );
}
