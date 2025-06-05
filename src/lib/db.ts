import { prisma } from '@/prisma';
import { redis } from '@/redis';
import { Account, Widget } from '@prisma/client';

export const createWidget = async (name: string, userId: string) => {
  return await prisma.widget.create({
    data: { name: name, userId: userId },
  });
};

export const getWidgets = async (userId: string) => {
  return await prisma.widget.findMany({
    where: { userId: userId },
  });
};

export const getWidgetById = async (id: string) => {
  if (!id) return null;

  const cachedWidget = await redis.get('widget:' + id);

  if (cachedWidget) return JSON.parse(cachedWidget) as Widget;

  const widget = await prisma.widget.findUnique({
    where: { id: id },
  });

  if (!widget) return null;

  await redis.setEx('widget:' + id, 60 * 60, JSON.stringify(widget));

  return widget;
};

export const getAndRefreshUserToken = async (userId: string) => {
  let spotifyAccount: Account | null = null;
  const cachedAccount = await redis.get('account:' + userId);
  if (cachedAccount) spotifyAccount = JSON.parse(cachedAccount);

  if (!spotifyAccount) {
    const [account] = await prisma.account.findMany({
      where: { userId: userId, provider: 'spotify' },
    });
    spotifyAccount = account;
  }

  if (
    !spotifyAccount ||
    !spotifyAccount.access_token ||
    !spotifyAccount.expires_at ||
    !spotifyAccount.refresh_token
  ) {
    return null;
  }

  if (spotifyAccount.expires_at * 1000 < Date.now()) {
    // If the access token has expired, try to refresh it
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: process.env.AUTH_SPOTIFY_ID!,
          client_secret: process.env.AUTH_SPOTIFY_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: spotifyAccount.refresh_token,
        }),
      });

      const tokensOrError = await response.json();

      if (!response.ok) throw tokensOrError;

      const newTokens = tokensOrError as {
        access_token: string;
        expires_in: number;
        refresh_token?: string;
      };

      await prisma.account.update({
        data: {
          access_token: newTokens.access_token,
          expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
          refresh_token:
            newTokens.refresh_token ?? spotifyAccount.refresh_token,
        },
        where: {
          userId: userId,
          provider_providerAccountId: {
            provider: 'spotify',
            providerAccountId: spotifyAccount.providerAccountId,
          },
        },
      });

      await redis.set(
        'account:' + userId,
        JSON.stringify({ ...spotifyAccount, ...newTokens }),
        {
          expiration: { type: 'EX', value: 1000 * 60 * 60 },
        }
      );

      return newTokens.access_token;
    } catch (error) {
      console.error('Error refreshing access_token', error);
      return null;
    }
  } else {
    await redis.set('account:' + userId, JSON.stringify(spotifyAccount), {
      expiration: { type: 'EX', value: 1000 * 60 * 60 },
    });
    return spotifyAccount.access_token;
  }
};
