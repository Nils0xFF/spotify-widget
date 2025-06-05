import { prisma } from '@/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Spotify from 'next-auth/providers/spotify';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Spotify({
      authorization: {
        url: 'https://accounts.spotify.com/authorize',
        params: {
          scope: 'user-read-email user-read-currently-playing',
        },
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
    async session({ session, user }) {
      const [spotifyAccount] = await prisma.account.findMany({
        where: { userId: user.id, provider: 'spotify' },
      });

      if (
        !spotifyAccount ||
        !spotifyAccount.expires_at ||
        !spotifyAccount.refresh_token
      ) {
        return {
          ...session,
          error: 'NoTokenFound',
        };
      }
      if (spotifyAccount.expires_at * 1000 < Date.now()) {
        // If the access token has expired, try to refresh it
        try {
          const response = await fetch(
            'https://accounts.spotify.com/api/token',
            {
              method: 'POST',
              body: new URLSearchParams({
                client_id: process.env.AUTH_SPOTIFY_ID!,
                client_secret: process.env.AUTH_SPOTIFY_SECRET!,
                grant_type: 'refresh_token',
                refresh_token: spotifyAccount.refresh_token,
              }),
            }
          );

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
              userId: user.id,
              provider_providerAccountId: {
                provider: 'spotify',
                providerAccountId: spotifyAccount.providerAccountId,
              },
            },
          });
        } catch (error) {
          console.error('Error refreshing access_token', error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          session.error = 'RefreshTokenError';
        }
      }
      return session;
    },
  },
});

declare module 'next-auth' {
  interface Session {
    error?: 'RefreshTokenError' | 'NoTokenFound';
  }
}
