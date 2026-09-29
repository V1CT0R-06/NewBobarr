# 🍿 NewBobarr

NewBobarr is a maintained fork of [Bobarr](https://github.com/iam4x/bobarr), originally created by iam4x.

It is a self-hosted media app for movies and TV shows. You search in NewBobarr, it finds torrents through Jackett, sends them to Transmission, and organizes completed files into your media library.

This fork keeps Bobarr simple while adding practical fixes for library scanning, existing media, episode monitoring, download feedback, dark mode, and mobile layout.

## What it includes

- NewBobarr web UI
- NewBobarr API
- PostgreSQL
- Redis
- Jackett
- FlareSolverr
- Transmission

Main features:

- Movies and TV shows in one place
- TMDB metadata
- Jackett torrent search
- Transmission downloads
- Automatic organization
- Existing-library scan
- “Stop searching” for unwanted episodes/seasons
- Dark and light themes

## Requirements

You need:

- Docker
- Docker Compose
- a TMDB API key
- enough disk space for downloads and media

You do not need to install PostgreSQL, Redis, Jackett, FlareSolverr, or Transmission separately. Docker Compose starts them.

## Install

```bash
git clone https://github.com/V1CT0R-06/NewBobarr.git
cd NewBobarr
cp .env.example .env
nano .env
```

Change at least:

```env
POSTGRES_PASSWORD=change-this
REDIS_PASSWORD=change-this
PUID=1000
PGID=1000
```

Find your `PUID` and `PGID` with:

```bash
id $(whoami)
```

Start everything:

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:3000
```

If NewBobarr is on another server, replace `localhost` with that server’s IP address or domain.

## First setup

1. Open Jackett:

   ```text
   http://localhost:9117
   ```

2. Add your torrent indexers.
3. Copy the Jackett API key.
4. Open NewBobarr Settings:

   ```text
   http://localhost:3000/settings
   ```

5. Add your TMDB key, Jackett URL/API key, region, language, qualities, and tags.

Useful URLs:

- NewBobarr: `http://localhost:3000`
- API health: `http://localhost:4000/health`
- Jackett: `http://localhost:9117`
- Transmission: `http://localhost:9091`

## Media folders

By default, NewBobarr uses:

```text
NewBobarr/library/
  downloads/
  movies/
  tvshows/
```

For a real homelab, you probably want your media on a larger drive.

Example media drive:

```text
/path/to/media/
  downloads/
  Movies/
  Shows/
```

Edit `docker-compose.yml`:

```yaml
services:
  api:
    volumes:
      - /path/to/media:/usr/library

  transmission:
    volumes:
      - /path/to/media/downloads:/downloads
```

Then make `.env` match your folder names:

```env
LIBRARY_MOVIES_FOLDER_NAME=Movies
LIBRARY_TV_SHOWS_FOLDER_NAME=Shows
```

Folder names are case-sensitive on Linux.

## Existing media

If you already have movies or shows, run this after setup:

```text
Settings → Actions → Scan / reconcile library
```

NewBobarr will scan your media folders and link files it can safely recognize.

TV filenames should include patterns like:

```text
Show Name S01E01.mkv
Show Name S1E1.mp4
Show Name 2x05.mkv
```

An empty season folder does not count as downloaded media.

## Monitoring

NewBobarr separates “missing” from “wanted.”

If an episode is missing but you do not want it, click Stop searching. NewBobarr will remember it is missing but will not keep trying to download it.

You can stop or restart searching for:

- one episode
- a whole season

## Common commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Status
docker compose ps

# Logs
docker compose logs -f

# API logs
docker compose logs -f api

# Update
git pull
docker compose build
docker compose up -d
```

## Troubleshooting

If the web UI does not load:

```bash
docker compose ps
docker compose logs -f web api
```

If search finds no torrents, check Jackett:

```bash
docker compose logs -f api jackett
```

If downloads do not start, check Transmission:

```bash
docker compose logs -f api transmission
```

If completed media is not detected, run:

```text
Settings → Actions → Scan / reconcile library
```

If files cannot be moved, check permissions:

```bash
id $(whoami)
ls -la library
```

Set `PUID` and `PGID` in `.env` to the user that should own media files.

## Development

```bash
yarn
yarn lint
cd packages/api && yarn test
cd ../web && yarn gql-gen && yarn test
```

More architecture notes are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Credits and license

NewBobarr is based on [Bobarr](https://github.com/iam4x/bobarr) by iam4x.

The original Git history, authorship, and MIT license attribution are preserved.

See [LICENSE](LICENSE).
