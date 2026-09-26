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

  @media (max-width: 700px) {
    .search-input {
      align-items: stretch;
      flex-direction: column;
      gap: 8px;

      .action-btn {
        margin-left: 0;
        min-height: 42px;
      }
    }

    .ant-table {
      font-size: 0.75em;
    }
  }
`;
