import styled from 'styled-components';

export const MoviesComponentStyles = styled.div`
  padding-top: 32px;

  .wrapper {
    /* Five original 220px Bobarr cards plus their 12px side gutters. */
    max-width: 1220px;
    margin: 0 auto;
    width: calc(100% - 32px);
  }

  .flex {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-left: -12px;
    margin-right: -12px;
  }

  .movie-card,
  .tvshow-card {
    margin-left: 12px;
    margin-right: 12px;
    height: ${({ theme }) => theme.tmdbCardHeight}px;
  }

  .sortable {
    display: flex;
    margin-bottom: 24px;

    .sort-buttons button {
      margin-right: 8px;
    }

    .search-input {
      margin-left: auto;
      width: 300px;
    }
  }

  @media (max-width: 700px) {
    padding-top: 20px;

    .flex {
      display: grid;
      gap: 20px 14px;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      margin-left: 0;
      margin-right: 0;
    }

    .movie-card,
    .tvshow-card {
      height: auto;
      margin-left: 0;
      margin-right: 0;
      min-width: 0;
    }

    .sortable {
      align-items: stretch;
      flex-direction: column;
      gap: 10px;

      .sort-buttons {
        display: flex;
        gap: 8px;
        overflow-x: auto;

        button {
          flex: 0 0 auto;
          margin-right: 0;
          min-height: 40px;
        }
      }

      .search-input {
        margin-left: 0;
        width: 100%;
      }
    }
  }
`;
