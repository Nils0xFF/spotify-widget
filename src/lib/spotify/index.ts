import { CurrentPlayingResponse } from './types/song';

export async function getNowPlaying(
  accessToken: string
): Promise<CurrentPlayingResponse | null> {
  const res = await fetch(
    'https://api.spotify.com/v1/me/player/currently-playing',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) return null;

  try {
    return await res.json();
  } catch {
    return null;
  }
}
