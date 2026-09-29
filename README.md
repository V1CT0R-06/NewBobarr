# NewBobarr

<p align="center">
  <img src="docs/assets/newbobarr-logo.svg" alt="NewBobarr popcorn logo" width="120" height="120">
</p>

NewBobarr is a maintained and improved fork of Bobarr. It keeps Bobarr's simple
all-in-one media automation approach while fixing library, download and UI
problems, and making the project easier to self-host and maintain.

The application still presents itself as Bobarr for now. This repository keeps
the original Git history, MIT license, authorship and attribution from
[iam4x/bobarr](https://github.com/iam4x/bobarr). NewBobarr is a maintained fork;
it is not the original Bobarr project.

The README logo is the CC0 Popcorn SVG from
[SVG Repo](https://www.svgrepo.com/svg/484990/popcorn).

## What is NewBobarr?

NewBobarr is a Docker Compose media manager for BitTorrent users. It searches
metadata, talks to torrent indexers, sends downloads to Transmission, organizes
completed media, and tracks the library in PostgreSQL.

The stack includes:

- React and Next.js web UI
- NestJS GraphQL API
- PostgreSQL
- Redis and Bull background jobs
- TMDB metadata
- Optional OMDB ratings
- Jackett indexer searches
- Transmission downloads
- Optional FlareSolverr, OpenVPN and WireGuard support

## Why this fork exists

The original Bobarr project is useful, but several real-world self-hosting
issues needed source-level fixes:

- existing files were not always reconciled into the database;
- organized TV episode files could be associated incorrectly;
- missing episodes could search forever even when the user did not want them;
- successful torrent starts could be reported as failures;
- dark mode and responsive layouts needed cleanup;
- public installation docs needed safer defaults and clearer setup steps.

## Features

- Movies and TV shows in one web app
- TMDB search, discovery, suggestions and calendar data
- Jackett torrent indexer integration
- Transmission download integration
- FlareSolverr support for indexers that need it
- Automatic media organization
- Library scan and reconciliation for existing media
- Recognition of manually copied episodes such as `S01E01`, `S1E1` and `2x05`
- Correct TV episode file association through `tvEpisodeId`
- Episode and season monitoring
- Stop-searching controls for media you do not want
- Clearer download-start feedback
- Dark and light themes
- Responsive desktop, tablet and mobile layouts
- Docker Compose deployment
- Optional OpenVPN or WireGuard compose overlays

## Requirements

- Docker
- Docker Compose v2 (`docker compose`)
- A TMDB API key
- Jackett with at least one working indexer
- Enough disk space for downloads and organized media
- Host permissions that let your configured `PUID` and `PGID` write to the
  downloads and media library folders

NewBobarr still uses the original Bobarr Node 14-based stack. Build support
depends on Docker, the base images and your platform.

## Quick start

Clone with SSH:

```bash
git clone git@github.com:V1CT0R-06/NewBobarr.git newbobarr
cd newbobarr
```

Create local config and folders:

```bash
cp .env.example .env
cp packages/transmission/config/settings.example.json packages/transmission/config/settings.json
mkdir -p library/downloads library/movies library/tvshows
mkdir -p packages/jackett/config packages/jackett/downloads
mkdir -p packages/transmission/watch packages/vpn
```

Edit `.env`. At minimum, change passwords and set the user/group IDs that should
own created media files:

```dotenv
POSTGRES_PASSWORD=change-me
REDIS_PASSWORD=change-me
PUID=1000
PGID=1000
LIBRARY_MOVIES_FOLDER_NAME=movies
LIBRARY_TV_SHOWS_FOLDER_NAME=tvshows
```

Find your IDs with:

```bash
id $(whoami)
```

Start NewBobarr:

```bash
docker compose up -d --build
```

Open:

- Bobarr web UI: <http://localhost:3000>
- GraphQL API: <http://localhost:4000/graphql>
- Jobs dashboard: <http://localhost:4000/jobs>
- Jackett: <http://localhost:9117>
- Transmission: <http://localhost:9091>
- FlareSolverr: <http://localhost:8191>

In Jackett, add your indexers. Then open Bobarr Settings and paste the Jackett
API key. Add your TMDB API key in Bobarr Settings as well.

## Configuration

The main config file is `.env`. Important values:

```dotenv
ENV=production
TZ=Europe/Paris
UMASK_SET=0002

PUID=1000
PGID=1000

POSTGRES_DB=bobarr
POSTGRES_USER=bobarr
POSTGRES_PASSWORD=change-me

REDIS_PASSWORD=change-me

# Optional. Leave blank to disable OMDB lookups.
OMDB_API_KEY=

JACKETT_AUTOMATIC_SEARCH_TIMEOUT=120000
JACKETT_MANUAL_SEARCH_TIMEOUT=15000

LIBRARY_MOVIES_FOLDER_NAME=movies
LIBRARY_TV_SHOWS_FOLDER_NAME=tvshows

API_PORT=4000
WEB_PORT=3000
JACKETT_PORT=9117
FLARESOLVERR_PORT=8191
TRANSMISSION_WEB_PORT=9091
```

If a port is already used, change the matching `*_PORT` value before starting.
If you serve Bobarr behind a reverse proxy, set `WEB_UI_API_URL` when needed:

```dotenv
WEB_UI_API_URL=https://bobarr.example.com/api
```

## Media library paths

Inside the API container, Bobarr uses:

```text
/usr/library
```

The default compose file maps local `./library` there:

```yaml
volumes:
  - ./library:/usr/library
```

To use an existing host media library, change that mount:

```yaml
volumes:
  - /path/to/media:/usr/library
```

If your folders are named `Movies` and `Shows`, set:

```dotenv
LIBRARY_MOVIES_FOLDER_NAME=Movies
LIBRARY_TV_SHOWS_FOLDER_NAME=Shows
```

Then run:

```text
Settings -> Actions -> Scan / reconcile library
```

Reconciliation links existing files to database records, creates safe missing
season/episode rows, repairs file associations, and skips ambiguous filenames.
Hidden dot-prefixed folders are ignored.

## Monitoring episodes and seasons

NewBobarr separates media state from user intent:

- Missing and monitored: Bobarr may search for the episode.
- Missing and not monitored: Bobarr knows it is missing but leaves it alone.
- Downloaded or processed: Bobarr has a matching local file.
- Searching or downloading: Bobarr has an active search/download state.

Use `Stop searching` or `Monitor` for one episode. Use `Stop searching season`
or `Monitor season` for a whole season. Stopping search does not delete files or
silently remove active Transmission torrents.

## Updating

Back up your database and config first:

```bash
git pull
docker compose build api web
docker compose up -d
docker compose logs -f api
```

The API runs database migrations on startup.

## Backup and restore

Create a PostgreSQL backup:

```bash
docker compose exec postgres sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --file=/tmp/bobarr.dump'
docker compose cp postgres:/tmp/bobarr.dump ./bobarr.dump
```

Back up config:

```bash
tar -czf bobarr-config-backup.tar.gz .env docker-compose.yml packages/jackett packages/transmission packages/vpn
```

Media files should have their own backup plan. A Bobarr app backup does not need
to include the whole media library.

Restore a database dump:

```bash
docker compose cp ./bobarr.dump postgres:/tmp/bobarr.dump
docker compose exec postgres sh -lc 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists /tmp/bobarr.dump'
```

## Optional VPN modes

OpenVPN:

```text
packages/vpn/vpn.conf
```

```bash
docker compose -f docker-compose.yml -f docker-compose.vpn.yml up -d
```

WireGuard:

```text
packages/vpn/wg0.conf
```

```bash
docker compose -f docker-compose.yml -f docker-compose.wireguard.yml up -d
```

## Troubleshooting

Start with status and logs:

```bash
docker compose ps
docker compose logs --tail=200 api
docker compose logs --tail=100 web
```

Useful checks:

```bash
curl -f http://localhost:4000/health
docker compose exec postgres sh -lc 'pg_isready -U "$POSTGRES_USER"'
docker compose exec redis sh -lc 'redis-cli -a "$REDIS_PASSWORD" ping'
ss -ltnp | grep -E ':3000|:4000|:9091|:9117|:8191'
```

Common fixes:

- Web page does not load: check `web` logs and whether `WEB_PORT` is already in
  use.
- API is unhealthy: check `api` logs, database credentials, Redis password and
  migrations.
- Searches return nothing: check Jackett, indexers, the Jackett API key, TMDB
  key, FlareSolverr and quality/tag filters.
- Torrent does not download: check API and Transmission logs, then open
  Transmission to see whether the torrent was added, paused or rejected.
- Finished downloads still show as searching: run `Settings -> Actions -> Scan /
  reconcile library`.
- Existing files are not recognized: make sure TV filenames include patterns
  like `S01E01`, `S1E1` or `2x05`, and that files are not inside hidden
  dot-prefixed folders.
- An episode keeps searching but you do not want it: open the show and use
  `Stop searching` or `Stop searching season`.
- Permission denied: make sure host folders are writable by `PUID` and `PGID`.
- Migration failed: do not delete the PostgreSQL volume unless you want a reset;
  back up first and inspect `docker compose logs --tail=300 api`.

When sharing logs, remove `.env`, API keys, database dumps, private domains and
private IPs.

## Development

Install dependencies:

```bash
yarn install --frozen-lockfile
```

Run the common checks:

```bash
yarn lint
cd packages/api && yarn test && yarn build
cd ../web && yarn gql-gen && yarn test && yarn build
```

On newer Node versions, the web build may require:

```bash
NODE_OPTIONS=--openssl-legacy-provider yarn build
```

Run the Docker development stack:

```bash
yarn dev
```

Architecture notes are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Project structure

```text
packages/api          API, GraphQL, jobs, database entities and integrations
packages/web          Next.js web UI
packages/jackett      Jackett config mount
packages/transmission Transmission config and watch mounts
packages/vpn          Optional VPN config mounts
library               Default local media library for Docker Compose
docs                  Architecture notes and README assets
```

## Differences from upstream Bobarr

NewBobarr currently includes source-level fixes and improvements for:

- safer library reconciliation;
- manually copied media imports;
- stale file/torrent state handling;
- correct TV episode `File.tvEpisodeId` associations;
- episode and season monitoring controls;
- download success/failure feedback;
- TMDB enrichment resilience;
- dark/light theme consistency;
- responsive navigation and media grids;
- clearer public Docker setup.

## Contributing

Keep changes focused and readable. Fork the repo, create a branch, make the
change, add tests where practical, run the checks, and open a pull request with a
clear explanation.

## Credits and license

Bobarr was originally created at
[iam4x/bobarr](https://github.com/iam4x/bobarr).

This maintained version keeps the original MIT license. See [LICENSE](LICENSE).
