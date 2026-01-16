import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { DealCard } from './DealCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeals, useUpdateDealStage, STAGE_ORDER, type Deal, type DealStage } from '@/hooks/useDeals';

interface KanbanBoardProps {
  onDealClick: (deal: Deal) => void;
}

export function KanbanBoard({ onDealClick }: KanbanBoardProps) {
  const { data: deals, isLoading } = useDeals();
  const updateStage = useUpdateDealStage();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dealsByStage = useMemo(() => {
    const grouped: Record<DealStage, Deal[]> = {
      lead: [],
      proposal_sent: [],
      negotiation: [],
      contract_signed: [],
      onboarding: [],
      active_client: [],
    };

    deals?.forEach((deal) => {
      if (grouped[deal.stage]) {
        grouped[deal.stage].push(deal);
      }
    });

    return grouped;
  }, [deals]);

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals?.find((d) => d.id === event.active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;

    const deal = deals?.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    // Only update if dropping on a valid stage
    if (STAGE_ORDER.includes(newStage)) {
      updateStage.mutate({ id: dealId, stage: newStage });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => (
          <div key={stage} className="w-72 shrink-0">
            <Skeleton className="h-8 mb-3" />
            <Skeleton className="h-64" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {STAGE_ORDER.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={dealsByStage[stage]}
            onDealClick={onDealClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="w-72">
            <DealCard deal={activeDeal} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
