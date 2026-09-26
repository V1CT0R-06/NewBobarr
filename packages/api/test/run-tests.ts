import assert from 'assert';

import { buildTVEpisodeFileRecord } from '../src/modules/jobs/processors/organize.processor';
import { shouldContinueAutomaticMovieDownload } from '../src/modules/jobs/processors/download.processor';
import { stateAfterMissingTransmissionTorrent } from '../src/modules/jobs/processors/refresh-torrent.processor';
import { DownloadableMediaState } from '../src/app.dto';
import {
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

testEpisodeFilenameParsing();
testTitleNormalization();

console.log('API tests passed');
