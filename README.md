# 🍿 NewBobarr

NewBobarr is a maintained and improved fork of [Bobarr](https://github.com/iam4x/bobarr), the original all-in-one movie and TV automation app by iam4x.

It keeps Bobarr's simple idea: one web interface for finding movies and TV shows, sending torrents to Transmission, and organizing completed files into your media library. NewBobarr adds reliability fixes, better existing-library handling, episode monitoring controls, clearer download feedback, and a refreshed light/dark responsive interface.

This repository preserves the original Bobarr history, license, and attribution. NewBobarr is independently maintained and should be treated as a fork, not the original upstream project.

## What NewBobarr can do

- Manage movies and TV shows in one interface.
- Search TMDB for movie and TV metadata.
- Use Jackett indexers to find torrents.
- Send selected torrents to Transmission.
- Organize completed downloads into Movies and TV Shows folders.
- Reconcile an existing media library without redownloading files that are already present.
- Recognize manually copied TV episode files when the filename can be matched safely.
- Track downloaded, missing, searching, downloading, monitored, and unmonitored episode states.
- Stop searching for individual episodes or whole seasons you do not want.
- Show calendar, discover, suggestions, search, movies, TV shows, and settings pages.
- Run with Docker Compose using PostgreSQL, Redis, Jackett, FlareSolverr, Transmission, API, and web containers.
- Use dark mode by default, with light mode available from the UI.
- Work on desktop, tablet, and phone-sized screens.

## Why this fork exists

The original Bobarr provides a lightweight all-in-one approach to media automation. NewBobarr builds on that foundation with maintenance and fixes for issues found while running Bobarr as a real self-hosted service:

- existing files could be missed by the library scanner;
- manually copied seasons or episodes could remain stuck as searching;
- organized TV episode files could be saved without the correct `tvEpisodeId` association;
- stale file or torrent state could make media appear downloaded or searching incorrectly;
- users had no clear way to say "this episode is missing, but I do not want it";
- dark mode and responsive layouts needed a more consistent UI pass.

The goal is still Bobarr: a practical, self-hosted media automation app that is easy to run and understandable to maintain.

## Screenshots

Screenshots are intentionally not committed yet because production libraries can reveal personal media information. A future release should add safe screenshots from a demo library, for example:

- Movies library
- TV Shows library
- TV show season and episode controls
- Discover page
- Settings actions
- Mobile layout
- Dark and light themes

## Requirements

Required on the host:

| Requirement | Notes |
| --- | --- |
| Linux or another Docker-capable host | Most testing is done on Linux. |
| Docker Engine | Required to run the containers. |
| Docker Compose plugin | Use `docker compose`, not the old standalone `docker-compose`, when possible. |
| Disk space for downloads and media | Downloads and organized media can become large. |
| TMDB API access | Used for movie and TV metadata. Configure it in Bobarr settings. |

Included in the Docker Compose stack:

| Service | Purpose |
| --- | --- |
| NewBobarr Web | Browser interface. |
| NewBobarr API | GraphQL API and background jobs. |
| PostgreSQL | Bobarr database. |
| Redis | Queue/cache backend used by background jobs. |
| Jackett | Torrent indexer integration. |
| FlareSolverr | Optional helper for indexers that need browser-like solving. |
| Transmission | Torrent client. |
| Transmission Web proxy | Optional browser access to Transmission. |

Optional:

| Optional item | Notes |
| --- | --- |
| OMDB API key | Adds extra ratings in movie detail views. Leave blank if you do not use OMDB. |
| VPN configuration | The original Bobarr scripts include VPN-oriented compose helpers. Review them before use. |
| Reverse proxy | Supported by configuring ports and, if needed, `WEB_UI_API_URL`. |

## Quick start

For most public users, HTTPS cloning is simplest:

```bash
git clone https://github.com/V1CT0R-06/NewBobarr.git
cd NewBobarr
cp .env.example .env
nano .env
docker compose up -d --build
```

If you contribute over SSH, clone with:

```bash
git clone git@github.com:V1CT0R-06/NewBobarr.git
cd NewBobarr
```

After startup:

- NewBobarr web UI: <http://localhost:3000>
- NewBobarr GraphQL API: <http://localhost:4000/graphql>
- API health check: <http://localhost:4000/health>
- Jackett: <http://localhost:9117>
- Transmission web UI: <http://localhost:9091>
- FlareSolverr: <http://localhost:8191>

Check status and logs:

```bash
docker compose ps
docker compose logs -f api web
```

## Configuration

Start by copying the example file:

```bash
cp .env.example .env
```

Then edit `.env`.

Important variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `TZ` | Recommended | Time zone used by containers. |
| `PUID` / `PGID` | Recommended | Host user/group IDs used for file ownership. Run `id $(whoami)` to find yours. |
| `UMASK_SET` | Recommended | File permission mask for created files. |
| `POSTGRES_DB` | Yes | PostgreSQL database name. |
| `POSTGRES_USER` | Yes | PostgreSQL user. |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password. Change the example value. |
| `REDIS_PASSWORD` | Yes | Redis password. Change the example value. |
| `OMDB_API_KEY` | Optional | Adds OMDB ratings. Leave blank to disable OMDB lookups. |
| `JACKETT_AUTOMATIC_SEARCH_TIMEOUT` | Recommended | Timeout for background Jackett searches. |
| `JACKETT_MANUAL_SEARCH_TIMEOUT` | Recommended | Timeout for manual Jackett searches. |
| `LIBRARY_MOVIES_FOLDER_NAME` | Yes | Folder name under `/usr/library` for movies. Default: `movies`. |
| `LIBRARY_TV_SHOWS_FOLDER_NAME` | Yes | Folder name under `/usr/library` for TV shows. Default: `tvshows`. |
| `API_PORT` | Optional | Host port for the API. Default: `4000`. |
| `WEB_PORT` | Optional | Host port for the web UI. Default: `3000`. |
| `JACKETT_PORT` | Optional | Host port for Jackett. Default: `9117`. |
| `FLARESOLVERR_PORT` | Optional | Host port for FlareSolverr. Default: `8191`. |
| `TRANSMISSION_WEB_PORT` | Optional | Host port for Transmission web UI. Default: `9091`. |
| `WEB_UI_API_URL` | Optional | Browser-facing API URL for reverse-proxy deployments. |

Do not commit your real `.env` file.

## Media and download paths

The default Compose file mounts:

```yaml
./library:/usr/library
./library/downloads:/downloads
```

Inside the API container, Bobarr expects a library layout like:

```text
/usr/library/
  movies/
  tvshows/
  downloads/
```

On the host, that corresponds to:

```text
./library/
  movies/
  tvshows/
  downloads/
```

To use an existing media drive, edit the API and Transmission volume mounts in `docker-compose.yml`.

Example:

```yaml
services:
  api:
    volumes:
      - /path/to/media:/usr/library

  transmission:
    volumes:
      - /path/to/media/downloads:/downloads
```

The folder names inside `/usr/library` must match:

```env
LIBRARY_MOVIES_FOLDER_NAME=movies
LIBRARY_TV_SHOWS_FOLDER_NAME=tvshows
```

If your real folders are named `Movies` and `Shows`, update the environment variables accordingly:

```env
LIBRARY_MOVIES_FOLDER_NAME=Movies
LIBRARY_TV_SHOWS_FOLDER_NAME=Shows
```

## First startup

1. Start the stack:

   ```bash
   docker compose up -d --build
   ```

2. Confirm containers are running:

   ```bash
   docker compose ps
   ```

3. Open Jackett at <http://localhost:9117>, add your indexers, and copy the Jackett API key.

4. Open NewBobarr at <http://localhost:3000/settings>.

5. Configure:

   - TMDB API key
   - Jackett URL and API key
   - region and language
   - preferred qualities and tags
   - media organization behavior

6. Go to Settings → Actions and run Scan / reconcile library if you already have media files.

## Using NewBobarr

### Adding a movie

1. Search for a movie or find it through Discover/Suggestions.
2. Add the movie.
3. Choose a torrent result.
4. NewBobarr sends the torrent to Transmission.
5. When the download completes, the organizer moves or links the file into your movie library.
6. The database File record is associated with the movie.

### Adding a TV show

1. Search for a TV show.
2. Add the show and choose the seasons or episodes you want.
3. Choose torrent results when prompted.
4. Transmission downloads the content.
5. NewBobarr organizes completed episodes into the TV library.
6. File records are associated with the correct episodes using `tvEpisodeId`.

### Monitoring episodes and seasons

Monitoring controls whether NewBobarr is allowed to search for missing content.

| State | Meaning |
| --- | --- |
| Monitored | NewBobarr may search/download the missing episode. |
| Unmonitored | The episode can be missing, but NewBobarr should leave it alone. |
| Downloaded/processed | A matching media file exists and is associated in the database. |
| Searching/downloading | NewBobarr is actively trying to acquire the item. |

Use:

- Stop searching on an episode to make it unmonitored.
- Monitor on an episode to allow searching again.
- Stop searching season to unmonitor missing episodes in a season.
- Monitor season to monitor the season again.

Missing does not mean monitored. An episode can be missing without NewBobarr continually searching for it.

## Existing media library

NewBobarr includes native library reconciliation.

Use:

```text
Settings → Actions → Scan / reconcile library
```

Reconciliation scans the configured Movies and TV Shows directories and safely updates Bobarr's database when it can confidently match files.

It can:

- find media files that were manually copied into the library;
- create missing TV season/episode database rows when metadata is available;
- create or fix File associations;
- mark confidently matched episodes as processed/downloaded;
- avoid redownloading files that already exist;
- skip ambiguous filenames instead of guessing;
- detect stale database file references when the library mount is available.

An empty folder is not downloaded media. For example:

```text
tvshows/The Example Show/Season 04/
```

does not mean Season 4 is downloaded unless actual video files are present and matched.

Supported TV filename patterns include common season/episode forms such as:

```text
The IT Crowd S04E01 720p WEB-DL H265 BONE.mp4
The IT Crowd - S01E01 - 720p [UNKNOWN].mp4
The It Crowd S03E04 DVDRip BONE.mp4
Example Show S1E1.mkv
Example Show 2x05.mp4
```

Matching is intentionally conservative. Rename unclear files before scanning if they are skipped.

## How NewBobarr works

```text
                    NewBobarr Web
                         │
                         ▼
                    NewBobarr API
               ┌─────────┼─────────┐
               ▼         ▼         ▼
             TMDB     Jackett   PostgreSQL
               │         │         ▲
               │         ▼         │
               │      Torrent      │
               │         │         │
               ▼         ▼         │
             Redis  Transmission   │
                         │         │
                         ▼         │
                      Download     │
                         │         │
                         ▼         │
                      Organizer ───┘
                         │
                         ▼
                  Movies / TV Shows
```

In short:

1. The web UI talks to the API through GraphQL.
2. The API uses TMDB for metadata.
3. Jackett searches configured torrent indexers.
4. Transmission downloads selected torrents.
5. Background jobs refresh torrent state and organize completed downloads.
6. PostgreSQL stores library, file, torrent, settings, and monitoring state.
7. Redis supports background queues.

For a developer-oriented explanation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Updating

Back up your database and configuration before major updates.

Then update the source and rebuild:

```bash
cd NewBobarr
git pull
docker compose build
docker compose up -d
```

Database migrations run as part of the API startup process. Check API logs after updating:

```bash
docker compose logs -f api
```

## Backup and restore

Back up:

- `.env`
- any local changes to `docker-compose.yml`
- PostgreSQL database
- Jackett configuration if you do not want to reconfigure indexers
- Transmission configuration if needed

Your media library is separate from Bobarr application state. Back it up using your normal media backup process.

Example PostgreSQL backup:

```bash
mkdir -p backups
docker compose exec -T postgres sh -lc 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/bobarr-db.sql
```

Example restore into an existing stack:

```bash
docker compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < backups/bobarr-db.sql
```

Stop the API before restoring a database if you are replacing existing data.

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
| Rebuild images | `docker compose build` |
| Pull source updates | `git pull` |
| Open API shell | `docker compose exec api sh` |
| Open PostgreSQL | `docker compose exec postgres sh -lc 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'` |

## Troubleshooting

### Web interface does not load

Check containers:

```bash
docker compose ps
docker compose logs -f web api
```

Confirm the web port in `.env` and open:

```text
http://localhost:3000
```

If you changed `WEB_PORT`, use that port instead.

### API is unhealthy

Check:

```bash
docker compose logs -f api
curl http://localhost:4000/health
```

Common causes are database connection errors, missing environment variables, or migrations failing during startup.

### Database errors

Check PostgreSQL:

```bash
docker compose ps postgres
docker compose logs -f postgres
docker compose exec postgres sh -lc 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Make sure `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` are set in `.env`.

### Redis errors

Check Redis:

```bash
docker compose logs -f redis
docker compose exec redis sh -lc 'redis-cli -a "$REDIS_PASSWORD" PING'
```

The expected response is:

```text
PONG
```

### Search returns no torrents

Check:

- Jackett is running.
- Your Jackett indexers are configured and healthy.
- The Jackett API key is saved in NewBobarr settings.
- Your selected language, region, quality, and tag filters are not too restrictive.
- FlareSolverr is configured in Jackett if your indexer requires it.

Useful logs:

```bash
docker compose logs -f api jackett flaresolverr
```

### Torrent appears but does not download

Check Transmission and API logs:

```bash
docker compose logs -f api transmission
```

Also verify the torrent result can still be downloaded by Jackett. Some indexer download links expire or can only be used once.

### Download starts but the UI reports an error

NewBobarr is designed to treat a successful Transmission add as a successful download start. If a later refresh or metadata lookup fails, the UI should not claim the download failed.

If you still see a false error:

```bash
docker compose logs -f api web
```

Include the GraphQL operation and API log lines when reporting the bug.

### Download finished but still says searching or downloading

Run:

```text
Settings → Actions → Scan / reconcile library
```

Then inspect:

```bash
docker compose logs -f api
```

Reconciliation should link existing media files to the database when the filename and library path can be matched safely.

### Existing files are not detected

Check:

- files are inside the mounted library path;
- the container can read them;
- movie and TV folder names match `LIBRARY_MOVIES_FOLDER_NAME` and `LIBRARY_TV_SHOWS_FOLDER_NAME`;
- TV filenames include recognizable patterns such as `S01E01`, `S1E1`, or `2x05`.

Run Scan / reconcile library after correcting paths or filenames.

### Empty season folder appears downloaded

An empty season folder should not count as downloaded in NewBobarr. Run Scan / reconcile library and check API logs. If it remains wrong, report the show, season number, and whether the folder contains actual video files.

### Bobarr keeps searching for an episode I do not want

Open the TV show, expand the season, and choose Stop searching for that episode. For a whole season, use Stop searching season.

The episode remains missing, but NewBobarr should stop searching for it and remove it from active searching displays.

### Permission denied or files cannot be moved

Check:

- host ownership of the library and download folders;
- `PUID` and `PGID` in `.env`;
- whether the API and Transmission containers mount the same media/download paths.

Useful command:

```bash
id $(whoami)
ls -la library
```

Update folder ownership or permissions on the host as needed.

### Port already in use

Check which process uses a port:

```bash
sudo ss -ltnp | grep ':3000'
sudo ss -ltnp | grep ':4000'
```

Then change the relevant port in `.env`, for example:

```env
WEB_PORT=3010
API_PORT=4010
```

### Container restart loop

Check status and logs:

```bash
docker compose ps
docker compose logs --tail=200 api
docker compose logs --tail=200 web
```

Fix the first clear error in the logs before restarting repeatedly.

### Calendar error or missing TMDB resource

NewBobarr should keep the Calendar page usable even if TMDB metadata for one episode cannot be fetched. The affected item may show reduced metadata while the API logs a warning.

If the entire page fails, check:

```bash
docker compose logs -f api
```

### Dark mode or UI problem

Try a hard refresh after updating:

```text
Ctrl+F5 / Cmd+Shift+R
```

If the problem remains, include:

- page name;
- light or dark theme;
- desktop/mobile viewport;
- browser;
- screenshot if safe.

## Development

Install dependencies:

```bash
yarn
```

Run both API and web in development mode:

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
```

Docker build:

```bash
docker compose build
```

Major directories:

| Path | Purpose |
| --- | --- |
| `packages/api` | NestJS GraphQL API, database entities, jobs, services, reconciliation logic. |
| `packages/web` | Next.js React frontend. |
| `packages/jackett` | Jackett local configuration directory used by Compose. |
| `packages/transmission` | Transmission local configuration/watch directories used by Compose. |
| `docs` | Developer documentation. |
| `scripts` | Helper scripts inherited from Bobarr. |
| `library` | Default local media/download mount for development or simple installs. |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a beginner-friendly walkthrough of how the pieces fit together.

## Project status

NewBobarr is actively maintained as a fork of Bobarr. It does not currently use a separate public release versioning scheme beyond the inherited package version and Git history.

If you run this for important media libraries, keep backups of your database and configuration before updates.

## Contributing

Contributions are welcome.

1. Fork NewBobarr.
2. Create a branch for your change.
3. Keep the change focused.
4. Add or update tests when behavior changes.
5. Run the relevant tests and builds.
6. Open a pull request with a clear explanation.

Please do not include API keys, credentials, database dumps, private domains, private IPs, or personal media data in issues or pull requests.

## Credits

NewBobarr is based on the original [Bobarr](https://github.com/iam4x/bobarr) project by iam4x.

The original Bobarr concept, history, and MIT license attribution are preserved. NewBobarr builds on that work with additional maintenance, reliability fixes, and UI improvements.

## License

NewBobarr follows the original Bobarr license. See [LICENSE](LICENSE).
