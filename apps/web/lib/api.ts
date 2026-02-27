// ============================================================
// Xamle Civic — API client (TanStack Query compatible)
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}/api/v1${path}`;
  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = { ...(options?.headers as Record<string, string>) };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, {
    headers,
    credentials: 'include',
    ...options,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = typeof json.message === 'string'
      ? json.message
      : Array.isArray(json.message)
        ? json.message.join(', ')
        : json.message ?? 'Erreur API';
    throw new ApiError(res.status, msg, json);
  }

  return json.data as T;
}

// ─── Token management ────────────────────────────────────────
let accessToken: string | null = null;

export function setAccessToken(token: string) { accessToken = token; }
export function clearAccessToken() { accessToken = null; }

function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options?.headers,
    },
  });
}

// ─── Policies ────────────────────────────────────────────────
export function fetchPolicies(params?: URLSearchParams) {
  const qs = params ? `?${params.toString()}` : '';
  return apiFetch<{
    data: import('@xamle/types').Policy[];
    meta: import('@xamle/types').PaginatedResponse<unknown>['meta'];
  }>(`/policies${qs}`);
}

export function fetchPolicyBySlug(slug: string) {
  return apiFetch<import('@xamle/types').Policy>(`/policies/${slug}`);
}

export function fetchGlobalStats() {
  return apiFetch<import('@xamle/types').GlobalStats>('/policies/stats');
}

// ─── Ministries ──────────────────────────────────────────────
export function fetchMinistries() {
  return apiFetch<import('@xamle/types').Ministry[]>('/ministries');
}

export function fetchMinistryRanking() {
  return apiFetch<import('@xamle/types').MinistryStats[]>('/ministries/ranking');
}

// ─── Search ──────────────────────────────────────────────────
export function searchPolicies(q: string, filters?: Record<string, string>) {
  const params = new URLSearchParams({ q, ...filters });
  return apiFetch<{ hits: import('@xamle/types').Policy[]; totalHits: number; query: string }>(
    `/search?${params.toString()}`,
  );
}

// ─── Contributions ───────────────────────────────────────────
export function fetchContributions(policyId?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page) });
  if (policyId) params.append('policyId', policyId);
  return apiFetch<{
    data: import('@xamle/types').Contribution[];
    meta: import('@xamle/types').PaginatedResponse<unknown>['meta'];
  }>(`/contributions?${params.toString()}`);
}

export function createContribution(formData: FormData) {
  return authFetch<import('@xamle/types').Contribution>('/contributions', {
    method: 'POST',
    body: formData,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
}

// ─── Comments ────────────────────────────────────────────────
export function fetchComments(policyId: string, page = 1) {
  return apiFetch<{
    data: import('@xamle/types').Comment[];
    meta: import('@xamle/types').PaginatedResponse<unknown>['meta'];
  }>(`/comments/policy/${policyId}?page=${page}`);
}

export function createComment(body: import('@xamle/types').CreateCommentDto) {
  return authFetch<import('@xamle/types').Comment>('/comments', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ─── Auth ────────────────────────────────────────────────────
export function login(body: import('@xamle/types').LoginDto) {
  return apiFetch<{ user: import('@xamle/types').User; accessToken: string; expiresIn: number }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export function register(body: import('@xamle/types').RegisterDto) {
  return apiFetch<{ user: import('@xamle/types').User; accessToken: string; expiresIn: number }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export function logout() {
  return authFetch('/auth/logout', { method: 'POST' });
}

export function refreshToken() {
  return apiFetch<{ accessToken: string; expiresIn: number }>('/auth/refresh', { method: 'POST' });
}

// ─── Profile ─────────────────────────────────────────────────
export function fetchMyProfile() {
  return authFetch<import('@xamle/types').User>('/users/me');
}

export function fetchMySubscriptions() {
  return authFetch<import('@xamle/types').Subscription[]>('/users/me/subscriptions');
}

export function subscribeToPolicy(policyId: string, channels: string[]) {
  return authFetch(`/users/me/subscriptions/${policyId}`, {
    method: 'PUT',
    body: JSON.stringify({ channels }),
  });
}

export { ApiError };

// ─── Generic api helper for components using api.get / api.patch ──────────────
type RequestOptions = Record<string, unknown>;

export const api = {
  get: <T = unknown>(path: string, params?: RequestOptions): Promise<T> => {
    const qs = params && Object.keys(params).length
      ? '?' + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)]),
          ),
        ).toString()
      : '';
    return authFetch<T>(`${path}${qs}`);
  },
  post: <T = unknown>(path: string, body?: unknown): Promise<T> =>
    authFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T = unknown>(path: string, body?: unknown): Promise<T> =>
    authFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = unknown>(path: string): Promise<T> =>
    authFetch<T>(path, { method: 'DELETE' }),
};
