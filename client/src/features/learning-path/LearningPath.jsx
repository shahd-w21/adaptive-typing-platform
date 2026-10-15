import { useState } from 'react';
import { PlayIcon, CheckIcon, LockIcon } from '../../components/ui/Icons.jsx';
import { KeyboardGuide } from '../typing/components/KeyboardGuide.jsx';

export function LearningPath({ onStartExercise }) {
  const [activeTab, setActiveTab] = useState('path'); // 'path' | 'map'
  const [selectedKey, setSelectedKey] = useState('f');

  const groups = [
    {
      id: 'g1',
      title: 'Group 1: Home Row Essentials',
      description: 'The foundation of touch typing: A, S, D, F, J, K, L, ;',
      nodes: [
        { id: 'n1', title: 'Home Row Drill 1 (F & J)', status: 'mastered', keys: 'fj' },
        { id: 'n2', title: 'Home Row Drill 2 (D & K)', status: 'mastered', keys: 'dk' },
        { id: 'n3', title: 'Home Row Complete Words', status: 'mastered', keys: 'asdfjkl;' },
      ],
    },
    {
      id: 'g2',
      title: 'Group 2: Top Row Index & Middle',
      description: 'Reaching upward with index and middle fingers: R, U, E, I',
      nodes: [
        { id: 'n4', title: 'Index Reach: R & U', status: 'mastered', keys: 'ru' },
        { id: 'n5', title: 'Middle Reach: E & I', status: 'recommended', keys: 'ei' },
        { id: 'n6', title: 'Word Sequences (Home + Top)', status: 'available', keys: 'asdfjkl;ruei' },
      ],
    },
    {
      id: 'g3',
      title: 'Group 3: Top Row Ring & Pinky',
      description: 'Strengthening outer fingers: W, O, Q, P',
      nodes: [
        { id: 'n7', title: 'Ring Reach: W & O', status: 'locked', prerequisite: 'Complete Group 2' },
        { id: 'n8', title: 'Pinky Reach: Q & P', status: 'locked', prerequisite: 'Complete Group 2' },
        { id: 'n9', title: 'Complex Vocabulary Practice', status: 'locked', prerequisite: 'Complete Group 2' },
      ],
    },
  ];

  const keyDetails = {
    f: { key: 'F', status: 'Mastered', accuracy: '98.5%', samples: 142, latency: '185 ms' },
    j: { key: 'J', status: 'Mastered', accuracy: '97.8%', samples: 138, latency: '192 ms' },
    e: { key: 'E', status: 'In Progress', accuracy: '92.1%', samples: 28, latency: '240 ms' },
    i: { key: 'I', status: 'In Progress', accuracy: '91.4%', samples: 25, latency: '255 ms' },
    p: { key: 'P', status: 'Review Due', accuracy: '88.0%', samples: 44, latency: '310 ms' },
  };

  const currentKeyStats = keyDetails[selectedKey.toLowerCase()] || {
    key: selectedKey.toUpperCase(),
    status: 'Insufficient Evidence',
    accuracy: 'N/A',
    samples: 4,
    latency: 'N/A',
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="text-heading-page" style={{ marginBottom: '4px' }}>
            Curriculum & Mastery Map
          </h1>
          <p className="text-body-default" style={{ color: 'var(--color-text-secondary)' }}>
            Sequential touch-typing progression driven by your measured evidence.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-bg-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('path')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              backgroundColor: activeTab === 'path' ? 'var(--color-bg-surface)' : 'transparent',
              color: activeTab === 'path' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'path' ? 'var(--shadow-card)' : 'none',
            }}
          >
            Guided Path
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              backgroundColor: activeTab === 'map' ? 'var(--color-bg-surface)' : 'transparent',
              color: activeTab === 'map' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'map' ? 'var(--shadow-card)' : 'none',
            }}
          >
            Keyboard Map
          </button>
        </div>
      </div>

      {activeTab === 'path' ? (
        /* Duolingo-style Vertical Learning Path */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {groups.map((group) => (
            <div key={group.id} className="surface-card" style={{ padding: '28px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 className="text-heading-section" style={{ fontSize: '20px', marginBottom: '4px' }}>
                  {group.title}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  {group.description}
                </p>
              </div>

              {/* Node Sequence */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                {group.nodes.map((node, nIdx) => {
                  const isRec = node.status === 'recommended';
                  const isMastered = node.status === 'mastered';
                  const isLocked = node.status === 'locked';

                  return (
                    <div
                      key={node.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        width: '100%',
                        maxWidth: '420px',
                      }}
                    >
                      {/* Node Circle */}
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => onStartExercise(node)}
                        style={{
                          width: isRec ? '68px' : '56px',
                          height: isRec ? '68px' : '56px',
                          borderRadius: '50%',
                          border: isRec ? 'none' : '2px solid var(--color-border-control)',
                          backgroundColor: isRec
                            ? 'var(--color-learning-accent)'
                            : isMastered
                            ? 'var(--color-success-soft)'
                            : isLocked
                            ? 'var(--color-disabled-bg)'
                            : 'var(--color-bg-surface)',
                          color: isRec
                            ? 'var(--color-learning-foreground)'
                            : isMastered
                            ? 'var(--color-success-text)'
                            : isLocked
                            ? 'var(--color-disabled-text)'
                            : 'var(--color-text-primary)',
                          boxShadow: isRec ? 'var(--lip-node)' : isLocked ? 'none' : '0 2px 0 var(--color-border-control)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          flexShrink: 0,
                          transition: 'transform var(--motion-fast)',
                        }}
                      >
                        {isMastered && <CheckIcon size={24} />}
                        {isRec && <PlayIcon size={26} />}
                        {isLocked && <LockIcon size={20} />}
                        {!isMastered && !isRec && !isLocked && <span style={{ fontWeight: 700 }}>{nIdx + 1}</span>}
                      </button>

                      {/* Node Label / Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: isRec ? 'var(--color-learning-strong)' : 'var(--color-text-primary)' }}>
                          {node.title}
                        </div>
                        {isRec && (
                          <span style={{ fontSize: '12px', color: 'var(--color-learning-accent)', fontWeight: 700 }}>
                            Recommended Next
                          </span>
                        )}
                        {isLocked && (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {node.prerequisite}
                          </span>
                        )}
                        {isMastered && (
                          <span style={{ fontSize: '12px', color: 'var(--color-success-text)' }}>
                            Mastered (Gate Passed)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Keyboard Map & Key Analytics Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="surface-card">
            <h2 className="text-heading-section" style={{ fontSize: '18px', marginBottom: '8px' }}>
              QWERTY Performance Overview
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Select any key on the physical keyboard guide to inspect recorded evidence and latency.
            </p>

            <KeyboardGuide nextChar={selectedKey} masteredKeys={new Set(['f', 'j', 'd', 'k', 'a', 's', 'l', ';', 'r', 'u'])} />

            {/* Quick Key Selection Palette */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              {['f', 'j', 'e', 'i', 'p'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedKey(k)}
                  className="english-island"
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: selectedKey === k ? 'var(--color-learning-soft)' : 'var(--color-bg-surface)',
                    color: selectedKey === k ? 'var(--color-learning-strong)' : 'var(--color-text-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Key: {k.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Key Evidence Inspector Card */}
          <div className="surface-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <div className="text-caption-default">Selected Key</div>
              <div className="text-heading-page english-island" style={{ color: 'var(--color-learning-strong)' }}>
                {currentKeyStats.key}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {currentKeyStats.status}
              </div>
            </div>

            <div>
              <div className="text-caption-default">Raw Accuracy</div>
              <div className="text-heading-section english-island">{currentKeyStats.accuracy}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Across all attempts</div>
            </div>

            <div>
              <div className="text-caption-default">Samples Recorded</div>
              <div className="text-heading-section english-island">{currentKeyStats.samples}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Req. $\ge 30$ for gate</div>
            </div>

            <div>
              <div className="text-caption-default">Average Latency</div>
              <div className="text-heading-section english-island">{currentKeyStats.latency}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Target: &lt; 220 ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
