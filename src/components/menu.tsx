import SignOut from './signOutButton';

export default async function Menu() {
  return (
    <nav className="bg-blue-500 w-full flex flex-row items-center justify-center gap-4 py-4">
      <h1 className="justify-self-start">Secret</h1>
      <SignOut></SignOut>
    </nav>
  );
}
