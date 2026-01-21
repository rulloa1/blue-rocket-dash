import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { AddDealModal } from '@/components/pipeline/AddDealModal';
import { DealDetailModal } from '@/components/pipeline/DealDetailModal';
import { STAGE_LABELS, type Deal } from '@/hooks/useDeals';

export default function Pipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  const stageFilter = searchParams.get('stage');

  const clearFilter = () => {
    searchParams.delete('stage');
    setSearchParams(searchParams);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize and manage your sales pipeline.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>

        {stageFilter && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <Badge variant="secondary" className="gap-1">
              {STAGE_LABELS[stageFilter as keyof typeof STAGE_LABELS] || stageFilter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={clearFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-x-auto">
          <KanbanBoard onDealClick={setSelectedDeal} />
        </div>

        <AddDealModal 
          open={showAddModal} 
          onOpenChange={setShowAddModal} 
        />
        
        <DealDetailModal 
          deal={selectedDeal} 
          open={!!selectedDeal} 
          onOpenChange={(open) => !open && setSelectedDeal(null)} 
        />
      </div>
    </DashboardLayout>
  );
}
