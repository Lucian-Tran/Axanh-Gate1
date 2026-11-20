import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config.js';
import { LarkClient } from './lark-client.js';
import { buildVillageIndex, mapVillage, mapMember, mapBooth, extractLoginEmail, textValue, personName, isOfficialVillage, isOfficialMember } from './mappers.js';
import { createVillageIconService } from './village-icon-service.js';
import { createMemberAvatarService } from './member-avatar-service.js';
import { createAuthStore } from './auth-store.js';
import { createEmailService } from './email-service.js';
import { createMatchingService } from './matching-service.js';
import { createConnectionService } from './connection-service.js';
import { createLearningService } from './learning-service.js';
import { createKnowledgeService } from './knowledge-service.js';
import { createHonorsService } from './honors-service.js';
import { createGate1Service } from './gate1-service.js';

const SESSION_MAX_AGE_SECONDS = 4 * 60 * 60;
const COOKIE_NAME = 'axanh_dev_session';
const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'FrontEnd');

const staticFiles = new Map([
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/api.js', ['api.js', 'text/javascript; charset=utf-8']],
  ['/seed-data.js', ['seed-data.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
]);

function sameKey(value, expected) {
  if (typeof value !== 'string') return false;
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function reply(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(data));
}

function redirect(res, location, cookie = undefined) {
  res.writeHead(303, {
    Location: location,
    'Cache-Control': 'no-store',
    ...(cookie ? { 'Set-Cookie': cookie } : {}),
  });
  res.end();
}

export function isValidLarkFormUrl(urlStr) {
  if (urlStr === null || urlStr === undefined || urlStr === '') return true;
  if (typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (trimmed === '') return true;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    const isLark = hostname === 'larksuite.com' || hostname.endsWith('.larksuite.com');
    const isFeishu = hostname === 'feishu.cn' || hostname.endsWith('.feishu.cn');
    return isLark || isFeishu;
  } catch {
    return false;
  }
}

export function isAdminUser(session, config) {
  if (!session || !session.user) return false;
  const u = session.user;
  if (u.role === 'developer' || u.role === 'admin') return true;
  if (u.memberId && config.adminMemberIds && config.adminMemberIds.has(String(u.memberId).trim().toUpperCase())) {
    return true;
  }
  if (u.email && config.adminEmails && config.adminEmails.has(String(u.email).trim().toLowerCase())) {
    return true;
  }
  return false;
}

export function canManageMatching(session, config) {
  if (!session || !session.user) return false;
  if (isAdminUser(session, config)) return true;
  const u = session.user;
  if (u.memberId && config.matchingAdminMemberIds && config.matchingAdminMemberIds.has(String(u.memberId).trim().toUpperCase())) {
    return true;
  }
  return false;
}

function isLocalRequest(req) {
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
}

function isNgrokHost(host) {
  return typeof host === 'string' && /(^|\.)ngrok(-free)?\.(app|io|dev)(:\d+)?$/i.test(host.trim().toLowerCase());
}

function isPrivateIpHost(host, config) {
  if (typeof host !== 'string' || !host.trim()) return false;
  const parts = host.trim().toLowerCase().split(':');
  const hostname = parts[0];
  const port = parts[1];
  const validPort = !port || port === String(config.port) || port === '5173';
  if (!validPort) return false;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  return false;
}

function getAllowedHosts(config) {
  const port = config.port;
  return new Set([
    `127.0.0.1:${port}`,
    `localhost:${port}`,
    `[::1]:${port}`,
    '127.0.0.1:5173',
    'localhost:5173',
    '[::1]:5173',
  ]);
}

function getAllowedOrigins(config) {
  const port = config.port;
  return new Set([
    `http://127.0.0.1:${port}`,
    `http://localhost:${port}`,
    `http://[::1]:${port}`,
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://[::1]:5173',
  ]);
}

function sameOriginPost(req, config) {
  const host = (isLocalRequest(req) && req.headers['x-forwarded-host']) || req.headers.host;
  if (!host || typeof host !== 'string') return false;
  const requestedHost = host.toLowerCase();
  const allowedHosts = getAllowedHosts(config);
  const isNgrok = isNgrokHost(requestedHost);
  const isPrivateIp = isPrivateIpHost(requestedHost, config);

  if (!allowedHosts.has(requestedHost) && !isNgrok && !isPrivateIp) return false;

  const secFetchSite = req.headers['sec-fetch-site'];
  if (secFetchSite && secFetchSite === 'cross-site') {
    return false;
  }

  const isHttps = Boolean(req?.socket?.encrypted) || req?.headers['x-forwarded-proto'] === 'https' || isNgrok;
  const proto = isHttps ? 'https' : 'http';
  const expectedOrigin = `${proto}://${requestedHost}`;
  const origin = req.headers.origin;

  if (typeof origin === 'string' && origin !== 'null') {
    const o = origin.toLowerCase();
    if (o === expectedOrigin) return true;
    if (getAllowedOrigins(config).has(o)) return true;
    try {
      const u = new URL(o);
      if (isNgrok && isNgrokHost(u.host)) return true;
      if (isPrivateIpHost(u.host, config)) return true;
    } catch {}
    return false;
  }

  const referer = req.headers.referer;
  if (typeof referer === 'string' && referer) {
    try {
      const refUrl = new URL(referer);
      const refOrigin = `${refUrl.protocol}//${refUrl.host}`.toLowerCase();
      if (refOrigin === expectedOrigin) return true;
      if (getAllowedOrigins(config).has(refOrigin)) return true;
      if (isNgrok && isNgrokHost(refUrl.host)) return true;
      if (isPrivateIpHost(refUrl.host, config)) return true;
      return false;
    } catch {
      return false;
    }
  }

  if (secFetchSite && ['same-origin', 'same-site'].includes(secFetchSite) && isLocalRequest(req)) {
    return true;
  }

  return false;
}

function cookieValue(req, name) {
  const cookies = String(req.headers.cookie ?? '').split(';');
  const entry = cookies.find((item) => item.trim().startsWith(`${name}=`));
  return entry ? entry.trim().slice(name.length + 1) : null;
}

function createSessionCookie(token, maxAge = SESSION_MAX_AGE_SECONDS, req = null, config, sameSiteOverride = null) {
  const host = (isLocalRequest(req) && req?.headers?.['x-forwarded-host']) || req?.headers?.host || '';
  const isEncrypted = Boolean(req?.socket?.encrypted) || req?.headers?.['x-forwarded-proto'] === 'https' || isNgrokHost(host);
  const secureFlag = (config.cookieSecure || isEncrypted) ? '; Secure' : '';
  const sameSite = sameSiteOverride || (isEncrypted ? 'Lax' : 'Strict');
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=${sameSite}${secureFlag}`;
}

function hasSession(req, sessions, authStore = null) {
  const value = cookieValue(req, COOKIE_NAME);
  if (!value || !/^[0-9a-f]{64}$/.test(value)) return false;
  if (authStore) {
    const s = authStore.getSession(value);
    if (s) return true;
  }
  if (sessions) {
    const entry = sessions.get(value);
    if (!entry) return false;
    const expires = typeof entry === 'number' ? entry : entry.expiresAt;
    if (Date.now() >= expires) {
      sessions.delete(value);
      return false;
    }
    return true;
  }
  return false;
}

function getSession(req, sessions, authStore = null) {
  const value = cookieValue(req, COOKIE_NAME);
  if (!value || !/^[0-9a-f]{64}$/.test(value)) return null;
  if (authStore) {
    const s = authStore.getSession(value);
    if (s) return s;
  }
  if (sessions) {
    const entry = sessions.get(value);
    if (!entry) return null;
    const expires = typeof entry === 'number' ? entry : entry.expiresAt;
    if (Date.now() >= expires) {
      sessions.delete(value);
      return null;
    }
    return typeof entry === 'object' ? entry : { expiresAt: entry, user: null, authType: 'local-dev' };
  }
  return null;
}

function resolveConnectionUser(session) {
  if (session?.user) {
    const memberId = session.user.memberId || session.user.id || null;
    return {
      ...session.user,
      id: memberId,
      memberId,
    };
  }
  return {
    id: 'TEST-DEV',
    memberId: 'TEST-DEV',
    name: 'Developer',
    villageId: 'VIL-0005',
  };
}

function loginPage(error = '') {
  const errorText = error ? `<p class="error" role="alert">${error === 'wrong-key' ? 'Khóa không đúng. Kiểm tra INTERNAL_TEST_KEY trong BackEnd/.env.' : error}</p>` : '';
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AXANH KEX – Đăng nhập hệ thống</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#091c38;color:#eff5ff;font:16px system-ui,sans-serif}
main{width:min(440px,90vw);padding:32px;border-radius:18px;background:#102c51;box-shadow:0 15px 50px #0005}
h1{margin:0 0 8px;font-size:24px}
p{line-height:1.6;color:#c6d5ed}
label{display:block;margin:16px 0 8px;font-weight:600}
input{box-sizing:border-box;width:100%;padding:14px;background:#fff;border:1px solid #cbd5e1;border-radius:9px;font-size:16px}
button{width:100%;margin-top:16px;border:0;border-radius:9px;background:#edbd4b;color:#12203b;padding:13px;font-weight:750;cursor:pointer}
.lark-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:#00d6b9;color:#051b38;font-weight:750;text-decoration:none;border-radius:9px;margin-top:20px;box-sizing:border-box}
.lark-btn:hover{background:#00f0cf}
.divider{display:flex;align-items:center;gap:12px;margin:24px 0 16px;color:#7a9cbe;font-size:12px;font-weight:600}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:#244570}
.error{color:#ffbaba;font-weight:650}
small{display:block;margin-top:20px;color:#a7bfdc;font-size:12px}
</style>
</head><body><main>
<h1>AXANH · Phiên Chợ Tri Thức</h1>
<p>Hệ thống trao đổi tri thức và ghi nhận điều kiện Quán quân Gate 1.</p>
${errorText}
<a href="/auth/lark/login" class="lark-btn">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
  Đăng nhập bằng Lark (SSO)
</a>
<div class="divider">HOẶC DÀNH CHO DEVELOPER</div>
<form action="/dev-login" method="post" autocomplete="off">
  <label for="secret">INTERNAL_TEST_KEY</label>
  <input id="secret" type="password" name="key" required autocomplete="off" placeholder="Khóa kiểm thử nội bộ">
  <button type="submit">Mở bằng Test Key</button>
</form>
<small>Môi trường nội bộ / LAN. Sau khi đăng nhập, hệ thống sẽ xác thực hồ sơ thành viên qua T02_Members.</small>
</main></body></html>`;
}

function sendLoginPage(res, status = 200, error = '') {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
  });
  res.end(loginPage(error));
}

