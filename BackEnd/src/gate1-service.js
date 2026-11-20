import { attachmentItems, isOfficialVillage, linkedRecordIds, mapVillage, textValue } from './mappers.js';

const DEFAULT_GATE1_TABLE_ID = 'tblAhZ3kFMakyRTw';
const GATE1_RECORD_TYPE = '✅ Gate 1 Confirmation';
const GATE1_STATUSES = [
  '⚪ Chưa nộp',
  '🟡 Đang kiểm tra',
  '🟠 Cần bổ sung',
  '🔵 Hợp lệ',
  '🟢 Đạt Gate 1',
  '🔴 Chưa đạt Gate 1',
];

function serviceError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function assertField(fields, name, type, linkedTableId = null) {
  const field = fields.find((item) => item.field_name === name);
  if (!field || field.type !== type) {
    throw serviceError(`Lark schema mismatch for field "${name}".`);
  }
  if (linkedTableId && field.property?.table_id !== linkedTableId) {
    throw serviceError(`Lark linked-record field "${name}" points to an unexpected table.`);
  }
  return field;
}

function assertOptions(field, expected, label) {
  const options = (field.property?.options || []).map((option) => option.name);
  if (!expected.every((option) => options.includes(option))) {
    throw serviceError(`Lark schema mismatch for ${label} options.`);
  }
}

function hasValue(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    if ('value' in value) return hasValue(value.value);
    return Object.keys(value).length > 0;
  }
  return true;
}

function linkedIds(value) {
  if (value && !Array.isArray(value) && typeof value === 'object' && 'value' in value) {
    return linkedRecordIds(value.value);
  }
  return linkedRecordIds(value);
}

function countEvidence(fields) {
  return linkedIds(fields.Evidence_Records).length
    + attachmentItems(fields.Evidence_Attachment).length
    + (hasValue(fields.Evidence_Link) ? 1 : 0);
}

export function createGate1Service({ lark, config, getVillageRecords, getGate1Records }) {
  const gate1TableId = config?.gate1TableId || DEFAULT_GATE1_TABLE_ID;
  if (!lark || !config?.villageTableId || typeof getVillageRecords !== 'function'
    || typeof getGate1Records !== 'function') {
    throw new TypeError('Gate1Service requires lark, config, and village/Gate 1 record fetchers');
  }

  let schemaPromise = null;

  async function getSchema() {
    if (!schemaPromise) {
      schemaPromise = (async () => {
        const fields = await lark.listFields(gate1TableId);
        assertField(fields, 'Recipient_Village', 18, config.villageTableId);
        assertField(fields, 'Supporting_Village', 18, config.villageTableId);
        const status = assertField(fields, 'Gate1_Status', 3);
        assertOptions(status, GATE1_STATUSES, 'Gate1_Status');
        const recordType = assertField(fields, 'Record_Type', 3);
        assertOptions(recordType, [GATE1_RECORD_TYPE], 'Record_Type');
        assertField(fields, 'Value_Received', 1);
        assertField(fields, 'Observed_Change', 1);
        assertField(fields, 'Recipient_Confirmation', 3);
        assertField(fields, 'BTC_Verification', 3);
        assertField(fields, 'Evidence_Records', 18);
        assertField(fields, 'Evidence_Link', 15);
        assertField(fields, 'Evidence_Attachment', 17);
      })().catch((error) => {
        schemaPromise = null;
        throw error;
      });
    }
    return schemaPromise;
  }

  async function getOverview({ forceFresh = false } = {}) {
    await getSchema();
    const [villageRecords, gateRecords] = await Promise.all([
      getVillageRecords(forceFresh),
      getGate1Records(forceFresh),
    ]);

    const villages = villageRecords
      .map((record) => ({ recordId: record.record_id, ...mapVillage(record) }))
      .filter((village) => village.recordId && village.id && village.name && isOfficialVillage(village));
    const villageByRecordId = new Map(villages.map((village) => [village.recordId, village]));
    const recordsByVillage = new Map();
    let unassignedRecordCount = 0;
    const gate1Records = [];

    for (const record of gateRecords) {
      const fields = record.fields || {};
      if (textValue(fields.Record_Type) !== GATE1_RECORD_TYPE) continue;
      gate1Records.push(record);
      const recipientIds = linkedIds(fields.Recipient_Village);
      const recipient = recipientIds.length === 1 ? villageByRecordId.get(recipientIds[0]) : null;
      if (!recipient) {
        unassignedRecordCount += 1;
        continue;
      }
      const records = recordsByVillage.get(recipient.id) || [];
      records.push(fields);
      recordsByVillage.set(recipient.id, records);
    }

    const items = villages.map((village) => {
      const records = recordsByVillage.get(village.id) || [];
      const fields = records.length === 1 ? records[0] : null;
      const supportingIds = fields ? linkedIds(fields.Supporting_Village) : [];
      const supportingVillage = supportingIds.length === 1
        ? villageByRecordId.get(supportingIds[0])
        : null;

      return {
        villageId: village.id,
        villageName: village.name,
        villageOffice: village.office,
        villageIconUrl: village.iconUrl,
        status: fields ? textValue(fields.Gate1_Status) : null,
        recordCount: records.length,
        ambiguous: records.length > 1,
        supportingVillageName: supportingVillage?.name || null,
        valueReceived: fields ? textValue(fields.Value_Received) : null,
        observedChange: fields ? textValue(fields.Observed_Change) : null,
        recipientConfirmation: fields ? textValue(fields.Recipient_Confirmation) : null,
        btcVerification: fields ? textValue(fields.BTC_Verification) : null,
        evidenceCount: fields ? countEvidence(fields) : 0,
      };
    });

    return {
      items,
      gateRecordCount: gate1Records.length,
      unassignedRecordCount,
      unclassifiedRecordCount: gateRecords.length - gate1Records.length,
    };
  }

  return { getOverview };
}
