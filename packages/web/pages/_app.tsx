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
    color: inherit;
    border-color: ${({ theme }) => theme.colors.border};
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${({ theme }) => theme.colors.text};
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
  .ant-modal-confirm-body,
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
  .ant-modal-confirm-body-wrapper,
  .ant-modal-footer {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-card-head-title,
  .ant-card-meta-title,
  .ant-card-meta-description,
  .ant-modal-title,
  .ant-modal-confirm-body .ant-modal-confirm-title,
  .ant-modal-confirm-body .ant-modal-confirm-content,
  .ant-modal-confirm-body .ant-modal-confirm-content *,
  .ant-form-item-label > label,
  .ant-form-item,
  .ant-form,
  .ant-form-item-control,
  .ant-form-item-control-input,
  .ant-form-item-control-input-content,
  .ant-radio-wrapper,
  .ant-checkbox-wrapper,
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td,
  .ant-descriptions-item-label,
  .ant-descriptions-item-content,
  .ant-typography,
  .ant-picker-input > input,
  .ant-select,
  .ant-select-selection-item,
  .ant-select-item,
  .ant-popover-inner-content,
  .ant-badge,
  .ant-badge-status-text,
  .ant-modal-confirm-title,
  .ant-modal-confirm-content {
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-modal-confirm-body > .anticon {
    color: ${({ theme }) => theme.colors.warning};
  }

  .ant-modal-confirm .ant-btn {
    background: ${({ theme }) => theme.colors.buttonBackground} !important;
    border-color: ${({ theme }) => theme.colors.border} !important;
    color: ${({ theme }) => theme.colors.buttonText} !important;
  }

  .ant-modal-confirm .ant-btn:hover,
  .ant-modal-confirm .ant-btn:focus {
    background: ${({ theme }) => theme.colors.hover} !important;
    border-color: ${({ theme }) => theme.colors.blue} !important;
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-modal-confirm .ant-btn-primary:not(.ant-btn-dangerous) {
    background: ${({ theme }) => theme.colors.blue} !important;
    border-color: ${({ theme }) => theme.colors.blue} !important;
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#082f49' : '#ffffff'} !important;
  }

  .ant-modal-confirm .ant-btn-dangerous {
    background: ${({ theme }) => theme.colors.surfaceElevated} !important;
    border-color: ${({ theme }) => theme.colors.error} !important;
    color: ${({ theme }) => theme.colors.error} !important;
  }

  .ant-input,
  .ant-input-number,
  .ant-input-affix-wrapper,
  .ant-select-selector,
  .ant-select-dropdown,
  .ant-picker,
  .ant-picker-panel,
  .ant-picker-header,
  .ant-picker-content th,
  .ant-picker-cell,
  .ant-radio-button-wrapper,
  .ant-popover-inner,
  .ant-popover-arrow-content,
  .ant-tooltip-inner,
  .ant-dropdown-menu {
    background: ${({ theme }) => theme.colors.surfaceElevated} !important;
    border-color: ${({ theme }) => theme.colors.border} !important;
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-input::placeholder,
  .ant-picker-input > input::placeholder,
  .ant-select-selection-placeholder {
    color: ${({ theme }) => theme.colors.mutedText};
  }

  .ant-select-item-option-active:not(.ant-select-item-option-disabled),
  .ant-select-item-option-selected:not(.ant-select-item-option-disabled),
  .ant-dropdown-menu,
  .ant-dropdown-menu-item,
  .ant-menu,
  .ant-menu-item,
  .ant-picker-cell-in-view,
  .ant-picker-header button {
    background: ${({ theme }) => theme.colors.surfaceSecondary} !important;
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-picker-cell-disabled,
  .ant-select-item-option-disabled,
  .ant-dropdown-menu-item-disabled {
    color: ${({ theme }) => theme.colors.mutedText} !important;
  }

  .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
    border-color: ${({ theme }) => theme.colors.blue} !important;
  }

  .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner,
  .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
  .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {
    background: ${({ theme }) => theme.colors.blue} !important;
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#082f49' : '#ffffff'} !important;
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

  .ant-checkbox-inner,
  .ant-radio-inner {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border-color: ${({ theme }) => theme.colors.border};
  }

  .ant-checkbox-checked .ant-checkbox-inner,
  .ant-radio-checked .ant-radio-inner {
    background: ${({ theme }) => theme.colors.blue};
    border-color: ${({ theme }) => theme.colors.blue};
  }

  .ant-slider-rail {
    background: ${({ theme }) => theme.colors.surfaceSecondary};
  }

  .ant-slider-track,
  .ant-slider:hover .ant-slider-track {
    background: ${({ theme }) => theme.colors.blue};
  }

  .ant-slider-handle {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.blue};
  }

  .ant-btn {
    border-radius: 8px;
  }

  .ant-btn:not(.ant-btn-primary):not(.ant-btn-dangerous),
  .ant-btn-default {
    background: ${({ theme }) => theme.colors.buttonBackground} !important;
    border-color: ${({ theme }) => theme.colors.border} !important;
    color: ${({ theme }) => theme.colors.buttonText} !important;
  }

  .ant-btn:not(.ant-btn-primary):not(.ant-btn-dangerous):hover,
  .ant-btn:not(.ant-btn-primary):not(.ant-btn-dangerous):focus,
  .ant-btn-default:hover,
  .ant-btn-default:focus {
    background: ${({ theme }) => theme.colors.hover} !important;
    border-color: ${({ theme }) => theme.colors.blue} !important;
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-btn-dashed {
    background: ${({ theme }) => theme.colors.surfaceElevated} !important;
    border-color: ${({ theme }) => theme.colors.border} !important;
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-btn-primary {
    background: ${({ theme }) => theme.colors.blue} !important;
    border-color: ${({ theme }) => theme.colors.blue} !important;
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#082f49' : '#ffffff'} !important;
  }

  .ant-btn-dangerous,
  .ant-btn-dangerous:hover,
  .ant-btn-dangerous:focus {
    background: ${({ theme }) => theme.colors.surfaceElevated} !important;
    border-color: ${({ theme }) => theme.colors.error} !important;
    color: ${({ theme }) => theme.colors.error} !important;
  }

  .ant-modal-close,
  .ant-modal-close-x {
    color: ${({ theme }) => theme.colors.mutedText} !important;
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

  .ant-table-thead > tr > th {
    background: ${({ theme }) => theme.colors.surfaceSecondary} !important;
  }

  .ant-table-placeholder,
  .ant-empty,
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

  .ant-alert-message,
  .ant-alert-description,
  .ant-alert-content,
  .ant-alert-content * {
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-alert-info {
    border-color: ${({ theme }) => theme.colors.blue};
  }

  .ant-alert-warning {
    border-color: ${({ theme }) => theme.colors.warning};
  }

  .ant-alert-error {
    border-color: ${({ theme }) => theme.colors.error};
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

  .ant-badge-count {
    background: ${({ theme }) => theme.colors.coral};
    color: #ffffff;
  }

  .ant-badge-multiple-words {
    color: #ffffff !important;
  }

  .ant-pagination-item,
  .ant-pagination-prev .ant-pagination-item-link,
  .ant-pagination-next .ant-pagination-item-link {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border-color: ${({ theme }) => theme.colors.border};
  }

  .ant-pagination-item a,
  .ant-pagination-prev .ant-pagination-item-link,
  .ant-pagination-next .ant-pagination-item-link {
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-pagination-item-active {
    border-color: ${({ theme }) => theme.colors.blue};
  }

  .ant-pagination-item-active a {
    color: ${({ theme }) => theme.colors.blue};
  }

  .ant-pagination-item-ellipsis,
  .ant-pagination-disabled .ant-pagination-item-link {
    color: ${({ theme }) => theme.colors.mutedText} !important;
  }

  .ant-calendar-picker,
  .ant-picker-dropdown {
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-picker-dropdown .ant-picker-panel-container {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    color: ${({ theme }) => theme.colors.text};
  }

  .ant-skeleton.ant-skeleton-active .ant-skeleton-title,
  .ant-skeleton.ant-skeleton-active .ant-skeleton-paragraph > li,
  .ant-skeleton.ant-skeleton-active .ant-skeleton-avatar {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.surfaceSecondary} 25%,
      ${({ theme }) => theme.colors.hover} 37%,
      ${({ theme }) => theme.colors.surfaceSecondary} 63%
    ) !important;
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
    button,
    [role='button'],
    .ant-btn,
    .ant-pagination-item,
    .ant-pagination-prev,
    .ant-pagination-next {
      min-height: 44px;
      touch-action: manipulation;
    }

    .ant-input,
    .ant-input-affix-wrapper,
    .ant-input-number,
    .ant-picker,
    .ant-select-selector {
      font-size: 16px !important;
      min-height: 44px !important;
    }

    .ant-input-affix-wrapper > input.ant-input {
      min-height: auto !important;
    }

    .ant-select-selection-item,
    .ant-select-selection-placeholder {
      align-items: center;
      display: flex;
      line-height: 42px !important;
    }

    .ant-checkbox-wrapper,
    .ant-radio-wrapper {
      align-items: center;
      display: inline-flex;
      min-height: 40px;
      padding-bottom: 4px;
      padding-top: 4px;
    }

    .ant-modal-body {
      max-height: calc(100dvh - 116px);
      padding: 16px;
    }

    .ant-modal-footer {
      padding: 10px 16px;
    }

    .ant-modal-footer .ant-btn {
      min-width: 96px;
    }

    .ant-modal-close,
    .ant-modal-close-x {
      height: 44px;
      line-height: 44px;
      width: 44px;
    }

    .ant-notification {
      margin-right: 8px;
      max-width: calc(100vw - 16px);
      width: calc(100vw - 16px);
    }

    .ant-modal {
      margin: 8px auto;
      top: 0;
      width: calc(100vw - 16px) !important;
    }

    .media-details-modal,
    .mobile-fullscreen-modal {
      overflow: hidden;
      padding: 0;
    }

    .media-details-modal .ant-modal,
    .mobile-fullscreen-modal .ant-modal {
      height: 100vh;
      height: 100dvh;
      margin: 0;
      max-width: none;
      padding: 0;
      width: 100vw !important;
    }

    .media-details-modal .ant-modal-content,
    .mobile-fullscreen-modal .ant-modal-content {
      border-radius: 0;
      height: 100%;
      overflow: hidden;
    }

    .media-details-modal .ant-modal-body {
      height: 100%;
      max-height: none;
      overflow: hidden;
      padding: 0 !important;
    }

    .mobile-fullscreen-modal .ant-modal-body {
      height: calc(100% - 65px);
      max-height: none;
      overscroll-behavior-y: contain;
      overflow-y: auto;
      padding: 16px;
      -webkit-overflow-scrolling: touch;
    }

    .mobile-fullscreen-modal .ant-modal-footer {
      min-height: 65px;
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
