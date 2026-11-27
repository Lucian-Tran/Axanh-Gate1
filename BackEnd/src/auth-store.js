import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function createAuthStore(options = {}) {
  const dbPath = options.dbPath || ':memory:';
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);
  const hmacSecret = options.hmacSecret || crypto.randomBytes(32).toString('hex');

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_requests (
      email TEXT PRIMARY KEY,
      hashed_otp TEXT NOT NULL,
      salt TEXT NOT NULL,
      member_id TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 5,
      resend_after INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      user_json TEXT NOT NULL,
      auth_type TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 1,
      window_expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booth_records (
      record_id TEXT PRIMARY KEY,
      booth_id TEXT,
      member_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      booth_type TEXT NOT NULL DEFAULT 'personal',
      village_id TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_booth_member ON booth_records(member_id);
  `);

  try { db.exec("ALTER TABLE booth_records ADD COLUMN booth_type TEXT NOT NULL DEFAULT 'personal';"); } catch {}
  try { db.exec("ALTER TABLE booth_records ADD COLUMN village_id TEXT;"); } catch {}

  function hashOtp(otp, salt) {
    return crypto.createHmac('sha256', hmacSecret).update(`${otp}:${salt}`).digest('hex');
  }

  function cleanExpired() {
    const now = Date.now();
    try {
      db.prepare('DELETE FROM otp_requests WHERE expires_at <= ?').run(now);
      db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
      db.prepare('DELETE FROM rate_limits WHERE window_expires_at <= ?').run(now);
    } catch {}
  }

  return {
    db,
    cleanExpired,

    checkRateLimit(key, maxRequests = 5, windowSeconds = 900) {
      cleanExpired();
      const now = Date.now();
      const existing = db.prepare('SELECT count, window_expires_at FROM rate_limits WHERE key = ?').get(key);
      if (!existing) {
        db.prepare('INSERT INTO rate_limits (key, count, window_expires_at) VALUES (?, 1, ?)')
          .run(key, now + windowSeconds * 1000);
        return { allowed: true, remaining: maxRequests - 1 };
      }
      if (existing.count >= maxRequests) {
        const waitSec = Math.max(1, Math.ceil((existing.window_expires_at - now) / 1000));
        return { allowed: false, waitSeconds: waitSec };
      }
      db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').run(key);
      return { allowed: true, remaining: maxRequests - (existing.count + 1) };
    },

    createOtp({ email, memberId, ttlMs = 5 * 60 * 1000, cooldownMs = 60 * 1000 }) {
      cleanExpired();
      const normEmail = email.trim().toLowerCase();
      const now = Date.now();

      // Check existing OTP request cooldown
      const existing = db.prepare('SELECT resend_after FROM otp_requests WHERE email = ?').get(normEmail);
      if (existing && existing.resend_after > now) {
        const waitSec = Math.max(1, Math.ceil((existing.resend_after - now) / 1000));
        return {
          allowed: false,
          waitSeconds: waitSec,
          error: `Vui lòng đợi ${waitSec} giây trước khi yêu cầu mã mới.`,
        };
      }

      // Generate 6-digit cryptographic OTP
      const otp = crypto.randomInt(100000, 1000000).toString();
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedOtp = hashOtp(otp, salt);
      const expiresAt = now + ttlMs;
      const resendAfter = now + cooldownMs;

      // Upsert
      db.prepare(`
        INSERT INTO otp_requests (email, hashed_otp, salt, member_id, attempts, max_attempts, resend_after, expires_at, created_at)
        VALUES (?, ?, ?, ?, 0, 5, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          hashed_otp = excluded.hashed_otp,
          salt = excluded.salt,
          member_id = excluded.member_id,
          attempts = 0,
          max_attempts = 5,
          resend_after = excluded.resend_after,
          expires_at = excluded.expires_at,
          created_at = excluded.created_at
      `).run(normEmail, hashedOtp, salt, memberId, resendAfter, expiresAt, now);

      return {
        allowed: true,
        otp,
        expiresAt,
        resendAfter,
      };
    },

    verifyOtp({ email, candidateOtp }) {
      cleanExpired();
      const normEmail = (email || '').trim().toLowerCase();
      const row = db.prepare(`
        SELECT email, hashed_otp, salt, member_id, attempts, max_attempts, expires_at
        FROM otp_requests
        WHERE email = ?
      `).get(normEmail);

      if (!row) {
        return { valid: false, error: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' };
      }

      const now = Date.now();
      if (now > row.expires_at) {
        db.prepare('DELETE FROM otp_requests WHERE email = ?').run(normEmail);
        return { valid: false, error: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.' };
      }

      if (row.attempts >= row.max_attempts) {
        db.prepare('DELETE FROM otp_requests WHERE email = ?').run(normEmail);
        return { valid: false, error: 'Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.' };
      }

      const testHash = hashOtp(candidateOtp, row.salt);
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(testHash, 'hex'),
        Buffer.from(row.hashed_otp, 'hex')
      );

      if (!isMatch) {
        const nextAttempts = row.attempts + 1;
        if (nextAttempts >= row.max_attempts) {
          db.prepare('DELETE FROM otp_requests WHERE email = ?').run(normEmail);
          return { valid: false, error: 'Bạn đã nhập sai quá 5 lần. Mã đã bị hủy.' };
        }
        db.prepare('UPDATE otp_requests SET attempts = ? WHERE email = ?').run(nextAttempts, normEmail);
        const remaining = row.max_attempts - nextAttempts;
        return {
          valid: false,
          error: `Mã xác thực không chính xác. Bạn còn ${remaining} lần thử.`,
          remainingAttempts: remaining,
        };
      }

      // Single-use: atomic delete immediately on success to prevent replay / concurrent race conditions
      db.prepare('DELETE FROM otp_requests WHERE email = ?').run(normEmail);

      return {
        valid: true,
        memberId: row.member_id,
      };
    },

    // Session management
    createSession({ token, user, authType = 'email-otp', maxAgeSeconds = 4 * 60 * 60 }) {
      cleanExpired();
      const now = Date.now();
      const expiresAt = now + maxAgeSeconds * 1000;
      const userJson = JSON.stringify(user);
      db.prepare(`
        INSERT INTO sessions (token, member_id, user_json, auth_type, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(token, user?.memberId || '', userJson, authType, expiresAt, now);

      return { token, expiresAt, user, authType };
    },

    getSession(token) {
      if (!token || typeof token !== 'string') return null;
      cleanExpired();
      const row = db.prepare('SELECT token, member_id, user_json, auth_type, expires_at FROM sessions WHERE token = ?').get(token);
      if (!row) return null;
      if (Date.now() >= row.expires_at) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
        return null;
      }
      try {
        const user = JSON.parse(row.user_json);
        return {
          token: row.token,
          user,
          authType: row.auth_type,
          expiresAt: row.expires_at,
        };
      } catch {
        return null;
      }
    },

    destroySession(token) {
      if (!token) return;
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    },

    getFormsConfig() {
      try {
        const row01 = db.prepare('SELECT value, updated_at FROM system_config WHERE key = ?').get('form01_url');
        const row02 = db.prepare('SELECT value, updated_at FROM system_config WHERE key = ?').get('form02_url');
        const updatedAt = Math.max(row01?.updated_at || 0, row02?.updated_at || 0);
        return {
          form01Url: row01?.value || '',
          form02Url: row02?.value || '',
          updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null,
        };
      } catch {
        return {
          form01Url: '',
          form02Url: '',
          updatedAt: null,
        };
      }
    },

    updateFormsConfig({ form01Url, form02Url }) {
      const now = Date.now();
      const insertOrUpdate = db.prepare(`
        INSERT INTO system_config (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `);

      if (form01Url !== undefined) {
        insertOrUpdate.run('form01_url', (form01Url || '').trim(), now);
      }
      if (form02Url !== undefined) {
        insertOrUpdate.run('form02_url', (form02Url || '').trim(), now);
      }
      return this.getFormsConfig();
    },

    registerBooth({ recordId, boothId = '', memberId, authorName = '', boothType = 'personal', villageId = '' }) {
      if (!recordId) return;
      const now = Date.now();
      db.prepare(`
        INSERT INTO booth_records (record_id, booth_id, member_id, author_name, booth_type, village_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(record_id) DO UPDATE SET
          booth_id = excluded.booth_id,
          member_id = excluded.member_id,
          author_name = excluded.author_name,
          booth_type = excluded.booth_type,
          village_id = excluded.village_id
      `).run(recordId, boothId, memberId, authorName, boothType, villageId, now);
    },

    isBoothOwner(recordId, memberId, authorName = '') {
      if (!recordId) return false;
      const row = db.prepare('SELECT member_id, author_name FROM booth_records WHERE record_id = ?').get(recordId);
      if (row) {
        if (memberId && row.member_id === memberId) return true;
        if (authorName && row.author_name.toLowerCase() === authorName.toLowerCase()) return true;
        return false;
      }
      return false;
    },

    getMemberBooths(memberId) {
      if (!memberId) return [];
      return db.prepare('SELECT record_id, booth_id, member_id, author_name, booth_type, village_id, created_at FROM booth_records WHERE member_id = ? ORDER BY created_at DESC').all(memberId);
    },

    getBoothOwnership(recordId) {
      if (!recordId) return null;
      return db.prepare('SELECT record_id, booth_id, member_id, author_name, booth_type, village_id, created_at FROM booth_records WHERE record_id = ?').get(recordId);
    },

    unregisterBooth(recordId) {
      if (!recordId) return;
      db.prepare('DELETE FROM booth_records WHERE record_id = ?').run(recordId);
    },

    close() {
      try {
        db.close();
      } catch {}
    },
  };
}

