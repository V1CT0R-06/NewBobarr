# 🍿 Bobarr

Bobarr is a Docker-based movie and TV show manager for BitTorrent users. It
helps discover media, search configured indexers, send torrents to Transmission,
organize completed downloads, and keep a local media library in sync.

This repository is a maintained version of Bobarr based on the original project
by [iam4x](https://github.com/iam4x/bobarr). Original Git history, authorship,
license, and attribution are preserved.

The GitHub repository is named `NewBobarr`, but the application is still
Bobarr.

## What is Bobarr?

Bobarr combines several pieces that are often configured separately:

- TMDB for movie and TV metadata;
- Jackett for torrent indexer searches;
- Transmission for torrent downloads;
- PostgreSQL for library data;
- Redis and Bull for background jobs;
- a React/Next.js web interface.

It is designed to run with Docker Compose.

## Features

- Movies and TV shows in one application
- TMDB search and discovery
- Jackett indexer integration
- Transmission downloads
- FlareSolverr support for Jackett indexers that need it
- Optional OpenVPN or WireGuard compose files
- Automatic media organization by link/copy/move strategy
- Existing-library scan and reconciliation
- Recognition of manually copied TV files with common episode naming patterns
- Episode monitoring and season monitoring
- `Stop searching` controls for episodes you do not want Bobarr to download
- Dark and light themes, with dark as the default
- Docker-based deployment

## Screenshots

Screenshots should be captured from a clean demo installation before publishing
public marketing images. Do not use screenshots from a personal media library.

## Requirements

- Docker
- Docker Compose v2 plugin (`docker compose`) or compatible `docker-compose`
- A TMDB API key
- Jackett configured with at least one indexer
- Enough disk space for downloads and organized media
- Host filesystem permissions that allow the configured `PUID`/`PGID` to create
  and move media files

The Dockerfiles currently use Node 14 Alpine, matching the original Bobarr
stack. Multi-architecture support depends on the base images and the platform
you build for.

## Quick start

SSH clone:

```bash
git clone git@github.com:V1CT0R-06/NewBobarr.git
cd NewBobarr
```

The SSH command requires GitHub SSH authentication. Public users who do not have
GitHub SSH configured can clone with HTTPS instead:

```bash
git clone https://github.com/V1CT0R-06/NewBobarr.git
cd NewBobarr
```

Create local configuration:

```bash
cp .env.example .env
cp packages/transmission/config/settings.example.json packages/transmission/config/settings.json
mkdir -p library/downloads library/movies library/tvshows
mkdir -p packages/jackett/config packages/jackett/downloads
mkdir -p packages/transmission/watch packages/vpn
```

Edit `.env`, especially:

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `PUID`
- `PGID`
- `LIBRARY_MOVIES_FOLDER_NAME`
- `LIBRARY_TV_SHOWS_FOLDER_NAME`

Build and start:

```bash
docker compose up -d --build
```

Open:

- Bobarr: <http://localhost:3000>
- API: <http://localhost:4000/graphql>
- Background jobs: <http://localhost:4000/jobs>
- Jackett: <http://localhost:9117>
- Transmission: <http://localhost:9091>
- FlareSolverr: <http://localhost:8191>

In Jackett, add indexers and copy the Jackett API key into Bobarr Settings.

## Configuration

`.env.example` documents the supported environment variables.

Common values:

```dotenv
ENV=production
TZ=Europe/Paris
PUID=1000
PGID=1000
POSTGRES_DB=bobarr
POSTGRES_USER=bobarr
POSTGRES_PASSWORD=change-me
REDIS_PASSWORD=change-me
JACKETT_AUTOMATIC_SEARCH_TIMEOUT=120000
JACKETT_MANUAL_SEARCH_TIMEOUT=15000
LIBRARY_MOVIES_FOLDER_NAME=movies
LIBRARY_TV_SHOWS_FOLDER_NAME=tvshows
DEBUG_REDIS=false
API_PORT=4000
WEB_PORT=3000
JACKETT_PORT=9117
FLARESOLVERR_PORT=8191
TRANSMISSION_WEB_PORT=9091
```

Find your user and group IDs with:

```bash
id $(whoami)
```

If a port is already used on your host, change the matching `*_PORT` value
before running `docker compose up -d --build`.

## Existing media library

Inside the API container, Bobarr expects the library at:

```text
/usr/library
```

The default compose file maps local `./library`:

```yaml
volumes:
  - ./library:/usr/library
```

To use an existing host library, change that bind mount. Example:

```yaml
volumes:
  - /path/to/media:/usr/library
```

If your folders are named `Movies` and `Shows`, set:

```dotenv
LIBRARY_MOVIES_FOLDER_NAME=Movies
LIBRARY_TV_SHOWS_FOLDER_NAME=Shows
```

Then open Bobarr and run:

```text
Settings → Actions → Scan / reconcile library
```

Reconciliation scans existing media, creates safe missing database records,
repairs file associations, and skips ambiguous files instead of guessing.

Bobarr ignores dot-prefixed folders such as `.Temporary Show` or `.Movie Name`.
Those folders are useful for staging, old copies, or disabled media, but they do
not count as active library media.

Supported TV filename patterns include:

- `S01E01`
- `S1E1`
- `s01e01`
- `2x05`

## Monitoring episodes

Missing media and monitoring are different things.

- `Monitored`: Bobarr may search/download the missing episode.
- `Not monitored`: Bobarr knows the episode is missing but will not search for
  it automatically.

Use these controls in a TV show season:

- `Stop searching` / `Monitor` for one episode
- `Stop searching season` / `Monitor season` for a season

Stopping search does not delete media. If a matching torrent is already active
in Transmission, Bobarr leaves it alone and only stops future automatic
searches.

## Updating

Before updating, back up the database and configuration.

```bash
git pull
docker compose build api web
docker compose up -d
```

The API runs TypeORM migrations on startup. Watch API logs after updating:

```bash
docker compose logs -f api
```

## Backup and restore

Back up PostgreSQL:

```bash
docker compose exec postgres sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --file=/tmp/bobarr.dump'
docker compose cp postgres:/tmp/bobarr.dump ./bobarr.dump
```

Back up configuration:

```bash
tar -czf bobarr-config-backup.tar.gz .env docker-compose.yml packages/jackett packages/transmission packages/vpn
```

You usually do not need to back up the whole media library as part of a Bobarr
application backup. Media should have its own backup plan.

Restore PostgreSQL into an existing stack:

```bash
docker compose cp ./bobarr.dump postgres:/tmp/bobarr.dump
docker compose exec postgres sh -lc 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists /tmp/bobarr.dump'
```

## Troubleshooting

### Bobarr webpage does not load

```bash
docker compose ps
docker compose logs --tail=100 web
```

Check that port `3000` is not already used:

```bash
ss -ltnp | grep ':3000'
```

### API unhealthy

```bash
docker compose ps api
docker compose logs --tail=200 api
curl -f http://localhost:4000/health
```

### Database connection errors

```bash
docker compose ps postgres
docker compose logs --tail=100 postgres
docker compose exec postgres sh -lc 'pg_isready -U "$POSTGRES_USER"'
```

Verify that `.env` contains matching PostgreSQL values.

### Redis errors

```bash
docker compose ps redis
docker compose logs --tail=100 redis
docker compose exec redis sh -lc 'redis-cli -a "$REDIS_PASSWORD" ping'
```

### Search returns nothing

Check:

- Jackett is running: `docker compose ps jackett`
- Jackett has working indexers
- Bobarr Settings contains the correct Jackett API key
- FlareSolverr is configured in Jackett if an indexer requires it
- the selected quality/tag filters are not too restrictive

### Torrent found but does not download

```bash
docker compose logs --tail=100 transmission
docker compose logs --tail=100 api
```

Open Transmission at <http://localhost:9091> and check whether the torrent was
added or paused.

### Download finishes but Bobarr still says searching

Run:

```text
Settings → Actions → Scan / reconcile library
```

Then check API logs:

```bash
docker compose logs --tail=200 api
```

### Existing/manual files are not recognized

Use `Scan / reconcile library`. Make sure TV filenames include a recognizable
episode pattern such as `S01E01` or `2x05`.

Files in hidden dot-prefixed folders are intentionally skipped. Move media into
a normal visible movie/show folder before scanning if you want Bobarr to import
it.

### Episode keeps searching but I do not want it

Open the show, expand the season, and click `Stop searching` for that episode.
For a whole season, use `Stop searching season`.

### Permission denied or files cannot be moved

Check the host ownership and permissions of your library folder. The containers
use `PUID` and `PGID` from `.env`; those IDs need write access to downloads and
library folders.

### Port already in use

```bash
ss -ltnp | grep -E ':3000|:4000|:9091|:9117|:8191'
```

Change port mappings in `docker-compose.yml` if needed.

### Container restart loop

```bash
docker compose ps
docker compose logs --tail=200 <service-name>
```

Common causes are missing `.env`, invalid database passwords, unavailable ports,
or permission problems on mounted folders.

### Database migration failure

Stop, back up the database volume before experimenting, then inspect:

```bash
docker compose logs --tail=300 api
```

Do not delete the PostgreSQL volume unless you intentionally want to reset the
library database.

### VPN problems

For OpenVPN, place the config at:

```text
packages/vpn/vpn.conf
```

Start with:

```bash
docker compose -f docker-compose.yml -f docker-compose.vpn.yml up -d
```

For WireGuard, place the config at:

```text
packages/vpn/wg0.conf
```

Start with:

```bash
docker compose -f docker-compose.yml -f docker-compose.wireguard.yml up -d
```

### Collect logs for a bug report

Avoid sharing `.env`, API keys, database dumps, or private domains.

Useful logs:

```bash
docker compose ps
docker compose logs --tail=200 api
docker compose logs --tail=100 web
docker compose logs --tail=100 transmission
docker compose logs --tail=100 jackett
```

## Development

Install dependencies:

```bash
yarn install --frozen-lockfile
```

Run lint:

```bash
yarn lint
```

Run API tests:

```bash
cd packages/api
yarn test
```

Build API:

```bash
cd packages/api
yarn build
```

Generate GraphQL types and build web:

```bash
cd packages/web
yarn gql-gen
yarn build
```

On modern Node versions, the older Webpack stack may require:

```bash
NODE_OPTIONS=--openssl-legacy-provider yarn build
```

Run the Docker dev stack:

```bash
yarn dev
```

Architecture notes are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

1. Fork the repository.
2. Create a branch.
3. Make a focused change.
4. Add or update tests where practical.
5. Run lint, tests, and builds.
6. Open a pull request with a clear explanation.

Prefer small readable changes over clever rewrites.

## Credits

Bobarr is based on the original
[iam4x/bobarr](https://github.com/iam4x/bobarr) project.

Thank you to the original Bobarr author and contributors. This maintained
version preserves the original MIT license in [LICENSE](LICENSE).
