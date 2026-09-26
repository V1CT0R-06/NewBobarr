import styled from 'styled-components';

export const DownloadingComponentStyles = styled.div`
  .wrapper {
    margin: 0 auto;
    max-width: 1200px;
  }

  .empty-state {
    color: ${({ theme }) => theme.colors.mutedText};
    font-size: 0.9em;
    margin-bottom: 12px;
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

    .speed {
      flex-shrink: 0;
      font-size: 0.7em;
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
  }
`;
