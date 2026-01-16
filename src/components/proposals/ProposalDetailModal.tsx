import { useState } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  Mail,
  Calendar,
  Send,
  Copy,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useProposal,
  useSendProposal,
  type Proposal,
  type ProposalStatus,
} from '@/hooks/useProposals';
import { toast } from 'sonner';

interface ProposalDetailModalProps {
  proposal: Proposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProposalDetailModal({ proposal, open, onOpenChange }: ProposalDetailModalProps) {
  const { data: fullProposal, isLoading } = useProposal(proposal?.id || null);
  const sendProposal = useSendProposal();

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

  const handleCopyLink = () => {
    if (!proposal) return;
    const link = `${window.location.origin}/proposal/${proposal.public_id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  const handleDownloadPDF = () => {
    toast.info('PDF download coming soon');
  };

  const displayProposal = fullProposal || proposal;
  const lineItems = fullProposal?.proposal_line_items || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-xl">
              Proposal for {displayProposal?.client_name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {displayProposal && (
                <Badge className={statusColors[displayProposal.status]}>
                  {displayProposal.status}
                </Badge>
              )}
              {displayProposal?.created_at && (
                <span className="text-sm text-muted-foreground">
                  Created {format(new Date(displayProposal.created_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {displayProposal?.status === 'draft' && (
                <Button
                  size="sm"
                  onClick={() => proposal && sendProposal.mutate(proposal.id)}
                  disabled={sendProposal.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Proposal
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/proposal/${displayProposal?.public_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public
                </a>
              </Button>
            </div>

            {/* Client Info */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Client Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{displayProposal?.client_name}</span>
                </div>
                {displayProposal?.client_business && (
                  <p className="text-sm text-muted-foreground pl-6">
                    {displayProposal.client_business}
                  </p>
                )}
                {displayProposal?.client_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{displayProposal.client_email}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Services Table */}
            <div>
              <h4 className="font-medium mb-4">Services</h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Description</th>
                      <th className="text-center p-3 text-sm font-medium w-20">Qty</th>
                      <th className="text-right p-3 text-sm font-medium w-28">Price</th>
                      <th className="text-right p-3 text-sm font-medium w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">{formatCurrency(Number(item.unit_price))}</td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(Number(item.total))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30">
                    <tr className="border-t border-border">
                      <td colSpan={3} className="p-3 text-right text-sm">Subtotal</td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(Number(displayProposal?.subtotal || 0))}
                      </td>
                    </tr>
                    {Number(displayProposal?.discount_value || 0) > 0 && (
                      <tr>
                        <td colSpan={3} className="p-3 text-right text-sm">
                          Discount
                          {displayProposal?.discount_type === 'percentage' &&
                            ` (${displayProposal.discount_value}%)`}
                        </td>
                        <td className="p-3 text-right font-medium text-destructive">
                          -{formatCurrency(
                            displayProposal?.discount_type === 'percentage'
                              ? Number(displayProposal.subtotal) * (Number(displayProposal.discount_value) / 100)
                              : Number(displayProposal?.discount_value || 0)
                          )}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-border">
                      <td colSpan={3} className="p-3 text-right font-semibold">Total</td>
                      <td className="p-3 text-right text-lg font-bold text-primary">
                        {formatCurrency(Number(displayProposal?.total || 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Delivery Date */}
            {displayProposal?.delivery_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Estimated Delivery:</span>
                <span className="font-medium">
                  {format(new Date(displayProposal.delivery_date), 'MMMM d, yyyy')}
                </span>
              </div>
            )}

            {/* Terms */}
            {displayProposal?.terms && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {displayProposal.terms}
                  </p>
                </div>
              </>
            )}

            {/* Tracking Info */}
            {(displayProposal?.sent_at || displayProposal?.viewed_at || displayProposal?.signed_at) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Activity</h4>
                  <div className="space-y-2 text-sm">
                    {displayProposal.sent_at && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>
                          Sent on {format(new Date(displayProposal.sent_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                    {displayProposal.viewed_at && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-warning" />
                        <span>
                          Viewed on {format(new Date(displayProposal.viewed_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                    {displayProposal.signed_at && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span>
                          Signed on {format(new Date(displayProposal.signed_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
