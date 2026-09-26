import dayjs from 'dayjs';
import leven from 'leven';
import path from 'path';
import { promises as fs } from 'fs';
import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { times, orderBy, flatten } from 'lodash';
import { Job, Queue } from 'bull';

import { Transaction, TransactionManager, EntityManager } from 'typeorm';

import {
  filterSeries,
  forEach,
  forEachSeries,
  map,
  mapSeries,
} from 'p-iteration';

import { LIBRARY_CONFIG } from 'src/config';

import {
  JobsQueue,
  DownloadableMediaState,
  ScanLibraryQueueProcessors,
} from 'src/app.dto';

import { sanitize } from 'src/utils/sanitize';

import { JobsService } from 'src/modules/jobs/jobs.service';
import { TMDBService } from 'src/modules/tmdb/tmdb.service';
import {
  isAllowedVideoFile,
  normalizeMediaTitle,
  parseEpisodeFile,
} from 'src/modules/library/reconciliation.helpers';

import { MovieDAO } from 'src/entities/dao/movie.dao';
import { TVShowDAO } from 'src/entities/dao/tvshow.dao';
import { TVEpisodeDAO } from 'src/entities/dao/tvepisode.dao';
import { TVSeasonDAO } from 'src/entities/dao/tvseason.dao';
import { FileDAO } from 'src/entities/dao/file.dao';
import { TVShow } from 'src/entities/tvshow.entity';
import { TVSeason } from 'src/entities/tvseason.entity';

interface TVShowScanSummary {
  filesScanned: number;
  episodesImported: number;
  associationsCreated: number;
  associationsRepaired: number;
  ambiguousFilesSkipped: number;
  nonVideoFilesSkipped: number;
}

function createEmptyTVShowScanSummary(): TVShowScanSummary {
  return {
    filesScanned: 0,
    episodesImported: 0,
    associationsCreated: 0,
    associationsRepaired: 0,
    ambiguousFilesSkipped: 0,
    nonVideoFilesSkipped: 0,
  };
}

function addTVShowScanSummary(
  current: TVShowScanSummary,
  next: TVShowScanSummary
): TVShowScanSummary {
  return {
    filesScanned: current.filesScanned + next.filesScanned,
    episodesImported: current.episodesImported + next.episodesImported,
    associationsCreated: current.associationsCreated + next.associationsCreated,
    associationsRepaired:
      current.associationsRepaired + next.associationsRepaired,
    ambiguousFilesSkipped:
      current.ambiguousFilesSkipped + next.ambiguousFilesSkipped,
    nonVideoFilesSkipped:
      current.nonVideoFilesSkipped + next.nonVideoFilesSkipped,
  };
}

