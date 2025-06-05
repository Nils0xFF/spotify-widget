import { signOut } from '@/auth';

export default async function SignOut() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();
      }}>
      <button type="submit">Logout</button>
    </form>
  );
}
