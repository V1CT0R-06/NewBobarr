import { Entertainment, TMDBRequestParams } from './tmdb.dto';

export interface DiscoverFilters {
  entertainment: Entertainment;
  originLanguage?: string;
  originCountry?: string;
  primaryReleaseYear?: string;
  score?: number;
  genres?: number[];
  page?: number;
}

export function buildDiscoverRequestParams({
  entertainment,
  originLanguage,
  originCountry,
  primaryReleaseYear,
  score,
  genres,
  page,
}: DiscoverFilters): TMDBRequestParams {
  const params: TMDBRequestParams = {
    'vote_count.gte': 50,
  };

  if (originLanguage) params.with_original_language = originLanguage;
  if (originCountry) params.with_origin_country = originCountry;
  if (genres?.length) params.with_genres = genres.join(',');
  if (score) params['vote_average.gte'] = score / 10;
  if (page) params.page = page;

  const releaseYear = Number(primaryReleaseYear);
  if (primaryReleaseYear && Number.isInteger(releaseYear)) {
    if (entertainment === Entertainment.Movie) {
      params.primary_release_year = releaseYear;
    } else {
      params.first_air_date_year = releaseYear;
    }
  }

  return params;
}
