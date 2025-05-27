export async function getNowPlaying(accessToken: string) {
  const res = await fetch(
    'https://api.spotify.com/v1/me/player/currently-playing',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return res.ok ? await res.json() : null;
}
