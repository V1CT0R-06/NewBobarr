import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { map, forEachSeries, forEach, reduce, mapSeries } from 'p-iteration';
import { flatten, uniq } from 'lodash';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import childCommand from 'child-command';
import dayjs from 'dayjs';
import path from 'path';

import {
  DeepPartial,
  TransactionManager,
  EntityManager,
  Any,
  In,
} from 'typeorm';

import { FileType, DownloadableMediaState } from 'src/app.dto';
import { LazyTransaction } from 'src/utils/lazy-transaction';

import { MovieDAO } from 'src/entities/dao/movie.dao';
import { Movie } from 'src/entities/movie.entity';
import { TorrentDAO } from 'src/entities/dao/torrent.dao';
import { TVShowDAO } from 'src/entities/dao/tvshow.dao';
import { TVSeasonDAO } from 'src/entities/dao/tvseason.dao';
import { TVEpisodeDAO } from 'src/entities/dao/tvepisode.dao';
import { MediaViewDAO } from 'src/entities/dao/media-view.dao';
import { TVShow } from 'src/entities/tvshow.entity';
import { TVSeason } from 'src/entities/tvseason.entity';
import { TVEpisode } from 'src/entities/tvepisode.entity';
import { ParameterDAO } from 'src/entities/dao/parameter.dao';
import { QualityDAO } from 'src/entities/dao/quality.dao';
import { TagDAO } from 'src/entities/dao/tag.dao';

import { TMDBService } from 'src/modules/tmdb/tmdb.service';
import { JobsService } from 'src/modules/jobs/jobs.service';
import { TransmissionService } from 'src/modules/transmission/transmission.service';
import { ParamsService } from 'src/modules/params/params.service';

import { JackettInput } from './library.dto';
import { getVerifiedTMDBEpisodeNumbers } from './tmdb-episode.helpers';
import { FileDAO } from 'src/entities/dao/file.dao';
import { Torrent } from 'src/entities/torrent.entity';

export function shouldKeepExistingActiveDownload({
  state,
  transmissionTorrentExists,
}: {
  state: DownloadableMediaState;
  transmissionTorrentExists: boolean;
}) {
  return (
    state === DownloadableMediaState.DOWNLOADING && transmissionTorrentExists
  );
}

export function buildTVEpisodeWithoutTMDBMetadata(tvEpisode: TVEpisode) {
  return {
    ...tvEpisode,
    releaseDate: undefined,
  };
}

