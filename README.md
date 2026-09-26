# 🍿 Bobarr Enhanced

Bobarr Enhanced is a maintained fork of the original
[iam4x/bobarr](https://github.com/iam4x/bobarr) project. Upstream Git history,
attribution, and the MIT license are preserved.

Bobarr is an all-in-one movies and TV shows collection manager for BitTorrent
users. It searches TMDB, Jackett indexers, and downloads through Transmission.

This fork focuses on making Bobarr safer and more reliable for existing media
libraries:

- native library reconciliation for existing Movies and TV Shows;
- correct TV episode file associations through `tvEpisodeId`;
- monitored/unmonitored episode support;
- UI controls to stop/resume searching at episode and season level;
- safer automatic search/download paths that skip unmonitored missing episodes;
- CI checks and Docker builds suitable for a standalone public project.

## Status

This project is still beta software. Test with backups before using it against
an important media library.

## Requirements

- Docker with Docker Compose v2 (`docker compose`) or compatible
  `docker-compose`.
- A TMDB API key.
- One or more Jackett indexers.

## Quick start from a clone

```bash
git clone <your-fork-url> bobarr
cd bobarr
cp .env.example .env
mkdir -p library/downloads library/movies library/tvshows
mkdir -p packages/jackett/config packages/jackett/downloads
mkdir -p packages/transmission/config packages/transmission/watch
mkdir -p packages/vpn
cp packages/transmission/config/settings.example.json packages/transmission/config/settings.json
docker compose up -d --build
```

Then open:

- Bobarr: <http://localhost:3000>
- Bobarr GraphQL API: <http://localhost:4000/graphql>
- Bobarr background jobs: <http://localhost:4000/jobs>
- Jackett: <http://localhost:9117>
- Transmission: <http://localhost:9091>
- FlareSolverr: <http://localhost:8191>

In Jackett, add your preferred indexers and copy the Jackett API key into
Bobarr Settings.

## Configuration

Edit `.env` after copying it from `.env.example`.

Important values:

```dotenv
POSTGRES_PASSWORD=change-me
REDIS_PASSWORD=change-me
PUID=1000
PGID=1000
LIBRARY_MOVIES_FOLDER_NAME=movies
LIBRARY_TV_SHOWS_FOLDER_NAME=tvshows
```

Set `PUID` and `PGID` to the host user/group that should own files created by
the containers:

```bash
id $(whoami)
```

## Using an existing media library

Bobarr sees media inside the API container at `/usr/library`.

By default, `docker-compose.yml` maps the local `./library` folder:

```yaml
volumes:
  - ./library:/usr/library
```

If your media already lives somewhere else, update that single bind mount. For
example, if your host library is:

```text
/mnt/storage/
|- movies/
|- tvshows/
```

then set:

```yaml
volumes:
  - /mnt/storage:/usr/library
```

If your folder names are not `movies` and `tvshows`, update `.env`:

```dotenv
LIBRARY_MOVIES_FOLDER_NAME=Movies
LIBRARY_TV_SHOWS_FOLDER_NAME=Shows
```

## Library reconciliation

Settings → Actions → `Scan / reconcile library` runs the native reconciliation
logic.

The reconciliation scan:

- scans configured Movies and TV Shows folders under `/usr/library`;
- detects existing video files;
- creates missing TV season/episode records when the match is high-confidence;
- associates TV episode files through `tvEpisodeId`;
- repairs stale/missing File associations where safe;
- marks confidently imported episodes as processed;
- never deletes media;
- logs ambiguous files instead of guessing.

TV filenames are parsed case-insensitively for common forms such as:

- `S01E01`
- `S1E1`
- `s01e01`
- `2x05`

## Episode monitoring

Monitoring is user intent; media state is filesystem/download state.

- `monitored=true`: Bobarr may search/download a missing episode.
- `monitored=false`: Bobarr may show the episode as missing/unmonitored, but it
  must not search or download it automatically.

Open a TV show and expand a season:

- use `Stop searching` / `Monitor` on an episode;
- use `Stop searching season` / `Monitor season` on a season.

Stopping search does not delete media. If a torrent is already actively
downloading, Bobarr stops future automatic searching for that episode while
leaving the active Transmission torrent alone.

## Starting and stopping

Without VPN:

```bash
./scripts/bobarr.sh start
```

With OpenVPN:

```bash
cp your-vpn.conf packages/vpn/vpn.conf
./scripts/bobarr.sh start:vpn
```

With WireGuard:

```bash
cp wg0.conf packages/vpn/wg0.conf
./scripts/bobarr.sh start:wireguard
```

Stop:

```bash
./scripts/bobarr.sh stop
```

Update/rebuild after pulling new source:

```bash
./scripts/bobarr.sh update
./scripts/bobarr.sh start
```

## Docker images

The default Compose file builds local images from this checkout:

- `bobarr-api:local`
- `bobarr-web:local`

Published image names can be changed later after creating a public repository
and choosing a registry namespace.

## Development

Install dependencies:

```bash
yarn install --frozen-lockfile
```

Run lint:

```bash
yarn lint
```

Run API regression tests:

```bash
cd packages/api
yarn test
```

Build API:

```bash
cd packages/api
yarn build
```

Generate web GraphQL types and build web:

```bash
cd packages/web
yarn gql-gen
yarn build
```

On modern Node versions, this older Next/Webpack stack may require:

```bash
NODE_OPTIONS=--openssl-legacy-provider yarn build
```

Build Docker images manually:

```bash
docker build -t bobarr-api:local packages/api
docker build -t bobarr-web:local packages/web
```

## CI

GitHub Actions CI runs:

- dependency install;
- lint;
- API regression tests;
- API build;
- web GraphQL code generation;
- web build;
- API and web Docker image builds.

CI does not publish Docker images and does not require repository secrets.

## License and attribution

Bobarr Enhanced is based on the original
[iam4x/bobarr](https://github.com/iam4x/bobarr) project. The upstream MIT
license is preserved in [LICENSE](./LICENSE).
