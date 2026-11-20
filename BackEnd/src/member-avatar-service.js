import { attachmentItems, textValue } from './mappers.js';
import { LarkError } from './lark-client.js';

/**
 * Read-only service. Does not expose file_token/record_id and does not authorize requests.
 * Call it from an HTTP route AFTER existing session / internal-test-key checks.
 */
export function createMemberAvatarService({ lark, memberTableId, membersRaw }) {
  if (!lark || !memberTableId || typeof membersRaw !== 'function') {
    throw new TypeError('Member avatar service requires Lark client, table ID and membersRaw()');
  }
  let fieldIdPromise = null;
  async function getFieldId() {
    if (!fieldIdPromise) {
      fieldIdPromise = lark.listFields(memberTableId)
        .then((fields) => {
          const field = fields.find((f) => f.field_name === 'AVATAR');
          if (!field?.field_id) throw new LarkError('AVATAR field metadata not found');
          return field.field_id;
        })
        .catch((err) => { fieldIdPromise = null; throw err; });
    }
    return fieldIdPromise;
  }

  return {
    async getImageByMemberId(memberId) {
      if (typeof memberId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(memberId)) return null;
      const records = await membersRaw();
      const record = records.find((row) => textValue(row.fields?.Member_ID) === memberId);
      if (!record?.record_id) return null;
      const items = attachmentItems(record.fields?.AVATAR);
      const attachment = items.find((item) => typeof item?.file_token === 'string');
      if (!attachment) return null;
      const fieldId = await getFieldId();
      // Tăng giới hạn lên 8 MiB để hỗ trợ avatar thành viên chất lượng cao
      return lark.downloadBitableImage({
        tableId: memberTableId,
        fieldId,
        recordId: record.record_id,
        fileToken: attachment.file_token,
      }, 8 * 1024 * 1024);
    },
  };
}

