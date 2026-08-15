'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserX,
  UserMinus,
  Phone,
  CalendarCheck,
  ClipboardList,
  BarChart3,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/app/(dashboard)/actions';

const navItems = [
  { label: 'کلاس‌های من', href: '/', icon: LayoutDashboard },
  { label: 'دانشجویان منصرف', href: '/withdrawn', icon: UserX },
  { label: 'دانشجویان معلق', href: '/suspended', icon: UserMinus },
  { label: 'گزارش تماس‌ها', href: '/reports/calls', icon: Phone },
  { label: 'حضور و غیاب', href: '/reports/attendance', icon: CalendarCheck },
  { label: 'وضعیت کارنامه', href: '/reports/cards', icon: ClipboardList },
  { label: 'وضعیت کلاس‌ها', href: '/reports/classes', icon: BarChart3 },
];

interface SidebarProps {
  username: string;
  name: string;
}

export function Sidebar({ username, name }: SidebarProps) {
  const pathname = usePathname();

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('');

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">پنل مربی</p>
          <p className="text-xs text-slate-400">یاسان</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Teacher profile + logout */}
      <div className="border-t border-slate-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-slate-200">
            {initials || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">{name || 'مربی'}</p>
            <p className="truncate text-xs text-slate-500" dir="ltr">{username}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="خروج"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
