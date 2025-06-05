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
    /* async session({ session, user }) {
      try {
        const token = await getAndRefreshUserToken(session.userId);
        return session;
      } catch (error) {
        return {
          ...session,
          error: error,
        };
      }
    }, */
  },
});

declare module 'next-auth' {
  interface Session {
    error?: 'RefreshTokenError' | 'NoTokenFound';
  }
}
