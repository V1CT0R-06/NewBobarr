// eslint-disable-next-line import/named
import { DefaultTheme } from 'styled-components';

export type ThemeMode = 'dark' | 'light';

const sharedTheme = {
  navbarHeight: 60,
  tmdbCardHeight: 430,
};

export const darkTheme: DefaultTheme = {
  ...sharedTheme,
  mode: 'dark',
  colors: {
    background: '#111827',
    surface: '#172033',
    surfaceElevated: '#1f2937',
    surfaceSecondary: '#263244',
    text: '#f8fafc',
    textSecondary: '#dbeafe',
    mutedText: '#94a3b8',
    border: '#334155',
    overlay: 'rgba(15, 23, 42, 0.88)',
    shadow: 'rgba(0, 0, 0, 0.28)',
    navbarBackground: '#0f172a',
    buttonBackground: '#263244',
    buttonText: '#f8fafc',
    hover: '#263244',
    coral: '#fb7185',
    blue: '#60a5fa',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#fb7185',
  },
};

export const lightTheme: DefaultTheme = {
  ...sharedTheme,
  mode: 'light',
  colors: {
    background: '#f4f7fb',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    surfaceSecondary: '#eef2f7',
    text: '#172033',
    textSecondary: '#334155',
    mutedText: '#64748b',
    border: '#dbe4ef',
    overlay: 'rgba(15, 23, 42, 0.82)',
    shadow: 'rgba(15, 23, 42, 0.12)',
    navbarBackground: '#ffffff',
    buttonBackground: '#eef2f7',
    buttonText: '#172033',
    hover: '#e8eef7',
    coral: '#e85d75',
    blue: '#2563eb',
    success: '#059669',
    warning: '#b45309',
    error: '#dc2626',
  },
};

export function getTheme(mode: ThemeMode) {
  return mode === 'light' ? lightTheme : darkTheme;
}
