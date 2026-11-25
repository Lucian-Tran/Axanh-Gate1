import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createAppServer } from '../src/server.js';

function createMockLark(seed = {}) {
  let seq = 100;
  const tables = {
    villages: seed.villages || [
      {
        record_id: 'recVilA',
        fields: {
          Village_ID: 'VIL-0001',
          Village_Name: '🌬️ Làng Gió',
          Office: 'VP1',
          Status: 'Active',
          Leader: [{ id: 'ou_leader_a', name: 'Alice Leader' }],
        },
      },
      {
        record_id: 'recVilB',
        fields: {
          Village_ID: 'VIL-0009',
          Village_Name: '🔥 Làng Lửa',
          Office: 'VP2',
          Status: 'Active',
          Leader: [{ id: 'ou_leader_b', name: 'Harold Le' }],
        },
      },
      {
        record_id: 'recVilC',
        fields: {
          Village_ID: 'VIL-0002',
          Village_Name: '🍃 Làng Lá',
          Office: 'VPC',
          Status: 'Active',
          Leader: [{ id: 'ou_leader_c', name: 'Charlie Leader' }],
        },
      },
    ],
    members: seed.members || [
      {
        record_id: 'recMemA',
        fields: {
          Member_ID: 'MEM-0001',
          Display_Name: 'Alice Leader',
          Lark_User: [{ id: 'ou_leader_a', name: 'Alice Leader' }],
          Village: [{ record_id: 'recVilA', text: '🌬️ Làng Gió' }],
          Office: 'VP1',
          Program_Role: 'Trưởng làng',
          'Active✅': true,
          Login_Email: 'alice@axanh.com',
        },
      },
      {
        record_id: 'recMemA2',
        fields: {
          Member_ID: 'MEM-0002',
          Display_Name: 'Bob MemberA',
          Lark_User: [{ id: 'ou_mem_a2', name: 'Bob MemberA' }],
          Village: [{ record_id: 'recVilA', text: '🌬️ Làng Gió' }],
          Office: 'VP1',
          Program_Role: 'Thành viên',
          'Active✅': true,
          Login_Email: 'bob@axanh.com',
        },
      },
      {
        record_id: 'recMemB',
        fields: {
          Member_ID: 'MEM-0015',
          Display_Name: 'Harold Le',
          Lark_User: [{ id: 'ou_leader_b', name: 'Harold Le' }],
          Village: [{ record_id: 'recVilB', text: '🔥 Làng Lửa' }],
          Office: 'VP2',
          Program_Role: 'Trưởng làng',
          'Active✅': true,
          Login_Email: 'harold@axanh.com',
        },
      },
      {
        record_id: 'recMemB2',
        fields: {
          Member_ID: 'MEM-0029',
          Display_Name: 'Viktor Nguyen',
          Lark_User: [{ id: 'ou_mem_b2', name: 'Viktor Nguyen' }],
          Village: [{ record_id: 'recVilB', text: '🔥 Làng Lửa' }],
          Office: 'VP2',
          Program_Role: 'Thành viên',
          'Active✅': true,
          Login_Email: 'viktor@axanh.com',
        },
      },
      {
        record_id: 'recMemC',
        fields: {
          Member_ID: 'MEM-0099',
          Display_Name: 'Charlie Outsider',
          Lark_User: [{ id: 'ou_leader_c', name: 'Charlie Leader' }],
          Village: [{ record_id: 'recVilC', text: '🍃 Làng Lá' }],
          Office: 'VPC',
          Program_Role: 'Trưởng làng',
          'Active✅': true,
          Login_Email: 'charlie@axanh.com',
        },
      },
      {
        record_id: 'recAdmin',
        fields: {
          Member_ID: 'MEM-0082',
          Display_Name: 'Lucian Admin',
          Lark_User: [{ id: 'ou_admin', name: 'Lucian Admin' }],
          Village: [{ record_id: 'recVilC', text: '🍃 Làng Lá' }],
          Office: 'VPC',
          Program_Role: 'Admin',
          'Active✅': true,
          Login_Email: 'lucian.tran@axanh.com',
        },
      },
    ],
    booths: seed.booths || [
      {
        record_id: 'recBoothA',
        fields: {
          Booth_ID: 'KN-0001',
          Booth_Type: 'Cá nhân',
          'Tên của bạn': 'Alice Leader',
          'Bạn thuộc Làng nào?': '🌬️ Làng Gió',
          'Điều bạn có thể chia sẻ': 'QA/QC Review',
          'Chủ đề chia sẻ': 'QA/QC',
          'Điều em muốn học': 'AI Automation',
          'Chủ đề bạn muốn học': 'AI',
          'Bạn đồng ý cho hiển thị thông tin về kỹ năng và nhu cầu trong phạm vi bản demo nội bộ này.': true,
        },
      },
      {
        record_id: 'recBoothB2',
        fields: {
          Booth_ID: 'KN-0002',
          Booth_Type: 'Cá nhân',
          'Tên của bạn': 'Viktor Nguyen',
          'Bạn thuộc Làng nào?': '🔥 Làng Lửa',
          'Điều bạn có thể chia sẻ': 'AI Automation',
          'Chủ đề chia sẻ': 'AI',
          'Điều em muốn học': 'QA/QC Review',
          'Chủ đề bạn muốn học': 'QA/QC',
          'Bạn đồng ý cho hiển thị thông tin về kỹ năng và nhu cầu trong phạm vi bản demo nội bộ này.': true,
        },
      },
      {
        record_id: 'recBoothC',
        fields: {
          Booth_ID: 'KN-0003',
          Booth_Type: 'Cá nhân',
          'Tên của bạn': 'Charlie Outsider',
          'Bạn thuộc Làng nào?': '🍃 Làng Lá',
          'Điều bạn có thể chia sẻ': 'Civil 3D',
          'Chủ đề chia sẻ': 'Civil 3D',
          'Điều em muốn học': 'SOP',
          'Chủ đề bạn muốn học': 'SOP',
          'Bạn đồng ý cho hiển thị thông tin về kỹ năng và nhu cầu trong phạm vi bản demo nội bộ này.': true,
        },
      },
      {
        record_id: 'recVilBoothA',
        fields: {
          Booth_ID: 'KN-0101',
          Booth_Type: 'Làng',
          'Tên của bạn': 'Bob MemberA',
          'Bạn thuộc Làng nào?': '🌬️ Làng Gió',
          'Điều bạn có thể chia sẻ': 'Checklist Gió',
          'Chủ đề chia sẻ': 'QA/QC',
          'Điều em muốn học': 'AI Lửa',
          'Chủ đề bạn muốn học': 'AI',
          'Bạn đồng ý cho hiển thị thông tin về kỹ năng và nhu cầu trong phạm vi bản demo nội bộ này.': true,
        },
      },
      {
        record_id: 'recVilBoothB',
        fields: {
          Booth_ID: 'KN-0102',
          Booth_Type: 'Làng',
          'Tên của bạn': 'Harold Le',
          'Bạn thuộc Làng nào?': '🔥 Làng Lửa',
          'Điều bạn có thể chia sẻ': 'AI Lửa',
          'Chủ đề chia sẻ': 'AI',
          'Điều em muốn học': 'Checklist Gió',
          'Chủ đề bạn muốn học': 'QA/QC',
          'Bạn đồng ý cho hiển thị thông tin về kỹ năng và nhu cầu trong phạm vi bản demo nội bộ này.': true,
        },
      },
    ],
    connections: seed.connections || [],
    sessions: seed.sessions || [],
    results: seed.results || [],
  };

  const fieldsByTable = {
    tblConnections: [
      { field_name: 'Connection_Status', type: 3, property: { options: [{ name: 'Pending' }, { name: 'Accepted' }, { name: 'Rejected' }, { name: 'Cancelled' }] } },
      { field_name: 'Connection_Type', type: 3, property: { options: [{ name: 'Cá nhân' }, { name: 'Làng' }] } },
      { field_name: 'Source_Booth', type: 18, property: { table_id: 'tblBooths' } },
      { field_name: 'Target_Booth', type: 18, property: { table_id: 'tblBooths' } },
      { field_name: 'Requested_By', type: 1 },
      { field_name: 'Target_Member_ID', type: 1 },
      { field_name: 'Target_Village_ID', type: 1 },
      { field_name: 'Approver_Member_ID', type: 1 },
    ],
    tblSessions: [
      { field_name: 'Connection', type: 18, property: { table_id: 'tblConnections' } },
      { field_name: 'Learning_Title', type: 1 },
      { field_name: 'Start_At', type: 5 },
      { field_name: 'End_At', type: 5 },
      { field_name: 'Learning_Format', type: 3, property: { options: [{ name: 'Online' }, { name: 'Trực tiếp' }] } },
      { field_name: 'Location_Or_Link', type: 1 },
      { field_name: 'Scheduled_By', type: 1 },
      { field_name: 'Confirmed_By', type: 1 },
      { field_name: 'Other_Participant_ID', type: 1 },
      { field_name: 'Session_Status', type: 3, property: { options: [{ name: 'Proposed' }, { name: 'Confirmed' }, { name: 'Completed' }, { name: 'Cancelled' }] } },
      { field_name: 'Created_At', type: 5 },
      { field_name: 'Confirmed_At', type: 5 },
    ],
    tblResults: [
      { field_name: 'Tên của bạn', type: 3, property: { options: [{ name: 'Alice Leader' }, { name: 'Viktor Nguyen' }, { name: 'Harold Le' }] } },
      { field_name: '👤 Người điền', type: 11 },
      { field_name: 'Submitted_By', type: 11 },
      { field_name: 'Điều em đã học được', type: 1 },
      { field_name: 'Đã thử áp dụng?', type: 3, property: { options: [{ name: 'Đã áp dụng' }, { name: 'Sẽ thử' }] } },
      { field_name: 'Mức độ hữu ích', type: 2 },
      { field_name: 'Tài sản tri thức có thể chia sẻ lại', type: 1 },
      { field_name: 'Đồng ý chia sẻ bài học này ở chế độ nội bộ khi tổ chức có cơ chế phê duyệt.', type: 7 },
      { field_name: 'Kết quả sau khi áp dụng', type: 1 },
      { field_name: 'Link / minh chứng', type: 15 },
      { field_name: 'Ngày tạo', type: 5 },
      { field_name: 'Learning_Session', type: 18, property: { table_id: 'tblSessions' } },
    ],
  };

  function getBucket(tableId) {
    if (tableId === 'tblVillages') return tables.villages;
    if (tableId === 'tblMembers') return tables.members;
    if (tableId === 'tblBooths') return tables.booths;
    if (tableId === 'tblConnections') return tables.connections;
    if (tableId === 'tblSessions') return tables.sessions;
    if (tableId === 'tblResults') return tables.results;
    return [];
  }

  let createCalls = 0;
  let updateCalls = 0;

  return {
    tables,
    get createCalls() { return createCalls; },
    get updateCalls() { return updateCalls; },
    async listFields(tableId) {
      return fieldsByTable[tableId] || [];
    },
    async searchAll(tableId) {
      return getBucket(tableId).map((r) => structuredClone(r));
    },
    async createRecord(tableId, fields) {
      createCalls += 1;
      await new Promise((r) => setTimeout(r, 10));
      seq += 1;
      const rec = {
        record_id: `recGen${seq}`,
        fields: {
          ...structuredClone(fields),
          ...(tableId === 'tblConnections' ? { Connection_ID: `CONN-${seq}` } : {}),
          ...(tableId === 'tblSessions' ? { Session_ID: `SESS-${seq}` } : {}),
        },
      };
      getBucket(tableId).push(rec);
      return structuredClone(rec);
    },
    async updateRecord(tableId, recordId, fields) {
      updateCalls += 1;
      await new Promise((r) => setTimeout(r, 10));
      const bucket = getBucket(tableId);
      const target = bucket.find((r) => r.record_id === recordId);
      if (!target) throw new Error(`Record ${recordId} not found`);
      target.fields = { ...target.fields, ...structuredClone(fields) };
      return structuredClone(target);
    },
    async getRecord(tableId, recordId) {
      const target = getBucket(tableId).find((r) => r.record_id === recordId);
      return target ? { record: structuredClone(target), fields: structuredClone(target.fields) } : {};
    },
  };
}

