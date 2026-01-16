import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeadsEmptyStateProps {
  onAddLead: () => void;
}

export function LeadsEmptyState({ onAddLead }: LeadsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">No leads yet</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
        Get started by adding your first lead. You can import leads or add them manually.
      </p>
      <Button onClick={onAddLead} className="gap-2">
        <Plus className="h-4 w-4" />
        Add your first lead
      </Button>
    </div>
  );
}
