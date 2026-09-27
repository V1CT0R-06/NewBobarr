import React from 'react';
import { Calendar, Tag, Skeleton, Alert } from 'antd';

import { useGetCalendarQuery } from '../../utils/graphql';
import { formatNumber } from '../../utils/format-number';

import { CalendarStyles } from './calendar.styles';

export function CalendarComponent() {
  const { data, loading, error } = useGetCalendarQuery();

  return (
    <CalendarStyles>
      <div className="wrapper">
        {error && (
          <Alert
            type="error"
            message="Some calendar information could not be loaded."
            description="Please retry in a moment. Detailed error information is available in the Bobarr API logs."
            showIcon={true}
          />
        )}
        {loading && (
          <Alert
            type="info"
            message="Loading calendar"
            description="Don't worry, it might take some time on first load."
            showIcon={true}
          />
        )}
        <Skeleton active={true} loading={loading}>
          <Calendar
            dateCellRender={(date) => {
              const formattedDate = date.format('YYYY-MM-DD');

              const movies =
                data?.calendar?.movies?.filter(
                  (movie) => formattedDate === movie.releaseDate
                ) || [];

              const tvEpisodes =
                data?.calendar?.tvEpisodes.filter(
                  (tvEpisode) =>
                    tvEpisode.releaseDate &&
                    formattedDate === tvEpisode.releaseDate
                ) || [];

              return (
                <div className="calendar-events">
                  {[...movies, ...tvEpisodes].map((media) => (
                    <Tag
                      key={(media.__typename || '') + media.id}
                      className="calendar-event"
                    >
                      {media.__typename === 'EnrichedMovie' && media.title}
                      {media.__typename === 'EnrichedTVEpisode' &&
                        `${media.tvShow.title} - S${formatNumber(
                          media.seasonNumber
                        )}E${formatNumber(media.episodeNumber)}`}
                    </Tag>
                  ))}
                </div>
              );
            }}
          />
        </Skeleton>
      </div>
    </CalendarStyles>
  );
}
