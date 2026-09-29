import { Injectable } from '@nestjs/common';
import Axios from 'axios';
import { OMDB_CONFIG } from 'src/config';
import {
  OMDBSearchResult,
  OMDBSearchParams,
  GetOMDBSearchQueries,
} from './omdb.dto';

@Injectable()
export class OMDBService {
  private emptyResult() {
    return { ratings: {} };
  }

  private async request<TData>(params: OMDBSearchParams = {}) {
    if (!OMDB_CONFIG.apiKey) {
      return null;
    }

    const client = Axios.create({
      params: { apikey: OMDB_CONFIG.apiKey },
      baseURL: 'http://www.omdbapi.com/',
    });

    const { data } = await client.get<TData>('', { params });

    return data;
  }

  public async search(args: GetOMDBSearchQueries) {
    const result = await this.request<OMDBSearchResult>({
      t: args.title,
    });

    if (!result || result.Response === 'False') {
      return this.emptyResult();
    }

    return this.mapResult(result);
  }

  private mapResult(omdbSearchResult: OMDBSearchResult) {
    const ratings = omdbSearchResult.Ratings?.reduce(
      (prev, { Source, Value }) => ({
        ...prev,
        ...(Source === 'Metacritic' && {
          metaCritic: Value,
        }),
        ...(Source === 'Internet Movie Database' && {
          IMDB: Value,
        }),
        ...(Source === 'Rotten Tomatoes' && {
          rottenTomatoes: Value,
        }),
      }),
      {}
    );

    return {
      ratings,
    };
  }
}
