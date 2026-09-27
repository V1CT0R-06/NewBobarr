import styled from 'styled-components';

export const SettingsComponentStyles = styled.div`
  padding-top: 32px;

  .wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding-left: 16px;
    padding-right: 16px;
  }

  h1 {
    font-size: 1.8em;
    font-weight: 700;
    margin-bottom: 20px;
  }

  h2 {
    color: ${({ theme }) => theme.colors.mutedText};
    font-size: 0.9em;
    font-weight: 700;
    letter-spacing: 0.06em;
    margin: 20px 0 8px;
    text-transform: uppercase;
  }

  .flex {
    display: flex;
    gap: 24px;
    justify-content: space-between;
  }

  .row {
    flex: 1;
    min-width: 0;
  }

  .actions {
    .ant-btn {
      display: block;
      margin-bottom: 8px;
      width: 100%;
    }
  }

  .quality-preference {
    margin-top: 24px;

    .ant-card-head-title {
      display: flex;

      .help {
        cursor: pointer;
        margin-left: auto;
      }
    }

    .ant-btn {
      margin-bottom: 4px;
      width: 100%;
    }

    .save-btn {
      margin-top: 12px;
    }
  }

  @media (max-width: 768px) {
    padding-top: 20px;

    .flex {
      display: block;
    }

    .row {
      margin-bottom: 20px;
    }

    .actions .ant-btn,
    .quality-preference .ant-btn {
      min-height: 42px;
    }
  }
`;
