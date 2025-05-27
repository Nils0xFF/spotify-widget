'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  return (
    <div>
      {!session ? (
        <button onClick={() => signIn('google')}>Sign in with Google</button>
      ) : (
        <>
          <h1>Welcome, {session.user?.name}!</h1>
          <button onClick={() => signOut()}>Logout</button>
        </>
      )}
    </div>
  );
}
