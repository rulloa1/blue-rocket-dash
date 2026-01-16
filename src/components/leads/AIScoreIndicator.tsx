import { cn } from '@/lib/utils';

interface AIScoreIndicatorProps {
  score: number | null;
}

export function AIScoreIndicator({ score }: AIScoreIndicatorProps) {
  if (score === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  const getColor = (s: number) => {
    if (s >= 8) return 'text-success bg-success/10';
    if (s >= 5) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
          getColor(score)
        )}
      >
        {score}
      </span>
    </div>
  );
}