@Injectable()
export class LibraryService {
  // eslint-disable-next-line max-params
  public constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly movieDAO: MovieDAO,
    private readonly tvShowDAO: TVShowDAO,
    private readonly tvEpisodeDAO: TVEpisodeDAO,
    private readonly tmdbService: TMDBService,
    private readonly jobsService: JobsService,
    private readonly transmissionService: TransmissionService,
    private readonly mediaViewDAO: MediaViewDAO,
    private readonly paramsService: ParamsService,
    private readonly torrentDAO: TorrentDAO
  ) {
    this.logger = logger.child({ context: 'LibraryService' });
  }

  public async getDownloading() {
    const downloading = await this.mediaViewDAO.find({
      order: { id: 'ASC' },
      where: { state: DownloadableMediaState.DOWNLOADING },
    });

    const withTorrentQuality = await map(downloading, async (resource) => {
      const {
        tag,
        quality,
        transmissionTorrent,
      } = await this.transmissionService.getResourceTorrent({
        resourceId: resource.resourceId,
        resourceType: resource.resourceType,
      });

      // torrent can be deleted from transmission but not yet deleted from database
      // refresh downloading happens often this avoid errors when it's deleting
      return transmissionTorrent
        ? { ...resource, tag, quality, torrent: transmissionTorrent?.name }
        : null;
    });

    return withTorrentQuality.filter(Boolean);
  }

  public async getSearching() {
    const searching = await this.mediaViewDAO.find({
      where: { state: DownloadableMediaState.SEARCHING, monitored: true },
    });

    const downloadingSeasons = await this.mediaViewDAO.find({
      where: {
        state: Any([
          DownloadableMediaState.DOWNLOADING,
          DownloadableMediaState.SEARCHING,
        ]),
        resourceType: FileType.SEASON,
      },
    });

    const withoutEpisodesDownloadingAsSeason = searching.filter((row) =>
      row.resourceType === FileType.EPISODE
        ? !downloadingSeasons.some((season) => row.title.includes(season.title))
        : true
    );

    return withoutEpisodesDownloadingAsSeason;
  }

  public async trackMovie(movieAttributes: DeepPartial<Movie>) {
    this.logger.info('track movie', { tmdbId: movieAttributes.tmdbId });
    const movie = await this.movieDAO.save(movieAttributes);
    await this.jobsService.startDownloadMovie(movie.id);
    return movie;
  }

  public async getMovies() {
    const movies = await this.movieDAO.find({ order: { createdAt: 'DESC' } });
    const enrichedMovies = map(movies, this.enrichMovie);
    return enrichedMovies;
  }

  public async getMovie(movieId: number) {
    const movie = await this.movieDAO.findOneOrFail(movieId);
    return this.enrichMovie(movie);
  }

  public async getTVShows() {
    const tvShows = await this.tvShowDAO.find({ order: { createdAt: 'ASC' } });
    const enrichedTVShows = map(tvShows, (tvShow) => this.enrichTVShow(tvShow));
    return enrichedTVShows;
  }

  public async getTVShow(tvShowId: number, params?: { language: string }) {
    const tvShow = await this.tvShowDAO.findOneOrFail(tvShowId);
    return this.enrichTVShow(tvShow, params);
  }

  public async findMissingTVEpisodes() {
    const rows = await this.tvEpisodeDAO.findMissingFromLibrary();
    return rows.map(this.enrichTVEpisode);
  }

  @LazyTransaction()
  public async setTVEpisodeMonitored(
    episodeId: number,
    monitored: boolean,
    @TransactionManager() manager: EntityManager | null
  ) {
    const tvEpisodeDAO = manager!.getCustomRepository(TVEpisodeDAO);
    const episode = await tvEpisodeDAO.findOneOrFail(episodeId);

    // Monitoring is user intent, not media state. When a user stops searching,
    // keep downloaded/downloading media intact and only clear "searching" state
    // that no longer represents an active desired search.
    const nextState =
      !monitored && episode.state === DownloadableMediaState.SEARCHING
        ? DownloadableMediaState.MISSING
        : episode.state;

    await tvEpisodeDAO.save({
      id: episodeId,
      monitored,
      state: nextState,
    });

    if (!monitored) {
      await this.jobsService.removeDownloadEpisodeJobs(episodeId);
      await this.removeInactiveTorrentRecordOnly({
        resourceId: episodeId,
        resourceType: FileType.EPISODE,
        manager: manager!,
      });
    }

    return tvEpisodeDAO.findOneOrFail(episodeId);
  }

  @LazyTransaction()
  public async setTVSeasonMonitored(
    seasonId: number,
    monitored: boolean,
    @TransactionManager() manager: EntityManager | null
  ) {
    const tvEpisodeDAO = manager!.getCustomRepository(TVEpisodeDAO);
    const episodes = await tvEpisodeDAO.find({
      where: {
        seasonId,
        state: In([
          DownloadableMediaState.SEARCHING,
          DownloadableMediaState.MISSING,
        ]),
      },
    });

    await forEachSeries(episodes, async (episode) => {
      await this.setTVEpisodeMonitored(episode.id, monitored, manager);
    });

    return tvEpisodeDAO.find({ where: { seasonId } });
  }

  @LazyTransaction()
  public async setTVShowMissingEpisodesMonitored(
    tvShowId: number,
    monitored: boolean,
    @TransactionManager() manager: EntityManager | null
  ) {
    const tvEpisodeDAO = manager!.getCustomRepository(TVEpisodeDAO);
    const episodes = await tvEpisodeDAO.find({
      where: {
        tvShowId,
        state: In([
          DownloadableMediaState.SEARCHING,
          DownloadableMediaState.MISSING,
        ]),
      },
    });

    await forEachSeries(episodes, async (episode) => {
      await this.setTVEpisodeMonitored(episode.id, monitored, manager);
    });

    return tvEpisodeDAO.find({ where: { tvShowId } });
  }

  public async findMissingMovies() {
    const rows = await this.movieDAO.find({
      where: { state: DownloadableMediaState.MISSING },
    });
    return rows.map(this.enrichMovie);
  }

  public async calendar() {
    const movies = await mapSeries(
      await this.movieDAO.find(),
      this.enrichMovie
    );

    const tvEpisodes = await mapSeries(
      await this.tvEpisodeDAO.find({ relations: ['tvShow'] }),
      this.enrichTVEpisode
    );

    return { movies, tvEpisodes };
  }

  public async getMovieFileDetails(tmdbId: number) {
    const movie = await this.movieDAO
      .findOneOrFail({ where: { tmdbId } })
      .then(this.enrichMovie);

    const torrentEntity = await this.torrentDAO.findOne({
      where: { resourceType: FileType.MOVIE, resourceId: movie.id },
    });

    const transmissionTorrent = torrentEntity
      ? await this.transmissionService.getTorrent(torrentEntity.torrentHash)
      : null;

    const year = dayjs(movie.releaseDate).format('YYYY');

    return {
      id: tmdbId,
      libraryPath: `library/movies/${movie.title} (${year})`,
      libraryFileSize: transmissionTorrent?.totalSize,
      torrentFileName: transmissionTorrent?.name,
    };
  }

  @LazyTransaction()
  public async removeMovie(
    { tmdbId, softDelete = false }: { tmdbId: number; softDelete?: boolean },
    @TransactionManager() manager: EntityManager | null
  ) {
    this.logger.info('start remove movie', { tmdbId });
    const movieDAO = manager!.getCustomRepository(MovieDAO);
    const torrentDAO = manager!.getCustomRepository(TorrentDAO);
    const fileDAO = manager!.getCustomRepository(FileDAO);

    const movie = await movieDAO.findOneOrFail({
      where: { tmdbId },
      relations: ['files'],
    });

    const torrent = await torrentDAO.findOne({
      resourceType: FileType.MOVIE,
      resourceId: movie.id,
    });

    if (torrent) {
      await this.transmissionService.removeTorrentAndFiles(torrent.torrentHash);
      await torrentDAO.remove(torrent);
      this.logger.info('movie torrent removed', { torrent: torrent.id });
    }

    const folders = uniq(movie.files.map((file) => path.dirname(file.path)));
    await forEachSeries(folders, (folder) =>
      childCommand(`rm -rf "${folder}"`)
    );

    await fileDAO.remove(movie.files);

    if (softDelete) {
      await movieDAO.save({
        id: movie.id,
        state: DownloadableMediaState.MISSING,
      });
    } else {
      await movieDAO.remove(movie);
    }

    this.logger.info('finish remove movie', { tmdbId });
  }

  @LazyTransaction()
  public async removeTVShow(
    tmdbId: number,
    @TransactionManager() manager?: EntityManager
  ) {
    this.logger.info('start remove tv show', { tmdbId });

    const tvShowDAO = manager!.getCustomRepository(TVShowDAO);
    const torrentDAO = manager!.getCustomRepository(TorrentDAO);
    const fileDAO = manager!.getCustomRepository(FileDAO);

    const tvShow = await tvShowDAO.findOneOrFail({
      where: { tmdbId },
      relations: ['seasons', 'episodes', 'episodes.files'],
    });

    await forEach(tvShow.seasons, async (season) => {
      const torrent = await torrentDAO.findOne({
        resourceId: season.id,
        resourceType: FileType.SEASON,
      });

      if (torrent) {
        await torrentDAO.remove(torrent);
        await this.transmissionService.removeTorrentAndFiles(
          torrent.torrentHash
        );
        this.logger.info('season torrent removed', { torrent: torrent.id });
      }
    });

    await forEach(tvShow.episodes, async (episode) => {
      const torrent = await torrentDAO.findOne({
        resourceId: episode.id,
        resourceType: FileType.EPISODE,
      });

      if (torrent) {
        await torrentDAO.remove(torrent);
        await this.transmissionService.removeTorrentAndFiles(
          torrent.torrentHash
        );
        this.logger.info('episode torrent removed', { torrent: torrent.id });
      }
    });

    const tvShowFolders = uniq(
      flatten(
        tvShow.episodes.map((episode) =>
          episode.files.map((file) => path.dirname(path.dirname(file.path)))
        )
      )
    );

    await forEachSeries(tvShowFolders, (folder) =>
      childCommand(`rm -rf "${folder}"`)
    );

    this.logger.info('tv show files and folder deleted from file system');

    await fileDAO.remove(
      flatten(tvShow.episodes.map((episode) => episode.files))
    );

    await tvShowDAO.remove(tvShow);
    this.logger.info('finish remove tv show', { tmdbId });
  }

  @LazyTransaction()
  public async downloadMovie(
    movieId: number,
    jackettResult: JackettInput,
    @TransactionManager() manager: EntityManager | null
  ) {
    this.logger.info('start download movie', { movieId });
    this.logger.info(jackettResult.title);

    const movieDAO = manager!.getCustomRepository(MovieDAO);
    const movie = await movieDAO.findOneOrFail(movieId);
    const activeTorrent = await this.findActiveTorrentRecord({
      manager: manager!,
      resourceId: movieId,
      resourceType: FileType.MOVIE,
    });

    if (
      shouldKeepExistingActiveDownload({
        state: movie.state,
        transmissionTorrentExists: Boolean(activeTorrent),
      })
    ) {
      this.logger.info('movie download already active', {
        movieId,
        torrentId: activeTorrent?.id,
      });
      return;
    }

    if (movie.state !== DownloadableMediaState.MISSING) {
      await this.removeMovie(
        { tmdbId: movie.tmdbId, softDelete: true },
        manager
      );
    }

    await movieDAO.save({
      id: movieId,
      state: DownloadableMediaState.DOWNLOADING,
    });

    const torrent = await this.transmissionService.addTorrent(
      {
        torrent: jackettResult.downloadLink,
        torrentType: 'url',
        torrentAttributes: {
          resourceType: FileType.MOVIE,
          resourceId: movieId,
          quality: jackettResult.quality,
          tag: jackettResult.tag,
        },
      },
      manager
    );

    this.logger.info('download movie started', {
      movieId,
      torrent: torrent.id,
    });
  }

  @LazyTransaction()
  public async downloadTVSeason(
    seasonId: number,
    jackettResult: JackettInput,
    @TransactionManager() manager: EntityManager | null
  ) {
    this.logger.info('start download tv season', { seasonId });
    this.logger.info(jackettResult.title);

    await manager!.getCustomRepository(TVEpisodeDAO).update(
      { seasonId },
      {
        monitored: true,
      }
    );

    const tvSeasonDAO = manager!.getCustomRepository(TVSeasonDAO);
    const season = await tvSeasonDAO.findOneOrFail(seasonId);
    const activeTorrent = await this.findActiveTorrentRecord({
      manager: manager!,
      resourceId: seasonId,
      resourceType: FileType.SEASON,
    });

    if (
      shouldKeepExistingActiveDownload({
        state: season.state,
        transmissionTorrentExists: Boolean(activeTorrent),
      })
    ) {
      this.logger.info('tv season download already active', {
        seasonId,
        torrentId: activeTorrent?.id,
      });
      return;
    }

    await this.replaceSeason(seasonId, manager!);

    const torrent = await this.transmissionService.addTorrent(
      {
        torrent: jackettResult.downloadLink,
        torrentType: 'url',
        torrentAttributes: {
          resourceType: FileType.SEASON,
          resourceId: seasonId,
          quality: jackettResult.quality,
          tag: jackettResult.tag,
        },
      },
      manager
    );

    this.logger.info('download tv season started', {
      seasonId,
      torrentId: torrent.id,
    });
  }

  @LazyTransaction()
  public async downloadTVEpisode(
    episodeId: number,
    jackettResult: JackettInput,
    @TransactionManager() manager: EntityManager | null
  ) {
    this.logger.info('start download tv episode', { episodeId });
    this.logger.info(jackettResult.title);

    await manager!.getCustomRepository(TVEpisodeDAO).save({
      id: episodeId,
      monitored: true,
    });

    const tvEpisodeDAO = manager!.getCustomRepository(TVEpisodeDAO);
    const episode = await tvEpisodeDAO.findOneOrFail(episodeId);
    const activeTorrent = await this.findActiveTorrentRecord({
      manager: manager!,
      resourceId: episodeId,
      resourceType: FileType.EPISODE,
    });

    if (
      shouldKeepExistingActiveDownload({
        state: episode.state,
        transmissionTorrentExists: Boolean(activeTorrent),
      })
    ) {
      this.logger.info('tv episode download already active', {
        episodeId,
        torrentId: activeTorrent?.id,
      });
      return;
    }

    await this.replaceTVEpisode(episodeId, manager!);

    const torrent = await this.transmissionService.addTorrent(
      {
        torrent: jackettResult.downloadLink,
        torrentType: 'url',
        torrentAttributes: {
          resourceType: FileType.EPISODE,
          resourceId: episodeId,
          quality: jackettResult.quality,
          tag: jackettResult.tag,
        },
      },
      manager
    );

    this.logger.info('download episode started', {
      episodeId,
      torrentId: torrent.id,
    });
  }

  public async trackTVShow({
    tmdbId,
    seasonNumbers,
  }: {
    tmdbId: number;
    seasonNumbers: number[];
  }) {
    this.logger.info('track tv show', { tmdbId });

    const { tvShow, missingSeasons } = await this.trackMissingSeasons({
      tmdbId,
      seasonNumbers,
    });

    // start jobs outside of transaction
    await forEachSeries(missingSeasons, (season) =>
      this.jobsService.startDownloadSeason(season.id)
    );

    return tvShow;
  }

  @LazyTransaction()
  private async trackMissingSeasons(
    { tmdbId, seasonNumbers }: { tmdbId: number; seasonNumbers: number[] },
    @TransactionManager() manager?: EntityManager
  ) {
    this.logger.info('track missing seasons', { seasonNumbers });

    const tvShowDAO = manager!.getCustomRepository(TVShowDAO);
    const tvSeasonDAO = manager!.getCustomRepository(TVSeasonDAO);
    const tvEpisodeDAO = manager!.getCustomRepository(TVEpisodeDAO);

    const tmdbTVShow = await this.tmdbService.getTVShow(tmdbId);
    const tvShow = await tvShowDAO.findOrCreate({
      tmdbId,
      title: tmdbTVShow.name,
    });

    const missingSeasons = await reduce(
      seasonNumbers,
      async (result, seasonNumber) => {
        const tmdbSeason = tmdbTVShow.seasons.find(
          (_) => _.season_number === seasonNumber
        );

        if (!tmdbSeason) {
          throw new HttpException(
            `Season number ${seasonNumber} not found on TMDB`,
            HttpStatus.UNPROCESSABLE_ENTITY
          );
        }

        const alreadyExists = await tvSeasonDAO.findOne({
          where: { tvShow, seasonNumber },
        });

        if (!alreadyExists) {
          const tmdbSeasonDetails = await this.tmdbService.getTVSeasonDetails(
            tmdbId,
            seasonNumber
          );
          const verifiedEpisodeNumbers = getVerifiedTMDBEpisodeNumbers(
            tmdbSeasonDetails.episodes
          );

          if (verifiedEpisodeNumbers.length === 0) {
            throw new HttpException(
              `Season number ${seasonNumber} has no confirmed TMDB episodes`,
              HttpStatus.UNPROCESSABLE_ENTITY
            );
          }

          const season = await tvSeasonDAO.save({
            tvShow,
            seasonNumber,
          });

          this.logger.info('new season added to library', {
            seasonId: season.id,
          });

          await tvEpisodeDAO.save(
            verifiedEpisodeNumbers.map((episodeNumber) => ({
              tvShow,
              season,
              seasonNumber,
              episodeNumber,
            }))
          );

          this.logger.info('new season episodes added to library', {
            seasonId: season.id,
          });

          return [...result, season];
        }

        return result;
      },
      [] as TVSeason[]
    );

    return {
      tvShow,
      missingSeasons,
    };
  }

  public async getTVSeasonDetails({
    tvShowTMDBId,
    seasonNumber,
  }: {
    tvShowTMDBId: number;
    seasonNumber: number;
  }) {
    const episodes = await this.tvEpisodeDAO
      .createQueryBuilder('episode')
      .innerJoinAndSelect(
        'episode.tvShow',
        'tvShow',
        'tvShow.tmdbId = :tvShowTMDBId',
        { tvShowTMDBId }
      )
      .where('episode.seasonNumber = :seasonNumber', { seasonNumber })
      .orderBy('episode.episodeNumber')
      .getMany();
    return map(episodes, this.enrichTVEpisode);
  }

  @LazyTransaction()
  public async reset(
    {
      deleteFiles = false,
      resetSettings = false,
    }: { deleteFiles: boolean; resetSettings: boolean },
    @TransactionManager() manager: EntityManager | null
  ) {
    this.logger.info('start reset library', { deleteFiles, resetSettings });

    await manager!.getCustomRepository(MovieDAO).delete({});
    await manager!.getCustomRepository(TVShowDAO).delete({});
    await manager!.getCustomRepository(TVSeasonDAO).delete({});
    await manager!.getCustomRepository(TVEpisodeDAO).delete({});

    if (deleteFiles) {
      await forEachSeries(
        await manager!.getCustomRepository(TorrentDAO).find(),
        (torrent) =>
          this.transmissionService.removeTorrentAndFiles(torrent.torrentHash)
      );
      await manager!.getCustomRepository(TorrentDAO).delete({});
    }

    if (resetSettings) {
      await manager!.getCustomRepository(ParameterDAO).delete({});
      await manager!.getCustomRepository(QualityDAO).delete({});
      await manager!.getCustomRepository(TagDAO).delete({});
      await this.paramsService.initializeParamsStore(manager);
      await this.paramsService.initializeQuality(manager);
    }

    this.jobsService.startScanLibrary();

    this.logger.info('finish reset library', { deleteFiles, resetSettings });
  }

  @LazyTransaction()
  public async downloadOwnTorrent(
    {
      mediaId,
      mediaType,
      torrent,
    }: {
      mediaId: number;
      mediaType: FileType;
      torrent: string;
    },
    @TransactionManager() manager: EntityManager | null
  ) {
    this.logger.info('start download own torrent', { mediaId, mediaType });

    const baseOpts = {
      torrent,
      torrentType: torrent.startsWith('magnet') ? 'url' : 'base64',
      torrentAttributes: {
        resourceId: mediaId,
        resourceType: mediaType,
      },
    } as const;

    if (mediaType === FileType.SEASON) {
      await this.replaceSeason(mediaId, manager!);
    }

    if (mediaType === FileType.EPISODE) {
      await this.replaceTVEpisode(mediaId, manager!);
    }

    if (mediaType === FileType.MOVIE) {
      await this.replaceMovie(mediaId, manager!);
    }

    const torrentEntity = await this.transmissionService.addTorrent(
      baseOpts,
      manager
    );

    this.logger.info('download started', {
      mediaId,
      mediaType,
      torrentId: torrentEntity.id,
    });
  }

  private async replaceSeason(seasonId: number, manager: EntityManager) {
    const tvSeasonDAO = manager!.getCustomRepository(TVSeasonDAO);
    const torrentDAO = manager!.getCustomRepository(TorrentDAO);
    const tvEpisodeDAO = manager!.getCustomRepository(TVEpisodeDAO);
    const fileDAO = manager!.getCustomRepository(FileDAO);

    const tvSeason = await tvSeasonDAO.findOneOrFail({
      where: { id: seasonId },
      relations: ['episodes', 'episodes.files'],
    });

    if (tvSeason.state !== DownloadableMediaState.MISSING) {
      this.logger.info('tv season already download, removing existing files');

      await forEach(tvSeason.episodes, async (episode) => {
        const torrent = await torrentDAO.findOne({
          resourceId: episode.id,
          resourceType: FileType.EPISODE,
        });

        if (torrent) {
          await torrentDAO.remove(torrent);
          await this.transmissionService.removeTorrentAndFiles(
            torrent.torrentHash
          );
          this.logger.info('episode torrent removed', { torrent: torrent.id });
        }
      });

      const tvSeasonFolders = uniq(
        flatten(
          tvSeason.episodes.map((episode) =>
            episode.files.map((file) => path.dirname(file.path))
          )
        )
      );

      await forEachSeries(tvSeasonFolders, (folder) =>
        childCommand(`rm -rf "${folder}"`)
      );

      await fileDAO.remove(
        flatten(tvSeason.episodes.map((episode) => episode.files))
      );
    }

    await tvEpisodeDAO.save(
      tvSeason.episodes.map((v) => ({
        id: v.id,
        monitored: true,
        state: DownloadableMediaState.SEARCHING,
      }))
    );

    await tvSeasonDAO.save({
      id: seasonId,
      state: DownloadableMediaState.DOWNLOADING,
    });
  }

  private async replaceTVEpisode(episodeId: number, manager: EntityManager) {
    const tvEpisodeDAO = manager!.getCustomRepository(TVEpisodeDAO);
    const torrentDAO = manager!.getCustomRepository(TorrentDAO);

    const tvEpisode = await tvEpisodeDAO.findOneOrFail({ id: episodeId });

    if (tvEpisode.state !== DownloadableMediaState.MISSING) {
      this.logger.info('episode already downloaded, removing existing files');

      const torrents = await torrentDAO.find({
        where: { resourceId: episodeId, resourceType: FileType.EPISODE },
      });

      await forEachSeries(torrents, (torrent) =>
        this.transmissionService.removeTorrentAndFiles(torrent.torrentHash)
      );

      await torrentDAO.remove(torrents);
    }

    await tvEpisodeDAO.save({
      id: episodeId,
      monitored: true,
      state: DownloadableMediaState.DOWNLOADING,
    });
  }

  private async removeInactiveTorrentRecordOnly({
    resourceId,
    resourceType,
    manager,
  }: {
    resourceId: number;
    resourceType: FileType;
    manager: EntityManager;
  }) {
    const torrentDAO = manager.getCustomRepository(TorrentDAO);
    const torrents = await torrentDAO.find({
      where: { resourceId, resourceType },
    });

    await forEachSeries(torrents, async (torrent) => {
      // Do not remove a Transmission torrent that still exists. This protects
      // active downloads when a user only wants to stop future automatic search.
      const transmissionTorrent = await this.transmissionService
        .getTorrent(torrent.torrentHash)
        .catch(() => null);

      if (!transmissionTorrent) {
        await torrentDAO.remove(torrent);
        this.logger.info('removed inactive torrent database row', {
          torrentId: torrent.id,
          resourceId,
          resourceType,
        });
      }
    });
  }

  private async findActiveTorrentRecord({
    manager,
    resourceId,
    resourceType,
  }: {
    manager: EntityManager;
    resourceId: number;
    resourceType: FileType;
  }): Promise<Torrent | null> {
    const torrentDAO = manager.getCustomRepository(TorrentDAO);
    const torrent = await torrentDAO.findOne({
      resourceId,
      resourceType,
    });

    if (!torrent) {
      return null;
    }

    const transmissionTorrent = await this.transmissionService
      .getTorrent(torrent.torrentHash)
      .catch(() => null);

    return transmissionTorrent ? torrent : null;
  }

  private async replaceMovie(movieId: number, manager: EntityManager) {
    const movieDAO = manager!.getCustomRepository(MovieDAO);
    const torrentDAO = manager!.getCustomRepository(TorrentDAO);

    const movie = await movieDAO.findOneOrFail({ id: movieId });

    if (movie.state !== DownloadableMediaState.MISSING) {
      this.logger.info('movie already downloaded, removing existing files');

      const torrents = await torrentDAO.find({
        where: { resourceId: movieId, resourceType: FileType.MOVIE },
      });

      await forEachSeries(torrents, (torrent) =>
        this.transmissionService.removeTorrentAndFiles(torrent.torrentHash)
      );

      await torrentDAO.remove(torrents);
    }

    await movieDAO.save({
      id: movieId,
      state: DownloadableMediaState.DOWNLOADING,
    });
  }

  private enrichMovie = async (movie: Movie) => {
    const tmdbResult = await this.tmdbService
      .getMovie(movie.tmdbId)
      .then(this.tmdbService.mapMovie);
    return { ...tmdbResult, ...movie, title: tmdbResult.title };
  };

  private enrichTVShow = async (
    tvShow: TVShow,
    params?: { language: string }
  ) => {
    const tmdbResult = await this.tmdbService
      .getTVShow(tvShow.tmdbId, params)
      .then(this.tmdbService.mapTVShow);
    return { ...tmdbResult, ...tvShow, title: tmdbResult.title };
  };

  private enrichTVEpisode = async (tvEpisode: TVEpisode) => {
    const tmdbResult = await this.tmdbService
      .getTVEpisode(
        tvEpisode.tvShow.tmdbId,
        tvEpisode.seasonNumber,
        tvEpisode.episodeNumber
      )
      .catch((error) => {
        this.logger.warn(
          'tmdb episode metadata missing, using database episode only',
          {
            episodeId: tvEpisode.id,
            tvShowId: tvEpisode.tvShowId,
            tmdbId: tvEpisode.tvShow.tmdbId,
            seasonNumber: tvEpisode.seasonNumber,
            episodeNumber: tvEpisode.episodeNumber,
            error: error.message,
          }
        );

        return null;
      });

    if (!tmdbResult) {
      return buildTVEpisodeWithoutTMDBMetadata(tvEpisode);
    }

    return {
      ...tvEpisode,
      releaseDate: tmdbResult.air_date,
    };
  };
}
