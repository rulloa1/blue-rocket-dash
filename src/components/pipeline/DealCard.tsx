import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { differenceInDays } from 'date-fns';
import { Building2, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { Deal } from '@/hooks/useDeals';

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const daysInStage = differenceInDays(new Date(), new Date(deal.stage_entered_at));

  const getDaysColor = (days: number) => {
    if (days < 7) return 'text-success';
    if (days <= 14) return 'text-warning';
    return 'text-destructive';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const industry = deal.leads?.industry;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all hover:border-primary/50 hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg rotate-2 scale-105'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header with avatar/icon and title */}
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground truncate">{deal.title}</h4>
            {industry && (
              <p className="text-xs text-muted-foreground truncate">{industry}</p>
            )}
          </div>
        </div>

        {/* Value */}
        <div className="text-lg font-semibold text-foreground">
          {formatCurrency(Number(deal.value))}
        </div>

        {/* Footer with days and next action */}
        <div className="flex items-center justify-between text-xs">
          <div className={cn('flex items-center gap-1', getDaysColor(daysInStage))}>
            <Clock className="h-3 w-3" />
            <span>{daysInStage}d in stage</span>
          </div>

          {deal.next_action_date && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(deal.next_action_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Next action preview */}
        {deal.next_action && (
          <p className="text-xs text-muted-foreground line-clamp-1 pt-1 border-t border-border/50">
            {deal.next_action}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
