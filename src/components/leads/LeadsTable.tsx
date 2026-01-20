import { useState } from 'react';
import { format } from 'date-fns';
import { ExternalLink, MoreHorizontal, Eye, Pencil, Trash2, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { LeadStatusBadge } from './LeadStatusBadge';
import { AIScoreIndicator } from './AIScoreIndicator';
import { WebsiteTemplateModal } from './WebsiteTemplateModal';
import { useDeleteLead, LeadStatus } from '@/hooks/useLeads';
import { Database } from '@/integrations/supabase/types';

type Lead = Database['public']['Tables']['leads']['Row'];

interface LeadsTableProps {
  leads: Lead[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onViewLead: (id: string) => void;
}

export function LeadsTable({
  leads,
  selectedIds,
  onSelectChange,
  onViewLead,
}: LeadsTableProps) {
  const deleteLead = useDeleteLead();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [websiteLeadId, setWebsiteLeadId] = useState<string | null>(null);

  const allSelected = leads.length > 0 && selectedIds.length === leads.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < leads.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectChange([]);
    } else {
      onSelectChange(leads.map((l) => l.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteLead.mutateAsync(deleteId);
        setDeleteId(null);
      } catch (error) {
        console.error("Failed to delete lead", error);
        toast.error("Failed to delete lead");
      }
    }
  };

  const websiteLead = leads.find((l) => l.id === websiteLeadId);

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? 'data-[state=checked]:bg-primary' : ''}
                />
              </TableHead>
              <TableHead className="text-muted-foreground">Business Name</TableHead>
              <TableHead className="text-muted-foreground">Industry</TableHead>
              <TableHead className="text-muted-foreground">Phone</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Website</TableHead>
              <TableHead className="text-muted-foreground text-center">AI Score</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date Added</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer border-border hover:bg-muted/30"
                onClick={() => onViewLead(lead.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(lead.id)}
                    onCheckedChange={() => handleSelectOne(lead.id)}
                    aria-label={`Select ${lead.business_name}`}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {lead.business_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.industry || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">{lead.phone || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{lead.email || '—'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Visit
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <AIScoreIndicator score={lead.ai_score} />
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status as LeadStatus} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                {(() => {
                    const date = new Date(lead.created_at);
                    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM d, yyyy');
                })()}
              </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem onClick={() => onViewLead(lead.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setWebsiteLeadId(lead.id)}>
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        Create Website
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(lead.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {websiteLead && (
        <WebsiteTemplateModal
          open={!!websiteLeadId}
          onOpenChange={(open) => !open && setWebsiteLeadId(null)}
          lead={{
            business_name: websiteLead.business_name,
            industry: websiteLead.industry,
            email: websiteLead.email,
            phone: websiteLead.phone,
            website: websiteLead.website,
          }}
        />
      )}
    </>
  );
}
