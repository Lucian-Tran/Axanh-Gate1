import { LarkError } from './lark-client.js';
import { mapConnection, mapVillage, mapMember, mapBooth, isOfficialVillage, isOfficialMember, textValue } from './mappers.js';

function getUserId(user) {
  if (!user) return null;
  return user.memberId || user.id || null;
}

export function createConnectionService({
  lark,
  config,
  boothsRaw,
  villagesRaw,
  membersRaw,
  authStore,
}) {
  if (!lark || !config || typeof boothsRaw !== 'function' || typeof villagesRaw !== 'function' || typeof membersRaw !== 'function') {
    throw new TypeError('ConnectionService requires lark, config, and data fetchers');
  }

  // Active promise locks to prevent race conditions & duplicate submits in-flight
  const inFlightLocks = new Map();

  async function withLock(key, fn) {
    while (inFlightLocks.has(key)) {
      await inFlightLocks.get(key);
    }
    let resolveLock;
    const promise = new Promise((resolve) => { resolveLock = resolve; });
    inFlightLocks.set(key, promise);
    try {
      return await fn();
    } finally {
      inFlightLocks.delete(key);
      resolveLock();
    }
  }

  // Short TTL cache for connection records
  let cachedConnections = null;
  let cacheExpiresAt = 0;
  const CACHE_TTL_MS = 2000; // 2 seconds to allow snappy polling without spamming Lark

  // Short-lived idempotency cache for create retries after network timeout
  const recentIdempotency = new Map();
  const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;

  function pruneIdempotency() {
    const now = Date.now();
    for (const [k, v] of recentIdempotency.entries()) {
      if (!v || now >= v.expiresAt) recentIdempotency.delete(k);
    }
  }

  async function getConnectionsRaw(forceFresh = false) {
    const now = Date.now();
    if (!forceFresh && cachedConnections && now < cacheExpiresAt) {
      return cachedConnections;
    }
    const recs = await lark.searchAll(config.connectionTableId);
    cachedConnections = recs;
    cacheExpiresAt = now + CACHE_TTL_MS;
    return recs;
  }

  function invalidateCache() {
    cachedConnections = null;
    cacheExpiresAt = 0;
  }

  async function getLookupContext() {
    const [bRaw, vRaw, mRaw] = await Promise.all([
      boothsRaw(),
      villagesRaw(),
      membersRaw(),
    ]);

    const villages = vRaw.map((v) => mapVillage(v));
    const villagesById = new Map(villages.map((v) => [v.id, v]));
    const officialVillages = villages.filter(isOfficialVillage);
    const officialVillageIds = new Set(officialVillages.map((v) => v.id));

    const villageByRecordId = new Map(vRaw.map((v) => [v.record_id, mapVillage(v)]));
    const allMembers = mRaw.map((m) => mapMember(m, villageByRecordId));
    const members = allMembers.filter((m) => isOfficialMember(m, officialVillageIds));
    const membersById = new Map(allMembers.map((m) => [m.id, m]));

    const villagesByName = new Map();
    for (const v of villages) {
      if (v.name) {
        villagesByName.set(v.name, v);
        villagesByName.set(v.name.toLowerCase(), v);
      }
    }
    const membersByName = new Map();
    for (const m of allMembers) {
      if (m.name) {
        membersByName.set(m.name, m);
        const clean = m.name.replace(/\s*\(.*?\)/, '').trim();
        if (clean && !membersByName.has(clean)) {
          membersByName.set(clean, m);
        }
      }
    }
    const allBooths = bRaw.map((b) => mapBooth(b, membersByName, villagesByName));
    const boothsByRecordId = new Map(allBooths.map((b) => [b.recordId, b]));
    const boothsById = new Map(allBooths.map((b) => [b.boothId, b]));

    return {
      allBooths,
      boothsByRecordId,
      boothsById,
      villages,
      villagesById,
      officialVillageIds,
      allMembers,
      membersById,
    };
  }

  function resolveVillageLeaderMemberId(villageId, villages, members) {
    if (!villageId) return null;
    const v = villages.find((item) => item.id === villageId || item.name === villageId);
    if (!v) return null;

    if (v.leaderOpenId) {
      const matchByOpenId = members.find((m) => m.larkOpenId === v.leaderOpenId);
      if (matchByOpenId?.id) return matchByOpenId.id;
    }
    if (v.leader) {
      const cleanName = v.leader.trim().toLowerCase();
      const matchByName = members.find((m) => m.name && m.name.trim().toLowerCase() === cleanName);
      if (matchByName?.id) return matchByName.id;
    }
    return null;
  }

  function isSameConnectionPair(c, {
    normalizedType,
    sourceBooth,
    targetBooth,
    sourceOwnerId,
    targetMemberId,
    sourceVilId,
    targetVilId,
  }) {
    if (c.sourceBoothRecordId === sourceBooth.recordId && c.targetBoothRecordId === targetBooth.recordId) return true;
    if (c.sourceBoothRecordId === targetBooth.recordId && c.targetBoothRecordId === sourceBooth.recordId) return true;
    if (normalizedType === 'personal' && c.connectionType === 'personal') {
      const cA = c.sourceBooth?.authorMemberId || c.requestedBy;
      const cB = c.targetMemberId || c.targetBooth?.authorMemberId;
      if (cA && cB && sourceOwnerId && targetMemberId) {
        if ((cA === sourceOwnerId && cB === targetMemberId) || (cA === targetMemberId && cB === sourceOwnerId)) {
          return true;
        }
      }
    }
    if (normalizedType === 'village' && c.connectionType === 'village') {
      const cVilA = c.sourceVillageId || c.sourceBooth?.villageId;
      const cVilB = c.targetVillageId || c.targetBooth?.villageId;
      if (cVilA && cVilB && sourceVilId && targetVilId) {
        if ((cVilA === sourceVilId && cVilB === targetVilId) || (cVilA === targetVilId && cVilB === sourceVilId)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 1. CREATE DIRECT CONNECTION (IMMEDIATELY ACCEPTED)
   * POST /api/v1/connections
   */
  async function createConnection({
    sessionUser,
    isAdmin = false,
    sourceBoothId,
    targetBoothId,
    connectionType = 'personal',
    idempotencyKey = null,
  }) {
    const userId = getUserId(sessionUser);
    if (!sessionUser || !userId) {
      const err = new Error('Yêu cầu xác thực tài khoản.');
      err.statusCode = 401;
      throw err;
    }

    if (!sourceBoothId || !targetBoothId) {
      const err = new Error('Thiếu thông tin gian hàng nguồn (sourceBoothId) hoặc gian hàng đích (targetBoothId).');
      err.statusCode = 400;
      throw err;
    }

    const normalizedType = (connectionType === 'village' || connectionType === 'Làng') ? 'village' : 'personal';

    const ctx = await getLookupContext();
    const sourceBooth = ctx.boothsById.get(sourceBoothId) || ctx.boothsByRecordId.get(sourceBoothId);
    const targetBooth = ctx.boothsById.get(targetBoothId) || ctx.boothsByRecordId.get(targetBoothId);

    if (!sourceBooth) {
      const err = new Error('Gian hàng nguồn không tồn tại hoặc đã bị xóa.');
      err.statusCode = 404;
      throw err;
    }
    if (!targetBooth) {
      const err = new Error('Gian hàng đích không tồn tại hoặc đã bị xóa.');
      err.statusCode = 404;
      throw err;
    }

    // Ownership & validity checks
    let approverMemberId = null;
    let targetMemberId = null;
    let sourceOwnerId = null;
    let sourceVilId = null;
    let targetVilId = null;

    if (normalizedType === 'personal') {
      if (sourceBooth.boothType !== 'personal' || targetBooth.boothType !== 'personal') {
        const err = new Error('Cả hai gian hàng phải là Gian hàng Cá nhân khi tạo kết nối Cá nhân.');
        err.statusCode = 400;
        throw err;
      }
      const isSourceOwner = (sourceBooth.authorMemberId && sourceBooth.authorMemberId === userId) ||
        (!sourceBooth.authorMemberId && Boolean(authStore?.isBoothOwner(sourceBooth.recordId, userId, sessionUser.name)));
      if (!isAdmin && !isSourceOwner) {
        const err = new Error('Bạn chỉ có thể kết nối từ gian hàng cá nhân của chính mình.');
        err.statusCode = 403;
        throw err;
      }
      sourceOwnerId = sourceBooth.authorMemberId || userId;
      targetMemberId = targetBooth.authorMemberId || null;

      if (!targetMemberId) {
        const err = new Error('Không thể xác định chủ gian hàng đích (Member_ID) để kết nối.');
        err.statusCode = 400;
        throw err;
      }
      if (targetMemberId === userId || targetMemberId === sourceOwnerId) {
        const err = new Error('Bạn không thể tự kết nối với chính mình.');
        err.statusCode = 400;
        throw err;
      }

      approverMemberId = targetMemberId;
    } else {
      // Village mode
      if (sourceBooth.boothType !== 'village' || targetBooth.boothType !== 'village') {
        const err = new Error('Cả hai gian hàng phải là Gian hàng Làng khi tạo kết nối Làng.');
        err.statusCode = 400;
        throw err;
      }

      sourceVilId = sourceBooth.villageId || (!isAdmin ? sessionUser.villageId : null);
      targetVilId = targetBooth.villageId;

      if (!sourceVilId) {
        const err = new Error('Gian hàng nguồn không có mã Làng xác định.');
        err.statusCode = 400;
        throw err;
      }
      if (!targetVilId) {
        const err = new Error('Gian hàng đích không có mã Làng xác định.');
        err.statusCode = 400;
        throw err;
      }

      if (!isAdmin && (!sessionUser.villageId || sourceVilId !== sessionUser.villageId)) {
        const err = new Error('Bạn chỉ có thể thực hiện kết nối cho Làng của mình.');
        err.statusCode = 403;
        throw err;
      }

      if (sourceVilId === targetVilId) {
        const err = new Error('Không thể kết nối giữa cùng một Làng.');
        err.statusCode = 400;
        throw err;
      }

      approverMemberId = resolveVillageLeaderMemberId(targetVilId, ctx.villages, ctx.allMembers);

      if (!approverMemberId) {
        const err = new Error(`Không xác định được Trưởng Làng hợp lệ cho ${targetBooth.villageName || targetVilId}. Vui lòng liên hệ ban tổ chức để cập nhật Leader.`);
        err.statusCode = 422;
        throw err;
      }
    }

    // Symmetric canonical lock key serializes A->B, B->A, double-clicks, and retries for the same pair
    const lockKey = normalizedType === 'personal'
      ? `create:personal:${[sourceOwnerId, targetMemberId].sort().join(':')}`
      : `create:village:${[sourceVilId, targetVilId].sort().join(':')}`;

    const cleanIdempKey = (typeof idempotencyKey === 'string' && idempotencyKey.trim())
      ? `${userId}:${idempotencyKey.trim()}`
      : null;

    return withLock(lockKey, async () => {
      pruneIdempotency();

      const existingRecords = await getConnectionsRaw(true);
      const mappedExisting = existingRecords.map((r) => mapConnection(r, ctx.boothsByRecordId, ctx.membersById, ctx.villagesById));
      const pairContext = {
        normalizedType,
        sourceBooth,
        targetBooth,
        sourceOwnerId,
        targetMemberId,
        sourceVilId,
        targetVilId,
      };

      // Idempotent retry hit: if the same request already succeeded and connection is active, return it cleanly
      if (cleanIdempKey && recentIdempotency.has(cleanIdempKey)) {
        const cachedEntry = recentIdempotency.get(cleanIdempKey);
        const stillActive = mappedExisting.find((c) => c.recordId === cachedEntry.recordId && c.status === 'Accepted');
        if (stillActive) {
          return { success: true, deduplicated: true, data: stillActive };
        }
      }

      // Check existing active (Accepted) connection in either direction
      const existingAccepted = mappedExisting.find((c) => c.status === 'Accepted' && isSameConnectionPair(c, pairContext));
      if (existingAccepted) {
        const err = new Error(normalizedType === 'village'
          ? 'Hai Làng đã kết nối với nhau trước đó.'
          : 'Hai thành viên đã kết nối với nhau trước đó.');
        err.statusCode = 409;
        err.code = 'ALREADY_CONNECTED';
        err.data = existingAccepted;
        throw err;
      }

      // Legacy Pending records for this exact pair are superseded when connecting directly under new flow
      const supersededPending = mappedExisting.filter((c) => c.status === 'Pending' && isSameConnectionPair(c, pairContext));

      const now = Date.now();
      const fieldsToCreate = {
        Connection_Type: normalizedType === 'village' ? 'Làng' : 'Cá nhân',
        Source_Booth: [sourceBooth.recordId],
        Target_Booth: [targetBooth.recordId],
        Requested_By: userId,
        Connection_Status: 'Accepted',
        Approver_Member_ID: approverMemberId,
        Created_At: now,
        Responded_At: now,
      };

      if (normalizedType === 'village') {
        fieldsToCreate.Target_Village_ID = targetVilId;
      } else {
        fieldsToCreate.Target_Member_ID = targetMemberId;
      }

      const created = await lark.createRecord(config.connectionTableId, fieldsToCreate);
      const createdRecordId = created?.record_id || created?.id;
      if (!createdRecordId) {
        const err = new Error('Lark Base không xác nhận đã tạo bản ghi kết nối.');
        err.statusCode = 502;
        throw err;
      }

      // Mark any superseded legacy Pending records for this pair as Cancelled (preserve history, never delete)
      for (const oldPending of supersededPending) {
        try {
          await lark.updateRecord(config.connectionTableId, oldPending.recordId, {
            Connection_Status: 'Cancelled',
            Responded_At: now,
          });
        } catch (supErr) {
          console.warn('[Connections] Non-fatal failure superseding legacy Pending record:', oldPending.recordId, supErr?.message);
        }
      }

      invalidateCache();

      const createdRecord = {
        record_id: createdRecordId,
        fields: {
          ...fieldsToCreate,
          Connection_ID: created.fields?.Connection_ID || `Connection-${now.toString().slice(-4)}`,
        },
      };

      const mapped = mapConnection(createdRecord, ctx.boothsByRecordId, ctx.membersById, ctx.villagesById);

      if (cleanIdempKey) {
        recentIdempotency.set(cleanIdempKey, {
          recordId: createdRecordId,
          expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
        });
      }

      return { success: true, data: mapped };
    });
  }

  /**
   * 2. LIST CONNECTIONS
   * GET /api/v1/connections/mine
   * GET /api/v1/connections/inbox
   */
  async function listConnections({
    sessionUser,
    isAdmin = false,
    scope = 'mine', // 'mine' | 'inbox' | 'all'
    status = null,
  }) {
    const userId = getUserId(sessionUser);
    if (!sessionUser || !userId) {
      const err = new Error('Yêu cầu xác thực tài khoản.');
      err.statusCode = 401;
      throw err;
    }

    const [rawRecords, ctx] = await Promise.all([
      getConnectionsRaw(),
      getLookupContext(),
    ]);

    const mapped = rawRecords.map((r) => mapConnection(r, ctx.boothsByRecordId, ctx.membersById, ctx.villagesById));

    let filtered = mapped;

    if (scope === 'inbox') {
      filtered = mapped.filter((c) => {
        if (c.status !== 'Pending') return false;
        // Personal: Approver is current user
        if (c.connectionType === 'personal') {
          return c.approverMemberId === userId || c.targetMemberId === userId;
        }
        // Village: Current user is the leader of the target village
        const targetLeaderId = resolveVillageLeaderMemberId(c.targetVillageId, ctx.villages, ctx.allMembers);
        return c.approverMemberId === userId || (targetLeaderId && targetLeaderId === userId);
      });
    } else if (scope === 'mine') {
      if (isAdmin) {
        // Admins can see all in mine view if desired, or all filtered
        filtered = mapped;
      } else {
        filtered = mapped.filter((c) => {
          // Requester
          if (c.requestedBy === userId) return true;
          // Target member / Approver
          if (c.targetMemberId === userId || c.approverMemberId === userId) return true;
          // Responded by
          if (c.respondedBy === userId) return true;
          // Village member of source or target village
          if (sessionUser.villageId) {
            if (c.sourceVillageId === sessionUser.villageId || c.targetVillageId === sessionUser.villageId) return true;
          }
          return false;
        });
      }
    } else if (scope === 'all') {
      if (!isAdmin) {
        const err = new Error('Chỉ Quản trị viên (Admin) mới có quyền xem toàn bộ kết nối.');
        err.statusCode = 403;
        throw err;
      }
      filtered = mapped;
    }

    if (status) {
      const normStatus = status.trim().toLowerCase();
      filtered = filtered.filter((c) => c.status && c.status.toLowerCase() === normStatus);
    }

    // Sort newest first
    filtered.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    return {
      count: filtered.length,
      items: filtered,
    };
  }

  /**
   * 3. GET CONNECTION BY ID
   * GET /api/v1/connections/:id
   */
  async function getConnectionById({ sessionUser, isAdmin = false, id }) {
    const userId = getUserId(sessionUser);
    if (!sessionUser || !userId) {
      const err = new Error('Yêu cầu xác thực tài khoản.');
      err.statusCode = 401;
      throw err;
    }

    const ctx = await getLookupContext();
    const rawRecords = await getConnectionsRaw();
    const record = rawRecords.find((r) => r.record_id === id || r.fields?.Connection_ID === id);

    if (!record) {
      const err = new Error('Không tìm thấy yêu cầu kết nối.');
      err.statusCode = 404;
      throw err;
    }

    const mapped = mapConnection(record, ctx.boothsByRecordId, ctx.membersById, ctx.villagesById);

    // Authorization
    if (!isAdmin) {
      const isRequester = mapped.requestedBy === userId;
      const isTarget = mapped.targetMemberId === userId || mapped.approverMemberId === userId;
      const isVillageParticipant = sessionUser.villageId && (mapped.sourceVillageId === sessionUser.villageId || mapped.targetVillageId === sessionUser.villageId);

      if (!isRequester && !isTarget && !isVillageParticipant) {
        const err = new Error('Bạn không có quyền xem thông tin kết nối này.');
        err.statusCode = 403;
        throw err;
      }
    }

    return mapped;
  }

  /**
   * 4. RESPOND TO CONNECTION (ACCEPT / REJECT)
   * POST /api/v1/connections/:id/respond
   */
  async function respondConnection({
    sessionUser,
    isAdmin = false,
    id,
    decision,
    note = '',
  }) {
    const userId = getUserId(sessionUser);
    if (!sessionUser || !userId) {
      const err = new Error('Yêu cầu xác thực tài khoản.');
      err.statusCode = 401;
      throw err;
    }

    const normDecision = decision === 'Accepted' || decision === 'accept' ? 'Accepted'
      : decision === 'Rejected' || decision === 'reject' ? 'Rejected'
      : null;

    if (!normDecision) {
      const err = new Error('Quyết định không hợp lệ. Phải là "Accepted" hoặc "Rejected".');
      err.statusCode = 400;
      throw err;
    }

    const lockKey = `respond:${id}`;

    return withLock(lockKey, async () => {
      const ctx = await getLookupContext();
      // Fresh lookup
      const rawRecords = await getConnectionsRaw(true);
      const record = rawRecords.find((r) => r.record_id === id || r.fields?.Connection_ID === id);

      if (!record) {
        const err = new Error('Không tìm thấy yêu cầu kết nối.');
        err.statusCode = 404;
        throw err;
      }

      const mapped = mapConnection(record, ctx.boothsByRecordId, ctx.membersById, ctx.villagesById);

      // State check: Only Pending can be responded to
      if (mapped.status !== 'Pending') {
        const err = new Error(`Yêu cầu kết nối này không còn ở trạng thái chờ duyệt (trạng thái hiện tại: ${mapped.status}).`);
        err.statusCode = 409;
        throw err;
      }

      // Sender cannot accept/reject their own request
      if (mapped.requestedBy === userId) {
        const err = new Error('Bạn không thể tự duyệt lời mời kết nối do chính mình gửi.');
        err.statusCode = 403;
        throw err;
      }

      // Authorization check
      let isAuthorized = false;
      if (mapped.connectionType === 'personal') {
        isAuthorized = mapped.approverMemberId === userId || mapped.targetMemberId === userId;
      } else {
        // Village mode: Must be the Leader of target village
        const targetLeaderId = resolveVillageLeaderMemberId(mapped.targetVillageId, ctx.villages, ctx.allMembers);
        isAuthorized = mapped.approverMemberId === userId || (targetLeaderId && targetLeaderId === userId);
      }

      if (!isAuthorized) {
        const err = new Error('Bạn không có quyền xác nhận hoặc từ chối lời mời kết nối này.');
        err.statusCode = 403;
        throw err;
      }

      const updateFields = {
        Connection_Status: normDecision,
        
        Responded_At: Date.now(),
      };

      await lark.updateRecord(config.connectionTableId, record.record_id, updateFields);
      invalidateCache();

      const updatedRecord = {
        record_id: record.record_id,
        fields: {
          ...record.fields,
          ...updateFields,
        },
      };

      const resultMapped = mapConnection(updatedRecord, ctx.boothsByRecordId, ctx.membersById, ctx.villagesById);
      return { success: true, data: resultMapped };
    });
  }

  function canUserCancelConnection(mapped, userId, ctx) {
    if (!mapped || !userId) return false;
    if (mapped.connectionType === 'personal') {
      return [
        mapped.requestedBy,
        mapped.targetMemberId,
        mapped.approverMemberId,
        mapped.sourceBooth?.authorMemberId,
        mapped.targetBooth?.authorMemberId,
      ].some((id) => id && id === userId);
    }
    // Village connection: only participating initiator or Village Leader representative on either side
    const sourceLeaderId = resolveVillageLeaderMemberId(mapped.sourceVillageId, ctx.villages, ctx.allMembers);
    const targetLeaderId = resolveVillageLeaderMemberId(mapped.targetVillageId, ctx.villages, ctx.allMembers);
    return [
      mapped.requestedBy,
      mapped.approverMemberId,
      sourceLeaderId,
      targetLeaderId,
    ].some((id) => id && id === userId);
  }

  /**
   * 5. CANCEL CONNECTION (PARTICIPANTS / VILLAGE REPRESENTATIVES)
   * POST /api/v1/connections/:id/cancel
   */
  async function cancelConnection({ sessionUser, id }) {
    const userId = getUserId(sessionUser);
    if (!sessionUser || !userId) {
      const err = new Error('Yêu cầu xác thực tài khoản.');
      err.statusCode = 401;
      throw err;
    }

    const lockKey = `respond:${id}`;

    return withLock(lockKey, async () => {
      const ctx = await getLookupContext();
      const rawRecords = await getConnectionsRaw(true);
      const record = rawRecords.find((r) => r.record_id === id || r.fields?.Connection_ID === id);

      if (!record) {
        const err = new Error('Không tìm thấy kết nối.');
        err.statusCode = 404;
        throw err;
      }

      const mapped = mapConnection(record, ctx.boothsByRecordId, ctx.membersById, ctx.villagesById);

      // Strict party / village-representative authorization (no implicit admin bypass)
      if (!canUserCancelConnection(mapped, userId, ctx)) {
        const err = new Error(mapped.connectionType === 'village'
          ? 'Chỉ người đại diện hợp lệ của một trong hai Làng mới có quyền hủy kết nối này.'
          : 'Bạn không có quyền hủy kết nối của người khác.');
        err.statusCode = 403;
        throw err;
      }

      // Idempotent handling if already Cancelled
      if (mapped.status === 'Cancelled') {
        return { success: true, alreadyCancelled: true, data: mapped };
      }

      if (mapped.status !== 'Accepted' && mapped.status !== 'Pending') {
        const err = new Error(`Không thể hủy kết nối đang ở trạng thái "${mapped.status}".`);
        err.statusCode = 409;
        throw err;
      }

      const updateFields = {
        Connection_Status: 'Cancelled',
        
        Responded_At: Date.now(),
      };

      await lark.updateRecord(config.connectionTableId, record.record_id, updateFields);
      invalidateCache();

      const updatedRecord = {
        record_id: record.record_id,
        fields: {
          ...record.fields,
          ...updateFields,
        },
      };

      const resultMapped = mapConnection(updatedRecord, ctx.boothsByRecordId, ctx.membersById, ctx.villagesById);
      return { success: true, data: resultMapped };
    });
  }

  /**
   * 6. NOTIFICATION COUNT
   * GET /api/v1/connections/notifications/count
   */
  async function getNotificationsCount({ sessionUser, isAdmin = false }) {
    const userId = getUserId(sessionUser);
    if (!sessionUser || !userId) {
      return { success: true, pendingCount: 0 };
    }
    const inbox = await listConnections({ sessionUser, isAdmin, scope: 'inbox' });
    return {
      success: true,
      pendingCount: inbox.count,
    };
  }

  return {
    createConnection,
    listConnections,
    getConnectionById,
    respondConnection,
    cancelConnection,
    getNotificationsCount,
    getConnectionsRaw,
    resolveVillageLeaderMemberId,
    invalidateCache,
  };
}
