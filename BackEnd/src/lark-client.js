const BASE_URL = 'https://open.larksuite.com/open-apis';

export class LarkError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = 'LarkError';
    this.code = code;
  }
}

export class LarkClient {
  constructor({ appId, appSecret, appToken, fetchImpl = fetch }) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.appToken = appToken;
    this.fetchImpl = fetchImpl;
    this.token = null;
    this.tokenExpiresAt = 0;
    this.tokenPromise = null;
  }

  async requestJson(url, init) {
    let response;
    try {
      response = await this.fetchImpl(url, {
        ...init,
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      throw new LarkError('Could not reach Lark API');
    }
    if (!response.ok) throw new LarkError(`Lark returned HTTP ${response.status}`, response.status);
    let body;
    try {
      body = await response.json();
    } catch {
      throw new LarkError('Lark returned invalid JSON');
    }
    if (body.code !== 0) {
      // Only keep Lark error codes, not raw payloads or personal data.
      throw new LarkError(`Lark rejected the request (code=${body.code})`, body.code);
    }
    return body;
  }

  async getTenantToken() {
    if (this.token && Date.now() < this.tokenExpiresAt) return this.token;
    if (!this.tokenPromise) {
      this.tokenPromise = (async () => {
        const body = await this.requestJson(`${BASE_URL}/auth/v3/tenant_access_token/internal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: this.appId, app_secret: this.appSecret }),
        });
        if (!body.tenant_access_token) throw new LarkError('Lark did not return tenant_access_token');
        this.token = body.tenant_access_token;
        const expiresIn = Number(body.expire ?? 7200);
        this.tokenExpiresAt = Date.now() + Math.max(30, expiresIn - 300) * 1000;
        return this.token;
      })().finally(() => { this.tokenPromise = null; });
    }
    return this.tokenPromise;
  }

  async getAppAccessToken() {
    const body = await this.requestJson(`${BASE_URL}/auth/v3/app_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: this.appId, app_secret: this.appSecret }),
    });
    if (!body.app_access_token) throw new LarkError('Lark did not return app_access_token');
    return body.app_access_token;
  }

  async exchangeCodeForUser(code) {
    const appToken = await this.getAppAccessToken();
    const result = await this.requestJson(`${BASE_URL}/authen/v1/access_token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
      }),
    });
    return result.data ?? {};
  }

  async searchPage(tableId, { pageSize = 100, pageToken = '', fieldNames = [] } = {}) {
    const token = await this.getTenantToken();
    const params = new URLSearchParams({ page_size: String(pageSize) });
    if (pageToken) params.set('page_token', pageToken);
    const path = `/bitable/v1/apps/${encodeURIComponent(this.appToken)}/tables/${encodeURIComponent(tableId)}/records/search`;
    const body = fieldNames.length ? { field_names: fieldNames } : {};
    const result = await this.requestJson(`${BASE_URL}${path}?${params}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return result.data ?? {};
  }

  async searchAll(tableId, { pageSize = 100, fieldNames = [], maxPages = 50 } = {}) {
    const results = [];
    const seen = new Set();
    let pageToken = '';
    for (let page = 0; page < maxPages; page += 1) {
      const data = await this.searchPage(tableId, { pageSize, pageToken, fieldNames });
      if (!Array.isArray(data.items)) throw new LarkError('Unexpected Lark items payload');
      results.push(...data.items);
      if (!data.has_more) return results;
      if (!data.page_token || seen.has(data.page_token)) {
        throw new LarkError('Invalid/repeated Lark page_token');
      }
      pageToken = data.page_token;
      seen.add(pageToken);
    }
    throw new LarkError('Pagination exceeded safe limit');
  }

  // Read field metadata to resolve the field ID of the Color/Icon attachment column.
  async listFields(tableId, { pageSize = 100, maxPages = 10 } = {}) {
    const token = await this.getTenantToken();
    const items = [];
    const seen = new Set();
    let pageToken = '';

    for (let page = 0; page < maxPages; page += 1) {
      const params = new URLSearchParams({ page_size: String(pageSize) });
      if (pageToken) params.set('page_token', pageToken);
      const path = `/bitable/v1/apps/${encodeURIComponent(this.appToken)}/tables/${encodeURIComponent(tableId)}/fields`;
      const result = await this.requestJson(`${BASE_URL}${path}?${params}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = result.data ?? {};
      if (!Array.isArray(data.items)) throw new LarkError('Unexpected Lark fields payload');
      items.push(...data.items);
      if (!data.has_more) return items;
      if (!data.page_token || seen.has(data.page_token)) throw new LarkError('Invalid field pagination token');
      pageToken = data.page_token;
      seen.add(pageToken);
    }

    throw new LarkError('Field pagination exceeded safe limit');
  }

  async listTables({ pageSize = 100, maxPages = 5 } = {}) {
    const token = await this.getTenantToken();
    const items = [];
    let pageToken = '';

    for (let page = 0; page < maxPages; page += 1) {
      const params = new URLSearchParams({ page_size: String(pageSize) });
      if (pageToken) params.set('page_token', pageToken);
      const path = `/bitable/v1/apps/${encodeURIComponent(this.appToken)}/tables`;
      const result = await this.requestJson(`${BASE_URL}${path}?${params}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = result.data ?? {};
      if (Array.isArray(data.items)) items.push(...data.items);
      if (!data.has_more || !data.page_token) break;
      pageToken = data.page_token;
    }
    return items;
  }

  async createRecord(tableId, fields) {
    if (typeof tableId !== 'string' || !/^tbl[a-zA-Z0-9_-]{10,64}$/.test(tableId)) {
      throw new LarkError('Invalid table ID');
    }
    const token = await this.getTenantToken();
    const path = `/bitable/v1/apps/${encodeURIComponent(this.appToken)}/tables/${encodeURIComponent(tableId)}/records`;
    const result = await this.requestJson(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ fields }),
    });
    return result.data?.record ?? {};
  }

  async updateRecord(tableId, recordId, fields) {
    if (typeof tableId !== 'string' || !/^tbl[a-zA-Z0-9_-]{10,64}$/.test(tableId)) {
      throw new LarkError('Invalid table ID');
    }
    if (typeof recordId !== 'string' || !/^rec[a-zA-Z0-9_-]{10,64}$/.test(recordId)) {
      throw new LarkError('Invalid record ID');
    }
    const token = await this.getTenantToken();
    const path = `/bitable/v1/apps/${encodeURIComponent(this.appToken)}/tables/${encodeURIComponent(tableId)}/records/${encodeURIComponent(recordId)}`;
    const result = await this.requestJson(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ fields }),
    });
    return result.data?.record ?? {};
  }

  async getRecord(tableId, recordId) {
    if (typeof tableId !== 'string' || !/^tbl[a-zA-Z0-9_-]{10,64}$/.test(tableId)) {
      throw new LarkError('Invalid table ID');
    }
    if (typeof recordId !== 'string' || !/^rec[a-zA-Z0-9_-]{10,64}$/.test(recordId)) {
      throw new LarkError('Invalid record ID');
    }
    const token = await this.getTenantToken();
    const path = `/bitable/v1/apps/${encodeURIComponent(this.appToken)}/tables/${encodeURIComponent(tableId)}/records/${encodeURIComponent(recordId)}`;
    const result = await this.requestJson(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    return result.data?.record ?? null;
  }

  async deleteRecord(tableId, recordId) {
    if (typeof tableId !== 'string' || !/^tbl[a-zA-Z0-9_-]{10,64}$/.test(tableId)) {
      throw new LarkError('Invalid table ID');
    }
    if (typeof recordId !== 'string' || !/^rec[a-zA-Z0-9_-]{10,64}$/.test(recordId)) {
      throw new LarkError('Invalid record ID');
    }
    const token = await this.getTenantToken();
    const path = `/bitable/v1/apps/${encodeURIComponent(this.appToken)}/tables/${encodeURIComponent(tableId)}/records/${encodeURIComponent(recordId)}`;
    const result = await this.requestJson(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return result.data ?? {};
  }

  // Binary response: do NOT use requestJson(). "extra" supplies Base attachment context.
  // The returned bytes are verified as PNG/JPEG/WEBP/GIF and capped at 3 MiB.
  async downloadBitableImage({ tableId, fieldId, recordId, fileToken }, maxBytes = 3 * 1024 * 1024) {
    for (const value of [tableId, fieldId, recordId, fileToken]) {
      if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{3,128}$/.test(value)) {
        throw new LarkError('Invalid Base attachment metadata');
      }
    }
    const token = await this.getTenantToken();
    const url = new URL(`${BASE_URL}/drive/v1/medias/${encodeURIComponent(fileToken)}/download`);
    url.searchParams.set('extra', JSON.stringify({
      bitablePerm: {
        tableId,
        attachments: { [fieldId]: { [recordId]: [fileToken] } },
      },
    }));

    let response;
    try {
      response = await this.fetchImpl(url.toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new LarkError('Could not download Lark attachment');
    }
    if (!response.ok) throw new LarkError(`Lark media returned HTTP ${response.status}`, response.status);

    // Enforce limit while reading: the upstream Content-Length may be absent or wrong.
    const declaredSize = Number(response.headers.get('content-length'));
    if (Number.isFinite(declaredSize) && declaredSize > maxBytes) {
      await response.body?.cancel?.();
      throw new LarkError('Lark image exceeds allowed size');
    }
    if (!response.body) throw new LarkError('Lark returned empty image');

    const chunks = [];
    let size = 0;
    try {
      for await (const chunk of response.body) {
        size += chunk.byteLength;
        if (size > maxBytes) {
          await response.body.cancel().catch(() => {});
          throw new LarkError('Lark image exceeds allowed size');
        }
        chunks.push(Buffer.from(chunk));
      }
    } catch (err) {
      if (err instanceof LarkError) throw err;
      throw new LarkError('Could not read Lark image');
    }
    const bytes = Buffer.concat(chunks, size);
    let contentType = null;
    if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
      contentType = 'image/png';
    } else if (bytes.length >= 3 && bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) {
      contentType = 'image/jpeg';
    } else if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
      contentType = 'image/webp';
    } else if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6))) {
      contentType = 'image/gif';
    }
    // Reject SVG/HTML/JSON even if the upstream labels them as images.
    if (!contentType) throw new LarkError('Unsupported or invalid image format');
    return { bytes, contentType };
  }
}
