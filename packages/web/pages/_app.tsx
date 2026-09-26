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
    overflow-x: hidden;
  }

  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  a {
    color: ${({ theme }) => theme.colors.blue};
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  label,
  strong,
  span,
  div {
    border-color: ${({ theme }) => theme.colors.border};
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
  .ant-card-body,
  .ant-modal-footer {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-card-head-title,
  .ant-card-meta-title,
  .ant-card-meta-description,
  .ant-modal-title,
  .ant-form-item-label > label,
  .ant-radio-wrapper,
  .ant-checkbox-wrapper,
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td,
  .ant-descriptions-item-label,
  .ant-descriptions-item-content,
  .ant-typography,
  .ant-select,
  .ant-select-selection-item,
  .ant-select-item,
  .ant-popover-inner-content,
  .ant-modal-confirm-title,
  .ant-modal-confirm-content {
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-input,
  .ant-input-number,
  .ant-select-selector,
  .ant-select-dropdown,
  .ant-picker,
  .ant-radio-button-wrapper,
  .ant-popover-inner,
  .ant-popover-arrow-content {
    background: ${({ theme }) => theme.colors.surfaceElevated} !important;
    border-color: ${({ theme }) => theme.colors.border} !important;
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-input::placeholder,
  .ant-select-selection-placeholder {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  .ant-select-item-option-active:not(.ant-select-item-option-disabled),
  .ant-select-item-option-selected:not(.ant-select-item-option-disabled),
  .ant-dropdown-menu,
  .ant-dropdown-menu-item,
  .ant-menu,
  .ant-menu-item {
    background: ${({ theme }) => theme.colors.surfaceSecondary} !important;
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-radio-button-wrapper:not(.ant-radio-button-wrapper-checked):hover,
  .ant-checkbox-wrapper:hover,
  .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    background: ${({ theme }) => theme.colors.blue} !important;
    border-color: ${({ theme }) => theme.colors.blue} !important;
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#082f49' : '#ffffff'} !important;
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

  .ant-btn-dashed {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-btn-primary {
    background: ${({ theme }) => theme.colors.blue};
    border-color: ${({ theme }) => theme.colors.blue};
    color: ${({ theme }) => (theme.mode === 'dark' ? '#082f49' : '#ffffff')};
  }

  .ant-btn[disabled],
  .ant-btn[disabled]:hover,
  .ant-btn[disabled]:focus,
  .ant-btn[disabled]:active {
    background: ${({ theme }) => theme.colors.surfaceSecondary} !important;
    border-color: ${({ theme }) => theme.colors.border} !important;
    color: ${({ theme }) => theme.colors.mutedText} !important;
    opacity: 0.85;
  }

  .ant-table-tbody > tr.ant-table-row:hover > td {
    background: ${({ theme }) => theme.colors.hover};
  }

  .ant-table-placeholder,
  .ant-table-expanded-row-fixed,
  .ant-list-empty-text,
  .ant-skeleton-content .ant-skeleton-title,
  .ant-skeleton-content .ant-skeleton-paragraph > li {
    background: ${({ theme }) => theme.colors.surfaceElevated} !important;
    color: ${({ theme }) => theme.colors.mutedText};
  }

  .ant-empty-description,
  .ant-form-item-extra,
  .ant-form-item-explain,
  .ant-checkbox + span,
  .ant-radio + span,
  .ant-select-arrow,
  .ant-input-suffix,
  .ant-input-prefix {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  .ant-alert {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-notification-notice,
  .ant-message-notice-content {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-notification-notice-message,
  .ant-notification-notice-description {
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-tag {
    background: ${({ theme }) => theme.colors.surfaceSecondary};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-tag a,
  .ant-tag span {
    color: inherit;
  }

  .ant-modal {
    max-width: calc(100vw - 24px);
  }

  .ant-modal-body {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    max-height: calc(100vh - 48px);
    overflow-y: auto;
  }

  @media (max-width: 700px) {
    .ant-modal {
      margin: 8px auto;
      top: 0;
      width: calc(100vw - 16px) !important;
    }

    .ant-modal-centered .ant-modal {
      display: block;
    }

    .ant-table {
      font-size: 0.85em;
    }
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
