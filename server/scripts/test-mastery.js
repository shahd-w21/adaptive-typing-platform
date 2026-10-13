const BASE = "http://localhost:5000/api";
const EMAIL = "test@example.com";
const PASSWORD = "newpass123"; // use your current password
const ROUNDS = 6;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(path, body, cookie) {
  return fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body || {}),
  });
}

async function main() {
  const login = await call("/auth/login", { email: EMAIL, password: PASSWORD });
  if (!login.ok) return console.log("Login failed:", login.status, await login.text());
  const cookie = login.headers.getSetCookie()[0].split(";")[0];

  for (let round = 1; round <= ROUNDS; round++) {
    const start = await (await call("/sessions/start", {}, cookie)).json();
    const keys = [...start.text].map((ch, i) => ({ typed_char: ch, t_ms: i * 100 }));
    await sleep(keys[keys.length - 1].t_ms + 500);

    const res = await call(`/sessions/${start.sessionId}/submit`, { keystrokes: keys }, cookie);
    const data = await res.json();
    console.log(`Round ${round}:`, res.status, {
      wpm: data.net_wpm,
      mastered: data.mastered_keys,
      unlocked: data.unlocked_keys,
    });
  }
}

main();