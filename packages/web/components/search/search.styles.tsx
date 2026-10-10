import styled from 'styled-components';

export const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
`;

export const SearchStyles = styled.div`
  .search-bar {
    &--input {
      border: none;
      border-radius: 20px;
      background: ${({ theme }) => theme.colors.surface};
      color: ${({ theme }) => theme.colors.text};
      font-size: 1.2em;
      outline: none;
      padding: 8px 18px;
      height: 40px;
      width: 100%;

      &-container {
        position: relative;
      }

      &-submit {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e84a5f;
        border: none;
        border-radius: 20px;
        color: #fff;
        cursor: pointer;
        font-size: 1.2em;
        height: 40px;
        padding: 8px 18px;
        position: absolute;
        right: 0;
        top: 0;
      }
    }

    &--container {
      background-color: ${({ theme }) => theme.colors.coral};
      padding-top: 32px;
      padding-bottom: 32px;
    }

    &--title {
      color: #fff;
      font-size: 2em;
      font-weight: 600;
      margin-bottom: 5px;
    }

    &--subtitle {
      color: #fff;
      font-size: 1.6em;
      font-weight: 500;
      margin-bottom: 48px;
    }
  }

  .search-results {
    &--container {
      margin-top: 48px;
    }

    &--category {
      color: ${({ theme }) => theme.colors.text};
      font-weight: 500;
      font-size: 1.3em;
      margin-bottom: 24px;
      margin-left: 32px;
    }

    &--row {
      display: flex;
    }
  }

  .carrousel {
    &--container {
      padding-left: 32px;
      padding-right: 32px;
      width: 100%;
      position: relative;

      .arrow-right,
      .arrow-left {
        background: transparent;
        color: ${({ theme }) => theme.colors.text};
        position: absolute;
        outline: none;
        border: none;
        top: 175px;
      }

      .arrow-left {
        left: 2px;
      }

      .arrow-right {
        right: 2px;
      }
    }

    &--slide {
      div {
        outline-width: 0px;
      }
    }
  }

  @media (max-width: 700px) {
    .search-bar {
      &--container {
        padding: 20px 0;
      }

      &--title {
        font-size: 1.45em;
      }

      &--subtitle {
        font-size: 1.05em;
        margin-bottom: 24px;
      }

      &--input {
        font-size: 1em;
        height: 44px;
        padding-right: 92px;

        &-submit {
          font-size: 1em;
          height: 44px;
          min-width: 80px;
          padding-left: 12px;
          padding-right: 12px;
        }
      }
    }

    .search-results {
      &--container {
        margin-top: 28px;
      }

      &--category {
        margin-left: 16px;
      }
    }

    .carrousel--container {
      padding-left: 16px;
      padding-right: 16px;
    }
  }
`;
