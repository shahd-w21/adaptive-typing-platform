// Existing forum fixture reuses the shared modal boundary; local posting remains a fixture.
import { useId, useState } from 'react';
import { Dialog } from '../../components/ui/Dialog.jsx';
import { CheckIcon } from '../../components/ui/Icons.jsx';

export function ForumView() {
  const dialogTitleId = useId();
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [threads, setThreads] = useState([
    {
      id: 't1',
      title: 'Tips for overcoming the 50 WPM plateau on pinky reaches?',
      author: 'Omar S.',
      date: '2 hours ago',
      replies: 4,
      hasAcceptedAnswer: true,
      category: 'Technique',
    },
    {
      id: 't2',
      title: 'How does the Raw Accuracy gate calculate backspaced errors?',
      author: 'Nour K.',
      date: '1 day ago',
      replies: 2,
      hasAcceptedAnswer: true,
      category: 'Adaptive Engine',
    },
    {
      id: 't3',
      title: 'Mechanical vs Laptop Membrane keyboard for learning touch typing',
      author: 'Karim D.',
      date: '3 days ago',
      replies: 7,
      hasAcceptedAnswer: false,
      category: 'Hardware',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Technique');

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const newT = {
      id: `t-${Date.now()}`,
      title: newTitle,
      author: 'Layla (You)',
      date: 'Just now',
      replies: 0,
      hasAcceptedAnswer: false,
      category: newCategory,
    };

    setThreads([newT, ...threads]);
    setNewTitle('');
    setShowNewThreadModal(false);
  };

  return (
    <div className="max-w-240 my-0 mx-auto">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display rtl:font-arabic text-[32px] leading-[44px] font-bold max-md:text-[24px] max-md:leading-[32px] mb-1">
            Learner Community Forum
          </h1>
          <p className="text-[16px] leading-[26px] font-normal text-muted">
            Ask questions, share touch typing techniques, and help colleagues progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewThreadModal(true)}
          className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-11 py-0 px-5 text-[14px]"
        >
          + New Discussion
        </button>
      </div>

      {/* Threads List */}
      <div className="flex flex-col gap-3.5">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className="bg-surface border border-border-subtle rounded-card shadow-card [transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] hover:border-border-control hover:-translate-y-0.5 hover:shadow-popover p-5 flex justify-between items-center cursor-pointer"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className="py-0.5 px-2 rounded-full bg-subtle text-[12px] font-bold"
                >
                  {thread.category}
                </span>

                {thread.hasAcceptedAnswer && (
                  <span
                    className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-success-soft text-success-text text-[11px] font-bold"
                  >
                    <CheckIcon size={12} />
                    <span>Answer Accepted</span>
                  </span>
                )}
              </div>

              <h2 className="font-display rtl:font-arabic leading-[30px] font-bold text-[16px] mb-1">
                {thread.title}
              </h2>

              <div className="text-[12px] text-muted">
                Started by <strong>{thread.author}</strong> • {thread.date}
              </div>
            </div>

            <div className="text-center min-w-15">
              <div className="text-[18px] font-extrabold">{thread.replies}</div>
              <div className="text-[11px] text-muted">replies</div>
            </div>
          </div>
        ))}
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <Dialog
          open
          onClose={() => setShowNewThreadModal(false)}
          labelledBy={dialogTitleId}
          className="m-auto w-[calc(100%_-_2rem)] max-w-130 rounded-dialog p-5 sm:p-6"
        >
            <h2 id={dialogTitleId} className="font-display rtl:font-arabic leading-[34px] font-bold text-[20px] mb-4">
              Start a New Discussion
            </h2>

            <form onSubmit={handleCreateThread} className="flex flex-col gap-4">
              <div>
                <label htmlFor="forum-category" className="block text-[13px] font-bold mb-1.5">
                  Topic Category
                </label>
                <select
                  id="forum-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)] h-11"
                >
                  <option value="Technique">Typing Technique</option>
                  <option value="Adaptive Engine">Adaptive Engine & Scoring</option>
                  <option value="Hardware">Keyboard Hardware</option>
                  <option value="General">General Discussion</option>
                </select>
              </div>

              <div>
                <label htmlFor="forum-title" className="block text-[13px] font-bold mb-1.5">
                  Question or Title
                </label>
                <input
                  id="forum-title"
                  type="text"
                  required
                  className="w-full h-12 py-0 px-4 font-body rtl:font-arabic text-[16px] text-ink bg-surface border-2 border-border-control rounded-control [transition:border-color_var(--motion-fast),_box-shadow_var(--motion-fast)] focus:outline-none focus:border-focus-ring focus:shadow-[0_0_0_3px_rgba(6,_102,_223,_0.2)]"
                  placeholder="What would you like to discuss?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewThreadModal(false)}
                  className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-ink bg-surface border-2 border-border-control rounded-full cursor-pointer no-underline [transition:background-color_var(--motion-fast),_border-color_var(--motion-fast)] enabled:hover:bg-subtle enabled:hover:border-ink disabled:border-border-subtle disabled:text-disabled-text disabled:cursor-not-allowed h-10.5 py-0 px-4.5 text-[14px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 font-body rtl:font-arabic font-bold text-action-foreground bg-action-primary border-0 rounded-full cursor-pointer no-underline shadow-primary [transition:background-color_var(--motion-fast),_translate_var(--motion-fast),_box-shadow_var(--motion-fast)] enabled:hover:bg-action-hover enabled:hover:-translate-y-px enabled:active:bg-action-pressed enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed disabled:shadow-none h-10.5 py-0 px-6 text-[14px]"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
        </Dialog>
      )}
    </div>
  );
}
