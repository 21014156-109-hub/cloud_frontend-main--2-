export const BASE_LOGIN_URL: string = import.meta.env.VITE_BASE_LOGIN_URL || 'http://127.0.0.1:3000/v1/';
export const BASE_URL_UI: string = import.meta.env.VITE_BASE_URL_UI || (typeof window !== 'undefined' ? window.location.origin : '');
