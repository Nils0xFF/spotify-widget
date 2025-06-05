'use client';
import { CurrentPlayingResponse } from '@/lib/spotify/types/song';
import { isNil } from 'lodash';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Widget from './components/widget';
import { WidgetApiError } from './types';

/**
 * This component is responsible for fetching the currently playing song
 * and passing it to the Widget component
 */
export default function WidgetPage() {
  const id = useParams<{ id: string }>().id.toString();

  const [currentlyPlaying, setCurrentlyPlaying] =
    useState<CurrentPlayingResponse>();

  const [widgetApiError, setWidgetApiError] = useState<WidgetApiError>();

  const endTimeout = useRef<NodeJS.Timeout | null>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchNowPlaying(force: boolean = false) {
      const res = await fetch('/api/now-playing', {
        method: 'POST',
        body: JSON.stringify({ widgetId: id, force }),
      });

      if (!res.ok) {
        if (endTimeout.current) clearTimeout(endTimeout.current);
        setCurrentlyPlaying(undefined);

        switch (res.status) {
          case 401:
            setWidgetApiError('SESSION_EXPIRED');
            if (interval.current) clearInterval(interval.current);
            break;
          case 404:
            setWidgetApiError('INVALID_WIDGET_ID');
            if (interval.current) clearInterval(interval.current);
            break;
        }
        return;
      }

      setWidgetApiError(undefined);

      const data = (await res.json()) as CurrentPlayingResponse | undefined;

      setCurrentlyPlaying(data);

      if (endTimeout.current) clearTimeout(endTimeout.current);

      if (
        !isNil(data) &&
        data?.is_playing &&
        !isNil(data?.progress_ms) &&
        !isNil(data?.item?.duration_ms)
      ) {
        const remainingMs = data.item.duration_ms - data.progress_ms;
        if (remainingMs > 0 && remainingMs < 10 * 60 * 1000) {
          endTimeout.current = setTimeout(() => {
            fetchNowPlaying(true);
          }, remainingMs + 500);
        }
      }
    }

    fetchNowPlaying();
    interval.current = setInterval(fetchNowPlaying, 10000);

    return () => {
      if (interval.current) clearInterval(interval.current);
      if (endTimeout.current) clearTimeout(endTimeout.current);
    };
  }, [id]);

  return Widget({ currentlyPlaying, widgetApiError });
}
