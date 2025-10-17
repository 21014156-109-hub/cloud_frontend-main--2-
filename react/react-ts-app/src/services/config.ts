// In dev we prefer a relative /v1/ path so Vite's proxy can forward calls to the backend
export const BASE_LOGIN_URL: string = import.meta.env.VITE_BASE_LOGIN_URL || '/v1/';
export const BASE_URL_UI: string = import.meta.env.VITE_BASE_URL_UI || (typeof window !== 'undefined' ? window.location.origin : '');
