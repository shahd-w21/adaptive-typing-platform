import { useMemo } from 'react';

// Next-key hints update immediately without lifting keys or animating feedback.
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
      (nextChar>= 'A' && nextChar <= 'Z') ||
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
      className="max-md:hidden [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! mt-6 mx-auto mb-0 p-4 bg-subtle border border-border-subtle rounded-card max-w-195 select-none"
      aria-label="Physical QWERTY Keyboard Guide"
    >
      <div className="flex justify-between items-center mb-3 text-[13px] text-muted">
        <div className="flex items-center gap-2">
          <span>Next Expected:</span>
          <span
            className="py-0.5 px-2 rounded-md bg-learning-soft text-learning-strong font-bold text-[15px]"
          >
            {nextChar === ' ' ? '␣ Space' : (nextChar || 'None')}
          </span>
          {isShiftNeeded && (
            <span className="text-[12px] text-learning-accent font-bold">
              (Hold Shift)
            </span>
          )}
        </div>
        <span className="text-[12px]">Physical QWERTY Guide</span>
      </div>

      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-1.5 mb-1.5">
          {row.map((item) => {
            const isTarget = item.isSpace
              ? targetBaseKey === ' '
              : item.key.toLowerCase() === targetBaseKey;

            const isShiftActive = isShiftNeeded && (item.key === 'ShiftLeft' || item.key === 'ShiftRight');
            const isMastered = masteredKeys.has(item.key.toLowerCase());

            let keyClass = "flex flex-col items-center justify-center min-w-11 h-11 p-1 bg-surface border-2 border-border-control rounded-lg font-mono text-[15px] font-medium text-ink shadow-[0_2px_0_var(--tf-color-border-control)] select-none";
            if (isTarget || isShiftActive) keyClass += " bg-learning-soft! border-learning-accent! text-learning-strong! shadow-[0_4px_0_var(--tf-color-learning-lip)]!";
            else if (isMastered) keyClass += " border-success-accent! bg-success-soft! text-success-text!";

            return (
              <div
                key={item.key}
                className={keyClass} style={{ width: item.width || '44px', minWidth: item.width || '44px' }}
              >
                {item.shift && (
                  <span className="text-[10px] opacity-60 leading-none">{item.shift}</span>
                )}
                <span className={[
                        item.label ? 'text-[12px]' : 'text-[15px]',
                        isTarget || isShiftActive ? 'font-bold' : 'font-medium',
                      ].filter(Boolean).join(' ')}>
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
