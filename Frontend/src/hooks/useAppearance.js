/**
 * useAppearance — Appearance preferences với localStorage + instant CSS apply.
 *
 * Cách hoạt động:
 *   1. Load settings từ localStorage khi khởi tạo (hoặc dùng default).
 *   2. `applyAppearance()` ghi CSS variables / data-attributes lên <html> ngay lập tức.
 *   3. `saveAppearance(prefs)` lưu vào localStorage và apply.
 *
 * CSS Variables bị ảnh hưởng:
 *   --accent-primary, --accent-secondary, --accent-light, --accent-glow
 *   font-size trên <html>
 *
 * Data attributes trên <html>:
 *   data-theme="dark|light|system"
 *   data-density="compact|comfortable|spacious"
 *   data-reduced-motion="true|false"
 *   data-high-contrast="true|false"
 *   data-color-blind="none|deuteranopia|protanopia|tritanopia|achromatopsia"
 */

const STORAGE_KEY = 'aura_appearance';

export const DEFAULT_APPEARANCE = {
  theme: 'dark',
  accentColor: '#7c5cbf',
  density: 'comfortable',
  sidebarStyle: 'fixed',
  reducedMotion: false,
  highContrast: false,
  colorBlindMode: 'none',
  fontSize: 'medium',
};

/** Tính màu secondary/light/glow từ accent hex */
function deriveAccentShades(hex) {
  // Đơn giản: secondary nhạt hơn 15%, light nhạt hơn 30%
  return {
    primary: hex,
    secondary: lighten(hex, 15),
    light: lighten(hex, 30),
    glow: hexToRgba(hex, 0.3),
  };
}

function lighten(hex, pct) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * pct));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * pct));
  const b = Math.min(255, (num & 0xff) + Math.round(2.55 * pct));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function hexToRgba(hex, alpha) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const FONT_SIZE_MAP = {
  small: { size: '13px', scale: '0.867' },
  medium: { size: '15px', scale: '1' },
  large: { size: '17px', scale: '1.133' },
};

const LIGHT_THEME_VARS = {
  '--bg-primary': '#f5f4fb',
  '--bg-secondary': '#edeaf7',
  '--bg-tertiary': '#e5e2f2',
  '--bg-card': '#ffffff',
  '--bg-input': '#f0eeff',
  '--bg-hover': '#e8e5f5',
  '--text-primary': '#1a1630',
  '--text-secondary': '#4a4570',
  '--text-muted': '#8b87a8',
  '--text-link': '#7c5cbf',
  '--border-color': 'rgba(0,0,0,0.08)',
  '--border-active': 'rgba(124,92,191,0.4)',
};

const DARK_THEME_VARS = {
  '--bg-primary': '#13111c',
  '--bg-secondary': '#1c1927',
  '--bg-tertiary': '#242133',
  '--bg-card': '#1e1b2e',
  '--bg-input': '#252238',
  '--bg-hover': '#2a2740',
  '--text-primary': '#f0eeff',
  '--text-secondary': '#a09bbf',
  '--text-muted': '#6b6585',
  '--text-link': '#9b7fe8',
  '--border-color': 'rgba(255,255,255,0.08)',
  '--border-active': 'rgba(124,92,191,0.5)',
};

const DENSITY_PADDING_MAP = {
  compact: '0.75',
  comfortable: '1',
  spacious: '1.35',
};

/** Apply tất cả preferences lên DOM ngay lập tức */
export function applyAppearance(prefs) {
  const root = document.documentElement;
  const merged = { ...DEFAULT_APPEARANCE, ...prefs };

  // ── Theme ──────────────────────────────────────────────────
  let resolvedTheme = merged.theme;
  if (merged.theme === 'system') {
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', resolvedTheme);

  const themeVars = resolvedTheme === 'light' ? LIGHT_THEME_VARS : DARK_THEME_VARS;
  Object.entries(themeVars).forEach(([k, v]) => root.style.setProperty(k, v));

  // ── Accent Color ───────────────────────────────────────────
  const shades = deriveAccentShades(merged.accentColor);
  root.style.setProperty('--accent-primary', shades.primary);
  root.style.setProperty('--accent-secondary', shades.secondary);
  root.style.setProperty('--accent-light', shades.light);
  root.style.setProperty('--accent-glow', shades.glow);
  root.style.setProperty('--accent', shades.primary); // alias

  // ── Font Size ──────────────────────────────────────────────
  const fontConfig = FONT_SIZE_MAP[merged.fontSize] || FONT_SIZE_MAP.medium;
  root.style.fontSize = fontConfig.size;
  root.style.setProperty('--font-scale', fontConfig.scale);

  // ── Density ────────────────────────────────────────────────
  root.setAttribute('data-density', merged.density);
  root.style.setProperty('--density-scale', DENSITY_PADDING_MAP[merged.density] || '1');

  // ── Reduced Motion ─────────────────────────────────────────
  root.setAttribute('data-reduced-motion', String(merged.reducedMotion));
  if (merged.reducedMotion) {
    root.style.setProperty('--transition-fast', '0ms');
    root.style.setProperty('--transition-base', '0ms');
    root.style.setProperty('--transition-slow', '0ms');
  } else {
    root.style.setProperty('--transition-fast', '0.15s ease');
    root.style.setProperty('--transition-base', '0.25s ease');
    root.style.setProperty('--transition-slow', '0.4s ease');
  }

  // ── High Contrast ──────────────────────────────────────────
  root.setAttribute('data-high-contrast', String(merged.highContrast));

  // ── Color Blind ────────────────────────────────────────────
  root.setAttribute('data-color-blind', merged.colorBlindMode);

  // ── Sidebar style ──────────────────────────────────────────
  root.setAttribute('data-sidebar', merged.sidebarStyle);
}

/** Load từ localStorage, apply lên DOM, trả về prefs object */
export function loadAndApplyAppearance() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const prefs = raw ? { ...DEFAULT_APPEARANCE, ...JSON.parse(raw) } : { ...DEFAULT_APPEARANCE };
    applyAppearance(prefs);
    return prefs;
  } catch {
    applyAppearance(DEFAULT_APPEARANCE);
    return { ...DEFAULT_APPEARANCE };
  }
}

/** Lưu prefs vào localStorage và apply ngay */
export function saveAppearance(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Could not save appearance to localStorage', e);
  }
  applyAppearance(prefs);
}

/** Đọc prefs từ localStorage (không apply) */
export function getStoredAppearance() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_APPEARANCE, ...JSON.parse(raw) } : { ...DEFAULT_APPEARANCE };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}