function makeConfig(port = 0) {
  return {
    appId: 'cli_test',
    appSecret: 'secret_test',
    appToken: 'app_test',
    villageTableId: 'tblVillages',
    memberTableId: 'tblMembers',
    boothTableId: 'tblBooths',
    connectionTableId: 'tblConnections',
    learningSessionTableId: 'tblSessions',
    resultTableId: 'tblResults',
    gate1TableId: 'tblGate1',
    testKey: 'test-key-must-be-at-least-32-chars-long-ok',
    host: '127.0.0.1',
    port,
    cacheTtlMs: 60000,
    boothCacheTtlMs: 0,
    cookieSecure: false,
    trustedProxyIp: '',
    frontendUrl: 'http://127.0.0.1:5173',
    larkRedirectUri: 'http://127.0.0.1:5173/auth/lark/callback',
    adminMemberIds: new Set(['MEM-0082']),
    matchingAdminMemberIds: new Set(['MEM-0082']),
    adminEmails: new Set(['lucian.tran@axanh.com']),
    email: { provider: 'mock', smtpHost: null, smtpPort: 587, smtpSecure: false, smtpUser: null, smtpPassword: null, smtpFrom: 'test@axanh.com' },
    authDbPath: ':memory:',
  };
}

function createUserCookie(server, member) {
  const token = crypto.randomBytes(32).toString('hex');
  server.authStore.createSession({
    token,
    user: {
      memberId: member.memberId,
      name: member.name,
      villageId: member.villageId,
      villageName: member.villageName,
      office: member.office,
      role: member.role || 'member',
      email: member.email,
    },
    authType: 'email-otp',
    maxAgeSeconds: 3600,
  });
  return `axanh_dev_session=${token}`;
}

