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
  width: 100%;

  .wrapper {
    align-items: center;
    display: grid;
    gap: 16px;
    grid-template-columns: auto minmax(0, 1fr) auto;
    margin: 0 auto;
    max-width: 1220px;
    min-height: ${({ theme }) => theme.navbarHeight}px;
    padding: 0 16px;
    width: 100%;
  }

  .brand-row,
  .utility-controls {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    gap: 8px;
  }

  .logo {
    color: ${({ theme }) => theme.colors.text};
    font-family: monospace;
    font-size: 1.6em;
    font-weight: bold;
    line-height: 1;
    text-decoration: none;
  }

  .links {
    align-items: center;
    display: flex;
    gap: 4px;
    justify-content: center;
    min-width: 0;
    overflow: hidden;

    a {
      border: 1px solid transparent;
      border-radius: 999px;
      color: ${({ theme }) => theme.colors.mutedText};
      cursor: pointer;
      display: block;
      font-size: 0.94em;
      line-height: 1;
      padding: 6px 10px;
      text-decoration: none;
      transition: 0.1s linear;
      white-space: nowrap;

      &.active,
      &:hover {
        background: ${({ theme }) => theme.colors.hover};
        border-color: ${({ theme }) => theme.colors.border};
        color: ${({ theme }) => theme.colors.text};
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
      gap: 10px;
      grid-template-columns: auto auto;
      grid-template-areas:
        'brand utilities'
        'links links';
      padding: 8px 16px;
    }

    .brand-row {
      grid-area: brand;
    }

    .utility-controls {
      grid-area: utilities;
      justify-content: flex-end;
    }

    .links {
      grid-area: links;
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: 2px;
    }
  }

  @media (max-width: 700px) {
    min-height: auto;

    .wrapper {
      align-items: stretch;
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-areas:
        'brand utilities'
        'links links';
      padding: 8px 12px;
    }

    .brand-row {
      min-width: 0;
    }

    .logo {
      font-size: 1.5em;
    }

    .region-select {
      display: none;
    }

    .mobile-menu-button {
      display: inline-flex;
      min-height: 40px;
    }

    .theme-toggle {
      min-height: 40px;
      padding: 8px 10px;
    }

    .links {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      max-height: 0;
      overflow: hidden;
      padding-bottom: 0;
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
