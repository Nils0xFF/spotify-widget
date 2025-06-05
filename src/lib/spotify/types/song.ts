export type CurrentPlayingResponse = {
  timestamp: number;
  progress_ms?: number;
  is_playing: boolean;
  item?: {
    name: string;
    duration_ms: number;
    album: {
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
    };
    artists: Array<{
      name: string;
    }>;
  };
};
