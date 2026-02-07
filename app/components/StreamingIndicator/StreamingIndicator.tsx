"use client";

type StreamingIndicatorProps = {
  compact?: boolean;
};

export const StreamingIndicator = ({ compact = false }: StreamingIndicatorProps) => {
  return (
    <div className={`flex items-center gap-1 ${compact ? "" : ""}`} aria-label="Streaming">
      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
    </div>
  );
};
