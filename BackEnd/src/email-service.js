import net from 'node:net';
import tls from 'node:tls';

export function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) return '***@***';
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (local.length <= 2) {
    return `${local[0] || '*'}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function buildOtpEmailHtml({ otp, memberName, ttlMinutes = 5 }) {
  const safeName = memberName ? String(memberName).replace(/[&<>"']/g, '') : 'Thành viên AXANH';
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mã xác thực đăng nhập AXANH Gate1</title>
</head>
<body style="margin:0;padding:24px 12px;background:#061328;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#eff5ff;">
  <div style="max-width:480px;margin:0 auto;background:#0d2444;border-radius:18px;border:1px solid rgba(255,255,255,0.12);padding:32px 28px;box-shadow:0 12px 40px rgba(0,0,0,0.5);">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:4px 14px;background:rgba(242,198,87,0.15);border:1px solid rgba(242,198,87,0.35);color:#f2c657;font-size:11px;font-weight:700;border-radius:20px;letter-spacing:1px;">
        ATED PRO 2026 · AXANH GATE 1
      </div>
      <h1 style="margin:14px 0 6px;font-size:22px;color:#ffffff;font-weight:800;">Phiên Chợ Tri Thức</h1>
      <p style="margin:0;font-size:13px;color:#8aaece;">Mã xác thực một lần (OTP) để đăng nhập hệ thống</p>
    </div>

    <p style="font-size:14px;color:#c0d4ee;line-height:1.6;margin-bottom:20px;">
      Xin chào <strong>${safeName}</strong>,<br>
      Bạn đang thực hiện đăng nhập vào hệ thống <strong>AXANH Gate1</strong>. Vui lòng nhập mã xác thực bên dưới để hoàn tất:
    </p>

    <div style="text-align:center;margin:28px 0;padding:20px;background:#061a35;border-radius:14px;border:1px solid rgba(0,214,185,0.3);">
      <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#00d6b9;font-family:Consolas,monaco,monospace;">
        ${otp}
      </div>
      <div style="margin-top:10px;font-size:12px;color:#8aaece;">
        Mã có hiệu lực trong vòng <strong>${ttlMinutes} phút</strong>
      </div>
    </div>

    <div style="padding:14px;background:rgba(239,182,43,0.08);border-left:3px solid #efb62b;border-radius:6px;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#f2c657;line-height:1.5;">
        <strong>Bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Ban tổ chức không bao giờ yêu cầu bạn cung cấp mã xác thực.
      </p>
    </div>

    <p style="font-size:12px;color:#6b8aa8;line-height:1.5;margin:0;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
      Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email hoặc thông báo cho Quản trị viên hệ thống AXANH.
    </p>
  </div>
</body>
</html>`;
}

export function buildOtpEmailText({ otp, memberName, ttlMinutes = 5 }) {
  const safeName = memberName || 'Thành viên AXANH';
  return `AXANH Gate1 - Phiên Chợ Tri Thức
Xin chào ${safeName},

Mã xác thực một lần (OTP) của bạn là: ${otp}
Mã có hiệu lực trong vòng ${ttlMinutes} phút.

Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
Nếu bạn không yêu cầu đăng nhập, vui lòng bỏ qua email này.`;
}

