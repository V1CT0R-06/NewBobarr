# 🍿 NewBobarr

NewBobarr is a maintained and improved fork of [Bobarr](https://github.com/iam4x/bobarr), the original all-in-one movie and TV automation app by iam4x.

It keeps Bobarr's core idea simple: search for movies and TV shows, send torrents to Transmission, and organize completed media into your library. This fork adds source-level fixes for library reconciliation, episode monitoring, download feedback, and the web UI while preserving the original project's history, license, and attribution.

## Features

- Movies and TV shows in one web interface
- TMDB metadata, Discover, Suggestions, Calendar, and Search pages
- Jackett torrent search and Transmission downloads
- Automatic media organization after downloads complete
- Existing-library scan/reconciliation for manually copied files
- Safer TV episode file association using `tvEpisodeId`
- Episode and season monitoring controls
- Stop searching for episodes or seasons you do not want
- Clearer download-start feedback
- Dark mode, light mode, and responsive layouts
- Docker Compose deployment with PostgreSQL, Redis, Jackett, FlareSolverr, and Transmission

## Quick start

For most users:

```bash
git clone https://github.com/V1CT0R-06/NewBobarr.git
cd NewBobarr
cp .env.example .env
nano .env
docker compose up -d --build
```

For contributors using SSH:

```bash
git clone git@github.com:V1CT0R-06/NewBobarr.git
cd NewBobarr
```

Open:

| Service | URL |
| --- | --- |
| NewBobarr | <http://localhost:3000> |
| API / GraphQL | <http://localhost:4000/graphql> |
| API health | <http://localhost:4000/health> |
| Jackett | <http://localhost:9117> |
| Transmission | <http://localhost:9091> |
| FlareSolverr | <http://localhost:8191> |

Check the stack:

```bash
docker compose ps
docker compose logs -f api web
```

## Requirements

Host requirements:

- Docker Engine
- Docker Compose plugin
- enough disk space for downloads and organized media
- TMDB API access

Included by the Compose stack:

- NewBobarr Web
- NewBobarr API
- PostgreSQL
- Redis
- Jackett
- FlareSolverr
- Transmission

Optional:

- OMDB API key for extra ratings
- VPN compose helpers inherited from Bobarr
- reverse proxy using `WEB_UI_API_URL`

## Configuration

Copy `.env.example` to `.env` and edit the values:

```bash
cp .env.example .env
```

Most important settings:

| Variable | Purpose |
| --- | --- |
| `PUID` / `PGID` | Host user/group used for created files. Find yours with `id $(whoami)`. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Database settings. Change the example password. |
| `REDIS_PASSWORD` | Redis password. Change the example password. |
| `OMDB_API_KEY` | Optional OMDB key. Leave blank to disable OMDB lookups. |
| `LIBRARY_MOVIES_FOLDER_NAME` | Movies folder name inside `/usr/library`. Default: `movies`. |
| `LIBRARY_TV_SHOWS_FOLDER_NAME` | TV folder name inside `/usr/library`. Default: `tvshows`. |
| `API_PORT`, `WEB_PORT` | Host ports for API and web UI. |
| `WEB_UI_API_URL` | Optional browser-facing API URL for reverse proxies. |

TMDB, Jackett, region, language, quality, tags, and organization settings are configured in the NewBobarr web UI.

Do not commit your real `.env`.

## Media paths

The default Compose file uses:

```yaml
./library:/usr/library
./library/downloads:/downloads
```

Default host layout:

```text
library/
  downloads/
  movies/
  tvshows/
```

To use an existing media drive, mount it to `/usr/library` for the API and mount its download folder to `/downloads` for Transmission:

```yaml
services:
  api:
    volumes:
      - /path/to/media:/usr/library

  transmission:
    volumes:
      - /path/to/media/downloads:/downloads
```

If your folders are named differently, update `.env`:

```env
LIBRARY_MOVIES_FOLDER_NAME=Movies
LIBRARY_TV_SHOWS_FOLDER_NAME=Shows
```

The folder names must match what the API sees inside `/usr/library`.

## First setup

1. Start the stack:

   ```bash
   docker compose up -d --build
   ```

2. Open Jackett at <http://localhost:9117>, add indexers, and copy the Jackett API key.

3. Open NewBobarr at <http://localhost:3000/settings>.

4. Configure TMDB, Jackett, region/language, qualities, tags, and organization behavior.

5. If you already have media, run:

   ```text
   Settings → Actions → Scan / reconcile library
   ```

## Using NewBobarr

### Movies

Search or discover a movie, add it, choose a torrent, and NewBobarr sends it to Transmission. When the download finishes, the organizer places it in the movie library and links the file in PostgreSQL.

### TV shows

Add a show, choose the seasons or episodes you want, then select torrent results. Completed episodes are organized into the TV library and linked to the correct episode using `tvEpisodeId`.

### Monitoring

Monitoring means NewBobarr is allowed to search for missing content.

| State | Meaning |
| --- | --- |
| Monitored | NewBobarr may search/download if the episode is missing. |
| Unmonitored | The episode may be missing, but NewBobarr leaves it alone. |
| Downloaded / processed | A matching media file exists and is linked in the database. |
| Searching / downloading | NewBobarr is actively acquiring it. |

Use Stop searching or Monitor on individual episodes. Use Stop searching season or Monitor season for season-level control.

## Existing library reconciliation

Use:

```text
Settings → Actions → Scan / reconcile library
```

Reconciliation scans your configured Movies and TV Shows folders and updates the database only when it can make a safe match. It can register manually copied files, fix missing File associations, and avoid redownloading media that already exists.

An empty season folder is not downloaded media. Actual video files must exist and be matched.

Supported TV filename patterns include:

```text
Show Name S01E01.mkv
Show Name S1E1.mp4
Show Name 2x05.mkv
The IT Crowd - S01E01 - 720p [UNKNOWN].mp4
```

Ambiguous files are skipped instead of guessed.

## How it works

```text
NewBobarr Web
      │
      ▼
NewBobarr API ── PostgreSQL
      │          Redis
      ├── TMDB / OMDB
      ├── Jackett ── torrent result
      └── Transmission ── download
                         │
                         ▼
                    Organizer
                         │
                         ▼
                  Movies / TV Shows
```

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Common commands

| Task | Command |
| --- | --- |
| Start | `docker compose up -d` |
| Start and rebuild | `docker compose up -d --build` |
| Stop | `docker compose down` |
| Status | `docker compose ps` |
| Logs | `docker compose logs -f` |
| API logs | `docker compose logs -f api` |
| Web logs | `docker compose logs -f web` |
| Rebuild | `docker compose build` |
| Update source | `git pull` |
| PostgreSQL shell | `docker compose exec postgres sh -lc 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'` |

## Updating

Back up your database and configuration first, then:

```bash
git pull
docker compose build
docker compose up -d
docker compose logs -f api
```

Database migrations run during API startup.

## Backup

Back up:

- `.env`
- local changes to `docker-compose.yml`
- PostgreSQL database
- Jackett and Transmission configuration if you do not want to recreate them

Example database backup:

```bash
mkdir -p backups
docker compose exec -T postgres sh -lc 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/bobarr-db.sql
```

Your media library is separate from Bobarr application state and should be backed up separately.

## Troubleshooting

### Web UI does not load

```bash
docker compose ps
docker compose logs -f web api
```

Check `WEB_PORT` in `.env`.

### API is unhealthy

```bash
curl http://localhost:4000/health
docker compose logs -f api
```

Check database, Redis, and environment settings.

### Search returns no torrents

Check Jackett, indexers, Jackett API key in NewBobarr settings, language/region filters, and FlareSolverr if your indexer needs it.

```bash
docker compose logs -f api jackett flaresolverr
```

### Torrent appears but does not download

Check Transmission and API logs:

```bash
docker compose logs -f api transmission
```

### Download finished but still says searching/downloading

Run:

```text
Settings → Actions → Scan / reconcile library
```

Then check API logs.

### Existing files are not detected

Verify the files are inside the mounted library, the container can read them, folder names match `.env`, and TV filenames include patterns like `S01E01`, `S1E1`, or `2x05`.

### Bobarr keeps searching for something you do not want

Use Stop searching on the episode or Stop searching season on the season.

### Permission denied

Check host ownership and `.env`:

```bash
id $(whoami)
ls -la library
```

Set `PUID` and `PGID` to the user that should own media files.

### Port already in use

Change the matching port in `.env`, for example:

```env
WEB_PORT=3010
API_PORT=4010
```

### Calendar metadata error

NewBobarr should keep Calendar usable even if one TMDB item cannot be enriched. Check API logs if metadata is missing:

```bash
docker compose logs -f api
```

## Development

Install dependencies:

```bash
yarn
```

Run the development stack:

```bash
yarn dev
```

Run checks:

```bash
yarn lint
cd packages/api && yarn test
cd ../web && yarn gql-gen && yarn test
```

Build:

```bash
cd packages/api && yarn build
cd ../web && yarn build
docker compose build
```

Project layout:

| Path | Purpose |
| --- | --- |
| `packages/api` | NestJS GraphQL API, jobs, database entities, reconciliation, integrations. |
| `packages/web` | Next.js React frontend. |
| `packages/jackett` | Jackett config/download folders used by Compose. |
| `packages/transmission` | Transmission config/watch folders used by Compose. |
| `docs` | Developer documentation. |
| `library` | Default local media/download mount. |

## Contributing

Fork the repo, create a branch, make the change, add/update tests, run the checks, and open a pull request. Do not include API keys, credentials, database dumps, private domains, private IPs, or personal media data.

## Credits and license

NewBobarr is based on [Bobarr](https://github.com/iam4x/bobarr) by iam4x. The original Git history, authorship, and MIT license attribution are preserved.

See [LICENSE](LICENSE).
