import React, { useMemo } from 'react';

// Standard English Desktop QWERTY Layout rows
const KEYBOARD_ROWS = [
  [
    { key: '`', shift: '~' },
    { key: '1', shift: '!' },
    { key: '2', shift: '@' },
    { key: '3', shift: '#' },
    { key: '4', shift: '$' },
    { key: '5', shift: '%' },
    { key: '6', shift: '^' },
    { key: '7', shift: '&' },
    { key: '8', shift: '*' },
    { key: '9', shift: '(' },
    { key: '0', shift: ')' },
    { key: '-', shift: '_' },
    { key: '=', shift: '+' },
    { key: 'Backspace', width: '70px', label: '⌫' },
  ],
  [
    { key: 'Tab', width: '56px', label: 'Tab' },
    { key: 'q', shift: 'Q' },
    { key: 'w', shift: 'W' },
    { key: 'e', shift: 'E' },
    { key: 'r', shift: 'R' },
    { key: 't', shift: 'T' },
    { key: 'y', shift: 'Y' },
    { key: 'u', shift: 'U' },
    { key: 'i', shift: 'I' },
    { key: 'o', shift: 'O' },
    { key: 'p', shift: 'P' },
    { key: '[', shift: '{' },
    { key: ']', shift: '}' },
    { key: '\\', shift: '|' },
  ],
  [
    { key: 'Caps', width: '64px', label: 'Caps' },
    { key: 'a', shift: 'A' },
    { key: 's', shift: 'S' },
    { key: 'd', shift: 'D' },
    { key: 'f', shift: 'F' },
    { key: 'g', shift: 'G' },
    { key: 'h', shift: 'H' },
    { key: 'j', shift: 'J' },
    { key: 'k', shift: 'K' },
    { key: 'l', shift: 'L' },
    { key: ';', shift: ':' },
    { key: "'", shift: '"' },
    { key: 'Enter', width: '76px', label: '↵' },
  ],
  [
    { key: 'ShiftLeft', width: '84px', label: '⇧ Shift' },
    { key: 'z', shift: 'Z' },
    { key: 'x', shift: 'X' },
    { key: 'c', shift: 'C' },
    { key: 'v', shift: 'V' },
    { key: 'b', shift: 'B' },
    { key: 'n', shift: 'N' },
    { key: 'm', shift: 'M' },
    { key: ',', shift: '<' },
    { key: '.', shift: '>' },
    { key: '/', shift: '?' },
    { key: 'ShiftRight', width: '84px', label: '⇧ Shift' },
  ],
  [
    { key: ' ', width: '280px', label: 'Space', isSpace: true },
  ],
];

export function KeyboardGuide({ nextChar = '', masteredKeys = new Set() }) {
  // Determine if next character requires Shift
  const isShiftNeeded = useMemo(() => {
    if (!nextChar) return false;
    return (
      (nextChar >= 'A' && nextChar <= 'Z') ||
      '~!@#$%^&*()_+{}|:"<>?'.includes(nextChar)
    );
  }, [nextChar]);

  // Determine the base target keycap
  const targetBaseKey = useMemo(() => {
    if (!nextChar) return '';
    if (nextChar === ' ') return ' ';
    return nextChar.toLowerCase();
  }, [nextChar]);

  return (
    <div
      className="keyboard-guide english-island"
      aria-label="Physical QWERTY Keyboard Guide"
      style={{
        margin: '24px auto 0',
        padding: '16px',
        backgroundColor: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-card)',
        maxWidth: '780px',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Next Expected:</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-learning-soft)',
              color: 'var(--color-learning-strong)',
              fontWeight: 700,
              fontSize: '15px',
            }}
          >
            {nextChar === ' ' ? '␣ Space' : (nextChar || 'None')}
          </span>
          {isShiftNeeded && (
            <span style={{ fontSize: '12px', color: 'var(--color-learning-accent)', fontWeight: 700 }}>
              (Hold Shift)
            </span>
          )}
        </div>
        <span style={{ fontSize: '12px' }}>Physical QWERTY Guide</span>
      </div>

      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="keyboard-row">
          {row.map((item) => {
            const isTarget = item.isSpace
              ? targetBaseKey === ' '
              : item.key.toLowerCase() === targetBaseKey;

            const isShiftActive = isShiftNeeded && (item.key === 'ShiftLeft' || item.key === 'ShiftRight');
            const isMastered = masteredKeys.has(item.key.toLowerCase());

            let keyClass = 'keycap';
            if (isTarget || isShiftActive) keyClass += ' active-next';
            else if (isMastered) keyClass += ' mastered';

            return (
              <div
                key={item.key}
                className={keyClass}
                style={{
                  width: item.width || '44px',
                  minWidth: item.width || '44px',
                }}
              >
                {item.shift && (
                  <span style={{ fontSize: '10px', opacity: 0.6, lineHeight: 1 }}>{item.shift}</span>
                )}
                <span style={{ fontSize: item.label ? '12px' : '15px', fontWeight: (isTarget || isShiftActive) ? 700 : 500 }}>
                  {item.label || item.key.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
