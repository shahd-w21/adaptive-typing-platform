// Thread detail rendering and pagination; authored strings are always plain React text.
import {
  useEffect,
  useRef,
} from 'react';
import { EmptyState } from '../../../components/EmptyState.jsx';
import { useTranslation } from '../../../i18n/useTranslation.js';
import { ForumForm } from './ForumForm.jsx';

/** Keep the current collection page announced and both navigation actions reachable in RTL. */
export function ForumPagination({ page, totalPages, onPage, disabled, label }) {
  const { t } = useTranslation();
  if (totalPages <= 1) {
    return null;
  }
  return (
    <nav aria-label={label} className="mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" disabled={disabled || page <= 1} onClick={() => onPage(page - 1)} className="min-h-11 rounded-full border border-border-control px-4 py-2 disabled:opacity-60">{t('forum.previous')}</button>
      <span role="status">{t('forum.page', { page, total: totalPages })}</span>
      <button type="button" disabled={disabled || page >= totalPages} onClick={() => onPage(page + 1)} className="min-h-11 rounded-full border border-border-control px-4 py-2 disabled:opacity-60">{t('forum.next')}</button>
    </nav>
  );
}

/** Unknown, hidden and deleted states never render body, title, identity or actions. */
export function UnavailablePost({ status }) {
  const { t } = useTranslation();
  return <p className="rounded-control border border-border-subtle bg-subtle p-4 text-muted">{t(status === 'hidden' ? 'forum.hiddenPost' : 'forum.unavailablePost')}</p>;
}

/** Render an authored post without HTML/Markdown interpretation or automatic translation. */
function PostText({ post }) {
  const { t } = useTranslation();
  return (
    <>
      <p className="mb-3 text-sm text-muted">{t('forum.by')} <bdi>{post.author}</bdi></p>
      <p dir="auto" className="whitespace-pre-wrap wrap-anywhere [unicode-bidi:plaintext]">{post.body}</p>
    </>
  );
}

/** Render the selected thread; permissions are DTO hints, never proof of authorization. */
export function ForumThread({ thread, forum, onReport, onAccepted, onReply }) {
  const { t } = useTranslation();
  const headingRef = useRef(null);
  const pending = forum.mutation.isPending;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [thread.id]);

  if (thread.status !== 'visible') {
    return <UnavailablePost status={thread.status} />;
  }

  const acceptedOnPage = thread.replies.some(reply => reply.status === 'visible' && reply.id === thread.acceptedReplyId);
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <article className="min-w-0 rounded-card border border-border-subtle bg-surface p-5 shadow-card">
        <h2 ref={headingRef} tabIndex={-1} dir="auto" className="mb-3 font-display text-xl font-bold wrap-anywhere">{thread.title}</h2>
        <PostText post={thread} />
        {thread.permissions?.canReport === true && (
          <button type="button" disabled={pending} onClick={() => onReport(thread.id)} className="mt-4 min-h-11 rounded-full border border-border-control px-4 py-2 font-bold">{t('forum.reportPost')}</button>
        )}
      </article>

      <section aria-label={t('forum.replies')} className="flex min-w-0 flex-col gap-4">
        <h2 className="font-display text-xl font-bold">{t('forum.replyCount', { count: thread.replyCount })}</h2>
        {thread.acceptedReplyId && !acceptedOnPage && <p className="text-sm text-success-text">{t('forum.acceptedElsewhere')}</p>}
        {!thread.replies.length && <EmptyState title={t('forum.noReplies')} description={t('forum.noRepliesHelp')} />}
        {thread.replies.map(reply => (
          <article key={reply.id} aria-label={t('forum.reply')} className="min-w-0 rounded-card border border-border-subtle bg-surface p-5">
            {reply.status !== 'visible' ? <UnavailablePost status={reply.status} /> : (
              <>
                {thread.acceptedReplyId === reply.id && <p className="mb-3 font-bold text-success-text" data-accepted-answer>{t('forum.accepted')}</p>}
                <PostText post={reply} />
                <div className="mt-4 flex flex-wrap gap-3">
                  {thread.permissions?.canAcceptAnswer === true && reply.id !== thread.acceptedReplyId && (
                    <button type="button" disabled={pending} onClick={() => onAccepted(reply.id)} className="min-h-11 rounded-full border border-border-control px-4 py-2 font-bold">{t(thread.acceptedReplyId ? 'forum.replaceAccepted' : 'forum.acceptAnswer')}</button>
                  )}
                  {reply.permissions?.canReport === true && (
                    <button type="button" disabled={pending} onClick={() => onReport(reply.id)} className="min-h-11 rounded-full border border-border-control px-4 py-2 font-bold">{t('forum.reportPost')}</button>
                  )}
                </div>
              </>
            )}
          </article>
        ))}
        <ForumPagination page={thread.page} totalPages={thread.totalPages} onPage={forum.setReplyPage} disabled={pending || forum.detail.isFetching} label={t('forum.replyPages')} />
      </section>

      <section aria-label={t('forum.yourReply')} className="rounded-card border border-border-subtle bg-surface p-5">
        {thread.permissions?.canReply === true ? (
          <ForumForm mode="reply" forum={forum} threadId={thread.id} onSuccess={onReply} />
        ) : <p className="text-muted">{t('forum.cannotReply')}</p>}
      </section>
    </div>
  );
}
