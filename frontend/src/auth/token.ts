const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}
