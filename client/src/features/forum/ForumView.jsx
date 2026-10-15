import { useState } from 'react';
import { CheckIcon } from '../../components/ui/Icons.jsx';

export function ForumView() {
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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="text-heading-page" style={{ marginBottom: '4px' }}>
            Learner Community Forum
          </h1>
          <p className="text-body-default" style={{ color: 'var(--color-text-secondary)' }}>
            Ask questions, share touch typing techniques, and help colleagues progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewThreadModal(true)}
          className="btn-primary"
          style={{ height: '44px', padding: '0 20px', fontSize: '14px' }}
        >
          + New Discussion
        </button>
      </div>

      {/* Threads List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {threads.map((thread) => (
          <div
            key={thread.id}
            className="surface-card surface-card-interactive"
            style={{
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {thread.category}
                </span>

                {thread.hasAcceptedAnswer && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-success-soft)',
                      color: 'var(--color-success-text)',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    <CheckIcon size={12} />
                    <span>Answer Accepted</span>
                  </span>
                )}
              </div>

              <h2 className="text-heading-card" style={{ fontSize: '16px', marginBottom: '4px' }}>
                {thread.title}
              </h2>

              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Started by <strong>{thread.author}</strong> • {thread.date}
              </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '60px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{thread.replies}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>replies</div>
            </div>
          </div>
        ))}
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div className="surface-card" style={{ width: '100%', maxWidth: '520px' }}>
            <h2 className="text-heading-section" style={{ fontSize: '20px', marginBottom: '16px' }}>
              Start a New Discussion
            </h2>

            <form onSubmit={handleCreateThread} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Topic Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="form-input"
                  style={{ height: '44px' }}
                >
                  <option value="Technique">Typing Technique</option>
                  <option value="Adaptive Engine">Adaptive Engine & Scoring</option>
                  <option value="Hardware">Keyboard Hardware</option>
                  <option value="General">General Discussion</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Question or Title
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="What would you like to discuss?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewThreadModal(false)}
                  className="btn-secondary"
                  style={{ height: '42px', padding: '0 18px', fontSize: '14px' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ height: '42px', padding: '0 24px', fontSize: '14px' }}
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
