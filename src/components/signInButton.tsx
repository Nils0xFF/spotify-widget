import { signIn } from '@/auth';

export default function SignIn() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('spotify', { redirectTo: '/dashboard' });
      }}>
      <button type="submit">Signin with Spotify</button>
    </form>
  );
}
