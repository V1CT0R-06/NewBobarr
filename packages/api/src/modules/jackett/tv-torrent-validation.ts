import { sanitize } from 'src/utils/sanitize';

export interface TVTorrentExpectation {
  titles: string[];
  seasonNumber: number;
  episodeNumber?: number;
  releaseYear?: number;
}

function normalizeReleaseTitle(value: string) {
  return sanitize(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function numberPattern(value: number) {
  return `0*${value}`;
}

function getEpisodeMarker(expectation: TVTorrentExpectation) {
  const season = numberPattern(expectation.seasonNumber);
  const episode = numberPattern(expectation.episodeNumber!);
  return new RegExp(
    `\\b(?:s\\s*${season}\\s*e\\s*${episode}|(?:season|saison)\\s*${season}\\s*episode\\s*${episode})\\b`,
    'i'
  );
}

function getSeasonMarker(seasonNumber: number) {
  const season = numberPattern(seasonNumber);
  return new RegExp(
    `\\b(?:s\\s*${season}|season\\s*${season}|saison\\s*${season})\\b`,
    'i'
  );
}

function containsIndividualEpisode(value: string) {
  return /\bs\s*\d{1,3}\s*e\s*\d{1,4}\b|\bepisode\s*\d{1,4}\b/i.test(value);
}

function extractShowTitle(
  torrentTitle: string,
  marker: RegExp,
  releaseYear?: number
) {
  const markerMatch = marker.exec(torrentTitle);
  if (!markerMatch || markerMatch.index === 0) return null;

  let titlePart = torrentTitle.slice(0, markerMatch.index).trim();
  const yearMatch = titlePart.match(/\b(19\d{2}|20\d{2})\s*$/);

  if (yearMatch) {
    if (releaseYear && Number(yearMatch[1]) !== releaseYear) return null;
    titlePart = titlePart.slice(0, yearMatch.index).trim();
  }

  return titlePart;
}

function normalizeExpectedTitle(title: string, releaseYear?: number) {
  const normalizedTitle = normalizeReleaseTitle(title);
  if (!releaseYear) return normalizedTitle;

  return normalizedTitle.replace(new RegExp(`\\s+${releaseYear}$`), '').trim();
}

function hasOnlyRequestedSeason(value: string, requestedSeason: number) {
  const seasonPattern = /\b(?:s|season\s*|saison\s*)0*(\d{1,3})(?=e\d|\b)/gi;
  const seasonNumbers: number[] = [];
  let match = seasonPattern.exec(value);

  while (match) {
    seasonNumbers.push(Number(match[1]));
    match = seasonPattern.exec(value);
  }

  return (
    seasonNumbers.length > 0 &&
    seasonNumbers.every((seasonNumber) => seasonNumber === requestedSeason)
  );
}

// Automatic downloads must describe the requested show and episode/season.
// Indexers often return loosely related titles, so ranking is only safe after
// this check has established an exact normalized show-title match.
export function isMatchingTVTorrent(
  torrentTitle: string,
  expectation: TVTorrentExpectation
) {
  const normalizedTorrentTitle = normalizeReleaseTitle(torrentTitle);
  const isEpisodeRequest = expectation.episodeNumber !== undefined;
  const mediaMarker = isEpisodeRequest
    ? getEpisodeMarker(expectation)
    : getSeasonMarker(expectation.seasonNumber);

  if (!mediaMarker.test(normalizedTorrentTitle)) return false;
  if (
    !hasOnlyRequestedSeason(normalizedTorrentTitle, expectation.seasonNumber)
  ) {
    return false;
  }
  if (!isEpisodeRequest && containsIndividualEpisode(normalizedTorrentTitle)) {
    return false;
  }

  const showTitle = extractShowTitle(
    normalizedTorrentTitle,
    mediaMarker,
    expectation.releaseYear
  );
  if (!showTitle) return false;

  const acceptedTitles = expectation.titles
    .map((title) => normalizeExpectedTitle(title, expectation.releaseYear))
    .filter(Boolean);

  return acceptedTitles.includes(showTitle);
}
