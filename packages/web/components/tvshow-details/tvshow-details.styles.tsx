import styled from 'styled-components';
import { MovieDetailsStyles } from '../movie-details/movie-details.styles';

export const TVShowSeasonsModalComponentStyles = styled(MovieDetailsStyles)`
  .seasons {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  .season-row {
    align-items: center;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    margin-bottom: 8px;
    margin-right: 4px;
    margin-left: 4px;
    padding: 8px 10px;
    transition: 0.1s linear;
    max-width: 145px;

    &.selected {
      border-color: ${({ theme }) => theme.colors.blue};
    }

    &.in-library {
      cursor: not-allowed;
      border-color: ${({ theme }) => theme.colors.border};
    }
  }

  .season-number {
    font-size: 1.1em;
    font-weight: 600;
  }

  .season-episodes-count {
    font-size: 0.9em;
  }

  .seasons-details {
    padding-top: 12px;

    .season-top {
      margin-bottom: 4px;
    }

    .season-title,
    .season-top {
      display: flex;
      align-items: center;
    }

    .season-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }

    .season-title,
    .season-replace {
      cursor: pointer;
    }

    .season-replace {
      font-weight: bold;
      display: flex;
      align-items: center;
      margin-left: 32px;
      background: ${({ theme }) => theme.colors.buttonBackground};
      border: 1px solid ${({ theme }) => theme.colors.border};
      border-radius: 5px;
      color: ${({ theme }) => theme.colors.buttonText};
      padding: 4px 8px;

      &:hover,
      &:focus {
        background: ${({ theme }) => theme.colors.hover};
        border-color: ${({ theme }) => theme.colors.blue};
        color: ${({ theme }) => theme.colors.text};
      }
    }

    .season-number {
      font-size: 1.25em;
      font-weight: 600;
      margin-right: 8px;
    }

    .season-year {
      font-size: 1em;
      font-weight: 300;
    }

    .season-toggle {
      margin-right: 12px;
      margin-top: 4px;
    }

    .ant-table {
      background: ${({ theme }) => theme.colors.surface};
      border: 1px solid ${({ theme }) => theme.colors.border};
      border-radius: 8px;
      color: ${({ theme }) => theme.colors.text};

      .ant-table-cell {
        background: transparent;
        color: ${({ theme }) => theme.colors.text};
      }

      tr:hover > td {
        background: ${({ theme }) => theme.colors.hover};
      }

      tr > td,
      tr > th {
        border: none;
      }
    }

    .episode-status-tag,
    .episode-action-tag {
      align-items: center;
      background: ${({ theme }) => theme.colors.surfaceSecondary} !important;
      border: 1px solid ${({ theme }) => theme.colors.border} !important;
      border-radius: 6px;
      color: ${({ theme }) => theme.colors.text} !important;
      display: inline-block;
      margin: 0;
      min-height: 28px;
      padding-top: 3px;
      text-align: center;
      width: 120px;
    }

    .episode-action-tag {
      background: ${({ theme }) => theme.colors.buttonBackground} !important;
      color: ${({ theme }) => theme.colors.buttonText} !important;
      cursor: pointer;

      &:hover,
      &:focus {
        background: ${({ theme }) => theme.colors.hover} !important;
        border-color: ${({ theme }) => theme.colors.blue} !important;
        color: ${({ theme }) => theme.colors.text} !important;
      }
    }

    .episode-status--downloaded {
      background: ${({ theme }) =>
        theme.mode === 'dark'
          ? 'rgba(96, 165, 250, 0.18)'
          : '#dbeafe'} !important;
      border-color: ${({ theme }) => theme.colors.blue} !important;
      color: ${({ theme }) =>
        theme.mode === 'dark' ? '#dbeafe' : '#1d4ed8'} !important;
    }

    .episode-status--downloading {
      background: ${({ theme }) =>
        theme.mode === 'dark'
          ? 'rgba(52, 211, 153, 0.16)'
          : '#d1fae5'} !important;
      border-color: ${({ theme }) => theme.colors.success} !important;
      color: ${({ theme }) =>
        theme.mode === 'dark' ? '#bbf7d0' : '#065f46'} !important;
    }

    .episode-status--searching {
      background: ${({ theme }) =>
        theme.mode === 'dark'
          ? 'rgba(251, 191, 36, 0.16)'
          : '#fef3c7'} !important;
      border-color: ${({ theme }) => theme.colors.warning} !important;
      color: ${({ theme }) =>
        theme.mode === 'dark' ? '#fde68a' : '#92400e'} !important;
    }

    .episode-status--missing {
      background: ${({ theme }) =>
        theme.mode === 'dark'
          ? 'rgba(251, 113, 133, 0.16)'
          : '#fee2e2'} !important;
      border-color: ${({ theme }) => theme.colors.error} !important;
      color: ${({ theme }) =>
        theme.mode === 'dark' ? '#fecdd3' : '#991b1b'} !important;
    }

    .episode-status--unmonitored {
      background: ${({ theme }) => theme.colors.surfaceElevated} !important;
      border-color: ${({ theme }) => theme.colors.border} !important;
      color: ${({ theme }) => theme.colors.mutedText} !important;
    }
  }

  @media (max-width: 700px) {
    .seasons {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    }

    .season-row {
      margin: 0;
      max-width: none;
      min-height: 48px;
      width: 100%;
    }

    .seasons-details {
      .season-top {
        align-items: stretch;
        flex-direction: column;
        gap: 8px;
      }

      .season-title {
        min-height: 42px;
      }

      .season-actions {
        gap: 8px;
      }

      .season-replace {
        justify-content: center;
        margin-left: 0;
        min-height: 44px;
        padding: 10px 12px;
      }

      .ant-table,
      .ant-table-container,
      .ant-table-content {
        overflow-x: visible;
      }

      .ant-table-tbody > tr {
        display: block;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
        padding: 8px 0;
      }

      .ant-table-tbody > tr > td {
        display: flex;
        justify-content: space-between;
        padding: 6px 10px;
        text-align: left !important;
        width: 100%;
      }

      .ant-table-tbody > tr > td::before {
        color: ${({ theme }) => theme.colors.textSecondary};
        flex-shrink: 0;
        font-weight: 700;
        margin-right: 10px;
      }

      .ant-table-tbody > tr > td:nth-child(1)::before {
        content: 'Episode';
      }

      .ant-table-tbody > tr > td:nth-child(2)::before {
        content: 'Air date';
      }

      .ant-table-tbody > tr > td:nth-child(3)::before {
        content: 'Status';
      }

      .ant-table-tbody > tr > td:nth-child(4)::before {
        content: 'Actions';
      }

      .episode-actions {
        align-items: stretch;
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: min(180px, 100%);
      }

      .episode-status-tag,
      .episode-action-tag {
        align-items: center;
        display: inline-flex;
        justify-content: center;
        min-height: 40px;
        padding: 8px 10px;
        width: min(180px, 100%);
      }

      .episode-action-tag {
        min-height: 44px;
      }
    }
  }
`;
