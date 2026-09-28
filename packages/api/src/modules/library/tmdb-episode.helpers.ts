export interface TMDBEpisodeNumber {
  episodeNumber: number;
}

/**
 * TMDB season summaries can contain an episode_count that does not map to real
 * episode resources yet. Bobarr should only create/search episodes that TMDB's
 * actual season details list as concrete episode numbers.
 *
 * @param {TMDBEpisodeNumber[] | null | undefined} episodes actual TMDB episode rows from the season-details endpoint
 * @returns {number[]} sorted unique positive episode numbers confirmed by TMDB
 */
export function getVerifiedTMDBEpisodeNumbers(
  episodes: TMDBEpisodeNumber[] | null | undefined
) {
  return Array.from(
    new Set(
      (episodes || [])
        .map((episode) => episode.episodeNumber)
        .filter((episodeNumber) => Number.isInteger(episodeNumber))
        .filter((episodeNumber) => episodeNumber > 0)
    )
  ).sort((left, right) => left - right);
}
