import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = new URL('./app.js', import.meta.url);
const outputUrl = new URL('./app.js.demo-cleanup.candidate', import.meta.url);

let code = await readFile(sourceUrl, 'utf8');

function replaceExactlyOne(pattern, replacement, label) {
  const scan = new RegExp(
    pattern.source,
    pattern.flags.replace('g', '') + 'g'
  );

  const matches = [...code.matchAll(scan)];

  if (matches.length !== 1) {
    throw new Error(`${label}: expected 1 match, found ${matches.length}`);
  }

  code = code.replace(pattern, replacement);
  console.log(`PATCH_OK: ${label}`);
}

function replaceExactlyN(pattern, replacement, expected, label) {
  const scan = new RegExp(
    pattern.source,
    pattern.flags.replace('g', '') + 'g'
  );

  const matches = [...code.matchAll(scan)];

  if (matches.length !== expected) {
    throw new Error(`${label}: expected ${expected}, found ${matches.length}`);
  }

  code = code.replace(
    new RegExp(pattern.source, pattern.flags.replace('g', '') + 'g'),
    replacement
  );

  console.log(`PATCH_OK: ${label}`);
}

function replaceRange(startMarker, endMarker, replacement, label) {
  const start = code.indexOf(startMarker);

  if (start < 0 || code.indexOf(startMarker, start + 1) >= 0) {
    throw new Error(`${label}: start marker missing or duplicated`);
  }

  const end = code.indexOf(endMarker, start + startMarker.length);

  if (end < 0) {
    throw new Error(`${label}: end marker not found`);
  }

  code = code.slice(0, start) + replacement + code.slice(end);
  console.log(`PATCH_OK: ${label}`);
}

// 1. Remove localStorage connection lookup fallback.
replaceExactlyOne(
  /\n  if \(Array\.isArray\(STATE\.connections\)\) \{\n    const found = STATE\.connections\.find\(c => \{[\s\S]*?\n  \}\n  return null;\n\}/,
  '\n  return null;\n}',
  'Remove local connection lookup'
);

// 2. Remove local connection creation fallback.
const liveStart = '    if (window.AXANH_LIVE_API && window.AXANH_LIVE_API.createConnection) {';
const liveEnd = '\n    closeModal();\n    render();';

const start = code.indexOf(liveStart);
const end = code.indexOf(liveEnd, start);

if (
  start < 0 ||
  end < 0 ||
  code.indexOf(liveStart, start + 1) >= 0
) {
  throw new Error('Live connection block not found or duplicated');
}

const oldLiveBlock = code.slice(start, end);

if (
  !oldLiveBlock.includes('STATE.connections.unshift(newConn)') ||
  !oldLiveBlock.includes('await window.AXANH_LIVE_API.createConnection')
) {
  throw new Error('Unexpected Smart Matching fallback structure');
}

const newLiveBlock = `    if (!window.AXANH_LIVE_API ||
        typeof window.AXANH_LIVE_API.createConnection !== 'function') {
      throw new Error('Dịch vụ kết nối chưa sẵn sàng. Vui lòng thử lại sau.');
    }

    await window.AXANH_LIVE_API.createConnection({
      sourceBoothId: curBooth.boothId || curBooth.recordId,
      targetBoothId,
      connectionType: isPersonal ? 'personal' : 'village',
    });

    toast((isPersonal
      ? 'Đã gửi lời mời kết nối tới ' + s.displayName
      : 'Đã gửi lời mời kết nối tới ' + s.targetVillageName)
      + '! Trạng thái: Chờ xác nhận.', 'success');

    await loadLiveConnections();`;

code = code.slice(0, start) + newLiveBlock + code.slice(end);
console.log('PATCH_OK: Remove fake Smart Matching creation');

// 3. Remove demo form functions.
replaceExactlyOne(
  /^function openResultForm\(id = ''\) \{[^\n]*\}\n/m,
  '',
  'Remove demo result form'
);

replaceExactlyOne(
  /^function newMatch\(a, b, mode = 'person', sv = '', hv = ''\) \{[^\n]*\}\n/m,
  '',
  'Remove demo matching'
);

replaceExactlyOne(
  /^function scheduleModal\(id\) \{[^\n]*\}\n/m,
  '',
  'Remove demo scheduling'
);

replaceExactlyOne(
  /^function viewResult\(id\) \{[^\n]*\}\n/m,
  '',
  'Remove demo result viewer'
);

// 4. Keep only real registration form action.
replaceExactlyOne(
  /case 'open-form': b\.dataset\.form === 'registration' \? openRegistrationForm\(b\.dataset\.defaultType \|\| marketTab \|\| 'personal'\) : openResultForm\(id\); break;/,
  "case 'open-form': if (b.dataset.form === 'registration') openRegistrationForm(b.dataset.defaultType || marketTab || 'personal'); break;",
  'Keep real registration form action'
);

// 5. Remove demo event handlers.
replaceExactlyOne(
  /^    case 'create-match': newMatch\([^\n]*\n    case 'schedule-one': scheduleModal\(id\); break;\n    case 'view-result': viewResult\(id\); break;\n/m,
  '',
  'Remove demo action handlers'
);

// 6. Remove Reset Demo and Export Demo cases.
replaceExactlyOne(
  /^    case 'reset-demo':\n[\s\S]*?^    case 'export-demo': \{\n[\s\S]*?^    \}\n/m,
  '',
  'Remove demo reset and export handlers'
);

// 7. Remove demo controls from settings page.
replaceExactlyOne(
  /^    '<button class="btn" data-action="export-demo">' \+ icon\('download'\) \+ ' Xuất dữ liệu demo<\/button>'$/m,
  "    ''",
  'Remove export demo button'
);

replaceRange(
  `    + '<div class="panel" style="margin-top:18px">'`,
  '\n}\nfunction footer()',
  ';',
  'Remove demo management panel'
);

// 8. Remove Test Key UI.
replaceRange(
  `    + '<div class="axanh-dev-block" style="margin-top:14px">'`,
  `    + '<div class="axanh-login-footer"`,
  '',
  'Remove Test Key login interface'
);

// 9. Remove Test Key click handlers.
replaceExactlyOne(
  /\n  const devToggle = document\.getElementById\('devToggleBtn'\);\n  const devForm = document\.getElementById\('devKeyForm'\);\n  if \(devToggle && devForm\) \{\n    devToggle\.addEventListener\('click', \(\) => \{\n      devForm\.classList\.toggle\('open'\);\n    \}\);\n  \}\n/,
  '\n',
  'Remove Test Key event handler'
);

// 10. Remove local demo form submissions.
replaceExactlyOne(
  /!\['settingsForm', 'registrationForm', 'resultForm', 'scheduleForm'\]\.includes\(formId\)/,
  "!['settingsForm', 'registrationForm'].includes(formId)",
  'Restrict supported form submissions'
);

replaceExactlyOne(
  /\} if \(formId === 'resultForm'\) \{[\s\S]*?navigate\('schedule'\); return \}/,
  '}',
  'Remove demo result and schedule submission'
);

// 11. Fail closed when Backend settings API is unavailable.
replaceExactlyOne(
  /    \} else \{\n      STATE\.settings\.registrationUrl = regUrl;[\s\S]*?\n    \}/,
  `    } else {
      toast('Không thể lưu cấu hình vì Backend chưa sẵn sàng. Vui lòng thử lại.', 'warn');
    }`,
  'Disable local settings fallback'
);

