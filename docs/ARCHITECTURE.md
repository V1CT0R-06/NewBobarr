# Bobarr architecture

This document explains how Bobarr is put together. It is written for people who
are new to the codebase.

## Top-level packages

Bobarr is split into two main applications:

- `packages/web` — the browser interface built with Next.js, React, Apollo
  GraphQL, Ant Design, and styled-components.
- `packages/api` — the backend built with NestJS, GraphQL, TypeORM,
  PostgreSQL, Redis, and Bull background jobs.

The default Docker Compose stack also runs:

- PostgreSQL — stores Bobarr's library, settings, file associations, and torrent
  records.
- Redis — stores cache data and Bull background job queues.
- Transmission — downloads torrents.
- Jackett — searches configured torrent indexers.
- FlareSolverr — helps Jackett access indexers protected by anti-bot pages.

## Important external services

### TMDB

TMDB provides movie and TV metadata. Bobarr uses it for search/discovery,
titles, posters, seasons, episodes, release dates, and ratings.

### Jackett

Jackett searches torrent indexers. Bobarr asks Jackett for movie, season, or
episode torrent candidates, then chooses the best matching result based on the
configured quality and tag preferences.

### Transmission

Transmission downloads the selected torrent. Bobarr stores a matching row in
the `torrent` table so it can later connect a Transmission torrent back to the
movie, season, or episode that created it.

## Library directories

Inside the API container, Bobarr sees the media library at:

```text
/usr/library
|- movies
|- tvshows
|- downloads
```

The folder names for `movies` and `tvshows` are configurable with:

```dotenv
LIBRARY_MOVIES_FOLDER_NAME=movies
LIBRARY_TV_SHOWS_FOLDER_NAME=tvshows
```

The host path can be anything. Docker Compose maps that host path into
`/usr/library` for the API container.

## Database model overview

Important tables/entities:

- `movie` — one row per tracked movie.
- `tv_show` — one row per tracked TV show.
- `tv_season` — one row per tracked TV season.
- `tv_episode` — one row per tracked TV episode.
- `file` — paths to files Bobarr knows about. TV episode files use
  `tvEpisodeId`; movie files use `movieId`.
- `torrent` — Bobarr's record of torrents added to Transmission.
- `parameter`, `quality`, `tag` — user settings.

TV relationships look like this:

```text
tv_show
  └─ tv_season
       └─ tv_episode
            └─ file
```

## Main user flow

```text
Search in web UI
  ↓
Bobarr API GraphQL resolver
  ↓
TMDB metadata / Jackett torrent search
  ↓
Torrent selected
  ↓
Transmission download starts
  ↓
Refresh torrent background job notices completion
  ↓
Organizer background job moves/copies/links media
  ↓
Movies / TV Shows library
  ↓
File row is associated with movieId or tvEpisodeId
```

## GraphQL

The web app talks to the API with GraphQL. GraphQL documents live under:

```text
packages/web/queries
packages/web/mutations
```

Generated TypeScript hooks live in:

```text
packages/web/utils/graphql.tsx
```

When GraphQL queries, mutations, or schema fields change, run:

```bash
cd packages/web
yarn gql-gen
```

## Background jobs

Bobarr uses Bull queues backed by Redis. The main job processors live in:

```text
packages/api/src/modules/jobs/processors
```

Important processors:

- `download.processor.ts` — starts missing movie/season/episode downloads.
- `refresh-torrent.processor.ts` — checks Transmission for torrent progress and
  completion.
- `organize.processor.ts` — moves/copies/links completed downloads into the
  library and creates File associations.
- `scan-library.processor.ts` — scans existing library folders and reconciles
  files with the database.

## How a movie is added

1. The user searches or discovers a movie in the web UI.
2. The web UI calls the API mutation to track the movie.
3. The API creates/updates a `movie` row.
4. A download job is queued.
5. The download processor asks Jackett for torrent results.
6. Bobarr starts the selected torrent in Transmission.
7. When complete, the organizer puts the media into the Movies folder.
8. The organizer creates a `file` row with `movieId`.

## How a TV show or season is added

1. The user chooses one or more seasons in the TV show UI.
2. Bobarr creates a `tv_show` row if needed.
3. Bobarr creates `tv_season` and `tv_episode` rows.
4. Download jobs are queued for seasons or episodes.
5. Completed downloads are organized into the TV Shows folder.
6. Episode files are associated through `file.tvEpisodeId`.

## Episode monitoring

Monitoring is user intent. It is separate from media state.

- `monitored = true` means Bobarr may search/download the missing episode.
- `monitored = false` means Bobarr knows about the episode but should not search
  for it automatically.

This lets an episode be:

```text
missing + unmonitored
```

without pretending the episode is downloaded.

The web UI exposes:

- episode-level `Stop searching` / `Monitor`;
- season-level `Stop searching season` / `Monitor season`.

When an episode is unmonitored, Bobarr:

- removes queued download jobs for that episode;
- hides it from the global Searching list;
- removes stale Bobarr-only torrent rows if Transmission no longer has that
  torrent;
- does not delete media;
- does not delete an active Transmission torrent.

## Library reconciliation

The Settings action `Scan / reconcile library` runs Bobarr's native library
scanner.

The scanner:

1. scans configured Movies and TV Shows folders;
2. ignores hidden dot-prefixed folders and non-video files;
3. parses TV filenames such as `S01E01`, `S1E1`, `s01e01`, and `2x05`;
4. matches the show folder to an existing show or TMDB result;
5. creates missing seasons and episodes when the match is high-confidence;
6. associates file rows with `tvEpisodeId` or `movieId`;
7. marks confidently imported episodes processed;
8. removes stale File associations when the trusted library path is gone;
9. logs ambiguous files instead of guessing;
10. never deletes media.

Hidden folders are ignored on purpose. For example,
`/usr/library/tvshows/.The Simpsons` can contain old or staged files, but Bobarr
will not treat those files as downloaded episodes. If a stale database `file`
row points into a hidden folder or to a file that no longer exists, scan
reconciliation removes only that database association and returns the movie or
episode to `missing` when no trusted file remains.

The important code lives in:

```text
packages/api/src/modules/jobs/processors/scan-library.processor.ts
packages/api/src/modules/library/reconciliation.helpers.ts
```

## Where to start reading code

For backend flows:

1. `packages/api/src/modules/library/library.resolver.ts`
2. `packages/api/src/modules/library/library.service.ts`
3. `packages/api/src/modules/jobs/jobs.service.ts`
4. `packages/api/src/modules/jobs/processors/download.processor.ts`
5. `packages/api/src/modules/jobs/processors/refresh-torrent.processor.ts`
6. `packages/api/src/modules/jobs/processors/organize.processor.ts`
7. `packages/api/src/modules/jobs/processors/scan-library.processor.ts`

For frontend flows:

1. `packages/web/pages`
2. `packages/web/components/navbar`
3. `packages/web/components/tmdb-card`
4. `packages/web/components/movie-details`
5. `packages/web/components/tvshow-details`
6. `packages/web/components/settings`

## Development tips

- Keep media safety first. Do not delete files to fix a database issue.
- A `file` row is trusted only when its path points to a visible library folder
  and the file still exists.
- Prefer clear logs for skipped/ambiguous reconciliation cases.
- If a backend GraphQL field changes, regenerate web GraphQL types.
- Add tests for parsing and reconciliation edge cases.
- Run Docker builds before changing deployment instructions.
