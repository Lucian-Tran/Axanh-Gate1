// Lark Base fields may be simple values, arrays, or formula/lookup
// wrappers such as {type: 11, value: [{name: '...', id: '...'}]}.
function inner(value) {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) {
    return value.value;
  }
  return value;
}

export function first(value) {
  const unwrapped = inner(value);
  return Array.isArray(unwrapped) ? unwrapped[0] : unwrapped;
}

export function textValue(value) {
  const v = first(value);
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') return v.text ?? v.en_name ?? v.name ?? null;
  return null;
}

export function numberValue(value) {
  const v = first(value);
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

export function linkedRecordIds(value) {
  if (Array.isArray(value)) {
    return value.map((x) => (typeof x === 'string' ? x : x?.record_id || x?.id)).filter(Boolean);
  }
  if (value && typeof value === 'object' && Array.isArray(value.link_record_ids)) {
    return value.link_record_ids;
  }
  return [];
}

export function personName(value) {
  return textValue(value);
}

export function attachmentItems(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.value)) return value.value;
  return [];
}

export function mapVillage(record) {
  const f = record.fields ?? {};
  const leaders = Array.isArray(f.Leader) ? f.Leader : (f.Leader?.value ?? []);
  const leaderOpenId = (Array.isArray(leaders) && leaders[0]?.id) ? leaders[0].id : null;
  return {
    id: textValue(f.Village_ID),
    name: textValue(f.Village_Name),
    slogan: textValue(f.Slogan),
    office: textValue(f.Office),
    leader: personName(f.Leader),
    leaderOpenId,
    deputy: personName(f.Deputy),
    memberCount: numberValue(f['SL member']),
    totalScore: numberValue(f.Total_Score),
    gate1Status: textValue(f.Gate1_Status),
    gate1Passed: numberValue(f.Gate1_PASS_Count),
    gate1Total: numberValue(f.Gate1_TOTAL_Count),
    status: textValue(f.Status),
    hasIconAttachment: attachmentItems(f['Color/Icon']).some((item) => typeof item?.file_token === 'string'),
    iconUrl: attachmentItems(f['Color/Icon']).some((item) => typeof item?.file_token === 'string') && textValue(f.Village_ID)
      ? `/api/v1/villages/${encodeURIComponent(textValue(f.Village_ID))}/icon`
      : null,
  };
}

export function mapMember(record, villageByRecordId = new Map()) {
  const f = record.fields ?? {};
  const villageRecordId = linkedRecordIds(f.Village)[0] ?? null;
  const village = villageByRecordId.get(villageRecordId) ?? null;
  const memberId = textValue(f.Member_ID);
  const hasAvatar = attachmentItems(f.AVATAR).some((item) => typeof item?.file_token === 'string');
  const larkUsers = Array.isArray(f.Lark_User) ? f.Lark_User : (f.Lark_User?.value ?? []);
  const larkOpenId = (Array.isArray(larkUsers) && larkUsers[0]?.id) ? larkUsers[0].id : null;

  return {
    id: memberId,
    name: personName(f.Display_Name) ?? personName(f.Lark_User),
    villageId: village?.id ?? null,
    villageName: village?.name ?? null,
    office: textValue(f.Office),
    programRole: textValue(f.Program_Role),
    // Missing checkbox is not equivalent to false. Preserve unknown states.
    active: typeof f['Active✅'] === 'boolean' ? f['Active✅'] : null,
    hasAvatar,
    avatarUrl: hasAvatar && memberId
      ? `/api/v1/members/${encodeURIComponent(memberId)}/avatar`
      : null,
    larkOpenId,
    offer: null,
    offerTags: [],
    need: null,
    needTags: [],
    availability: [],
  };
}

export function buildVillageIndex(villageRecords) {
  return new Map(villageRecords.map((record) => [record.record_id, mapVillage(record)]));
}

export function extractLoginEmail(record) {
  const f = record?.fields ?? {};
  const raw = f.Login_Email ?? f.Email ?? f.login_email ?? null;
  if (!raw) return null;
  let text = '';
  if (typeof raw === 'string') {
    text = raw;
  } else if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.value)) {
      text = raw.value.map((x) => x?.text ?? x?.link ?? (typeof x === 'string' ? x : '')).join('');
    } else if (Array.isArray(raw)) {
      text = raw.map((x) => x?.text ?? x?.link ?? (typeof x === 'string' ? x : '')).join('');
    } else if (typeof raw.text === 'string') {
      text = raw.text;
    } else if (typeof raw.link === 'string') {
      text = raw.link;
    }
  }
  // Remove accidental url scheme if lark stored as url text
  text = text.replace(/^https?:\/\//i, '').trim().toLowerCase();
  // Basic sanity check for email format
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return text;
  }
  return null;
}

