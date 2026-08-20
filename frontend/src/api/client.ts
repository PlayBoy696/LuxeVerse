import { getAccessToken, setAccessToken, clearAccessToken } from '../auth/token.js';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    const payload = contentType.includes('application/json') ? await response.json().catch(() => null) : null;
    const message = payload?.message || payload?.error || 'Request failed';
    throw new Error(message);
  }

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

let refreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Refresh failed');
      }

      const payload = await res.json().catch(() => null);
      const token = payload?.data?.accessToken ?? null;
      if (token) {
        setAccessToken(token);
        return token;
      }

      clearAccessToken();
      return null;
    } catch (err) {
      clearAccessToken();
      return null;
    } finally {
      refreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit, retry = true): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers as HeadersInit || {});
  const hasFormDataBody = typeof FormData !== 'undefined' && init?.body instanceof FormData;

  if (!headers.has('Content-Type') && !(init && init.method === 'DELETE') && !hasFormDataBody && init?.body != null) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers, credentials: 'include' });

  if (response.status === 401 && retry) {
    const newToken = await attemptRefresh();
    if (newToken) {
      const headers2 = new Headers(init?.headers as HeadersInit || {});
      const hasFormDataBody2 = typeof FormData !== 'undefined' && init?.body instanceof FormData;
      if (!headers2.has('Content-Type') && !(init && init.method === 'DELETE') && !hasFormDataBody2 && init?.body != null) {
        headers2.set('Content-Type', 'application/json');
      }
      headers2.set('Authorization', `Bearer ${newToken}`);

      return fetch(input, { ...init, headers: headers2, credentials: 'include' });
    }
  }

  return response;
}

export async function uploadMultipart<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetchWithAuth(`${API_URL}${path}`, {
    method: 'POST',
    body: formData,
  });

  return parseResponse<T>(response);
}

export const api = {
  get: async <T>(path: string): Promise<T> => {
    const response = await fetchWithAuth(`${API_URL}${path}`, { method: 'GET' });
    return parseResponse<T>(response);
  },

  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const response = await fetchWithAuth(`${API_URL}${path}`, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return parseResponse<T>(response);
  },

  patch: async <T>(path: string, body?: unknown): Promise<T> => {
    const response = await fetchWithAuth(`${API_URL}${path}`, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return parseResponse<T>(response);
  },

  del: async <T>(path: string): Promise<T> => {
    const response = await fetchWithAuth(`${API_URL}${path}`, { method: 'DELETE' });
    return parseResponse<T>(response);
  },
};
