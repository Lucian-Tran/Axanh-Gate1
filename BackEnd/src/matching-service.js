import { calculateMatchScore, normalizeText } from './matching-scoring.js';

export function createMatchingService({ getBooths, getMembers, getVillages, authStore }) {
  /**
   * Helper to find member by ID
   */
  async function findMemberById(memberId) {
    if (!memberId) return null;
    const members = await getMembers();
    return members.find((m) => m.id === memberId) || null;
  }

  /**
   * Helper to find village by ID
   */
  async function findVillageById(villageId) {
    if (!villageId) return null;
    const villages = await getVillages();
    return villages.find((v) => v.id === villageId) || null;
  }

  /**
   * Get matching context for current session / target
   */
  async function getMatchingContext({ sessionUser, isAdmin, targetMemberId, targetVillageId }) {
    if (!sessionUser) {
      const err = new Error('Yêu cầu xác thực tài khoản.');
      err.statusCode = 401;
      throw err;
    }

    // Authorization check on target
    let effectiveMemberId = sessionUser.memberId;
    if (targetMemberId && targetMemberId !== sessionUser.memberId) {
      if (!isAdmin) {
        const err = new Error('Bạn không có quyền truy cập dữ liệu của thành viên khác.');
        err.statusCode = 403;
        throw err;
      }
      effectiveMemberId = targetMemberId;
    }

    let effectiveVillageId = sessionUser.villageId;
    if (targetVillageId && targetVillageId !== sessionUser.villageId) {
      if (!isAdmin) {
        const err = new Error('Bạn không có quyền truy cập dữ liệu của làng khác.');
        err.statusCode = 403;
        throw err;
      }
      effectiveVillageId = targetVillageId;
    }

    // Fetch target member details if different from sessionUser
    let currentMember = sessionUser;
    if (effectiveMemberId && effectiveMemberId !== sessionUser.memberId) {
      const m = await findMemberById(effectiveMemberId);
      if (m) {
        currentMember = {
          memberId: m.id,
          name: m.name,
          villageId: m.villageId,
          villageName: m.villageName,
          office: m.office,
          avatarUrl: m.avatarUrl,
          role: 'member',
        };
        if (!targetVillageId && m.villageId) {
          effectiveVillageId = m.villageId;
        }
      }
    }

    const currentVillage = effectiveVillageId ? await findVillageById(effectiveVillageId) : null;

    // Fetch all mapped booths
    const allBooths = await getBooths();

    const targetMemberName = currentMember.name ? normalizeText(currentMember.name) : '';

    // Filter personal booths belonging to the effective member
    const personalBooths = allBooths.filter((b) => {
      if (b.boothType !== 'personal') return false;
      if (effectiveMemberId && b.authorMemberId === effectiveMemberId) return true;
      if (targetMemberName && normalizeText(b.authorName) === targetMemberName) return true;
      if (b.recordId && authStore?.isBoothOwner(b.recordId, effectiveMemberId, currentMember.name)) return true;
      return false;
    });

    // Filter village booths belonging to the effective village
    const villageBooths = allBooths.filter((b) => {
      if (b.boothType !== 'village') return false;
      if (effectiveVillageId && b.villageId === effectiveVillageId) return true;
      if (currentVillage && normalizeText(b.villageName) === normalizeText(currentVillage.name)) return true;
      return false;
    });

    return {
      canManageMatching: Boolean(isAdmin),
      currentUser: {
        memberId: currentMember.memberId,
        name: currentMember.name,
        villageId: currentMember.villageId || effectiveVillageId,
        villageName: currentMember.villageName || currentVillage?.name || 'Chưa xác định',
        office: currentMember.office || '',
        avatarUrl: currentMember.avatarUrl || null,
        role: currentMember.role || 'member',
        isAdmin: Boolean(isAdmin),
      },
      currentVillage: currentVillage
        ? {
            villageId: currentVillage.id,
            villageName: currentVillage.name,
            office: currentVillage.office,
            iconUrl: currentVillage.iconUrl,
          }
        : null,
      personalBooths,
      villageBooths,
    };
  }

  /**
   * Get matching suggestions for a specific source booth
   */
  async function getMatchingSuggestions({ sessionUser, isAdmin, mode = 'personal', boothId }) {
    if (!sessionUser) {
      const err = new Error('Yêu cầu xác thực tài khoản.');
      err.statusCode = 401;
      throw err;
    }

    const normalizedMode = mode === 'village' ? 'village' : 'personal';
    if (!boothId) {
      const err = new Error('Thiếu boothId.');
      err.statusCode = 400;
      throw err;
    }

    const allBooths = await getBooths();
    const source = allBooths.find((b) => b.boothId === boothId || b.recordId === boothId);

    if (!source) {
      const err = new Error('Không tìm thấy gian hàng nguồn.');
      err.statusCode = 404;
      throw err;
    }

    // Verify boothType matches mode
    if (source.boothType !== normalizedMode) {
      const err = new Error(`Gian hàng ${source.boothId} không thuộc chế độ ${normalizedMode === 'village' ? 'Làng' : 'Cá nhân'}.`);
      err.statusCode = 400;
      throw err;
    }

    // Authorization: User can only use their own booth or their village's booth
    if (!isAdmin) {
      if (normalizedMode === 'personal') {
        const isOwner = (sessionUser.memberId && source.authorMemberId === sessionUser.memberId) ||
                        (sessionUser.name && normalizeText(source.authorName) === normalizeText(sessionUser.name)) ||
                        (source.recordId && authStore?.isBoothOwner(source.recordId, sessionUser.memberId, sessionUser.name));
        if (!isOwner) {
          const err = new Error('Bạn không có quyền tìm kiếm đề xuất cho gian hàng cá nhân của người khác.');
          err.statusCode = 403;
          throw err;
        }
      } else if (normalizedMode === 'village') {
        const userVillageId = sessionUser.villageId;
        const matchesVillage = userVillageId && source.villageId === userVillageId;
        if (!matchesVillage) {
          const err = new Error('Bạn không có quyền tìm kiếm đề xuất cho gian hàng của làng khác.');
          err.statusCode = 403;
          throw err;
        }
      }
    }

    // Find candidates from allBooths
    const candidateMatches = [];

    for (const candidate of allBooths) {
      // Don't match with itself
      if (candidate.boothId === source.boothId || candidate.recordId === source.recordId) {
        continue;
      }

      const match = calculateMatchScore(source, candidate, normalizedMode);
      if (match) {
        candidateMatches.push({
          candidate,
          match,
        });
      }
    }

    // Grouping & Deduplication
    let finalSuggestions = [];

    if (normalizedMode === 'village') {
      // Group by villageId to avoid multiple cards for the same village
      const villageMap = new Map();
      for (const item of candidateMatches) {
        const vId = item.candidate.villageId || item.candidate.villageName;
        if (!villageMap.has(vId)) {
          villageMap.set(vId, []);
        }
        villageMap.get(vId).push(item);
      }

      for (const [vId, items] of villageMap.entries()) {
        // Sort items by score descending
        items.sort((a, b) => b.match.score - a.match.score);
        const top = items[0];
        finalSuggestions.push({
          targetVillageId: top.candidate.villageId,
          targetVillageName: top.candidate.villageName,
          targetVillageIconUrl: top.candidate.villageIconUrl,
          targetBoothId: top.candidate.boothId,
          targetRecordId: top.candidate.recordId,
          targetOffice: top.candidate.authorOffice,
          representativeName: top.candidate.authorName,
          representativeAvatarUrl: top.candidate.authorAvatarUrl,
          offer: top.candidate.offer,
          offerTopic: top.candidate.offerTopic,
          offerTags: top.candidate.offerTags,
          preferredFormat: top.candidate.preferredFormat,
          availability: top.candidate.availability,
          matchScore: top.match.score,
          isMatched: Boolean(top.match.isMatched && top.match.score > 0),
          matchReasons: top.match.matchReasons,
          commonTopics: top.match.commonTopics,
          sameFormat: top.match.sameFormat,
          sameTime: top.match.sameTime,
          otherMatchingBoothsCount: items.length - 1,
          createdAt: top.candidate.createdAt,
        });
      }
    } else {
      // Personal mode: group by authorMemberId (or authorName) to avoid duplicate cards for same person
      const memberMap = new Map();
      for (const item of candidateMatches) {
        const mKey = item.candidate.authorMemberId || normalizeText(item.candidate.authorName);
        if (!memberMap.has(mKey)) {
          memberMap.set(mKey, []);
        }
        memberMap.get(mKey).push(item);
      }

      for (const [mKey, items] of memberMap.entries()) {
        items.sort((a, b) => b.match.score - a.match.score);
        const top = items[0];
        finalSuggestions.push({
          targetMemberId: top.candidate.authorMemberId,
          targetBoothId: top.candidate.boothId,
          targetRecordId: top.candidate.recordId,
          displayName: top.candidate.authorName,
          avatarUrl: top.candidate.authorAvatarUrl,
          villageId: top.candidate.villageId,
          villageName: top.candidate.villageName,
          villageIconUrl: top.candidate.villageIconUrl,
          office: top.candidate.authorOffice,
          offer: top.candidate.offer,
          offerTopic: top.candidate.offerTopic,
          offerTags: top.candidate.offerTags,
          preferredFormat: top.candidate.preferredFormat,
          availability: top.candidate.availability,
          matchScore: top.match.score,
          isMatched: Boolean(top.match.isMatched && top.match.score > 0),
          matchReasons: top.match.matchReasons,
          commonTopics: top.match.commonTopics,
          sameFormat: top.match.sameFormat,
          sameTime: top.match.sameTime,
          otherMatchingBoothsCount: items.length - 1,
          createdAt: top.candidate.createdAt,
        });
      }
    }

    // Stable sort: score desc, reasons length desc, createdAt desc
    finalSuggestions.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (b.matchReasons.length !== a.matchReasons.length) return b.matchReasons.length - a.matchReasons.length;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    return {
      mode: normalizedMode,
      source: {
        boothId: source.boothId,
        recordId: source.recordId,
        boothType: source.boothType,
        authorName: source.authorName,
        authorMemberId: source.authorMemberId,
        authorAvatarUrl: source.authorAvatarUrl,
        authorOffice: source.authorOffice,
        authorVillageName: source.authorVillageName,
        villageId: source.villageId,
        villageName: source.villageName,
        villageIconUrl: source.villageIconUrl,
        need: source.need,
        needTopic: source.needTopic,
        needTags: source.needTags,
        preferredFormat: source.preferredFormat,
        availability: source.availability,
        outcome: source.outcome,
      },
      suggestions: finalSuggestions,
      meta: {
        total: finalSuggestions.length,
        matchingCount: finalSuggestions.filter((s) => s.matchScore > 0).length,
        otherCount: finalSuggestions.filter((s) => s.matchScore === 0).length,
        mode: normalizedMode,
      },
    };
  }

  return {
    getMatchingContext,
    getMatchingSuggestions,
  };
}

