import styled from 'styled-components';

export const DownloadingComponentStyles = styled.div`
  .wrapper {
    margin: 0 auto;
    max-width: 1200px;
  }

  .activity-panel {
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;
    box-shadow: ${({ theme }) =>
      theme.mode === 'dark'
        ? '0 10px 24px rgba(0, 0, 0, 0.18)'
        : '0 8px 20px rgba(15, 23, 42, 0.06)'};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 12px;
    padding: 8px;
  }

  .empty-state {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9em;
    font-weight: 600;
    letter-spacing: 0.01em;
    padding: 10px 12px;
    text-align: center;
  }

  .download-row {
    align-items: center;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.text};
    padding: 6px 10px;
    font-size: 0.8em;
    margin-bottom: 8px;
    display: flex;
    width: 100%;

    &:last-child {
      margin-bottom: 0;
    }

    .status {
      flex-shrink: 0;
      margin-right: 10px;
    }

    .status-tag {
      border: 0;
      border-radius: 999px;
      color: #ffffff;
      font-weight: 700;
      line-height: 1.7;
      margin-right: 0;
      text-transform: uppercase;
    }

    .status-tag.searching {
      background: #7c3aed;
    }

    .status-tag.downloading {
      background: ${({ theme }) => theme.colors.blue};
      color: ${({ theme }) => (theme.mode === 'dark' ? '#082f49' : '#ffffff')};
    }

    .status-tag.paused {
      background: ${({ theme }) => theme.colors.warning};
      color: ${({ theme }) => (theme.mode === 'dark' ? '#422006' : '#ffffff')};
    }

    .speed {
      color: ${({ theme }) => theme.colors.text};
      flex-shrink: 0;
      font-size: 0.7em;
      font-weight: 600;
      margin-left: auto;
      margin-right: 12px;
    }

    .progress {
      flex-shrink: 0;
      width: 250px;
    }

    .name {
      text-transform: uppercase;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .torrent-name {
      color: ${({ theme }) => theme.colors.mutedText};
      font-size: 0.7em;
      margin-left: 4px;
      margin-right: 12px;
      text-transform: uppercase;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .ant-progress-bg {
      background-color: ${({ theme }) => theme.colors.blue};
    }

    .ant-progress-inner {
      background-color: ${({ theme }) => theme.colors.border};
    }
  }
`;
