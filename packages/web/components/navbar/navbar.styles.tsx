import styled from 'styled-components';

export const NavbarStyles = styled.div`
  background: ${({ theme }) => theme.colors.navbarBackground};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  min-height: ${({ theme }) => theme.navbarHeight}px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100vw;

  .wrapper {
    align-items: center;
    display: flex;
    gap: 16px;
    height: 100%;
    margin-left: 32px;
    margin-right: 32px;
  }

  .top-row {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    gap: 8px;
  }

  .logo {
    color: ${({ theme }) => theme.colors.text};
    font-family: monospace;
    font-size: 2em;
    font-weight: bold;
    margin-right: 24px;
    text-decoration: none;
  }

  .links {
    display: flex;
    min-width: 0;
    overflow-x: auto;

    a {
      border: 1px solid transparent;
      border-radius: 999px;
      color: ${({ theme }) => theme.colors.mutedText};
      cursor: pointer;
      display: block;
      margin-right: 8px;
      padding: 6px 10px;
      text-decoration: none;
      transition: 0.1s linear;

      &.active,
      &:hover {
        background: ${({ theme }) => theme.colors.hover};
        border-color: ${({ theme }) => theme.colors.border};
        color: ${({ theme }) => theme.colors.text};
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .region-select {
    align-items: center;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    cursor: pointer;
    display: flex;
    font-size: 0.9em;
    justify-items: center;
    margin-left: 8px;
    padding: 6px 10px;
    transition: 0.1s linear;

    &:hover {
      background: ${({ theme }) => theme.colors.hover};
    }
  }

  .theme-toggle {
    align-items: center;
    background: ${({ theme }) => theme.colors.buttonBackground};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 999px;
    color: ${({ theme }) => theme.colors.buttonText};
    cursor: pointer;
    display: inline-flex;
    font-size: 0.9em;
    gap: 6px;
    padding: 6px 10px;
    transition: 0.1s linear;

    &:hover {
      background: ${({ theme }) => theme.colors.hover};
      border-color: ${({ theme }) => theme.colors.blue};
    }
  }

  .mobile-menu-button {
    align-items: center;
    background: ${({ theme }) => theme.colors.buttonBackground};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 999px;
    color: ${({ theme }) => theme.colors.buttonText};
    cursor: pointer;
    display: none;
    font-size: 0.9em;
    gap: 6px;
    padding: 6px 10px;
  }

  @media (max-width: 900px) {
    .wrapper {
      margin-left: 16px;
      margin-right: 16px;
    }

    .links {
      overflow-x: auto;
    }

    .logo {
      margin-right: 16px;
    }
  }

  @media (max-width: 700px) {
    min-height: auto;

    .wrapper {
      align-items: stretch;
      display: block;
      margin: 0;
      padding: 8px 12px;
    }

    .top-row {
      width: 100%;
    }

    .logo {
      font-size: 1.5em;
      margin-right: auto;
    }

    .region-select {
      display: none;
    }

    .mobile-menu-button {
      display: inline-flex;
    }

    .theme-toggle {
      padding: 8px 10px;
    }

    .links {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-top: 8px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.15s ease;
    }

    .wrapper:focus-within .links,
    .wrapper:hover .links {
      max-height: 160px;
    }

    .links a {
      margin: 0;
      min-height: 40px;
      padding: 10px 8px;
      text-align: center;
    }
  }
`;
