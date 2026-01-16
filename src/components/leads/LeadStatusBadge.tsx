import { cn } from '@/lib/utils';
import { LeadStatus } from '@/hooks/useLeads';

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: 'New',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  qualified: {
    label: 'Qualified',
    className: 'bg-success/10 text-success border-success/20',
  },
  not_interested: {
    label: 'Not Interested',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
