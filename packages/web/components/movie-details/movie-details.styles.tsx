import styled from 'styled-components';

export const MovieDetailsStyles = styled.div`
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  max-height: 80vh;
  position: relative;
  color: #ffffff;

  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }

  .disable-scrollbars {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .close-icon {
    align-items: center;
    background: transparent;
    border: 0;
    position: absolute;
    color: #fff;
    cursor: pointer;
    top: 12px;
    right: 12px;
    z-index: 999;

    svg {
      font-size: 1.2em;
    }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    color: #fff;
    padding: 3px 5px;
    transition: 0.1s linear;

    &:hover {
      border: 1px solid #fff;
    }

    svg {
      margin-right: 8px;
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.8;
    }
  }

  .header-container {
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    height: 100%;
    width: 100%;
  }

  .header-background {
    position: absolute;
    top: 0;
    left: 0;
    background-size: cover;
    background-repeat: no-repeat;
    height: 100%;
    width: 100%;
    z-index: 1;
  }

  .header-background-overlay {
    background-image: linear-gradient(
      to right,
      #111827 150px,
      ${({ theme }) => theme.colors.overlay} 100%
    );
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 2;
  }

  .header-content {
    display: flex;
    padding-top: 24px;
    padding-bottom: 24px;
    padding-left: 36px;
    padding-right: 36px;
    width: 100%;
    position: relative;
    z-index: 3;
  }

  .poster-container {
    height: 100%;
    width: 200px;

    .poster-image {
      border-radius: 4px;
      height: auto;
      width: 200px;
    }
  }

  .movie-details {
    flex: 1;
    margin-left: 36px;
    color: #fff;
  }

  .title {
    display: flex;
    align-items: center;
    font-size: 2.2em;
    font-weight: 700;

    .year {
      font-size: 0.8em;
      font-weight: 300;
      margin-left: 4px;
    }
  }

  .play-trailer {
    display: inline-flex;
    align-items: center;
    margin-top: 12px;
    margin-bottom: 12px;

    svg {
      margin-right: 8px;
    }
  }

  .informations-row {
    display: flex;
    align-items: center;
    margin-top: 8px;
    margin-bottom: 8px;

    .vote--container {
      margin-right: 24px;
    }
  }

  .overview {
    font-size: 1.2em;
    max-width: 780px;
    color: rgba(255, 255, 255, 0.92);
  }

  .buttons {
    margin-top: 24px;
    display: flex;

    .btn {
      margin-right: 12px;
    }
  }

  .file-details {
    margin-top: 12px;

    li {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 570px;
    }

    strong {
      font-weight: bold;
    }

    em {
      margin-left: 8px;
      font-family: monospace;
    }
  }

  @media (max-width: 700px) {
    max-height: none;
    overflow-y: visible;

    .header-container {
      min-height: 100%;
    }

    .header-background-overlay {
      background-image: linear-gradient(
        to bottom,
        rgba(17, 24, 39, 0.96),
        ${({ theme }) => theme.colors.overlay}
      );
    }

    .header-content {
      display: block;
      padding: 18px;
    }

    .close-icon {
      align-items: center;
      background: rgba(15, 23, 42, 0.78);
      border-radius: 999px;
      display: flex;
      height: 44px;
      justify-content: center;
      right: 8px;
      top: 8px;
      width: 44px;
    }

    .poster-container {
      margin: 0 auto 18px;
      max-width: 180px;
      width: 45vw;

      .poster-image {
        width: 100%;
      }
    }

    .movie-details {
      margin-left: 0;
    }

    .title {
      align-items: flex-start;
      flex-direction: column;
      font-size: 1.6em;
      line-height: 1.15;

      .year {
        margin-left: 0;
        margin-top: 4px;
      }
    }

    .informations-row,
    .information-row {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
    }

    .overview {
      font-size: 1em;
    }

    .buttons {
      flex-direction: column;
      gap: 8px;

      .btn {
        justify-content: center;
        min-height: 44px;
        margin-right: 0;
      }
    }

    .file-details li {
      max-width: 100%;
      white-space: normal;
      overflow-wrap: anywhere;
    }
  }
`;
