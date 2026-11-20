import { attachmentItems, textValue } from './mappers.js';
import { LarkError } from './lark-client.js';

/**
 * Read-only service. Does not expose file_token/record_id and does not authorize requests.
 * Call it from an HTTP route AFTER existing session / internal-test-key checks.
 */
export function createVillageIconService({ lark, villageTableId, villagesRaw }) {
  if (!lark || !villageTableId || typeof villagesRaw !== 'function') {
    throw new TypeError('Village icon service requires Lark client, table ID and villagesRaw()');
  }
  let fieldIdPromise = null;
  async function getFieldId() {
    if (!fieldIdPromise) {
      fieldIdPromise = lark.listFields(villageTableId)
        .then((fields) => {
          const field = fields.find((f) => f.field_name === 'Color/Icon');
          if (!field?.field_id) throw new LarkError('Color/Icon field metadata not found');
          return field.field_id;
        })
        .catch((err) => { fieldIdPromise = null; throw err; });
    }
    return fieldIdPromise;
  }

  return {
    async getImageByVillageId(villageId) {
      // The ID comes from a URL. Reject unexpected characters, then look up an existing record.
      if (typeof villageId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(villageId)) return null;
      const records = await villagesRaw();
      const record = records.find((row) => textValue(row.fields?.Village_ID) === villageId);
      if (!record?.record_id) return null;
      const items = attachmentItems(record.fields?.['Color/Icon']);
      const attachment = items.find((item) => typeof item?.file_token === 'string');
      if (!attachment) return null;
      const fieldId = await getFieldId();
      // Tăng giới hạn lên 8 MiB để hỗ trợ logo làng chất lượng cao
      return lark.downloadBitableImage({
        tableId: villageTableId,
        fieldId,
        recordId: record.record_id,
        fileToken: attachment.file_token,
      }, 8 * 1024 * 1024);
    },
  };
}
