import styled from 'styled-components';

export const MissingComponentStyles = styled.div`
  .wrapper {
    max-width: 1200px;
    margin: 0 auto;
  }

  .row {
    align-items: center;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.text};
    padding: 5px 8px;
    font-size: 0.8em;
    margin-bottom: 8px;
    display: flex;
    width: 100%;
  }

  .title {
    font-weight: bold;
    margin-right: 4px;
  }

  .ant-tag {
    margin-left: auto;
  }

  @media (max-width: 700px) {
    .row {
      align-items: flex-start;
      flex-direction: column;
      gap: 6px;
    }

    .ant-tag {
      margin-left: 0;
      min-height: 32px;
      padding-top: 5px;
    }
  }
`;
