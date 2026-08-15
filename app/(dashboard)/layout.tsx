import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar username={session?.username ?? ''} name={session?.name ?? ''} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header name={session?.name ?? ''} username={session?.username ?? ''} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
