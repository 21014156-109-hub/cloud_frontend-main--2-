export interface AuthUserData {
  id?: number;
  clientId?: number;
  roleSlug: 'admin' | 'client' | string;
  [key: string]: unknown;
}

export interface AuthPayload {
  token: string;
  userData: AuthUserData;
}

export interface AuthConfigShape {
  AUTHORIZATION: string;
  USER_DATA: string; // stringified JSON
  IS_LOGGEDIN: 'true' | 'false' | string;
  CLIENT_ID: number;
}

export const AuthConfig: AuthConfigShape = {
  AUTHORIZATION: '',
  USER_DATA: '',
  IS_LOGGEDIN: 'false',
  CLIENT_ID: 0,
};

export function setAuthUserData(userData: AuthPayload): boolean {
  AuthConfig.AUTHORIZATION = userData.token;
  AuthConfig.USER_DATA = JSON.stringify(userData.userData);
  AuthConfig.IS_LOGGEDIN = 'true';

  let clientId = 0;
  if (userData.userData.roleSlug === 'admin') {
    clientId = 0;
  } else if (userData.userData.roleSlug === 'client') {
    clientId = (userData.userData.id as number) || 0;
  } else {
    clientId = (userData.userData.clientId as number) || 0;
  }
  AuthConfig.CLIENT_ID = clientId;
  localStorage.setItem('token', userData.token);
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userData', JSON.stringify(userData.userData));
  localStorage.setItem('clientId', clientId.toString());
  return true;
}

export function unsetAuthUserData(): boolean {
  AuthConfig.AUTHORIZATION = '';
  AuthConfig.USER_DATA = '';
  AuthConfig.IS_LOGGEDIN = 'false';
  AuthConfig.CLIENT_ID = 0;
  localStorage.clear();
  return true;
}

export function getAuthUserData(): AuthUserData | null {
  if (AuthConfig.USER_DATA && AuthConfig.USER_DATA !== '') {
    try { return JSON.parse(AuthConfig.USER_DATA); } catch { return null; }
  }
  // Fallback to localStorage to persist across reloads
  const stored = localStorage.getItem('userData');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // hydrate AuthConfig for runtime
      AuthConfig.USER_DATA = stored;
      AuthConfig.AUTHORIZATION = localStorage.getItem('token') || '';
      AuthConfig.IS_LOGGEDIN = localStorage.getItem('isLoggedIn') || 'false';
      AuthConfig.CLIENT_ID = Number(localStorage.getItem('clientId') || 0);
      return parsed;
    } catch {
      return null;
    }
  }
  return null;
}

export function getClientID(): number {
  if (AuthConfig.CLIENT_ID && AuthConfig.CLIENT_ID > 0) return AuthConfig.CLIENT_ID;
  const stored = localStorage.getItem('clientId');
  return stored ? Number(stored) : 0;
}

// Update the stored user data (both runtime AuthConfig and localStorage)
export function updateAuthUserData(current: AuthUserData | null, updates: Partial<AuthUserData>): boolean {
  const base = (current && Object.keys(current).length > 0) ? current : (() => {
    try { return JSON.parse(localStorage.getItem('userData') || '{}') as AuthUserData; } catch { return {} as AuthUserData; }
  })();

  const merged: AuthUserData = { ...(base as AuthUserData), ...(updates as AuthUserData) };
  AuthConfig.USER_DATA = JSON.stringify(merged);
  // keep token/client id as-is
  localStorage.setItem('userData', AuthConfig.USER_DATA);
  return true;
}
