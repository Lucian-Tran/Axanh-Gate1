import { isIP } from 'node:net';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const envDir = path.dirname(fileURLToPath(import.meta.url));
const envPaths = [
  path.resolve(envDir, '../.env'),
  '.env',
  'BackEnd/.env',
];

if (typeof process.loadEnvFile === 'function') {
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      try {
        process.loadEnvFile(envPath);
        break;
      } catch {}
    }
  }
}

export function loadConfig(env = process.env) {
  const required = [
    'LARK_APP_ID', 'LARK_APP_SECRET', 'LARK_BASE_APP_TOKEN',
    'LARK_TABLE_VILLAGES', 'LARK_TABLE_MEMBERS', 'INTERNAL_TEST_KEY',
  ];
  const missing = required.filter((name) => !env[name] || /REPLACE_ME|REPLACE_WITH/.test(env[name]));
  if (missing.length) {
    throw new Error(`Missing configuration: ${missing.join(', ')}. Update your .env file.`);
  }
  if (env.INTERNAL_TEST_KEY.length < 32) {
    throw new Error('INTERNAL_TEST_KEY must contain at least 32 characters.');
  }
  const port = Number(env.PORT ?? 3100);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const ttl = Number(env.CACHE_TTL_SECONDS ?? 60);
  if (!Number.isInteger(ttl) || ttl < 0 || ttl > 3600) throw new Error('Invalid CACHE_TTL_SECONDS');
  // Booth cache TTL riêng – mặc định 0 (không cache) để phản ánh ngay khi chỉnh sửa trong Lark Base
  const boothTtl = Number(env.BOOTH_CACHE_TTL_SECONDS ?? 0);
  if (!Number.isInteger(boothTtl) || boothTtl < 0 || boothTtl > 3600) throw new Error('Invalid BOOTH_CACHE_TTL_SECONDS');
  const isProduction = env.NODE_ENV === 'production';
  const host = env.HOST ?? '127.0.0.1';

  const loopbackHosts = ['127.0.0.1', '::1', 'localhost'];
  const privateDockerBind =
    isProduction &&
    env.AXANH_DOCKER_PRIVATE === 'true' &&
    host === '0.0.0.0';

  if (!loopbackHosts.includes(host) && !privateDockerBind) {
    throw new Error('HOST is not permitted for this environment.');
  }

  const trustedProxyIp =
    String(env.AXANH_TRUSTED_PROXY_IP || '').trim();

  if (
    isProduction &&
    (isIP(trustedProxyIp) !== 4 ||
      trustedProxyIp === '0.0.0.0')
  ) {
    throw new Error(
      'Production requires a valid AXANH_TRUSTED_PROXY_IP.'
    );
  }

  const cookieSecure =
    isProduction || env.COOKIE_SECURE === 'true';

  const frontendUrl = env.FRONTEND_URL ||
    (isProduction ? '' : 'http://192.168.1.60:5173');

  let frontend;
  try {
    frontend = new URL(frontendUrl);
  } catch {
    throw new Error('Invalid FRONTEND_URL.');
  }

  const larkRedirectUri = env.LARK_SSO_REDIRECT_URI ||
    new URL('/auth/lark/callback', frontend).toString();

  if (isProduction) {
    let callback;
    try {
      callback = new URL(larkRedirectUri);
    } catch {
      throw new Error('Invalid LARK_SSO_REDIRECT_URI.');
    }

    if (
      frontend.protocol !== 'https:' ||
      frontend.username ||
      frontend.password ||
      frontend.port ||
      frontend.pathname !== '/' ||
      frontend.search ||
      frontend.hash
    ) {
      throw new Error('Production FRONTEND_URL must be an HTTPS origin.');
    }

    if (
      callback.protocol !== 'https:' ||
      callback.origin !== frontend.origin ||
      callback.pathname !== '/auth/lark/callback' ||
      callback.username ||
      callback.password ||
      callback.search ||
      callback.hash
    ) {
      throw new Error('Production Lark callback must match FRONTEND_URL.');
    }
  }

  const hasRealSmtpPassword = env.SMTP_PASSWORD && !/DIEN_MAT_KHAU|REPLACE_/.test(env.SMTP_PASSWORD);
  const emailProvider = (env.EMAIL_PROVIDER === 'smtp' && hasRealSmtpPassword)
    ? 'smtp'
    : (env.EMAIL_PROVIDER === 'mock' || !hasRealSmtpPassword ? 'mock' : 'smtp');
  const smtpPort = Number(env.SMTP_PORT ?? 587);

  const rawAdminEmails = env.ADMIN_EMAILS || 'lucian.20082004@gmail.com,lucian.tran@axanh.com';
  const adminEmails = new Set(
    rawAdminEmails.split(',').map((em) => em.trim().toLowerCase()).filter(Boolean)
  );

  const rawAdminIds = env.ADMIN_MEMBER_IDS || '';
  const adminMemberIds = new Set(
    rawAdminIds.split(',').map((id) => id.trim().toUpperCase()).filter(Boolean)
  );

  const rawMatchingAdminIds = env.MATCHING_ADMIN_MEMBER_IDS || '';
  const matchingAdminMemberIds = new Set(
    rawMatchingAdminIds.split(',').map((id) => id.trim().toUpperCase()).filter(Boolean)
  );

  return {
    appId: env.LARK_APP_ID,
    appSecret: env.LARK_APP_SECRET,
    appToken: env.LARK_BASE_APP_TOKEN,
    villageTableId: env.LARK_TABLE_VILLAGES,
    memberTableId: env.LARK_TABLE_MEMBERS,
    gate1TableId: env.LARK_TABLE_GATE1 || 'tblAhZ3kFMakyRTw',
    boothTableId: env.LARK_TABLE_BOOTH_REGISTRATIONS || 'tblL1JPThzUzYyAg',
    resultTableId: env.LARK_TABLE_LEARNING_RESULTS || 'tbl68qfU3c1p2w2p',
    connectionTableId: env.LARK_TABLE_CONNECTIONS || 'tblmwXu8WsyXCmPl',
    learningSessionTableId: env.LARK_TABLE_LEARNING_SESSIONS || 'tblR0aHzPLK1IXm3',
    testKey: env.INTERNAL_TEST_KEY,
    host,
    port,
    cacheTtlMs: ttl * 1000,
    boothCacheTtlMs: boothTtl * 1000,
    cookieSecure,
    trustedProxyIp,
    frontendUrl,
    larkRedirectUri,
    adminMemberIds,
    matchingAdminMemberIds,
    adminEmails,
    email: {
      provider: emailProvider,
      smtpHost: env.SMTP_HOST || null,
      smtpPort: Number.isInteger(smtpPort) && smtpPort > 0 ? smtpPort : 587,
      smtpSecure: env.SMTP_SECURE === 'true',
      smtpUser: env.SMTP_USER || null,
      smtpPassword: env.SMTP_PASSWORD || null,
      smtpFrom: env.SMTP_FROM || 'AXANH Gate1 <noreply@axanh.com>',
    },
    authDbPath: env.AUTH_DB_PATH || null,
  };
}
