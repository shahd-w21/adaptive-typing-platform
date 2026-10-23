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
  const isComposingRef = useRef(false);

  // Keep focus in the typing surface while active
  useEffect(() => {
    if (isActive && !isPaused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive, isPaused]);

  // Handle keyboard events directly
  const handleKeyDown = (e) => {
    if (!isActive || isPaused) return;

    if (isComposingRef.current || e.isComposing) {
      e.preventDefault();
      return;
    }

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

    // Practice content and the wire schema accept printable English ASCII only.
    if (!/^[ -~]$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Single printable character (including space and Shift-produced symbols)
    e.preventDefault();
    onCharInput(e.key);
  };

  const preventBulkInput = (event) => {
    event.preventDefault();
  };

  const bufferLen = buffer.length;

  return (
    <div
      className="[transition:translate_var(--motion-fast),_box-shadow_var(--motion-fast),_border-color_var(--motion-fast)] [direction:ltr]! text-left! [unicode-bidi:isolate] font-mono! relative min-h-55 p-9 cursor-text bg-surface rounded-card shadow-card border-2 border-border-control outline-none flex flex-col justify-center"
      onClick={() => inputRef.current?.focus()}
      onPaste={preventBulkInput}
      onDrop={preventBulkInput}
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
        onBeforeInput={preventBulkInput}
        onPaste={preventBulkInput}
        onDrop={preventBulkInput}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
        }}
        className="absolute opacity-0 pointer-events-none w-[1px] h-[1px]"
      />

      {/* Rendered Passage with Non-Colour WCAG Accessibility Cues */}
      <div
        className={[
          "select-none",
          largeText ? 'font-mono! text-[36px] leading-[60px] font-normal tracking-[0] [font-variant-ligatures:none] whitespace-pre-wrap break-all max-md:text-[26px] max-md:leading-[44px]' : 'font-mono! text-[28px] leading-[48px] font-normal tracking-[0] [font-variant-ligatures:none] whitespace-pre-wrap break-all max-md:text-[22px] max-md:leading-[38px]',
        ].filter(Boolean).join(' ')}
      >
        {assignedText.split('').map((char, index) => {
          let charClass = "text-ink opacity-85";
          let displayChar = char;

          if (index < bufferLen) {
            const entered = buffer[index];
            if (entered === char) {
              charClass = "text-success-text underline [text-decoration-thickness:1.5px] [text-underline-offset:4px] bg-success-soft rounded-xs";
            } else {
              charClass = entered === ' ' ? "text-error-text bg-error-soft relative py-0 px-1 rounded-[3px] border border-dashed border-error-text" : "text-error-text bg-error-soft underline [text-decoration-style:double] [text-decoration-thickness:2.5px] [text-underline-offset:4px] rounded-xs";
              displayChar = entered === ' ' ? '␣' : entered;
            }
          } else if (index === bufferLen) {
            charClass = "text-ink relative bg-[rgba(6,_102,_223,_0.12)] rounded-xs before:[content:''] before:absolute before:start-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-focus-ring before:rounded-xs before:[animation:caret-blink_1s_ease-in-out_infinite]";
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
