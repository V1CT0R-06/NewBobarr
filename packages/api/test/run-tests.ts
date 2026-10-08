import assert from 'assert';

import { buildTVEpisodeFileRecord } from '../src/modules/jobs/processors/organize.processor';
import { shouldContinueAutomaticMovieDownload } from '../src/modules/jobs/processors/download.processor';
import {
  shouldRemoveInactiveMissingTorrentRow,
  stateAfterMissingTransmissionTorrent,
} from '../src/modules/jobs/processors/refresh-torrent.processor';
import { DownloadableMediaState } from '../src/app.dto';
import {
  buildTVEpisodeWithoutTMDBMetadata,
  shouldKeepExistingActiveDownload,
} from '../src/modules/library/library.service';
import {
  isPathInsideHiddenLibraryFolder,
  isPathInsideLibraryRoot,
  isVisibleLibraryFolderName,
  normalizeMediaTitle,
  parseEpisodeFile,
} from '../src/modules/library/reconciliation.helpers';
import { getVerifiedTMDBEpisodeNumbers } from '../src/modules/library/tmdb-episode.helpers';
import { buildDiscoverRequestParams } from '../src/modules/tmdb/discover.helpers';
import { Entertainment } from '../src/modules/tmdb/tmdb.dto';
import { isMatchingTVTorrent } from '../src/modules/jackett/tv-torrent-validation';

function testOrganizerCreatesTVEpisodeFileRecord() {
  const record = buildTVEpisodeFileRecord({
    tvEpisodeId: 123,
    filePath: '/usr/library/Shows/Example/Season 01/Example - S01E01.mkv',
  });

  assert.deepStrictEqual(record, {
    tvEpisodeId: 123,
    path: '/usr/library/Shows/Example/Season 01/Example - S01E01.mkv',
  });
  assert.strictEqual(
    Object.prototype.hasOwnProperty.call(record, 'episodeId'),
    false,
    'organized TV episode File records must not use orphan episodeId'
  );
}

testOrganizerCreatesTVEpisodeFileRecord();

function testAutomaticMovieDownloadOnlyContinuesForSearchingMovies() {
  assert.strictEqual(
    shouldContinueAutomaticMovieDownload({
      state: DownloadableMediaState.SEARCHING,
    }),
    true
  );
  assert.strictEqual(
    shouldContinueAutomaticMovieDownload({
      state: DownloadableMediaState.DOWNLOADING,
    }),
    false,
    'automatic movie search must not overwrite a manual active download'
  );
  assert.strictEqual(
    shouldContinueAutomaticMovieDownload({
      state: DownloadableMediaState.MISSING,
    }),
    false
  );
  assert.strictEqual(shouldContinueAutomaticMovieDownload(null), false);
}

testAutomaticMovieDownloadOnlyContinuesForSearchingMovies();

function testMissingTransmissionTorrentReturnsToMissingState() {
  assert.strictEqual(
    stateAfterMissingTransmissionTorrent(),
    DownloadableMediaState.MISSING,
    'stale Bobarr torrent rows must not leave resources stuck downloading'
  );
}

testMissingTransmissionTorrentReturnsToMissingState();

function testInactiveMissingTorrentRowsAreSafeToRemove() {
  assert.strictEqual(
    shouldRemoveInactiveMissingTorrentRow({
      resourceState: DownloadableMediaState.DOWNLOADED,
      transmissionTorrentExists: false,
    }),
    true
  );
  assert.strictEqual(
    shouldRemoveInactiveMissingTorrentRow({
      resourceState: DownloadableMediaState.DOWNLOADING,
      transmissionTorrentExists: false,
    }),
    false,
    'active downloading resources need state repair instead of silent cleanup'
  );
  assert.strictEqual(
    shouldRemoveInactiveMissingTorrentRow({
      resourceState: DownloadableMediaState.DOWNLOADED,
      transmissionTorrentExists: true,
    }),
    false,
    'Bobarr must not remove rows for torrents that still exist in Transmission'
  );
}

