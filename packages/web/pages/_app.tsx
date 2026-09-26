import 'pure-react-carousel/dist/react-carousel.es.css';
import 'antd/dist/antd.css';

import { AppProps } from 'next/app';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Reset } from 'styled-reset';

import { getTheme, ThemeMode } from '../components/theme';
import { ThemeModeContext } from '../components/theme-context';
import { loadFonts } from '../components/fonts';

const GlobalStyles = createGlobalStyle`
  html {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol';

    &.source-sans-pro {
      font-family: 'Source Sans Pro', sans-serif;
    }
  }

  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    min-height: 100vh;
  }

  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  a {
    color: ${({ theme }) => theme.colors.blue};
  }

  button,
  input,
  textarea,
  select {
    font-family: inherit;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.blue};
    outline-offset: 2px;
  }

  .ant-card,
  .ant-modal-content,
  .ant-modal-header,
  .ant-table,
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.border};
  }

  .ant-card {
    border-color: ${({ theme }) => theme.colors.border};
    border-radius: 10px;
  }

  .ant-card-head,
  .ant-modal-footer {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-card-head-title,
  .ant-modal-title,
  .ant-form-item-label > label,
  .ant-radio-wrapper,
  .ant-checkbox-wrapper {
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-input,
  .ant-input-number,
  .ant-select-selector,
  .ant-radio-button-wrapper {
    background: ${({ theme }) => theme.colors.surfaceElevated} !important;
    border-color: ${({ theme }) => theme.colors.border} !important;
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-input::placeholder {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  .ant-btn {
    border-radius: 8px;
  }

  .ant-btn-default {
    background: ${({ theme }) => theme.colors.buttonBackground};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.buttonText};
  }

  .ant-btn-default:hover,
  .ant-btn-default:focus {
    background: ${({ theme }) => theme.colors.hover};
    border-color: ${({ theme }) => theme.colors.blue};
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-table-tbody > tr.ant-table-row:hover > td {
    background: ${({ theme }) => theme.colors.hover};
  }

  .ant-empty-description,
  .ant-form-item-extra,
  .ant-form-item-explain {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  .icon-spin {
    -webkit-animation: icon-spin 2s infinite linear;
    animation: icon-spin 2s infinite linear;
  }

  @-webkit-keyframes icon-spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(359deg);
      transform: rotate(359deg);
    }
  }

  @keyframes icon-spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(359deg);
      transform: rotate(359deg);
    }
  }
`;

function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.localStorage.getItem('bobarr-theme') === 'light'
    ? 'light'
    : 'dark';
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    loadFonts();
    setMode(getStoredThemeMode());
  }, []);

  useEffect(() => {
    window.localStorage.setItem('bobarr-theme', mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleMode: () =>
        setMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark')),
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={getTheme(mode)}>
        <Reset />
        <GlobalStyles />
        <Component {...pageProps} />
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
