'use client';

interface HeaderProps {
  name: string;
  username: string;
}

export function Header({ name }: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const firstName = name ? name.split(' ')[0] : 'مربی';

  const initials = name
    ? name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('')
    : '?';

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-semibold text-slate-800">سلام، {firstName} جان 👋</p>
        <p className="text-xs text-slate-400">{dateStr}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white select-none">
          {initials}
        </div>
      </div>
    </header>
  );
}
