// Deterministic & Explainable Matching Algorithm for AXANH Gate1
// No random numbers, no unverified time bonuses, strictly explainable reasons.

const VIETNAMESE_STOP_WORDS = new Set([
  'và', 'hoặc', 'là', 'có', 'của', 'để', 'trong', 'với', 'cho', 'một',
  'các', 'những', 'được', 'thể', 'cần', 'muốn', 'học', 'chia', 'sẻ',
  'biết', 'hiểu', 'về', 'cách', 'khi', 'này', 'đó', 'tại', 'nhau',
  'cùng', 'sau', 'trước', 'nhiều', 'hơn', 'rất', 'cũng', 'bạn', 'mình',
  'em', 'tôi', 'anh', 'chị', 'test', 'demo', 'dự', 'án', 'công', 'việc',
  'làm', 'hướng', 'dẫn', 'kinh', 'nghiệm', 'quy', 'trình'
]);

// Map of canonical/alias topics for cross-matching
const TOPIC_ALIASES = {
  'automation': ['tự động hóa', 'automation', 'tự động hoá'],
  'tự động hóa': ['automation', 'tự động hóa', 'tự động hoá'],
  'tự động hoá': ['automation', 'tự động hóa', 'tự động hoá'],
  'ai': ['ai', 'trí tuệ nhân tạo', 'artificial intelligence', 'chatgpt', 'prompt'],
  'qa/qc': ['qa/qc', 'qa', 'qc', 'kiểm tra chất lượng', 'sop'],
  'qa': ['qa/qc', 'qa', 'qc'],
  'qc': ['qa/qc', 'qa', 'qc'],
  'civil 3d': ['civil 3d', 'civil3d', 'autocad', 'hạ tầng'],
  'lãnh đạo': ['lãnh đạo', 'leadership', 'quản lý', 'điều phối'],
  'giao tiếp': ['giao tiếp', 'communication', 'email', 'phản hồi'],
  'mentoring': ['mentoring', 'hướng dẫn', 'kèm cặp', 'coaching'],
};

