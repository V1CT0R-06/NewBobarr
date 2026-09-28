import styled from 'styled-components';

export const CalendarStyles = styled.div`
  .wrapper {
    padding-top: 60px;
    max-width: 1200px;
    margin: 0 auto;
    padding-left: 16px;
    padding-right: 16px;
  }

  .cell-title {
    font-weight: 600;
  }

  .ant-alert {
    margin-bottom: 16px;
  }

  .ant-picker-calendar {
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.text};
    overflow: hidden;
  }

  .ant-picker-calendar-header {
    background: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 12px 16px;
  }

  .ant-picker-panel,
  .ant-picker-content,
  .ant-picker-calendar-date,
  .ant-picker-cell {
    background: ${({ theme }) => theme.colors.surface} !important;
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-picker-content th {
    background: ${({ theme }) => theme.colors.surfaceSecondary} !important;
    color: ${({ theme }) => theme.colors.textSecondary} !important;
    font-weight: 700;
    padding: 10px 8px;
  }

  .ant-picker-cell {
    border-color: ${({ theme }) => theme.colors.border} !important;
  }

  .ant-picker-cell .ant-picker-calendar-date {
    border-top-color: ${({ theme }) => theme.colors.border} !important;
    margin: 0;
  }

  .ant-picker-calendar-date-value {
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-picker-calendar-date-content,
  .ant-picker-calendar-date-content * {
    color: ${({ theme }) => theme.colors.text} !important;
  }

  .ant-picker-cell:not(.ant-picker-cell-in-view)
    .ant-picker-calendar-date-value {
    color: ${({ theme }) => theme.colors.mutedText} !important;
  }

  .ant-picker-cell-in-view.ant-picker-cell-today
    .ant-picker-calendar-date-value {
    background: ${({ theme }) => theme.colors.blue};
    border-radius: 999px;
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#082f49' : '#ffffff'} !important;
    display: inline-flex;
    justify-content: center;
    min-width: 24px;
    padding: 0 6px;
  }

  .ant-picker-calendar-date:hover {
    background: ${({ theme }) => theme.colors.hover} !important;
  }

  .calendar-events {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;
  }

  .calendar-event {
    display: block;
    font-size: 0.75em;
    line-height: 1.25;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 700px) {
    .wrapper {
      padding-top: 20px;
    }

    .ant-picker-calendar-header {
      align-items: stretch;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ant-picker-calendar-date {
      min-height: 72px;
      padding: 4px;
    }

    .calendar-event {
      font-size: 0.68em;
    }
  }
`;
