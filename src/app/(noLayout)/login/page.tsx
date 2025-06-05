import SignInButton from '@/components/signInButton';

export default async function Login() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background">
      <SignInButton />
    </div>
  );
}
