// A visual finger map for the English QWERTY exercise; it never handles input.
const FINGER_BY_KEY = {
  q: 'left-pinky',
  '1': 'left-pinky',
  a: 'left-pinky',
  z: 'left-pinky',
  '`': 'left-pinky',
  w: 'left-ring',
  '2': 'left-ring',
  s: 'left-ring',
  x: 'left-ring',
  e: 'left-middle',
  '3': 'left-middle',
  d: 'left-middle',
  c: 'left-middle',
  r: 'left-index',
  '4': 'left-index',
  '5': 'left-index',
  f: 'left-index',
  v: 'left-index',
  t: 'left-index',
  g: 'left-index',
  b: 'left-index',
  y: 'right-index',
  '6': 'right-index',
  '7': 'right-index',
  h: 'right-index',
  n: 'right-index',
  u: 'right-index',
  j: 'right-index',
  m: 'right-index',
  i: 'right-middle',
  '8': 'right-middle',
  k: 'right-middle',
  ',': 'right-middle',
  o: 'right-ring',
  '9': 'right-ring',
  l: 'right-ring',
  '.': 'right-ring',
  p: 'right-pinky',
  '0': 'right-pinky',
  ';': 'right-pinky',
  '/': 'right-pinky',
  '-': 'right-pinky',
  '=': 'right-pinky',
  '[': 'right-pinky',
  ']': 'right-pinky',
  '\\': 'right-pinky',
  "'": 'right-pinky',
  ' ': 'thumb',
};

const BASE_KEY_BY_SHIFTED_CHARACTER = {
  '~': '`',
  '!': '1',
  '@': '2',
  '#': '3',
  '$': '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  '_': '-',
  '+': '=',
  '{': '[',
  '}': ']',
  '|': '\\',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '?': '/',
};

const FINGER_PATHS = [
  { id: 'pinky', d: 'M73 105 63 68' },
  { id: 'ring', d: 'M91 96 84 48' },
  { id: 'middle', d: 'M110 91 109 34' },
  { id: 'index', d: 'M129 97 136 48' },
  { id: 'thumb', d: 'M143 112 164 93' },
];

/**
 * Highlight the conventional finger for the next physical QWERTY key.
 * The keyboard remains the input guide, so this illustration does not alter
 * the attempt, focus, timing, or accepted key events.
 */
export function HandGuide({ nextChar = '', label }) {
  const baseKey =
    BASE_KEY_BY_SHIFTED_CHARACTER[nextChar] ?? nextChar.toLowerCase();
  const activeFinger = FINGER_BY_KEY[baseKey] ?? null;

  return (
    <div
      role="img"
      aria-label={label}
      className="mx-auto mt-6 max-w-[500px] rounded-card border border-border-subtle bg-surface px-4 py-3"
    >
      <svg
        viewBox="0 0 400 160"
        className="mx-auto block h-auto w-full max-w-[420px]"
        aria-hidden="true"
      >
        {[0, 1].map((hand) => (
          <g
            key={hand}
            transform={hand === 0 ? undefined : 'translate(400 0) scale(-1 1)'}
          >
            <path
              d="M75 143 60 99 53 73C50 61 65 55 72 66L84 86 82 48C81 34 101 32 104 47L109 86 110 35C111 20 132 21 133 36L134 87 141 49C144 34 164 39 161 54L154 96 166 81C174 70 190 79 184 91L163 130C158 142 147 149 133 150L101 150C89 150 80 147 75 143Z"
              fill="var(--tf-color-learning-soft)"
              stroke="var(--tf-color-border-control)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {FINGER_PATHS.map((finger) => {
              const handSide = hand === 0 ? 'left' : 'right';
              const isActive =
                activeFinger === `${handSide}-${finger.id}` ||
                (activeFinger === 'thumb' && finger.id === 'thumb');

              return (
                <path
                  key={finger.id}
                  d={finger.d}
                  fill="none"
                  stroke={
                    isActive
                      ? 'var(--tf-color-illustration-tangerine)'
                      : 'var(--tf-color-border-control)'
                  }
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        ))}
        <path
          d="M200 45v80"
          fill="none"
          stroke="var(--tf-color-border-subtle)"
          strokeDasharray="4 6"
        />
      </svg>
    </div>
  );
}
