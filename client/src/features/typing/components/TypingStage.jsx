import { useRef, useEffect } from 'react';
import { usePreferences } from '../../../context/preferences.js';

export function TypingStage({
  assignedText = '',
  buffer = '',
  onCharInput,
  onBackspace,
  isActive = true,
  isPaused = false,
}) {
  const { largeText } = usePreferences();
  const inputRef = useRef(null);

  // Keep focus in the typing surface while active
  useEffect(() => {
    if (isActive && !isPaused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive, isPaused]);

  // Handle keyboard events directly
  const handleKeyDown = (e) => {
    if (!isActive || isPaused) return;

    // Suppress auto-repeat keys
    if (e.repeat) {
      e.preventDefault();
      return;
    }

    // End-of-buffer backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspace();
      return;
    }

    // Ignore navigation / modifier keys (arrows, Home, End, Ctrl, Alt, etc.)
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Single printable character (including space)
    e.preventDefault();
    onCharInput(e.key);
  };

  const bufferLen = buffer.length;

  return (
    <div
      className="typing-surface surface-card english-island"
      onClick={() => inputRef.current?.focus()}
      style={{
        position: 'relative',
        minHeight: '220px',
        padding: '36px',
        cursor: 'text',
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        border: '2px solid var(--color-border-control)',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Hidden capture input */}
      <input
        ref={inputRef}
        type="text"
        aria-label="Typing input stream"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        onKeyDown={handleKeyDown}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '1px',
          height: '1px',
        }}
      />

      {/* Rendered Passage with Non-Colour WCAG Accessibility Cues */}
      <div
        className={largeText ? 'text-typing-large' : 'text-typing-default'}
        style={{ userSelect: 'none' }}
      >
        {assignedText.split('').map((char, index) => {
          let charClass = 'char-upcoming';
          let displayChar = char;

          if (index < bufferLen) {
            const entered = buffer[index];
            if (entered === char) {
              charClass = 'char-correct';
            } else {
              charClass = entered === ' ' ? 'char-wrong-space' : 'char-incorrect';
              displayChar = entered === ' ' ? '␣' : entered;
            }
          } else if (index === bufferLen) {
            charClass = 'char-current';
          }

          return (
            <span key={index} className={charClass}>
              {displayChar}
            </span>
          );
        })}
      </div>
    </div>
  );
}
