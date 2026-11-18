/**
 * api-client.ts
 *
 * Thin wrapper around Playwright's APIRequestContext for API-assisted setup and
 * backend assertions in black box UI tests. All requests are made to the real
 * Laravel backend (no stubs/mocks), preserving true end-to-end integration.
 */
import type { APIRequestContext, APIResponse } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8000';

export type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

interface ClientOptions {
  baseURL?: string;
  token?: string;
}

export class ApiClient {
  private readonly request: APIRequestContext;
  private readonly baseURL: string;
  private readonly token?: string;

  constructor(request: APIRequestContext, opts: ClientOptions = {}) {
    this.request = request;
    this.baseURL = opts.baseURL ?? API_BASE;
    this.token = opts.token;
  }

  /** Create an authenticated client (Bearer token) from an existing one. */
  withToken(token: string): ApiClient {
    return new ApiClient(this.request, {
      baseURL: this.baseURL,
      token,
    });
  }

  private headers(token?: string): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const t = token ?? this.token;
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  }

  async get(path: string, token?: string, query?: Record<string, string | number>): Promise<APIResponse> {
    const url = this.buildUrl(path, query);
    return this.request.get(url, { headers: this.headers(token) });
  }

  async post(path: string, body?: Json, token?: string): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}/api${path}`, {
      headers: this.headers(token),
      data: body,
    });
  }

  async put(path: string, body?: Json, token?: string): Promise<APIResponse> {
    return this.request.put(`${this.baseURL}/api${path}`, {
      headers: this.headers(token),
      data: body,
    });
  }

  async del(path: string, token?: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseURL}/api${path}`, {
      headers: this.headers(token),
    });
  }

  /** POST with multipart/form-data (used for menu foto upload).
   *  `formData` is a plain object of field names to string values.
   */
  async postForm(path: string, formData: Record<string, string>, token?: string): Promise<APIResponse> {
    const h: Record<string, string> = {};
    const t = token ?? this.token;
    if (t) h['Authorization'] = `Bearer ${t}`;
    // Use URL-encoded form data (no files needed in tests).
    const body = Object.entries(formData)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return this.request.post(`${this.baseURL}/api${path}`, {
      headers: { ...h, 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body,
    });
  }

  private buildUrl(path: string, query?: Record<string, string | number>): string {
    let url = `${this.baseURL}/api${path}`;
    if (query) {
      const qs = Object.entries(query)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      url += `?${qs}`;
    }
    return url;
  }

  /** Convenience: parse JSON body. Throws if not OK. */
  async json<T = any>(response: APIResponse): Promise<T> {
    if (!response.ok()) {
      const text = await response.text().catch(() => '');
      throw new Error(`API request failed: ${response.status()} ${text}`);
    }
    return response.json() as Promise<T>;
  }

  /** Delete all orders to avoid duplicate nomor_order conflicts.
   *  nomor_order is generated as ORD-YYYYMMDD-XXXX based on today's count,
   *  so leftover orders from previous tests cause unique constraint violations.
   */
  async cleanupOrders(): Promise<void> {
    const response = await this.get('/orders?per_page=100');
    const body = await this.json<any>(response);
    const orders = body.data?.data ?? [];
    for (const order of orders) {
      try {
        await this.del(`/orders/${order.id}`);
      } catch {
        // ignore individual deletion failures
      }
    }
  }
}

export default ApiClient;
