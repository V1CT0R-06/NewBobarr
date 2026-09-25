import assert from 'assert';

import { buildTVEpisodeFileRecord } from '../src/modules/jobs/processors/organize.processor';

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

console.log('API tests passed');
