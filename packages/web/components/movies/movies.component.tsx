import React from 'react';
import { Skeleton, Empty } from 'antd';

import { useGetLibraryMoviesQuery, EnrichedMovie } from '../../utils/graphql';

import { LibraryHeaderComponent } from '../library-header/library-header.component';
import { TMDBCardComponent } from '../tmdb-card/tmdb-card.component';

import { MoviesComponentStyles } from './movies.styles';
import { useSortable } from '../sortable/sortable.component';

const sortAttributes = [
  { label: 'Name', key: 'title' },
  { label: 'Release date', key: 'releaseDate' },
  { label: 'Score', key: 'voteAverage' },
  { label: 'Added at', key: 'createdAt' },
];

export function MoviesComponent() {
  const { data, loading } = useGetLibraryMoviesQuery();
  const { renderSortable, results } = useSortable<EnrichedMovie>({
    sortAttributes,
    searchableAttributes: ['title', 'originalTitle', 'releaseDate'],
    rows: data?.movies,
  });

  return (
    <>
      <LibraryHeaderComponent types={['movie']} />
      <MoviesComponentStyles>
        <div className="wrapper">
          <Skeleton active={true} loading={loading}>
            {data?.movies.length === 0 ? (
              <Empty />
            ) : (
              <>
                {renderSortable()}
                <div className="flex">
                  {results.map((movie) => (
                    <div className="movie-card" key={movie.id}>
                      <TMDBCardComponent
                        type="movie"
                        result={movie}
                        inLibrary={true}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </Skeleton>
        </div>
      </MoviesComponentStyles>
    </>
  );
}
