const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const app = read('pages/_app.tsx');
const navbar = read('components/navbar/navbar.component.tsx');
const navbarStyles = read('components/navbar/navbar.styles.tsx');
const card = read('components/tmdb-card/tmdb-card.component.tsx');
const cardStyles = read('components/tmdb-card/tmdb-card.styles.tsx');
const torrentTable = read('components/manual-search/jackett-results-table.tsx');
const torrentStyles = read('components/manual-search/manual-search.styles.tsx');
const episodeStyles = read(
  'components/tvshow-details/tvshow-details.styles.tsx'
);

assert(
  navbar.includes('aria-expanded={isMenuOpen}') &&
    navbar.includes("className={cx('links', { open: isMenuOpen })}"),
  'The phone navigation must have explicit open state'
);
assert(
  navbarStyles.includes('.links.open') &&
    !navbarStyles.includes('.wrapper:hover .links'),
  'Phone navigation must not depend on hover'
);
assert(
  card.includes('<button') &&
    card.includes('aria-label={`Open details for ${result.title}`}'),
  'Media posters must be semantic touch controls'
);
assert(
  cardStyles.includes('min-height: 44px') &&
    cardStyles.includes('opacity: 1'),
  'The media-card action must stay visible and touchable on phones'
);
assert(
  torrentTable.includes('torrent-download-button') &&
    torrentTable.includes('aria-label={`Download ${jackettResult.title}`}'),
  'Torrent downloads must use labelled buttons instead of tiny icons'
);
assert(
  torrentStyles.includes('grid-template-columns: repeat(2, minmax(0, 1fr))') &&
    torrentStyles.includes("content: 'Torrent'") &&
    torrentStyles.includes('min-width: 0 !important') &&
    torrentStyles.includes('height: 44px'),
  'Torrent results must become readable touch cards on phones'
);
assert(
  app.includes("[role='button']") &&
    app.includes('min-height: 44px') &&
    app.includes('font-size: 16px !important'),
  'Shared phone controls must prevent tiny targets and input zoom'
);
assert(
  episodeStyles.includes('.episode-action-tag') &&
    episodeStyles.includes('min-height: 44px'),
  'Episode actions must remain touch-friendly'
);

console.log('Mobile UX regression checks passed');
