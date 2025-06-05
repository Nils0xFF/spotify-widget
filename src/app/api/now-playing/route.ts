import { getAndRefreshUserToken, getWidgetById } from '@/lib/db';
import { getNowPlaying } from '@/lib/spotify';
import { redis } from '@/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { widgetId, force } = (await req.json()) as {
    widgetId: string;
    force?: boolean;
  };

  if (!widgetId || typeof widgetId !== 'string') {
    return NextResponse.json({ error: 'Invalid widget ID' }, { status: 400 });
  }

  if (!force) {
    const cacheEntry = await redis.get('nowPlaying:' + widgetId);
    if (cacheEntry) return NextResponse.json(JSON.parse(cacheEntry));
  }

  const widget = await getWidgetById(widgetId);

  if (!widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  const user = widget?.userId;

  const userToken = await getAndRefreshUserToken(user);

  if (!userToken)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const nowPlaying = await getNowPlaying(userToken);

  redis.set('nowPlaying:' + widgetId, JSON.stringify(nowPlaying), {
    expiration: { type: 'PX', value: 9500 },
  });

  return NextResponse.json(nowPlaying);
}