async function formBody(req) {
  if (!String(req.headers['content-type'] ?? '').startsWith('application/x-www-form-urlencoded')) {
    throw new Error('Invalid content type');
  }
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString('utf8');
    if (Buffer.byteLength(body) > 2048) throw new Error('Request too large');
  }
  return new URLSearchParams(body);
}

async function jsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString('utf8');
    if (Buffer.byteLength(body) > 16384) throw new Error('Request too large');
  }
  return JSON.parse(body || '{}');
}

async function sendStatic(res, name, contentType) {
  try {
    const file = await readFile(resolve(frontendDir, name));
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'X-Frame-Options': 'DENY',
    });
    res.end(file);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return reply(res, 404, { error: `Missing FrontEnd/${name} (check file name and case)` });
    }
    console.error('Frontend file error:', error.code ?? 'unknown');
    return reply(res, 500, { error: 'Unable to serve frontend file' });
  }
}

export function createAppServer(config, lark = new LarkClient(config), options = {}) {
  const cached = new Map();
  const sessions = new Map();
  const oauthStates = new Map();

  const authStore = options.authStore || createAuthStore({
    dbPath: config.authDbPath || resolve(frontendDir, '..', 'data', 'auth.db'),
    hmacSecret: config.testKey,
  });
  const emailService = options.emailService || createEmailService(config);

  async function cachedFetch(key, compute, ttlMs = config.cacheTtlMs) {
    const hit = cached.get(key);
    if (ttlMs > 0 && hit && Date.now() < hit.until) return hit.data;
    const data = await compute();
    if (ttlMs > 0) {
      cached.set(key, { data, until: Date.now() + ttlMs });
    } else {
      // TTL = 0 → không lưu cache
      cached.delete(key);
    }
    return data;
  }

  async function villagesRaw() {
    return cachedFetch('village-raw', () => lark.searchAll(config.villageTableId, {
      fieldNames: [
        'Village_ID', 'Village_Name', 'Slogan', 'Office', 'Leader', 'Deputy',
        'SL member', 'Total_Score', 'Gate1_Status', 'Gate1_PASS_Count',
        'Gate1_TOTAL_Count', 'Status', 'Color/Icon',
      ],
    }));
  }

  async function gate1VillagesRaw(forceFresh = false) {
    if (forceFresh) cached.delete('gate1-village-raw');
    return cachedFetch('gate1-village-raw', () => lark.searchAll(config.villageTableId, {
      fieldNames: ['Village_ID', 'Village_Name', 'Office', 'Status', 'Color/Icon'],
    }));
  }

  async function gate1Raw(forceFresh = false) {
    if (forceFresh) cached.delete('gate1-raw');
    return cachedFetch('gate1-raw', () => lark.searchAll(config.gate1TableId || 'tblAhZ3kFMakyRTw', {
      fieldNames: [
        'Record_Type', 'Recipient_Village', 'Supporting_Village', 'Gate1_Status',
        'Value_Received', 'Observed_Change', 'Recipient_Confirmation', 'BTC_Verification',
        'Evidence_Records', 'Evidence_Link', 'Evidence_Attachment',
      ],
    }));
  }

  const villageIcons = createVillageIconService({
    lark,
    villageTableId: config.villageTableId,
    villagesRaw,
  });

  async function membersRaw() {
    return cachedFetch('member-raw', () => lark.searchAll(config.memberTableId, {
      fieldNames: ['Member_ID', 'Display_Name', 'Lark_User', 'Village',
        'Office', 'Program_Role', 'Active✅', 'AVATAR', 'Login_Email'],
    }));
  }

  const memberAvatars = createMemberAvatarService({
    lark,
    memberTableId: config.memberTableId,
    membersRaw,
  });

  async function boothsRaw(forceFresh = false) {
    if (forceFresh) {
      cached.delete('booth-raw');
    }
    // Nếu boothCacheTtlMs = 0 → không cache, luôn fetch fresh từ Lark Base
    if (config.boothCacheTtlMs === 0) {
      cached.delete('booth-raw');
    }
    // Không truyền fieldNames để lấy tất cả fields - tránh lỗi 400 với UTF-8 field names
    return cachedFetch('booth-raw', () => lark.searchAll(config.boothTableId, {}), config.boothCacheTtlMs ?? config.cacheTtlMs);
  }

  async function getMembersByNameIndex() {
    const villageIndex = buildVillageIndex(await villagesRaw());
    const villagesByName = new Map();
    for (const v of villageIndex.values()) {
      if (v.name) villagesByName.set(v.name, v);
    }
    const members = (await membersRaw()).map((r) => mapMember(r, villageIndex));
    const map = new Map();
    for (const m of members) {
      if (m.name) {
        map.set(m.name, m);
        const clean = m.name.replace(/\s*\(.*?\)/, '').trim();
        if (clean && !map.has(clean)) {
          map.set(clean, m);
        }
      }
    }
    return { members, map, villageIndex, villagesByName };
  }

  async function getAllMappedBooths(forceFresh = false) {
    const rawList = await boothsRaw(forceFresh);
    const { map, villagesByName } = await getMembersByNameIndex();
    return rawList.map((r) => mapBooth(r, map, villagesByName));
  }

  async function getAllMappedMembers() {
    const rawVillages = await villagesRaw();
    const villageIndex = buildVillageIndex(rawVillages);
    const officialVillages = rawVillages.map(mapVillage).filter(isOfficialVillage);
    const officialVillageIds = new Set(officialVillages.map((v) => v.id).filter(Boolean));
    return (await membersRaw())
      .map((r) => mapMember(r, villageIndex))
      .filter((m) => isOfficialMember(m, officialVillageIds));
  }

  async function getAllMappedVillages() {
    return (await villagesRaw()).map(mapVillage).filter(isOfficialVillage);
  }

  const matchingService = createMatchingService({
    getBooths: getAllMappedBooths,
    getMembers: getAllMappedMembers,
    getVillages: getAllMappedVillages,
    authStore,
  });

  const connectionService = options.connectionService || createConnectionService({
    lark,
    config,
    boothsRaw,
    villagesRaw,
    membersRaw,
    authStore,
  });
  const learningService = options.learningService || createLearningService({
    lark,
    config,
    connectionService,
    membersRaw,
  });
  const knowledgeService = options.knowledgeService || createKnowledgeService({
    lark,
    config,
    membersRaw,
  });
  const honorsService = options.honorsService || createHonorsService({
    lark,
    config,
    getMembers: getAllMappedMembers,
    getVillages: getAllMappedVillages,
    getBooths: getAllMappedBooths,
  });
  const gate1Service = options.gate1Service || createGate1Service({
    lark,
    config,
    getVillageRecords: gate1VillagesRaw,
    getGate1Records: gate1Raw,
  });

  const server = http.createServer(async (req, res) => {
    let url;
    try {
      url = new URL(req.url, 'http://localhost');
    } catch {
      return reply(res, 400, { error: 'Invalid URL' });
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      return reply(res, 200, { status: 'ok', mode: 'readonly-local-preview' });
    }

    if (url.pathname === '/favicon.ico') {
      res.writeHead(204);
      return res.end();
    }

    if (url.pathname === '/auth/lark/login' && req.method === 'GET') {
      if (hasSession(req, sessions)) {
        return redirect(res, '/');
      }
      const now = Date.now();
      for (const [st, val] of oauthStates) {
        if (now > val.expiresAt) oauthStates.delete(st);
      }
      const state = randomBytes(32).toString('hex');
      oauthStates.set(state, {
        createdAt: now,
        expiresAt: now + 10 * 60 * 1000,
      });

      const authBase = 'https://accounts.larksuite.com/open-apis/authen/v1/authorize';
      const redirectUri = config.larkRedirectUri;
      const authUrl = `${authBase}?client_id=${encodeURIComponent(config.appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
      res.writeHead(302, { Location: authUrl });
      return res.end();
    }

    if (url.pathname === '/auth/lark/callback' && req.method === 'GET') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!state || !oauthStates.has(state)) {
        return reply(res, 400, { error: 'Invalid or missing OAuth state' });
      }
      const stateData = oauthStates.get(state);
      oauthStates.delete(state); // Single use to prevent replay
      if (Date.now() > stateData.expiresAt) {
        return reply(res, 400, { error: 'OAuth state has expired' });
      }
      if (!code) {
        const errParam = url.searchParams.get('error') || 'missing_code';
        return reply(res, 400, { error: `Lark authorization failed: ${errParam}` });
      }

      let userData;
      try {
        userData = await lark.exchangeCodeForUser(code);
      } catch (err) {
        console.error('[Lark SSO] Failed to exchange code:', err?.message);
        return reply(res, 401, { error: 'Failed to verify Lark authorization code' });
      }

      const openId = userData?.open_id;
      if (!openId) {
        return reply(res, 401, { error: 'Lark did not return user open_id' });
      }

      const [rawMembers, rawVillages] = await Promise.all([membersRaw(), villagesRaw()]);
      const villageIndex = buildVillageIndex(rawVillages);

      const matchedRecord = rawMembers.find((r) => {
        const lu = Array.isArray(r.fields?.Lark_User) ? r.fields.Lark_User : (r.fields?.Lark_User?.value ?? []);
        return lu.some((u) => u?.id === openId);
      });

      if (!matchedRecord) {
        console.warn(`[Lark SSO] User ${openId} not found in T02_Members`);
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(loginPage('Tài khoản Lark chưa được cấp quyền trong danh sách thành viên AXANH Gate1 (T02_Members). Vui lòng liên hệ BTC.'));
      }

      const member = mapMember(matchedRecord, villageIndex);
      const role = member.programRole ? member.programRole.toLowerCase() : 'member';
      const token = randomBytes(32).toString('hex');
      const user = {
        memberId: member.id,
        name: member.name,
        villageId: member.villageId,
        villageName: member.villageName,
        office: member.office,
        avatarUrl: member.avatarUrl,
        role,
        email: extractLoginEmail(matchedRecord) || null,
      };
      if (authStore) {
        authStore.createSession({
          token,
          user,
          authType: 'lark',
          maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
        });
      }
      sessions.set(token, {
        expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
        user,
        authType: 'lark',
      });

      return redirect(res, '/', createSessionCookie(token, SESSION_MAX_AGE_SECONDS, req, config, 'Lax'));
    }

    if (url.pathname === '/auth/lark/in-app-login' && req.method === 'POST') {
      if (!isLocalRequest(req) || !sameOriginPost(req, config)) return reply(res, 403, { error: 'Invalid origin' });
      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { error: 'Invalid JSON request' });
      }
      const code = body?.code;
      if (!code || typeof code !== 'string') {
        return reply(res, 400, { error: 'Missing code' });
      }

      let userData;
      try {
        userData = await lark.exchangeCodeForUser(code);
      } catch (err) {
        console.error('[Lark In-App SSO] Failed to exchange code:', err?.message);
        return reply(res, 401, { error: 'Failed to verify Lark authorization code' });
      }

      const openId = userData?.open_id;
      if (!openId) {
        return reply(res, 401, { error: 'Lark did not return user open_id' });
      }

      const [rawMembers, rawVillages] = await Promise.all([membersRaw(), villagesRaw()]);
      const villageIndex = buildVillageIndex(rawVillages);

      const matchedRecord = rawMembers.find((r) => {
        const lu = Array.isArray(r.fields?.Lark_User) ? r.fields.Lark_User : (r.fields?.Lark_User?.value ?? []);
        return lu.some((u) => u?.id === openId);
      });

      if (!matchedRecord) {
        console.warn(`[Lark In-App SSO] User ${openId} not found in T02_Members`);
        return reply(res, 403, { error: 'Tài khoản Lark chưa được cấp quyền trong danh sách thành viên AXANH Gate1.' });
      }

      const member = mapMember(matchedRecord, villageIndex);
      const role = member.programRole ? member.programRole.toLowerCase() : 'member';
      const token = randomBytes(32).toString('hex');
      const user = {
        memberId: member.id,
        name: member.name,
        villageId: member.villageId,
        villageName: member.villageName,
        office: member.office,
        avatarUrl: member.avatarUrl,
        role,
        email: extractLoginEmail(matchedRecord) || null,
      };
      authStore.createSession({
        token,
        user,
        authType: 'lark-in-app',
        maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
      });
      sessions.set(token, {
        expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
        user,
        authType: 'lark-in-app',
      });

      const cookie = createSessionCookie(token, SESSION_MAX_AGE_SECONDS, req, config, 'Lax');
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': cookie,
        'Cache-Control': 'no-store',
      });
      return res.end(JSON.stringify({ authenticated: true, user }));
    }

    if (url.pathname === '/auth/email/request-otp' && req.method === 'POST') {
      if (!isLocalRequest(req) || !sameOriginPost(req, config)) {
        return reply(res, 403, { error: 'Invalid origin' });
      }
      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { error: 'Invalid JSON request' });
      }

      const email = body?.email;
      if (!email || typeof email !== 'string') {
        return reply(res, 400, { error: 'Vui lòng cung cấp địa chỉ email.' });
      }
      const trimmedEmail = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 254) {
        return reply(res, 400, { error: 'Định dạng email không hợp lệ.' });
      }

      const normEmail = trimmedEmail.toLowerCase();
      const clientIp = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1').trim();

      // IP Rate Limit: max 10 requests / 15 minutes
      const ipLimit = authStore.checkRateLimit(`ip:${clientIp}`, 10, 900);
      if (!ipLimit.allowed) {
        return reply(res, 429, { error: `Quá nhiều yêu cầu từ IP của bạn. Vui lòng thử lại sau ${Math.ceil(ipLimit.waitSeconds / 60)} phút.` });
      }

      const rawMembers = await membersRaw();
      const matched = rawMembers.filter((r) => extractLoginEmail(r) === normEmail);

      // Check conflict: multiple members with same Login_Email
      if (matched.length > 1) {
        console.warn(`[Email OTP] Conflict: ${matched.length} members found for email ${normEmail}`);
        // Return generic success to avoid enumeration, but never issue OTP
        return reply(res, 200, {
          success: true,
          message: 'Nếu email hợp lệ, mã xác thực sẽ được gửi đến hộp thư của bạn.',
          cooldownSeconds: 60,
        });
      }

      // If no member found with this email
      if (matched.length === 0) {
        // Dummy timing delay to avoid user enumeration via timing attack
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 20));
        return reply(res, 200, {
          success: true,
          message: 'Nếu email hợp lệ, mã xác thực sẽ được gửi đến hộp thư của bạn.',
          cooldownSeconds: 60,
        });
      }

      // Check Email Rate Limit: max 5 requests / 15 minutes
      const emailLimit = authStore.checkRateLimit(`email:${normEmail}`, 5, 900);
      if (!emailLimit.allowed) {
        return reply(res, 429, { error: `Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau ${Math.ceil(emailLimit.waitSeconds / 60)} phút.` });
      }

      const memberRecord = matched[0];
      const memberId = textValue(memberRecord.fields?.Member_ID);
      const memberName = personName(memberRecord.fields?.Display_Name);

      const otpResult = authStore.createOtp({
        email: normEmail,
        memberId,
        ttlMs: 5 * 60 * 1000,
        cooldownMs: 60 * 1000,
      });

      if (!otpResult.allowed) {
        return reply(res, 429, { error: otpResult.error });
      }

      try {
        await emailService.sendOtp({
          to: normEmail,
          otp: otpResult.otp,
          memberName,
          ttlMinutes: 5,
        });
      } catch (err) {
        console.error('[Email OTP] Send error:', err.message);
        return reply(res, 500, { error: 'Hệ thống gửi email tạm thời gặp sự cố. Vui lòng thử lại sau.' });
      }

      return reply(res, 200, {
        success: true,
        message: 'Nếu email hợp lệ, mã xác thực sẽ được gửi đến hộp thư của bạn.',
        cooldownSeconds: 60,
        ttlMinutes: 5,
      });
    }

    if (url.pathname === '/auth/email/verify-otp' && req.method === 'POST') {
      if (!isLocalRequest(req) || !sameOriginPost(req, config)) {
        return reply(res, 403, { error: 'Invalid origin' });
      }
      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { error: 'Invalid JSON request' });
      }

      const email = body?.email;
      const otp = body?.otp;

      if (!email || typeof email !== 'string') {
        return reply(res, 400, { error: 'Vui lòng cung cấp địa chỉ email.' });
      }
      if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
        return reply(res, 400, { error: 'Mã xác thực phải gồm 6 chữ số.' });
      }

      const normEmail = email.trim().toLowerCase();
      const verifyRes = authStore.verifyOtp({ email: normEmail, candidateOtp: otp.trim() });

      if (!verifyRes.valid) {
        return reply(res, 400, { error: verifyRes.error });
      }

      const memberId = verifyRes.memberId;
      const [rawMembers, rawVillages] = await Promise.all([membersRaw(), villagesRaw()]);
      const villageIndex = buildVillageIndex(rawVillages);

      const matchedRecord = rawMembers.find((r) => textValue(r.fields?.Member_ID) === memberId);
      if (!matchedRecord) {
        return reply(res, 403, { error: 'Hồ sơ thành viên không tồn tại trong danh bạ AXANH.' });
      }

      const member = mapMember(matchedRecord, villageIndex);
      const role = member.programRole ? member.programRole.toLowerCase() : 'member';
      const token = randomBytes(32).toString('hex');
      const user = {
        memberId: member.id,
        name: member.name,
        villageId: member.villageId,
        villageName: member.villageName,
        office: member.office,
        avatarUrl: member.avatarUrl,
        role,
        email: normEmail,
      };

      authStore.createSession({
        token,
        user,
        authType: 'email-otp',
        maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
      });
      sessions.set(token, {
        expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
        user,
        authType: 'email-otp',
      });

      const cookie = createSessionCookie(token, SESSION_MAX_AGE_SECONDS, req, config, 'Lax');
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': cookie,
        'Cache-Control': 'no-store',
      });
      return res.end(JSON.stringify({ authenticated: true, user }));
    }

    if (url.pathname === '/dev-login') {
      if (!isLocalRequest(req)) return reply(res, 403, { error: 'Local preview only' });
      if (req.method === 'GET') {
        return hasSession(req, sessions, authStore) ? redirect(res, '/index.html') : sendLoginPage(res);
      }
      if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed' });
      if (!sameOriginPost(req, config)) return reply(res, 403, { error: 'Invalid origin' });
      let params;
      try {
        params = await formBody(req);
      } catch {
        return reply(res, 400, { error: 'Invalid login form' });
      }
      if (!sameKey(params.get('key'), config.testKey)) return sendLoginPage(res, 401, 'wrong-key');
      const token = randomBytes(32).toString('hex');
      const user = {
        memberId: 'DEV-0001',
        name: 'Developer (Local Preview)',
        villageId: null,
        villageName: 'Nội bộ thử nghiệm',
        office: 'VPC',
        avatarUrl: null,
        role: 'developer',
      };
      authStore.createSession({
        token,
        user,
        authType: 'local-dev',
        maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
      });
      sessions.set(token, {
        expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
        user,
        authType: 'local-dev',
      });
      return redirect(res, '/index.html', createSessionCookie(token, SESSION_MAX_AGE_SECONDS, req, config));
    }

    if ((url.pathname === '/auth/logout' || url.pathname === '/dev-logout') && req.method === 'POST') {
      if (!isLocalRequest(req) || !sameOriginPost(req, config)) return reply(res, 403, { error: 'Invalid origin' });
      const token = cookieValue(req, COOKIE_NAME);
      if (token) {
        sessions.delete(token);
        authStore.destroySession(token);
      }
      const acceptsJson = String(req.headers.accept || '').includes('application/json');
      if (acceptsJson) {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Set-Cookie': createSessionCookie('', 0, req, config),
          'Cache-Control': 'no-store',
        });
        return res.end(JSON.stringify({ success: true }));
      }
      return redirect(res, '/dev-login', createSessionCookie('', 0, req, config));
    }

    if (url.pathname === '/api/v1/me' && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!session && !hasTestKey) {
        return reply(res, 401, { authenticated: false, error: 'Unauthorized' });
      }
      const isMatchingAdmin = hasTestKey || canManageMatching(session, config);
      const isAdmin = hasTestKey || isAdminUser(session, config);
      const user = session?.user || {
        memberId: 'DEV-0001',
        name: 'Developer (Test Key)',
        villageId: null,
        villageName: 'Nội bộ thử nghiệm',
        office: 'VPC',
        avatarUrl: null,
        role: 'developer',
      };
      return reply(res, 200, {
        authenticated: true,
        user: {
          ...user,
          isAdmin,
        },
        capabilities: {
          matchingManage: isMatchingAdmin,
        },
      });
    }

    if (url.pathname === '/api/v1/integrations/forms' && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }
      const data = authStore ? authStore.getFormsConfig() : { form01Url: '', form02Url: '', updatedAt: null };
      return reply(res, 200, {
        success: true,
        data,
      });
    }

    if (url.pathname === '/api/v1/admin/integrations/forms' && req.method === 'PUT') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }
      const isAdmin = hasTestKey || isAdminUser(session, config);
      if (!isAdmin) {
        return reply(res, 403, {
          success: false,
          error: 'Bạn không có quyền quản trị để thay đổi cấu hình biểu mẫu.',
        });
      }
      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { success: false, error: 'Dữ liệu không đúng định dạng JSON.' });
      }

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return reply(res, 400, { success: false, error: 'Dữ liệu không hợp lệ.' });
      }

      const { form01Url, form02Url } = body;

      if (form01Url !== undefined && !isValidLarkFormUrl(form01Url)) {
        return reply(res, 400, {
          success: false,
          error: 'URL Form 01 không hợp lệ. Chỉ chấp nhận liên kết HTTPS thuộc tên miền chính thức của Lark (larksuite.com hoặc feishu.cn).',
        });
      }
      if (form02Url !== undefined && !isValidLarkFormUrl(form02Url)) {
        return reply(res, 400, {
          success: false,
          error: 'URL Form 02 không hợp lệ. Chỉ chấp nhận liên kết HTTPS thuộc tên miền chính thức của Lark (larksuite.com hoặc feishu.cn).',
        });
      }

      const updated = authStore
        ? authStore.updateFormsConfig({ form01Url, form02Url })
        : { form01Url: form01Url || '', form02Url: form02Url || '', updatedAt: new Date().toISOString() };

      return reply(res, 200, {
        success: true,
        message: 'Cấu hình biểu mẫu Lark đã được cập nhật thành công.',
        data: updated,
      });
    }

    // ===== PHIÊN CHỢ TRI THỨC (BOOTHS) APIs =====
    if (url.pathname === '/api/v1/booths' && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized: Vui lòng đăng nhập' });
      }
      try {
        const rawList = await boothsRaw();
        const { map, villagesByName } = await getMembersByNameIndex();
        const currentMemberId = session?.user?.memberId;
        const currentName = session?.user?.name;
        const typeFilter = url.searchParams.get('type')?.trim().toLowerCase();

        const items = rawList.map((r) => mapBooth(r, map, villagesByName)).filter((b) => {
          if (typeFilter === 'personal' || typeFilter === 'cá nhân') {
            if (b.boothType !== 'personal') return false;
          } else if (typeFilter === 'village' || typeFilter === 'làng') {
            if (b.boothType !== 'village') return false;
          }
          if (b.consent) return true;
          if (currentMemberId && b.authorMemberId === currentMemberId) return true;
          if (currentName && b.authorName.toLowerCase() === currentName.toLowerCase()) return true;
          if (b.recordId && authStore?.isBoothOwner(b.recordId, currentMemberId, currentName)) return true;
          return false;
        });

        return reply(res, 200, { success: true, count: items.length, items });
      } catch (err) {
        console.error('[Booths API] Error fetching booths:', err.message);
        return reply(res, 500, { success: false, error: 'Không thể tải danh sách gian hàng tri thức từ Lark Base.' });
      }
    }

    // POST /api/v1/booths/sync – Force invalidate cache và fetch lại từ Lark Base
    if (url.pathname === '/api/v1/booths/sync' && req.method === 'POST') {
      const session = getSession(req, sessions, authStore);
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }
      try {
        cached.delete('booth-raw');
        const rawList = await boothsRaw(true);
        const { map, villagesByName } = await getMembersByNameIndex();
        const currentMemberId = session?.user?.memberId;
        const currentName = session?.user?.name;
        const items = rawList.map((r) => mapBooth(r, map, villagesByName)).filter((b) => {
          if (b.consent) return true;
          if (currentMemberId && b.authorMemberId === currentMemberId) return true;
          if (currentName && b.authorName.toLowerCase() === currentName.toLowerCase()) return true;
          if (b.recordId && authStore?.isBoothOwner(b.recordId, currentMemberId, currentName)) return true;
          return false;
        });
        return reply(res, 200, { success: true, synced: true, count: items.length, items });
      } catch (err) {
        console.error('[Booths Sync] Error:', err.message);
        return reply(res, 500, { success: false, error: 'Không thể đồng bộ dữ liệu từ Lark Base.' });
      }
    }

    if (url.pathname === '/api/v1/booths/mine' && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized: Vui lòng đăng nhập' });
      }
      try {
        const currentMemberId = session?.user?.memberId;
        const currentName = session?.user?.name;
        const rawList = await boothsRaw();
        const { map, villagesByName } = await getMembersByNameIndex();
        const typeFilter = url.searchParams.get('type')?.trim().toLowerCase();

        const items = rawList.map((r) => mapBooth(r, map, villagesByName)).filter((b) => {
          const isMine = (currentMemberId && b.authorMemberId === currentMemberId) ||
                         (currentName && b.authorName.toLowerCase() === currentName.toLowerCase()) ||
                         (b.recordId && authStore?.isBoothOwner(b.recordId, currentMemberId, currentName));
          if (!isMine) return false;
          if (typeFilter === 'personal' || typeFilter === 'cá nhân') {
            if (b.boothType !== 'personal') return false;
          } else if (typeFilter === 'village' || typeFilter === 'làng') {
            if (b.boothType !== 'village') return false;
          }
          return true;
        });

        return reply(res, 200, { success: true, count: items.length, items });
      } catch (err) {
        console.error('[Booths API] Error fetching my booths:', err.message);
        return reply(res, 500, { success: false, error: 'Không thể tải gian hàng của bạn.' });
      }
    }

    if (url.pathname === '/api/v1/booths' && req.method === 'POST') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized: Vui lòng đăng nhập để đăng ký gian hàng' });
      }

      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { success: false, error: 'Dữ liệu không đúng định dạng JSON.' });
      }

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return reply(res, 400, { success: false, error: 'Dữ liệu không hợp lệ.' });
      }

      const user = session?.user || (hasTestKey ? { memberId: 'MEM-0082', name: 'Lucian Tran' } : null);
      if (!user || !user.memberId) {
        return reply(res, 401, { success: false, error: 'Không tìm thấy thông tin thành viên trong phiên đăng nhập.' });
      }

      const { members, map, villagesByName } = await getMembersByNameIndex();
      let memberRecord = members.find((m) => m.id === user.memberId);
      if (!memberRecord && user.name) {
        memberRecord = map.get(user.name) || map.get(user.name.replace(/\s*\(.*?\)/, ''));
      }

      const authorName = memberRecord?.name || user.name;
      if (!authorName) {
        return reply(res, 400, { success: false, error: 'Không xác định được danh tính thành viên.' });
      }

      // Determine Booth_Type (personal vs village)
      const rawReqType = typeof body.boothType === 'string' ? body.boothType.trim().toLowerCase() :
                         typeof body.type === 'string' ? body.type.trim().toLowerCase() : 'personal';
      const isVillage = rawReqType === 'village' || rawReqType === 'làng' || rawReqType === 'lang';
      const targetBoothType = isVillage ? 'Làng' : 'Cá nhân';

      if (isVillage) {
        const userVillageId = memberRecord?.villageId;
        const userVillageName = memberRecord?.villageName;
        if (!userVillageId || !userVillageName || userVillageName === 'Chưa xác định') {
          return reply(res, 400, {
            success: false,
            error: 'Tài khoản của bạn chưa được liên kết với Làng nào trong danh bạ T02_Members, không thể đăng ký gian hàng Làng.',
          });
        }
      }

      const offer = typeof body.offer === 'string' ? body.offer.trim() : '';
      if (!offer || offer.length < 2 || offer.length > 2000) {
        return reply(res, 400, { success: false, error: 'Vui lòng nhập điều bạn có thể chia sẻ (2 - 2000 ký tự).' });
      }

      const offerTag = typeof body.offerTag === 'string' ? body.offerTag.trim() : '';
      if (!offerTag) {
        return reply(res, 400, { success: false, error: 'Vui lòng chọn chủ đề chia sẻ.' });
      }

      const need = typeof body.need === 'string' ? body.need.trim() : '';
      if (!need || need.length < 2 || need.length > 2000) {
        return reply(res, 400, { success: false, error: 'Vui lòng nhập điều bạn muốn học (2 - 2000 ký tự).' });
      }

      const needTag = typeof body.needTag === 'string' ? body.needTag.trim() : '';
      if (!needTag) {
        return reply(res, 400, { success: false, error: 'Vui lòng chọn chủ đề muốn học.' });
      }

      const preferredFormat = typeof body.preferredFormat === 'string' ? body.preferredFormat.trim() : '';
      const outcome = typeof body.outcome === 'string' ? body.outcome.trim() : '';

      let availability = null;
      if (body.availability !== undefined && body.availability !== null && body.availability !== '') {
        if (typeof body.availability === 'number' && Number.isFinite(body.availability)) {
          availability = Math.round(body.availability);
        } else if (typeof body.availability === 'string') {
          const parsed = Date.parse(body.availability);
          if (!Number.isNaN(parsed)) {
            availability = parsed;
          }
        }
      }

      const consent = body.consent !== false;

      const larkFields = {
        'Tên của bạn': authorName,
        'Booth_Type': targetBoothType,
        'Điều bạn có thể chia sẻ': offer,
        'Chủ đề chia sẻ': offerTag,
        'Điều em muốn học': need,
        'Chủ đề bạn muốn học': needTag,
        'Bạn đồng ý cho hiển thị thông tin về kỹ năng và nhu cầu trong phạm vi bản demo nội bộ này.': consent,
      };

      if (preferredFormat) {
        larkFields['Hình thức mà bạn mong muốn?'] = preferredFormat;
      }
      if (availability) {
        larkFields['Khung giờ ưu tiên'] = availability;
      }
      if (outcome) {
        larkFields['Kết quả mong muốn sau buổi hỗ trợ'] = outcome;
      }

      try {
        const created = await lark.createRecord(config.boothTableId, larkFields);
        const recordId = created?.record_id;
        const boothId = textValue(created?.fields?.Booth_ID) || '';

        if (authStore && recordId) {
          authStore.registerBooth({
            recordId,
            boothId,
            memberId: user.memberId,
            authorName,
            boothType: isVillage ? 'village' : 'personal',
            villageId: memberRecord?.villageId || '',
          });
        }

        cached.delete('booth-raw');
        const mapped = mapBooth(created, map, villagesByName);

        return reply(res, 201, {
          success: true,
          message: isVillage ? 'Đăng ký gian hàng cho Làng thành công!' : 'Đăng ký gian hàng tri thức thành công!',
          data: mapped,
        });
      } catch (err) {
        console.error('[Booths API] Error creating booth in Lark:', err.message);
        return reply(res, 502, { success: false, error: 'Không thể ghi nhận gian hàng lên Lark Base. Vui lòng thử lại.' });
      }
    }

    const boothPatchMatch = /^\/api\/v1\/booths\/([A-Za-z0-9_-]{10,64})$/.exec(url.pathname);
    if (boothPatchMatch && req.method === 'PATCH') {
      const recordId = boothPatchMatch[1];
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }

      const user = session?.user;
      const isAdmin = hasTestKey || isAdminUser(session, config);
      let isOwner = false;

      if (authStore && user?.memberId) {
        isOwner = authStore.isBoothOwner(recordId, user.memberId, user.name);
      }

      if (!isOwner && !isAdmin) {
        try {
          const existing = await lark.getRecord(config.boothTableId, recordId);
          const author = textValue(existing.record?.fields?.['Tên của bạn'] || existing.fields?.['Tên của bạn']);
          if (user?.name && author && author.toLowerCase() === user.name.toLowerCase()) {
            isOwner = true;
          }
        } catch {}
      }

      if (!isOwner && !isAdmin) {
        return reply(res, 403, {
          success: false,
          error: 'Bạn không có quyền chỉnh sửa gian hàng này.',
        });
      }

      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { success: false, error: 'Dữ liệu không đúng định dạng JSON.' });
      }

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return reply(res, 400, { success: false, error: 'Dữ liệu không hợp lệ.' });
      }

      const updateFields = {};
      if (typeof body.offer === 'string') {
        const off = body.offer.trim();
        if (off.length < 2) return reply(res, 400, { success: false, error: 'Điều chia sẻ quá ngắn.' });
        updateFields['Điều bạn có thể chia sẻ'] = off;
      }
      if (typeof body.offerTag === 'string' && body.offerTag.trim()) {
        updateFields['Chủ đề chia sẻ'] = body.offerTag.trim();
      }
      if (typeof body.need === 'string') {
        const nd = body.need.trim();
        if (nd.length < 2) return reply(res, 400, { success: false, error: 'Nhu cầu học quá ngắn.' });
        updateFields['Điều em muốn học'] = nd;
      }
      if (typeof body.needTag === 'string' && body.needTag.trim()) {
        updateFields['Chủ đề bạn muốn học'] = body.needTag.trim();
      }
      if (typeof body.preferredFormat === 'string') {
        updateFields['Hình thức mà bạn mong muốn?'] = body.preferredFormat.trim();
      }
      if (body.outcome !== undefined) {
        updateFields['Kết quả mong muốn sau buổi hỗ trợ'] = typeof body.outcome === 'string' ? body.outcome.trim() : '';
      }
      if (body.availability !== undefined) {
        if (body.availability === null || body.availability === '') {
          updateFields['Khung giờ ưu tiên'] = null;
        } else if (typeof body.availability === 'number' && Number.isFinite(body.availability)) {
          updateFields['Khung giờ ưu tiên'] = Math.round(body.availability);
        } else if (typeof body.availability === 'string') {
          const parsed = Date.parse(body.availability);
          if (!Number.isNaN(parsed)) updateFields['Khung giờ ưu tiên'] = parsed;
        }
      }
      if (typeof body.consent === 'boolean') {
        updateFields['Bạn đồng ý cho hiển thị thông tin về kỹ năng và nhu cầu trong phạm vi bản demo nội bộ này.'] = body.consent;
      }

      if (Object.keys(updateFields).length === 0) {
        return reply(res, 400, { success: false, error: 'Không có trường nào cần cập nhật.' });
      }

      try {
        const updated = await lark.updateRecord(config.boothTableId, recordId, updateFields);
        cached.delete('booth-raw');
        const { map, villagesByName } = await getMembersByNameIndex();
        const mapped = mapBooth(updated, map, villagesByName);

        return reply(res, 200, {
          success: true,
          message: 'Cập nhật gian hàng thành công!',
          data: mapped,
        });
      } catch (err) {
        console.error('[Booths API] Error updating booth in Lark:', err.message);
        return reply(res, 502, { success: false, error: 'Không thể cập nhật gian hàng lên Lark Base.' });
      }
    }

    if (url.pathname === '/api/v1/matching/context' && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized: Vui lòng đăng nhập' });
      }
      const sessionUser = session?.user || {
        memberId: 'DEV-0001',
        name: 'Developer (Test Key)',
        villageId: null,
        villageName: 'Nội bộ thử nghiệm',
        office: 'VPC',
        avatarUrl: null,
        role: 'developer',
      };
      const isAdmin = hasTestKey || canManageMatching(session, config);
      const targetMemberId = url.searchParams.get('memberId')?.trim() || null;
      const targetVillageId = url.searchParams.get('villageId')?.trim() || null;

      try {
        const data = await matchingService.getMatchingContext({
          sessionUser,
          isAdmin,
          targetMemberId,
          targetVillageId,
        });
        return reply(res, 200, { success: true, data });
      } catch (err) {
        return reply(res, err.statusCode || 500, { success: false, error: err.message });
      }
    }

    if (url.pathname === '/api/v1/matching/suggestions' && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized: Vui lòng đăng nhập' });
      }
      const sessionUser = session?.user || {
        memberId: 'DEV-0001',
        name: 'Developer (Test Key)',
        villageId: null,
        villageName: 'Nội bộ thử nghiệm',
        office: 'VPC',
        avatarUrl: null,
        role: 'developer',
      };
      const isAdmin = hasTestKey || canManageMatching(session, config);
      const mode = url.searchParams.get('mode')?.trim() || 'personal';
      const boothId = url.searchParams.get('boothId')?.trim() || null;

      try {
        const data = await matchingService.getMatchingSuggestions({
          sessionUser,
          isAdmin,
          mode,
          boothId,
        });
        return reply(res, 200, { success: true, data });
      } catch (err) {
        return reply(res, err.statusCode || 500, { success: false, error: err.message });
      }
    }

    // ===== CONNECTION REQUEST & APPROVAL (T14_CONNECTIONS) APIs =====

    // ===== LEARNING SESSIONS (T15) AND FORM 02 RESULTS APIs =====
    if (url.pathname === '/api/v1/honors' && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      if (!session) return reply(res, 401, { success: false, error: 'Unauthorized' });
      try {
        const data = await honorsService.getOverview({ forceFresh: url.searchParams.get('refresh') === '1' });
        return reply(res, 200, { success: true, ...data });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    if (url.pathname === '/api/v1/gate1' && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      if (!session) return reply(res, 401, { success: false, error: 'Unauthorized' });
      try {
        const data = await gate1Service.getOverview({ forceFresh: url.searchParams.get('refresh') === '1' });
        return reply(res, 200, {
          success: true,
          ...data,
          scope: 'all',
        });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    if (url.pathname === '/api/v1/knowledge' && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      if (!session) return reply(res, 401, { success: false, error: 'Unauthorized' });
      try {
        const data = await knowledgeService.listKnowledge();
        return reply(res, 200, { success: true, ...data });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    const knowledgeDetailMatch = /^\/api\/v1\/knowledge\/([A-Za-z0-9_-]{1,128})$/.exec(url.pathname);
    if (knowledgeDetailMatch && req.method === 'GET') {
      const session = getSession(req, sessions, authStore);
      if (!session) return reply(res, 401, { success: false, error: 'Unauthorized' });
      try {
        const data = await knowledgeService.getKnowledge(knowledgeDetailMatch[1]);
        return reply(res, 200, { success: true, data });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    if (url.pathname === '/api/v1/learning-sessions' && req.method === 'GET') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) return reply(res, 401, { success: false, error: 'Unauthorized' });
      const sessionUser = resolveConnectionUser(session);
      const isAdmin = hasTestKey || isAdminUser(session, config);
      try {
        const data = await learningService.listLearningData({ sessionUser, isAdmin });
        return reply(res, 200, { success: true, ...data });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    if (url.pathname === '/api/v1/learning-sessions' && req.method === 'POST') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) return reply(res, 401, { success: false, error: 'Unauthorized' });
      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { success: false, error: 'Invalid JSON body' });
      }
      try {
        const data = await learningService.createLearningSession({
          sessionUser: resolveConnectionUser(session),
          connectionId: body?.connectionId,
          title: body?.title,
          startAt: body?.startAt,
          endAt: body?.endAt,
          format: body?.format,
          locationOrLink: body?.locationOrLink,
        });
        return reply(res, 201, { success: true, data });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    const learningRespondMatch = /^\/api\/v1\/learning-sessions\/([A-Za-z0-9_-]{1,128})\/respond$/.exec(url.pathname);
    if (learningRespondMatch && req.method === 'POST') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) return reply(res, 401, { success: false, error: 'Unauthorized' });
      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { success: false, error: 'Invalid JSON body' });
      }
      try {
        const data = await learningService.respondToSession({
          sessionUser: resolveConnectionUser(session),
          id: learningRespondMatch[1],
          decision: body?.decision,
        });
        return reply(res, 200, { success: true, data });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    const learningCompleteMatch = /^\/api\/v1\/learning-sessions\/([A-Za-z0-9_-]{1,128})\/complete$/.exec(url.pathname);
    if (learningCompleteMatch && req.method === 'POST') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) return reply(res, 401, { success: false, error: 'Unauthorized' });
      try {
        const data = await learningService.completeSession({
          sessionUser: resolveConnectionUser(session),
          id: learningCompleteMatch[1],
        });
        return reply(res, 200, { success: true, data });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    const learningResultsMatch = /^\/api\/v1\/learning-sessions\/([A-Za-z0-9_-]{1,128})\/results$/.exec(url.pathname);
    if (learningResultsMatch && req.method === 'GET') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) return reply(res, 401, { success: false, error: 'Unauthorized' });
      try {
        const items = await learningService.getSessionResults({
          sessionUser: resolveConnectionUser(session),
          isAdmin: hasTestKey || isAdminUser(session, config),
          id: learningResultsMatch[1],
        });
        return reply(res, 200, { success: true, items });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    if (learningResultsMatch && req.method === 'POST') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) return reply(res, 401, { success: false, error: 'Unauthorized' });
      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { success: false, error: 'Invalid JSON body' });
      }
      try {
        const data = await learningService.submitSessionResult({
          sessionUser: resolveConnectionUser(session),
          id: learningResultsMatch[1],
          learned: body?.learned,
          applied: body?.applied,
          rating: body?.rating,
          asset: body?.asset,
          outcome: body?.outcome,
          evidence: body?.evidence,
          share: body?.share,
        });
        return reply(res, 200, { success: true, ...data });
      } catch (err) {
        return reply(res, err.statusCode || (err.name === 'LarkError' ? 502 : 500), { success: false, error: err.message });
      }
    }

    // POST /api/v1/connections - Create connection request
    if (url.pathname === '/api/v1/connections' && req.method === 'POST') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized: Vui lòng đăng nhập để gửi lời mời kết nối' });
      }
      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { success: false, error: 'Invalid JSON body' });
      }
      const sessionUser = resolveConnectionUser(session);
      const isAdmin = hasTestKey || isAdminUser(session, config) || canManageMatching(session, config);
      try {
        const result = await connectionService.createConnection({
          sessionUser,
          isAdmin,
          sourceBoothId: body?.sourceBoothId || body?.sourceBooth,
          targetBoothId: body?.targetBoothId || body?.targetBooth,
          connectionType: body?.connectionType || body?.type || 'personal',
          idempotencyKey: body?.idempotencyKey || req.headers['idempotency-key'] || null,
        });
        return reply(res, 201, result);
      } catch (err) {
        return reply(res, err.statusCode || 500, { success: false, error: err.message });
      }
    }

    // GET /api/v1/connections/mine - List user's relevant connections
    if (url.pathname === '/api/v1/connections/mine' && req.method === 'GET') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }
      const sessionUser = resolveConnectionUser(session);
      const isAdmin = hasTestKey || isAdminUser(session, config) || canManageMatching(session, config);
      const status = url.searchParams.get('status')?.trim() || null;
      try {
        const result = await connectionService.listConnections({
          sessionUser,
          isAdmin,
          scope: 'mine',
          status,
        });
        return reply(res, 200, { success: true, count: result.count, items: result.items });
      } catch (err) {
        return reply(res, err.statusCode || 500, { success: false, error: err.message });
      }
    }

    // GET /api/v1/connections/inbox - List pending connection requests for approver
    if (url.pathname === '/api/v1/connections/inbox' && req.method === 'GET') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }
      const sessionUser = resolveConnectionUser(session);
      const isAdmin = hasTestKey || isAdminUser(session, config) || canManageMatching(session, config);
      try {
        const result = await connectionService.listConnections({
          sessionUser,
          isAdmin,
          scope: 'inbox',
        });
        return reply(res, 200, { success: true, count: result.count, items: result.items });
      } catch (err) {
        return reply(res, err.statusCode || 500, { success: false, error: err.message });
      }
    }

    // GET /api/v1/connections/notifications/count - Count pending inbox requests
    if (url.pathname === '/api/v1/connections/notifications/count' && req.method === 'GET') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }
      const sessionUser = resolveConnectionUser(session);
      const isAdmin = hasTestKey || isAdminUser(session, config) || canManageMatching(session, config);
      try {
        const result = await connectionService.getNotificationsCount({
          sessionUser,
          isAdmin,
        });
        return reply(res, 200, result);
      } catch (err) {
        return reply(res, err.statusCode || 500, { success: false, error: err.message });
      }
    }

    // POST /api/v1/connections/:id/respond - Accept or reject connection request
    const respondMatch = /^\/api\/v1\/connections\/([A-Za-z0-9_-]{1,64})\/respond$/.exec(url.pathname);
    if (respondMatch && req.method === 'POST') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }
      let body;
      try {
        body = await jsonBody(req);
      } catch {
        return reply(res, 400, { success: false, error: 'Invalid JSON body' });
      }
      const sessionUser = resolveConnectionUser(session);
      const isAdmin = hasTestKey || isAdminUser(session, config) || canManageMatching(session, config);
      try {
        const result = await connectionService.respondConnection({
          sessionUser,
          isAdmin,
          id: respondMatch[1],
          decision: body?.decision,
          note: body?.note,
        });
        return reply(res, 200, result);
      } catch (err) {
        return reply(res, err.statusCode || 500, { success: false, error: err.message });
      }
    }

    // POST /api/v1/connections/:id/cancel - Cancel connection request (sender only)
    const cancelMatch = /^\/api\/v1\/connections\/([A-Za-z0-9_-]{1,64})\/cancel$/.exec(url.pathname);
    if (cancelMatch && req.method === 'POST') {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      if (!hasTestKey && (!isLocalRequest(req) || !sameOriginPost(req, config))) {
        return reply(res, 403, { success: false, error: 'Invalid origin / Sec-Fetch-Site' });
      }
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }
      const sessionUser = resolveConnectionUser(session);
      const isAdmin = hasTestKey || isAdminUser(session, config) || canManageMatching(session, config);
      try {
        const result = await connectionService.cancelConnection({
          sessionUser,
          isAdmin,
          id: cancelMatch[1],
        });
        return reply(res, 200, result);
      } catch (err) {
        return reply(res, err.statusCode || 500, { success: false, error: err.message });
      }
    }

    // GET /api/v1/connections/:id - Connection detail
    const detailMatch = /^\/api\/v1\/connections\/([A-Za-z0-9_-]{1,64})$/.exec(url.pathname);
    if (detailMatch && req.method === 'GET' && !['mine', 'inbox', 'notifications'].includes(detailMatch[1])) {
      const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
      const session = getSession(req, sessions, authStore);
      if (!session && !hasTestKey) {
        return reply(res, 401, { success: false, error: 'Unauthorized' });
      }
      const sessionUser = resolveConnectionUser(session);
      const isAdmin = hasTestKey || isAdminUser(session, config) || canManageMatching(session, config);
      try {
        const data = await connectionService.getConnectionById({
          sessionUser,
          isAdmin,
          id: detailMatch[1],
        });
        return reply(res, 200, { success: true, data });
      } catch (err) {
        return reply(res, err.statusCode || 500, { success: false, error: err.message });
      }
    }

    if (url.pathname === '/' && req.method === 'GET') {
      return redirect(res, hasSession(req, sessions, authStore) ? '/index.html' : '/dev-login');
    }

    if (req.method === 'GET' && staticFiles.has(url.pathname)) {
      if (!isLocalRequest(req)) return reply(res, 403, { error: 'Local preview only' });
      if (!hasSession(req, sessions, authStore)) return redirect(res, '/dev-login');
      return sendStatic(res, ...staticFiles.get(url.pathname));
    }

    if (!hasSession(req, sessions, authStore) && !sameKey(req.headers['x-internal-test-key'], config.testKey)) {
      return reply(res, 401, { error: 'Unauthorized (local session or server-side test key required)' });
    }
    if (req.method !== 'GET') return reply(res, 405, { error: 'Read-only API' });
    try {
      if (url.pathname === '/api/v1/villages') {
        const session = getSession(req, sessions, authStore);
        const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
        const isAdmin = hasTestKey || isAdminUser(session, config);
        const allVillages = await getAllMappedVillages();
        const items = allVillages.map((v) => {
          if (isAdmin) return v;
          return {
            ...v,
            totalScore: null,
            gate1Status: null,
            gate1Passed: null,
            gate1Total: null,
          };
        });
        return reply(res, 200, { count: items.length, items });
      }
      if (url.pathname === '/api/v1/members') {
        const session = getSession(req, sessions, authStore);
        const hasTestKey = sameKey(req.headers['x-internal-test-key'], config.testKey);
        const isAdmin = hasTestKey || isAdminUser(session, config);
        const allMembers = await getAllMappedMembers();
        const userVillageId = session?.user?.villageId;
        const userVillageName = session?.user?.villageName;
        const currentMemberId = session?.user?.memberId;
        const items = isAdmin
          ? allMembers
          : (userVillageId
              ? allMembers.filter((m) => m.villageId === userVillageId)
              : (userVillageName
                  ? allMembers.filter((m) => m.villageName && m.villageName.toLowerCase() === userVillageName.toLowerCase())
                  : allMembers.filter((m) => m.id === currentMemberId)));
        return reply(res, 200, { count: items.length, items });
      }
      const iconMatch =
        /^\/api\/v1\/villages\/([A-Za-z0-9_-]{1,64})\/icon$/
          .exec(url.pathname);

      if (iconMatch) {
        let image = null;
        try {
          image = await villageIcons.getImageByVillageId(iconMatch[1]);
        } catch (imgErr) {
          console.warn('[Village Icon] Skipped:', imgErr.message);
        }

        if (!image) {
          return reply(res, 404, {
            error: 'Village icon not found'
          });
        }

        res.writeHead(200, {
          'Content-Type': image.contentType,
          'Content-Length': image.bytes.length,
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff'
        });

        return res.end(image.bytes);
      }
      const avatarMatch =
        /^\/api\/v1\/members\/([A-Za-z0-9_-]{1,64})\/avatar$/
          .exec(url.pathname);

      if (avatarMatch) {
        let image = null;
        try {
          image = await memberAvatars.getImageByMemberId(avatarMatch[1]);
        } catch (imgErr) {
          console.warn('[Member Avatar] Skipped:', imgErr.message);
        }

        if (!image) {
          return reply(res, 404, {
            error: 'Member avatar not found'
          });
        }

        res.writeHead(200, {
          'Content-Type': image.contentType,
          'Content-Length': image.bytes.length,
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff'
        });

        return res.end(image.bytes);
      }
      return reply(res, 404, { error: 'Not found' });
    } catch (error) {
      console.error('========== API ERROR ==========');
      console.error('Name:', error.name);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('===============================');
      return reply(res, 502, { error: 'Unable to fetch Lark data; check server logs and access permissions' });
    }
  });

  const originalClose = server.close.bind(server);
  server.close = function (cb) {
    authStore.close();
    return originalClose(cb);
  };
  server.authStore = authStore;
  server.emailService = emailService;
  server.connectionService = connectionService;
  server.learningService = learningService;
  server.knowledgeService = knowledgeService;

  return server;
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isDirectRun) {
  const config = loadConfig();
  const lark = new LarkClient(config);
  const server = createAppServer(config, lark);
  server.listen(config.port, config.host, () => {
    console.log(`AXANH readonly API + local preview on http://${config.host}:${config.port}`);
  });
}
