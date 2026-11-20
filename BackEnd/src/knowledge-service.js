import { linkedRecordIds, numberValue, textValue } from './mappers.js';

const REPORT_FIELDS = {
  reporter: '👤 Người điền',
  submittedBy: 'Submitted_By',
  learned: 'Điều em đã học được',
  applied: 'Đã thử áp dụng?',
  topic: 'Tài sản tri thức có thể chia sẻ lại',
  share: 'Đồng ý chia sẻ bài học này ở chế độ nội bộ khi tổ chức có cơ chế phê duyệt.',
  outcome: 'Kết quả sau khi áp dụng',
  evidence: 'Link / minh chứng',
  learningSession: 'Learning_Session',
};

const SESSION_FIELDS = {
  connection: 'Connection',
  title: 'Learning_Title',
  startAt: 'Start_At',
  status: 'Session_Status',
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

function userIds(value) {
  const items = Array.isArray(value) ? value : value?.value;
  return Array.isArray(items)
    ? items.map((item) => item?.id).filter((id) => typeof id === 'string' && id)
    : [];
}

function dateValue(value) {
  const timestamp = numberValue(value);
  if (timestamp !== null) return timestamp;
  const raw = textValue(value);
  if (!raw) return null;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function safeEvidenceUrl(value) {
  let raw = value;
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'value' in raw) raw = raw.value;
  if (Array.isArray(raw)) raw = raw[0];
  if (raw && typeof raw === 'object') raw = raw.link || raw.text;
  if (typeof raw !== 'string' || !raw.trim()) return null;

  try {
    const url = new URL(raw.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function createKnowledgeService({ lark, config, membersRaw }) {
  if (!lark || !config || typeof membersRaw !== 'function') {
    throw new TypeError('KnowledgeService requires lark, config, and membersRaw');
  }

  let schemaPromise = null;

  function assertField(fields, name, type, linkedTableId = null) {
    const field = fields.find((item) => item.field_name === name);
    if (!field || field.type !== type) {
      throw serviceError(`Lark schema mismatch for field "${name}".`, 500);
    }
    if (linkedTableId && field.property?.table_id !== linkedTableId) {
      throw serviceError(`Lark linked-record field "${name}" points to an unexpected table.`, 500);
    }
    return field;
  }

  async function getSchema() {
    if (!schemaPromise) {
      schemaPromise = (async () => {
        const [reports, sessions, connections, members] = await Promise.all([
          lark.listFields(config.resultTableId),
          lark.listFields(config.learningSessionTableId),
          lark.listFields(config.connectionTableId),
          lark.listFields(config.memberTableId),
        ]);
        assertField(reports, REPORT_FIELDS.reporter, 11);
        assertField(reports, REPORT_FIELDS.submittedBy, 11);
        assertField(reports, REPORT_FIELDS.learned, 1);
        const applied = assertField(reports, REPORT_FIELDS.applied, 3);
        assertField(reports, REPORT_FIELDS.topic, 1);
        assertField(reports, REPORT_FIELDS.share, 7);
        assertField(reports, REPORT_FIELDS.outcome, 1);
        assertField(reports, REPORT_FIELDS.evidence, 15);
        assertField(reports, REPORT_FIELDS.learningSession, 18, config.learningSessionTableId);
        assertField(sessions, SESSION_FIELDS.connection, 18, config.connectionTableId);
        assertField(sessions, SESSION_FIELDS.title, 1);
        assertField(sessions, SESSION_FIELDS.startAt, 5);
        const status = assertField(sessions, SESSION_FIELDS.status, 3);
        assertField(connections, 'Connection_Type', 3);
        assertField(members, 'Display_Name', 20);
        assertField(members, 'Lark_User', 11);

        const statusOptions = (status.property?.options || []).map((option) => option.name);
        if (!statusOptions.includes('Completed')) {
          throw serviceError('Lark schema mismatch for Session_Status options.', 500);
        }
        return {
          appliedOptions: (applied.property?.options || []).map((option) => option.name),
          completedStatus: 'Completed',
        };
      })().catch((error) => {
        schemaPromise = null;
        throw error;
      });
    }
    return schemaPromise;
  }

  async function listKnowledge() {
    const schema = await getSchema();
    const [reports, sessions, connections, memberRecords] = await Promise.all([
      lark.searchAll(config.resultTableId),
      lark.searchAll(config.learningSessionTableId),
      lark.searchAll(config.connectionTableId),
      membersRaw(),
    ]);

    const sessionsById = new Map(sessions.map((record) => [record.record_id, record]));
    const connectionsById = new Map(connections.map((record) => [record.record_id, record]));
    const membersByOpenId = new Map();
    for (const member of memberRecords) {
      const name = textValue(member.fields?.Display_Name);
      if (!name) continue;
      for (const openId of userIds(member.fields?.Lark_User)) {
        membersByOpenId.set(openId, name);
      }
    }

    const diagnostics = {
      sharedWithoutLearningSession: 0,
      sharedWithAmbiguousLearningSession: 0,
      sharedWithMissingLearningSession: 0,
      sharedSessionNotCompleted: 0,
      sharedMissingTopic: 0,
      sharedMissingTitle: 0,
    };
    const items = [];
    for (const report of reports) {
      const fields = report.fields || {};
      if (fieldValue(fields, REPORT_FIELDS.share) !== true) continue;

      const linkedSessionIds = linkedRecordIds(fields[REPORT_FIELDS.learningSession]);
      if (linkedSessionIds.length === 0) {
        diagnostics.sharedWithoutLearningSession += 1;
        continue;
      }
      if (linkedSessionIds.length !== 1) {
        diagnostics.sharedWithAmbiguousLearningSession += 1;
        continue;
      }
      const session = sessionsById.get(linkedSessionIds[0]);
      if (!session) {
        diagnostics.sharedWithMissingLearningSession += 1;
        continue;
      }
      if (textValue(session.fields?.[SESSION_FIELDS.status]) !== schema.completedStatus) {
        diagnostics.sharedSessionNotCompleted += 1;
        continue;
      }

      const topic = textValue(fields[REPORT_FIELDS.topic])?.trim() || '';
      if (!topic) {
        diagnostics.sharedMissingTopic += 1;
        continue;
      }
      const title = textValue(session.fields?.[SESSION_FIELDS.title])?.trim() || '';
      if (!title) {
        diagnostics.sharedMissingTitle += 1;
        continue;
      }

      const sessionConnectionId = linkedRecordIds(session.fields?.[SESSION_FIELDS.connection])[0];
      const connection = sessionConnectionId ? connectionsById.get(sessionConnectionId) : null;
      const rawConnectionType = textValue(connection?.fields?.Connection_Type);
      const connectionType = rawConnectionType === 'Làng'
        ? 'village'
        : rawConnectionType === 'Cá nhân'
          ? 'personal'
          : 'unknown';
      const reporterIds = [
        ...userIds(fields[REPORT_FIELDS.submittedBy]),
        ...userIds(fields[REPORT_FIELDS.reporter]),
      ];
      const applied = textValue(fields[REPORT_FIELDS.applied]) || '';

      items.push({
        id: report.record_id,
        title,
        startAt: dateValue(session.fields?.[SESSION_FIELDS.startAt]),
        connectionType,
        topic,
        learned: textValue(fields[REPORT_FIELDS.learned]) || '',
        applied,
        isApplied: schema.appliedOptions.find((option) => /đã áp dụng/i.test(option)) === applied,
        outcome: textValue(fields[REPORT_FIELDS.outcome]) || '',
        evidenceUrl: safeEvidenceUrl(fieldValue(fields, REPORT_FIELDS.evidence)),
        authorName: reporterIds.map((id) => membersByOpenId.get(id)).find(Boolean) || null,
      });
    }

    items.sort((a, b) => (b.startAt ?? 0) - (a.startAt ?? 0));
    return { items, diagnostics };
  }

  async function getKnowledge(id) {
    const { items } = await listKnowledge();
    const item = items.find((entry) => entry.id === id);
    if (!item) throw serviceError('Không tìm thấy bài học đã chia sẻ.', 404);
    return item;
  }

  return { listKnowledge, getKnowledge };
}
