import React from 'react';
import dayjs from 'dayjs';
import prettySize from 'prettysize';
import { pick } from 'lodash';
import { PureQueryOptions } from '@apollo/client';

import { Table, Popover, Tag, notification } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';

import {
  JackettFormattedResult,
  useDownloadMovieMutation,
  GetLibraryMoviesDocument,
  GetDownloadingDocument,
  GetMissingDocument,
  useDownloadTvEpisodeMutation,
  GetLibraryTvShowsDocument,
  useDownloadSeasonMutation,
} from '../../utils/graphql';

import { Media } from './manual-search.helpers';

interface JackettResultTableProps {
  refetchQueries?: PureQueryOptions[];
  results: JackettFormattedResult[];
  media: Media;
  onDownloadStarted?: () => void;
}

export function JackettResultsTable({
  media,
  onDownloadStarted,
  refetchQueries,
  results,
}: JackettResultTableProps) {
  const columns: ColumnsType<JackettFormattedResult> = [
    {
      title: 'Age',
      width: 75,
      sorter: (a, b) =>
        Number(dayjs(a.publishDate).toDate()) -
        Number(dayjs(b.publishDate).toDate()),
      render: (row: JackettFormattedResult) => {
        const diff = Math.abs(dayjs(row.publishDate).diff(new Date(), 'day'));
        return `${diff} days`;
      },
    },
    {
      title: 'Name',
      ellipsis: {
        showTitle: false,
      },
      render: (row: JackettFormattedResult) => (
        <Popover content={row.title}>{row.title}</Popover>
      ),
    },
    {
      title: 'Size',
      width: 80,
      sorter: (a, b) => a.size - b.size,
      render: (row: JackettFormattedResult) => prettySize(row.size),
    },
    {
      title: 'Peers',
      width: 100,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.seeders - b.seeders,
      render: (row: JackettFormattedResult) => (
        <Popover content={`${row.seeders} seeders, ${row.peers} leechers`}>
          <Tag color={row.seeders > row.peers ? 'green' : 'orange'}>
            {row.seeders} / {row.peers}
          </Tag>
        </Popover>
      ),
    },
    {
      title: 'Quality',
      width: 80,
      sorter: (a, b) => a.qualityScore - b.qualityScore,
      render: (row: JackettFormattedResult) => <Tag>{row.quality}</Tag>,
    },
    {
      title: <DownloadOutlined />,
      width: 35,
      render: (row: JackettFormattedResult) => (
        <ManualDownloadMedia
          jackettResult={row}
          media={media}
          onDownloadStarted={onDownloadStarted}
          refetchQueries={refetchQueries || []}
        />
      ),
    },
  ];

  return (
    <Table<JackettFormattedResult>
      rowKey="id"
      size="small"
      dataSource={results}
      columns={columns}
    />
  );
}

function ManualDownloadMedia({
  media,
  jackettResult,
  onDownloadStarted,
  refetchQueries,
}: {
  media: Media;
  jackettResult: JackettFormattedResult;
  onDownloadStarted?: () => void;
  refetchQueries: PureQueryOptions[];
}) {
  const [activeDownloadId, setActiveDownloadId] = React.useState<string | null>(
    null
  );
  const isDownloadInFlight = React.useRef(false);

  const jackettInput = pick(jackettResult, [
    'title',
    'downloadLink',
    'quality',
    'tag',
  ]);

  const [downloadMovie, { loading: loading1 }] = useDownloadMovieMutation({
    refetchQueries: [
      { query: GetLibraryMoviesDocument },
      { query: GetDownloadingDocument },
      { query: GetMissingDocument },
      ...refetchQueries,
    ],
    onError: ({ message }) => {
      isDownloadInFlight.current = false;
      setActiveDownloadId(null);
      notification.error({
        message: message.replace('GraphQL error: ', ''),
        placement: 'bottomRight',
      });
    },
    onCompleted: () => {
      onDownloadStarted?.();
      notification.success({
        message: 'Download started',
        placement: 'bottomRight',
      });
    },
  });

  const [
    downloadTVEpisode,
    { loading: loading2 },
  ] = useDownloadTvEpisodeMutation({
    refetchQueries: [
      { query: GetLibraryTvShowsDocument },
      { query: GetDownloadingDocument },
      { query: GetMissingDocument },
      ...refetchQueries,
    ],
    onError: ({ message }) => {
      isDownloadInFlight.current = false;
      setActiveDownloadId(null);
      notification.error({
        message: message.replace('GraphQL error: ', ''),
        placement: 'bottomRight',
      });
    },
    onCompleted: () => {
      onDownloadStarted?.();
      notification.success({
        message: 'Download started',
        placement: 'bottomRight',
      });
    },
  });

  const [downloadTVSeason, { loading: loading3 }] = useDownloadSeasonMutation({
    refetchQueries: [
      { query: GetLibraryTvShowsDocument },
      { query: GetDownloadingDocument },
      { query: GetMissingDocument },
      ...refetchQueries,
    ],
    onError: ({ message }) => {
      isDownloadInFlight.current = false;
      setActiveDownloadId(null);
      notification.error({
        message: message.replace('GraphQL error: ', ''),
        placement: 'bottomRight',
      });
    },
    onCompleted: () => {
      onDownloadStarted?.();
      notification.success({
        message: 'Download started',
        placement: 'bottomRight',
      });
    },
  });

  const isDownloading =
    Boolean(activeDownloadId) || loading1 || loading2 || loading3;

  const handleClick = () => {
    if (isDownloadInFlight.current || isDownloading) {
      return;
    }

    isDownloadInFlight.current = true;
    setActiveDownloadId(jackettResult.id);

    if (media.__typename === 'EnrichedMovie') {
      downloadMovie({
        variables: {
          movieId: media.id!,
          jackettResult: jackettInput,
        },
      });
      return;
    }

    if (media.__typename === 'EnrichedTVEpisode') {
      downloadTVEpisode({
        variables: {
          episodeId: media.id!,
          jackettResult: jackettInput,
        },
      });
      return;
    }

    if (media.__typename === 'TMDBFormattedTVSeason') {
      downloadTVSeason({
        variables: {
          tvShowTMDBId: media.tvShowTMDBId!,
          seasonNumber: media.seasonNumber!,
          jackettResult: jackettInput,
        },
      });
      return;
    }

    isDownloadInFlight.current = false;
    setActiveDownloadId(null);
  };

  return isDownloading ? (
    <button
      type="button"
      className="torrent-download-button"
      aria-label="Starting download"
      disabled={true}
    >
      <LoadingOutlined />
    </button>
  ) : (
    <Popover content={jackettResult.link}>
      <button
        type="button"
        className="torrent-download-button"
        aria-label={`Download ${jackettResult.title}`}
        onClick={handleClick}
      >
        <DownloadOutlined />
      </button>
    </Popover>
  );
}
