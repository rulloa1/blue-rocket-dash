import { Plus, FileText, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickActions() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 font-medium text-foreground">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
        <Button variant="secondary" className="gap-2">
          <FileText className="h-4 w-4" />
          Create Proposal
        </Button>
        <Button variant="outline" className="gap-2">
          <Play className="h-4 w-4" />
          New Sequence
        </Button>
      </div>
    </div>
  );
}
