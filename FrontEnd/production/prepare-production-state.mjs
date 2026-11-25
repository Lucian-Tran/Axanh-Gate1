import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = new URL('./app.js', import.meta.url);
const candidateUrl = new URL('./app.js.candidate', import.meta.url);

let code = await readFile(sourceUrl, 'utf8');

function replaceExactlyOne(pattern, replacement, label) {
  const match = code.match(pattern);

  if (!match) {
    throw new Error(`PATTERN_NOT_FOUND: ${label}`);
  }

  const rest = code.slice(match.index + match[0].length);

  if (pattern.test(rest)) {
    throw new Error(`PATTERN_NOT_UNIQUE: ${label}`);
  }

  code =
    code.slice(0, match.index) +
    replacement +
    rest;

  console.log(`PATCH_OK: ${label}`);
}

// 1. Remove default Gate1 demo records.
replaceExactlyOne(
  /const DEFAULT_GATE1_ENTRIES = \[[\s\S]*?\n\];\nfunction freshGateEntries\(\) \{[^\n]*\}\n/,
  '',
  'Remove default Gate1 demo records'
);

// 2. Empty Gate1 state.
replaceExactlyOne(
  /gate1: freshGateEntries\(\)/,
  'gate1: []',
  'Empty Gate1 initial state'
);

// 3. Load only non-sensitive UI settings.
replaceExactlyOne(
  /function loadState\(\) \{[^\n]*\}/,
  `function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    const settings = saved.settings && typeof saved.settings === 'object'
      ? saved.settings
      : {};

    return {
      ...structuredClone(EMPTY_STATE),
      settings: {
        ...EMPTY_STATE.settings,
        registrationUrl: settings.registrationUrl || '',
        resultUrl: settings.resultUrl || '',
        gate1Url: settings.gate1Url || '',
        larkBase: settings.larkBase || DEFAULT_BASE,
      },
    };
  } catch {
    return structuredClone(EMPTY_STATE);
  }
}`,
  'Load only safe UI settings'
);

// 4. Persist only non-sensitive UI settings.
replaceExactlyOne(
  /function persist\(\) \{[^\n]*\}/,
  `function persist() {
  try {
    const safeState = {
      settings: {
        registrationUrl: STATE.settings.registrationUrl || '',
        resultUrl: STATE.settings.resultUrl || '',
        gate1Url: STATE.settings.gate1Url || '',
        larkBase: STATE.settings.larkBase || DEFAULT_BASE,
      },
    };

    localStorage.setItem(STORE_KEY, JSON.stringify(safeState));
  } catch {
    toast('Không lưu được cấu hình giao diện.', 'warn');
  }
}`,
  'Persist only safe UI settings'
);

// 5. Use live connections in dashboard statistics.
replaceExactlyOne(
  /function stats\(\) \{[\s\S]*?\n\}/,
  `function stats() {
  const active = Array.isArray(LIVE.connections)
    ? LIVE.connections.length
    : 0;

  const passed = gateCounts().passed;
  const gateValue = GATE1.loading || GATE1.error
    ? '—'
    : String(passed);

  return [
    { n: LIVE.connected ? String(LIVE.villages.length) : '—', label: 'Làng (Lark Base)', i: 'grid' },
    { n: LIVE.connected ? String(LIVE.members.length) : '—', label: 'Thành viên (Lark Base)', i: 'users' },
    { n: LIVE.connected && !LIVE.connectionsLoading ? String(active) : '—', label: 'Kết nối của tôi', i: 'link' },
    { n: gateValue, label: 'Làng đạt Gate 1', i: 'shield' },
  ].map(x => '<div class="stat"><div><div class="number">' + x.n + '</div><div class="label">' + x.label + '</div></div><div class="stat-icon">' + icon(x.i, 22) + '</div></div>').join('');
}`,
  'Use live connection statistics'
);

await writeFile(candidateUrl, code, {
  encoding: 'utf8',
  mode: 0o644,
});

console.log('PRODUCTION_STATE_CANDIDATE_CREATED');
console.log('Original app.js was not modified.');