// Simple built-in SMTP sender for zero-dependency operation
async function sendRawSmtp({ config, to, subject, html, text }) {
  const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword, smtpFrom } = config;
  if (!smtpHost) {
    throw new Error('SMTP host is not configured.');
  }

  // Port 587 requires STARTTLS, which is not implemented here.
  // Fail closed instead of authenticating over plaintext TCP.
  if (smtpSecure !== true || Number(smtpPort) !== 465) {
    throw new Error(
      'SMTP requires implicit TLS on port 465. Plaintext SMTP disabled.'
    );
  }

  if (!smtpUser || !smtpPassword) {
    throw new Error('SMTP credentials are not configured.');
  }

  const fromEmailMatch = String(smtpFrom).match(/<([^>]+)>/);
  const fromEmail = fromEmailMatch ? fromEmailMatch[1].trim() : String(smtpFrom).trim();
  const cleanPassword = String(smtpPassword || '').replace(/\s+/g, '');

  return new Promise((resolve, reject) => {
    let socket;
    let state = 'BANNER';
    let buffer = '';

    const cleanup = () => {
      if (socket && !socket.destroyed) socket.destroy();
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('SMTP connection timed out after 20s.'));
    }, 20000);

    const tlsOptions = {
      host: smtpHost,
      port: smtpPort,
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
      ...(net.isIP(smtpHost) ? {} : { servername: smtpHost }),
    };

    socket = tls.connect(tlsOptions, () => {
      if (!socket.authorized) {
        clearTimeout(timeout);
        cleanup();
        reject(new Error('SMTP TLS certificate verification failed.'));
      }
    });

    const sendCmd = (cmd) => {
      socket.write(`${cmd}\r\n`);
    };

    socket.on('error', (err) => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error(`SMTP Socket Error: ${err.message}`));
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\r\n');
      buffer = lines.pop(); // keep last incomplete chunk

      for (const line of lines) {
        if (!line) continue;
        const code = Number(line.slice(0, 3));
        const isLastLine = line.charAt(3) === ' ';
        if (!isLastLine) continue; // skip multiline continuation replies (e.g. 250-)

        if (code >= 400) {
          clearTimeout(timeout);
          cleanup();
          return reject(new Error(`SMTP Error (${code}): ${line}`));
        }

        switch (state) {
          case 'BANNER': // Received 220 banner
            state = 'EHLO';
            sendCmd('EHLO localhost');
            break;

          case 'EHLO': // Received 250 EHLO response
            if (smtpUser && cleanPassword) {
              state = 'AUTH_USER';
              sendCmd('AUTH LOGIN');
            } else {
              state = 'MAIL_FROM';
              sendCmd(`MAIL FROM:<${fromEmail}>`);
            }
            break;

          case 'AUTH_USER': // Received 334 Username challenge
            state = 'AUTH_PASS';
            sendCmd(Buffer.from(smtpUser.trim()).toString('base64'));
            break;

          case 'AUTH_PASS': // Received 334 Password challenge
            state = 'AUTH_OK';
            sendCmd(Buffer.from(cleanPassword).toString('base64'));
            break;

          case 'AUTH_OK': // Received 235 Authentication successful
            state = 'MAIL_FROM';
            sendCmd(`MAIL FROM:<${fromEmail}>`);
            break;

          case 'MAIL_FROM': // Received 250 Sender OK
            state = 'RCPT_TO';
            sendCmd(`RCPT TO:<${to.trim()}>`);
            break;

          case 'RCPT_TO': // Received 250 Recipient OK
            state = 'DATA';
            sendCmd('DATA');
            break;

          case 'DATA': // Received 354 Start mail input
            state = 'CONTENT';
            const boundary = `----=_Part_${Date.now()}`;
            // Encode subject as UTF-8 Base64 per RFC 2047 for proper Unicode display
            const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
            const msg = [
              `From: ${smtpFrom}`,
              `To: ${to}`,
              `Subject: ${encodedSubject}`,
              'MIME-Version: 1.0',
              `Content-Type: multipart/alternative; boundary="${boundary}"`,
              '',
              `--${boundary}`,
              'Content-Type: text/plain; charset=utf-8',
              'Content-Transfer-Encoding: 8bit',
              '',
              text,
              '',
              `--${boundary}`,
              'Content-Type: text/html; charset=utf-8',
              'Content-Transfer-Encoding: 8bit',
              '',
              html,
              '',
              `--${boundary}--`,
              '.',
            ].join('\r\n');
            sendCmd(msg);
            break;

          case 'CONTENT': // Received 250 Message accepted for delivery
            state = 'QUIT';
            sendCmd('QUIT');
            clearTimeout(timeout);
            cleanup();
            return resolve({ success: true, provider: 'smtp' });
        }
      }
    });
  });
}

export function createEmailService(config = {}) {
  const provider = config.email?.provider || (config.email?.smtpHost ? 'smtp' : 'mock');

  if (process.env.NODE_ENV === 'production' && provider !== 'smtp') {
    throw new Error(
      'Production requires SMTP provider. Mock OTP is disabled.'
    );
  }
  const sentMessages = [];

  return {
    provider,
    getSentMessages() {
      return [...sentMessages];
    },
    clearSentMessages() {
      sentMessages.length = 0;
    },
    async sendOtp({ to, otp, memberName, ttlMinutes = 5 }) {
      if (!to || typeof to !== 'string') {
        throw new Error('Missing recipient email.');
      }
      if (!otp || typeof otp !== 'string') {
        throw new Error('Missing OTP code.');
      }

      const subject = `[AXANH Gate1] Mã xác thực đăng nhập: ${otp}`;
      const html = buildOtpEmailHtml({ otp, memberName, ttlMinutes });
      const text = buildOtpEmailText({ otp, memberName, ttlMinutes });

      if (provider === 'mock') {
        const record = {
          id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          to,
          subject,
          otp,
          memberName,
          ttlMinutes,
          sentAt: new Date().toISOString(),
        };
        sentMessages.push(record);
        console.log(`[EmailService:Mock] Đã mô phỏng gửi OTP đến: ${to}`);
        console.log(`👉 [DEV MOCK OTP]: Mã xác thực của bạn là: ${otp} (Dùng mã này nhập vào web để test)`);
        console.log(`💡 Lưu ý: Để nhận email thật về hộp thư, vui lòng cấu hình SMTP trong BackEnd/.env`);
        return { success: true, provider: 'mock', messageId: record.id };
      }

      if (provider === 'smtp') {
        try {
          await sendRawSmtp({
            config: config.email,
            to,
            subject,
            html,
            text,
          });
          console.log(`[EmailService:SMTP] OTP email sent successfully to ${maskEmail(to)}`);
          return { success: true, provider: 'smtp' };
        } catch (err) {
          console.error(`[EmailService:SMTP] Failed to send email to ${maskEmail(to)}:`, err.message);
          throw new Error('Không thể gửi email OTP qua máy chủ SMTP.');
        }
      }

      throw new Error(`Unsupported email provider: ${provider}`);
    },
  };
}

