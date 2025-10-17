const STORAGE_KEY = 'app_theme_colors';

export type ThemeColors = {
  header?: string;
  sidebar?: string;
};

export function loadTheme(): ThemeColors {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ThemeColors;
  } catch {
    return {};
  }
}

export function saveTheme(theme: ThemeColors) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme || {}));
    applyTheme(theme);
  } catch {
    // ignore
  }
}

export function applyTheme(theme: ThemeColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme.header) root.style.setProperty('--header-bg', theme.header);
  if (theme.sidebar) root.style.setProperty('--sidebar-bg', theme.sidebar);
}

// apply saved theme on import (when running in browser)
if (typeof window !== 'undefined') {
  try { applyTheme(loadTheme()); } catch { /* ignore */ }
}

export const DEFAULT_HEADER_COLORS = ['#273245', '#1f2a44', '#2b3a55', '#3b4b66', '#0b4f6c'];
export const DEFAULT_SIDEBAR_COLORS = ['#ffffff', '#f8f9fa', '#ededf2', '#2b2f33', '#f0f4f8'];

export default { loadTheme, saveTheme, applyTheme };
