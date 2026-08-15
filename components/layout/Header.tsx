'use client';

import { Bell } from 'lucide-react';
import { instructorInfo } from '@/lib/mock-data';

export function Header() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const firstName = instructorInfo.name.split(' ')[0];

  const initials = instructorInfo.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Right: greeting + date */}
      <div>
        <p className="text-sm font-semibold text-slate-800">سلام، {firstName} جان 👋</p>
        <p className="text-xs text-slate-400">{dateStr}</p>
      </div>

      {/* Left: actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-4.5 w-4.5 h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white select-none">
          {initials}
        </div>
      </div>
    </header>
  );
}
