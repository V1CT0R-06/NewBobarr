import path from 'path';

import allowedExtensions from 'src/utils/allowed-file-extensions.json';

export interface ParsedEpisodeFile {
  seasonNumber: number;
  episodeNumber: number;
}

export function normalizeMediaTitle(value: string) {
  return value
    .replace(/^\.+/, '')
    .replace(/\(\d{4}\)$/, '')
    .replace(/&/g, 'and')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function isAllowedVideoFile(filePath: string) {
  const ext = path.extname(filePath).replace(/^\./, '').toLowerCase();
  return allowedExtensions.includes(ext);
}

export function parseEpisodeFile(filePath: string): ParsedEpisodeFile | null {
  const basename = path.basename(filePath);
  const seasonEpisodeMatch = /\bS\s*(\d{1,2})\s*[-_. ]*E\s*(\d{1,3})\b/i.exec(
    basename
  );

  if (seasonEpisodeMatch) {
    return {
      seasonNumber: parseInt(seasonEpisodeMatch[1], 10),
      episodeNumber: parseInt(seasonEpisodeMatch[2], 10),
    };
  }

  const xMatch = /\b(\d{1,2})x(\d{1,3})\b/i.exec(basename);

  if (xMatch) {
    return {
      seasonNumber: parseInt(xMatch[1], 10),
      episodeNumber: parseInt(xMatch[2], 10),
    };
  }

  return null;
}
