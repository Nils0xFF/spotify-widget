import { CurrentPlayingResponse } from '@/lib/spotify/types/song';
import { WidgetApiError } from '../types';

export default function Widget({
  currentlyPlaying,
  widgetApiError,
}: {
  currentlyPlaying: CurrentPlayingResponse | undefined;
  widgetApiError: WidgetApiError | undefined;
}) {
  let statusMessage = undefined;
  switch (widgetApiError) {
    case 'INVALID_WIDGET_ID':
      statusMessage = <div>Widget not found</div>;
      break;
    case 'SESSION_EXPIRED':
      statusMessage = <div>Session expired</div>;
      break;
    case undefined:
      statusMessage = <div>Nothing playing right now</div>;
      break;
  }

  return (
    <div className="flex flex-col rounded-2xl w-full p-8 bg-amber-400">
      {statusMessage ? (
        statusMessage
      ) : (
        <div className="flex flex-col">
          <div className="flex flex-row justify-between">
            <div className="text-xl font-bold">
              {currentlyPlaying?.item?.name}
            </div>
            <div className="text-xl font-bold">
              {currentlyPlaying?.item?.artists[0].name}
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <div className="text-xl font-bold">
              {new Date(currentlyPlaying?.timestamp || 0).toDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
