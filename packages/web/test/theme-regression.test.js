const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function parseThemeColors(themeName) {
  const source = read('components/theme.ts');
  const themeMatch = new RegExp(
    `export const ${themeName}: DefaultTheme = \\{[\\s\\S]*?colors: \\{([\\s\\S]*?)\\n  \\},`
  ).exec(source);

  if (!themeMatch) {
    throw new Error(`Could not find ${themeName} colors`);
  }

  return Array.from(themeMatch[1].matchAll(/(\w+): '([^']+)'/g)).reduce(
    (colors, [, name, value]) => ({ ...colors, [name]: value }),
    {}
  );
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => character + character)
          .join('')
      : normalized;

  return [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));
}

function relativeLuminance(hex) {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function assertContrast({ foreground, background, minimumRatio, description }) {
  const ratio = contrastRatio(foreground, background);

  if (ratio < minimumRatio) {
    throw new Error(
      `${description} contrast ${ratio.toFixed(
        2
      )} is below required ${minimumRatio}`
    );
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEpisodeControlContrast() {
  [
    {
      description: 'dark downloaded episode status',
      foreground: '#dbeafe',
      background: '#243a5f',
      minimumRatio: 4.5,
    },
    {
      description: 'dark downloading episode status',
      foreground: '#bbf7d0',
      background: '#1d473c',
      minimumRatio: 4.5,
    },
    {
      description: 'dark searching episode status',
      foreground: '#fde68a',
      background: '#423a25',
      minimumRatio: 4.5,
    },
    {
      description: 'dark missing episode status',
      foreground: '#fecdd3',
      background: '#422938',
      minimumRatio: 4.5,
    },
    {
      description: 'light downloaded episode status',
      foreground: '#1d4ed8',
      background: '#dbeafe',
      minimumRatio: 4.5,
    },
    {
      description: 'light disabled button text',
      foreground: light.mutedText,
      background: light.surfaceSecondary,
      minimumRatio: 3,
    },
    {
      description: 'dark disabled button text',
      foreground: dark.mutedText,
      background: dark.surfaceSecondary,
      minimumRatio: 3,
    },
  ].forEach(assertContrast);
}

const dark = parseThemeColors('darkTheme');
const light = parseThemeColors('lightTheme');

[
  { themeName: 'dark', colors: dark },
  { themeName: 'light', colors: light },
].forEach(({ themeName, colors }) => {
  assertContrast({
    foreground: colors.text,
    background: colors.background,
    minimumRatio: 4.5,
    description: `${themeName} primary text on page background`,
  });
  assertContrast({
    foreground: colors.text,
    background: colors.surface,
    minimumRatio: 4.5,
    description: `${themeName} primary text on surface`,
  });
  assertContrast({
    foreground: colors.textSecondary,
    background: colors.surface,
    minimumRatio: 4.5,
    description: `${themeName} secondary text on surface`,
  });
  assertContrast({
    foreground: colors.mutedText,
    background: colors.surface,
    minimumRatio: 3,
    description: `${themeName} muted text on surface`,
  });
});

const appSource = read('pages/_app.tsx');
const documentSource = read('pages/_document.tsx');
const navbarSource = read('components/navbar/navbar.component.tsx');
const tvSeasonSource = read(
  'components/tvshow-details/tvseason-details.component.tsx'
);
const tvShowStyles = read('components/tvshow-details/tvshow-details.styles.tsx');
const moviesSource = read('components/movies/movies.component.tsx');
const moviesStyles = read('components/movies/movies.styles.tsx');
const tvShowsSource = read('components/tvshows/tvshows.component.tsx');
const calendarSource = read('components/calandar/calendar.component.tsx');
const calendarStyles = read('components/calandar/calendar.styles.tsx');
const discoverFilterStyles = read(
  'components/discover/discover-filter-section.styles.tsx'
);
const settingsStyles = read('components/settings/settings.styles.tsx');
const manualSearchStyles = read('components/manual-search/manual-search.styles.tsx');

assert(
  appSource.includes("useState<ThemeMode>('dark')"),
  'New visits should default to dark mode'
);
assert(
  appSource.includes("localStorage.getItem('bobarr-theme')") &&
    appSource.includes("localStorage.setItem('bobarr-theme', mode)"),
  'Theme preference should be read from and written to localStorage'
);
assert(
  documentSource.includes("localStorage.getItem('bobarr-theme') || 'dark'"),
  'Document bootstrap should apply dark mode before React loads'
);
assert(
  navbarSource.includes('toggleMode') && navbarSource.includes('theme-toggle'),
  'Navbar should expose a theme toggle'
);
assert(
  !tvSeasonSource.includes('<Tag color='),
  'Episode status tags must not use Ant preset tag colors; they bypass Bobarr dark theme contrast'
);
assert(
  tvSeasonSource.includes('episode-status--downloaded') &&
    tvSeasonSource.includes('episode-status--unmonitored') &&
    tvSeasonSource.includes('episode-action-tag'),
  'Episode rows should use semantic status/action classes'
);
assert(
  tvShowStyles.includes('.episode-status--downloaded') &&
    tvShowStyles.includes('.episode-status--unmonitored') &&
    tvShowStyles.includes('.episode-action-tag') &&
    tvShowStyles.includes('!important'),
  'Episode controls need explicit theme-aware foreground/background/border styles'
);

[
  '.ant-modal-confirm-body .ant-modal-confirm-title',
  '.ant-modal-confirm-body .ant-modal-confirm-content',
  '.ant-modal-confirm .ant-btn',
  '.ant-slider-track',
  '.ant-picker-cell-in-view',
  '.ant-pagination-item',
  '.ant-pagination-item-ellipsis',
  '.ant-alert-message',
  '.ant-skeleton.ant-skeleton-active',
].forEach((selector) => {
  assert(
    appSource.includes(selector),
    `Global theme styles should cover AntD ${selector}`
  );
});

assert(
  !calendarSource.includes('JSON.stringify(error') &&
    !calendarSource.includes('<pre>'),
  'Calendar must not render raw GraphQL error objects to normal users'
);
assert(
  calendarSource.includes('Some calendar information could not be loaded') &&
    calendarSource.includes('Loading calendar'),
  'Calendar should show concise themed loading/error messages'
);
assert(
  calendarSource.includes('tvEpisode.releaseDate &&') &&
    calendarStyles.includes('.ant-picker-calendar') &&
    calendarStyles.includes('.calendar-event') &&
    calendarStyles.includes('theme.colors.surface'),
  'Calendar should handle missing episode dates and use Bobarr theme colors'
);
assert(
  discoverFilterStyles.includes('theme.colors.textSecondary'),
  'Discover filter labels should use theme-aware text colors'
);
assert(
  settingsStyles.includes('h1') && settingsStyles.includes('theme.colors.text'),
  'Settings headings should use theme-aware text colors'
);
assert(
  manualSearchStyles.includes('.ant-table'),
  'Torrent modal should keep explicit table styling hooks for theme auditing'
);

assert(
  moviesSource.includes('MoviesComponentStyles') &&
    tvShowsSource.includes('styled(MoviesComponentStyles)'),
  'Movies and TV Shows should share the same media grid layout styles'
);
assert(
  !moviesSource.includes('react-masonry-component') &&
    !tvShowsSource.includes('react-masonry-component'),
  'Library grids should use Bobarr shared responsive CSS instead of Masonry inline positioning'
);
assert(
  moviesStyles.includes('max-width: 1220px') &&
    moviesStyles.includes('width: calc(100% - 32px)') &&
    moviesStyles.includes('justify-content: flex-start'),
  'Library grid should be centered and wide enough for five original 220px cards on desktop'
);
assert(
  moviesStyles.includes('grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))'),
  'Library grid should keep the mobile responsive card layout'
);

assertEpisodeControlContrast();

console.log('Theme regression checks passed');
