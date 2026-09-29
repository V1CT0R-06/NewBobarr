# Bobarr

<p align="center">
  <img src="docs/assets/newbobarr-logo.svg" alt="Bobarr popcorn logo" width="120" height="120">
</p>

Bobarr is a Docker-based movie and TV show manager for BitTorrent users. It
finds media, searches Jackett indexers, sends torrents to Transmission,
organizes completed downloads, and keeps its database in sync with the files in
your library.

This repository is NewBobarr, a maintained version of Bobarr based on the
original [iam4x/bobarr](https://github.com/iam4x/bobarr) project. The
application is still called Bobarr, and the original history, license, authorship
and attribution are preserved.

The README logo is the CC0 Popcorn SVG from
[SVG Repo](https://www.svgrepo.com/svg/484990/popcorn).

## What it includes

- Movies and TV shows in one web app
- TMDB search, discovery, suggestions and calendar data
- Jackett torrent indexer integration
- Transmission download integration
- FlareSolverr support for indexers that need it
- PostgreSQL database and Redis/Bull background jobs
- Automatic media organization
- Existing-library scan and reconciliation
- Recognition of manually copied episodes such as `S01E01`, `S1E1` and `2x05`
- Episode and season monitoring
- Stop-searching controls for media you do not want
- Dark and light themes, with dark as the default
- Docker Compose deployment
- Optional OpenVPN or WireGuard compose overlays

## Requirements

- Docker
- Docker Compose v2 (`docker compose`)
- A TMDB API key
- Jackett with at least one working indexer
- Enough disk space for downloads and organized media
- Host folder permissions that let your configured `PUID` and `PGID` write to
  the downloads and library folders

Bobarr still uses the original Node 14-based stack. Build support depends on
Docker, the base images, and your platform.

## Quick start

Clone the repository:

```bash
git clone git@github.com:V1CT0R-06/NewBobarr.git newbobarr
cd newbobarr
```

SSH cloning requires GitHub SSH authentication. If you only need the public
source, HTTPS also works:

```bash
git clone https://github.com/V1CT0R-06/NewBobarr.git newbobarr
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

Edit `.env`. At minimum, change the passwords and set the user/group IDs that
should own created media files:

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

Start Bobarr:

```bash
docker compose up -d --build
```

Open:

- Bobarr: <http://localhost:3000>
- GraphQL API: <http://localhost:4000/graphql>
- Jobs dashboard: <http://localhost:4000/jobs>
- Jackett: <http://localhost:9117>
- Transmission: <http://localhost:9091>
- FlareSolverr: <http://localhost:8191>

In Jackett, add your indexers. Then open Bobarr Settings and paste the Jackett
API key.

## Configuration

The main config file is `.env`. These are the most common values:

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

## Media library

Inside the API container, Bobarr uses:

```text
/usr/library
```

By default, Compose maps local `./library` there:

```yaml
volumes:
  - ./library:/usr/library
```

To use an existing host library, change that mount:

```yaml
volumes:
  - /path/to/media:/usr/library
```

If your library folders are named `Movies` and `Shows`, set:

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

## Monitoring

Bobarr separates media state from user intent:

- Missing and monitored: Bobarr may search for the episode.
- Missing and not monitored: Bobarr knows it is missing but leaves it alone.
- Downloaded or processed: Bobarr has a matching local file.
- Searching or downloading: Bobarr has an active search/download state.

Use `Stop searching` or `Monitor` for one episode, and `Stop searching season`
or `Monitor season` for a season. Stopping search does not delete files or
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

Start with container status and logs:

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
- Searches return nothing: check Jackett, indexers, the Jackett API key,
  FlareSolverr, and quality/tag filters.
- Torrent does not download: check API and Transmission logs, then open
  Transmission to see whether the torrent was added, paused or rejected.
- Finished downloads still show as searching: run `Settings -> Actions -> Scan /
  reconcile library`.
- Existing files are not recognized: make sure TV filenames include patterns
  like `S01E01`, `S1E1` or `2x05`, and that files are not inside hidden
  dot-prefixed folders.
- An episode keeps searching but you do not want it: open the show and use
  `Stop searching` or `Stop searching season`.
- Permission denied: make sure the host folders are writable by `PUID` and
  `PGID`.
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

## Project layout

```text
packages/api          API, GraphQL, jobs, database entities, integrations
packages/web          Next.js web UI
packages/jackett      Jackett config mount
packages/transmission Transmission config and watch mounts
packages/vpn          Optional VPN config mounts
library               Default local media library for Docker Compose
docs                  Architecture notes and README assets
```

## Contributing

Keep changes focused and readable. Fork the repo, create a branch, make the
change, add tests where practical, run the checks, and open a pull request with a
clear explanation.

## Credits and license

Bobarr was originally created at
[iam4x/bobarr](https://github.com/iam4x/bobarr).

This maintained version keeps the original MIT license. See [LICENSE](LICENSE).