// 12. Remove browser-editable Backend API URL.
replaceExactlyOne(
  /\n    \+ '  <div class="field">'\n    \+ '    <label>Backend API URL<\/label>'\n    \+ '    <input name="apiBase"[^\n]*\n    \+ '    <small>Dịch vụ API nội bộ đã kết nối\. Không sửa nếu đang chạy mặc định\.<\/small>'\n    \+ '  <\/div>'/,
  '',
  'Remove browser API URL setting'
);

replaceExactlyN(
  /^\s*STATE\.settings\.apiBase = \(d\.apiBase \|\| ''\)\.trim\(\);\n/gm,
  '',
  1,
  'Remove local API URL assignments'
);

replaceExactlyOne(
  /, apiBase: ''/,
  '',
  'Remove API URL from empty settings'
);

// 13. Adapter must not expose local demo connections.
replaceExactlyOne(
  /const ApiAdapter = \{ mode: 'hybrid-readonly', async listPeople\(\) \{ return getPeople\(\) \}, async listVillages\(\) \{ return LIVE\.villages \}, async listMembers\(\) \{ return LIVE\.members \}, async listConnections\(\) \{ return STATE\.connections \}, async readFromLarkBackend\(\) \{ return window\.AXANH_LIVE_API\.load\(\) \} \};/,
  "const ApiAdapter = { mode: 'live-readonly', async listPeople() { return getPeople() }, async listVillages() { return LIVE.villages }, async listMembers() { return LIVE.members }, async listConnections() { return LIVE.connections }, async readFromLarkBackend() { return window.AXANH_LIVE_API.load() } };",
  'Change adapter to live connections'
);

// 14. Production wording.
replaceExactlyOne(
  /V3\.0 UI Prototype · Đã bổ sung Gate 1 và hiệu ứng trình chiếu pháo hoa/,
  'AXANH Gate1 · Hệ thống vận hành nội bộ',
  'Update production footer'
);

replaceExactlyOne(
  /Hệ thống nội bộ AXANH · Môi trường LAN/,
  'Hệ thống nội bộ AXANH · ATED PRO 2026',
  'Update login footer'
);

// 15. Verify forbidden demo paths are absent.
const forbidden = [
  ['Local connection lookup', /STATE\.connections\.find/],
  ['Local connection creation', /STATE\.connections\.unshift/],
  ['Demo functions', /function (openResultForm|newMatch|scheduleModal|viewResult)\(/],
  ['Demo event handlers', /case '(create-match|schedule-one|view-result|reset-demo|export-demo)'/],
  ['Demo forms', /resultForm|scheduleForm/],
  ['Test Key UI', /dev-login|devToggleBtn|devKeyForm|axanh-dev-block/],
  ['Demo settings controls', /reset-demo|export-demo/],
  ['Browser API URL', /apiBase/],
];

for (const [label, pattern] of forbidden) {
  if (pattern.test(code)) {
    throw new Error(`FINAL_CHECK_FAILED: ${label}`);
  }
  console.log(`FINAL_CHECK_OK: ${label}`);
}

await writeFile(outputUrl, code, {
  encoding: 'utf8',
  mode: 0o644,
  flag: 'wx',
});

console.log('PRODUCTION_DEMO_CLEANUP_CANDIDATE_CREATED');
console.log('Original app.js was not modified.');