export function mapBooth(record, membersByName = new Map(), villagesByName = new Map()) {
  const f = record?.fields ?? {};
  const authorName = textValue(f['Tên của bạn']);
  const member = authorName
    ? membersByName.get(authorName) || membersByName.get(authorName.replace(/\s*\(.*?\)/, ''))
    : null;

  const rawVillage = f['Bạn thuộc Làng nào?'];
  let villageName = textValue(rawVillage);
  if (!villageName && member) {
    villageName = member.villageName;
  }

  const rawBoothType = textValue(f.Booth_Type);
  const isVillage = rawBoothType === 'Làng' || rawBoothType === 'village';
  const boothType = isVillage ? 'village' : 'personal';

  const villageId = member?.villageId
    || (villageName ? (villagesByName.get(villageName)?.id || villagesByName.get(villageName.toLowerCase())?.id) : null)
    || null;
  const villageIconUrl = villageId ? `/api/v1/villages/${encodeURIComponent(villageId)}/icon` : null;

  const consent = f['Bạn đồng ý cho hiển thị thông tin về kỹ năng và nhu cầu trong phạm vi bản demo nội bộ này.'] === true;

  const offer = textValue(f['Điều bạn có thể chia sẻ']) || '';
  const offerTag = textValue(f['Chủ đề chia sẻ']) || '';
  const need = textValue(f['Điều em muốn học']) || '';
  const needTag = textValue(f['Chủ đề bạn muốn học']) || '';
  const preferredFormat = textValue(f['Hình thức mà bạn mong muốn?']) || '';
  const availability = numberValue(f['Khung giờ ưu tiên']);
  const outcome = textValue(f['Kết quả mong muốn sau buổi hỗ trợ']) || '';
  const createdAt = numberValue(f['Ngày tạo']);

  return {
    recordId: record?.record_id,
    boothId: textValue(f.Booth_ID) || 'KN-????',
    boothType,
    rawBoothType: rawBoothType || 'Cá nhân',
    authorName: authorName || 'Thành viên',
    authorMemberId: member?.id || null,
    authorAvatarUrl: member?.avatarUrl || null,
    authorOffice: member?.office || '',
    authorVillageName: villageName || member?.villageName || 'Chưa xác định',
    authorVillageId: villageId,
    villageId,
    villageName: villageName || member?.villageName || 'Chưa xác định',
    villageIconUrl,
    createdByMemberId: member?.id || null,
    createdByName: authorName || 'Thành viên',
    offer,
    offerTag,
    offerTags: offerTag ? [offerTag] : [],
    offerTopic: offerTag,
    need,
    needTag,
    needTags: needTag ? [needTag] : [],
    needTopic: needTag,
    preferredFormat,
    availability,
    outcome,
    consent,
    createdAt: createdAt ? new Date(createdAt).toISOString() : null,
  };
}

export function isOfficialVillage(v) {
  if (!v) return false;
  // If Status is explicitly specified, must be 'Active'
  if (typeof v.status === 'string' && v.status.trim()) {
    return v.status.trim().toLowerCase() === 'active';
  }
  // Exclude VIL-0014 and Làng AXANH
  const id = String(v.id || '').toUpperCase();
  const name = String(v.name || '').toLowerCase();
  if (id === 'VIL-0014' || name.includes('làng axanh') || name.includes('lang axanh')) {
    return false;
  }
  return true;
}

export function isOfficialMember(m, officialVillageIds = null) {
  if (!m) return false;
  if (officialVillageIds && m.villageId && !officialVillageIds.has(m.villageId)) {
    return false;
  }
  const vName = String(m.villageName || '').toLowerCase();
  const vId = String(m.villageId || '').toUpperCase();
  if (vName.includes('làng axanh') || vName.includes('lang axanh') || vId === 'VIL-0014') {
    return false;
  }
  return true;
}

