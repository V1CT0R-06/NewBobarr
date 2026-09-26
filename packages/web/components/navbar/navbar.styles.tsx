import styled from 'styled-components';

export const NavbarStyles = styled.div`
  background: ${({ theme }) => theme.colors.navbarBackground};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  height: ${({ theme }) => theme.navbarHeight}px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100vw;

  .wrapper {
    align-items: center;
    display: flex;
    height: 100%;
    margin-left: 32px;
    margin-right: 32px;
  }

  .logo {
    font-family: monospace;
    font-size: 2em;
    font-weight: bold;
    margin-right: 40px;
  }

  .links {
    display: flex;

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
    margin-left: auto;
    padding: 6px 10px;
    transition: 0.1s linear;

    &:hover {
      background: ${({ theme }) => theme.colors.hover};
      border-color: ${({ theme }) => theme.colors.blue};
    }
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
`;
