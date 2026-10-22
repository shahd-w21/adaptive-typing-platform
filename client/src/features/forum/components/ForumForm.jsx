// Shared feature-local create/reply/report form with retained drafts and explicit retries.
import {
  useId,
  useRef,
  useState,
} from 'react';
import { ErrorMessage } from '../../../components/ErrorMessage.jsx';
import { useTranslation } from '../../../i18n/useTranslation.js';

const inputClass = 'w-full min-w-0 rounded-control border-2 border-border-control bg-surface px-3 py-2 text-ink focus:border-focus-ring';
const primaryClass = 'min-h-11 rounded-full bg-action-primary px-5 py-2 font-bold text-action-foreground hover:bg-action-hover disabled:cursor-wait disabled:opacity-60';

/**
 * Keep authored values unchanged after failure. The same payload retains its
 * requestId for an explicit retry; editing starts a new operation. No write is
 * retried automatically, including a lost response after a successful save.
 */
export function ForumForm({ mode, forum, threadId, postId, onSuccess, onCancel }) {
  const { t } = useTranslation();
  const id = useId();
  const formRef = useRef(null);
  const attempt = useRef(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('technique');
  const pending = forum.mutation.isPending;
  const error = forum.mutation.variables?.method === mode ? forum.mutation.error : null;
  const isCreate = mode === 'create';
  const isReport = mode === 'report';
  const valid = body.trim().length > 0 && (!isCreate || title.trim().length > 0);

  /** Native form validation also runs on the explicit Retry button. */
  async function submit(event) {
    event.preventDefault();
    if (pending || !valid) {
      return;
    }
    let input = {
      threadId,
      body,
    };
    if (isCreate) {
      input = {
        title,
        body,
        category,
      };
    } else if (isReport) {
      input = {
        threadId,
        postId,
        reason: body,
      };
    }
    const signature = JSON.stringify(input);
    if (attempt.current?.signature !== signature) {
      attempt.current = {
        signature,
        requestId: crypto.randomUUID(),
      };
    }
    if (await forum.perform(mode, { ...input, requestId: attempt.current.requestId })) {
      setBody('');
      attempt.current = null;
      onSuccess();
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="flex min-w-0 flex-col gap-4" aria-busy={pending}>
      {isCreate && (
        <>
          <div>
            <label htmlFor={`${id}-category`} className="mb-1.5 block font-bold">{t('forum.category')}</label>
            <select id={`${id}-category`} value={category} onChange={event => setCategory(event.target.value)} disabled={pending} className={inputClass}>
              {['technique', 'adaptive', 'hardware', 'general'].map(value => (
                <option key={value} value={value}>{t(`forum.categories.${value}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-title`} className="mb-1.5 block font-bold">{t('forum.question')}</label>
            <input id={`${id}-title`} dir="auto" required maxLength={180} value={title} onChange={event => setTitle(event.target.value)} disabled={pending} className={inputClass} />
          </div>
        </>
      )}
      <div>
        <label htmlFor={`${id}-body`} className="mb-1.5 block font-bold">{t(isReport ? 'forum.reportReason' : isCreate ? 'forum.body' : 'forum.yourReply')}</label>
        <textarea id={`${id}-body`} dir="auto" required maxLength={isReport ? 1000 : 5000} rows={isReport ? 3 : 5} value={body} onChange={event => setBody(event.target.value)} disabled={pending} className={inputClass} />
        <p className="mt-1 text-sm text-muted">{t(isReport ? 'forum.reportHelp' : 'forum.textHelp')}</p>
      </div>
      {error && (
        <ErrorMessage error={error} message={error.retryable ? t('forum.writeFailed') : undefined} onRetry={() => formRef.current?.requestSubmit()} retrying={pending} />
      )}
      <div className="flex flex-wrap justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={pending} className="min-h-11 rounded-full border border-border-control px-5 py-2 font-bold disabled:opacity-60">{t('common.cancel')}</button>
        )}
        <button type="submit" disabled={pending || !valid} className={primaryClass}>
          {t(pending ? 'common.saving' : isCreate ? 'forum.publish' : isReport ? 'forum.sendReport' : 'forum.sendReply')}
        </button>
      </div>
    </form>
  );
}
