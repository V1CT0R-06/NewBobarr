# 🍿 NewBobarr

NewBobarr is a maintained fork of [Bobarr](https://github.com/iam4x/bobarr), originally created by iam4x.

It is a self-hosted app for managing movies and TV shows. You search for media in one web interface, NewBobarr finds torrents through Jackett, sends them to Transmission, and organizes completed files into your media library.

This fork keeps Bobarr simple while fixing real homelab problems: better library scans, safer TV episode matching, monitoring controls for unwanted episodes, clearer download feedback, and a cleaner dark/light UI.

## What you get

- One web UI for movies and TV shows
- TMDB metadata search
- Jackett torrent search
- Transmission downloads
- Automatic media organization
- Existing-library scan for media you already have
- Episode and season monitoring controls
- “Stop searching” for episodes or seasons you do not want
- Dark mode, light mode, and responsive layout
- Docker Compose setup with PostgreSQL, Redis, Jackett, FlareSolverr, and Transmission

## Before you start

You should already have:

- a Linux server or other Docker-capable machine
- Docker installed
- the Docker Compose plugin installed
- enough disk space for downloads and media
- a TMDB API key

You do not need to install PostgreSQL, Redis, Jackett, FlareSolverr, or Transmission separately. The included Compose file starts them for you.

## Install

Clone the project:

```bash
git clone https://github.com/V1CT0R-06/NewBobarr.git
cd NewBobarr
```

Create your local config file:

```bash
cp .env.example .env
nano .env
```

At minimum, change these values:

```env
POSTGRES_PASSWORD=change-this
REDIS_PASSWORD=change-this
PUID=1000
PGID=1000
```

Find your user and group IDs with:

```bash
id $(whoami)
```

Start NewBobarr:

```bash
docker compose up -d --build
```

Check that it started:

```bash
docker compose ps
```

Open NewBobarr:

```text
http://localhost:3000
```

If you are installing on a server, replace `localhost` with your server IP or domain.

## First-time setup

1. Open Jackett:

   ```text
   http://localhost:9117
   ```

2. Add your torrent indexers in Jackett.

3. Copy the Jackett API key from Jackett.

4. Open NewBobarr Settings:

   ```text
   http://localhost:3000/settings
   ```

5. Add your:

   - TMDB API key
   - Jackett URL
   - Jackett API key
   - region and language
   - preferred qualities and tags
   - media organization settings

6. If you already have movies or shows, run:

   ```text
   Settings → Actions → Scan / reconcile library
   ```

## Important ports

By default:

- NewBobarr: `http://localhost:3000`
- API / GraphQL: `http://localhost:4000/graphql`
- API health: `http://localhost:4000/health`
- Jackett: `http://localhost:9117`
- Transmission: `http://localhost:9091`
- FlareSolverr: `http://localhost:8191`

You can change ports in `.env`.

## Media folders

The default setup stores media inside the project folder:

```text
NewBobarr/
  library/
    downloads/
    movies/
    tvshows/
```

That is fine for testing, but most homelab users should put media on a real media drive.

Example:

```text
/path/to/media/
  downloads/
  Movies/
  Shows/
```

To use that drive, edit `docker-compose.yml`:

```yaml
services:
  api:
    volumes:
      - /path/to/media:/usr/library

  transmission:
    volumes:
      - /path/to/media/downloads:/downloads
```

Then make sure `.env` matches your folder names:

```env
LIBRARY_MOVIES_FOLDER_NAME=Movies
LIBRARY_TV_SHOWS_FOLDER_NAME=Shows
```

The names are case-sensitive. `Shows` and `shows` are different folders on Linux.

## Using NewBobarr

### Add a movie

1. Search for a movie.
2. Add it.
3. Pick a torrent.
4. Transmission downloads it.
5. NewBobarr organizes it into your movie folder.

### Add a TV show

1. Search for a show.
2. Add the show.
3. Choose the seasons or episodes you want.
4. Pick torrents.
5. NewBobarr organizes completed episodes into your TV folder.

### Stop unwanted searches

NewBobarr separates “missing” from “wanted.”

If an episode is missing but you do not want it, click Stop searching. NewBobarr will remember that the episode is missing, but it will stop trying to download it.

You can do this for:

- one episode
- a whole season

Use Monitor to allow searching again.

## Existing media

If you already have media files, use:

```text
Settings → Actions → Scan / reconcile library
```

This tells NewBobarr to look at your actual files and update its database.

It can recognize TV episode names like:

```text
Show Name S01E01.mkv
Show Name S1E1.mp4
Show Name 2x05.mkv
The IT Crowd - S01E01 - 720p [UNKNOWN].mp4
```

An empty season folder does not count as downloaded. There must be real video files inside.

If a filename is unclear, NewBobarr skips it instead of guessing.

## Updating

Before updating, back up your `.env` and database.

Then run:

```bash
git pull
docker compose build
docker compose up -d
docker compose logs -f api
```

Database migrations run when the API starts.

## Backup

Back up at least:

- `.env`
- your changed `docker-compose.yml`
- PostgreSQL database
- Jackett config
- Transmission config

Example database backup:

```bash
mkdir -p backups
docker compose exec -T postgres sh -lc 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/bobarr-db.sql
```

Your media files are separate. Back them up with your normal media backup method.

## Useful commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# See containers
docker compose ps

# Follow logs
docker compose logs -f

# Follow API logs
docker compose logs -f api

# Rebuild after updating source
docker compose build
```

## Common problems

### The web page does not load

Run:

```bash
docker compose ps
docker compose logs -f web api
```

Check that port `3000` is not already used. If it is, change `WEB_PORT` in `.env`.

### Search finds no torrents

Check:

- Jackett is running
- your Jackett indexers work
- the Jackett API key is saved in NewBobarr Settings
- your language, region, quality, or tag filters are not too strict

Logs:

```bash
docker compose logs -f api jackett
```

### Downloads do not start

Check Transmission:

```bash
docker compose logs -f api transmission
```

Also check that Jackett can still download the torrent. Some indexer links expire.

### A completed download still says searching

Run:

```text
Settings → Actions → Scan / reconcile library
```

Then check API logs:

```bash
docker compose logs -f api
```

### Existing files are not detected

Check:

- files are inside the mounted media folder
- the container can read them
- folder names in `.env` match the real folders
- TV filenames contain a pattern like `S01E01`, `S1E1`, or `2x05`

### Permission denied

Check your user IDs:

```bash
id $(whoami)
```

Set `PUID` and `PGID` in `.env` to those values. Also make sure your media folders are writable by that user.

## How it works

```text
Web UI
  ↓
API
  ├─ PostgreSQL database
  ├─ Redis jobs
  ├─ TMDB / OMDB metadata
  ├─ Jackett torrent search
  └─ Transmission downloads
       ↓
     Organizer
       ↓
  Movies / TV Shows folders
```

More developer detail is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

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

Main folders:

- `packages/api` — backend API, database, jobs, integrations
- `packages/web` — frontend web app
- `docs` — developer documentation
- `library` — default local media folder

## Contributing

Fork the repo, make a focused change, add or update tests, run the checks, and open a pull request.

Do not include API keys, passwords, database dumps, private domains, private IPs, or personal media files.

## Credits and license

NewBobarr is based on [Bobarr](https://github.com/iam4x/bobarr) by iam4x.

The original Git history, authorship, and MIT license attribution are preserved.

See [LICENSE](LICENSE).
