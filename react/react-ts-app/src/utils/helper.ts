export const AuthConfig: any = {
  AUTHORIZATION: '',
  USER_DATA: '',
  IS_LOGGEDIN: 'false',
  CLIENT_ID: 0
};

export function setAuthUserData(userData: any): boolean {
  AuthConfig.AUTHORIZATION = userData.token;
  AuthConfig.USER_DATA = JSON.stringify(userData.userData);
  AuthConfig.IS_LOGGEDIN = 'true';

  let clientId = 0;
  if (userData.userData.roleSlug === 'admin') {
    clientId = 0;
  } else if (userData.userData.roleSlug === 'client') {
    clientId = userData.userData.id;
  } else {
    clientId = userData.userData.clientId;
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

export function getAuthUserData() {
  return AuthConfig.USER_DATA !== '' ? JSON.parse(AuthConfig.USER_DATA) : null;
}