export function mapConnection(record, boothsByRecordId = new Map(), membersById = new Map(), villagesById = new Map()) {
  const f = record.fields ?? {};
  const sourceBoothRecId = linkedRecordIds(f.Source_Booth)[0] ?? null;
  const targetBoothRecId = linkedRecordIds(f.Target_Booth)[0] ?? null;
  const sourceBooth = sourceBoothRecId ? (boothsByRecordId.get(sourceBoothRecId) ?? null) : null;
  const targetBooth = targetBoothRecId ? (boothsByRecordId.get(targetBoothRecId) ?? null) : null;

  const rawType = textValue(f.Connection_Type);
  const type = (rawType === 'Làng' || rawType === 'village') ? 'village' : 'personal';
  const status = textValue(f.Connection_Status) || 'Pending';
  const requestedBy = textValue(f.Requested_By);
  const targetMemberId = textValue(f.Target_Member_ID) || targetBooth?.authorMemberId || null;
  const targetVillageId = textValue(f.Target_Village_ID) || targetBooth?.villageId || null;
  const approverMemberId = textValue(f.Approver_Member_ID);
  const respondedBy = textValue(f.Responded_By);

  const requesterMember = requestedBy ? membersById.get(requestedBy) : null;
  const targetMember = targetMemberId ? membersById.get(targetMemberId) : null;
  const approverMember = approverMemberId ? membersById.get(approverMemberId) : null;

  const sourceVillageId = sourceBooth?.villageId || requesterMember?.villageId || null;
  const sourceVillage = sourceVillageId ? villagesById.get(sourceVillageId) : null;
  const targetVillage = targetVillageId ? villagesById.get(targetVillageId) : null;

  const createdAt = numberValue(f.Created_At);
  const respondedAt = numberValue(f.Responded_At);

  return {
    id: record.record_id,
    recordId: record.record_id,
    connectionId: textValue(f.Connection_ID) || record.record_id,
    connectionType: type,
    rawType,
    status,
    sourceBoothRecordId: sourceBoothRecId,
    targetBoothRecordId: targetBoothRecId,
    requestedBy,
    targetMemberId,
    sourceVillageId,
    targetVillageId,
    approverMemberId,
    respondedBy,
    createdAt: createdAt ? new Date(createdAt).toISOString() : null,
    respondedAt: respondedAt ? new Date(respondedAt).toISOString() : null,

    // Enriched display properties
    topic: sourceBooth?.need || sourceBooth?.needTopic || targetBooth?.offer || targetBooth?.offerTopic || 'Trao đổi tri thức',
    seekerName: requesterMember?.name || sourceBooth?.authorName || requestedBy,
    seekerAvatarUrl: requesterMember?.avatarUrl || sourceBooth?.authorAvatarUrl || null,
    seekerVillageName: sourceVillage?.name || sourceBooth?.villageName || requesterMember?.villageName || null,
    seekerVillageId: sourceVillageId,

    targetName: (type === 'village') ? (targetVillage?.name || targetVillageId) : (targetMember?.name || targetBooth?.authorName || targetMemberId),
    targetAvatarUrl: (type === 'village') ? (targetVillage?.iconUrl || null) : (targetMember?.avatarUrl || targetBooth?.authorAvatarUrl || null),
    targetVillageName: targetVillage?.name || targetBooth?.villageName || targetMember?.villageName || null,

    sourceBooth: sourceBooth ? {
      boothId: sourceBooth.boothId,
      recordId: sourceBooth.recordId,
      authorName: sourceBooth.authorName,
      authorMemberId: sourceBooth.authorMemberId,
      authorAvatarUrl: sourceBooth.authorAvatarUrl,
      authorVillageName: sourceBooth.authorVillageName || sourceBooth.villageName,
      authorOffice: sourceBooth.authorOffice,
      villageId: sourceBooth.villageId,
      villageName: sourceBooth.villageName,
      offer: sourceBooth.offer,
      offerTopic: sourceBooth.offerTopic,
      need: sourceBooth.need,
      needTopic: sourceBooth.needTopic,
    } : null,
    targetBooth: targetBooth ? {
      boothId: targetBooth.boothId,
      recordId: targetBooth.recordId,
      authorName: targetBooth.authorName,
      authorMemberId: targetBooth.authorMemberId,
      authorAvatarUrl: targetBooth.authorAvatarUrl,
      authorVillageName: targetBooth.authorVillageName || targetBooth.villageName,
      authorOffice: targetBooth.authorOffice,
      villageId: targetBooth.villageId,
      villageName: targetBooth.villageName,
      offer: targetBooth.offer,
      offerTopic: targetBooth.offerTopic,
      need: targetBooth.need,
      needTopic: targetBooth.needTopic,
    } : null,
  };
}
