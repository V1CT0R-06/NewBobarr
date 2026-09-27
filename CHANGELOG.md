# Changelog

## master (pre-release)

### Changed

- rewrite the README as a beginner-friendly guide for the maintained Bobarr
  fork
- document the application architecture, background jobs, integrations,
  monitoring, and reconciliation flow
- refactor the library reconciliation processor into smaller helper methods
  with clearer names and summary reporting
- remove fixed public Compose container names so multiple installs and test
  stacks can run without name collisions
- prepare repository for standalone public fork use
- make the default Compose deployment build local API/Web images from source
- replace tracked runtime `.env` with `.env.example`
- replace tracked Transmission runtime settings with a safe example file
- replace DockerHub publish workflows with CI-only checks and Docker builds
- document clone/deploy, local builds, CI, reconciliation, and monitoring

### Added

- add light/dark theme support with dark mode as the default and a navbar
  toggle that persists in the browser
- add cleaner, more compact UI styling for navigation, cards, settings,
  activity, and TV episode statuses
- add native library reconciliation for existing TV and movie files
- add high-confidence TV filename parsing for common `S01E01`, `S1E1`,
  `s01e01`, and `2x05` episode patterns
- add `tv_episode.monitored` migration and backend support for monitored vs
  unmonitored missing episodes
- add episode-level and season-level Stop searching / Monitor controls in the
  TV show details UI
- add Settings action wording for native "Scan / reconcile library"
- add regression tests for organizer file associations and reconciliation
  filename parsing

### Fixes

- remove hardcoded debug TV-season lookup from `LibraryService`
- fix TV episode organizer to save File records with `tvEpisodeId` instead of
  orphaning them with `episodeId`
- avoid searching/downloading unmonitored missing episodes from automatic jobs
- exclude unmonitored episodes from the global Searching list
- repair missing/stale File associations during library scans without deleting
  media
- ignore hidden dot-prefixed library folders during scans so staging/old media
  does not appear as downloaded
- return movies/episodes/seasons to missing when their only File rows point to
  hidden or missing library paths
- skip ambiguous TV filenames during reconciliation instead of guessing
- repair generated TV season episode filenames so organized files do not get a
  doubled extension separator

### Added

- manual search season pack (https://github.com/iam4x/bobarr/pull/172)

### Added

- added FlareSolverr for solving CloudFare on certains trackers within jackett (https://github.com/iam4x/bobarr/issues/165)
- update jobs ui
- update nodejs to v14
- track downloaded files path in database (https://github.com/iam4x/bobarr/issues/96)

### Fixes

- update strategy for scannig library
- handle multi part episodes when downloading a season pack
- wrap organize library jobs into transactions (better error handling if something fails)
- ensure torrent still exists in refresh torrent job (https://github.com/iam4x/bobarr/issues/153)

## [v1.0.0-beta.3] - 2020-12-14

### Fixes

- fix install script, make `./bobarr.sh` an executable
- fix start script by printing all api logs

## [v1.0.0-beta.2] - 2020-12-14

### Added

- display downloaded torrent informations in movie details card (https://github.com/iam4x/bobarr/pull/146)
- choose the origanize file strategy between symlink, move or copy (https://github.com/iam4x/bobarr/issues/130)
- upload own .torrent or paste magnet link (https://github.com/iam4x/bobarr/issues/123)
- env variable to change movies/tvshows folder name (https://github.com/iam4x/bobarr/issues/116)
- calendar based on your actual library (https://github.com/iam4x/bobarr/issues/75)
- clear redis cache action in settings
- pushed images on docker hub with arm support (https://github.com/iam4x/bobarr/issues/163 and https://github.com/iam4x/bobarr/issues/41)
- add install and start script (https://github.com/iam4x/bobarr/issues/4)

### Fixes

- sort movies and tvshows by recently added
- handle multiple files with same extensions, like a sample of the movie downloaded
- cache requests to tmdb api (perf)
- fix discover download tvshow fails (https://github.com/iam4x/bobarr/issues/104)
- enable firewall in vpn container, this will prevent download starts before vpn is connected (https://github.com/iam4x/bobarr/issues/132)
- disable ipv6 in vpn container (https://github.com/iam4x/bobarr/issues/133)

## [v1.0.0-beta.1] - 2020-05-20

### Added

- download movies / tv shows
- search movies / tv shows with keywords
- search movies / tv shows with filters (year, genre, score...)
- recommendations based on what you have in your library
- scan your library to automatically track what you manually download
- auto-download missing movies / tv shows periodically
- auto-download new tv shows episodes
- support multi languages torrent trackers