testInactiveMissingTorrentRowsAreSafeToRemove();

function testManualDownloadRetryKeepsActiveTorrent() {
  assert.strictEqual(
    shouldKeepExistingActiveDownload({
      state: DownloadableMediaState.DOWNLOADING,
      transmissionTorrentExists: true,
    }),
    true,
    'manual retries must not remove/re-add an already active Transmission torrent'
  );
  assert.strictEqual(
    shouldKeepExistingActiveDownload({
      state: DownloadableMediaState.DOWNLOADING,
      transmissionTorrentExists: false,
    }),
    false,
    'Bobarr may repair a downloading state when the Transmission torrent is missing'
  );
  assert.strictEqual(
    shouldKeepExistingActiveDownload({
      state: DownloadableMediaState.MISSING,
      transmissionTorrentExists: true,
    }),
    false,
    'a missing resource with a stale torrent row is not an accepted active download'
  );
}

testManualDownloadRetryKeepsActiveTorrent();

function testMissingTMDBEpisodeMetadataDoesNotBreakEpisode() {
  const episode = {
    id: 4525,
    seasonNumber: 5,
    episodeNumber: 5,
    state: DownloadableMediaState.MISSING,
    monitored: true,
  } as any;

  const fallback = buildTVEpisodeWithoutTMDBMetadata(episode);

  assert.strictEqual(fallback.id, episode.id);
  assert.strictEqual(fallback.seasonNumber, 5);
  assert.strictEqual(fallback.episodeNumber, 5);
  assert.strictEqual(
    fallback.releaseDate,
    undefined,
    'a missing TMDB episode should not crash GraphQL enrichment'
  );
}

testMissingTMDBEpisodeMetadataDoesNotBreakEpisode();

function testVerifiedTMDBEpisodeNumbersIgnoreSummaryCounts() {
  assert.deepStrictEqual(
    getVerifiedTMDBEpisodeNumbers([
      { episodeNumber: 1 },
      { episodeNumber: 2 },
      { episodeNumber: 2 },
      { episodeNumber: 0 },
      { episodeNumber: -1 },
      { episodeNumber: 4.5 },
      { episodeNumber: 3 },
    ]),
    [1, 2, 3],
    'Bobarr must create/search only concrete TMDB episode rows, not synthetic episode_count ranges'
  );

  assert.deepStrictEqual(
    getVerifiedTMDBEpisodeNumbers(null),
    [],
    'missing TMDB season details must not create random episodes'
  );
}

testVerifiedTMDBEpisodeNumbersIgnoreSummaryCounts();

function testDiscoverLanguageAndCountryFilters() {
  assert.deepStrictEqual(
    buildDiscoverRequestParams({
      entertainment: Entertainment.Movie,
      originLanguage: 'pt',
      originCountry: 'PT',
    }),
    {
      'vote_count.gte': 50,
      with_original_language: 'pt',
      with_origin_country: 'PT',
    }
  );

  assert.deepStrictEqual(
    buildDiscoverRequestParams({
      entertainment: Entertainment.TvShow,
      originLanguage: 'pt',
      originCountry: 'BR',
    }),
    {
      'vote_count.gte': 50,
      with_original_language: 'pt',
      with_origin_country: 'BR',
    }
  );

  assert.deepStrictEqual(
    buildDiscoverRequestParams({
      entertainment: Entertainment.Movie,
      originLanguage: 'en',
      originCountry: 'GB',
    }),
    {
      'vote_count.gte': 50,
      with_original_language: 'en',
      with_origin_country: 'GB',
    }
  );
}

