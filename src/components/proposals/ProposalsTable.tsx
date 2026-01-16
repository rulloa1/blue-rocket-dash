import { format } from 'date-fns';
import { MoreHorizontal, Eye, Send, Copy, Trash2, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { useState } from 'react';
import { useProposals, useDeleteProposal, useSendProposal, type Proposal, type ProposalStatus } from '@/hooks/useProposals';
import { toast } from 'sonner';

interface ProposalsTableProps {
  onViewProposal: (proposal: Proposal) => void;
}

export function ProposalsTable({ onViewProposal }: ProposalsTableProps) {
  const { data: proposals, isLoading } = useProposals();
  const deleteProposal = useDeleteProposal();
  const sendProposal = useSendProposal();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const statusColors: Record<ProposalStatus, string> = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'bg-primary/20 text-primary',
    viewed: 'bg-warning/20 text-warning',
    signed: 'bg-success/20 text-success',
    expired: 'bg-destructive/20 text-destructive',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCopyLink = (proposal: Proposal) => {
    const link = `${window.location.origin}/proposal/${proposal.public_id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProposal.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!proposals?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No proposals yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first proposal to start closing deals
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow
                key={proposal.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewProposal(proposal)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{proposal.client_name}</p>
                    {proposal.client_business && (
                      <p className="text-sm text-muted-foreground">{proposal.client_business}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {proposal.template_name || 'Custom'}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(Number(proposal.total))}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[proposal.status]}>
                    {proposal.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewProposal(proposal); }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {proposal.status === 'draft' && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); sendProposal.mutate(proposal.id); }}>
                          <Send className="mr-2 h-4 w-4" />
                          Send
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyLink(proposal); }}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); setDeleteId(proposal.id); }}
                        className="text-destructive"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this proposal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