@Processor(JobsQueue.SCAN_LIBRARY)
export class ScanLibraryProcessor {
  public constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    @InjectQueue(JobsQueue.SCAN_LIBRARY)
    private readonly scanLibraryQueue: Queue,
    private readonly jobsService: JobsService,
    private readonly tmdbService: TMDBService,
    private readonly tvEpisodeDAO: TVEpisodeDAO
  ) {
    this.logger = logger.child({ context: 'ScanLibrary' });
  }

  @Process(ScanLibraryQueueProcessors.FIND_NEW_EPISODES)
  public async findNewEpisodes() {
    this.logger.info('start find new tvshow episodes');

    const tvShowLastEpisodeTracked = await this.tvEpisodeDAO
      .createQueryBuilder('episode')
      .distinctOn(['episode.tvShow'])
      .leftJoinAndSelect('episode.tvShow', 'tvShow')
      .leftJoinAndSelect('episode.season', 'season')
      .orderBy('episode.tvShow', 'DESC')
      .addOrderBy('episode.seasonNumber', 'DESC')
      .addOrderBy('episode.episodeNumber', 'DESC')
      .getMany();

    this.logger.info(`found ${tvShowLastEpisodeTracked.length} seasons`);

    await forEachSeries(tvShowLastEpisodeTracked, async (episode) => {
      const tmdbResult = await this.tmdbService
        .getTVShowSeasons(episode.tvShow.tmdbId)
        .then((seasons) =>
          seasons.find((season) => season.seasonNumber === episode.seasonNumber)
        );

      if (!tmdbResult) {
        this.logger.info('did not find tmdb season', { episode });
        throw new Error('did not find tmdb season');
      }

      const newEpisodesCount = tmdbResult.episodeCount - episode.episodeNumber;

      this.logger.info(`found ${newEpisodesCount} new episodes`, {
        tvShow: episode.tvShow.title,
        seasonNumber: episode.seasonNumber,
      });

      if (newEpisodesCount > 0) {
        const newEpisodes = await this.tvEpisodeDAO.save(
          times(newEpisodesCount, (index) => ({
            tvShow: episode.tvShow,
            season: episode.season,
            episodeNumber: episode.episodeNumber + index + 1,
            seasonNumber: episode.seasonNumber,
          }))
        );

        await map(newEpisodes, ({ id }) => {
          this.jobsService.startDownloadEpisode(id);
        });
      }
    });

    this.logger.info('finish find new tvshow episodes');
  }

  @Process(ScanLibraryQueueProcessors.SCAN_LIBRARY_FOLDER)
  public scanLibrary() {
    this.scanLibraryQueue.add(
      ScanLibraryQueueProcessors.SCAN_MOVIES_FOLDER,
      {}
    );

    this.scanLibraryQueue.add(
      ScanLibraryQueueProcessors.SCAN_TV_SHOWS_FOLDER,
      {}
    );
  }

  @Process(ScanLibraryQueueProcessors.SCAN_MOVIES_FOLDER)
  public async scanMoviesFolder() {
    this.logger.info('start scan movies folder', {
      folderName: LIBRARY_CONFIG.moviesFolderName,
    });

    const root = `/usr/library/${LIBRARY_CONFIG.moviesFolderName}`;
    const movies = await fs
      .readdir(root)
      .then((entries) =>
        filterSeries(entries, (entry) =>
          fs.stat(path.join(root, entry)).then((result) => result.isDirectory())
        )
      );

    this.logger.info(`found ${movies.length} movies on disk`);

    await forEach(movies, (movie) =>
      this.scanLibraryQueue.add(
        ScanLibraryQueueProcessors.PROCESS_MOVIE_FOLDER,
        { movie }
      )
    );

    this.logger.info('finish scan movies folder');
  }

  @Process(ScanLibraryQueueProcessors.SCAN_TV_SHOWS_FOLDER)
  public async scanTVShowsFolder() {
    this.logger.info('start scan tvshows folder', {
      folderName: LIBRARY_CONFIG.tvShowsFolderName,
    });

    const root = `/usr/library/${LIBRARY_CONFIG.tvShowsFolderName}`;
    const tvshows = (await fs.readdir(root, { withFileTypes: true }))
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    this.logger.info(`found ${tvshows.length} tvshows on disk`);

    await forEach(tvshows, (tvshow) =>
      this.scanLibraryQueue.add(
        ScanLibraryQueueProcessors.PROCESS_TV_SHOW_FOLDER,
        { tvshow }
      )
    );

    this.logger.info('finish scan tvshows folder');
  }

  @Process(ScanLibraryQueueProcessors.PROCESS_MOVIE_FOLDER)
  @Transaction()
  public async processMovieFolder(
    { data: { movie } }: Job<{ movie: string }>,
    @TransactionManager() manager?: EntityManager
  ) {
    this.logger.info('processing movie', { movie });

    const movieDAO = manager!.getCustomRepository(MovieDAO);
    const fileDAO = manager!.getCustomRepository(FileDAO);

    const root = `/usr/library/${LIBRARY_CONFIG.moviesFolderName}`;
    const movieFolder = path.join(root, movie);
    const movieFiles = (await fs.readdir(movieFolder, { withFileTypes: true }))
      .filter((dirent) => dirent.isFile() || dirent.isSymbolicLink())
      .map((dirent) => dirent.name);

    const files = await mapSeries(movieFiles, async (file) => {
      const match = await fileDAO.findOne({
        where: { path: path.join(movieFolder, file) },
        relations: ['movie'],
      });
      return { match, file: path.join(movieFolder, file) };
    });
    const allowedFiles = files.filter(({ file }) => isAllowedVideoFile(file));
    const skippedFiles = files.length - allowedFiles.length;

    const movieInDatabase = allowedFiles.find((file) => file.match?.movie);
    const untrackedFiles = allowedFiles.filter((file) => !file.match?.movie);

    if (movieInDatabase) {
      this.logger.info('movie already tracked in library', { untrackedFiles });

      await forEachSeries(untrackedFiles, ({ file, match }) =>
        fileDAO.save({
          id: match?.id,
          path: file,
          movieId: movieInDatabase.match?.movie?.id,
          tvEpisodeId: null,
        })
      );

      this.logger.info('finish processing movie', {
        movie,
        filesScanned: allowedFiles.length,
        skippedFiles,
        associationsRepaired: untrackedFiles.length,
      });

      return;
    }

    const [, title, year] = /^(.+) \((\d+)/.exec(movie) || [];

    if (!title || !year) {
      throw new Error(`cant parse movie name or year [${movie}]`);
    }

    this.logger.info('parsed filename', { title, year });

    const matchByTitle = await movieDAO.findOne({ where: { title } });

    if (matchByTitle) {
      this.logger.info('movie already in database', { title, year });

      await forEachSeries(untrackedFiles, ({ file, match }) =>
        fileDAO.save({
          id: match?.id,
          path: file,
          movieId: matchByTitle.id,
          tvEpisodeId: null,
        })
      );

      return;
    }

    const localizedResults = await this.tmdbService.searchMovie(title);
    const englishResults = await this.tmdbService.searchMovie(title, {
      language: 'en',
    });

    const results = [...localizedResults, ...englishResults];
    this.logger.info(`found ${results.length} potential match on tmdb`);

    const tmdbMovie = (() => {
      const [exactMatch] = results.filter(
        (result) =>
          dayjs(result.releaseDate).format('YYYY') === year &&
          (sanitize(title) === sanitize(result.title) ||
            sanitize(title) === sanitize(result.originalTitle))
      );

      if (exactMatch) {
        return exactMatch;
      }

      this.logger.warn('could not find exact match movie');
      this.logger.warn('fallback to year match and levenstein');

      const [bestMatch] = orderBy(
        results.filter(
          (result) => dayjs(result.releaseDate).format('YYYY') === year
        ),
        [(result) => leven(result.title, title)],
        ['asc']
      );

      if (bestMatch) {
        this.logger.warn(`best guessed match for ${title}`);
        this.logger.warn(bestMatch.title);
        return bestMatch;
      }

      return undefined;
    })();

    if (!tmdbMovie) {
      this.logger.error('no movie found matching title and year for');
      this.logger.error(`${title} (${year})`);
      return;
    }

    this.logger.info('found movie on tmdb', { tmdbId: tmdbMovie.tmdbId });

    const match = await movieDAO.findOne({
      where: { tmdbId: tmdbMovie.tmdbId },
    });

    if (match) {
      this.logger.info('movie already in library', {
        tmdbId: tmdbMovie.tmdbId,
      });

      await forEachSeries(untrackedFiles, ({ file, match: fileMatch }) =>
        fileDAO.save({
          id: fileMatch?.id,
          path: file,
          movieId: match.id,
          tvEpisodeId: null,
        })
      );

      this.logger.info('finish processing movie', {
        movie,
        filesScanned: allowedFiles.length,
        skippedFiles,
        associationsRepaired: untrackedFiles.length,
      });
    } else {
      const newMovie = await movieDAO.save({
        title,
        tmdbId: tmdbMovie.id,
        state: DownloadableMediaState.PROCESSED,
      });

      await forEachSeries(untrackedFiles, ({ file, match }) =>
        fileDAO.save({
          id: match?.id,
          path: file,
          movieId: newMovie.id,
          tvEpisodeId: null,
        })
      );

      this.logger.info('new movie saved in database', {
        tmdbId: tmdbMovie.tmdbId,
      });

      this.logger.info('finish processing movie', {
        movie,
        filesScanned: allowedFiles.length,
        skippedFiles,
        moviesImported: 1,
        associationsRepaired: untrackedFiles.length,
      });
    }
  }

  @Process(ScanLibraryQueueProcessors.PROCESS_TV_SHOW_FOLDER)
  @Transaction()
  public async processTVShow(
    { data: { tvshow } }: Job<{ tvshow: string }>,
    @TransactionManager() manager?: EntityManager
  ) {
    this.logger.info('start processing tvshow', { tvshow });

    const tvShow = await this.findOrCreateTVShowFromFolder(tvshow, manager!);

    if (!tvShow) {
      return;
    }

    const episodeFilePaths = await this.getTVShowEpisodeFilePaths(tvshow);
    let summary = createEmptyTVShowScanSummary();

    await forEachSeries(episodeFilePaths, async (episodePath) => {
      const fileSummary = await this.reconcileTVEpisodeFile({
        episodePath,
        tvShow,
        manager: manager!,
      });

      summary = addTVShowScanSummary(summary, fileSummary);
    });

    this.logger.info('finish processing tvshow', { tvshow, ...summary });
  }

  private async findOrCreateTVShowFromFolder(
    tvshowFolderName: string,
    manager: EntityManager
  ): Promise<TVShow | null> {
    const tvShowDAO = manager.getCustomRepository(TVShowDAO);
    const normalizedFolderName = normalizeMediaTitle(tvshowFolderName);
    const existingTVShow = (await tvShowDAO.find()).find(
      (candidate) =>
        normalizeMediaTitle(candidate.title) === normalizedFolderName
    );

    if (existingTVShow) {
      return existingTVShow;
    }

    const [tmdbResult] = await this.tmdbService.searchTVShow(tvshowFolderName, {
      language: 'en',
    });

    if (!tmdbResult) {
      this.logger.error('tvshow not found on tmdb', { tvshowFolderName });
      return null;
    }

    this.logger.info('tvshow found on tmdb', { tmdbId: tmdbResult.tmdbId });

    return tvShowDAO.findOrCreate({
      tmdbId: tmdbResult.tmdbId,
      title: tvshowFolderName,
    });
  }

  private async getTVShowEpisodeFilePaths(tvshowFolderName: string) {
    const tvShowsRoot = `/usr/library/${LIBRARY_CONFIG.tvShowsFolderName}`;
    const tvShowPath = path.join(tvShowsRoot, tvshowFolderName);
    const seasonFolders = await fs.readdir(tvShowPath, { withFileTypes: true });

    return mapSeries(
      seasonFolders
        .filter((seasonFolder) => seasonFolder.isDirectory())
        .map((seasonFolder) => seasonFolder.name),
      async (seasonFolderName) => {
        const seasonPath = path.join(tvShowPath, seasonFolderName);
        const entries = await fs.readdir(seasonPath, { withFileTypes: true });

        return entries
          .filter((entry) => entry.isFile() || entry.isSymbolicLink())
          .map((entry) => path.join(seasonPath, entry.name));
      }
    ).then(flatten);
  }

  private async reconcileTVEpisodeFile({
    episodePath,
    tvShow,
    manager,
  }: {
    episodePath: string;
    tvShow: TVShow;
    manager: EntityManager;
  }): Promise<TVShowScanSummary> {
    const summary = createEmptyTVShowScanSummary();

    if (!isAllowedVideoFile(episodePath)) {
      return { ...summary, nonVideoFilesSkipped: 1 };
    }

    this.logger.info('start processing episode', {
      episode: path.basename(episodePath),
    });

    const parsedEpisode = parseEpisodeFile(episodePath);

    if (!parsedEpisode) {
      this.logger.warn('could not confidently parse episode filename', {
        episodePath,
      });
      return { ...summary, filesScanned: 1, ambiguousFilesSkipped: 1 };
    }

    this.logger.info('found season number and episode', parsedEpisode);

    const season = await this.findOrCreateDownloadedSeason({
      tvShow,
      seasonNumber: parsedEpisode.seasonNumber,
      manager,
    });

    const episode = await manager
      .getCustomRepository(TVEpisodeDAO)
      .findOrCreate({
        tvShowId: tvShow.id,
        seasonId: season.id,
        episodeNumber: parsedEpisode.episodeNumber,
        seasonNumber: parsedEpisode.seasonNumber,
      });
    const didImportEpisode =
      episode.state !== DownloadableMediaState.PROCESSED &&
      episode.state !== DownloadableMediaState.DOWNLOADED;

    await manager.getCustomRepository(TVEpisodeDAO).save({
      id: episode.id,
      state: DownloadableMediaState.PROCESSED,
      monitored: episode.monitored,
      season,
    });

    const fileAssociationResult = await this.reconcileFileAssociation({
      filePath: episodePath,
      tvEpisodeId: episode.id,
      manager,
    });

    return {
      ...summary,
      filesScanned: 1,
      episodesImported: didImportEpisode ? 1 : 0,
      associationsCreated: fileAssociationResult === 'created' ? 1 : 0,
      associationsRepaired: fileAssociationResult === 'repaired' ? 1 : 0,
    };
  }

  private async findOrCreateDownloadedSeason({
    tvShow,
    seasonNumber,
    manager,
  }: {
    tvShow: TVShow;
    seasonNumber: number;
    manager: EntityManager;
  }): Promise<TVSeason> {
    const tvSeasonDAO = manager.getCustomRepository(TVSeasonDAO);
    const season = await tvSeasonDAO.findOrCreate(
      { tvShowId: tvShow.id, seasonNumber },
      DownloadableMediaState.DOWNLOADED
    );

    if (
      season.state === DownloadableMediaState.SEARCHING ||
      season.state === DownloadableMediaState.DOWNLOADING
    ) {
      return tvSeasonDAO.save({
        id: season.id,
        state: DownloadableMediaState.DOWNLOADED,
      });
    }

    return season;
  }

  private async reconcileFileAssociation({
    filePath,
    tvEpisodeId,
    manager,
  }: {
    filePath: string;
    tvEpisodeId: number;
    manager: EntityManager;
  }): Promise<'created' | 'repaired' | 'unchanged'> {
    const fileDAO = manager.getCustomRepository(FileDAO);
    const existingFile = await fileDAO.findOne({ where: { path: filePath } });

    if (!existingFile) {
      await fileDAO.save({ path: filePath, tvEpisodeId });
      return 'created';
    }

    if (existingFile.tvEpisodeId === tvEpisodeId) {
      return 'unchanged';
    }

    await fileDAO.save({
      id: existingFile.id,
      tvEpisodeId,
      movieId: null,
    });
    return 'repaired';
  }
}
