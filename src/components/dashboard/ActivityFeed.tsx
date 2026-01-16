import { UserPlus, Send, FileCheck, MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'lead_added' | 'email_sent' | 'proposal_created' | 'meeting_scheduled';
  description: string;
  timestamp: string;
}

const activityIcons = {
  lead_added: UserPlus,
  email_sent: Send,
  proposal_created: FileCheck,
  meeting_scheduled: MessageSquare,
};

const activityColors = {
  lead_added: 'text-primary',
  email_sent: 'text-success',
  proposal_created: 'text-warning',
  meeting_scheduled: 'text-muted-foreground',
};

const mockActivities: Activity[] = [
  { id: '1', type: 'lead_added', description: 'New lead: Acme Corp added to pipeline', timestamp: '2 min ago' },
  { id: '2', type: 'email_sent', description: 'Outreach email sent to TechStart Inc', timestamp: '15 min ago' },
  { id: '3', type: 'proposal_created', description: 'Proposal #127 created for GlobalTech', timestamp: '1 hour ago' },
  { id: '4', type: 'meeting_scheduled', description: 'Discovery call scheduled with DataFlow', timestamp: '2 hours ago' },
  { id: '5', type: 'lead_added', description: 'New lead: Innovate Labs qualified', timestamp: '3 hours ago' },
  { id: '6', type: 'email_sent', description: 'Follow-up sent to CloudScale', timestamp: '4 hours ago' },
  { id: '7', type: 'proposal_created', description: 'Proposal #126 sent to StartupXYZ', timestamp: '5 hours ago' },
  { id: '8', type: 'meeting_scheduled', description: 'Demo scheduled with Enterprise Co', timestamp: '6 hours ago' },
  { id: '9', type: 'lead_added', description: 'Lead imported from LinkedIn campaign', timestamp: '7 hours ago' },
  { id: '10', type: 'email_sent', description: 'Cold email sequence started for Q1 list', timestamp: '8 hours ago' },
];

export function ActivityFeed() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-medium text-foreground">Recent Activity</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all
        </button>
      </div>
      <div className="divide-y divide-border">
        {mockActivities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
            >
              <div className={cn('mt-0.5 rounded-md bg-muted p-1.5', activityColors[activity.type])}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{activity.description}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="h-3 w-3" />
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
