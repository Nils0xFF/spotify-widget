import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();
  return (
    <div>
      <h1>Welcome, {session?.user?.name}!</h1>
    </div>
  );
}