export function normalizeText(text) {
  if (typeof text !== 'string') return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function removeVietnameseAccents(str) {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function extractKeywords(text) {
  if (typeof text !== 'string') return [];
  const normalized = normalizeText(text);
  // Match alphanumeric sequences of 2 or more characters
  const rawWords = normalized.split(/[^a-zA-Z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+/);
  const keywords = [];
  for (const w of rawWords) {
    if (w.length >= 2 && !VIETNAMESE_STOP_WORDS.has(w)) {
      keywords.push(w);
    }
  }
  return Array.from(new Set(keywords));
}

export function matchTopics(needTopic, offerTopic, needTags = [], offerTags = []) {
  const normNeed = normalizeText(needTopic);
  const normOffer = normalizeText(offerTopic);

  const originalNames = new Map();
  if (offerTopic) originalNames.set(normOffer, offerTopic);
  for (const t of offerTags) {
    if (t) originalNames.set(normalizeText(t), t);
  }
  if (needTopic) originalNames.set(normNeed, needTopic);
  for (const t of needTags) {
    if (t) originalNames.set(normalizeText(t), t);
  }

  const allNeed = new Set([normNeed, ...needTags.map(normalizeText)].filter(Boolean));
  const allOffer = new Set([normOffer, ...offerTags.map(normalizeText)].filter(Boolean));

  // 1. Direct exact match
  const directMatches = [];
  for (const n of allNeed) {
    if (allOffer.has(n)) {
      directMatches.push(originalNames.get(n) || n);
    }
  }
  if (directMatches.length > 0) {
    return {
      type: 'exact',
      score: 60,
      matchedTopics: directMatches,
      reason: `Trùng chủ đề: ${directMatches.join(', ')}`,
    };
  }

  // 2. Alias / related match
  for (const n of allNeed) {
    const aliases = TOPIC_ALIASES[n] || [];
    for (const o of allOffer) {
      if (aliases.includes(o)) {
        const display = originalNames.get(o) || o;
        return {
          type: 'alias',
          score: 40,
          matchedTopics: [display],
          reason: `Chủ đề liên quan: ${display}`,
        };
      }
    }
  }

  // 3. Substring match for topics
  for (const n of allNeed) {
    for (const o of allOffer) {
      if (n.length >= 3 && (o.includes(n) || n.includes(o))) {
        const display = originalNames.get(o) || o;
        return {
          type: 'partial',
          score: 35,
          matchedTopics: [display],
          reason: `Chủ đề tương đồng: ${display}`,
        };
      }
    }
  }

  return null;
}

export function matchContent(needText, offerText, needTopic = '', offerTopic = '') {
  const needKw = extractKeywords(needText);
  const offerKw = extractKeywords(offerText);
  const offerKwSet = new Set(offerKw);

  const commonWords = needKw.filter((w) => offerKwSet.has(w));

  // Also check if needTopic appears in offerText or offerTopic in needText
  const normNeedText = normalizeText(needText);
  const normOfferText = normalizeText(offerText);
  const normNeedTopic = normalizeText(needTopic);
  const normOfferTopic = normalizeText(offerTopic);

  let crossTopic = false;
  if (normNeedTopic && normNeedTopic.length >= 2 && normOfferText.includes(normNeedTopic)) {
    crossTopic = true;
  }
  if (normOfferTopic && normOfferTopic.length >= 2 && normNeedText.includes(normOfferTopic)) {
    crossTopic = true;
  }

  if (commonWords.length >= 2 || (commonWords.length >= 1 && crossTopic)) {
    const sampleWords = commonWords.slice(0, 3).join(', ');
    return {
      score: 30,
      matchedWords: commonWords,
      reason: `Nội dung chia sẻ có từ khóa phù hợp: "${sampleWords || normNeedTopic || normOfferTopic}"`,
    };
  }

  if (commonWords.length === 1 || crossTopic) {
    const word = commonWords[0] || (crossTopic ? (normNeedTopic || normOfferTopic) : '');
    return {
      score: 15,
      matchedWords: commonWords,
      reason: `Nội dung chia sẻ có từ khóa liên quan: "${word}"`,
    };
  }

  return null;
}

export function matchFormat(formatA, formatB) {
  if (!formatA || !formatB) return null;
  const a = normalizeText(formatA);
  const b = normalizeText(formatB);
  if (a === b && a.length > 0) {
    return {
      score: 10,
      reason: `Cùng hình thức ưu tiên: ${formatB}`,
    };
  }
  return null;
}

export function matchAvailability(timeA, timeB) {
  if (typeof timeA === 'number' && typeof timeB === 'number' && timeA > 0 && timeB > 0) {
    // Both are timestamps. If within 24 hours (86,400,000 ms)
    const diff = Math.abs(timeA - timeB);
    if (diff <= 24 * 60 * 60 * 1000) {
      return {
        score: 5,
        reason: 'Khung giờ khả dụng tương đồng',
      };
    }
  }
  return null;
}

/**
 * Calculate match score between seeker source booth and a candidate booth.
 * Returns null if not eligible or zero matching signals.
 */
export function calculateMatchScore(source, candidate, mode = 'personal') {
  if (!source || !candidate) return null;

  // 1. Must match target boothType
  if (candidate.boothType !== mode) return null;

  // 2. Candidate must have agreed to display information
  if (candidate.consent !== true) return null;

  // 3. Must not be empty offer
  const hasOffer = (candidate.offer && candidate.offer.trim().length > 0) ||
                   (candidate.offerTopic && candidate.offerTopic.trim().length > 0);
  if (!hasOffer) return null;

  // 4. Do not match against self
  if (mode === 'personal') {
    if (source.authorMemberId && candidate.authorMemberId && source.authorMemberId === candidate.authorMemberId) {
      return null;
    }
    if (source.authorName && candidate.authorName &&
        normalizeText(source.authorName) === normalizeText(candidate.authorName)) {
      return null;
    }
  } else if (mode === 'village') {
    if (source.villageId && candidate.villageId && source.villageId === candidate.villageId) {
      return null;
    }
    if (source.villageName && candidate.villageName &&
        normalizeText(source.villageName) === normalizeText(candidate.villageName)) {
      return null;
    }
  }

  // 5. Evaluate signals
  const topicResult = matchTopics(
    source.needTopic,
    candidate.offerTopic,
    source.needTags || [],
    candidate.offerTags || []
  );

  const contentResult = matchContent(
    source.need,
    candidate.offer,
    source.needTopic,
    candidate.offerTopic
  );

  const formatResult = matchFormat(source.preferredFormat, candidate.preferredFormat);
  const timeResult = matchAvailability(source.availability, candidate.availability);

  // If no reliable match signal (neither topic nor content), keep as non-matching booth (score = 0)
  if (!topicResult && !contentResult) {
    return {
      score: 0,
      isMatched: false,
      matchReasons: [],
      commonTopics: [],
      sameFormat: Boolean(formatResult),
      sameTime: Boolean(timeResult),
    };
  }

  const topicScore = topicResult ? topicResult.score : 0;
  const contentScore = contentResult ? contentResult.score : 0;
  const formatScore = formatResult ? formatResult.score : 0;
  const timeScore = timeResult ? timeResult.score : 0;

  // Base deterministic formula
  let totalScore = topicScore + contentScore + formatScore + timeScore;
  totalScore = Math.min(100, Math.max(10, totalScore));

  const matchReasons = [];
  if (topicResult) matchReasons.push(topicResult.reason);
  if (contentResult) matchReasons.push(contentResult.reason);
  if (formatResult) matchReasons.push(formatResult.reason);
  if (timeResult) matchReasons.push(timeResult.reason);

  const commonTopics = topicResult ? topicResult.matchedTopics : [];

  return {
    score: totalScore,
    isMatched: true,
    matchReasons,
    commonTopics,
    sameFormat: Boolean(formatResult),
    sameTime: Boolean(timeResult),
  };
}
