'use strict';
// Same-origin API client. No App Secret, tenant token or INTERNAL_TEST_KEY here.
(function () {
  async function getJson(path) {
    const response = await fetch(path, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 401) {
      // Session expired – throw, let app.js handle showing login screen
      throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
    }
    if (!response.ok) {
      if (response.status === 404 && window.location.port === '5500') {
        throw new Error(
          'Bạn đang mở trang qua VS Code Live Server (port 5500). Vui lòng dùng Vite (port 5173).'
        );
      }
      throw new Error(`Backend trả lỗi HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.items)) {
      throw new Error('Dữ liệu backend không đúng cấu trúc.');
    }
    return payload.items;
  }

  async function getMe() {
    try {
      const response = await fetch('/api/v1/me', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return (data && data.authenticated) ? data.user : null;
    } catch {
      return null;
    }
  }

  async function loadData() {
    const [villages, members] = await Promise.all([
      getJson('/api/v1/villages'),
      getJson('/api/v1/members'),
    ]);
    return { villages, members };
  }

  async function logout() {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {}
    // Reset UI via app instead of hard redirect to backend /dev-login
    window.dispatchEvent(new CustomEvent('axanh:logout'));
  }

  async function requestOtp(email) {
    const response = await fetch('/auth/email/request-otp', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Yêu cầu gửi mã thất bại (HTTP ${response.status}).`);
    }
    return data;
  }

  async function verifyOtp(email, otp) {
    const response = await fetch('/auth/email/verify-otp', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Xác thực mã thất bại (HTTP ${response.status}).`);
    }
    return data;
  }

  async function getFormsConfig() {
    try {
      const response = await fetch('/api/v1/integrations/forms', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return null;
      const json = await response.json().catch(() => ({}));
      return (json && json.success) ? json.data : null;
    } catch {
      return null;
    }
  }

  async function learningRequest(path, method = 'GET', body = undefined) {
    const response = await fetch(path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        throw Object.assign(new Error(result.error || 'Phiên đăng nhập hết hạn.'), { status: 401 });
      }
      throw Object.assign(new Error(result.error || `Yêu cầu thất bại (HTTP ${response.status}).`), { status: response.status });
    }
    return result;
  }

  async function updateFormsConfig({ form01Url, form02Url }) {
    const response = await fetch('/api/v1/admin/integrations/forms', {
      method: 'PUT',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ form01Url, form02Url }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Cập nhật cấu hình thất bại (HTTP ${response.status}).`);
    }
    return result;
  }

  async function getBooths(type = '') {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    const response = await fetch(`/api/v1/booths${query}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 401) {
      throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
    }
    if (!response.ok) {
      throw new Error(`Lỗi tải danh sách gian hàng (HTTP ${response.status}).`);
    }
    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async function getGate1({ forceFresh = false } = {}) {
    const response = await fetch(`/api/v1/gate1${forceFresh ? '?refresh=1' : ''}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 401) {
      throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Lỗi tải dữ liệu Gate 1 (HTTP ${response.status}).`);
    }
    if (!result.success || !Array.isArray(result.items)) {
      throw new Error(result.error || 'Dữ liệu Gate 1 từ Backend không đúng cấu trúc.');
    }
    return result;
  }

  async function getMyBooths(type = '') {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    const response = await fetch(`/api/v1/booths/mine${query}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 401) {
      throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
    }
    if (!response.ok) {
      throw new Error(`Lỗi tải gian hàng cá nhân (HTTP ${response.status}).`);
    }
    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async function createBooth(boothData) {
    const response = await fetch('/api/v1/booths', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(boothData),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Đăng ký gian hàng thất bại (HTTP ${response.status}).`);
    }
    return result;
  }

  async function updateBooth(id, boothData) {
    const response = await fetch(`/api/v1/booths/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(boothData),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Cập nhật gian hàng thất bại (HTTP ${response.status}).`);
    }
    return result;
  }

  async function syncBooths() {
    const response = await fetch('/api/v1/booths/sync', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 401) {
      throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Đồng bộ thất bại (HTTP ${response.status}).`);
    }
    return result;
  }

  async function getMatchingContext({ memberId, villageId } = {}) {
    const params = new URLSearchParams();
    if (memberId) params.set('memberId', memberId);
    if (villageId) params.set('villageId', villageId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`/api/v1/matching/context${qs}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 401) {
      throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Lỗi tải ngữ cảnh Smart Matching (HTTP ${response.status}).`);
    }
    return result.data;
  }

  async function getMatchingSuggestions({ mode = 'personal', boothId }) {
    if (!boothId) return { mode, source: null, suggestions: [], meta: { total: 0 } };
    const params = new URLSearchParams({ mode, boothId });
    const response = await fetch(`/api/v1/matching/suggestions?${params.toString()}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 401) {
      throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Lỗi tính toán gợi ý kết nối (HTTP ${response.status}).`);
    }
    return result.data;
  }

  window.AXANH_LIVE_API = Object.freeze({
    getMe,
    loadData,
    logout,
    requestOtp,
    verifyOtp,
    getFormsConfig,
    updateFormsConfig,
    getBooths,
    getGate1,
    getMyBooths,
    createBooth,
    updateBooth,
    syncBooths,
    getMatchingContext,
    getMatchingSuggestions,
    // Connection Request & Approval System (T14_Connections on Lark Base)
    async createConnection({ sourceBoothId, targetBoothId, connectionType = 'personal' }) {
      const response = await fetch('/api/v1/connections', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ sourceBoothId, targetBoothId, connectionType }),
      });
      if (response.status === 401) {
        throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Gửi lời mời thất bại (HTTP ${response.status}).`);
      }
      return result.data;
    },

    async getConnectionsMine({ status = null } = {}) {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      const response = await fetch(`/api/v1/connections/mine${qs}`, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (response.status === 401) {
        throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Tải danh sách kết nối thất bại (HTTP ${response.status}).`);
      }
      return result.items || [];
    },

    async getConnectionsInbox() {
      const response = await fetch('/api/v1/connections/inbox', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (response.status === 401) {
        throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Tải hộp thư lời mời thất bại (HTTP ${response.status}).`);
      }
      return result.items || [];
    },

    async getConnectionById(id) {
      if (!id) return null;
      const response = await fetch(`/api/v1/connections/${encodeURIComponent(id)}`, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (response.status === 401) {
        throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Lỗi tải chi tiết kết nối (HTTP ${response.status}).`);
      }
      return result.data;
    },

    async respondConnection(id, { decision, note = '' }) {
      if (!id) throw new Error('Mã kết nối không hợp lệ.');
      const response = await fetch(`/api/v1/connections/${encodeURIComponent(id)}/respond`, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ decision, note }),
      });
      if (response.status === 401) {
        throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Xử lý xác nhận thất bại (HTTP ${response.status}).`);
      }
      return result.data;
    },

    async cancelConnection(id) {
      if (!id) throw new Error('Mã kết nối không hợp lệ.');
      const response = await fetch(`/api/v1/connections/${encodeURIComponent(id)}/cancel`, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      if (response.status === 401) {
        throw Object.assign(new Error('Phiên đăng nhập hết hạn.'), { status: 401 });
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Hủy lời mời thất bại (HTTP ${response.status}).`);
      }
      return result;
    },

    async getNotificationsCount() {
      try {
        const response = await fetch('/api/v1/connections/notifications/count', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) return { pendingCount: 0 };
        const result = await response.json().catch(() => ({ pendingCount: 0 }));
        return result;
      } catch {
        return { pendingCount: 0 };
      }
    },
    async getLearningData() {
      const result = await learningRequest('/api/v1/learning-sessions');
      return result;
    },
    async getKnowledge() {
      const result = await learningRequest('/api/v1/knowledge');
      return { items: result.items || [], diagnostics: result.diagnostics || {} };
    },
    async getKnowledgeDetail(id) {
      const result = await learningRequest(`/api/v1/knowledge/${encodeURIComponent(id)}`);
      return result.data;
    },
    async getHonors(forceFresh = false) {
      return learningRequest(`/api/v1/honors${forceFresh ? '?refresh=1' : ''}`);
    },
    async createLearningSession(data) {
      const result = await learningRequest('/api/v1/learning-sessions', 'POST', data);
      return result.data;
    },
    async respondLearningSession(id, decision) {
      const result = await learningRequest(`/api/v1/learning-sessions/${encodeURIComponent(id)}/respond`, 'POST', { decision });
      return result.data;
    },
    async completeLearningSession(id) {
      const result = await learningRequest(`/api/v1/learning-sessions/${encodeURIComponent(id)}/complete`, 'POST', {});
      return result.data;
    },
    async getLearningResults(id) {
      const result = await learningRequest(`/api/v1/learning-sessions/${encodeURIComponent(id)}/results`);
      return result.items || [];
    },
    async submitLearningResult(id, data) {
      return learningRequest(`/api/v1/learning-sessions/${encodeURIComponent(id)}/results`, 'POST', data);
    },
    // Legacy compat – kept for ApiAdapter but not used in main init flow
    async load() {
      const me = await getMe();
      if (!me) return { villages: [], members: [], me: null };
      const { villages, members } = await loadData();
      return { villages, members, me };
    },
  });
})();
