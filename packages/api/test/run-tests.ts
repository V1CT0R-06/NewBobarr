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
