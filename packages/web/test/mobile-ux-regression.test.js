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
const discover = read('components/discover/discover.component.tsx');
const discoverStyles = read('components/discover/discover.styles.tsx');
const movieDetails = read('components/movie-details/movie-details.component.tsx');
const movieDetailsStyles = read(
  'components/movie-details/movie-details.styles.tsx'
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
assert(
  discover.includes('areFiltersOpen') &&
    discover.includes("areFiltersOpen ? 'Hide filters' : 'Show filters'") &&
    discover.includes('aria-controls="discover-filters"'),
  'Discover filters must be explicitly collapsible on phones'
);
assert(
  discoverStyles.includes('.discover--filter-toggle') &&
    discoverStyles.includes('&.open') &&
    discoverStyles.includes('max-height: none') &&
    discoverStyles.includes('overflow: visible'),
  'Discover results must use the page scroll instead of a nested phone scroller'
);
assert(
  movieDetails.includes('aria-label="Close movie details"'),
  'Media details must keep an accessible close control'
);
assert(
  movieDetailsStyles.includes('max-height: calc(100vh - 16px)') &&
    movieDetailsStyles.includes('width: 45vw'),
  'Media details must retain the proven portrait modal layout'
);
assert(
  !app.includes('.media-details-modal') &&
    !app.includes('.mobile-fullscreen-modal'),
  'Phone modals must not use the broken forced full-screen shell'
);

console.log('Mobile UX regression checks passed');
