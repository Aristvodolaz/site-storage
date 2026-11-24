import { createTheme, alpha, type Theme } from '@mui/material/styles';

type PaletteMode = 'light' | 'dark';
import { ruRU } from '@mui/x-data-grid';

// Дизайн-токены сайта. Цвета статусов совпадают с мобильным приложением (storage_mobile):
// успех #2E7D32, предупреждение #E65100, ошибка #D32F2F, акцент #1565C0.
// Менять значения здесь, а не в компонентах.
export const tokens = {
  radius: 12,
  radiusSm: 8,
  light: {
    brand: '#1565C0',
    brandStrong: '#0D47A1',
    success: '#2E7D32',
    warning: '#B45309',
    danger: '#C62828',
    pageBg: '#F5F7FA',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF2F7',
    textPrimary: '#18212F',
    textSecondary: '#5A6678',
    border: '#DCE3EC',
  },
  dark: {
    brand: '#7CB3FF',
    brandStrong: '#A8CBFF',
    success: '#81C784',
    warning: '#FFB74D',
    danger: '#EF9A9A',
    pageBg: '#0E1319',
    surface: '#161D27',
    surfaceMuted: '#1D2735',
    textPrimary: '#E6EDF5',
    textSecondary: '#9AA7B8',
    border: '#2A3545',
  },
} as const;

// Палитра серий для графиков и таблиц с разноцветными метками (порядок важен)
export const seriesColors: Record<PaletteMode, string[]> = {
  light: ['#1565C0', '#2E7D32', '#E65100', '#7B1FA2', '#C62828', '#00838F', '#AD1457', '#5D4037'],
  dark: ['#7CB3FF', '#81C784', '#FFB74D', '#CE93D8', '#EF9A9A', '#4DD0E1', '#F48FB1', '#BCAAA4'],
};

// Общие стили графиков Recharts: сетка, подписи, подсказка. Берутся из темы, поэтому работают в тёмной теме.
export const chartStyle = (t: Theme) => ({
  grid: { stroke: t.palette.divider },
  tick: { fontSize: 12, fill: t.palette.text.secondary },
  tooltip: {
    contentStyle: {
      backgroundColor: t.palette.background.paper,
      border: `1px solid ${t.palette.divider}`,
      borderRadius: tokens.radiusSm,
      color: t.palette.text.primary,
    },
    labelStyle: { color: t.palette.text.primary },
    itemStyle: { color: t.palette.text.primary },
  },
  legend: { wrapperStyle: { color: t.palette.text.secondary } },
});

export const makeTheme = (mode: PaletteMode) => {
  const c = tokens[mode === 'dark' ? 'dark' : 'light'];
  const shadow = mode === 'dark'
    ? '0 1px 2px rgba(0, 0, 0, 0.4)'
    : '0 1px 2px rgba(16, 24, 40, 0.05), 0 4px 12px rgba(16, 24, 40, 0.04)';

  return createTheme(
    {
      shape: { borderRadius: tokens.radius },
      palette: {
        mode,
        primary: { main: c.brand, dark: c.brandStrong },
        success: { main: c.success },
        warning: { main: c.warning },
        error: { main: c.danger },
        text: { primary: c.textPrimary, secondary: c.textSecondary },
        background: { default: c.pageBg, paper: c.surface },
        divider: c.border,
      },
      typography: {
        fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h6: { fontWeight: 600, letterSpacing: '-0.01em' },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: { WebkitFontSmoothing: 'antialiased' },
            // Видимый фокус для клавиатуры (WCAG 2.4.7)
            '*:focus-visible': { outline: `2px solid ${c.brand}`, outlineOffset: 2 },
          },
        },
        MuiAppBar: {
          defaultProps: { elevation: 0, color: 'transparent' },
          styleOverrides: {
            root: {
              backgroundColor: alpha(c.surface, 0.82),
              backdropFilter: 'saturate(180%) blur(12px)',
              color: c.textPrimary,
              borderBottom: `1px solid ${c.border}`,
              backgroundImage: 'none',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: { boxShadow: shadow, backgroundImage: 'none', border: `1px solid ${c.border}` },
          },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: { borderRadius: tokens.radiusSm, minHeight: 36 },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: { borderRadius: tokens.radiusSm, backgroundColor: c.surface },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: { fontWeight: 500, borderRadius: 999 },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: { textTransform: 'none', fontWeight: 600, minHeight: 44, borderRadius: tokens.radiusSm },
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: { textTransform: 'none', borderRadius: tokens.radiusSm },
          },
        },
      },
    },
    ruRU,
  );
};

export const theme = makeTheme('light');
