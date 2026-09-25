import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchOutlined } from '@ant-design/icons';
import { FaChevronCircleDown, FaChevronCircleRight } from 'react-icons/fa';

import {
  useGetTvSeasonDetailsQuery,
  useSetTvEpisodeMonitoredMutation,
  useSetTvSeasonMonitoredMutation,
  TmdbFormattedTvSeason,
  EnrichedTvEpisode,
  DownloadableMediaState,
  GetTvSeasonDetailsDocument,
} from '../../utils/graphql';

import { availableIn } from '../../utils/available-in';
import { ManualSearchComponent } from '../manual-search/manual-search.component';
import { Media } from '../manual-search/manual-search.helpers';

interface TVSeasonDetailsProps {
  tvShowTMDBId: number;
  season: TmdbFormattedTvSeason;
  tvShowTitle: string;
}

export function TVSeasonDetailsComponent({
  tvShowTMDBId,
  season,
  tvShowTitle,
}: TVSeasonDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [manualSearch, setManualSearch] = useState<Media | null>(null);

  const { data, loading } = useGetTvSeasonDetailsQuery({
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
    variables: { tvShowTMDBId, seasonNumber: season.seasonNumber },
  });

  const refetchSeasonDetails = [
    {
      query: GetTvSeasonDetailsDocument,
      variables: {
        tvShowTMDBId,
        seasonNumber: season.seasonNumber,
      },
    },
  ];

  const [setTVEpisodeMonitored] = useSetTvEpisodeMonitoredMutation({
    refetchQueries: refetchSeasonDetails,
    awaitRefetchQueries: true,
  });

  const [setTVSeasonMonitored] = useSetTvSeasonMonitoredMutation({
    refetchQueries: refetchSeasonDetails,
    awaitRefetchQueries: true,
  });

  const seasonId = data?.episodes?.[0]?.seasonId;
  const missingEpisodes = data?.episodes?.filter((episode) =>
    [
      DownloadableMediaState.Missing,
      DownloadableMediaState.Searching,
      DownloadableMediaState.Downloading,
    ].includes(episode.state)
  );
  const hasMonitoredMissingEpisodes = missingEpisodes?.some(
    (episode) => episode.monitored
  );
  const hasUnmonitoredMissingEpisodes = missingEpisodes?.some(
    (episode) => !episode.monitored
  );

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const columns: ColumnsType<EnrichedTvEpisode> = [
    {
      title: 'Title',
      render: (row: EnrichedTvEpisode) => `Episode ${row.episodeNumber}`,
      width: 100,
    },
    {
      title: 'Air date',
      render: (row: EnrichedTvEpisode) => availableIn(dayjs(row.releaseDate)),
    },
    {
      title: 'Status',
      align: 'right',
      render: (row: EnrichedTvEpisode) => {
        let color: string | undefined = undefined;
        let label = 'Missing';

        if (!row.monitored && row.state === DownloadableMediaState.Missing) {
          color = 'default';
          label = 'Unmonitored';
        }

        if (
          row.state === DownloadableMediaState.Processed ||
          row.state === DownloadableMediaState.Downloaded
        ) {
          color = 'geekblue';
          label = 'Downloaded';
        }

        if (
          row.state === DownloadableMediaState.Searching ||
          row.state === DownloadableMediaState.Downloading
        ) {
          color = 'blue';
          label = row.monitored ? 'Downloading' : 'Unmonitored';
        }

        return (
          <Tag color={color} style={{ width: 110, textAlign: 'center' }}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      align: 'right',
      width: 100,
      render: (row: EnrichedTvEpisode) => {
        const inLibrary = row.state !== DownloadableMediaState.Missing;
        const canToggleMonitoring = [
          DownloadableMediaState.Missing,
          DownloadableMediaState.Searching,
          DownloadableMediaState.Downloading,
        ].includes(row.state);

        return (
          <>
            {canToggleMonitoring && (
              <Tag
                onClick={() =>
                  setTVEpisodeMonitored({
                    variables: {
                      episodeId: row.id,
                      monitored: !row.monitored,
                    },
                  })
                }
                style={{ width: 120, textAlign: 'center', cursor: 'pointer' }}
              >
                {row.monitored ? 'Stop searching' : 'Monitor'}
              </Tag>
            )}
            <Tag
              icon={<SearchOutlined />}
              onClick={() => setManualSearch(row)}
              style={{ width: 120, textAlign: 'center', cursor: 'pointer' }}
            >
              {inLibrary ? 'Replace' : 'Search'} episode
            </Tag>
          </>
        );
      },
    },
  ];

  return (
    <>
      {manualSearch && (
        <ManualSearchComponent
          media={manualSearch}
          onRequestClose={() => setManualSearch(null)}
          refetchQueries={[
            {
              query: GetTvSeasonDetailsDocument,
              variables: {
                tvShowTMDBId,
                seasonNumber: season.seasonNumber,
              },
            },
          ]}
        />
      )}

      <div
        className="season"
        style={{ marginBottom: isOpen && season.seasonNumber !== 1 ? 12 : 0 }}
      >
        <div className="season-top">
          <div className="season-title" onClick={toggle}>
            <div className="season-toggle">
              {isOpen ? <FaChevronCircleDown /> : <FaChevronCircleRight />}
            </div>
            <div className="season-number">Season {season.seasonNumber}</div>
            {season.airDate && (
              <div className="season-year">
                {' '}
                ({dayjs(season.airDate).format('YYYY')})
              </div>
            )}
          </div>
          <div className="season-actions">
            {seasonId &&
              (hasMonitoredMissingEpisodes ||
                hasUnmonitoredMissingEpisodes) && (
                <div
                  className="season-replace"
                  onClick={() =>
                    setTVSeasonMonitored({
                      variables: {
                        seasonId,
                        monitored: !hasMonitoredMissingEpisodes,
                      },
                    })
                  }
                >
                  {hasMonitoredMissingEpisodes
                    ? 'Stop searching season'
                    : 'Monitor season'}
                </div>
              )}
            <div
              className="season-replace"
              onClick={() =>
                setManualSearch({ ...season, tvShowTitle, tvShowTMDBId })
              }
            >
              {season.inLibrary ? 'Replace' : 'Search'} season
              <SearchOutlined style={{ marginLeft: 8 }} />
            </div>
          </div>
        </div>
        {isOpen && (
          <Table<EnrichedTvEpisode>
            rowKey="id"
            size="small"
            dataSource={data?.episodes || []}
            columns={columns}
            showHeader={false}
            pagination={false}
            loading={!data && loading}
          />
        )}
      </div>
    </>
  );
}
