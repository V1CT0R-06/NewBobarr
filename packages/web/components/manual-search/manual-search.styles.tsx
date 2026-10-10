import styled from 'styled-components';

export const ManualSearchStyles = styled.div`
  .search-title {
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.2em;
    font-weight: bold;
  }

  .search-input {
    display: flex;
    margin-top: 12px;
    margin-bottom: 12px;

    .action-btn {
      margin-left: 12px;
    }
  }

  .ant-table {
    font-size: 0.8em;
  }

  .torrent-download-button {
    align-items: center;
    background: ${({ theme }) => theme.colors.buttonBackground};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.buttonText};
    cursor: pointer;
    display: inline-flex;
    height: 36px;
    justify-content: center;
    width: 36px;

    &:hover,
    &:focus {
      background: ${({ theme }) => theme.colors.hover};
      border-color: ${({ theme }) => theme.colors.blue};
    }
  }

  @media (max-width: 700px) {
    .search-input {
      align-items: stretch;
      flex-direction: column;
      gap: 8px;

      .action-btn {
        margin-left: 0;
        min-height: 44px;
      }
    }

    .ant-table {
      font-size: 0.75em;
    }

    .ant-table-thead {
      display: none;
    }

    .ant-table-container,
    .ant-table-content {
      overflow-x: visible;
    }

    .ant-table-content table,
    .ant-table-tbody {
      display: block;
      min-width: 0 !important;
      table-layout: auto !important;
      width: 100% !important;
    }

    .ant-table-content colgroup {
      display: none;
    }

    .ant-table-tbody > tr {
      border: 1px solid ${({ theme }) => theme.colors.border};
      border-radius: 10px;
      display: grid;
      gap: 0;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-bottom: 10px;
      overflow: hidden;
      padding: 8px;
    }

    .ant-table-tbody > tr > td {
      border: 0;
      display: flex;
      flex-direction: column;
      min-width: 0;
      padding: 6px 8px;
      width: auto !important;
    }

    .ant-table-tbody > tr > td::before {
      color: ${({ theme }) => theme.colors.mutedText};
      display: block;
      font-size: 0.82em;
      font-weight: 700;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    .ant-table-tbody > tr > td:nth-child(1)::before {
      content: 'Age';
    }

    .ant-table-tbody > tr > td:nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 1;
      overflow-wrap: anywhere;
      white-space: normal;
    }

    .ant-table-tbody > tr > td:nth-child(2)::before {
      content: 'Torrent';
    }

    .ant-table-tbody > tr > td:nth-child(3)::before {
      content: 'Size';
    }

    .ant-table-tbody > tr > td:nth-child(4)::before {
      content: 'Seeds / peers';
    }

    .ant-table-tbody > tr > td:nth-child(5)::before {
      content: 'Quality';
    }

    .ant-table-tbody > tr > td:nth-child(6) {
      align-items: flex-end;
      justify-content: flex-end;
    }

    .torrent-download-button {
      height: 44px;
      width: 44px;
    }
  }
`;
