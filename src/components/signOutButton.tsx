import { signOut } from 'next-auth/react';

export default async function SignOut() {
  return (
    <form
      action={() => {
        'use client';
        signOut();
      }}>
      <button type="submit">Logout</button>
    </form>
  );
}