function testDiscoverEmptyFiltersPreserveExistingBehavior() {
  assert.deepStrictEqual(
    buildDiscoverRequestParams({
      entertainment: Entertainment.Movie,
      originCountry: '',
      genres: [],
      score: 0,
    }),
    { 'vote_count.gte': 50 },
    'Any country and empty filters must not add TMDB query parameters'
  );

  assert.deepStrictEqual(
    buildDiscoverRequestParams({
      entertainment: Entertainment.TvShow,
      originLanguage: 'pt',
    }),
    {
      'vote_count.gte': 50,
      with_original_language: 'pt',
    },
    'Portuguese with Any country must retain the existing language-only behavior'
  );
}

function testDiscoverUsesEndpointSpecificYearParameter() {
  assert.deepStrictEqual(
    buildDiscoverRequestParams({
      entertainment: Entertainment.Movie,
      primaryReleaseYear: '1999',
      page: 2,
      score: 70,
      genres: [12, 35],
    }),
    {
      'vote_count.gte': 50,
      'vote_average.gte': 7,
      with_genres: '12,35',
      primary_release_year: 1999,
      page: 2,
    }
  );

  assert.deepStrictEqual(
    buildDiscoverRequestParams({
      entertainment: Entertainment.TvShow,
      primaryReleaseYear: '2001',
    }),
    {
      'vote_count.gte': 50,
      first_air_date_year: 2001,
    }
  );

  assert.deepStrictEqual(
    buildDiscoverRequestParams({
      entertainment: Entertainment.Movie,
      primaryReleaseYear: 'not-a-year',
    }),
    { 'vote_count.gte': 50 },
    'invalid years must not be sent to TMDB'
  );
}

testDiscoverLanguageAndCountryFilters();
testDiscoverEmptyFiltersPreserveExistingBehavior();
testDiscoverUsesEndpointSpecificYearParameter();

function testTVSeasonTorrentValidation() {
  const houseSeasonOne = {
    titles: ['House (2004)', 'House M.D.'],
    seasonNumber: 1,
    releaseYear: 2004,
  };

  assert.strictEqual(
    isMatchingTVTorrent(
      'House, M.D. (2004) Season 01 S01 1080p BluRay x265',
      houseSeasonOne
    ),
    true,
    'a verified House M.D. alias must be accepted'
  );
  assert.strictEqual(
    isMatchingTVTorrent('House.2004.S01.1080p.BluRay.x265', houseSeasonOne),
    true
  );
  assert.strictEqual(
    isMatchingTVTorrent(
      'House.of.the.Dragon.S01.COMPLETE.720p.HMAX.WEBRip.x264',
      houseSeasonOne
    ),
    false,
    'a title containing the word House is not the show House'
  );
  assert.strictEqual(
    isMatchingTVTorrent('House.M.D.2004.S02.COMPLETE.1080p', houseSeasonOne),
    false,
    'a pack for another season must be rejected'
  );
  assert.strictEqual(
    isMatchingTVTorrent('House.M.D.2004.S01E01.1080p', houseSeasonOne),
    false,
    'an individual episode is not a complete season pack'
  );
  assert.strictEqual(
    isMatchingTVTorrent('House.S01.1080p', {
      titles: ['Full House'],
      seasonNumber: 1,
      releaseYear: 1987,
    }),
    false,
    'ambiguous partial title matches must fail safely'
  );
  assert.strictEqual(
    isMatchingTVTorrent('House.2022.S01.1080p', houseSeasonOne),
    false,
    'a conflicting release year must be rejected when present'
  );
}

function testTVEpisodeTorrentValidation() {
  const houseEpisode = {
    titles: ['House', 'House M.D.'],
    seasonNumber: 1,
    episodeNumber: 2,
    releaseYear: 2004,
  };

  assert.strictEqual(
    isMatchingTVTorrent('House.M.D.S01E02.720p.HDTV.x264', houseEpisode),
    true
  );
  assert.strictEqual(
    isMatchingTVTorrent('House.M.D.S01E03.720p.HDTV.x264', houseEpisode),
    false,
    'an episode search must require the requested episode number'
  );
  assert.strictEqual(
    isMatchingTVTorrent(
      'House.of.the.Dragon.S01E02.720p.WEBRip.x264',
      houseEpisode
    ),
    false
  );
}

