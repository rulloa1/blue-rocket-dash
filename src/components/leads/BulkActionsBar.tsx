import { useState } from 'react';
import { Download, RefreshCw, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteLeads, useUpdateLeadsStatus, LeadStatus } from '@/hooks/useLeads';
import { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];

interface BulkActionsBarProps {
  selectedIds: string[];
  leads: Lead[];
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedIds, leads, onClearSelection }: BulkActionsBarProps) {
  const deleteLeads = useDeleteLeads();
  const updateStatus = useUpdateLeadsStatus();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportCSV = () => {
    const selectedLeads = leads.filter((l) => selectedIds.includes(l.id));
    const headers = ['Business Name', 'Industry', 'Phone', 'Email', 'Website', 'Status', 'AI Score', 'Date Added'];
    const rows = selectedLeads.map((l) => [
      l.business_name,
      l.industry || '',
      l.phone || '',
      l.email || '',
      l.website || '',
      l.status,
      l.ai_score?.toString() || '',
      new Date(l.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = async (status: LeadStatus) => {
    await updateStatus.mutateAsync({ ids: selectedIds, status });
    onClearSelection();
  };

  const handleDelete = async () => {
    await deleteLeads.mutateAsync(selectedIds);
    setShowDeleteConfirm(false);
    onClearSelection();
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 animate-fade-in">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.length} selected
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 gap-1">
            <X className="h-3 w-3" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8 gap-2">
            <Download className="h-3 w-3" />
            Export CSV
          </Button>

          <Select onValueChange={(v) => handleStatusChange(v as LeadStatus)}>
            <SelectTrigger className="h-8 w-40 bg-muted/50 border-border">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3" />
                <SelectValue placeholder="Change Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="not_interested">Not Interested</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-8 gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Leads</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} leads? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLeads.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLeads.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
