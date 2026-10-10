import type { Enquiry, EnquiryInput, ListFilters, ListMeta, Stats, Status } from '../types';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';
const TOKEN_KEY = 'dtv-admin-token';

export const tokenStore = {
  get: (): string | null => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t: string) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, t);
    } catch {
      /* storage unavailable */
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  data: T;
  meta?: ListMeta;
}

async function request<T>(path: string, init: RequestInit = {}, auth = false): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (init.body) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    if (res.status === 401 && auth) window.dispatchEvent(new Event('auth:expired'));
    const fallback = res.status >= 500 ? 'Something went wrong on our side. Please try again later.' : 'The request could not be completed.';
    throw new ApiError(res.status, body?.message || fallback, body?.errors);
  }
  if (!body) throw new ApiError(res.status, 'Received an unexpected response from the server.');
  return body;
}

export const login = async (email: string, password: string) =>
  (await request<{ token: string; email: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })).data;

export const createEnquiry = async (input: EnquiryInput) =>
  (await request<Enquiry>('/enquiries', { method: 'POST', body: JSON.stringify(input) })).data;

export const listEnquiries = async (f: ListFilters) => {
  const qs = new URLSearchParams();
  if (f.search) qs.set('search', f.search);
  if (f.userType) qs.set('userType', f.userType);
  if (f.status) qs.set('status', f.status);
  qs.set('sort', f.sort);
  qs.set('page', String(f.page));
  qs.set('limit', String(f.limit ?? 10));
  const res = await request<Enquiry[]>(`/enquiries?${qs.toString()}`, {}, true);
  return { items: res.data, meta: res.meta as ListMeta };
};

export const getStats = async () => (await request<Stats>('/enquiries/stats/summary', {}, true)).data;

export const updateEnquiryStatus = async (id: number, status: Status) =>
  (await request<Enquiry>(`/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, true)).data;

export const deleteEnquiry = async (id: number) => {
  await request<null>(`/enquiries/${id}`, { method: 'DELETE' }, true);
};
