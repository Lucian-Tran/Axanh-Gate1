import { readFile, writeFile } from 'node:fs/promises';

const apiUrl = new URL('./api.js', import.meta.url);
const appUrl = new URL('./app.js', import.meta.url);

const apiCandidate = new URL('./api.js.auth-errors.candidate', import.meta.url);
const appCandidate = new URL('./app.js.auth-errors.candidate', import.meta.url);

let api = await readFile(apiUrl, 'utf8');
let app = await readFile(appUrl, 'utf8');

function replaceBlock(code, start, end, replacement, label) {
  const s = code.indexOf(start);

  if (s < 0 || code.indexOf(start, s + start.length) >= 0) {
    throw new Error(`PATCH_FAILED: ${label} start`);
  }

  const e = code.indexOf(end, s + start.length);
  if (e < 0) {
    throw new Error(`PATCH_FAILED: ${label} end`);
  }

  console.log(`PATCH_OK: ${label}`);
  return code.slice(0, s) + replacement + '\n\n' + code.slice(e);
}

function replaceOnce(code, before, after, label) {
  const parts = code.split(before);
  if (parts.length !== 2) {
    throw new Error(`PATCH_FAILED: ${label}`);
  }
  console.log(`PATCH_OK: ${label}`);
  return parts.join(after);
}

api = replaceBlock(
  api,
  '  async function getMe() {',
  '  async function loadData() {',
  `  async function getMe() {
    const response = await fetch('/api/v1/me', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (response.status === 401) return null;

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw Object.assign(
        new Error(data.error || 'Không thể xác minh phiên đăng nhập (HTTP ' + response.status + ').'),
        { status: response.status }
      );
    }

    if (data.authenticated === false) return null;

    if (data.authenticated === true && data.user &&
        typeof data.user === 'object') {
      return data.user;
    }

    throw new Error('Phản hồi phiên đăng nhập không hợp lệ.');
  }`,
  'getMe error handling'
);

app = replaceOnce(
  app,
  `  const me = await API.getMe();
  if (!me) {`,
  `  let me;
  try {
    me = await API.getMe();
  } catch (error) {
    console.error('[Auth] Session verification failed:', error);
    showAuthScreen('Không thể kết nối hoặc xác minh phiên đăng nhập. Vui lòng thử lại sau.');
    return;
  }
  if (!me) {`,
  'init authentication error handling'
);

await writeFile(apiCandidate, api, { flag: 'wx' });
await writeFile(appCandidate, app, { flag: 'wx' });

console.log('AUTH_ERROR_CANDIDATES_CREATED');
console.log('Original api.js and app.js remain unchanged.');