async function httpReq(server, path, { method = 'GET', cookie = '', body = null, headers = {}, origin = 'http://127.0.0.1:5173' } = {}) {
  const addr = server.address();
  const res = await fetch(`http://127.0.0.1:${addr.port}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(method === 'POST' ? { Origin: origin, 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

test('Direct Connection & Cancel Lifecycle: Personal, Concurrency, Reconnect, Legacy Pending, Learning & Security', async () => {
  const lark = createMockLark({
    connections: [
      {
        record_id: 'recLegacyPend1',
        fields: {
          Connection_ID: 'CONN-OLD-PEND',
          Connection_Type: 'Cá nhân',
          Source_Booth: ['recBoothC'],
          Target_Booth: ['recBoothA'],
          Requested_By: 'MEM-0099',
          Target_Member_ID: 'MEM-0001',
          Approver_Member_ID: 'MEM-0001',
          Connection_Status: 'Pending',
          Created_At: Date.now() - 100000,
        },
      },
      {
        record_id: 'recLegacyRej1',
        fields: {
          Connection_ID: 'CONN-OLD-REJ',
          Connection_Type: 'Cá nhân',
          Source_Booth: ['recBoothA'],
          Target_Booth: ['recBoothB2'],
          Requested_By: 'MEM-0001',
          Target_Member_ID: 'MEM-0029',
          Approver_Member_ID: 'MEM-0029',
          Connection_Status: 'Rejected',
          Created_At: Date.now() - 200000,
        },
      },
    ],
  });

  const cfg = makeConfig();
  const server = createAppServer(cfg, lark);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  cfg.port = server.address().port;

  try {
    const aliceCookie = createUserCookie(server, { memberId: 'MEM-0001', name: 'Alice Leader', villageId: 'VIL-0001', villageName: '🌬️ Làng Gió', email: 'alice@axanh.com' });
    const bobCookie = createUserCookie(server, { memberId: 'MEM-0002', name: 'Bob MemberA', villageId: 'VIL-0001', villageName: '🌬️ Làng Gió', email: 'bob@axanh.com' });
    const haroldCookie = createUserCookie(server, { memberId: 'MEM-0015', name: 'Harold Le', villageId: 'VIL-0009', villageName: '🔥 Làng Lửa', email: 'harold@axanh.com' });
    const viktorCookie = createUserCookie(server, { memberId: 'MEM-0029', name: 'Viktor Nguyen', villageId: 'VIL-0009', villageName: '🔥 Làng Lửa', email: 'viktor@axanh.com' });
    const charlieCookie = createUserCookie(server, { memberId: 'MEM-0099', name: 'Charlie Outsider', villageId: 'VIL-0002', villageName: '🍃 Làng Lá', email: 'charlie@axanh.com' });
    const adminCookie = createUserCookie(server, { memberId: 'MEM-0082', name: 'Lucian Admin', villageId: 'VIL-0002', villageName: '🍃 Làng Lá', role: 'admin', email: 'lucian.tran@axanh.com' });

    // 1. Unauthenticated request -> 401
    const unauth = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      body: { sourceBoothId: 'KN-0001', targetBoothId: 'KN-0002', connectionType: 'personal' },
    });
    assert.equal(unauth.status, 401);

    // 2. Origin validation -> 403
    const badOrigin = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: aliceCookie,
      origin: 'https://evil.example.com',
      body: { sourceBoothId: 'KN-0001', targetBoothId: 'KN-0002', connectionType: 'personal' },
    });
    assert.equal(badOrigin.status, 403);

    // 3. Self-connect personal -> 400
    const selfPers = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: aliceCookie,
      body: { sourceBoothId: 'KN-0001', targetBoothId: 'KN-0001', connectionType: 'personal' },
    });
    assert.equal(selfPers.status, 400);

    // 4. Impersonation: Bob cannot connect using Alice's personal booth -> 403
    const impersonate = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: bobCookie,
      body: { sourceBoothId: 'KN-0001', targetBoothId: 'KN-0002', connectionType: 'personal' },
    });
    assert.equal(impersonate.status, 403);

    // 5. Non-existent booth -> 404
    const notFound = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: aliceCookie,
      body: { sourceBoothId: 'KN-0001', targetBoothId: 'KN-9999', connectionType: 'personal' },
    });
    assert.equal(notFound.status, 404);

    // 6. Concurrent A->B & B->A personal connect -> ONLY ONE Accepted record created, legacy Rejected preserved!
    const [r1, r2] = await Promise.all([
      httpReq(server, '/api/v1/connections', {
        method: 'POST',
        cookie: aliceCookie,
        body: { sourceBoothId: 'KN-0001', targetBoothId: 'KN-0002', connectionType: 'personal', idempotencyKey: 'k-alice-1' },
      }),
      httpReq(server, '/api/v1/connections', {
        method: 'POST',
        cookie: viktorCookie,
        body: { sourceBoothId: 'KN-0002', targetBoothId: 'KN-0001', connectionType: 'personal', idempotencyKey: 'k-viktor-1' },
      }),
    ]);
    assert.equal([r1.status, r2.status].filter((s) => s === 201).length, 1);
    assert.equal([r1.status, r2.status].filter((s) => s === 409).length, 1);
    const createdRec = r1.status === 201 ? r1.json.data : r2.json.data;
    assert.equal(createdRec.status, 'Accepted');
    assert.ok(lark.tables.connections.some((r) => r.record_id === 'recLegacyRej1' && r.fields.Connection_Status === 'Rejected'));

    // 7. Idempotent retry after timeout (same idempotencyKey) -> returns 200 deduplicated, zero extra records
    const beforeCount = lark.tables.connections.length;
    const retryRes = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: r1.status === 201 ? aliceCookie : viktorCookie,
      body: {
        sourceBoothId: r1.status === 201 ? 'KN-0001' : 'KN-0002',
        targetBoothId: r1.status === 201 ? 'KN-0002' : 'KN-0001',
        connectionType: 'personal',
        idempotencyKey: r1.status === 201 ? 'k-alice-1' : 'k-viktor-1',
      },
    });
    assert.equal(retryRes.status, 200);
    assert.equal(retryRes.json.deduplicated, true);
    assert.equal(lark.tables.connections.length, beforeCount);

    // 8. No new Pending notification for Viktor! (inbox only has Alice's legacy Pending from Charlie)
    const viktorNotif = await httpReq(server, '/api/v1/connections/notifications/count', { cookie: viktorCookie });
    assert.equal(viktorNotif.json.pendingCount, 0);
    const aliceNotif = await httpReq(server, '/api/v1/connections/notifications/count', { cookie: aliceCookie });
    assert.equal(aliceNotif.json.pendingCount, 1);

    // 9. Honors reflects acceptedConnections = 1 and invalidates cache on changes
    const honors1 = await httpReq(server, '/api/v1/honors', { cookie: aliceCookie });
    assert.equal(honors1.status, 200);
    assert.equal(honors1.json.totals.acceptedConnections, 1);

    // 10. Create learning session on Accepted connection -> 201
    const startAt = new Date(Date.now() + 86400000).toISOString();
    const endAt = new Date(Date.now() + 90000000).toISOString();
    const sess1 = await httpReq(server, '/api/v1/learning-sessions', {
      method: 'POST',
      cookie: aliceCookie,
      body: { connectionId: createdRec.recordId, title: 'Buổi học AI', startAt, endAt, format: 'Online', locationOrLink: 'https://meet.example.com/1' },
    });
    assert.equal(sess1.status, 201);

    // 11. Third party & Admin (not participant) CANNOT cancel Alice<->Viktor connection -> 403
    const charlieCancel = await httpReq(server, `/api/v1/connections/${createdRec.recordId}/cancel`, { method: 'POST', cookie: charlieCookie });
    assert.equal(charlieCancel.status, 403);
    const adminCancel = await httpReq(server, `/api/v1/connections/${createdRec.recordId}/cancel`, { method: 'POST', cookie: adminCookie });
    assert.equal(adminCancel.status, 403);

    // 12. Recipient (Viktor) CAN cancel Accepted personal connection -> 200 Cancelled (not deleted!)
    const viktorCancel = await httpReq(server, `/api/v1/connections/${createdRec.recordId}/cancel`, { method: 'POST', cookie: viktorCookie });
    assert.equal(viktorCancel.status, 200);
    assert.equal(viktorCancel.json.data.status, 'Cancelled');
    assert.ok(lark.tables.connections.find((r) => r.record_id === createdRec.recordId && r.fields.Connection_Status === 'Cancelled'));

    // 13. Repeated cancel is safe idempotent -> 200 alreadyCancelled
    const viktorCancel2 = await httpReq(server, `/api/v1/connections/${createdRec.recordId}/cancel`, { method: 'POST', cookie: viktorCookie });
    assert.equal(viktorCancel2.status, 200);
    assert.equal(viktorCancel2.json.alreadyCancelled, true);

    // 14. Existing learning session preserved, but NEW learning session on Cancelled connection blocked -> 409
    const sessList = await httpReq(server, '/api/v1/learning-sessions', { cookie: aliceCookie });
    assert.equal(sessList.json.items.length, 1);
    assert.equal(sessList.json.availableConnections.length, 0);
    const blockedSess = await httpReq(server, '/api/v1/learning-sessions', {
      method: 'POST',
      cookie: aliceCookie,
      body: { connectionId: createdRec.recordId, title: 'Buổi học mới sau hủy', startAt, endAt, format: 'Online' },
    });
    assert.equal(blockedSess.status, 409);

    // 15. Honors cache invalidated -> acceptedConnections is 0
    const honors2 = await httpReq(server, '/api/v1/honors', { cookie: aliceCookie });
    assert.equal(honors2.json.totals.acceptedConnections, 0);

    // 16. Reconnect after Cancelled -> creates NEW Accepted record, preserves old Cancelled record
    const reconnect = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: aliceCookie,
      body: { sourceBoothId: 'KN-0001', targetBoothId: 'KN-0002', connectionType: 'personal' },
    });
    assert.equal(reconnect.status, 201);
    assert.equal(reconnect.json.data.status, 'Accepted');
    assert.notEqual(reconnect.json.data.recordId, createdRec.recordId);
    assert.equal(lark.tables.connections.filter((r) => r.fields.Connection_Status === 'Cancelled').length, 1);

    // 17. Direct connect when legacy Pending exists between Alice & Charlie -> supersedes Pending to Cancelled & creates Accepted!
    const supersede = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: aliceCookie,
      body: { sourceBoothId: 'KN-0001', targetBoothId: 'KN-0003', connectionType: 'personal' },
    });
    assert.equal(supersede.status, 201);
    assert.equal(supersede.json.data.status, 'Accepted');
    const oldPend = lark.tables.connections.find((r) => r.record_id === 'recLegacyPend1');
    assert.equal(oldPend.fields.Connection_Status, 'Cancelled');

    // 18. Village direct connect & cancel permissions
    const vilBadSelf = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: bobCookie,
      body: { sourceBoothId: 'KN-0101', targetBoothId: 'KN-0101', connectionType: 'village' },
    });
    assert.equal(vilBadSelf.status, 400);

    const vilBadImp = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: charlieCookie,
      body: { sourceBoothId: 'KN-0101', targetBoothId: 'KN-0102', connectionType: 'village' },
    });
    assert.equal(vilBadImp.status, 403);

    const vilConn = await httpReq(server, '/api/v1/connections', {
      method: 'POST',
      cookie: bobCookie, // Member of Village A
      body: { sourceBoothId: 'KN-0101', targetBoothId: 'KN-0102', connectionType: 'village' },
    });
    assert.equal(vilConn.status, 201);
    assert.equal(vilConn.json.data.status, 'Accepted');
    assert.equal(vilConn.json.data.approverMemberId, 'MEM-0015'); // Leader of Village B

    // Regular member of Village B (Viktor) CANNOT cancel Village B's connection -> 403
    const vilNonLeaderCancel = await httpReq(server, `/api/v1/connections/${vilConn.json.data.recordId}/cancel`, {
      method: 'POST',
      cookie: viktorCookie,
    });
    assert.equal(vilNonLeaderCancel.status, 403);

    // Leader of Village B (Harold) CAN cancel -> 200
    const vilLeaderCancel = await httpReq(server, `/api/v1/connections/${vilConn.json.data.recordId}/cancel`, {
      method: 'POST',
      cookie: haroldCookie,
    });
    assert.equal(vilLeaderCancel.status, 200);
    assert.equal(vilLeaderCancel.json.data.status, 'Cancelled');
  } finally {
    await new Promise((r) => server.close(r));
  }
});
