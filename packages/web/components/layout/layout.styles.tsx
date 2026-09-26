import styled from 'styled-components';

export const LayoutStyles = styled.div`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
  padding-top: ${({ theme }) => theme.navbarHeight}px;

  @media (max-width: 700px) {
    padding-top: 58px;
  }
`;
