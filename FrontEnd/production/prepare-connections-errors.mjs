import { readFile, writeFile } from 'node:fs/promises';

const apiFile = new URL('./api.js', import.meta.url);
const appFile = new URL('./app.js', import.meta.url);

let api = await readFile(apiFile, 'utf8');
let app = await readFile(appFile, 'utf8');

function replaceOnce(text, before, after, label) {
  const parts = text.split(before);
  if (parts.length !== 2) {
    throw new Error(`PATCH_FAILED: ${label}`);
  }
  return parts.join(after);
}

function editSection(code, start, end, change, label) {
  const s = code.indexOf(start);

  if (s < 0 || code.indexOf(start, s + 1) !== -1) {
    throw new Error(`PATCH_FAILED: ${label} start`);
  }

  const e = code.indexOf(end, s + start.length);

  if (e < 0) {
    throw new Error(`PATCH_FAILED: ${label} end`);
  }

  const original = code.slice(s, e);
  const updated = change(original);

  if (original === updated) {
    throw new Error(`PATCH_FAILED: ${label} unchanged`);
  }

  console.log(`PATCH_OK: ${label}`);
  return code.slice(0, s) + updated + code.slice(e);
}

// 1. Require valid connection lists.

api = editSection(
  api,
  '    async getConnectionsMine({ status = null } = {}) {',
  '    async getConnectionsInbox() {',
  block => replaceOnce(
    block,
    '      return result.items || [];',
    `      if (!Array.isArray(result.items)) {
        throw new Error('Danh sách kết nối từ Backend không hợp lệ.');
      }
      return result.items;`,
    'Mine response'
  ),
  'Validate connections mine'
);

api = editSection(
  api,
  '    async getConnectionsInbox() {',
  '    async getConnectionById(id) {',
  block => replaceOnce(
    block,
    '      return result.items || [];',
    `      if (!Array.isArray(result.items)) {
        throw new Error('Hộp thư kết nối từ Backend không hợp lệ.');
      }
      return result.items;`,
    'Inbox response'
  ),
  'Validate connections inbox'
);

// 2. Never convert notification API errors into zero.

api = editSection(
  api,
  '    async getNotificationsCount() {',
  '    async getLearningData() {',
  () => `    async getNotificationsCount() {
      const response = await fetch('/api/v1/connections/notifications/count', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw Object.assign(
          new Error(result.error || 'Không thể tải số thông báo (HTTP ' + response.status + ').'),
          { status: response.status }
        );
      }

      if (!Number.isSafeInteger(result.pendingCount) ||
          result.pendingCount < 0) {
        throw new Error('Dữ liệu số thông báo không hợp lệ.');
      }

      return result;
    },
`,
  'Notifications API error handling'
);

// 3. Keep last successful connection data on failure.

app = editSection(
  app,
  'async function loadLiveConnections() {',
  'async function loadLearningData() {',
  () => `async function loadLiveConnections() {
  const api = window.AXANH_LIVE_API;

  if (!api ||
      typeof api.getConnectionsMine !== 'function' ||
      typeof api.getConnectionsInbox !== 'function' ||
      typeof api.getNotificationsCount !== 'function') {
    const message = 'Dịch vụ kết nối chưa sẵn sàng.';
    if (LIVE.connectionsError !== message) toast(message, 'warn');
    LIVE.connectionsError = message;
    return;
  }

  LIVE.connectionsLoading = true;

  try {
    const [mine, inbox, notif] = await Promise.all([
      api.getConnectionsMine(),
      api.getConnectionsInbox(),
      api.getNotificationsCount(),
    ]);

    if (!Array.isArray(mine) ||
        !Array.isArray(inbox) ||
        !notif ||
        !Number.isSafeInteger(notif.pendingCount) ||
        notif.pendingCount < 0) {
      throw new Error('Dữ liệu kết nối từ Backend không hợp lệ.');
    }

    LIVE.connections = mine;
    LIVE.inboxConnections = inbox;
    LIVE.notificationCount = notif.pendingCount;
    LIVE.connectionsError = '';

  } catch (err) {
    const message = 'Không thể đồng bộ kết nối. Dữ liệu có thể đã cũ.';
    console.warn('[Connections] Failed to load live connections:', err);

    if (LIVE.connectionsError !== message) {
      toast(message, 'warn');
    }

    LIVE.connectionsError = message;

  } finally {
    LIVE.connectionsLoading = false;
    renderUserHeader();

    if (currentPage === 'matches' ||
        currentPage === 'network' ||
        currentPage === 'market') {
      render();
    }
  }
}

`,
  'Preserve connections on API failure'
);

// 4. Warn once if notification polling cannot refresh.

app = editSection(
  app,
  '// Polling định kỳ mỗi 45s để cập nhật chuông thông báo',
  'async function loadLiveBooths(forcSync = false) {',
  block => {
    let updated = replaceOnce(
      block,
      '      const newCount = n?.pendingCount || 0;',
      `      const newCount = n.pendingCount;
      LIVE.notificationsError = '';`,
      'Notification count'
    );

    updated = replaceOnce(
      updated,
      '    } catch {}',
      `    } catch (err) {
      const message = 'Không thể cập nhật số thông báo.';
      console.warn('[Notifications] Refresh failed:', err);

      if (LIVE.notificationsError !== message) {
        toast(message, 'warn');
      }

      LIVE.notificationsError = message;
    }`,
      'Notification polling'
    );

    return updated;
  },
  'Notification polling error handling'
);

await writeFile(
  new URL('./api.js.connections.candidate', import.meta.url),
  api,
  { encoding: 'utf8', flag: 'wx' }
);

await writeFile(
  new URL('./app.js.connections.candidate', import.meta.url),
  app,
  { encoding: 'utf8', flag: 'wx' }
);

console.log('CONNECTIONS_CANDIDATES_CREATED');
console.log('Original Production files remain unchanged.');
