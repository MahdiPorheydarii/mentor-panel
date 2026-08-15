interface ProgressBarProps {
  progress: number;
  phase: string;
}

export function ProgressBar({ progress, phase }: ProgressBarProps) {
  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500 truncate max-w-[90px]" title={phase}>
          {phase}
        </span>
        <span className="text-xs font-medium text-slate-700 mr-2">{progress}٪</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