function testOtherLegitimateTVReleaseNames() {
  assert.strictEqual(
    isMatchingTVTorrent('The.IT.Crowd.S04.720p.WEB-DL.H265', {
      titles: ['The IT Crowd'],
      seasonNumber: 4,
      releaseYear: 2006,
    }),
    true
  );
  assert.strictEqual(
    isMatchingTVTorrent('Futurama Season 06 1080p BluRay', {
      titles: ['Futurama'],
      seasonNumber: 6,
      releaseYear: 1999,
    }),
    true
  );
  assert.strictEqual(
    isMatchingTVTorrent('Smiling.Friends.S02E03.1080p.WEB-DL', {
      titles: ['Smiling Friends'],
      seasonNumber: 2,
      episodeNumber: 3,
      releaseYear: 2020,
    }),
    true
  );
}

testTVSeasonTorrentValidation();
testTVEpisodeTorrentValidation();
testOtherLegitimateTVReleaseNames();

function testEpisodeFilenameParsing() {
  assert.deepStrictEqual(
    parseEpisodeFile('The IT Crowd S04E01 720p WEB-DL H265 BONE.mp4'),
    { seasonNumber: 4, episodeNumber: 1 }
  );
  assert.deepStrictEqual(
    parseEpisodeFile('The IT Crowd - S01E01 - 720p [UNKNOWN].mp4'),
    { seasonNumber: 1, episodeNumber: 1 }
  );
  assert.deepStrictEqual(
    parseEpisodeFile('The IT Crowd S03E04 DVDRip BONE.mp4'),
    { seasonNumber: 3, episodeNumber: 4 }
  );
  assert.deepStrictEqual(parseEpisodeFile('Example.Show.S1E1.mkv'), {
    seasonNumber: 1,
    episodeNumber: 1,
  });
  assert.deepStrictEqual(parseEpisodeFile('Example Show - 2x05.mp4'), {
    seasonNumber: 2,
    episodeNumber: 5,
  });
  assert.strictEqual(parseEpisodeFile('ambiguous-video-file.mkv'), null);
}

function testTitleNormalization() {
  assert.strictEqual(
    normalizeMediaTitle('The IT Crowd'),
    normalizeMediaTitle('The It Crowd')
  );
  assert.strictEqual(
    normalizeMediaTitle('.500 Days Of Summer (2009)'),
    normalizeMediaTitle('500 Days of Summer')
  );
}

function testLibraryPathVisibilityRules() {
  assert.strictEqual(isVisibleLibraryFolderName('The Simpsons'), true);
  assert.strictEqual(isVisibleLibraryFolderName('.The Simpsons'), false);

  assert.strictEqual(
    isPathInsideLibraryRoot(
      '/usr/library/Shows/The Simpsons/Season 02/S02E01.mkv',
      '/usr/library/Shows'
    ),
    true
  );
  assert.strictEqual(
    isPathInsideLibraryRoot(
      '/usr/library/Music/song.mp3',
      '/usr/library/Shows'
    ),
    false
  );

  assert.strictEqual(
    isPathInsideHiddenLibraryFolder(
      '/usr/library/Shows/.The Simpsons/The.Simpsons.S02/S02E01.mkv',
      '/usr/library/Shows'
    ),
    true,
    'hidden library folders must not count as downloaded media'
  );
  assert.strictEqual(
    isPathInsideHiddenLibraryFolder(
      '/usr/library/Shows/The Simpsons/Season 02/S02E01.mkv',
      '/usr/library/Shows'
    ),
    false
  );
}

testEpisodeFilenameParsing();
testTitleNormalization();
testLibraryPathVisibilityRules();

console.log('API tests passed');
