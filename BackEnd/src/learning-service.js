import { linkedRecordIds, mapMember, numberValue, textValue } from './mappers.js';

const SESSION_FIELDS = {
  connection: 'Connection',
  title: 'Learning_Title',
  startAt: 'Start_At',
  endAt: 'End_At',
  format: 'Learning_Format',
  location: 'Location_Or_Link',
  scheduledBy: 'Scheduled_By',
  confirmedBy: 'Confirmed_By',
  otherParticipantId: 'Other_Participant_ID',
  status: 'Session_Status',
  createdAt: 'Created_At',
  confirmedAt: 'Confirmed_At',
};

const RESULT_FIELDS = {
  reporterName: 'Tên của bạn',
  reporter: '👤 Người điền',
  submittedBy: 'Submitted_By',
  learned: 'Điều em đã học được',
  applied: 'Đã thử áp dụng?',
  rating: 'Mức độ hữu ích',
  asset: 'Tài sản tri thức có thể chia sẻ lại',
  share: 'Đồng ý chia sẻ bài học này ở chế độ nội bộ khi tổ chức có cơ chế phê duyệt.',
  outcome: 'Kết quả sau khi áp dụng',
  evidence: 'Link / minh chứng',
  createdAt: 'Ngày tạo',
  learningSession: 'Learning_Session',
};

function serviceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function values(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.value)) return value.value;
  return [];
}

function userIds(value) {
  return values(value).map((item) => item?.id).filter((id) => typeof id === 'string' && id);
}

function validText(value, label, { required = false, max = 5000 } = {}) {
  if (typeof value !== 'string') {
    if (required) throw serviceError(`${label} là bắt buộc.`, 400);
    return '';
  }
  const trimmed = value.trim();
  if (required && !trimmed) throw serviceError(`${label} là bắt buộc.`, 400);
  if (trimmed.length > max) throw serviceError(`${label} vượt quá ${max} ký tự.`, 400);
  return trimmed;
}

function parseDateTime(value, label) {
  if (typeof value !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/i.test(value)) {
    throw serviceError(`${label} phải có múi giờ rõ ràng.`, 400);
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw serviceError(`${label} không hợp lệ.`, 400);
  return timestamp;
}

function memberRecordId(record) {
  return textValue(record?.fields?.Member_ID);
}

function larkOpenId(record) {
  return values(record?.fields?.Lark_User).map((user) => user?.id).find(Boolean) || null;
}

function isParticipant(connection, memberId) {
  if (!connection || !memberId) return false;
  return [connection.requestedBy, connection.targetMemberId, connection.approverMemberId]
    .some((participant) => participant === memberId);
}

function connectionLabel(connection) {
  if (connection.connectionType === 'village') {
    return `${connection.sourceVillageName || 'Làng'} ↔ ${connection.targetVillageName || 'Làng'}`;
  }
  return `${connection.seekerName || 'Thành viên'} ↔ ${connection.targetName || 'Thành viên'}`;
}

function fieldValue(fields, name) {
  const value = fields?.[name];
  if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) return value.value;
  return value;
}

