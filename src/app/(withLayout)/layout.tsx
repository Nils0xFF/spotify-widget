import { auth } from '@/auth';
import Footer from '@/components/footer';
import Menu from '@/components/menu';
import { redirect } from 'next/navigation';
import './styles.css';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session || session?.error) {
    redirect('/login');
  }

  return (
    <div>
      <Menu />
      {children}
      <Footer />
    </div>
  );
}
