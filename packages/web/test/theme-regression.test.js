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

console.log('Theme regression checks passed');
