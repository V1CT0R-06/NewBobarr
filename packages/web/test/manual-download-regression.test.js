const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const resultsTableSource = read(
  'components/manual-search/jackett-results-table.tsx'
);
const manualSearchSource = read(
  'components/manual-search/manual-search.component.tsx'
);

assert(
  !resultsTableSource.includes('awaitRefetchQueries: true'),
  'manual result downloads must not let a failed refetch turn an accepted download into a failed mutation'
);

assert(
  !manualSearchSource.includes('awaitRefetchQueries: true'),
  'own torrent/magnet downloads must not let a failed refetch turn an accepted download into a failed mutation'
);

assert(
  resultsTableSource.includes("message: 'Download started'") &&
    manualSearchSource.includes("message: 'Download started'"),
  'successful manual downloads should show a clear Download started notification'
);

assert(
  resultsTableSource.includes('onDownloadStarted?.()') &&
    manualSearchSource.includes('onDownloadStarted={handleClose}'),
  'successful manual result downloads should close the torrent selection modal'
);

assert(
  resultsTableSource.includes('activeDownloadId') &&
    resultsTableSource.includes('isDownloadInFlight') &&
    resultsTableSource.includes('if (isDownloadInFlight.current || isDownloading)') &&
    resultsTableSource.includes('return;'),
  'manual result downloads should guard against duplicate submissions while a request is in flight'
);

assert(
  resultsTableSource.includes('setActiveDownloadId(null)') &&
    resultsTableSource.includes('onError'),
  'duplicate submission guard should reset only when the real download mutation fails'
);

console.log('Manual download regression checks passed');