function dateValue(value) {
  const n = numberValue(value);
  if (n !== null) return n;
  const raw = textValue(value);
  if (!raw) return null;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapSession(record, connection, membersById, memberId, isAdmin, now, reportIds, reportCounts = new Map()) {
  const fields = record.fields ?? {};
  const scheduledBy = textValue(fields[SESSION_FIELDS.scheduledBy]);
  const status = textValue(fields[SESSION_FIELDS.status]);
  const startAt = dateValue(fields[SESSION_FIELDS.startAt]);
  const endAt = dateValue(fields[SESSION_FIELDS.endAt]);
  const participant = isParticipant(connection, memberId);
  const allowed = isAdmin || participant;
  const isVillage = connection?.connectionType === 'village';
  const participantDetails = [
    {
      memberId: connection?.requestedBy,
      fallbackName: connection?.seekerName,
      fallbackAvatarUrl: connection?.seekerAvatarUrl,
    },
    {
      memberId: isVillage ? connection?.approverMemberId : connection?.targetMemberId,
      fallbackName: isVillage ? 'Đại diện Làng' : connection?.targetName,
      fallbackAvatarUrl: isVillage ? null : connection?.targetAvatarUrl,
    },
  ].filter((item) => item.memberId).map((item) => {
    const member = membersById.get(item.memberId);
    return {
      memberId: item.memberId,
      name: member?.name || item.fallbackName || item.memberId,
      avatarUrl: member?.avatarUrl || item.fallbackAvatarUrl || null,
    };
  });
  return {
    id: record.record_id,
    sessionId: textValue(fields.Session_ID) || record.record_id,
    connectionRecordId: linkedRecordIds(fields[SESSION_FIELDS.connection])[0] || null,
    connectionId: connection?.connectionId || null,
    connectionType: connection?.connectionType || null,
    connectionLabel: connection ? connectionLabel(connection) : 'Kết nối',
    participants: participantDetails.map((item) => item.name),
    participantDetails,
    title: textValue(fields[SESSION_FIELDS.title]) || '',
    startAt,
    endAt,
    format: textValue(fields[SESSION_FIELDS.format]) || '',
    locationOrLink: allowed ? (textValue(fields[SESSION_FIELDS.location]) || '') : '',
    scheduledBy,
    confirmedBy: textValue(fields[SESSION_FIELDS.confirmedBy]),
    otherParticipantId: textValue(fields[SESSION_FIELDS.otherParticipantId]),
    status,
    createdAt: dateValue(fields[SESSION_FIELDS.createdAt]),
    confirmedAt: dateValue(fields[SESSION_FIELDS.confirmedAt]),
    isParticipant: participant,
    hasReported: reportIds.has(record.record_id),
    reportCount: reportCounts.get(record.record_id) || 0,
    permissions: {
      canRespond: allowed && participant && status === 'Proposed' && scheduledBy !== memberId,
      canCancel: participant && status === 'Proposed' && scheduledBy === memberId,
      canComplete: participant && status === 'Confirmed' && endAt !== null && endAt <= now,
      canReport: participant && status === 'Completed',
      canViewResults: allowed && status === 'Completed',
    },
  };
}

export function createLearningService({ lark, config, connectionService, membersRaw }) {
  if (!lark || !config || !connectionService || typeof membersRaw !== 'function') {
    throw new TypeError('LearningService requires lark, config, connectionService, and membersRaw');
  }

  let schemaPromise = null;
  const locks = new Map();

  async function withLock(key, fn) {
    while (locks.has(key)) await locks.get(key);
    let release;
    const lock = new Promise((resolve) => { release = resolve; });
    locks.set(key, lock);
    try {
      return await fn();
    } finally {
      locks.delete(key);
      release();
    }
  }

  function assertField(fields, name, type, linkedTableId = null) {
    const field = fields.find((item) => item.field_name === name);
    if (!field || field.type !== type) {
      throw serviceError(`Lark schema mismatch for field "${name}".`, 500);
    }
    if (linkedTableId && (field.property?.table_id !== linkedTableId)) {
      throw serviceError(`Lark linked-record field "${name}" points to an unexpected table.`, 500);
    }
    return field;
  }

  async function getSchema() {
    if (!schemaPromise) {
      schemaPromise = (async () => {
        const [sessions, results] = await Promise.all([
          lark.listFields(config.learningSessionTableId),
          lark.listFields(config.resultTableId),
        ]);
        assertField(sessions, SESSION_FIELDS.connection, 18, config.connectionTableId);
        assertField(sessions, SESSION_FIELDS.title, 1);
        assertField(sessions, SESSION_FIELDS.startAt, 5);
        assertField(sessions, SESSION_FIELDS.endAt, 5);
        const format = assertField(sessions, SESSION_FIELDS.format, 3);
        assertField(sessions, SESSION_FIELDS.location, 1);
        assertField(sessions, SESSION_FIELDS.scheduledBy, 1);
        assertField(sessions, SESSION_FIELDS.confirmedBy, 1);
        assertField(sessions, SESSION_FIELDS.otherParticipantId, 1);
        const status = assertField(sessions, SESSION_FIELDS.status, 3);
        assertField(sessions, SESSION_FIELDS.createdAt, 5);
        assertField(sessions, SESSION_FIELDS.confirmedAt, 5);
        assertField(results, RESULT_FIELDS.reporterName, 3);
        assertField(results, RESULT_FIELDS.reporter, 11);
        assertField(results, RESULT_FIELDS.submittedBy, 11);
        assertField(results, RESULT_FIELDS.learned, 1);
        const applied = assertField(results, RESULT_FIELDS.applied, 3);
        assertField(results, RESULT_FIELDS.rating, 2);
        assertField(results, RESULT_FIELDS.asset, 1);
        assertField(results, RESULT_FIELDS.share, 7);
        assertField(results, RESULT_FIELDS.outcome, 1);
        assertField(results, RESULT_FIELDS.evidence, 15);
        assertField(results, RESULT_FIELDS.createdAt, 5);
        assertField(results, RESULT_FIELDS.learningSession, 18, config.learningSessionTableId);

        const optionNames = (field) => (field.property?.options || []).map((option) => option.name);
        const formats = optionNames(format);
        const statuses = optionNames(status);
        if (!['Online', 'Trực tiếp'].every((item) => formats.includes(item))) {
          throw serviceError('Lark schema mismatch for Learning_Format options.', 500);
        }
        if (!['Proposed', 'Confirmed', 'Completed', 'Cancelled'].every((item) => statuses.includes(item))) {
          throw serviceError('Lark schema mismatch for Session_Status options.', 500);
        }
        return {
          appliedOptions: optionNames(applied),
          formatOptions: formats,
          statusOptions: statuses,
          reporterNameOptions: optionNames(assertField(results, RESULT_FIELDS.reporterName, 3)),
        };
      })().catch((error) => {
        schemaPromise = null;
        throw error;
      });
    }
    return schemaPromise;
  }

  async function getConnections(sessionUser) {
    const result = await connectionService.listConnections({
      sessionUser,
      isAdmin: true,
      scope: 'all',
    });
    return result.items || [];
  }

  async function getSessionContext(id, sessionUser, { isAdmin = false, requireParticipant = false } = {}) {
    if (!sessionUser?.memberId) throw serviceError('Yêu cầu xác thực tài khoản.', 401);
    await getSchema();
    const [records, connections] = await Promise.all([
      lark.searchAll(config.learningSessionTableId),
      getConnections(sessionUser),
    ]);
    const record = records.find((item) => item.record_id === id || textValue(item.fields?.Session_ID) === id);
    if (!record) throw serviceError('Không tìm thấy buổi học.', 404);
    const connectionRecordId = linkedRecordIds(record.fields?.[SESSION_FIELDS.connection])[0];
    const connection = connections.find((item) => item.recordId === connectionRecordId);
    if (!connection) throw serviceError('Không tìm thấy kết nối của buổi học.', 404);
    const participant = isParticipant(connection, sessionUser.memberId);
    if (requireParticipant && !participant) throw serviceError('Bạn không phải người tham gia được ủy quyền của buổi học này.', 403);
    if (!isAdmin && !participant) throw serviceError('Bạn không có quyền truy cập buổi học này.', 403);
    return { record, connection, participant };
  }

  async function getCurrentMember(sessionUser) {
    const records = await membersRaw();
    const member = records.find((record) => memberRecordId(record) === sessionUser.memberId);
    if (!member) throw serviceError('Không tìm thấy hồ sơ thành viên đăng nhập.', 403);
    const openId = larkOpenId(member);
    if (!openId) throw serviceError('Tài khoản chưa liên kết với người dùng Lark nên không thể ghi nhận báo cáo.', 422);
    const name = textValue(member.fields?.Display_Name);
    if (!name) throw serviceError('Hồ sơ thành viên chưa có tên hiển thị.', 422);
    return { record: member, openId, name };
  }

  function sessionReportIds(records, openId) {
    const ids = new Set();
    if (!openId) return ids;
    for (const record of records) {
      const submittedBy = userIds(record.fields?.[RESULT_FIELDS.submittedBy]);
      const reporter = userIds(record.fields?.[RESULT_FIELDS.reporter]);
      if (![...submittedBy, ...reporter].includes(openId)) continue;
      for (const id of linkedRecordIds(record.fields?.[RESULT_FIELDS.learningSession])) ids.add(id);
    }
    return ids;
  }

  function sessionReportCounts(records) {
    const counts = new Map();
    for (const record of records) {
      for (const id of linkedRecordIds(record.fields?.[RESULT_FIELDS.learningSession])) {
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    }
    return counts;
  }

  async function listLearningData({ sessionUser, isAdmin = false }) {
    if (!sessionUser?.memberId) throw serviceError('Yêu cầu xác thực tài khoản.', 401);
    const [schema, sessions, connections, resultRecords, memberRecords] = await Promise.all([
      getSchema(),
      lark.searchAll(config.learningSessionTableId),
      getConnections(sessionUser),
      lark.searchAll(config.resultTableId),
      membersRaw(),
    ]);
    const membersById = new Map(memberRecords.map((record) => {
      const member = mapMember(record);
      return [member.id, member];
    }).filter(([id]) => id));
    const member = memberRecords.find((record) => memberRecordId(record) === sessionUser.memberId) || null;
    const openId = member ? larkOpenId(member) : null;
    const reported = sessionReportIds(resultRecords, openId);
    const reportCounts = sessionReportCounts(resultRecords);
    const byRecordId = new Map(connections.map((connection) => [connection.recordId, connection]));
    const now = Date.now();
    const items = sessions.flatMap((record) => {
      const connectionId = linkedRecordIds(record.fields?.[SESSION_FIELDS.connection])[0];
      const connection = byRecordId.get(connectionId);
      if (!connection) return [];
      return [mapSession(record, connection, membersById, sessionUser.memberId, isAdmin, now, reported, reportCounts)];
    }).sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0));
    const availableConnections = connections
      .filter((connection) => connection.status === 'Accepted' && isParticipant(connection, sessionUser.memberId))
      .map((connection) => ({
        id: connection.recordId,
        label: connectionLabel(connection),
        connectionType: connection.connectionType,
        connectionId: connection.connectionId,
      }));
    return {
      items,
      availableConnections,
      reportOptions: {
        applied: schema.appliedOptions,
        formats: schema.formatOptions,
      },
    };
  }

  async function createLearningSession({ sessionUser, connectionId, title, startAt, endAt, format, locationOrLink }) {
    if (!sessionUser?.memberId) throw serviceError('Yêu cầu xác thực tài khoản.', 401);
    const cleanTitle = validText(title, 'Tiêu đề buổi học', { required: true, max: 200 });
    const startTimestamp = parseDateTime(startAt, 'Thời gian bắt đầu');
    const endTimestamp = parseDateTime(endAt, 'Thời gian kết thúc');
    if (endTimestamp <= startTimestamp) throw serviceError('Thời gian kết thúc phải sau thời gian bắt đầu.', 400);
    if (!['Online', 'Trực tiếp'].includes(format)) throw serviceError('Hình thức buổi học không hợp lệ.', 400);
    const location = validText(locationOrLink, 'Địa điểm hoặc link', { max: 1000 });
    if (format === 'Online' && location) {
      let parsed;
      try { parsed = new URL(location); } catch { throw serviceError('Link họp Online không hợp lệ.', 400); }
      if (!['http:', 'https:'].includes(parsed.protocol)) throw serviceError('Link họp Online phải dùng HTTP hoặc HTTPS.', 400);
    }
    if (typeof connectionId !== 'string' || !connectionId) throw serviceError('Vui lòng chọn kết nối đã chấp nhận.', 400);
    await getSchema();
    const connection = (await getConnections(sessionUser)).find((item) => item.recordId === connectionId || item.connectionId === connectionId);
    if (!connection) throw serviceError('Không tìm thấy kết nối.', 404);
    if (connection.status !== 'Accepted') throw serviceError('Chỉ kết nối đã được chấp nhận mới có thể đặt lịch.', 409);
    if (!isParticipant(connection, sessionUser.memberId)) throw serviceError('Bạn không có quyền đặt lịch cho kết nối này.', 403);
    const otherParticipantId = [...new Set([
      connection.requestedBy,
      connection.targetMemberId,
      connection.approverMemberId,
    ].filter((memberId) => memberId && memberId !== sessionUser.memberId))][0];
    if (!otherParticipantId) throw serviceError('Không xác định được Member_ID của người còn lại.', 422);

    const fields = {
      [SESSION_FIELDS.connection]: [connection.recordId],
      [SESSION_FIELDS.title]: cleanTitle,
      [SESSION_FIELDS.startAt]: startTimestamp,
      [SESSION_FIELDS.endAt]: endTimestamp,
      [SESSION_FIELDS.format]: format,
      ...(location ? { [SESSION_FIELDS.location]: location } : {}),
      [SESSION_FIELDS.scheduledBy]: sessionUser.memberId,
      [SESSION_FIELDS.otherParticipantId]: otherParticipantId,
      [SESSION_FIELDS.status]: 'Proposed',
      [SESSION_FIELDS.createdAt]: Date.now(),
    };
    const created = await lark.createRecord(config.learningSessionTableId, fields);
    if (!created?.record_id) throw serviceError('Lark không xác nhận đã tạo buổi học.', 502);
    return {
      id: created.record_id,
      sessionId: textValue(created.fields?.Session_ID) || created.record_id,
      status: 'Proposed',
    };
  }

  async function respondToSession({ sessionUser, id, decision }) {
    if (!sessionUser?.memberId) throw serviceError('Yêu cầu xác thực tài khoản.', 401);
    if (!['accept', 'reject', 'cancel'].includes(decision)) throw serviceError('Quyết định không hợp lệ.', 400);
    return withLock(`session:${id}`, async () => {
      const { record, connection } = await getSessionContext(id, sessionUser, { requireParticipant: true });
      const fields = record.fields ?? {};
      if (textValue(fields[SESSION_FIELDS.status]) !== 'Proposed') {
        throw serviceError('Lịch không còn ở trạng thái chờ xác nhận.', 409);
      }
      const scheduledBy = textValue(fields[SESSION_FIELDS.scheduledBy]);
      if (decision === 'cancel') {
        if (scheduledBy !== sessionUser.memberId) throw serviceError('Chỉ người đề xuất mới có thể hủy lịch đang chờ.', 403);
      } else {
        if (scheduledBy === sessionUser.memberId) throw serviceError('Người đề xuất không thể tự xác nhận lịch của mình.', 403);
      }
      const update = decision === 'accept'
        ? {
            [SESSION_FIELDS.status]: 'Confirmed',
            [SESSION_FIELDS.confirmedBy]: sessionUser.memberId,
            [SESSION_FIELDS.confirmedAt]: Date.now(),
          }
        : { [SESSION_FIELDS.status]: 'Cancelled' };
      await lark.updateRecord(config.learningSessionTableId, record.record_id, update);
      return { id: record.record_id, status: update[SESSION_FIELDS.status], decision };
    });
  }

  async function completeSession({ sessionUser, id }) {
    if (!sessionUser?.memberId) throw serviceError('Yêu cầu xác thực tài khoản.', 401);
    return withLock(`session:${id}`, async () => {
      const { record } = await getSessionContext(id, sessionUser, { requireParticipant: true });
      if (textValue(record.fields?.[SESSION_FIELDS.status]) !== 'Confirmed') {
        throw serviceError('Chỉ lịch đã xác nhận mới có thể hoàn thành.', 409);
      }
      const endAt = dateValue(record.fields?.[SESSION_FIELDS.endAt]);
      if (endAt === null || endAt > Date.now()) {
        throw serviceError('Chỉ xác nhận hoàn thành sau thời gian kết thúc dự kiến.', 409);
      }
      await lark.updateRecord(config.learningSessionTableId, record.record_id, {
        [SESSION_FIELDS.status]: 'Completed',
      });
      return { id: record.record_id, status: 'Completed' };
    });
  }

  function mapReport(record, ownOpenId = null) {
    const fields = record.fields ?? {};
    const reporterIds = [
      ...userIds(fields[RESULT_FIELDS.submittedBy]),
      ...userIds(fields[RESULT_FIELDS.reporter]),
    ];
    const own = Boolean(ownOpenId && reporterIds.includes(ownOpenId));
    return {
      id: record.record_id,
      reporterName: textValue(fields[RESULT_FIELDS.reporterName]) || 'Thành viên',
      createdAt: dateValue(fields[RESULT_FIELDS.createdAt]),
      learned: textValue(fields[RESULT_FIELDS.learned]) || '',
      applied: textValue(fields[RESULT_FIELDS.applied]) || '',
      rating: numberValue(fields[RESULT_FIELDS.rating]),
      asset: textValue(fields[RESULT_FIELDS.asset]) || '',
      share: fieldValue(fields, RESULT_FIELDS.share) === true,
      outcome: textValue(fields[RESULT_FIELDS.outcome]) || '',
      evidence: textValue(fields[RESULT_FIELDS.evidence]) || '',
      own,
    };
  }

  async function getSessionResults({ sessionUser, isAdmin = false, id }) {
    const { record } = await getSessionContext(id, sessionUser, { isAdmin });
    if (textValue(record.fields?.[SESSION_FIELDS.status]) !== 'Completed') {
      throw serviceError('Kết quả chỉ khả dụng sau khi buổi học được đánh dấu hoàn thành.', 409);
    }
    const member = await membersRaw().then((items) => items.find((item) => memberRecordId(item) === sessionUser.memberId) || null);
    const openId = member ? larkOpenId(member) : null;
    const reports = await lark.searchAll(config.resultTableId);
    return reports
      .filter((item) => linkedRecordIds(item.fields?.[RESULT_FIELDS.learningSession]).includes(record.record_id))
      .map((item) => mapReport(item, openId))
      .filter((item) => isAdmin || item.own || item.share)
      .map((item) => (isAdmin || item.own
        ? item
        : { ...item, reporterName: 'Thành viên đã chia sẻ', evidence: '' }));
  }

  async function submitSessionResult({ sessionUser, id, learned, applied, rating, asset, outcome, evidence, share }) {
    if (!sessionUser?.memberId) throw serviceError('Yêu cầu xác thực tài khoản.', 401);
    const cleanLearned = validText(learned, 'Điều em đã học được', { required: true });
    const cleanAsset = validText(asset, 'Tài sản tri thức', { max: 2000 });
    const cleanOutcome = validText(outcome, 'Kết quả sau khi áp dụng', { max: 5000 });
    const cleanEvidence = validText(evidence, 'Link / minh chứng', { max: 2000 });
    if (cleanEvidence) {
      let parsed;
      try { parsed = new URL(cleanEvidence); } catch { throw serviceError('Link / minh chứng không hợp lệ.', 400); }
      if (!['http:', 'https:'].includes(parsed.protocol)) throw serviceError('Link / minh chứng phải dùng HTTP hoặc HTTPS.', 400);
    }
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      throw serviceError('Mức độ hữu ích phải từ 1 đến 5.', 400);
    }
    if (typeof share !== 'boolean') throw serviceError('Giá trị đồng ý chia sẻ không hợp lệ.', 400);

    return withLock(`report:${id}:${sessionUser.memberId}`, async () => {
      const { record } = await getSessionContext(id, sessionUser, { requireParticipant: true });
      if (textValue(record.fields?.[SESSION_FIELDS.status]) !== 'Completed') {
        throw serviceError('Chỉ buổi học đã hoàn thành mới được báo cáo kết quả.', 409);
      }
      const schema = await getSchema();
      if (!schema.appliedOptions.includes(applied)) throw serviceError('Lựa chọn áp dụng không hợp lệ.', 400);
      const member = await getCurrentMember(sessionUser);
      if (!schema.reporterNameOptions.includes(member.name)) {
        throw serviceError('Tên thành viên chưa có trong các lựa chọn của Form 02.', 422);
      }

      const existing = (await lark.searchAll(config.resultTableId)).find((item) => {
        const sessionMatches = linkedRecordIds(item.fields?.[RESULT_FIELDS.learningSession]).includes(record.record_id);
        const reporterMatches = [
          ...userIds(item.fields?.[RESULT_FIELDS.submittedBy]),
          ...userIds(item.fields?.[RESULT_FIELDS.reporter]),
        ].includes(member.openId);
        return sessionMatches && reporterMatches;
      });
      if (existing) return { duplicate: true, data: mapReport(existing, member.openId) };

      const fields = {
        [RESULT_FIELDS.reporterName]: member.name,
        [RESULT_FIELDS.reporter]: [{ id: member.openId }],
        [RESULT_FIELDS.submittedBy]: [{ id: member.openId }],
        [RESULT_FIELDS.learned]: cleanLearned,
        [RESULT_FIELDS.applied]: applied,
        [RESULT_FIELDS.rating]: Number(rating),
        [RESULT_FIELDS.asset]: cleanAsset,
        [RESULT_FIELDS.share]: share,
        [RESULT_FIELDS.outcome]: cleanOutcome,
        [RESULT_FIELDS.learningSession]: [record.record_id],
        [RESULT_FIELDS.createdAt]: Date.now(),
      };
      if (cleanEvidence) fields[RESULT_FIELDS.evidence] = { text: cleanEvidence, link: cleanEvidence };
      const created = await lark.createRecord(config.resultTableId, fields);
      if (!created?.record_id) throw serviceError('Lark không xác nhận đã lưu báo cáo.', 502);
      return {
        duplicate: false,
        data: mapReport({ ...created, fields: { ...fields, ...(created.fields || {}) } }, member.openId),
      };
    });
  }

  return {
    listLearningData,
    createLearningSession,
    respondToSession,
    completeSession,
    getSessionResults,
    submitSessionResult,
  };
}
