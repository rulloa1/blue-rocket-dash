import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  const getDescription = (s: number) => {
    if (s >= 8) return 'High potential lead';
    if (s >= 5) return 'Medium potential lead';
    return 'Low potential lead';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <span
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
              getColor(score)
            )}
          >
            {score}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{getDescription(score)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
