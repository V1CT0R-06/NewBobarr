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
    border: 1px solid rgba(255, 255, 255, 0.45);
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
      border-color: #fff;
    }

    &.in-library {
      cursor: not-allowed;
      border-color: #fff;
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
      border: 1px solid rgba(255, 255, 255, 0.45);
      border-radius: 5px;
      color: #ffffff;
      padding: 4px 8px;
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
      background: rgba(15, 23, 42, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      color: #ffffff;

      .ant-table-cell {
        background: transparent;
        color: #ffffff;
      }

      tr:hover > td {
        background: rgba(255, 255, 255, 0.08);
      }

      tr > td,
      tr > th {
        border: none;
      }
    }

    .episode-status-tag,
    .episode-action-tag {
      display: inline-block;
      margin: 0;
      min-height: 28px;
      padding-top: 3px;
      text-align: center;
      width: 120px;
    }

    .episode-action-tag {
      cursor: pointer;
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
        min-height: 40px;
      }

      .ant-table,
      .ant-table-container,
      .ant-table-content {
        overflow-x: visible;
      }

      .ant-table-tbody > tr {
        display: block;
        border-bottom: 1px solid rgba(255, 255, 255, 0.14);
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
        color: rgba(255, 255, 255, 0.7);
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
    }
  }
`;
