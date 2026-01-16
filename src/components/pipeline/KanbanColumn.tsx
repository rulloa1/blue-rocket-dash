import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { DealCard } from './DealCard';
import type { Deal, DealStage } from '@/hooks/useDeals';
import { STAGE_LABELS } from '@/hooks/useDeals';

interface KanbanColumnProps {
  stage: DealStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

export function KanbanColumn({ stage, deals, onDealClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">{STAGE_LABELS[stage]}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {deals.length}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{formatCurrency(totalValue)}</span>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-lg border border-border/50 bg-card/30 p-2 min-h-[200px] transition-colors',
          isOver && 'border-primary/50 bg-primary/5'
        )}
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onClick={() => onDealClick(deal)} />
            ))}
          </div>
        </SortableContext>

        {deals.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            No deals
          </div>
        )}
      </div>
    </div>
  );
}
