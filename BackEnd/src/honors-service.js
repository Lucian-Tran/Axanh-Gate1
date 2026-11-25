import { linkedRecordIds, numberValue, textValue } from './mappers.js';

const FIELDS = {
  connection: {
    status: 'Connection_Status',
    type: 'Connection_Type',
    sourceBooth: 'Source_Booth',
    targetBooth: 'Target_Booth',
    requestedBy: 'Requested_By',
    targetMemberId: 'Target_Member_ID',
    targetVillageId: 'Target_Village_ID',
    approverMemberId: 'Approver_Member_ID',
  },
  session: {
    connection: 'Connection',
    status: 'Session_Status',
  },
  result: {
    learningSession: 'Learning_Session',
    learned: 'Điều em đã học được',
    rating: 'Mức độ hữu ích',
    reporter: '👤 Người điền',
    submittedBy: 'Submitted_By',
  },
};

function serviceError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function fieldValue(fields, name) {
  const value = fields?.[name];
  if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) {
    return value.value;
  }
  return value;
}

function personIds(value) {
  const items = Array.isArray(value) ? value : (Array.isArray(value?.value) ? value.value : []);
  return items.map((item) => item?.id).filter((id) => typeof id === 'string' && id);
}

function normalizedId(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function isVillageBoothType(value) {
  return value === 'Làng' || value === 'village';
}

function emptyMetrics() {
  return { acceptedConnections: 0, completedSessions: 0, validReports: 0 };
}

function metricTotal(metrics) {
  return metrics.acceptedConnections + metrics.completedSessions + metrics.validReports;
}

function assertField(fields, name, type, linkedTableId = null) {
  const field = fields.find((item) => item.field_name === name);
  if (!field || field.type !== type) {
    throw serviceError(`Lark schema mismatch for field "${name}".`, 500);
  }
  if (linkedTableId && field.property?.table_id !== linkedTableId) {
    throw serviceError(`Lark linked-record field "${name}" points to an unexpected table.`, 500);
  }
}

function assertOptions(field, expected, label) {
  const options = (field.property?.options || []).map((option) => option.name);
  if (!expected.every((option) => options.includes(option))) {
    throw serviceError(`Lark schema mismatch for ${label} options.`, 500);
  }
}

export function createHonorsService({
  lark,
  config,
  getMembers,
  getVillages,
  getBooths,
}) {
  if (!lark || !config || typeof getMembers !== 'function'
    || typeof getVillages !== 'function' || typeof getBooths !== 'function') {
    throw new TypeError('HonorsService requires lark, config, and mapped data fetchers');
  }

  let schemaPromise = null;
  let cachedOverview = null;
  let cacheExpiresAt = 0;
  let inFlight = null;

  async function getSchema() {
    if (!schemaPromise) {
      schemaPromise = (async () => {
        const [connections, sessions, results] = await Promise.all([
          lark.listFields(config.connectionTableId),
          lark.listFields(config.learningSessionTableId),
          lark.listFields(config.resultTableId),
        ]);
        assertField(connections, FIELDS.connection.status, 3);
        const connectionStatus = connections.find((field) => field.field_name === FIELDS.connection.status);
        assertOptions(connectionStatus, ['Accepted'], 'Connection_Status');
        assertField(connections, FIELDS.connection.type, 3);
        assertField(connections, FIELDS.connection.sourceBooth, 18, config.boothTableId);
        assertField(connections, FIELDS.connection.targetBooth, 18, config.boothTableId);
        assertField(connections, FIELDS.connection.requestedBy, 1);
        assertField(connections, FIELDS.connection.targetMemberId, 1);
        assertField(connections, FIELDS.connection.targetVillageId, 1);
        assertField(connections, FIELDS.connection.approverMemberId, 1);

        assertField(sessions, FIELDS.session.connection, 18, config.connectionTableId);
        assertField(sessions, FIELDS.session.status, 3);
        const sessionStatus = sessions.find((field) => field.field_name === FIELDS.session.status);
        assertOptions(sessionStatus, ['Completed'], 'Session_Status');

        assertField(results, FIELDS.result.learningSession, 18, config.learningSessionTableId);
        assertField(results, FIELDS.result.learned, 1);
        assertField(results, FIELDS.result.rating, 2);
        assertField(results, FIELDS.result.reporter, 11);
        assertField(results, FIELDS.result.submittedBy, 11);
      })().catch((error) => {
        schemaPromise = null;
        throw error;
      });
    }
    return schemaPromise;
  }

  async function buildOverview() {
    await getSchema();
    const [members, villages, booths, connectionRecords, sessionRecords, resultRecords] = await Promise.all([
      getMembers(),
      getVillages(),
      getBooths(),
      lark.searchAll(config.connectionTableId),
      lark.searchAll(config.learningSessionTableId),
      lark.searchAll(config.resultTableId),
    ]);

    const memberById = new Map();
    const memberByOpenId = new Map();
    const ambiguousOpenIds = new Set();
    const memberMetrics = new Map();
    for (const member of members) {
      const id = normalizedId(member.id);
      if (!id || !member.name) continue;
      memberById.set(id, member);
      memberMetrics.set(id, emptyMetrics());
      if (member.larkOpenId && !ambiguousOpenIds.has(member.larkOpenId)) {
        if (memberByOpenId.has(member.larkOpenId)) {
          memberByOpenId.delete(member.larkOpenId);
          ambiguousOpenIds.add(member.larkOpenId);
        } else {
          memberByOpenId.set(member.larkOpenId, id);
        }
      }
    }

    const villageById = new Map();
    const villageMetrics = new Map();
    for (const village of villages) {
      const id = normalizedId(village.id);
      if (!id || !village.name) continue;
      villageById.set(id, village);
      villageMetrics.set(id, emptyMetrics());
    }

    const boothByRecordId = new Map(booths
      .filter((booth) => booth.recordId)
      .map((booth) => [booth.recordId, booth]));
    const validConnections = new Map();

    function incrementMetrics(map, id, key) {
      const metrics = map.get(id);
      if (metrics) metrics[key] += 1;
    }

    for (const record of connectionRecords) {
      const fields = record.fields ?? {};
      if (!record.record_id) continue;
      if (textValue(fieldValue(fields, FIELDS.connection.status)) !== 'Accepted') continue;

      const sourceIds = linkedRecordIds(fieldValue(fields, FIELDS.connection.sourceBooth));
      const targetIds = linkedRecordIds(fieldValue(fields, FIELDS.connection.targetBooth));
      if (sourceIds.length !== 1 || targetIds.length !== 1) continue;
      const sourceBooth = boothByRecordId.get(sourceIds[0]);
      const targetBooth = boothByRecordId.get(targetIds[0]);
      if (!sourceBooth || !targetBooth) continue;

      const connectionType = textValue(fieldValue(fields, FIELDS.connection.type));
      const villageConnection = isVillageBoothType(connectionType);
      if (villageConnection) {
        if (sourceBooth.boothType !== 'village' || targetBooth.boothType !== 'village') continue;
        const sourceVillageId = normalizedId(sourceBooth.villageId);
        const targetVillageId = normalizedId(
          textValue(fieldValue(fields, FIELDS.connection.targetVillageId)) || targetBooth.villageId,
        );
        if (!villageById.has(sourceVillageId) || !villageById.has(targetVillageId) || sourceVillageId === targetVillageId) continue;

        const memberIds = [...new Set([
          normalizedId(textValue(fieldValue(fields, FIELDS.connection.requestedBy))),
          normalizedId(textValue(fieldValue(fields, FIELDS.connection.approverMemberId))),
        ].filter((id) => memberById.has(id)))];
        const villageIds = [sourceVillageId, targetVillageId];
        for (const id of villageIds) incrementMetrics(villageMetrics, id, 'acceptedConnections');
        validConnections.set(record.record_id, { type: 'village', memberIds, villageIds });
        continue;
      }

      if (connectionType !== 'Cá nhân' && connectionType !== 'personal') continue;
      if (sourceBooth.boothType !== 'personal' || targetBooth.boothType !== 'personal') continue;
      const sourceMemberId = normalizedId(sourceBooth.authorMemberId)
        || normalizedId(textValue(fieldValue(fields, FIELDS.connection.requestedBy)));
      const targetMemberId = normalizedId(textValue(fieldValue(fields, FIELDS.connection.targetMemberId)))
        || normalizedId(targetBooth.authorMemberId);
      if (!memberById.has(sourceMemberId) || !memberById.has(targetMemberId) || sourceMemberId === targetMemberId) continue;

      const memberIds = [sourceMemberId, targetMemberId];
      for (const id of memberIds) incrementMetrics(memberMetrics, id, 'acceptedConnections');
      validConnections.set(record.record_id, { type: 'personal', memberIds, villageIds: [] });
    }

    const completedSessions = new Map();
    for (const record of sessionRecords) {
      const fields = record.fields ?? {};
      if (!record.record_id) continue;
      if (textValue(fieldValue(fields, FIELDS.session.status)) !== 'Completed') continue;
      const connectionIds = linkedRecordIds(fieldValue(fields, FIELDS.session.connection));
      if (connectionIds.length !== 1) continue;
      const connection = validConnections.get(connectionIds[0]);
      if (!connection) continue;

      if (connection.type === 'personal') {
        for (const id of connection.memberIds) incrementMetrics(memberMetrics, id, 'completedSessions');
      } else {
        for (const id of connection.villageIds) incrementMetrics(villageMetrics, id, 'completedSessions');
      }
      completedSessions.set(record.record_id, connection);
    }

    const countedReportPairs = new Set();
    const countedReportRecords = new Set();
    for (const record of resultRecords) {
      const fields = record.fields ?? {};
      if (!record.record_id) continue;
      const sessionIds = linkedRecordIds(fieldValue(fields, FIELDS.result.learningSession));
      if (sessionIds.length !== 1) continue;
      const connection = completedSessions.get(sessionIds[0]);
      if (!connection) continue;
      const learned = textValue(fieldValue(fields, FIELDS.result.learned));
      const rating = numberValue(fieldValue(fields, FIELDS.result.rating));
      if (!learned?.trim() || !Number.isInteger(rating) || rating < 1 || rating > 5) continue;

      const reporterIds = [
        ...personIds(fieldValue(fields, FIELDS.result.submittedBy)),
        ...personIds(fieldValue(fields, FIELDS.result.reporter)),
      ];
      const participantIds = new Set(connection.memberIds);
      const validReporterIds = [...new Set(reporterIds
        .filter((id) => !ambiguousOpenIds.has(id))
        .map((id) => memberByOpenId.get(id))
        .filter((id) => id && participantIds.has(id)))];
      let countedThisReport = false;
      for (const memberId of validReporterIds) {
        const pair = `${sessionIds[0]}:${memberId}`;
        if (countedReportPairs.has(pair)) continue;
        countedReportPairs.add(pair);
        countedThisReport = true;
        incrementMetrics(memberMetrics, memberId, 'validReports');
      }
      if (!countedThisReport) continue;
      countedReportRecords.add(record.record_id);
      if (connection.type === 'village') {
        for (const id of connection.villageIds) incrementMetrics(villageMetrics, id, 'validReports');
      }
    }

    const individuals = [...memberById.entries()]
      .filter(([id]) => metricTotal(memberMetrics.get(id)) > 0)
      .map(([id, member]) => ({
        name: member.name,
        villageName: member.villageName || 'Chưa liên kết làng',
        avatarUrl: member.avatarUrl || null,
        ...memberMetrics.get(id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    const villageHighlights = [...villageById.entries()]
      .filter(([id]) => metricTotal(villageMetrics.get(id)) > 0)
      .map(([id, village]) => ({
        name: village.name,
        iconUrl: village.iconUrl || null,
        ...villageMetrics.get(id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    return {
      individuals,
      villages: villageHighlights,
      totals: {
        acceptedConnections: validConnections.size,
        completedSessions: completedSessions.size,
        validReports: countedReportRecords.size,
      },
      awards: [],
      history: [],
      awardsAvailable: false,
      awardsMessage: 'Chưa có danh hiệu được công bố trong kỳ này. Base hiện chưa có nguồn dữ liệu chính thức cho loại danh hiệu, kỳ xét và trạng thái công bố.',
      scoresIncluded: false,
      scoresMessage: 'Không cộng điểm T08_Score_Ledger vào Vinh danh; bảng này thuộc quy tắc tính/xếp hạng riêng của Đại hội.',
    };
  }

  async function getOverview({ forceFresh = false } = {}) {
    if (forceFresh) {
      cachedOverview = null;
      cacheExpiresAt = 0;
    }
    if (!forceFresh && cachedOverview && Date.now() < cacheExpiresAt) {
      return structuredClone(cachedOverview);
    }
    if (inFlight) return inFlight.then((data) => structuredClone(data));

    inFlight = buildOverview();
    try {
      const data = await inFlight;
      const ttl = Number.isFinite(config.cacheTtlMs) && config.cacheTtlMs > 0 ? config.cacheTtlMs : 0;
      cachedOverview = ttl ? data : null;
      cacheExpiresAt = ttl ? Date.now() + ttl : 0;
      return structuredClone(data);
    } finally {
      inFlight = null;
    }
  }

  function invalidateCache() {
    cachedOverview = null;
    cacheExpiresAt = 0;
  }

  return { getOverview, invalidateCache };
}
