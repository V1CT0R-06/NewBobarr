# NewBobarr

NewBobarr is a maintained fork of [Bobarr](https://github.com/iam4x/bobarr) for downloading and organizing movies and TV shows on a homelab.

Docker Compose includes NewBobarr, PostgreSQL, Redis, Jackett, FlareSolverr, and Transmission. You only need Docker, a TMDB API key, and storage for your downloads and media.

## Install

Clone the project and create your private configuration:

```bash
git clone https://github.com/V1CT0R-06/NewBobarr.git
cd NewBobarr
cp .env.example .env
nano .env
```

Set secure database passwords and the user that should own your media files:

```env
POSTGRES_PASSWORD=choose-a-secure-password
REDIS_PASSWORD=choose-a-secure-password
PUID=1000
PGID=1000
```

Find your user and group IDs with `id`.

### Choose where media is stored

The default setup stores everything in `NewBobarr/library`. You can use it as-is for testing.

For a separate media drive, edit the volume paths in `docker-compose.yml`:

```yaml
services:
  api:
    volumes:
      - /path/to/media:/usr/library

  transmission:
    volumes:
      - /path/to/media/downloads:/downloads
```

The folder names inside `/path/to/media` must match these `.env` settings:

```env
LIBRARY_MOVIES_FOLDER_NAME=Movies
LIBRARY_TV_SHOWS_FOLDER_NAME=Shows
```

Linux folder names are case-sensitive. Make sure the user selected by `PUID` and `PGID` can read and write these folders.

### Start NewBobarr

```bash
docker compose up -d --build
docker compose ps
```

Open these pages, replacing `localhost` with your server address when needed:

- NewBobarr: `http://localhost:3000`
- Jackett: `http://localhost:9117`
- Transmission: `http://localhost:9091`
- API health check: `http://localhost:4000/health`

## First setup

1. Open Jackett and add the indexers you want to use.
2. Copy the API key shown by Jackett.
3. Open NewBobarr, then go to **Settings**.
4. Enter your TMDB key and the Jackett URL and API key.
5. Choose your region, language, qualities, and tags.

If you already have media, use **Settings → Actions → Scan / reconcile library**. Files named with patterns such as `Show Name S01E01.mkv` can be linked to the matching episode. Empty season folders are not treated as downloaded media.

An episode can be missing without being wanted. Use **Stop searching** on an episode or season when you do not want NewBobarr to download it. Use **Monitor** to enable searching again.

## Updating

Back up your `.env` and PostgreSQL data before a major update, then run:

```bash
git pull
docker compose build
docker compose up -d
```

## Useful commands

```bash
docker compose ps                 # Show container status
docker compose logs -f            # Follow all logs
docker compose logs -f api        # Follow API logs
docker compose up -d              # Start NewBobarr
docker compose down               # Stop NewBobarr
```

If the website does not load, check `docker compose ps` and the `web` and `api` logs. If searches fail, check the `api` and `jackett` logs. If downloads fail, check the `api` and `transmission` logs. If completed files are not recognized, run the library scan from Settings.

For source layout and development commands, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Credits

NewBobarr is independently maintained and based on the original [Bobarr](https://github.com/iam4x/bobarr) project by iam4x. Its Git history, authorship, and [MIT license](LICENSE) are preserved.
